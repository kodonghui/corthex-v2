import { db } from '../db'
import { agents, departments, orchestrationTasks, qualityReviews, soulGymRounds, soulEvolutionProposals, soulBackups } from '../db/schema'
import { eq, and, sql, gte, desc, count, asc } from 'drizzle-orm'
import { llmRouter, resolveModel } from './llm-router'
import { scanForCredentials } from './agent-runner'
import type { LLMRouterContext } from './llm-router'

// === Constants ===

const ANALYSIS_MODEL = 'claude-haiku-4-5'  // Low-cost model for gym operations
const JUDGE_MODEL = 'claude-haiku-4-5'
const MIN_IMPROVEMENT = 3.0  // Minimum improvement to recommend adoption

// === Soul Gym Analyze ===

export async function analyzeSoul(companyId: string, agentId: string) {
  // Get agent info
  const agentRow = await db.select({
    id: agents.id,
    name: agents.name,
    tier: agents.tier,
    soul: agents.soul,
    modelName: agents.modelName,
    departmentName: departments.name,
  }).from(agents)
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(eq(agents.id, agentId), eq(agents.companyId, companyId)))

  if (agentRow.length === 0) return { error: 'AGENT_NOT_FOUND' as const }
  const agent = agentRow[0]

  // Get recent failure patterns
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const failedTasks = await db.select({
    input: orchestrationTasks.input,
    output: orchestrationTasks.output,
    status: orchestrationTasks.status,
  }).from(orchestrationTasks).where(and(
    eq(orchestrationTasks.companyId, companyId),
    eq(orchestrationTasks.agentId, agentId),
    eq(orchestrationTasks.status, 'failed'),
    gte(orchestrationTasks.createdAt, thirtyDaysAgo),
  )).orderBy(desc(orchestrationTasks.createdAt)).limit(5)

  // Get quality review feedback
  const failedReviews = await db.select({
    feedback: qualityReviews.feedback,
    scores: qualityReviews.scores,
    conclusion: qualityReviews.conclusion,
  }).from(qualityReviews)
    .innerJoin(orchestrationTasks, and(
      eq(qualityReviews.commandId, orchestrationTasks.commandId),
      eq(orchestrationTasks.agentId, agentId),
    ))
    .where(and(
      eq(qualityReviews.companyId, companyId),
      eq(qualityReviews.conclusion, 'fail'),
      gte(qualityReviews.createdAt, thirtyDaysAgo),
    )).orderBy(desc(qualityReviews.createdAt)).limit(5)

  const recentIssues = [
    ...failedTasks.map((t) => `작업 실패: ${t.output?.slice(0, 100) || '(출력 없음)'}`),
    ...failedReviews.map((r) => `품질 실패: ${r.feedback?.slice(0, 100) || '(피드백 없음)'}`),
  ]

  const currentSoul = agent.soul || '(소울 미설정)'

  // Call LLM to generate 3 variants
  const credentials = await scanForCredentials(companyId)
  const llmContext: LLMRouterContext = {
    companyId,
    agentId,
    agentName: 'soul-gym',
    source: 'delegation',
    credentials,
  }

  const analysisPrompt = `당신은 AI 에이전트 성능 최적화 전문가입니다.
다음 에이전트의 현재 Soul(성격 문서)과 최근 성능 데이터를 분석하고,
3가지 개선 변이를 제안해주세요.

에이전트: ${agent.name} (${agent.tier}, ${agent.departmentName || '미배정'})
모델: ${agent.modelName}

[현재 Soul]:
${currentSoul}

[최근 실패/품질 이슈]:
${recentIssues.length > 0 ? recentIssues.join('\n') : '(최근 이슈 없음)'}

3가지 변이를 JSON 형식으로 반환해주세요:
{
  "variants": [
    {
      "type": "A",
      "label": "규칙 추가",
      "description": "어떤 규칙을 왜 추가하는지",
      "proposedChanges": "추가할 텍스트 (마크다운)",
      "confidence": 0-100
    },
    {
      "type": "B",
      "label": "표현 강화",
      "description": "어떤 표현을 왜 강화하는지",
      "proposedChanges": "수정할 텍스트 (마크다운)",
      "confidence": 0-100
    },
    {
      "type": "C",
      "label": "하이브리드",
      "description": "A+B 결합 + 새로운 접근",
      "proposedChanges": "하이브리드 변경 텍스트 (마크다운)",
      "confidence": 0-100
    }
  ]
}

JSON만 반환하세요. 설명 없이 순수 JSON만.`

  try {
    const response = await llmRouter.call({
      model: resolveModel(ANALYSIS_MODEL),
      messages: [{ role: 'user', content: analysisPrompt }],
      maxTokens: 2000,
      temperature: 0.7,
    }, llmContext)

    // Parse response
    let variants
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        variants = parsed.variants || []
      } else {
        variants = []
      }
    } catch {
      variants = [
        { type: 'A', label: '규칙 추가', description: '분석 파싱 실패 — 수동 검토 필요', proposedChanges: '', confidence: 0 },
        { type: 'B', label: '표현 강화', description: '분석 파싱 실패 — 수동 검토 필요', proposedChanges: '', confidence: 0 },
        { type: 'C', label: '하이브리드', description: '분석 파싱 실패 — 수동 검토 필요', proposedChanges: '', confidence: 0 },
      ]
    }

    return {
      data: {
        agentId: agent.id,
        agentName: agent.name,
        currentSoulSummary: currentSoul.length > 300 ? currentSoul.slice(0, 300) + '...' : currentSoul,
        recentIssues,
        variants: variants.map((v: { type: string; label: string; description: string; proposedChanges: string; confidence: number }) => ({
          type: v.type,
          label: v.label,
          description: v.description,
          proposedChanges: v.proposedChanges,
          confidence: Math.min(100, Math.max(0, v.confidence || 0)),
        })),
      },
    }
  } catch (err) {
    return { error: 'LLM_CALL_FAILED' as const, message: String(err) }
  }
}

