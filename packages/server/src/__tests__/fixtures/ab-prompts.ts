/**
 * A/B Quality Test — 10 Standard Prompts
 *
 * Story 12.4: v1 vs v2 engine quality comparison.
 * 5 categories x 2 prompts = 10 total.
 */

export interface ABPrompt {
  id: string
  category: 'translation' | 'coding' | 'analysis' | 'summary' | 'creative'
  prompt: string
  expectedBehavior: string
}

export const AB_PROMPTS: ABPrompt[] = [
  // ─── Translation (2) ────────────────────────────────
  {
    id: 'translate-01',
    category: 'translation',
    prompt: '다음 한국어를 영어로 번역해줘: "오늘 오전 10시에 전략회의가 있습니다. 마케팅팀과 개발팀이 함께 참석합니다."',
    expectedBehavior: 'Natural English translation preserving meeting context and team names',
  },
  {
    id: 'translate-02',
    category: 'translation',
    prompt: 'Translate to Korean: "The quarterly earnings report shows a 15% increase in revenue, driven primarily by the expansion into Southeast Asian markets."',
    expectedBehavior: 'Accurate Korean translation with proper financial terminology',
  },

  // ─── Coding (2) ─────────────────────────────────────
  {
    id: 'coding-01',
    category: 'coding',
    prompt: 'TypeScript로 배열에서 중복 제거하는 함수를 작성해줘. 객체 배열도 지원해야 하고, 비교 키를 파라미터로 받아야 해.',
    expectedBehavior: 'Generic TypeScript function with key-based deduplication for object arrays',
  },
  {
    id: 'coding-02',
    category: 'coding',
    prompt: 'Hono 미들웨어로 요청당 처리 시간을 측정하고 로그에 남기는 코드를 작성해줘.',
    expectedBehavior: 'Hono middleware using c.set/c.get pattern with timing measurement',
  },

  // ─── Analysis (2) ───────────────────────────────────
  {
    id: 'analysis-01',
    category: 'analysis',
    prompt: '우리 회사의 월별 매출 데이터를 분석해줘: 1월 1200만, 2월 1500만, 3월 1100만, 4월 1800만, 5월 2100만, 6월 1900만. 추세와 이상치를 설명해줘.',
    expectedBehavior: 'Identify upward trend, March dip as anomaly, quantitative trend analysis',
  },
  {
    id: 'analysis-02',
    category: 'analysis',
    prompt: '다음 두 기술 스택의 장단점을 비교 분석해줘: (A) React + Express + PostgreSQL vs (B) Vue + Fastify + MongoDB',
    expectedBehavior: 'Structured comparison with clear pros/cons for each stack component',
  },

  // ─── Summary (2) ────────────────────────────────────
  {
    id: 'summary-01',
    category: 'summary',
    prompt: '다음 회의록을 3줄로 요약해줘: "오늘 전략회의에서 Q3 목표를 논의했습니다. 마케팅팀은 SNS 채널 확대를 제안했고, 개발팀은 모바일 앱 출시를 우선시해야 한다고 했습니다. 경영진은 두 안을 모두 추진하되, 모바일 앱에 70% 리소스를 배정하기로 결정했습니다. 예산은 총 5억원이며, 8월까지 1차 릴리스를 목표로 합니다."',
    expectedBehavior: 'Concise 3-line summary covering decisions, resource allocation, and timeline',
  },
  {
    id: 'summary-02',
    category: 'summary',
    prompt: '이 에러 로그를 분석하고 원인을 요약해줘: "TypeError: Cannot read properties of undefined (reading \'companyId\') at getDB (scoped-query.ts:15) at renderSoul (soul-renderer.ts:42) at runAgent (agent-loop.ts:88)"',
    expectedBehavior: 'Identify null context issue, trace call stack, suggest fix',
  },

  // ─── Creative (2) ───────────────────────────────────
  {
    id: 'creative-01',
    category: 'creative',
    prompt: 'AI 에이전트 오케스트레이션 플랫폼의 마케팅 슬로건을 5개 만들어줘. 타겟은 스타트업 CTO들이야.',
    expectedBehavior: 'Five distinct, catchy slogans targeting technical decision makers',
  },
  {
    id: 'creative-02',
    category: 'creative',
    prompt: '개발자 온보딩 문서의 첫 페이지를 작성해줘. 프로젝트: AI 에이전트 관리 플랫폼, 기술스택: Bun + Hono + React + PostgreSQL',
    expectedBehavior: 'Structured onboarding page with setup steps, architecture overview, key concepts',
  },
]

export const AB_CATEGORIES = ['translation', 'coding', 'analysis', 'summary', 'creative'] as const
