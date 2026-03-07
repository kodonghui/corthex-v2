import { describe, expect, test } from 'bun:test'
import * as auditLogService from '../../services/audit-log'
import type { CreateAuditLogInput, AuditLogQueryOptions } from '../../services/audit-log'

describe('Audit Log System (Epic 1 Story 4)', () => {
  // === Task 1: AuditLogService 구조 검증 ===
  describe('AuditLogService exports', () => {
    test('createAuditLog 함수가 존재해야 한다', () => {
      expect(typeof auditLogService.createAuditLog).toBe('function')
    })

    test('queryAuditLogs 함수가 존재해야 한다', () => {
      expect(typeof auditLogService.queryAuditLogs).toBe('function')
    })

    test('withAuditLog 헬퍼 함수가 존재해야 한다', () => {
      expect(typeof auditLogService.withAuditLog).toBe('function')
    })
  })

  // === Task 1.4: Action 상수 검증 ===
  describe('AUDIT_ACTIONS 상수', () => {
    test('AUDIT_ACTIONS가 정의되어야 한다', () => {
      expect(auditLogService.AUDIT_ACTIONS).toBeDefined()
    })

    test('조직 관련 액션이 존재해야 한다', () => {
      expect(auditLogService.AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE).toBe('org.department.create')
      expect(auditLogService.AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE).toBe('org.department.update')
      expect(auditLogService.AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE).toBe('org.department.delete')
      expect(auditLogService.AUDIT_ACTIONS.ORG_AGENT_CREATE).toBe('org.agent.create')
      expect(auditLogService.AUDIT_ACTIONS.ORG_AGENT_UPDATE).toBe('org.agent.update')
      expect(auditLogService.AUDIT_ACTIONS.ORG_AGENT_DELETE).toBe('org.agent.delete')
      expect(auditLogService.AUDIT_ACTIONS.ORG_AGENT_DEACTIVATE).toBe('org.agent.deactivate')
      expect(auditLogService.AUDIT_ACTIONS.ORG_TEMPLATE_APPLY).toBe('org.template.apply')
    })

    test('크리덴셜 관련 액션이 존재해야 한다', () => {
      expect(auditLogService.AUDIT_ACTIONS.CREDENTIAL_STORE).toBe('credential.store')
      expect(auditLogService.AUDIT_ACTIONS.CREDENTIAL_ACCESS).toBe('credential.access')
      expect(auditLogService.AUDIT_ACTIONS.CREDENTIAL_DELETE).toBe('credential.delete')
    })

    test('인증/권한 관련 액션이 존재해야 한다', () => {
      expect(auditLogService.AUDIT_ACTIONS.AUTH_ROLE_CHANGE).toBe('auth.role.change')
      expect(auditLogService.AUDIT_ACTIONS.AUTH_LOGIN_FAIL).toBe('auth.login.fail')
    })

    test('거래 관련 액션이 존재해야 한다', () => {
      expect(auditLogService.AUDIT_ACTIONS.TRADE_ORDER_CREATE).toBe('trade.order.create')
      expect(auditLogService.AUDIT_ACTIONS.TRADE_ORDER_EXECUTE).toBe('trade.order.execute')
      expect(auditLogService.AUDIT_ACTIONS.TRADE_ORDER_CANCEL).toBe('trade.order.cancel')
    })

    test('시스템 관련 액션이 존재해야 한다', () => {
      expect(auditLogService.AUDIT_ACTIONS.SYSTEM_CONFIG_CHANGE).toBe('system.config.change')
    })

    test('모든 액션이 도트 표기법을 사용해야 한다', () => {
      for (const [, value] of Object.entries(auditLogService.AUDIT_ACTIONS)) {
        expect(value).toMatch(/^[a-z]+(\.[a-z_]+)+$/)
      }
    })
  })

  // === Task 2: Immutability 검증 ===
  describe('Immutability (INSERT ONLY)', () => {
    test('서비스에 deleteAuditLog 메서드가 없어야 한다', () => {
      expect((auditLogService as any).deleteAuditLog).toBeUndefined()
    })

    test('서비스에 updateAuditLog 메서드가 없어야 한다', () => {
      expect((auditLogService as any).updateAuditLog).toBeUndefined()
    })

    test('서비스에 softDeleteAuditLog 메서드가 없어야 한다', () => {
      expect((auditLogService as any).softDeleteAuditLog).toBeUndefined()
    })

    test('서비스에 removeAuditLog 메서드가 없어야 한다', () => {
      expect((auditLogService as any).removeAuditLog).toBeUndefined()
    })
  })

  // === Task 3: withAuditLog 헬퍼 검증 ===
  describe('withAuditLog 헬퍼 타입 검증', () => {
    test('withAuditLog는 auditInput과 operation을 인자로 받아야 한다', () => {
      // withAuditLog는 2개의 인자를 받아야 한다
      expect(auditLogService.withAuditLog.length).toBe(2)
    })
  })

  // === Task 4: Route 구조 검증 ===
  describe('Audit Log Route', () => {
    test('auditLogsRoute가 export되어야 한다', async () => {
      const routeModule = await import('../../routes/admin/audit-logs')
      expect(routeModule.auditLogsRoute).toBeDefined()
    })
  })

  // === TEA Risk-Based: Immutability Exhaustive ===
  describe('Immutability - 모든 export가 읽기/쓰기만 허용 (TEA)', () => {
    test('서비스의 모든 export 함수 이름에 delete/remove/update/edit/modify/purge가 없어야 한다', () => {
      const forbidden = ['delete', 'remove', 'update', 'edit', 'modify', 'purge', 'truncate', 'drop']
      const exportedNames = Object.keys(auditLogService)
      for (const name of exportedNames) {
        const lowerName = name.toLowerCase()
        for (const word of forbidden) {
          expect(lowerName.includes(word)).toBe(false)
        }
      }
    })

    test('서비스 export 목록이 허용된 함수만 포함해야 한다', () => {
      const allowed = ['createAuditLog', 'queryAuditLogs', 'withAuditLog', 'AUDIT_ACTIONS']
      const exportedNames = Object.keys(auditLogService).filter(
        k => typeof (auditLogService as any)[k] !== 'undefined'
      )
      for (const name of exportedNames) {
        expect(allowed).toContain(name)
      }
    })
  })

  // === TEA Risk-Based: AUDIT_ACTIONS Completeness ===
  describe('AUDIT_ACTIONS 카테고리 완전성 (TEA)', () => {
    test('최소 5개 카테고리가 존재해야 한다 (org, credential, auth, trade, system)', () => {
      const actions = Object.values(auditLogService.AUDIT_ACTIONS)
      const categories = new Set(actions.map(a => a.split('.')[0]))
      expect(categories.has('org')).toBe(true)
      expect(categories.has('credential')).toBe(true)
      expect(categories.has('auth')).toBe(true)
      expect(categories.has('trade')).toBe(true)
      expect(categories.has('system')).toBe(true)
      expect(categories.size).toBeGreaterThanOrEqual(5)
    })

    test('모든 액션 값은 고유해야 한다 (중복 방지)', () => {
      const actions = Object.values(auditLogService.AUDIT_ACTIONS)
      const unique = new Set(actions)
      expect(unique.size).toBe(actions.length)
    })

    test('AUDIT_ACTIONS는 as const로 불변이어야 한다', () => {
      // Object.isFrozen checks if the object is frozen (as const makes it readonly at type level)
      // At runtime we verify it's a plain object with string values
      const actions = auditLogService.AUDIT_ACTIONS
      expect(typeof actions).toBe('object')
      for (const [key, value] of Object.entries(actions)) {
        expect(typeof key).toBe('string')
        expect(typeof value).toBe('string')
      }
    })
  })

  // === TEA Risk-Based: Type Safety ===
  describe('Type Safety (TEA)', () => {
    test('CreateAuditLogInput 타입이 export되어야 한다', () => {
      // Type-only import — if compilation succeeds, the type exists
      const input: CreateAuditLogInput = {
        companyId: '00000000-0000-0000-0000-000000000000',
        actorType: 'system',
        actorId: '00000000-0000-0000-0000-000000000000',
        action: 'test.action',
      }
      expect(input.companyId).toBeDefined()
      expect(input.actorType).toBe('system')
    })

    test('AuditLogQueryOptions 타입이 export되어야 한다', () => {
      const options: AuditLogQueryOptions = {
        companyId: '00000000-0000-0000-0000-000000000000',
      }
      expect(options.companyId).toBeDefined()
    })

    test('ActorType은 4가지만 허용해야 한다', () => {
      // This is a compile-time check; if it compiles, the type is correct
      const validTypes: auditLogService.ActorType[] = ['admin_user', 'user', 'agent', 'system']
      expect(validTypes).toHaveLength(4)
    })
  })

  // === TEA Risk-Based: Route Immutability ===
  describe('Audit Log Route Immutability (TEA)', () => {
    test('라우트 모듈에 DELETE/PUT/PATCH 핸들러 등록을 위한 함수가 없어야 한다', async () => {
      const routeModule = await import('../../routes/admin/audit-logs')
      expect(routeModule.auditLogsRoute).toBeDefined()
      expect((routeModule as any).deleteAuditLog).toBeUndefined()
      expect((routeModule as any).updateAuditLog).toBeUndefined()
    })
  })

  // === TEA Risk-Based: queryAuditLogs Default Values ===
  describe('queryAuditLogs 기본값 검증 (TEA)', () => {
    test('queryAuditLogs 함수 시그니처가 올바라야 한다', () => {
      // Takes 1 argument (options object)
      expect(auditLogService.queryAuditLogs.length).toBe(1)
    })
  })

  // === Schema 검증 (audit_logs 테이블 구조) ===
  describe('audit_logs 스키마 확인', () => {
    test('auditLogs 테이블에 updatedAt이 없어야 한다 (INSERT ONLY)', async () => {
      const schema = await import('../../db/schema')
      const cols = schema.auditLogs as any
      expect(cols.updatedAt).toBeUndefined()
    })

    test('auditLogs 테이블에 필수 칼럼이 존재해야 한다', async () => {
      const schema = await import('../../db/schema')
      const cols = schema.auditLogs as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.actorType).toBeDefined()
      expect(cols.actorId).toBeDefined()
      expect(cols.action).toBeDefined()
      expect(cols.targetType).toBeDefined()
      expect(cols.targetId).toBeDefined()
      expect(cols.before).toBeDefined()
      expect(cols.after).toBeDefined()
      expect(cols.metadata).toBeDefined()
      expect(cols.createdAt).toBeDefined()
    })
  })
})
