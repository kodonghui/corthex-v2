/**
 * 비서 오케스트레이션 엔진
 *
 * 흐름: 유저 메시지 → 비서 분석 → 부서 위임 → 각 에이전트 응답 → 비서 종합 보고서
 */

import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { agents, departments, delegations, agentDelegationRules } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
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
  | { type: 'delegation-chain'; chain: string[] }
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

  const text = response.content.find(b => b.type === 'text')?.text || '응답을 생성할 수 없습니다.'
  return text.slice(0, 10000)
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
  return (fullText || '보고서를 생성할 수 없습니다.').slice(0, 10000)
}

/**
 * 순환 위임 규칙 감지: 새 규칙 추가 시 DFS로 순환 경로 확인
 */
export async function detectCycleInDelegationRules(
  companyId: string,
  newSourceId: string,
  newTargetId: string,
): Promise<boolean> {
  const rules = await db
    .select({
      sourceAgentId: agentDelegationRules.sourceAgentId,
      targetAgentId: agentDelegationRules.targetAgentId,
    })
    .from(agentDelegationRules)
    .where(
      and(
        eq(agentDelegationRules.companyId, companyId),
        eq(agentDelegationRules.isActive, true),
      ),
    )

  // 인접 리스트 구성 (source → [targets])
  const graph = new Map<string, string[]>()
  for (const r of rules) {
    const targets = graph.get(r.sourceAgentId) || []
    targets.push(r.targetAgentId)
    graph.set(r.sourceAgentId, targets)
  }

  // 새 규칙 추가 (기존 배열 변형 방지)
  const existing = graph.get(newSourceId) || []
  graph.set(newSourceId, [...existing, newTargetId])

  // newTargetId에서 DFS → newSourceId 도달 가능하면 순환
  const visited = new Set<string>()
  function dfs(node: string): boolean {
    if (node === newSourceId) return true
    if (visited.has(node)) return false
    visited.add(node)
    for (const next of graph.get(node) || []) {
      if (dfs(next)) return true
    }
    return false
  }

  return dfs(newTargetId)
}

/**
 * 위임 규칙 매칭: 사용자 메시지에서 키워드 매칭하여 최적 위임 대상 결정
 */
async function matchDelegationRules(
  companyId: string,
  sourceAgentId: string,
  userMessage: string,
): Promise<{ targetAgentId: string; prompt: string }[]> {
  const rules = await db
    .select()
    .from(agentDelegationRules)
    .where(
      and(
        eq(agentDelegationRules.companyId, companyId),
        eq(agentDelegationRules.sourceAgentId, sourceAgentId),
        eq(agentDelegationRules.isActive, true),
      ),
    )
    .orderBy(desc(agentDelegationRules.priority))

  if (rules.length === 0) return []

  const msgLower = userMessage.toLowerCase()
  const matched: { targetAgentId: string; prompt: string; priority: number }[] = []

  for (const rule of rules) {
    const cond = rule.condition as { keywords?: unknown[]; departmentId?: string } | null
    if (!cond || !Array.isArray(cond.keywords) || cond.keywords.length === 0) continue

    const hit = cond.keywords.some(kw => typeof kw === 'string' && msgLower.includes(kw.toLowerCase()))
    if (hit) {
      matched.push({
        targetAgentId: rule.targetAgentId,
        prompt: userMessage,
        priority: rule.priority,
      })
    }
  }

  // priority 높은 순 (이미 정렬됨), 중복 targetAgentId 제거
  const seen = new Set<string>()
  return matched.filter(m => {
    if (seen.has(m.targetAgentId)) return false
    seen.add(m.targetAgentId)
    return true
  })
}

/**
 * 연쇄 위임 실행: 대상 에이전트가 비서이면 재귀적으로 위임
 */
