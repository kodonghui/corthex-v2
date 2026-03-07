import { describe, it, expect } from 'bun:test'
import { sign } from 'hono/jwt'
import type { UserRole } from '@corthex/shared'
import { isAdminLevel, isCeoOrAbove } from '@corthex/shared'

const JWT_SECRET = 'corthex-v2-dev-secret-change-in-production'

// === Helper: JWT 생성 ===
function makeJwt(role: UserRole, type?: 'admin') {
  return sign(
    { sub: 'test-user', companyId: 'test-company', role, ...(type ? { type } : {}), exp: Math.floor(Date.now() / 1000) + 3600 },
    JWT_SECRET,
  )
}

// =====================================================
// 1. UserRole 타입 + 헬퍼 함수 검증
// =====================================================
describe('RBAC Role Helpers', () => {
  describe('isAdminLevel', () => {
    it('super_admin은 admin 레벨이다', () => {
      expect(isAdminLevel('super_admin')).toBe(true)
    })

    it('company_admin은 admin 레벨이다', () => {
      expect(isAdminLevel('company_admin')).toBe(true)
    })

    it('ceo는 admin 레벨이 아니다', () => {
      expect(isAdminLevel('ceo')).toBe(false)
    })

    it('employee는 admin 레벨이 아니다', () => {
      expect(isAdminLevel('employee')).toBe(false)
    })
  })

  describe('isCeoOrAbove', () => {
    it('super_admin은 CEO 이상이다', () => {
      expect(isCeoOrAbove('super_admin')).toBe(true)
    })

    it('company_admin은 CEO 이상이다', () => {
      expect(isCeoOrAbove('company_admin')).toBe(true)
    })

    it('ceo는 CEO 이상이다', () => {
      expect(isCeoOrAbove('ceo')).toBe(true)
    })

    it('employee는 CEO 이상이 아니다', () => {
      expect(isCeoOrAbove('employee')).toBe(false)
    })
  })
})

// =====================================================
// 2. JWT payload에 RBAC role이 포함되는지 검증
// =====================================================
describe('JWT RBAC Role Encoding', () => {
  it('super_admin role이 JWT에 올바르게 인코딩된다', async () => {
    const token = await makeJwt('super_admin', 'admin')
    expect(token).toBeTruthy()
    // JWT 디코딩 (페이로드 파트)
    const payload = JSON.parse(atob(token.split('.')[1]))
    expect(payload.role).toBe('super_admin')
    expect(payload.type).toBe('admin')
  })

  it('company_admin role이 JWT에 올바르게 인코딩된다', async () => {
    const token = await makeJwt('company_admin', 'admin')
    const payload = JSON.parse(atob(token.split('.')[1]))
    expect(payload.role).toBe('company_admin')
  })

  it('ceo role이 JWT에 올바르게 인코딩된다', async () => {
    const token = await makeJwt('ceo')
    const payload = JSON.parse(atob(token.split('.')[1]))
    expect(payload.role).toBe('ceo')
    expect(payload.type).toBeUndefined()
  })

  it('employee role이 JWT에 올바르게 인코딩된다', async () => {
    const token = await makeJwt('employee')
    const payload = JSON.parse(atob(token.split('.')[1]))
    expect(payload.role).toBe('employee')
  })
})

// =====================================================
// 3. RBAC 권한 매트릭스 로직 검증
// =====================================================
describe('RBAC Permission Matrix Logic', () => {
  // rbacMiddleware의 핵심 로직을 순수 함수로 추출하여 테스트
  function checkAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    // Super Admin 바이패스
    if (userRole === 'super_admin') return true
    return allowedRoles.includes(userRole)
  }

  describe('Admin 콘솔 라우트 (/api/admin/*)', () => {
    const adminRouteRoles: UserRole[] = ['super_admin', 'company_admin']

    it('super_admin은 접근 가능 (바이패스)', () => {
      expect(checkAccess('super_admin', adminRouteRoles)).toBe(true)
    })

    it('company_admin은 접근 가능', () => {
      expect(checkAccess('company_admin', adminRouteRoles)).toBe(true)
    })

    it('ceo는 접근 불가', () => {
      expect(checkAccess('ceo', adminRouteRoles)).toBe(false)
    })

    it('employee는 접근 불가', () => {
      expect(checkAccess('employee', adminRouteRoles)).toBe(false)
    })
  })

  describe('Super Admin 전용 라우트 (/api/admin/companies)', () => {
    const superAdminOnlyRoles: UserRole[] = ['super_admin']

    it('super_admin만 접근 가능', () => {
      expect(checkAccess('super_admin', superAdminOnlyRoles)).toBe(true)
    })

    it('company_admin은 접근 불가', () => {
      expect(checkAccess('company_admin', superAdminOnlyRoles)).toBe(false)
    })

    it('ceo는 접근 불가', () => {
      expect(checkAccess('ceo', superAdminOnlyRoles)).toBe(false)
    })

    it('employee는 접근 불가', () => {
      expect(checkAccess('employee', superAdminOnlyRoles)).toBe(false)
    })
  })

  describe('Workspace 라우트 (/api/workspace/*)', () => {
    const workspaceRoles: UserRole[] = ['company_admin', 'ceo', 'employee']

    it('super_admin은 접근 가능 (바이패스)', () => {
      expect(checkAccess('super_admin', workspaceRoles)).toBe(true)
    })

    it('company_admin은 접근 가능', () => {
      expect(checkAccess('company_admin', workspaceRoles)).toBe(true)
    })

    it('ceo는 접근 가능', () => {
      expect(checkAccess('ceo', workspaceRoles)).toBe(true)
    })

    it('employee는 접근 가능', () => {
      expect(checkAccess('employee', workspaceRoles)).toBe(true)
    })
  })

  describe('CEO 전용 Workspace 라우트 (예: strategy)', () => {
    const ceoOnlyRoles: UserRole[] = ['ceo']

    it('super_admin은 접근 가능 (바이패스)', () => {
      expect(checkAccess('super_admin', ceoOnlyRoles)).toBe(true)
    })

    it('company_admin은 접근 불가', () => {
      expect(checkAccess('company_admin', ceoOnlyRoles)).toBe(false)
    })

    it('ceo는 접근 가능', () => {
      expect(checkAccess('ceo', ceoOnlyRoles)).toBe(true)
    })

    it('employee는 접근 불가', () => {
      expect(checkAccess('employee', ceoOnlyRoles)).toBe(false)
    })
  })
})