// === Soul Gym Benchmark ===

export async function runBenchmark(companyId: string, agentId: string, variants: { type: string; proposedChanges: string }[]) {
  const agentRow = await db.select({
    id: agents.id,
    name: agents.name,
    tier: agents.tier,
    soul: agents.soul,
    modelName: agents.modelName,
    departmentName: departments.name,
  }).from(agents)
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(eq(agents.id, agentId), eq(agents.companyId, companyId)))

  if (agentRow.length === 0) return { error: 'AGENT_NOT_FOUND' as const }
  const agent = agentRow[0]

  const credentials = await scanForCredentials(companyId)
  const llmContext: LLMRouterContext = {
    companyId,
    agentId,
    agentName: 'soul-gym-benchmark',
    source: 'delegation',
    credentials,
  }

  // Generate benchmark questions based on agent's role
  const questionPrompt = `에이전트 역할에 맞는 벤치마크 질문 3개를 생성해주세요.
에이전트: ${agent.name} (${agent.tier}, ${agent.departmentName || '일반'})
Soul: ${(agent.soul || '').slice(0, 500)}

JSON 형식:
{ "questions": [{ "question": "...", "topic": "..." }] }
JSON만 반환.`

  const qResponse = await llmRouter.call({
    model: resolveModel(ANALYSIS_MODEL),
    messages: [{ role: 'user', content: questionPrompt }],
    maxTokens: 500,
    temperature: 0.5,
  }, llmContext)

  let questions: { question: string; topic: string }[]
  try {
    const parsed = JSON.parse(qResponse.content.match(/\{[\s\S]*\}/)?.[0] || '{}')
    questions = parsed.questions || [
      { question: '주어진 데이터를 분석하고 핵심 인사이트를 도출하세요.', topic: '분석' },
      { question: '리스크 요인을 식별하고 대응 방안을 제시하세요.', topic: '리스크' },
      { question: '최근 트렌드를 요약하고 향후 전망을 제시하세요.', topic: '전망' },
    ]
  } catch {
    questions = [
      { question: '주어진 데이터를 분석하고 핵심 인사이트를 도출하세요.', topic: '분석' },
      { question: '리스크 요인을 식별하고 대응 방안을 제시하세요.', topic: '리스크' },
      { question: '최근 트렌드를 요약하고 향후 전망을 제시하세요.', topic: '전망' },
    ]
  }

  // Build souls: original + 3 variants
  const originalSoul = agent.soul || ''
  const soulVersions = [
    { key: 'original', soul: originalSoul },
    ...variants.map((v) => ({
      key: `variant${v.type}`,
      soul: originalSoul + '\n\n' + v.proposedChanges,
    })),
  ]

  // For each question, get response from each soul version and judge
  const allScores: Record<string, { bluf: number; expertise: number; specificity: number; structure: number; total: number }> = {}
  for (const sv of soulVersions) {
    allScores[sv.key] = { bluf: 0, expertise: 0, specificity: 0, structure: 0, total: 0 }
  }

  let totalCost = 0

  for (const q of questions) {
    // Get responses from each soul version
    const responses: Record<string, string> = {}

    for (const sv of soulVersions) {
      try {
        const resp = await llmRouter.call({
          model: resolveModel(agent.modelName),
          systemPrompt: sv.soul || '당신은 유능한 AI 에이전트입니다.',
          messages: [{ role: 'user', content: q.question }],
          maxTokens: 800,
          temperature: 0.3,
        }, llmContext)
        responses[sv.key] = resp.content
        totalCost += (resp.usage.inputTokens + resp.usage.outputTokens) * 0.000001
      } catch {
        responses[sv.key] = '(응답 생성 실패)'
      }
    }

    // Judge each response
    for (const sv of soulVersions) {
      const judgePrompt = `다음 응답을 4가지 차원으로 평가해주세요:
1. BLUF 형식 (0-20): 결론을 먼저 제시하는가?
2. 전문성 (0-30): 정확하고 논리적인가?
3. 구체성 (0-30): 수치와 근거가 구체적인가?
4. 구조 (0-20): 읽기 쉽고 체계적인가?

질문: ${q.question}
응답: ${responses[sv.key]}

JSON만 반환: { "bluf": N, "expertise": N, "specificity": N, "structure": N, "total": N }`

      try {
        const judgeResp = await llmRouter.call({
          model: resolveModel(JUDGE_MODEL),
          messages: [{ role: 'user', content: judgePrompt }],
          maxTokens: 200,
          temperature: 0,
        }, llmContext)

        const parsed = JSON.parse(judgeResp.content.match(/\{[\s\S]*\}/)?.[0] || '{}')
        allScores[sv.key].bluf += parsed.bluf || 0
        allScores[sv.key].expertise += parsed.expertise || 0
        allScores[sv.key].specificity += parsed.specificity || 0
        allScores[sv.key].structure += parsed.structure || 0
        allScores[sv.key].total += parsed.total || (
          (parsed.bluf || 0) + (parsed.expertise || 0) + (parsed.specificity || 0) + (parsed.structure || 0)
        )
        totalCost += (judgeResp.usage.inputTokens + judgeResp.usage.outputTokens) * 0.000001
      } catch {
        // No score added on failure
      }
    }
  }

  // Average scores across questions
  const numQ = questions.length
  for (const key of Object.keys(allScores)) {
    allScores[key].bluf = Math.round((allScores[key].bluf / numQ) * 10) / 10
    allScores[key].expertise = Math.round((allScores[key].expertise / numQ) * 10) / 10
    allScores[key].specificity = Math.round((allScores[key].specificity / numQ) * 10) / 10
    allScores[key].structure = Math.round((allScores[key].structure / numQ) * 10) / 10
    allScores[key].total = Math.round((allScores[key].total / numQ) * 10) / 10
  }

  // Determine winner
  const entries = Object.entries(allScores)
  entries.sort((a, b) => b[1].total - a[1].total)
  const winner = entries[0][0]
  const improvement = entries[0][1].total - (allScores.original?.total ?? 0)

  // Determine recommendation
  const recommendation = winner === 'original'
    ? '현재 Soul이 가장 우수합니다. 변경 불필요.'
    : improvement >= MIN_IMPROVEMENT
      ? `${winner}가 ${improvement.toFixed(1)}점 개선되었습니다. 적용을 권장합니다.`
      : `${winner}가 소폭 개선(${improvement.toFixed(1)}점)되었으나, 최소 기준(${MIN_IMPROVEMENT}점)에 미달합니다.`

  return {
    data: {
      agentId: agent.id,
      questions,
      scores: {
        original: allScores.original,
        variantA: allScores.variantA || { bluf: 0, expertise: 0, specificity: 0, structure: 0, total: 0 },
        variantB: allScores.variantB || { bluf: 0, expertise: 0, specificity: 0, structure: 0, total: 0 },
        variantC: allScores.variantC || { bluf: 0, expertise: 0, specificity: 0, structure: 0, total: 0 },
      },
      winner,
      improvement: Math.round(improvement * 10) / 10,
      recommendation,
      costUsd: Math.round(totalCost * 10000) / 10000,
    },
  }
}

