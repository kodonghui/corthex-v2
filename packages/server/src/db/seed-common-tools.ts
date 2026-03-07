// E4-S3 시드: 공통 도구 15종 tool_definitions 등록
// 실행: bun run src/db/seed-common-tools.ts

import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://neondb_owner:npg_OhRoVyUD5Qw3@ep-muddy-violet-a1f8np47-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

const commonTools = [
  {
    name: 'get_current_time',
    description: '현재 날짜와 시간을 조회합니다 (한국 시간 KST 포함)',
    handler: 'get_current_time',
    category: 'utility',
    tags: ['time', 'free'],
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'calculate',
    description: '수학 계산을 수행합니다. 사칙연산, 거듭제곱, 괄호 지원.',
    handler: 'calculate',
    category: 'utility',
    tags: ['math', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: '계산할 수식 (예: "100 * 1.1", "2^10")' },
      },
      required: ['expression'],
    },
  },
  {
    name: 'search_web',
    description: '웹에서 정보를 검색합니다. Serper API를 통한 Google 검색 결과를 반환합니다.',
    handler: 'search_web',
    category: 'search',
    tags: ['web', 'api', 'search'],
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '검색할 키워드' },
      },
      required: ['query'],
    },
  },
  {
    name: 'translate_text',
    description: '텍스트를 다른 언어로 번역합니다.',
    handler: 'translate_text',
    category: 'content',
    tags: ['translation', 'api'],
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '번역할 텍스트' },
        target_language: { type: 'string', description: '대상 언어 (예: en, ko, ja, zh)' },
        source_language: { type: 'string', description: '원본 언어 (자동 감지 시 생략)' },
      },
      required: ['text', 'target_language'],
    },
  },
  {
    name: 'send_email',
    description: 'SMTP를 통해 이메일을 발송합니다.',
    handler: 'send_email',
    category: 'communication',
    tags: ['email', 'api'],
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: '수신자 이메일' },
        subject: { type: 'string', description: '이메일 제목' },
        body: { type: 'string', description: '이메일 본문' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'spreadsheet_tool',
    description: 'CSV/TSV 데이터를 파싱, 필터링, 정렬, 집계합니다.',
    handler: 'spreadsheet_tool',
    category: 'utility',
    tags: ['data', 'csv', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['parse', 'filter', 'sort', 'aggregate', 'to_csv'], description: '수행할 작업' },
        data: { type: 'string', description: 'CSV/TSV 형식의 텍스트 데이터' },
        column: { type: 'string', description: '대상 열 이름 (filter/sort/aggregate용)' },
        value: { type: 'string', description: '필터 값 (filter용)' },
        order: { type: 'string', enum: ['asc', 'desc'], description: '정렬 순서 (sort용)' },
        operation: { type: 'string', enum: ['sum', 'avg', 'min', 'max', 'count'], description: '집계 연산 (aggregate용)' },
        delimiter: { type: 'string', description: '구분자 (auto/,/;/\\t)' },
      },
      required: ['action', 'data'],
    },
  },
  {
    name: 'chart_generator',
    description: '차트 데이터를 구조화된 JSON으로 생성합니다. (bar/line/pie/scatter)',
    handler: 'chart_generator',
    category: 'utility',
    tags: ['chart', 'visualization', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['bar', 'line', 'pie', 'scatter', 'doughnut'], description: '차트 유형' },
        title: { type: 'string', description: '차트 제목' },
        labels: { description: '라벨 배열 또는 쉼표 구분 문자열' },
        data: { description: '숫자 배열 또는 쉼표 구분 문자열, 또는 CSV 데이터' },
        datasets: { type: 'array', description: '복수 데이터셋 배열 [{label, data}]' },
      },
      required: ['type'],
    },
  },
  {
    name: 'file_manager',
    description: '텍스트 파일 내용을 생성하거나 템플릿을 제공합니다.',
    handler: 'file_manager',
    category: 'utility',
    tags: ['file', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['generate', 'list_formats', 'template'], description: '수행할 작업' },
        filename: { type: 'string', description: '파일명 (generate용)' },
        content: { type: 'string', description: '파일 내용 (generate용)' },
        format: { type: 'string', enum: ['text', 'markdown', 'csv', 'json', 'html', 'yaml'], description: '파일 형식' },
        template: { type: 'string', enum: ['report', 'meeting', 'email'], description: '템플릿 종류 (template용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'date_utils',
    description: '날짜 계산, 포맷팅, 시간대 변환, 날짜 차이 계산 등을 수행합니다.',
    handler: 'date_utils',
    category: 'utility',
    tags: ['date', 'time', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['now', 'format', 'diff', 'add', 'parse'], description: '수행할 작업' },
        date: { type: 'string', description: '날짜 문자열 (ISO 8601)' },
        from: { type: 'string', description: '시작 날짜 (diff용)' },
        to: { type: 'string', description: '종료 날짜 (diff용)' },
        format: { type: 'string', description: '날짜 형식 (예: YYYY-MM-DD HH:mm:ss)' },
        timezone: { type: 'string', description: '시간대 (KST, UTC, EST 등)' },
        days: { type: 'number', description: '추가할 일수 (add용)' },
        months: { type: 'number', description: '추가할 월수 (add용)' },
        years: { type: 'number', description: '추가할 연수 (add용)' },
        text: { type: 'string', description: '파싱할 날짜 텍스트 (parse용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'json_parser',
    description: 'JSON 데이터를 파싱, 경로 조회, 키 목록, 평탄화, 유효성 검증합니다.',
    handler: 'json_parser',
    category: 'utility',
    tags: ['json', 'data', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['parse', 'query', 'keys', 'flatten', 'validate'], description: '수행할 작업' },
        data: { type: 'string', description: 'JSON 문자열' },
        path: { type: 'string', description: '조회 경로 (예: users.0.name)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'text_summarizer',
    description: '텍스트 통계(단어수/문장수/읽기시간), 키워드 추출, 문장 추출, 스마트 요약을 수행합니다.',
    handler: 'text_summarizer',
    category: 'content',
    tags: ['text', 'analysis', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['stats', 'keywords', 'sentences', 'truncate'], description: '수행할 작업' },
        text: { type: 'string', description: '분석할 텍스트' },
        count: { type: 'number', description: '추출할 개수 (keywords/sentences용)' },
        max_length: { type: 'number', description: '최대 길이 (truncate용)' },
      },
      required: ['action', 'text'],
    },
  },
  {
    name: 'url_fetcher',
    description: 'URL의 내용을 가져오거나 HTML에서 텍스트를 추출합니다.',
    handler: 'url_fetcher',
    category: 'search',
    tags: ['web', 'http', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['get', 'head', 'extract_text'], description: '수행할 작업' },
        url: { type: 'string', description: 'URL (http:// 또는 https://)' },
      },
      required: ['url'],
    },
  },
  {
    name: 'markdown_converter',
    description: '마크다운을 일반 텍스트/HTML로 변환하거나, HTML을 마크다운으로, 배열을 테이블로 변환합니다.',
    handler: 'markdown_converter',
    category: 'content',
    tags: ['markdown', 'conversion', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['to_text', 'to_table', 'from_html', 'to_html'], description: '수행할 작업' },
        text: { type: 'string', description: '마크다운 텍스트 (to_text/to_html용)' },
        html: { type: 'string', description: 'HTML 텍스트 (from_html용)' },
        data: { type: 'string', description: 'JSON 배열 (to_table용)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'regex_matcher',
    description: '정규식 패턴 테스트, 매칭, 치환, 그룹 추출, 분할을 수행합니다.',
    handler: 'regex_matcher',
    category: 'utility',
    tags: ['regex', 'text', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['test', 'match', 'replace', 'extract', 'split', 'validate'], description: '수행할 작업' },
        pattern: { type: 'string', description: '정규식 패턴' },
        text: { type: 'string', description: '대상 텍스트' },
        flags: { type: 'string', description: '정규식 플래그 (기본: g)' },
        replacement: { type: 'string', description: '치환 문자열 (replace용)' },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'unit_converter',
    description: '단위 변환 (길이/무게/온도/데이터/시간/면적/부피/속도)을 수행합니다.',
    handler: 'unit_converter',
    category: 'utility',
    tags: ['conversion', 'math', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['convert', 'categories'], description: '수행할 작업' },
        value: { type: 'number', description: '변환할 값' },
        from: { type: 'string', description: '원본 단위 (예: km, kg, C)' },
        to: { type: 'string', description: '대상 단위 (예: mi, lb, F)' },
        category: { type: 'string', description: '카테고리 (자동 감지 가능)' },
      },
      required: ['action'],
    },
  },
  {
    name: 'random_generator',
    description: '랜덤 숫자, UUID, 문자열, 주사위, 동전 던지기, 항목 뽑기 등을 수행합니다.',
    handler: 'random_generator',
    category: 'utility',
    tags: ['random', 'free'],
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['number', 'uuid', 'string', 'pick', 'shuffle', 'coin', 'dice'], description: '수행할 작업' },
        min: { type: 'number', description: '최소값 (number용)' },
        max: { type: 'number', description: '최대값 (number용)' },
        count: { type: 'number', description: '생성 개수' },
        length: { type: 'number', description: '문자열 길이 (string용)' },
        charset: { type: 'string', enum: ['alphanumeric', 'alpha', 'numeric', 'hex', 'lowercase'], description: '문자셋 (string용)' },
        items: { type: 'array', description: '항목 배열 (pick/shuffle용)' },
        sides: { type: 'number', description: '주사위 면 수 (dice용, 기본: 6)' },
      },
      required: ['action'],
    },
  },
]