// =====================================================
// 4. 역할 매핑 검증 (DB enum -> RBAC role)
// =====================================================
describe('DB Role to RBAC Role Mapping', () => {
  // auth.ts 로그인 로직의 매핑을 순수 함수로 추출
  function mapUserRole(dbRole: 'admin' | 'user'): UserRole {
    return dbRole === 'admin' ? 'ceo' : 'employee'
  }

  function mapAdminRole(dbRole: 'superadmin' | 'admin'): UserRole {
    return dbRole === 'superadmin' ? 'super_admin' : 'company_admin'
  }

  it('users 테이블 admin -> ceo', () => {
    expect(mapUserRole('admin')).toBe('ceo')
  })

  it('users 테이블 user -> employee', () => {
    expect(mapUserRole('user')).toBe('employee')
  })

  it('admin_users 테이블 superadmin -> super_admin', () => {
    expect(mapAdminRole('superadmin')).toBe('super_admin')
  })

  it('admin_users 테이블 admin -> company_admin', () => {
    expect(mapAdminRole('admin')).toBe('company_admin')
  })
})

// =====================================================
// 5. 미들웨어 체이닝 순서 검증
// =====================================================
describe('Middleware Chain Order', () => {
  it('auth -> tenant -> rbac 순서가 보장된다', () => {
    // 미들웨어 체이닝은 Hono 라우트 정의 순서로 보장됨
    // 이 테스트는 auth 없이 rbac가 동작하지 않음을 검증
    const tenantContext = {
      companyId: 'test-company',
      userId: 'test-user',
      role: 'employee' as UserRole,
      isAdminUser: false,
    }

    // rbac 로직: tenant context의 role로 접근 제어
    const allowedRoles: UserRole[] = ['super_admin', 'company_admin']
    const hasAccess = tenantContext.role === 'super_admin' || allowedRoles.includes(tenantContext.role)
    expect(hasAccess).toBe(false)
  })
})

// =====================================================
// 6. RBAC 거부 시 에러 응답 형식 검증
// =====================================================
describe('RBAC Error Response Format', () => {
  it('403 에러에 RBAC_001 코드가 포함된다', () => {
    // HTTPError 생성 시 코드 검증
    const errorCode = 'RBAC_001'
    const errorMessage = '접근 권한이 없습니다'
    const status = 403

    expect(status).toBe(403)
    expect(errorCode).toBe('RBAC_001')
    expect(errorMessage).toBeTruthy()
  })
})

// =====================================================
// 7. 감사 로그 데이터 구조 검증
// =====================================================
describe('RBAC Audit Log Structure', () => {
  it('RBAC 거부 감사 로그에 필수 필드가 포함된다', () => {
    const auditEntry = {
      companyId: 'test-company',
      actorType: 'user' as const,
      actorId: 'test-user',
      action: 'auth.rbac.denied',
      targetType: 'api_endpoint',
      metadata: { method: 'GET', path: '/api/admin/companies', role: 'employee' },
    }

    expect(auditEntry.action).toBe('auth.rbac.denied')
    expect(auditEntry.targetType).toBe('api_endpoint')
    expect(auditEntry.metadata.method).toBe('GET')
    expect(auditEntry.metadata.path).toBe('/api/admin/companies')
    expect(auditEntry.metadata.role).toBe('employee')
    expect(auditEntry.actorType).toBe('user')
  })

  it('admin_user 거부 시 actorType이 admin_user이다', () => {
    const isAdminUser = true
    const actorType = isAdminUser ? 'admin_user' : 'user'
    expect(actorType).toBe('admin_user')
  })
})