// === Apply Soul Variant ===

export async function applySoulVariant(
  companyId: string,
  agentId: string,
  variantSoul: string,
  benchmarkResult: {
    scoreBefore: number
    scoreAfter: number
    winner: string
    costUsd: number
    variantsJson: unknown
    benchmarkJson: unknown
  },
) {
  // Get current agent
  const agentRow = await db.select({ id: agents.id, soul: agents.soul })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.companyId, companyId)))

  if (agentRow.length === 0) return { error: 'AGENT_NOT_FOUND' as const }

  // Backup current soul
  const currentVersion = await db.select({ maxVersion: sql<number>`coalesce(max(${soulBackups.version}), 0)` })
    .from(soulBackups)
    .where(and(eq(soulBackups.companyId, companyId), eq(soulBackups.agentId, agentId)))

  await db.insert(soulBackups).values({
    companyId,
    agentId,
    soulMarkdown: agentRow[0].soul || '',
    version: (currentVersion[0]?.maxVersion ?? 0) + 1,
    source: 'soul-gym',
  })

  // Apply new soul
  await db.update(agents)
    .set({ soul: variantSoul, updatedAt: new Date() })
    .where(eq(agents.id, agentId))

  // Record round
  const lastRound = await db.select({ maxRound: sql<number>`coalesce(max(${soulGymRounds.roundNum}), 0)` })
    .from(soulGymRounds)
    .where(and(eq(soulGymRounds.companyId, companyId), eq(soulGymRounds.agentId, agentId)))

  await db.insert(soulGymRounds).values({
    companyId,
    agentId,
    roundNum: (lastRound[0]?.maxRound ?? 0) + 1,
    scoreBefore: benchmarkResult.scoreBefore,
    scoreAfter: benchmarkResult.scoreAfter,
    improvement: benchmarkResult.scoreAfter - benchmarkResult.scoreBefore,
    winner: benchmarkResult.winner,
    costUsd: benchmarkResult.costUsd,
    variantsJson: benchmarkResult.variantsJson,
    benchmarkJson: benchmarkResult.benchmarkJson,
  })

  return { data: { applied: true } }
}

