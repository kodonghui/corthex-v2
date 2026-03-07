// E4-S4 시드: 도메인 도구 15종 tool_definitions 등록
// 실행: bun run src/db/seed-domain-tools.ts

import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_OhRoVyUD5Qw3@ep-muddy-violet-a1f8np47-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

const domainTools = [
  // === Analysis (Finance) ===
  {
    name: 'get_stock_price',
    description: '한국 주식 실시간 시세를 조회합니다 (KIS 증권 API).',
    handler: 'get_stock_price',
    category: 'finance',
    tags: ['stock', 'price', 'api', 'kis'],
    inputSchema: {
      type: 'object',
      properties: {
        stockCode: { type: 'string', description: '종목코드 (예: 005930 삼성전자)' },
      },
      required: ['stockCode'],
    },
  },
  {
    name: 'search_news',
    description: '최신 뉴스를 검색합니다 (Serper API).',
    handler: 'search_news',
    category: 'analysis',
    tags: ['news', 'search', 'api'],
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '뉴스 검색어' },
      },
      required: ['query'],
    },
  },
  {
    name: 'sentiment_analyzer',
    description: '한국어 텍스트의 감정(긍정/부정/중립)을 분석합니다. 한국어 감정 사전 기반.',
    handler: 'sentiment_analyzer',
    category: 'analysis',
    tags: ['sentiment', 'nlp', 'korean', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['analyze', 'batch'], description: '수행할 작업' },
        text: { type: 'string', description: '분석할 텍스트 (analyze용)' },
        texts: { type: 'array', items: { type: 'string' }, description: '분석할 텍스트 배열 (batch용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'company_analyzer',
    description: '한국 기업 정보를 DART OpenAPI로 조회합니다 (기업 정보, 공시).',
    handler: 'company_analyzer',
    category: 'finance',
    tags: ['company', 'dart', 'api', 'finance'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['info', 'disclosures'], description: '수행할 작업' },
        company: { type: 'string', description: '회사명 (info용)' },
        corp_code: { type: 'string', description: '회사코드 (disclosures용)' },
        count: { type: 'number', description: '조회 건수 (기본: 10)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'market_overview',
    description: '국내외 시장 지수 개요를 조회합니다 (KOSPI, KOSDAQ, 글로벌 지수).',
    handler: 'market_overview',
    category: 'finance',
    tags: ['market', 'index', 'api'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['domestic', 'global', 'search'], description: '수행할 작업' },
        query: { type: 'string', description: '검색어 (global/search용)' },
      },
      required: ['action'],
    },
  },
  // === Legal ===
  {
    name: 'law_search',
    description: '한국 법령/판례를 검색합니다 (국가법령정보센터 API).',
    handler: 'law_search',
    category: 'legal',
    tags: ['law', 'legal', 'api', 'korean'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['law', 'precedent'], description: '수행할 작업 (법령/판례)' },
        query: { type: 'string', description: '검색어' },
        count: { type: 'number', description: '결과 수 (기본: 10)' },
      },
      required: ['action', 'query'],
    },
  },
  {
    name: 'contract_reviewer',
    description: '계약서 텍스트를 분석하여 위험 조항, 누락 조항을 검출합니다.',
    handler: 'contract_reviewer',
    category: 'legal',
    tags: ['contract', 'legal', 'review', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['review', 'checklist'], description: '수행할 작업' },
        text: { type: 'string', description: '계약서 텍스트 (review용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'trademark_similarity',
    description: '두 상표명의 시각적/음성적 유사도를 분석합니다 (한글 자모 분해).',
    handler: 'trademark_similarity',
    category: 'legal',
    tags: ['trademark', 'similarity', 'korean', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['check', 'batch'], description: '수행할 작업' },
        name1: { type: 'string', description: '첫 번째 상표명 (check용)' },
        name2: { type: 'string', description: '두 번째 상표명 (check용)' },
        name: { type: 'string', description: '기준 상표명 (batch용)' },
        candidates: { type: 'array', items: { type: 'string' }, description: '비교 대상 배열 (batch용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'patent_search',
    description: '특허/상표를 검색합니다 (KIPRIS API).',
    handler: 'patent_search',
    category: 'legal',
    tags: ['patent', 'trademark', 'api', 'kipris'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['search', 'trademark'], description: '수행할 작업 (특허/상표)' },
        query: { type: 'string', description: '검색어' },
        count: { type: 'number', description: '결과 수 (기본: 10)' },
      },
      required: ['action', 'query'],
    },
  },
  // === Tech ===
  {
    name: 'uptime_monitor',
    description: '웹사이트 가동 상태와 응답 시간을 확인합니다.',
    handler: 'uptime_monitor',
    category: 'tech',
    tags: ['uptime', 'monitoring', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['check', 'batch'], description: '수행할 작업' },
        url: { type: 'string', description: 'URL (check용)' },
        urls: { type: 'array', items: { type: 'string' }, description: 'URL 배열 (batch용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'security_scanner',
    description: '패키지 보안 취약점(CVE)을 검사합니다 (OSV API).',
    handler: 'security_scanner',
    category: 'tech',
    tags: ['security', 'vulnerability', 'api', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['check_package', 'scan'], description: '수행할 작업' },
        package: { type: 'string', description: '패키지명 (check_package용)' },
        version: { type: 'string', description: '버전 (check_package용)' },
        ecosystem: { type: 'string', description: '에코시스템 (npm/pypi/maven, 기본: npm)' },
        packages: { type: 'array', description: '패키지 배열 (scan용) [{name, version, ecosystem?}]' },
      },
      required: ['action'],
    },
  },
  {
    name: 'code_quality',
    description: '코드 품질을 분석합니다 (복잡도, 네이밍, 메트릭스).',
    handler: 'code_quality',
    category: 'tech',
    tags: ['code', 'quality', 'analysis', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['analyze', 'naming', 'metrics', 'all'], description: '수행할 작업' },
        code: { type: 'string', description: '분석할 코드' },
      },
      required: ['action', 'code'],
    },
  },
  {
    name: 'dns_lookup',
    description: 'DNS 레코드를 조회합니다 (A, AAAA, MX, NS, TXT, CNAME).',
    handler: 'dns_lookup',
    category: 'tech',
    tags: ['dns', 'network', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['lookup', 'mx', 'txt', 'ns', 'all'], description: '수행할 작업' },
        hostname: { type: 'string', description: '도메인명 (예: example.com)' },
      },
      required: ['action', 'hostname'],
    },
  },
  {
    name: 'ssl_checker',
    description: 'SSL/TLS 인증서의 유효성, 만료일, 발급자를 확인합니다.',
    handler: 'ssl_checker',
    category: 'tech',
    tags: ['ssl', 'tls', 'certificate', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['check'], description: '수행할 작업' },
        hostname: { type: 'string', description: '호스트명 (예: google.com)' },
        port: { type: 'number', description: '포트 (기본: 443)' },
      },
      required: ['hostname'],
    },
  },
  {
    name: 'get_instagram_insights',
    description: '인스타그램 비즈니스 계정의 인사이트를 조회합니다 (팔로워, 노출, 도달).',
    handler: 'get_instagram_insights',
    category: 'analysis',
    tags: ['instagram', 'social', 'api'],
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

async function seedDomainTools() {
  console.log('🔧 도메인 도구 15종 시드 시작...')

  for (const t of domainTools) {
    const existing = await sql`SELECT id FROM tool_definitions WHERE name = ${t.name} AND scope = 'platform'`
    if (existing.length > 0) {
      await sql`UPDATE tool_definitions
        SET description = ${t.description},
            handler = ${t.handler},
            input_schema = ${JSON.stringify(t.inputSchema)},
            category = ${t.category},
            tags = ${JSON.stringify(t.tags)},
            updated_at = NOW()
        WHERE id = ${existing[0].id}`
      console.log(`  ✏ 도구 업데이트: ${t.name}`)
      continue
    }

    const [tool] = await sql`INSERT INTO tool_definitions
      (name, description, scope, handler, input_schema, category, tags, is_active)
      VALUES (${t.name}, ${t.description}, 'platform', ${t.handler}, ${JSON.stringify(t.inputSchema)}, ${t.category}, ${JSON.stringify(t.tags)}, true)
      RETURNING id, name`
    console.log(`  ✓ 도구 추가: ${tool.name} (${tool.id})`)
  }

  const toolCount = await sql`SELECT COUNT(*) as cnt FROM tool_definitions WHERE scope = 'platform' AND is_active = true`
  console.log(`\n📊 플랫폼 도구 총 ${toolCount[0].cnt}개 등록됨`)
  console.log('\n✅ 도메인 도구 15종 시드 완료!')
}

seedDomainTools().catch(console.error)
