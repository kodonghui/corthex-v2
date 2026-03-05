/**
 * 비서 오케스트레이션 엔진
 *
 * 흐름: 유저 메시지 → 비서 분석 → 부서 위임 → 각 에이전트 응답 → 비서 종합 보고서
 */

import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { agents, departments, delegations, chatMessages } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { getClientForUser } from './ai'
import { notifyDelegationComplete } from './notifier'

type OrchestrateContext = {
  secretaryAgentId: string
  sessionId: string
  companyId: string
  userMessage: string
  userId: string
}

export type OrchestrateEvent =
  | { type: 'delegation-start'; targetAgentName: string; targetAgentId: string }
  | { type: 'delegation-end'; targetAgentName: string; targetAgentId: string; status: 'completed' | 'failed'; durationMs: number }
  | { type: 'token'; content: string }

type DelegationTarget = {
  departmentName: string
  agentId: string
  agentName: string
  prompt: string
}

/**
 * Step 1: 비서가 유저 메시지를 분석하여 위임할 부서 결정
 */
async function analyzeDelegation(
  client: Anthropic,
  userMessage: string,
  availableDepts: { id: string; name: string; agentId: string; agentName: string }[],
): Promise<{ delegations: { departmentName: string; prompt: string }[]; directResponse: string | null }> {
  const deptList = availableDepts.map(d => `- ${d.name} (${d.agentName})`).join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `당신은 CEO 비서입니다. 유저의 요청을 분석하여 적절한 부서에 위임해야 합니다.

사용 가능한 부서:
${deptList}

규칙:
1. 요청이 특정 부서의 업무에 해당하면 해당 부서에 위임합니다.
2. 여러 부서가 관련되면 여러 부서에 동시 위임합니다.
3. 간단한 인사/잡담이나 비서가 직접 답변할 수 있는 건 위임하지 않습니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "delegations": [
    {"departmentName": "부서명", "prompt": "해당 부서에게 전달할 구체적인 지시"}
  ],
  "directResponse": null 또는 "비서가 직접 답변할 내용"
}

위임이 필요하면 delegations 배열에 넣고 directResponse는 null로.
직접 답변할 거면 delegations는 빈 배열로, directResponse에 답변을 넣으세요.`,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content.find(b => b.type === 'text')?.text || '{}'

  try {
    // JSON 파싱 (코드블록 제거)
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    // 파싱 실패 시 직접 답변으로 처리
    return { delegations: [], directResponse: text }
  }
}

/**
 * Step 2: 각 부서 에이전트에게 위임 실행
 */
async function executeDelegation(
  client: Anthropic,
  target: DelegationTarget,
  agentSoul: string | null,
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `${agentSoul || '당신은 전문 에이전트입니다.'}

## 기본 정보
- 이름: ${target.agentName}
- 소속: ${target.departmentName}
- 항상 한국어로 답변합니다
- 간결하고 실용적으로 답변합니다

## 지시사항
CEO 비서가 전달한 업무를 처리하세요. 결과를 명확하게 보고 형식으로 작성하세요.`,
    messages: [{ role: 'user', content: target.prompt }],
  })

  return response.content.find(b => b.type === 'text')?.text || '응답을 생성할 수 없습니다.'
}

/**
 * Step 3: 비서가 모든 위임 결과를 종합하여 최종 보고서 작성 (스트리밍)
 */
async function compileReport(
  client: Anthropic,
  userMessage: string,
  results: { departmentName: string; agentName: string; response: string }[],
  onToken?: (text: string) => void,
): Promise<string> {
  const resultsText = results
    .map(r => `### ${r.departmentName} (${r.agentName})\n${r.response}`)
    .join('\n\n---\n\n')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `당신은 CEO 비서입니다. 각 부서 에이전트의 응답을 종합하여 CEO에게 보고할 최종 보고서를 작성합니다.

규칙:
- 핵심 내용을 먼저 요약합니다
- 부서별 결과를 정리합니다
- CEO가 빠르게 판단할 수 있도록 간결하게 작성합니다
- 한국어로 작성합니다`,
    messages: [{
      role: 'user',
      content: `원래 요청: "${userMessage}"

## 부서별 응답 결과

${resultsText}

위 결과를 종합하여 최종 보고서를 작성해주세요.`,
    }],
  })

  let fullText = ''
  stream.on('text', (text) => {
    fullText += text
    onToken?.(text)
  })

  await stream.finalMessage()
  return fullText || '보고서를 생성할 수 없습니다.'
}

/**
 * 메인 오케스트레이션: 비서 위임 전체 플로우
 */
