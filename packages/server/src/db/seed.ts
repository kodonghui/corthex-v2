// 시드 스크립트 — 초기 회사 + admin 유저 생성
// 실행: bun run src/db/seed.ts

import { db } from './index'
import { companies, users, departments, agents, tools } from './schema'

async function seed() {
  console.log('🌱 시드 데이터 삽입 시작...')

  // 1. 회사 생성
  const [company] = await db
    .insert(companies)
    .values({
      name: 'CORTHEX HQ',
      slug: 'corthex-hq',
    })
    .returning()

  console.log(`  ✓ 회사: ${company.name} (${company.id})`)

  // 2. admin 유저 생성
  const adminPwHash = await Bun.password.hash('admin1234')
  const [admin] = await db
    .insert(users)
    .values({
      companyId: company.id,
      username: 'admin',
      passwordHash: adminPwHash,
      name: '관리자',
      email: 'admin@corthex.io',
      role: 'admin',
    })
    .returning()

  console.log(`  ✓ 관리자: ${admin.username} (${admin.id})`)

  // 3. 일반 유저 (대표님)
  const ceoPwHash = await Bun.password.hash('ceo1234')
  const [ceo] = await db
    .insert(users)
    .values({
      companyId: company.id,
      username: 'ceo',
      passwordHash: ceoPwHash,
      name: '대표님',
      email: 'ceo@corthex.io',
      role: 'user',
    })
    .returning()

  console.log(`  ✓ 유저: ${ceo.username} (${ceo.id})`)

  // 4. 부서 생성
  const [execDept] = await db
    .insert(departments)
    .values({ companyId: company.id, name: '경영지원실', description: 'CEO 직속 부서' })
    .returning()

  const [devDept] = await db
    .insert(departments)
    .values({ companyId: company.id, name: '개발팀', description: 'AI 에이전트 개발' })
    .returning()

  console.log(`  ✓ 부서: ${execDept.name}, ${devDept.name}`)

  // 5. AI 에이전트 (비서)
  const [secretary] = await db
    .insert(agents)
    .values({
      companyId: company.id,
      userId: ceo.id,
      departmentId: execDept.id,
      name: 'H-비서',
      role: 'CEO 비서',
      soul: `당신은 CORTHEX HQ의 CEO 비서 에이전트입니다.
- 항상 공손하고 명확하게 답변합니다
- 일정 관리, 메일 요약, 보고서 작성을 담당합니다
- 한국어로 대화합니다`,
      status: 'offline',
    })
    .returning()

  console.log(`  ✓ 에이전트: ${secretary.name} → ${ceo.name}`)

  // 6. 플랫폼 공통 도구
  const toolDefs = [
    { name: '일정 관리', description: '구글 캘린더 연동', scope: 'platform' as const },
    { name: '이메일', description: '이메일 발송/수신 요약', scope: 'platform' as const },
    { name: 'KIS 증권', description: 'KIS 증권 API 연동', scope: 'company' as const, companyId: company.id },
    { name: '노션 연동', description: '노션 페이지 읽기/쓰기', scope: 'platform' as const },
    { name: '텔레그램', description: '텔레그램 봇 메시지', scope: 'platform' as const },
  ]

  for (const def of toolDefs) {
    const [tool] = await db
      .insert(tools)
      .values({ companyId: def.companyId ?? null, name: def.name, description: def.description, scope: def.scope })
      .returning()
    console.log(`  ✓ 도구: ${tool.name}`)
  }

  console.log('\n✅ 시드 완료!')
  console.log(`\n📋 로그인 정보:`)
  console.log(`  관리자: admin / admin1234`)
  console.log(`  대표님: ceo / ceo1234`)

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ 시드 실패:', err)
  process.exit(1)
})
