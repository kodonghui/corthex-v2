// E7 시드: 플랫폼 도구 정의 + 에이전트-도구 매핑 + 부서 지식
// 실행: bun run src/db/seed-e7.ts

import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_OhRoVyUD5Qw3@ep-muddy-violet-a1f8np47-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function seedE7() {
  console.log('🌱 E7 시드 시작...')

  // 1. 회사 / 에이전트 / 부서 조회
  const [company] = await sql`SELECT id FROM companies WHERE slug = 'corthex-hq'`
  const allAgents = await sql`SELECT id, name, department_id FROM agents WHERE company_id = ${company.id}`
  const allDepts = await sql`SELECT id, name FROM departments WHERE company_id = ${company.id}`

  console.log('  에이전트:', allAgents.map(a => a.name))
  console.log('  부서:', allDepts.map(d => d.name))

  // 2. 플랫폼 도구 정의 (scope = 'platform', companyId = null)
  const platformTools = [
    {
      name: 'get_current_time',
      description: '현재 날짜와 시간을 조회합니다 (한국 시간 KST 포함)',
      handler: 'get_current_time',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'calculate',
      description: '수학 계산을 수행합니다. 사칙연산, 거듭제곱 등 지원.',
      handler: 'calculate',
      inputSchema: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: '계산할 수식 (예: "100 * 1.1", "2^10")',
          },
        },
        required: ['expression'],
      },
    },
    {
      name: 'search_department_knowledge',
      description: '소속 부서의 지식 베이스를 검색합니다. 부서 내부 정보, 업무 규칙, 참고 자료를 찾을 때 사용합니다.',
      handler: 'search_department_knowledge',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '검색할 키워드 또는 질문',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'search_web',
      description: '웹에서 정보를 검색합니다. (개발 중 - 추후 외부 API 연동 예정)',
      handler: 'search_web',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '검색할 키워드',
          },
        },
        required: ['query'],
      },
    },
  ]

  const toolIds: Record<string, string> = {}

  for (const t of platformTools) {
    // 이미 존재하면 스킵
    const existing = await sql`SELECT id FROM tool_definitions WHERE name = ${t.name} AND scope = 'platform'`
    if (existing.length > 0) {
      toolIds[t.name] = existing[0].id
      console.log(`  ⏭ 도구 존재: ${t.name}`)
      continue
    }

    const [tool] = await sql`INSERT INTO tool_definitions
      (name, description, scope, handler, input_schema, is_active)
      VALUES (${t.name}, ${t.description}, 'platform', ${t.handler}, ${JSON.stringify(t.inputSchema)}, true)
      RETURNING id, name`
    toolIds[t.name] = tool.id
    console.log(`  ✓ 도구 추가: ${tool.name} (${tool.id})`)
  }

  // 3. 에이전트-도구 매핑 (모든 에이전트에 공통 도구 할당)
  const commonTools = ['get_current_time', 'calculate']
  const deptTools = ['search_department_knowledge']  // 부서 에이전트만

  for (const agent of allAgents) {
    const toolsToAssign = agent.department_id
      ? [...commonTools, ...deptTools]
      : commonTools  // 비서는 공통 도구만

    for (const toolName of toolsToAssign) {
      const toolId = toolIds[toolName]
      if (!toolId) continue

      const existing = await sql`SELECT id FROM agent_tools
        WHERE agent_id = ${agent.id} AND tool_id = ${toolId}`
      if (existing.length > 0) {
        console.log(`  ⏭ 매핑 존재: ${agent.name} ← ${toolName}`)
        continue
      }

      await sql`INSERT INTO agent_tools (company_id, agent_id, tool_id, is_enabled)
        VALUES (${company.id}, ${agent.id}, ${toolId}, true)`
      console.log(`  ✓ 매핑 추가: ${agent.name} ← ${toolName}`)
    }
  }

  // 4. 부서별 지식 베이스 시드
  const knowledgeData = [
    {
      deptName: '개발팀',
      items: [
        { title: '기술 스택', category: '기술', content: 'CORTHEX v2 기술 스택: Bun 1.3.10, Hono, React 19, Vite 6, Tailwind CSS 4, Drizzle ORM, PostgreSQL (Neon), Zustand, TanStack Query. 모노레포 구조 (Turborepo).' },
        { title: '개발 프로세스', category: '프로세스', content: '에픽 단위 개발 (E1~E10). 각 에픽 완료 후 커밋 → GitHub push → 노션 개발 로그 기록. PR 기반 코드 리뷰.' },
        { title: '배포 환경', category: '인프라', content: '데이터베이스: Neon PostgreSQL (싱가포르 리전). 서버: Bun 런타임. 프론트엔드: Vite 빌드 → 정적 호스팅 예정.' },
      ],
    },
    {
      deptName: '마케팅팀',
      items: [
        { title: '타겟 시장', category: '전략', content: 'CORTHEX는 B2B SaaS 시장을 타겟합니다. 주요 고객: 중소기업 CEO, 스타트업 대표. AI 기반 가상 본사 시스템으로 1인 경영 지원.' },
        { title: '경쟁사 분석', category: '분석', content: '주요 경쟁: Notion AI, ChatGPT Teams, Microsoft Copilot. 차별점: 조직 구조 기반 AI 에이전트 + 멀티테넌트 격리 + CEO 비서 오케스트레이션.' },
        { title: '마케팅 채널', category: '전략', content: '주요 채널: 1) 개발자 커뮤니티 (Disquiet, GeekNews) 2) LinkedIn B2B 마케팅 3) YouTube 데모 콘텐츠 4) 오픈카톡 커뮤니티.' },
      ],
    },
    {
      deptName: '재무팀',
      items: [
        { title: '사업 모델', category: '비즈니스', content: 'CORTHEX 수익 모델: SaaS 구독제 (월 과금). 플랜: Free (에이전트 1개), Pro (에이전트 5개, ₩29,000/월), Enterprise (무제한, 맞춤 가격).' },
        { title: '비용 구조', category: '재무', content: '주요 비용: 1) Claude API 사용료 (변동비, 토큰 기반) 2) 인프라 (Neon DB, 호스팅) 3) 인건비. 목표 마진율: 60% 이상.' },
        { title: '투자 현황', category: '재무', content: '현재: 부트스트래핑 단계. 자체 자금 운영. MVP 완성 후 시드 투자 유치 계획. 목표: MAU 100 달성 후 투자 라운드.' },
      ],
    },
  ]

  for (const dept of knowledgeData) {
    const deptRecord = allDepts.find(d => d.name === dept.deptName)
    if (!deptRecord) {
      console.log(`  ⚠ 부서 없음: ${dept.deptName}`)
      continue
    }

    for (const item of dept.items) {
      const existing = await sql`SELECT id FROM department_knowledge
        WHERE department_id = ${deptRecord.id} AND title = ${item.title}`
      if (existing.length > 0) {
        console.log(`  ⏭ 지식 존재: [${dept.deptName}] ${item.title}`)
        continue
      }

      await sql`INSERT INTO department_knowledge (company_id, department_id, title, content, category)
        VALUES (${company.id}, ${deptRecord.id}, ${item.title}, ${item.content}, ${item.category})`
      console.log(`  ✓ 지식 추가: [${dept.deptName}] ${item.title}`)
    }
  }

  // 확인
  const toolCount = await sql`SELECT COUNT(*) as cnt FROM tool_definitions WHERE is_active = true`
  const mappingCount = await sql`SELECT COUNT(*) as cnt FROM agent_tools WHERE is_enabled = true`
  const knowledgeCount = await sql`SELECT COUNT(*) as cnt FROM department_knowledge`

  console.log(`\n📊 결과:`)
  console.log(`  도구: ${toolCount[0].cnt}개`)
  console.log(`  에이전트-도구 매핑: ${mappingCount[0].cnt}개`)
  console.log(`  부서 지식: ${knowledgeCount[0].cnt}개`)

  console.log('\n✅ E7 시드 완료!')
  process.exit(0)
}

seedE7().catch((err) => {
  console.error('❌ E7 시드 실패:', err)
  process.exit(1)
})
