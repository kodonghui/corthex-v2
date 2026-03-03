// E5 시드: 부서별 에이전트 추가 + H-비서 isSecretary 플래그
// 실행: bun run src/db/seed-e5.ts

import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_OhRoVyUD5Qw3@ep-muddy-violet-a1f8np47-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function seedE5() {
  console.log('🌱 E5 시드 시작...')

  // 1. H-비서 isSecretary 마킹
  await sql`UPDATE agents SET is_secretary = true WHERE name = 'H-비서'`
  console.log('  ✓ H-비서 isSecretary = true')

  // 2. 기존 데이터 조회
  const [company] = await sql`SELECT id FROM companies WHERE slug = 'corthex-hq'`
  const [ceo] = await sql`SELECT id FROM users WHERE username = 'ceo'`
  const existingDepts = await sql`SELECT id, name FROM departments WHERE company_id = ${company.id}`
  const existingAgents = await sql`SELECT name FROM agents WHERE company_id = ${company.id}`

  console.log('  기존 부서:', existingDepts.map(d => d.name))
  console.log('  기존 에이전트:', existingAgents.map(a => a.name))

  // 3. 부서 추가
  let mktId: string, finId: string, devId: string

  const devDept = existingDepts.find(d => d.name === '개발팀')
  devId = devDept!.id

  if (!existingDepts.some(d => d.name === '마케팅팀')) {
    const [mkt] = await sql`INSERT INTO departments (company_id, name, description)
      VALUES (${company.id}, '마케팅팀', '마케팅 전략 및 분석') RETURNING id`
    mktId = mkt.id
    console.log('  ✓ 부서 추가: 마케팅팀')
  } else {
    mktId = existingDepts.find(d => d.name === '마케팅팀')!.id
    console.log('  ⏭ 부서 존재: 마케팅팀')
  }

  if (!existingDepts.some(d => d.name === '재무팀')) {
    const [fin] = await sql`INSERT INTO departments (company_id, name, description)
      VALUES (${company.id}, '재무팀', '재무 관리 및 투자 분석') RETURNING id`
    finId = fin.id
    console.log('  ✓ 부서 추가: 재무팀')
  } else {
    finId = existingDepts.find(d => d.name === '재무팀')!.id
    console.log('  ⏭ 부서 존재: 재무팀')
  }

  // 4. 부서별 에이전트 추가
  const agentDefs = [
    {
      deptId: devId,
      name: '개발팀장',
      role: '개발 에이전트',
      soul: `당신은 CORTHEX HQ 개발팀 소속 AI 에이전트입니다.
- 소프트웨어 개발, 기술 분석, 코드 리뷰를 담당합니다
- 기술적 질문에 정확하고 상세하게 답변합니다
- 한국어로 대화합니다`,
    },
    {
      deptId: mktId,
      name: '마케팅팀장',
      role: '마케팅 에이전트',
      soul: `당신은 CORTHEX HQ 마케팅팀 소속 AI 에이전트입니다.
- 시장 분석, 마케팅 전략, 브랜딩을 담당합니다
- 데이터 기반 인사이트를 제공합니다
- 한국어로 대화합니다`,
    },
    {
      deptId: finId,
      name: '재무팀장',
      role: '재무 에이전트',
      soul: `당신은 CORTHEX HQ 재무팀 소속 AI 에이전트입니다.
- 재무 분석, 투자 검토, 예산 관리를 담당합니다
- 정확한 숫자와 근거를 기반으로 답변합니다
- 한국어로 대화합니다`,
    },
  ]

  for (const a of agentDefs) {
    if (existingAgents.some(e => e.name === a.name)) {
      console.log(`  ⏭ 에이전트 존재: ${a.name}`)
      continue
    }
    const [agent] = await sql`INSERT INTO agents
      (company_id, user_id, department_id, name, role, soul, status, is_secretary)
      VALUES (${company.id}, ${ceo.id}, ${a.deptId}, ${a.name}, ${a.role}, ${a.soul}, 'offline', false)
      RETURNING id, name`
    console.log(`  ✓ 에이전트 추가: ${agent.name} (${agent.id})`)
  }

  // 5. H-비서 soul 업데이트 (위임 역할 추가)
  await sql`UPDATE agents SET soul = ${'당신은 CORTHEX HQ의 CEO 비서 에이전트입니다.\n- 항상 공손하고 명확하게 답변합니다\n- 유저의 요청을 분석하여 적절한 부서에 위임합니다\n- 위임 결과를 종합하여 최종 보고서를 작성합니다\n- 한국어로 대화합니다'}
    WHERE name = 'H-비서'`
  console.log('  ✓ H-비서 soul 업데이트')

  // 확인
  const allAgents = await sql`SELECT name, role, is_secretary FROM agents WHERE company_id = ${company.id}`
  console.log('\n📋 전체 에이전트:')
  for (const a of allAgents) {
    console.log(`  ${a.is_secretary ? '⭐' : '  '} ${a.name} | ${a.role}`)
  }

  console.log('\n✅ E5 시드 완료!')
  process.exit(0)
}

seedE5().catch((err) => {
  console.error('❌ E5 시드 실패:', err)
  process.exit(1)
})