async function seedCommonTools() {
  console.log('🔧 공통 도구 15종 시드 시작...')

  for (const t of commonTools) {
    const existing = await sql`SELECT id FROM tool_definitions WHERE name = ${t.name} AND scope = 'platform'`
    if (existing.length > 0) {
      // 기존 도구 업데이트 (카테고리, 태그, input_schema)
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

  // 에이전트-도구 매핑: 모든 에이전트에 공통 도구 할당
  const companies = await sql`SELECT id FROM companies`
  for (const company of companies) {
    const agents = await sql`SELECT id, name FROM agents WHERE company_id = ${company.id}`
    const tools = await sql`SELECT id, name FROM tool_definitions WHERE scope = 'platform' AND is_active = true AND category IN ('utility', 'content', 'search')`

    for (const agent of agents) {
      for (const tool of tools) {
        const existing = await sql`SELECT id FROM agent_tools WHERE agent_id = ${agent.id} AND tool_id = ${tool.id}`
        if (existing.length > 0) continue
        await sql`INSERT INTO agent_tools (company_id, agent_id, tool_id, is_enabled)
          VALUES (${company.id}, ${agent.id}, ${tool.id}, true)`
      }
    }
    console.log(`  ✓ ${company.id} 회사 에이전트 ${agents.length}명에 도구 매핑 완료`)
  }

  console.log('\n✅ 공통 도구 15종 시드 완료!')
}

seedCommonTools().catch(console.error)
