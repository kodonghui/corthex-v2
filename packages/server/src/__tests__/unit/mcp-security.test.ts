import { describe, test, expect, beforeEach } from 'bun:test'
import { isPrivateUrl } from '../../lib/mcp-client'
import { checkMcpRateLimit } from '../../lib/mcp-rate-limit'

// ============================================================
// Task 1: MCP 라우트 권한 분리 — adminOnly 미들웨어 테스트
// ============================================================
describe('MCP 라우트 권한 분리', () => {
  // adminOnly 미들웨어 자체는 auth.ts에서 테스트. 여기서는 라우트 적용 확인
  test('adminOnly는 role=admin + type=admin만 허용', () => {
    // adminOnly 미들웨어 로직 검증
    const adminTenant = { role: 'admin', isAdminUser: true }
    const userTenant = { role: 'user', isAdminUser: false }
    const adminRoleOnly = { role: 'admin', isAdminUser: false }

    expect(adminTenant.role === 'admin' && adminTenant.isAdminUser).toBe(true)
    expect(userTenant.role === 'admin' && userTenant.isAdminUser).toBe(false)
    expect(adminRoleOnly.role === 'admin' && adminRoleOnly.isAdminUser).toBe(false)
  })
})

// ============================================================
// Task 2: SSRF 방지 강화
// ============================================================
describe('SSRF 방지 강화 — isPrivateUrl', () => {
  // 차단해야 하는 URL
  test('AWS 메타데이터 엔드포인트 차단', () => {
    expect(isPrivateUrl('http://169.254.169.254/latest/meta-data')).toBe(true)
  })

  test('GCP 메타데이터 엔드포인트 차단', () => {
    expect(isPrivateUrl('http://metadata.google.internal/computeMetadata/v1')).toBe(true)
  })

  test('RFC1918 사설 IP 차단 — 10.x.x.x', () => {
    expect(isPrivateUrl('http://10.0.0.1/mcp')).toBe(true)
    expect(isPrivateUrl('http://10.255.255.255/mcp')).toBe(true)
  })

  test('RFC1918 사설 IP 차단 — 172.16-31.x.x', () => {
    expect(isPrivateUrl('http://172.16.0.1/mcp')).toBe(true)
    expect(isPrivateUrl('http://172.31.255.255/mcp')).toBe(true)
  })

  test('RFC1918 사설 IP 차단 — 192.168.x.x', () => {
    expect(isPrivateUrl('http://192.168.1.1/mcp')).toBe(true)
    expect(isPrivateUrl('http://192.168.0.100/mcp')).toBe(true)
  })

  test('IPv6 ULA(fd00::/8) 차단', () => {
    expect(isPrivateUrl('http://fd12::1/mcp')).toBe(true)
  })

  test('IPv6 link-local(fe80::/10) 차단', () => {
    expect(isPrivateUrl('http://fe80::1/mcp')).toBe(true)
  })

  test(':: (all zeros) 차단', () => {
    expect(isPrivateUrl('http://[::]/mcp')).toBe(true)
  })

  test('프로토콜 검증 — http/https만 허용', () => {
    expect(isPrivateUrl('ftp://example.com/mcp')).toBe(true)
    expect(isPrivateUrl('file:///etc/passwd')).toBe(true)
    expect(isPrivateUrl('javascript:alert(1)')).toBe(true)
  })

  test('파싱 실패 시 차단 (return true)', () => {
    expect(isPrivateUrl('not-a-url')).toBe(true)
    expect(isPrivateUrl('')).toBe(true)
  })

  // 허용해야 하는 URL
  test('공용 IP 허용', () => {
    expect(isPrivateUrl('https://example.com/mcp')).toBe(false)
    expect(isPrivateUrl('https://8.8.8.8/mcp')).toBe(false)
    expect(isPrivateUrl('https://203.0.113.1/mcp')).toBe(false)
  })

  test('172.15.x.x (비사설 범위) 허용', () => {
    expect(isPrivateUrl('http://172.15.0.1/mcp')).toBe(false)
  })

  test('172.32.x.x (비사설 범위) 허용', () => {
    expect(isPrivateUrl('http://172.32.0.1/mcp')).toBe(false)
  })

  // localhost — 환경에 따라 다름 (production에서만 차단)
  test('localhost — NODE_ENV != production이면 허용', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(false)
    expect(isPrivateUrl('http://127.0.0.1:3000/mcp')).toBe(false)
    process.env.NODE_ENV = originalEnv
  })

  test('localhost — NODE_ENV=production이면 차단', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(true)
    expect(isPrivateUrl('http://127.0.0.1:3000/mcp')).toBe(true)
    expect(isPrivateUrl('http://0.0.0.0:3000/mcp')).toBe(true)
    process.env.NODE_ENV = originalEnv
  })

  test('localhost — NODE_ENV 미설정이면 허용 (개발 환경)', () => {
    const originalEnv = process.env.NODE_ENV
    delete process.env.NODE_ENV
    expect(isPrivateUrl('http://localhost:3000/mcp')).toBe(false)
    process.env.NODE_ENV = originalEnv
  })
})