export async function orchestrateSecretary(
  ctx: OrchestrateContext,
  onEvent?: (event: OrchestrateEvent) => void,
): Promise<string> {
  const client = await getClientForUser(ctx.userId, ctx.companyId)

  // 위임 깊이 제한 (최대 3단계)
  const MAX_DELEGATION_DEPTH = 3

  const existingDelegations = await db
    .select({ id: delegations.id })
    .from(delegations)
    .where(and(
      eq(delegations.sessionId, ctx.sessionId),
      eq(delegations.status, 'processing'),
    ))

  if (existingDelegations.length >= MAX_DELEGATION_DEPTH) {
    return '위임 깊이 제한에 도달했습니다. 현재 처리 중인 위임이 완료된 후 다시 시도해주세요.'
  }

  // 1. 회사 내 부서 + 부서 에이전트 조회
  const deptAgents = await db
    .select({
      deptId: departments.id,
      deptName: departments.name,
      agentId: agents.id,
      agentName: agents.name,
      agentSoul: agents.soul,
    })
    .from(agents)
    .innerJoin(departments, eq(agents.departmentId, departments.id))
    .where(
      and(
        eq(agents.companyId, ctx.companyId),
        eq(agents.isActive, true),
        eq(agents.isSecretary, false), // 비서 자신 제외
      ),
    )

  if (deptAgents.length === 0) {
    // 위임할 에이전트가 없으면 비서가 직접 응답
    const { generateAgentResponse } = await import('./ai')
    return generateAgentResponse({
      agentId: ctx.secretaryAgentId,
      sessionId: ctx.sessionId,
      companyId: ctx.companyId,
      userMessage: ctx.userMessage,
      userId: ctx.userId,
    })
  }

  // 2. 비서가 메시지 분석 → 위임 대상 결정
  const available = deptAgents.map(d => ({
    id: d.deptId,
    name: d.deptName,
    agentId: d.agentId,
    agentName: d.agentName,
  }))

  const analysis = await analyzeDelegation(client, ctx.userMessage, available)

  // 3. 직접 답변인 경우
  if (analysis.directResponse && analysis.delegations.length === 0) {
    return analysis.directResponse
  }

  // 4. 위임 실행 (병렬)
  const delegationTargets = analysis.delegations.map(del => {
    const needle = del.departmentName.trim().toLowerCase()
    const targetInfo = deptAgents.find(d => d.deptName.trim().toLowerCase() === needle)
      || deptAgents.find(d => d.deptName.trim().toLowerCase().includes(needle) || needle.includes(d.deptName.trim().toLowerCase()))
    return targetInfo ? { del, targetInfo } : null
  }).filter(Boolean) as { del: { departmentName: string; prompt: string }; targetInfo: typeof deptAgents[0] }[]

  // 중복 위임 방지 (같은 에이전트에게 2번 위임 방지)
  const seen = new Set<string>()
  const uniqueTargets = delegationTargets.filter(({ targetInfo }) => {
    if (seen.has(targetInfo.agentId)) return false
    seen.add(targetInfo.agentId)
    return true
  })

  // 위임 체인 이벤트 (3개 이상 동시 위임 시)
  if (uniqueTargets.length >= 3) {
    onEvent?.({ type: 'delegation-chain' as any, chain: uniqueTargets.map(t => t.targetInfo.agentName) })
  }

  // 병렬 위임 실행
  const delegationPromises = uniqueTargets.map(async ({ del, targetInfo }) => {
    // delegations 테이블에 기록
    const [delegation] = await db
      .insert(delegations)
      .values({
        companyId: ctx.companyId,
        sessionId: ctx.sessionId,
        secretaryAgentId: ctx.secretaryAgentId,
        targetAgentId: targetInfo.agentId,
        userMessage: ctx.userMessage,
        delegationPrompt: del.prompt,
        status: 'processing',
      })
      .returning()

    // 위임 시작 이벤트
    onEvent?.({ type: 'delegation-start', targetAgentName: targetInfo.agentName, targetAgentId: targetInfo.agentId })
    const delegationStart = Date.now()

    try {
      const response = await executeDelegation(
        client,
        {
          departmentName: targetInfo.deptName,
          agentId: targetInfo.agentId,
          agentName: targetInfo.agentName,
          prompt: del.prompt,
        },
        targetInfo.agentSoul,
      )

      await db
        .update(delegations)
        .set({ agentResponse: response, status: 'completed', completedAt: new Date() })
        .where(eq(delegations.id, delegation.id))

      onEvent?.({ type: 'delegation-end', targetAgentName: targetInfo.agentName, targetAgentId: targetInfo.agentId, status: 'completed', durationMs: Date.now() - delegationStart })
      notifyDelegationComplete(ctx.userId, ctx.companyId, targetInfo.agentName, ctx.sessionId)

      return { departmentName: targetInfo.deptName, agentName: targetInfo.agentName, response }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류'
      await db
        .update(delegations)
        .set({ agentResponse: `오류: ${errorMsg}`, status: 'failed', completedAt: new Date() })
        .where(eq(delegations.id, delegation.id))

      onEvent?.({ type: 'delegation-end', targetAgentName: targetInfo.agentName, targetAgentId: targetInfo.agentId, status: 'failed', durationMs: Date.now() - delegationStart })

      return { departmentName: targetInfo.deptName, agentName: targetInfo.agentName, response: `[오류] ${errorMsg}` }
    }
  })

  const delegationResults = await Promise.all(delegationPromises)

  // 감사 로그
  const { logActivity } = await import('./activity-logger')
  for (const result of delegationResults) {
    logActivity({
      companyId: ctx.companyId,
      type: 'system',
      phase: 'end',
      actorType: 'agent',
      actorId: ctx.secretaryAgentId,
      action: `비서 위임 완료: ${result.departmentName} (${result.agentName}) — ${result.response.startsWith('[오류]') ? '실패' : '성공'}`,
    })
  }

  // 5. 종합 보고서 생성
  if (delegationResults.length === 0) {
    return '위임할 부서를 찾을 수 없습니다. 다시 시도해주세요.'
  }

  if (delegationResults.length === 1) {
    // 단일 부서 위임이면 보고서 없이 바로 결과 전달
    const r = delegationResults[0]
    return `📋 **${r.departmentName} (${r.agentName}) 보고:**\n\n${r.response}`
  }

  // 복수 부서 → 종합 보고서 (스트리밍)
  return compileReport(client, ctx.userMessage, delegationResults, (text) => {
    onEvent?.({ type: 'token', content: text })
  })
}