async function executeChainDelegation(
  client: Anthropic,
  ctx: OrchestrateContext,
  targetAgentId: string,
  userMessage: string,
  parentDelegationId: string | null,
  depth: number,
  chain: string[],
  onEvent?: (event: OrchestrateEvent) => void,
): Promise<string> {
  // 최대 깊이 제한 (3단계)
  if (depth >= 3) {
    return '[위임 체인 최대 깊이(3단계) 초과로 직접 응답합니다]'
  }

  // 대상 에이전트 정보 조회
  const [targetAgent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      soul: agents.soul,
      isSecretary: agents.isSecretary,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(and(eq(agents.id, targetAgentId), eq(agents.companyId, ctx.companyId)))
    .limit(1)

  if (!targetAgent) return '[위임 대상 에이전트를 찾을 수 없습니다]'

  chain.push(targetAgent.name)

  // 대상이 비서이면 → 규칙 매칭 후 재귀 위임
  if (targetAgent.isSecretary) {
    const subRules = await matchDelegationRules(ctx.companyId, targetAgentId, userMessage)
    if (subRules.length > 0) {
      // delegation-chain 이벤트 발행
      onEvent?.({ type: 'delegation-chain', chain: [...chain] })

      // 위임 기록
      const [delegation] = await db
        .insert(delegations)
        .values({
          companyId: ctx.companyId,
          sessionId: ctx.sessionId,
          secretaryAgentId: targetAgentId,
          targetAgentId: subRules[0].targetAgentId,
          parentDelegationId,
          userMessage,
          delegationPrompt: userMessage,
          status: 'processing',
          depth,
        })
        .returning()

      try {
        const result = await executeChainDelegation(
          client, ctx, subRules[0].targetAgentId, userMessage,
          delegation.id, depth + 1, chain, onEvent,
        )

        await db
          .update(delegations)
          .set({ agentResponse: result, status: 'completed', completedAt: new Date() })
          .where(eq(delegations.id, delegation.id))

        return result
      } catch (err) {
        await db
          .update(delegations)
          .set({ agentResponse: `오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`, status: 'failed', completedAt: new Date() })
          .where(eq(delegations.id, delegation.id))
        throw err
      }
    }
  }

  // 직접 실행: 에이전트에게 질문
  const deptName = targetAgent.departmentId
    ? (await db.select({ name: departments.name }).from(departments).where(eq(departments.id, targetAgent.departmentId)).limit(1))[0]?.name || '알 수 없음'
    : '알 수 없음'

  // delegation-chain 이벤트 (최종 에이전트 포함)
  onEvent?.({ type: 'delegation-chain', chain: [...chain] })

  const response = await executeDelegation(
    client,
    { departmentName: deptName, agentId: targetAgent.id, agentName: targetAgent.name, prompt: userMessage },
    targetAgent.soul,
  )

  return response
}

/**
 * 메인 오케스트레이션: 비서 위임 전체 플로우
 */
export async function orchestrateSecretary(
  ctx: OrchestrateContext,
  onEvent?: (event: OrchestrateEvent) => void,
): Promise<string> {
  const client = await getClientForUser(ctx.userId, ctx.companyId)

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

  // 2. 위임 규칙 매칭 (규칙 우선, 없으면 LLM 분석 fallback)
  const ruleMatches = await matchDelegationRules(ctx.companyId, ctx.secretaryAgentId, ctx.userMessage)

  if (ruleMatches.length > 0) {
    // 규칙 대상 에이전트 정보 조회 (비서 포함 — deptAgents에는 비서가 제외됨)
    const ruleTargetAgents = await db
      .select({ id: agents.id, name: agents.name, departmentId: agents.departmentId })
      .from(agents)
      .where(and(eq(agents.companyId, ctx.companyId), eq(agents.isActive, true)))
    const ruleAgentMap = new Map(ruleTargetAgents.map(a => [a.id, a]))

    // 규칙 기반 위임 — 병렬 실행 (Promise.allSettled)
    const delegationPromises = ruleMatches.map(async (match) => {
      const targetInfo = deptAgents.find(d => d.agentId === match.targetAgentId)
      const ruleAgent = ruleAgentMap.get(match.targetAgentId)

      // delegations 테이블에 기록
      const [delegation] = await db
        .insert(delegations)
        .values({
          companyId: ctx.companyId,
          sessionId: ctx.sessionId,
          secretaryAgentId: ctx.secretaryAgentId,
          targetAgentId: match.targetAgentId,
          userMessage: ctx.userMessage,
          delegationPrompt: match.prompt,
          status: 'processing',
          depth: 0,
        })
        .returning()

      const agentName = ruleAgent?.name || targetInfo?.agentName || '알 수 없음'
      onEvent?.({ type: 'delegation-start', targetAgentName: agentName, targetAgentId: match.targetAgentId })
      const delegationStart = Date.now()

      try {
        const chain = [agentName]
        const response = await executeChainDelegation(
          client, ctx, match.targetAgentId, ctx.userMessage,
          delegation.id, 1, chain, onEvent,
        )

        await db
          .update(delegations)
          .set({ agentResponse: response, status: 'completed', completedAt: new Date() })
          .where(eq(delegations.id, delegation.id))

        onEvent?.({ type: 'delegation-end', targetAgentName: agentName, targetAgentId: match.targetAgentId, status: 'completed', durationMs: Date.now() - delegationStart })
        notifyDelegationComplete(ctx.userId, ctx.companyId, agentName, ctx.sessionId)

        return { departmentName: targetInfo?.deptName || '알 수 없음', agentName, response }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류'
        await db
          .update(delegations)
          .set({ agentResponse: `오류: ${errorMsg}`, status: 'failed', completedAt: new Date() })
          .where(eq(delegations.id, delegation.id))

        onEvent?.({ type: 'delegation-end', targetAgentName: agentName, targetAgentId: match.targetAgentId, status: 'failed', durationMs: Date.now() - delegationStart })

        return { departmentName: targetInfo?.deptName || '알 수 없음', agentName, response: `[오류] ${errorMsg}` }
      }
    })

    const settled = await Promise.allSettled(delegationPromises)
    const delegationResults = settled
      .filter((s): s is PromiseFulfilledResult<{ departmentName: string; agentName: string; response: string }> => s.status === 'fulfilled')
      .map(s => s.value)

    if (delegationResults.length === 0) {
      return '위임 실행에 실패했습니다. 다시 시도해주세요.'
    }

    if (delegationResults.length === 1) {
      const r = delegationResults[0]
      return `📋 **${r.departmentName} (${r.agentName}) 보고:**\n\n${r.response}`
    }
    return compileReport(client, ctx.userMessage, delegationResults, (text) => {
      onEvent?.({ type: 'token', content: text })
    })
  }

  // 3. 규칙 없으면 LLM 분석 fallback
  const available = deptAgents.map(d => ({
    id: d.deptId,
    name: d.deptName,
    agentId: d.agentId,
    agentName: d.agentName,
  }))

  const analysis = await analyzeDelegation(client, ctx.userMessage, available)

  // 3a. 직접 답변인 경우
  if (analysis.directResponse && analysis.delegations.length === 0) {
    return analysis.directResponse
  }

  // 4. LLM 분석 기반 위임 — 병렬 실행 (Promise.allSettled)
  const targets = analysis.delegations.map(del => {
    const needle = del.departmentName.trim().toLowerCase()
    const targetInfo = deptAgents.find(d => d.deptName.trim().toLowerCase() === needle)
      || deptAgents.find(d => d.deptName.trim().toLowerCase().includes(needle) || needle.includes(d.deptName.trim().toLowerCase()))
    return targetInfo ? { del, targetInfo } : null
  }).filter((t): t is NonNullable<typeof t> => t !== null)

  const llmDelegationPromises = targets.map(async ({ del, targetInfo }) => {
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

    onEvent?.({ type: 'delegation-start', targetAgentName: targetInfo.agentName, targetAgentId: targetInfo.agentId })
    const delegationStart = Date.now()

    try {
      const response = await executeDelegation(
        client,
        { departmentName: targetInfo.deptName, agentId: targetInfo.agentId, agentName: targetInfo.agentName, prompt: del.prompt },
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

  const llmSettled = await Promise.allSettled(llmDelegationPromises)
  const delegationResults = llmSettled
    .filter((s): s is PromiseFulfilledResult<{ departmentName: string; agentName: string; response: string }> => s.status === 'fulfilled')
    .map(s => s.value)

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
