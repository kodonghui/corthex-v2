/**
 * QA 기능 검증 — Story 18-4 MCP 보안
 * 사용자 시나리오 기반 + 엣지 케이스 확인
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { isPrivateUrl } from '../../lib/mcp-client'
import { checkMcpRateLimit } from '../../lib/mcp-rate-limit'

// ============================================================
// QA-1: 관리자 전용 라우트 — 코드 구조 검증
// ============================================================
describe('QA: 관리자 전용 라우트 구조 검증', () => {
  let code: string

  beforeEach(async () => {
    const fs = await import('fs')
    code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')
  })

  test('authMiddleware가 전체에 적용됨', () => {
    expect(code).toContain("settingsMcpRoute.use('*', authMiddleware)")
  })

  test('POST /mcp (등록)은 관리자 전용', () => {
    // adminOnly가 zValidator 전에 위치해야 함
    const postMatch = code.match(/settingsMcpRoute\.post\('\/mcp',\s*adminOnly,\s*zValidator/)
    expect(postMatch).not.toBeNull()
  })

  test('DELETE /mcp/:id (삭제)는 관리자 전용', () => {
    expect(code).toContain("settingsMcpRoute.delete('/mcp/:id', adminOnly,")
  })

  test('POST /mcp/test (연결 테스트)는 관리자 전용', () => {
    expect(code).toContain("settingsMcpRoute.post('/mcp/test', adminOnly,")
  })

  test('GET /mcp (목록 조회)에는 adminOnly 없음', () => {
    // GET /mcp 라우트에 adminOnly가 포함되지 않아야 함
    const getLine = code.split('\n').find(l => l.includes("settingsMcpRoute.get('/mcp',"))
    expect(getLine).toBeDefined()
    expect(getLine).not.toContain('adminOnly')
  })

  test('POST /mcp/execute (도구 실행)에는 adminOnly 없음', () => {
    const execLine = code.split('\n').find(l => l.includes("settingsMcpRoute.post('/mcp/execute',"))
    expect(execLine).toBeDefined()
    expect(execLine).not.toContain('adminOnly')
  })

  test('GET /mcp/:id/ping (상태 확인)에는 adminOnly 없음', () => {
    const pingLine = code.split('\n').find(l => l.includes("settingsMcpRoute.get('/mcp/:id/ping',"))
    expect(pingLine).toBeDefined()
    expect(pingLine).not.toContain('adminOnly')
  })

  test('GET /mcp/:id/tools (도구 목록)에는 adminOnly 없음', () => {
    const toolsLine = code.split('\n').find(l => l.includes("settingsMcpRoute.get('/mcp/:id/tools',"))
    expect(toolsLine).toBeDefined()
    expect(toolsLine).not.toContain('adminOnly')
  })
})

// ============================================================
// QA-2: SSRF 방지 — 실제 공격 시나리오
// ============================================================
describe('QA: SSRF 방지 — 공격 시나리오', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv
    } else {
      delete process.env.NODE_ENV
    }
  })

  test('AWS EC2 메타데이터 토큰 탈취 시도 차단', () => {
    expect(isPrivateUrl('http://169.254.169.254/latest/api/token')).toBe(true)
  })

  test('AWS IAM 크리덴셜 탈취 시도 차단', () => {
    expect(isPrivateUrl('http://169.254.169.254/latest/meta-data/iam/security-credentials/')).toBe(true)
  })

  test('GCP 서비스 어카운트 토큰 탈취 시도 차단', () => {
    expect(isPrivateUrl('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token')).toBe(true)
  })

  test('내부 서비스 포트 스캔 시도 차단', () => {
    expect(isPrivateUrl('http://10.0.0.1:6379/KEYS*')).toBe(true) // Redis
    expect(isPrivateUrl('http://10.0.0.1:5432/')).toBe(true) // PostgreSQL
    expect(isPrivateUrl('http://192.168.1.1:3306/')).toBe(true) // MySQL
    expect(isPrivateUrl('http://172.16.0.1:27017/')).toBe(true) // MongoDB
  })

  test('production에서 localhost 데이터베이스 접근 시도 차단', () => {
    process.env.NODE_ENV = 'production'
    expect(isPrivateUrl('http://localhost:5432/')).toBe(true)
    expect(isPrivateUrl('http://127.0.0.1:6379/')).toBe(true)
    expect(isPrivateUrl('http://0.0.0.0:9200/')).toBe(true) // Elasticsearch
  })

  test('file: 프로토콜로 파일 읽기 시도 차단', () => {
    expect(isPrivateUrl('file:///etc/passwd')).toBe(true)
    expect(isPrivateUrl('file:///etc/shadow')).toBe(true)
  })

  test('정상 MCP 서버 URL은 허용', () => {
    expect(isPrivateUrl('https://mcp.example.com/v1')).toBe(false)
    expect(isPrivateUrl('https://api.openai.com/mcp')).toBe(false)
    expect(isPrivateUrl('https://34.120.0.1/mcp')).toBe(false)
  })
})

// ============================================================
// QA-3: Rate Limit — 사용자 시나리오
// ============================================================
describe('QA: Rate Limit — 사용자 시나리오', () => {
  test('일반 사용 패턴: 5회 연속 호출은 문제 없음', () => {
    const userId = `qa-normal-${Date.now()}`
    for (let i = 0; i < 5; i++) {
      const result = checkMcpRateLimit(userId)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    }
  })

  test('과도한 사용: 20회 초과 시 거부 + 적절한 대기 시간', () => {
    const userId = `qa-heavy-${Date.now()}`
    for (let i = 0; i < 20; i++) {
      checkMcpRateLimit(userId)
    }

    const denied = checkMcpRateLimit(userId)
    expect(denied.allowed).toBe(false)
    expect(denied.retryAfterSec).toBeGreaterThan(0)
    expect(denied.retryAfterSec).toBeLessThanOrEqual(60)
  })

  test('서로 다른 팀원은 서로 영향 없음', () => {
    const base = Date.now()
    const users = Array.from({ length: 5 }, (_, i) => `qa-team-${i}-${base}`)

    // 각 유저가 15회씩 사용
    for (const userId of users) {
      for (let i = 0; i < 15; i++) {
        const result = checkMcpRateLimit(userId)
        expect(result.allowed).toBe(true)
      }
    }

    // 모든 유저가 여전히 5회 여유
    for (const userId of users) {
      const result = checkMcpRateLimit(userId)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    }
  })
})

// ============================================================
// QA-4: 감사 로그 — 라우트별 로그 액션 확인
// ============================================================
describe('QA: 감사 로그 — 라우트별 로그 액션', () => {
  let routeCode: string
  let aiCode: string

  beforeEach(async () => {
    const fs = await import('fs')
    routeCode = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')
    aiCode = fs.readFileSync('packages/server/src/lib/ai.ts', 'utf8')
  })

  test('서버 등록 시 mcp-server-register 로그', () => {
    expect(routeCode).toContain("action: 'mcp-server-register'")
    // 등록 로그에 서버 이름, URL, ID 포함
    const registerSection = routeCode.split("action: 'mcp-server-register'")[1]?.slice(0, 200)
    expect(registerSection).toContain('serverName')
    expect(registerSection).toContain('url')
  })

  test('서버 삭제 시 mcp-server-delete 로그', () => {
    expect(routeCode).toContain("action: 'mcp-server-delete'")
    const deleteSection = routeCode.split("action: 'mcp-server-delete'")[1]?.slice(0, 200)
    expect(deleteSection).toContain('serverName')
  })

  test('도구 실행(라우트) 시 mcp-tool-execute 로그 — 성공과 실패 모두', () => {
    // POST /mcp/execute에서 성공/실패 양쪽에 로그
    const execLogCount = (routeCode.match(/action: 'mcp-tool-execute'/g) || []).length
    expect(execLogCount).toBeGreaterThanOrEqual(2) // 성공 + 실패
  })

  test('도구 실행(채팅) 시 mcp-tool-execute 로그 — sync + stream', () => {
    const aiLogCount = (aiCode.match(/action: 'mcp-tool-execute'/g) || []).length
    expect(aiLogCount).toBeGreaterThanOrEqual(4) // sync 성공+실패 + stream 성공+실패
  })

  test('감사 로그에 actorType이 user로 설정됨', () => {
    const routeActorCount = (routeCode.match(/actorType: 'user'/g) || []).length
    expect(routeActorCount).toBeGreaterThanOrEqual(4) // register + delete + execute 성공 + execute 실패
  })
})

// ============================================================
// QA-5: 응답 크기 제한 — mcp-client.ts 코드 확인
// ============================================================
describe('QA: 응답 크기 제한 코드 확인', () => {
  test('MCP_MAX_RESULT_SIZE 상수 정의됨', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/lib/mcp-client.ts', 'utf8')
    expect(code).toContain('MCP_MAX_RESULT_SIZE')
    expect(code).toContain('102_400')
  })

  test('extractTextFromResult에서 크기 제한 적용', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/lib/mcp-client.ts', 'utf8')
    expect(code).toContain('MCP_MAX_RESULT_SIZE')
    expect(code).toContain('결과가 100KB를 초과하여 잘렸습니다')
  })
})

// ============================================================
// QA-6: Rate Limit — 429 응답 코드 확인
// ============================================================
describe('QA: Rate Limit — HTTP 응답 코드', () => {
  test('settings-mcp.ts에서 429 상태 코드 사용', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')
    expect(code).toContain('429')
    expect(code).toContain("'MCP_003'")
  })

  test('Retry-After 헤더 설정됨', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')
    expect(code).toContain("c.header('Retry-After'")
  })

  test('ai.ts에서 rate limit 초과 시 에러 메시지 반환', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/lib/ai.ts', 'utf8')
    expect(code).toContain('MCP 도구 실행 속도 제한 (분당 20회)')
  })
})

// ============================================================
// QA-7: 프론트엔드 UI — 권한 기반 렌더링
// ============================================================
describe('QA: 프론트엔드 UI — 권한 기반 렌더링', () => {
  let code: string

  beforeEach(async () => {
    const fs = await import('fs')
    code = fs.readFileSync('packages/app/src/components/settings/settings-mcp.tsx', 'utf8')
  })

  test('useAuthStore에서 사용자 정보를 가져옴', () => {
    expect(code).toContain("useAuthStore")
    expect(code).toContain("s.user")
  })

  test('isAdmin 변수가 role 기반으로 설정됨', () => {
    expect(code).toContain("user?.role === 'admin'")
  })

  test('서버 추가 버튼이 isAdmin 조건부', () => {
    // {isAdmin && ( 패턴으로 서버 추가 버튼 감싸기
    expect(code).toContain("{isAdmin &&")
  })

  test('삭제 버튼이 isAdmin 조건부', () => {
    // ServerCard 내부에서 isAdmin으로 삭제 버튼 조건부
    expect(code).toContain("{isAdmin && (")
  })

  test('HTTP URL 경고 메시지 존재', () => {
    expect(code).toContain("server.url.startsWith('http://')")
    expect(code).toContain('HTTPS')
  })

  test('ServerCard에 isAdmin prop 전달', () => {
    expect(code).toContain("isAdmin={isAdmin}")
  })
})

// ============================================================
// QA-8: SSRF — isPrivateUrl 함수 안전한 기본값
// ============================================================
describe('QA: isPrivateUrl 안전한 기본값', () => {
  test('잘못된 URL은 차단 (안전한 기본값)', () => {
    expect(isPrivateUrl('')).toBe(true)
    expect(isPrivateUrl('not-a-url')).toBe(true)
    expect(isPrivateUrl('://missing-protocol')).toBe(true)
  })

  test('null/undefined 같은 입력 처리', () => {
    // TypeScript에서 타입으로 방지되지만 런타임 방어 확인
    expect(isPrivateUrl('undefined')).toBe(true) // 파싱 실패
    expect(isPrivateUrl('null')).toBe(true) // 파싱 실패
  })
})
