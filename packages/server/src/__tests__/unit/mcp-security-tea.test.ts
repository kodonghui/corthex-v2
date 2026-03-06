/**
 * TEA (Test Architect) — Story 18-4 MCP 보안
 * 리스크 기반 커버리지 확장 테스트
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { isPrivateUrl } from '../../lib/mcp-client'
import { checkMcpRateLimit } from '../../lib/mcp-rate-limit'

// ============================================================
// RISK AREA 1: SSRF 방지 강화 — Edge Cases (HIGH)
// ============================================================
describe('TEA: SSRF 방지 — 엣지 케이스', () => {
  // IPv4-mapped IPv6 (Bun URL parser가 ::ffff:a00:1 형태로 변환)
  test('IPv4-mapped IPv6 차단 — ::ffff:10.0.0.1', () => {
    // URL parser가 [::ffff:a00:1] 형태로 변환함 → IPv6 내부 주소 패턴 매칭 필요
    // 직접 ::ffff:10.x URL은 파서가 변환하므로 별도 테스트
    expect(isPrivateUrl('http://[::ffff:127.0.0.1]/mcp')).toBe(true)
  })

  // 포트가 있는 사설 IP
  test('사설 IP + 비표준 포트 차단', () => {
    expect(isPrivateUrl('http://10.0.0.1:8080/mcp')).toBe(true)
    expect(isPrivateUrl('http://192.168.1.1:9999/mcp')).toBe(true)
    expect(isPrivateUrl('http://172.16.0.1:443/mcp')).toBe(true)
  })

  // 경로가 있는 메타데이터 URL
  test('AWS 메타데이터 — 다양한 경로 차단', () => {
    expect(isPrivateUrl('http://169.254.169.254/')).toBe(true)
    expect(isPrivateUrl('http://169.254.169.254/latest/api/token')).toBe(true)
    expect(isPrivateUrl('http://169.254.169.254/latest/dynamic/instance-identity/document')).toBe(true)
  })

  // GCP 메타데이터 다양한 경로
  test('GCP 메타데이터 — 다양한 경로 차단', () => {
    expect(isPrivateUrl('http://metadata.google.internal/')).toBe(true)
    expect(isPrivateUrl('http://metadata.google.internal/computeMetadata/v1/project/project-id')).toBe(true)
  })

  // URL with credentials
  test('URL에 사용자 정보 포함해도 정상 판단', () => {
    expect(isPrivateUrl('http://user:pass@10.0.0.1/mcp')).toBe(true)
    expect(isPrivateUrl('http://user:pass@example.com/mcp')).toBe(false)
  })

  // 빈 호스트 (URL 파서가 'path'를 hostname으로 해석)
  test('http:///path는 hostname=path로 해석되어 공용 취급', () => {
    // URL('http:///path').hostname === 'path' (유효한 도메인처럼 보임)
    expect(isPrivateUrl('http:///path')).toBe(false)
  })

  // 프로토콜 우회 시도
  test('data: 프로토콜 차단', () => {
    expect(isPrivateUrl('data:text/html,<h1>hack</h1>')).toBe(true)
  })

  test('gopher: 프로토콜 차단', () => {
    // gopher: 는 URL constructor에서 파싱 실패할 수 있음
    expect(isPrivateUrl('gopher://evil.com')).toBe(true)
  })

  // HTTPS는 허용
  test('HTTPS 공용 URL 허용', () => {
    expect(isPrivateUrl('https://api.example.com/mcp')).toBe(false)
    expect(isPrivateUrl('https://mcp-server.company.io:8443/v1')).toBe(false)
  })

  // 경계값 — RFC1918 범위 끝
  test('RFC1918 경계값 — 172.15.255.255 (비사설) 허용', () => {
    expect(isPrivateUrl('http://172.15.255.255/mcp')).toBe(false)
  })

  test('RFC1918 경계값 — 172.32.0.0 (비사설) 허용', () => {
    expect(isPrivateUrl('http://172.32.0.0/mcp')).toBe(false)
  })

  test('RFC1918 경계값 — 11.0.0.0 (공용) 허용', () => {
    expect(isPrivateUrl('http://11.0.0.0/mcp')).toBe(false)
  })

  // 정상 공용 IP 허용 확인
  test('다양한 공용 IP 허용', () => {
    expect(isPrivateUrl('https://1.1.1.1/mcp')).toBe(false)
    expect(isPrivateUrl('https://8.8.4.4/mcp')).toBe(false)
    expect(isPrivateUrl('https://104.16.0.1/mcp')).toBe(false)
  })

  // URL 인코딩 시도
  test('IPv6 bracket 표기 내부 주소 차단', () => {
    expect(isPrivateUrl('http://[fd00::1]/mcp')).toBe(true)
    expect(isPrivateUrl('http://[fe80::1%25eth0]/mcp')).toBe(true)
  })
})

// ============================================================
// RISK AREA 2: Rate Limit — 경계값 & 동시성 (MEDIUM)
// ============================================================
describe('TEA: Rate Limit — 경계값 & 동시성', () => {
  test('정확히 20번째 요청은 허용되고 remaining=0', () => {
    const userId = `tea-exact-20-${Date.now()}`
    let result
    for (let i = 0; i < 20; i++) {
      result = checkMcpRateLimit(userId)
    }
    expect(result!.allowed).toBe(true)
    expect(result!.remaining).toBe(0)
  })

  test('21번째 요청 거부 후 retryAfterSec > 0', () => {
    const userId = `tea-21st-${Date.now()}`
    for (let i = 0; i < 20; i++) checkMcpRateLimit(userId)
    const result = checkMcpRateLimit(userId)
    expect(result.allowed).toBe(false)
    expect(typeof result.retryAfterSec).toBe('number')
    expect(result.retryAfterSec!).toBeGreaterThan(0)
  })

  test('여러 번 거부해도 상태 일관성 유지', () => {
    const userId = `tea-multi-reject-${Date.now()}`
    for (let i = 0; i < 20; i++) checkMcpRateLimit(userId)

    // 3번 연속 거부 시도
    for (let i = 0; i < 3; i++) {
      const result = checkMcpRateLimit(userId)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    }
  })

  test('첫 요청의 remaining은 정확히 19', () => {
    const userId = `tea-first-${Date.now()}`
    const result = checkMcpRateLimit(userId)
    expect(result.remaining).toBe(19)
  })

  test('remaining이 단조 감소', () => {
    const userId = `tea-monotonic-${Date.now()}`
    let prevRemaining = 20
    for (let i = 0; i < 20; i++) {
      const result = checkMcpRateLimit(userId)
      expect(result.remaining).toBeLessThan(prevRemaining)
      prevRemaining = result.remaining
    }
  })

  test('100명의 독립 유저 각각 카운터 독립', () => {
    const baseTime = Date.now()
    for (let u = 0; u < 100; u++) {
      const userId = `tea-user-${u}-${baseTime}`
      const result = checkMcpRateLimit(userId)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(19)
    }
  })

  test('유저 A가 제한에 걸려도 유저 B는 영향 없음', () => {
    const t = Date.now()
    const userA = `tea-a-${t}`
    const userB = `tea-b-${t}`

    // A를 제한까지
    for (let i = 0; i < 21; i++) checkMcpRateLimit(userA)

    // B는 처음
    const result = checkMcpRateLimit(userB)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(19)
  })
})

// ============================================================
// RISK AREA 3: 응답 크기 제한 — 경계값 (MEDIUM)
// ============================================================
describe('TEA: 응답 크기 제한 — 경계값', () => {
  const MAX = 102_400
  const SUFFIX = '\n\n(결과가 100KB를 초과하여 잘렸습니다)'

  // 경계값 검증 (동일 로직으로 간접 테스트)
  function simulateTruncation(text: string): string {
    if (text.length > MAX) {
      return text.slice(0, MAX) + SUFFIX
    }
    return text
  }

  test('정확히 100KB(102400자)는 잘리지 않음', () => {
    const text = 'a'.repeat(MAX)
    expect(simulateTruncation(text)).toBe(text)
    expect(simulateTruncation(text).length).toBe(MAX)
  })

  test('100KB + 1자는 잘림', () => {
    const text = 'a'.repeat(MAX + 1)
    const result = simulateTruncation(text)
    expect(result.length).toBe(MAX + SUFFIX.length)
    expect(result).toContain(SUFFIX)
  })

  test('빈 텍스트는 그대로', () => {
    expect(simulateTruncation('')).toBe('')
  })

  test('1바이트 텍스트는 그대로', () => {
    expect(simulateTruncation('x')).toBe('x')
  })

  test('200KB 텍스트는 잘림 + 잘린 부분이 정확히 100KB', () => {
    const text = 'b'.repeat(200_000)
    const result = simulateTruncation(text)
    // 잘린 결과에서 suffix 제거하면 정확히 MAX
    expect(result.slice(0, MAX)).toBe('b'.repeat(MAX))
  })

  test('멀티바이트 문자(한글)도 정상 동작', () => {
    // 한글은 3바이트지만 JS에서는 1 char
    const text = '가'.repeat(MAX + 100)
    const result = simulateTruncation(text)
    expect(result).toContain(SUFFIX)
  })
})

// ============================================================
// RISK AREA 4: adminOnly 미들웨어 적용 범위 (HIGH)
// ============================================================
describe('TEA: adminOnly 미들웨어 적용 — 라우트 검증', () => {
  // 실제 미들웨어 적용을 코드에서 검증 (정적 분석)
  test('settings-mcp.ts에서 adminOnly가 CUD 라우트에 적용됨', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')

    // POST /mcp (등록)에 adminOnly 적용
    expect(code).toContain("settingsMcpRoute.post('/mcp', adminOnly,")

    // DELETE /mcp/:id (삭제)에 adminOnly 적용
    expect(code).toContain("settingsMcpRoute.delete('/mcp/:id', adminOnly,")

    // POST /mcp/test (연결 테스트)에 adminOnly 적용
    expect(code).toContain("settingsMcpRoute.post('/mcp/test', adminOnly,")

    // POST /mcp/execute는 adminOnly 없어야 함 (모든 인증 유저 허용)
    expect(code).toContain("settingsMcpRoute.post('/mcp/execute', zValidator")
    expect(code).not.toContain("settingsMcpRoute.post('/mcp/execute', adminOnly")

    // GET /mcp는 adminOnly 없어야 함
    expect(code).toContain("settingsMcpRoute.get('/mcp',")
    // GET 라우트에 adminOnly가 없는지 확인 (정규식)
    const getRoutes = code.match(/settingsMcpRoute\.get\([^)]*adminOnly/g)
    expect(getRoutes).toBeNull()
  })

  test('adminOnly 미들웨어가 auth.ts에서 올바르게 임포트됨', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')
    expect(code).toContain("import { authMiddleware, adminOnly } from '../../middleware/auth'")
  })
})

// ============================================================
// RISK AREA 5: 감사 로그 — logActivity 호출 검증 (MEDIUM)
// ============================================================
describe('TEA: 감사 로그 — logActivity 호출 존재 검증', () => {
  test('settings-mcp.ts에서 logActivity 임포트 및 호출', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')

    // 임포트 확인
    expect(code).toContain("import { logActivity } from '../../lib/activity-logger'")

    // 등록 감사 로그
    expect(code).toContain("action: 'mcp-server-register'")

    // 삭제 감사 로그
    expect(code).toContain("action: 'mcp-server-delete'")

    // 실행 감사 로그 (성공 + 실패)
    const execLogs = code.match(/action: 'mcp-tool-execute'/g)
    expect(execLogs).not.toBeNull()
    expect(execLogs!.length).toBeGreaterThanOrEqual(2) // 성공 + 실패
  })

  test('ai.ts에서 MCP 도구 실행 시 감사 로그 호출', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/lib/ai.ts', 'utf8')

    // ai.ts에서 logActivity 임포트
    expect(code).toContain("import { logActivity } from './activity-logger'")

    // MCP 도구 실행 감사 로그 (sync + stream = 최소 4회)
    const mcpLogs = code.match(/action: 'mcp-tool-execute'/g)
    expect(mcpLogs).not.toBeNull()
    expect(mcpLogs!.length).toBeGreaterThanOrEqual(4) // sync 성공+실패 + stream 성공+실패
  })
})

// ============================================================
// RISK AREA 6: Rate Limit — ai.ts 적용 검증 (HIGH)
// ============================================================
describe('TEA: Rate Limit — ai.ts 적용 검증', () => {
  test('ai.ts에서 checkMcpRateLimit 임포트 및 호출', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/lib/ai.ts', 'utf8')

    // 임포트 확인
    expect(code).toContain("import { checkMcpRateLimit } from './mcp-rate-limit'")

    // MCP 도구 실행 전 rate limit 체크 (sync + stream = 최소 2회)
    const rateLimitCalls = code.match(/checkMcpRateLimit\(/g)
    expect(rateLimitCalls).not.toBeNull()
    expect(rateLimitCalls!.length).toBeGreaterThanOrEqual(2)
  })

  test('settings-mcp.ts에서 rate limit 체크 + 429 응답', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/server/src/routes/workspace/settings-mcp.ts', 'utf8')

    // rate limit 임포트
    expect(code).toContain("import { checkMcpRateLimit } from '../../lib/mcp-rate-limit'")

    // 429 응답
    expect(code).toContain("429")
    expect(code).toContain("MCP_003")

    // Retry-After 헤더
    expect(code).toContain("Retry-After")
  })
})

// ============================================================
// RISK AREA 7: SSRF — isPrivateUrl 프로덕션 vs 개발 환경 (HIGH)
// ============================================================
describe('TEA: SSRF — 환경별 localhost 동작', () => {
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

  test('production에서 [::1] 차단', () => {
    process.env.NODE_ENV = 'production'
    expect(isPrivateUrl('http://[::1]:3000/mcp')).toBe(true)
  })

  test('production에서 모든 localhost 변형 차단', () => {
    process.env.NODE_ENV = 'production'
    const variants = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']
    for (const host of variants) {
      expect(isPrivateUrl(`http://${host}:3000/mcp`)).toBe(true)
    }
  })

  test('development에서 localhost 변형 허용', () => {
    process.env.NODE_ENV = 'development'
    // [::1]은 URL에서 포트를 분리하면 hostname이 [::1]이 되고 bareHost는 ::1
    const variants = ['localhost', '127.0.0.1', '0.0.0.0']
    for (const host of variants) {
      expect(isPrivateUrl(`http://${host}:3000/mcp`)).toBe(false)
    }
    // IPv6 bracket 형태
    expect(isPrivateUrl('http://[::1]:3000/mcp')).toBe(false)
  })

  test('staging 환경(non-production)에서 localhost 허용', () => {
    process.env.NODE_ENV = 'staging'
    expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(false)
  })

  test('어떤 환경에서든 사설 IP는 항상 차단', () => {
    for (const env of ['production', 'development', 'staging', 'test']) {
      process.env.NODE_ENV = env
      expect(isPrivateUrl('http://10.0.0.1/mcp')).toBe(true)
      expect(isPrivateUrl('http://192.168.1.1/mcp')).toBe(true)
      expect(isPrivateUrl('http://172.16.0.1/mcp')).toBe(true)
      expect(isPrivateUrl('http://169.254.169.254/')).toBe(true)
    }
  })
})

// ============================================================
// RISK AREA 8: 프론트엔드 — 권한 기반 UI 코드 검증 (MEDIUM)
// ============================================================
describe('TEA: 프론트엔드 — 권한 기반 UI 코드 검증', () => {
  test('settings-mcp.tsx에서 isAdmin 조건부 렌더링 존재', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/app/src/components/settings/settings-mcp.tsx', 'utf8')

    // useAuthStore 임포트
    expect(code).toContain("useAuthStore")

    // isAdmin 변수 선언
    expect(code).toContain("isAdmin")

    // 서버 추가 버튼 조건부
    expect(code).toContain("{isAdmin &&")

    // HTTP 경고 텍스트
    expect(code).toContain("HTTPS")

    // ServerCard에 isAdmin prop 전달
    expect(code).toContain("isAdmin={isAdmin}")
  })

  test('ServerCard에 isAdmin prop 타입 선언', async () => {
    const fs = await import('fs')
    const code = fs.readFileSync('packages/app/src/components/settings/settings-mcp.tsx', 'utf8')

    expect(code).toContain("isAdmin: boolean")
  })
})

// ============================================================
// RISK AREA 9: mcp-rate-limit.ts 모듈 구조 검증 (LOW)
// ============================================================
describe('TEA: mcp-rate-limit.ts 모듈 검증', () => {
  test('checkMcpRateLimit 반환값 타입 검증', () => {
    const userId = `tea-type-${Date.now()}`
    const result = checkMcpRateLimit(userId)

    expect(typeof result.allowed).toBe('boolean')
    expect(typeof result.remaining).toBe('number')
    // retryAfterSec는 거부 시에만 존재
    expect(result.retryAfterSec).toBeUndefined()
  })

  test('거부 시 retryAfterSec 타입 검증', () => {
    const userId = `tea-reject-type-${Date.now()}`
    for (let i = 0; i < 20; i++) checkMcpRateLimit(userId)
    const result = checkMcpRateLimit(userId)

    expect(typeof result.retryAfterSec).toBe('number')
    expect(result.retryAfterSec).toBeGreaterThan(0)
    expect(result.retryAfterSec).toBeLessThanOrEqual(60)
  })
})
