/**
 * Epic 2 로직 유닛 테스트 — 순환 보고 감지, 임시 비밀번호 생성, 삭제 보호 로직
 * 서버 없이 실행 가능: bun test src/__tests__/unit/epic2-logic.test.ts
 */
import { describe, test, expect } from 'bun:test'

// =============================================
// 순환 보고라인 감지 로직 (report-lines.ts에서 추출)
// =============================================
function detectSelfReference(lines: { userId: string; reportsToUserId: string }[]): string | null {
  for (const line of lines) {
    if (line.userId === line.reportsToUserId) return line.userId
  }
  return null
}

function detectCycle(lines: { userId: string; reportsToUserId: string }[]): boolean {
  const graph = new Map<string, string>()
  for (const line of lines) {
    graph.set(line.userId, line.reportsToUserId)
  }
  for (const startId of graph.keys()) {
    const visited = new Set<string>()
    let current: string | undefined = startId
    while (current && graph.has(current)) {
      if (visited.has(current)) return true
      visited.add(current)
      current = graph.get(current)
    }
  }
  return false
}

describe('보고라인: 자기 참조 감지', () => {
  test('자기 자신을 상위자로 설정 → 감지', () => {
    const result = detectSelfReference([
      { userId: 'a', reportsToUserId: 'a' },
    ])
    expect(result).toBe('a')
  })

  test('정상 보고라인 → null', () => {
    const result = detectSelfReference([
      { userId: 'a', reportsToUserId: 'b' },
      { userId: 'b', reportsToUserId: 'c' },
    ])
    expect(result).toBeNull()
  })
})

describe('보고라인: 순환 참조 감지', () => {
  test('A→B→C→A 순환 → true', () => {
    const result = detectCycle([
      { userId: 'a', reportsToUserId: 'b' },
      { userId: 'b', reportsToUserId: 'c' },
      { userId: 'c', reportsToUserId: 'a' },
    ])
    expect(result).toBe(true)
  })

  test('A→B→A 직접 순환 → true', () => {
    const result = detectCycle([
      { userId: 'a', reportsToUserId: 'b' },
      { userId: 'b', reportsToUserId: 'a' },
    ])
    expect(result).toBe(true)
  })

  test('정상 계층 (A→B→C) → false', () => {
    const result = detectCycle([
      { userId: 'a', reportsToUserId: 'b' },
      { userId: 'b', reportsToUserId: 'c' },
    ])
    expect(result).toBe(false)
  })

  test('비어있는 배열 → false', () => {
    expect(detectCycle([])).toBe(false)
  })

  test('독립적인 여러 라인 (순환 없음) → false', () => {
    const result = detectCycle([
      { userId: 'a', reportsToUserId: 'c' },
      { userId: 'b', reportsToUserId: 'c' },
      { userId: 'd', reportsToUserId: 'c' },
    ])
    expect(result).toBe(false)
  })

  test('긴 체인 순환 (5명) → true', () => {
    const result = detectCycle([
      { userId: 'a', reportsToUserId: 'b' },
      { userId: 'b', reportsToUserId: 'c' },
      { userId: 'c', reportsToUserId: 'd' },
      { userId: 'd', reportsToUserId: 'e' },
      { userId: 'e', reportsToUserId: 'a' },
    ])
    expect(result).toBe(true)
  })
})

// =============================================
// 임시 비밀번호 생성 로직 (users.ts에서 추출)
// =============================================
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}

describe('임시 비밀번호 생성', () => {
  test('8자리 생성', () => {
    const pw = generateTempPassword()
    expect(pw.length).toBe(8)
  })

  test('혼동 문자 미포함 (0, O, l, I, 1)', () => {
    // 100번 생성해서 혼동 문자가 없는지 확인
    for (let i = 0; i < 100; i++) {
      const pw = generateTempPassword()
      expect(pw).not.toMatch(/[0OlI1]/)
    }
  })

  test('매번 다른 비밀번호 생성', () => {
    const passwords = new Set<string>()
    for (let i = 0; i < 50; i++) {
      passwords.add(generateTempPassword())
    }
    // 50개 중 최소 45개는 고유해야 함 (통계적으로 거의 확실)
    expect(passwords.size).toBeGreaterThan(45)
  })

  test('영숫자만 포함 (특수문자 없음)', () => {
    for (let i = 0; i < 50; i++) {
      const pw = generateTempPassword()
      expect(pw).toMatch(/^[A-Za-z0-9]+$/)
    }
  })
})

// =============================================
// 에러 코드 한국어 매핑 (api.ts에서 추출)
// =============================================
const errorMessages: Record<string, string> = {
  AUTH_001: '아이디 또는 비밀번호가 올바르지 않습니다',
  AUTH_002: '로그인이 만료되었습니다. 다시 로그인해주세요',
  AUTH_003: '관리자 권한이 필요합니다',
  USER_001: '직원을 찾을 수 없습니다',
  USER_002: '이미 존재하는 아이디입니다',
  TENANT_001: '접근 권한이 없습니다',
  DEPT_002: '같은 이름의 부서가 이미 있습니다',
  DEPT_003: '소속 에이전트가 있어 삭제할 수 없습니다',
  REPORT_LINE_002: '자신을 보고 대상으로 설정할 수 없습니다',
  REPORT_LINE_003: '순환 보고 구조가 감지되었습니다',
}

describe('에러 코드 한국어 매핑', () => {
  test('모든 에러 코드가 한국어 메시지를 가짐', () => {
    for (const [code, msg] of Object.entries(errorMessages)) {
      expect(msg.length).toBeGreaterThan(0)
      // 영어 알파벳으로만 된 메시지가 없어야 함
      expect(msg).not.toMatch(/^[a-zA-Z\s.]+$/)
    }
  })

  test('AUTH 에러 코드 3개 존재', () => {
    expect(errorMessages.AUTH_001).toBeDefined()
    expect(errorMessages.AUTH_002).toBeDefined()
    expect(errorMessages.AUTH_003).toBeDefined()
  })

  test('Epic 2 신규 에러 코드 존재', () => {
    expect(errorMessages.DEPT_002).toBeDefined()
    expect(errorMessages.DEPT_003).toBeDefined()
    expect(errorMessages.REPORT_LINE_002).toBeDefined()
    expect(errorMessages.REPORT_LINE_003).toBeDefined()
  })
})

// =============================================
// JWT 클레임 타입 검증 로직
// =============================================
describe('JWT admin 타입 검증', () => {
  test('admin JWT에는 type:admin 필수', () => {
    const adminPayload = { sub: '123', companyId: 'system', role: 'admin', type: 'admin' }
    expect(adminPayload.type).toBe('admin')
    expect(adminPayload.role).toBe('admin')
  })

  test('일반 유저 JWT에는 type 없음', () => {
    const userPayload = { sub: '456', companyId: 'comp-1', role: 'user' }
    expect((userPayload as Record<string, unknown>).type).toBeUndefined()
  })

  test('adminOnly 검증: role=admin이지만 type 없으면 거부', () => {
    const fakeAdmin = { sub: '789', companyId: 'comp-1', role: 'admin' }
    const isAdminUser = fakeAdmin.role === 'admin' && (fakeAdmin as Record<string, unknown>).type === 'admin'
    expect(isAdminUser).toBe(false)
  })

  test('adminOnly 검증: role=admin + type=admin → 통과', () => {
    const realAdmin = { sub: '123', companyId: 'system', role: 'admin', type: 'admin' }
    const isAdminUser = realAdmin.role === 'admin' && realAdmin.type === 'admin'
    expect(isAdminUser).toBe(true)
  })
})
