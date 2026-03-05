// 시드 스크립트 — 초기 회사 + admin 유저 생성
// 실행: bun run src/db/seed.ts

import { db } from './index'
import { companies, users, departments, agents, toolDefinitions, strategyWatchlists } from './schema'

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

  // 4-2. 추가 부서
  const [mktDept] = await db
    .insert(departments)
    .values({ companyId: company.id, name: '마케팅팀', description: '마케팅 전략 및 분석' })
    .returning()

  const [finDept] = await db
    .insert(departments)
    .values({ companyId: company.id, name: '재무팀', description: '재무 관리 및 투자 분석' })
    .returning()

  console.log(`  ✓ 부서: ${mktDept.name}, ${finDept.name}`)

  // 5. AI 에이전트 — 비서 (오케스트레이터)
  const [secretary] = await db
    .insert(agents)
    .values({
      companyId: company.id,
      userId: ceo.id,
      departmentId: execDept.id,
      name: 'H-비서',
      role: 'CEO 비서',
      isSecretary: true,
      soul: `당신은 CORTHEX HQ의 CEO 비서 에이전트입니다.
- 항상 공손하고 명확하게 답변합니다
- 유저의 요청을 분석하여 적절한 부서에 위임합니다
- 위임 결과를 종합하여 최종 보고서를 작성합니다
- 한국어로 대화합니다`,
      status: 'offline',
    })
    .returning()

  console.log(`  ✓ 에이전트: ${secretary.name} (비서) → ${ceo.name}`)

  // 5-2. 부서별 에이전트
  const deptAgents = [
    {
      departmentId: devDept.id,
      name: '개발팀장',
      role: '개발 에이전트',
      soul: `당신은 CORTHEX HQ 개발팀 소속 AI 에이전트입니다.
- 소프트웨어 개발, 기술 분석, 코드 리뷰를 담당합니다
- 기술적 질문에 정확하고 상세하게 답변합니다
- 한국어로 대화합니다`,
    },
    {
      departmentId: mktDept.id,
      name: '마케팅팀장',
      role: '마케팅 에이전트',
      soul: `당신은 CORTHEX HQ 마케팅팀 소속 AI 에이전트입니다.
- 시장 분석, 마케팅 전략, 브랜딩을 담당합니다
- 데이터 기반 인사이트를 제공합니다
- 한국어로 대화합니다`,
    },
    {
      departmentId: finDept.id,
      name: '재무팀장',
      role: '재무 에이전트',
      soul: `당신은 CORTHEX HQ 재무팀 소속 AI 에이전트입니다.
- 재무 분석, 투자 검토, 예산 관리를 담당합니다
- 정확한 숫자와 근거를 기반으로 답변합니다
- 한국어로 대화합니다`,
    },
  ]

  for (const def of deptAgents) {
    const [agent] = await db
      .insert(agents)
      .values({
        companyId: company.id,
        userId: ceo.id,
        ...def,
        status: 'offline',
      })
      .returning()
    console.log(`  ✓ 에이전트: ${agent.name} → ${ceo.name}`)
  }

  // 6. 내장 도구 (핸들러 등록됨)
  const builtinTools = [
    {
      name: 'get_current_time',
      description: '현재 시각(KST)을 반환합니다',
      handler: 'get_current_time',
      scope: 'platform' as const,
      inputSchema: { type: 'object', properties: {} },
      category: 'utility',
      tags: ['builtin'],
    },
    {
      name: 'calculate',
      description: '수학 수식을 계산합니다',
      handler: 'calculate',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { expression: { type: 'string', description: '계산할 수식 (예: 2+3*4)' } },
        required: ['expression'],
      },
      category: 'utility',
      tags: ['builtin', 'math'],
    },
    {
      name: 'search_department_knowledge',
      description: '부서 지식 베이스에서 정보를 검색합니다',
      handler: 'search_department_knowledge',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '검색어' } },
        required: ['query'],
      },
      category: 'search',
      tags: ['builtin', 'internal'],
    },
    {
      name: 'get_company_info',
      description: '회사 기본 정보를 조회합니다',
      handler: 'get_company_info',
      scope: 'platform' as const,
      inputSchema: { type: 'object', properties: {} },
      category: 'utility',
      tags: ['builtin', 'internal'],
    },
    {
      name: 'search_web',
      description: '웹에서 정보를 검색합니다',
      handler: 'search_web',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '검색어' } },
        required: ['query'],
      },
      category: 'search',
      tags: ['web', 'api', 'serper'],
    },
    {
      name: 'search_news',
      description: '최신 뉴스를 검색합니다',
      handler: 'search_news',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '검색어' } },
        required: ['query'],
      },
      category: 'search',
      tags: ['web', 'api', 'serper', 'news'],
    },
    {
      name: 'search_images',
      description: '이미지를 검색합니다',
      handler: 'search_images',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '검색어' } },
        required: ['query'],
      },
      category: 'search',
      tags: ['web', 'api', 'serper', 'image'],
    },
    {
      name: 'search_youtube',
      description: '유튜브 영상을 검색합니다',
      handler: 'search_youtube',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '검색어' } },
        required: ['query'],
      },
      category: 'search',
      tags: ['web', 'api', 'serper', 'video'],
    },
    {
      name: 'search_places',
      description: '장소(가게, 식당 등)를 검색합니다',
      handler: 'search_places',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '검색어' } },
        required: ['query'],
      },
      category: 'search',
      tags: ['web', 'api', 'serper', 'local'],
    },
    {
      name: 'create_report',
      description: '보고서를 자동 생성합니다',
      handler: 'create_report',
      scope: 'platform' as const,
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '보고서 제목 (200자 이내)' },
          content: { type: 'string', description: '보고서 본문 (마크다운, 50000자 이내)' },
        },
        required: ['title'],
      },
      category: 'content',
      tags: ['builtin', 'report'],
    },
  ]

  for (const def of builtinTools) {
    const [tool] = await db
      .insert(toolDefinitions)
      .values({
        companyId: null,
        name: def.name,
        description: def.description,
        handler: def.handler,
        scope: def.scope,
        inputSchema: def.inputSchema,
        category: def.category,
        tags: def.tags,
      })
      .returning()
    console.log(`  ✓ 내장 도구: ${tool.name} (handler: ${def.handler})`)
  }

  // 7. 외부 서비스 도구 (Epic 9에서 순차 구현)
  const externalTools = [
    {
      name: 'send_email',
      description: 'SMTP를 통해 이메일을 발송합니다',
      handler: 'send_email',
      scope: 'platform' as const,
      category: 'communication',
      tags: ['email', 'smtp', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: '받는 사람 이메일 주소' },
          subject: { type: 'string', description: '이메일 제목' },
          body: { type: 'string', description: '이메일 본문 (텍스트)' },
        },
        required: ['to', 'subject'],
      },
    },
    {
      name: 'list_calendar_events',
      description: '구글 캘린더 일정을 조회합니다',
      handler: 'list_calendar_events',
      scope: 'platform' as const,
      category: 'utility',
      tags: ['calendar', 'google', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          days: { type: 'number', description: '조회할 일수 (기본 7일)' },
        },
      },
    },
    {
      name: 'create_calendar_event',
      description: '구글 캘린더에 새 일정을 생성합니다',
      handler: 'create_calendar_event',
      scope: 'platform' as const,
      category: 'utility',
      tags: ['calendar', 'google', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '일정 제목' },
          startTime: { type: 'string', description: '시작 시간 (ISO 8601, 예: 2026-03-05T10:00:00+09:00)' },
          endTime: { type: 'string', description: '종료 시간 (ISO 8601)' },
          description: { type: 'string', description: '일정 설명 (선택)' },
          location: { type: 'string', description: '장소 (선택)' },
        },
        required: ['title', 'startTime', 'endTime'],
      },
    },
    {
      name: 'read_notion_page',
      description: '노션 페이지 내용을 읽어옵니다',
      handler: 'read_notion_page',
      scope: 'platform' as const,
      category: 'content',
      tags: ['notion', 'api', 'document'],
      inputSchema: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: '노션 페이지 ID' },
        },
        required: ['pageId'],
      },
    },
    {
      name: 'create_notion_page',
      description: '노션에 새 페이지를 생성합니다',
      handler: 'create_notion_page',
      scope: 'platform' as const,
      category: 'content',
      tags: ['notion', 'api', 'document'],
      inputSchema: {
        type: 'object',
        properties: {
          parentId: { type: 'string', description: '부모 페이지 ID' },
          title: { type: 'string', description: '페이지 제목' },
          content: { type: 'string', description: '페이지 내용 (텍스트)' },
        },
        required: ['parentId', 'title'],
      },
    },
    {
      name: 'generate_text_file',
      description: '텍스트/마크다운/CSV 파일 내용을 생성합니다',
      handler: 'generate_text_file',
      scope: 'platform' as const,
      category: 'content',
      tags: ['file', 'text', 'builtin'],
      inputSchema: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: '파일명 (예: report.md)' },
          content: { type: 'string', description: '파일 내용' },
          format: { type: 'string', description: '형식: text, markdown, csv (기본 text)' },
        },
        required: ['content'],
      },
    },
    {
      name: 'get_stock_price',
      description: '주식 종목 현재가/등락률/거래량을 조회합니다',
      handler: 'get_stock_price',
      scope: 'platform' as const,
      category: 'finance',
      tags: ['kis', 'stock', 'api', 'market'],
      inputSchema: {
        type: 'object',
        properties: {
          stockCode: { type: 'string', description: '종목코드 (예: 005930)' },
        },
        required: ['stockCode'],
      },
    },
    {
      name: 'get_account_balance',
      description: '증권 계좌 잔고(보유종목, 평가금액)를 조회합니다',
      handler: 'get_account_balance',
      scope: 'platform' as const,
      category: 'finance',
      tags: ['kis', 'stock', 'api', 'account'],
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'place_stock_order',
      description: '주식 매수/매도 주문을 실행합니다',
      handler: 'place_stock_order',
      scope: 'platform' as const,
      category: 'finance',
      tags: ['kis', 'stock', 'api', 'trading'],
      inputSchema: {
        type: 'object',
        properties: {
          stockCode: { type: 'string', description: '종목코드 (예: 005930)' },
          side: { type: 'string', description: '매수/매도 (buy 또는 sell)' },
          quantity: { type: 'number', description: '주문 수량' },
          price: { type: 'number', description: '주문 가격 (0이면 시장가)' },
        },
        required: ['stockCode', 'side', 'quantity'],
      },
    },
    {
      name: 'text_to_speech',
      description: '텍스트를 음성(MP3)으로 변환합니다',
      handler: 'text_to_speech',
      scope: 'platform' as const,
      category: 'utility',
      tags: ['tts', 'voice', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '변환할 텍스트 (5000자 이내)' },
          language: { type: 'string', description: '언어 코드 (기본 ko-KR)' },
          speed: { type: 'number', description: '속도 (기본 1.0)' },
        },
        required: ['text'],
      },
    },
    {
      name: 'generate_image',
      description: 'AI로 이미지를 생성합니다 (DALL-E)',
      handler: 'generate_image',
      scope: 'platform' as const,
      category: 'content',
      tags: ['openai', 'image', 'ai', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: '이미지 설명 (영어 권장)' },
          size: { type: 'string', description: '크기: 1024x1024, 1024x1792, 1792x1024 (기본 1024x1024)' },
        },
        required: ['prompt'],
      },
    },
    {
      name: 'translate_text',
      description: '텍스트를 다른 언어로 번역합니다',
      handler: 'translate_text',
      scope: 'platform' as const,
      category: 'utility',
      tags: ['translate', 'google', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '번역할 텍스트' },
          target: { type: 'string', description: '대상 언어 코드 (예: en, ja, zh, ko)' },
          source: { type: 'string', description: '원본 언어 코드 (미입력 시 자동 감지)' },
        },
        required: ['text'],
      },
    },
    {
      name: 'publish_instagram',
      description: '인스타그램에 이미지 게시물을 발행합니다',
      handler: 'publish_instagram',
      scope: 'platform' as const,
      category: 'content',
      tags: ['instagram', 'sns', 'api'],
      inputSchema: {
        type: 'object',
        properties: {
          imageUrl: { type: 'string', description: '게시할 이미지 URL' },
          caption: { type: 'string', description: '게시물 캡션' },
        },
        required: ['imageUrl'],
      },
    },
    {
      name: 'get_instagram_insights',
      description: '인스타그램 계정 통계(팔로워, 노출, 도달)를 조회합니다',
      handler: 'get_instagram_insights',
      scope: 'platform' as const,
      category: 'utility',
      tags: ['instagram', 'sns', 'api', 'analytics'],
      inputSchema: { type: 'object', properties: {} },
    },
  ]

  for (const def of externalTools) {
    const values: Record<string, unknown> = {
      companyId: ('companyId' in def ? def.companyId : null) ?? null,
      name: def.name,
      description: def.description,
      scope: def.scope,
    }
    if ('handler' in def) values.handler = def.handler
    if ('inputSchema' in def) values.inputSchema = def.inputSchema
    if ('category' in def) values.category = def.category
    if ('tags' in def) values.tags = def.tags

    const [tool] = await db
      .insert(toolDefinitions)
      .values(values)
      .returning()
    console.log(`  ✓ 외부 도구: ${tool.name}${('handler' in def) ? ` (handler: ${def.handler})` : ''}`)
  }

  // 8. 전략실 관심 종목 (CEO 기본 워치리스트)
  const watchlistStocks = [
    { stockCode: '005930', stockName: '삼성전자', market: 'KOSPI' },
    { stockCode: '000660', stockName: 'SK하이닉스', market: 'KOSPI' },
    { stockCode: '035420', stockName: 'NAVER', market: 'KOSPI' },
    { stockCode: '035720', stockName: '카카오', market: 'KOSPI' },
    { stockCode: '373220', stockName: 'LG에너지솔루션', market: 'KOSPI' },
    { stockCode: '006400', stockName: '삼성SDI', market: 'KOSPI' },
    { stockCode: '051910', stockName: 'LG화학', market: 'KOSPI' },
    { stockCode: '068270', stockName: '셀트리온', market: 'KOSPI' },
    { stockCode: '207940', stockName: '삼성바이오로직스', market: 'KOSPI' },
    { stockCode: '005380', stockName: '현대자동차', market: 'KOSPI' },
  ]

  for (const stock of watchlistStocks) {
    await db.insert(strategyWatchlists).values({
      companyId: company.id,
      userId: ceo.id,
      ...stock,
    })
  }
  console.log(`  ✓ 전략실 관심 종목: ${watchlistStocks.length}개`)

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