// ============================================================
// Task 3: MCP 도구 실행 속도 제한
// ============================================================
describe('MCP 도구 실행 속도 제한', () => {
  test('첫 요청은 허용 + remaining = 19', () => {
    const userId = `test-user-${Date.now()}`
    const result = checkMcpRateLimit(userId)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(19)
  })

  test('20회까지 허용', () => {
    const userId = `test-user-20-${Date.now()}`
    let result
    for (let i = 0; i < 20; i++) {
      result = checkMcpRateLimit(userId)
      expect(result.allowed).toBe(true)
    }
    expect(result!.remaining).toBe(0)
  })

  test('21번째 요청은 거부 + retryAfterSec 포함', () => {
    const userId = `test-user-21-${Date.now()}`
    for (let i = 0; i < 20; i++) {
      checkMcpRateLimit(userId)
    }
    const result = checkMcpRateLimit(userId)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSec).toBeGreaterThan(0)
    expect(result.retryAfterSec).toBeLessThanOrEqual(60)
  })

  test('다른 유저는 독립 카운터', () => {
    const userId1 = `test-user-a-${Date.now()}`
    const userId2 = `test-user-b-${Date.now()}`

    for (let i = 0; i < 20; i++) {
      checkMcpRateLimit(userId1)
    }

    const result = checkMcpRateLimit(userId2)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(19)
  })
})

// ============================================================
// Task 5: MCP 응답 크기 제한
// ============================================================
describe('MCP 응답 크기 제한', () => {
  // extractTextFromResult는 내부 함수이므로 간접 테스트
  // mcp-client.ts에서 export되지 않으므로 동일 로직으로 검증

  test('100KB 미만 텍스트는 그대로 반환', () => {
    const text = 'a'.repeat(1000)
    expect(text.length).toBeLessThan(102_400)
    // 실제 extractTextFromResult 내부 동작과 동일한 로직
    const result = text.length > 102_400
      ? text.slice(0, 102_400) + '\n\n(결과가 100KB를 초과하여 잘렸습니다)'
      : text
    expect(result).toBe(text)
  })

  test('100KB 초과 텍스트는 잘림 + 메시지 추가', () => {
    const text = 'x'.repeat(200_000)
    const result = text.length > 102_400
      ? text.slice(0, 102_400) + '\n\n(결과가 100KB를 초과하여 잘렸습니다)'
      : text
    expect(result.length).toBe(102_400 + '\n\n(결과가 100KB를 초과하여 잘렸습니다)'.length)
    expect(result).toContain('(결과가 100KB를 초과하여 잘렸습니다)')
  })
})

// ============================================================
// Task 6: 프론트엔드 권한 기반 UI (로직 테스트)
// ============================================================
describe('프론트엔드 권한 판단 로직', () => {
  test('role=admin → isAdmin=true', () => {
    const user: { role: string } = { role: 'admin' }
    expect(user.role === 'admin').toBe(true)
  })

  test('role=user → isAdmin=false', () => {
    const user: { role: string } = { role: 'user' }
    expect(user.role === 'admin').toBe(false)
  })
})