// === Soul Gym History ===

export async function getSoulGymHistory(companyId: string, agentId?: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit

  const conditions = [
    eq(soulGymRounds.companyId, companyId),
    ...(agentId ? [eq(soulGymRounds.agentId, agentId)] : []),
  ]

  const totalRows = await db.select({ count: count() })
    .from(soulGymRounds)
    .where(and(...conditions))
  const total = totalRows[0]?.count ?? 0

  const rows = await db.select({
    id: soulGymRounds.id,
    agentId: soulGymRounds.agentId,
    agentName: agents.name,
    roundNum: soulGymRounds.roundNum,
    scoreBefore: soulGymRounds.scoreBefore,
    scoreAfter: soulGymRounds.scoreAfter,
    improvement: soulGymRounds.improvement,
    winner: soulGymRounds.winner,
    costUsd: soulGymRounds.costUsd,
    createdAt: soulGymRounds.createdAt,
  }).from(soulGymRounds)
    .innerJoin(agents, eq(soulGymRounds.agentId, agents.id))
    .where(and(...conditions))
    .orderBy(desc(soulGymRounds.createdAt))
    .offset(offset)
    .limit(limit)

  return {
    items: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString() ?? '',
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

// === Soul Evolution: Run Analysis ===

export async function runSoulEvolution(companyId: string, agentId: string) {
  const agentRow = await db.select({
    id: agents.id,
    name: agents.name,
    soul: agents.soul,
    departmentName: departments.name,
  }).from(agents)
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(and(eq(agents.id, agentId), eq(agents.companyId, companyId)))

  if (agentRow.length === 0) return { error: 'AGENT_NOT_FOUND' as const }
  const agent = agentRow[0]

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Gather failed reviews and tasks
  const failedReviews = await db.select({
    feedback: qualityReviews.feedback,
  }).from(qualityReviews)
    .innerJoin(orchestrationTasks, and(
      eq(qualityReviews.commandId, orchestrationTasks.commandId),
      eq(orchestrationTasks.agentId, agentId),
    ))
    .where(and(
      eq(qualityReviews.companyId, companyId),
      eq(qualityReviews.conclusion, 'fail'),
      gte(qualityReviews.createdAt, thirtyDaysAgo),
    )).limit(10)

  const failedOutputs = await db.select({
    output: orchestrationTasks.output,
  }).from(orchestrationTasks).where(and(
    eq(orchestrationTasks.companyId, companyId),
    eq(orchestrationTasks.agentId, agentId),
    eq(orchestrationTasks.status, 'failed'),
    gte(orchestrationTasks.createdAt, thirtyDaysAgo),
  )).limit(10)

  const warnings = [
    ...failedReviews.map((r) => r.feedback || ''),
    ...failedOutputs.map((t) => t.output || ''),
  ].filter(Boolean)

  if (warnings.length === 0) {
    return { data: { noIssues: true, message: '최근 30일 내 경고/실패 기록이 없습니다.' } }
  }

  const credentials = await scanForCredentials(companyId)
  const llmContext: LLMRouterContext = {
    companyId,
    agentId,
    agentName: 'soul-evolution',
    source: 'delegation',
    credentials,
  }

  const evolutionPrompt = `당신은 AI 에이전트 Soul(성격 문서) 진화 전문가입니다.
다음 경고/실패 패턴을 분석하고, Soul에 추가할 개선 텍스트를 제안하세요.

에이전트: ${agent.name}
현재 Soul:
${(agent.soul || '').slice(0, 1000)}

최근 경고/실패 패턴 (${warnings.length}건):
${warnings.slice(0, 5).map((w, i) => `${i + 1}. ${w.slice(0, 200)}`).join('\n')}

다음 형식으로 제안:
## 추가할 텍스트
(Soul 문서 끝에 추가할 마크다운 텍스트)

## 분석 이유
(왜 이 변경이 필요한지 간략히)`

  try {
    const response = await llmRouter.call({
      model: resolveModel(ANALYSIS_MODEL),
      messages: [{ role: 'user', content: evolutionPrompt }],
      maxTokens: 1000,
      temperature: 0.5,
    }, llmContext)

    // Create proposal
    const [proposal] = await db.insert(soulEvolutionProposals).values({
      companyId,
      agentId,
      proposalText: response.content,
      analysisJson: { warningsAnalyzed: warnings.length, patterns: warnings.slice(0, 5) },
    }).returning()

    return {
      data: {
        id: proposal.id,
        agentId,
        agentName: agent.name,
        status: 'pending',
        proposalText: response.content,
        warningsAnalyzed: warnings.length,
      },
    }
  } catch (err) {
    return { error: 'LLM_CALL_FAILED' as const, message: String(err) }
  }
}

// === Soul Evolution: List Proposals ===

export async function listSoulEvolutionProposals(companyId: string, agentId?: string) {
  const conditions = [
    eq(soulEvolutionProposals.companyId, companyId),
    ...(agentId ? [eq(soulEvolutionProposals.agentId, agentId)] : []),
  ]

  const rows = await db.select({
    id: soulEvolutionProposals.id,
    agentId: soulEvolutionProposals.agentId,
    agentName: agents.name,
    status: soulEvolutionProposals.status,
    proposalText: soulEvolutionProposals.proposalText,
    analysisJson: soulEvolutionProposals.analysisJson,
    createdAt: soulEvolutionProposals.createdAt,
    resolvedAt: soulEvolutionProposals.resolvedAt,
  }).from(soulEvolutionProposals)
    .innerJoin(agents, eq(soulEvolutionProposals.agentId, agents.id))
    .where(and(...conditions))
    .orderBy(desc(soulEvolutionProposals.createdAt))
    .limit(50)

  return rows.map((r) => ({
    id: r.id,
    agentId: r.agentId,
    agentName: r.agentName,
    status: r.status,
    proposalText: r.proposalText,
    warningsAnalyzed: (r.analysisJson as { warningsAnalyzed?: number })?.warningsAnalyzed ?? 0,
    createdAt: r.createdAt?.toISOString() ?? '',
    resolvedAt: r.resolvedAt?.toISOString() ?? null,
  }))
}

// === Soul Evolution: Approve ===

export async function approveSoulEvolutionProposal(companyId: string, proposalId: string) {
  const proposal = await db.select({
    id: soulEvolutionProposals.id,
    agentId: soulEvolutionProposals.agentId,
    status: soulEvolutionProposals.status,
    proposalText: soulEvolutionProposals.proposalText,
  }).from(soulEvolutionProposals)
    .where(and(eq(soulEvolutionProposals.id, proposalId), eq(soulEvolutionProposals.companyId, companyId)))

  if (proposal.length === 0) return { error: 'NOT_FOUND' as const }
  if (proposal[0].status !== 'pending') return { error: 'ALREADY_RESOLVED' as const }

  const agentRow = await db.select({ soul: agents.soul })
    .from(agents).where(eq(agents.id, proposal[0].agentId))
  if (agentRow.length === 0) return { error: 'AGENT_NOT_FOUND' as const }

  // Extract "## 추가할 텍스트" section
  const addMatch = proposal[0].proposalText.match(/## 추가할 텍스트\s*\n([\s\S]*?)(?=\n## |$)/)
  const textToAdd = addMatch ? addMatch[1].trim() : proposal[0].proposalText

  // Backup current soul
  const currentVersion = await db.select({ maxVersion: sql<number>`coalesce(max(${soulBackups.version}), 0)` })
    .from(soulBackups)
    .where(and(eq(soulBackups.companyId, companyId), eq(soulBackups.agentId, proposal[0].agentId)))

  await db.insert(soulBackups).values({
    companyId,
    agentId: proposal[0].agentId,
    soulMarkdown: agentRow[0].soul || '',
    version: (currentVersion[0]?.maxVersion ?? 0) + 1,
    source: 'soul-evolution',
  })

  // Apply to soul
  const newSoul = (agentRow[0].soul || '') + '\n\n' + textToAdd
  await db.update(agents)
    .set({ soul: newSoul, updatedAt: new Date() })
    .where(eq(agents.id, proposal[0].agentId))

  // Update proposal status
  await db.update(soulEvolutionProposals)
    .set({ status: 'approved', resolvedAt: new Date() })
    .where(eq(soulEvolutionProposals.id, proposalId))

  return { data: { approved: true } }
}

// === Soul Evolution: Reject ===

export async function rejectSoulEvolutionProposal(companyId: string, proposalId: string) {
  const proposal = await db.select({
    id: soulEvolutionProposals.id,
    status: soulEvolutionProposals.status,
  }).from(soulEvolutionProposals)
    .where(and(eq(soulEvolutionProposals.id, proposalId), eq(soulEvolutionProposals.companyId, companyId)))

  if (proposal.length === 0) return { error: 'NOT_FOUND' as const }
  if (proposal[0].status !== 'pending') return { error: 'ALREADY_RESOLVED' as const }

  await db.update(soulEvolutionProposals)
    .set({ status: 'rejected', resolvedAt: new Date() })
    .where(eq(soulEvolutionProposals.id, proposalId))

  return { data: { rejected: true } }
}
