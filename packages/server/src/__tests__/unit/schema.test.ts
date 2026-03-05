import { describe, expect, test } from 'bun:test'
import * as schema from '../../db/schema'

describe('P1 DB Schema', () => {
  // === Task 1: 누락된 P1 테이블 존재 확인 ===
  describe('신규 P1 테이블', () => {
    test('admin_users 테이블이 존재해야 한다', () => {
      expect(schema.adminUsers).toBeDefined()
      // 필수 컬럼 확인
      const cols = schema.adminUsers as any
      expect(cols.id).toBeDefined()
      expect(cols.username).toBeDefined()
      expect(cols.passwordHash).toBeDefined()
      expect(cols.name).toBeDefined()
      expect(cols.role).toBeDefined()
      expect(cols.isActive).toBeDefined()
      expect(cols.createdAt).toBeDefined()
    })

    test('sessions 테이블이 존재해야 한다', () => {
      expect(schema.sessions).toBeDefined()
      const cols = schema.sessions as any
      expect(cols.id).toBeDefined()
      expect(cols.userId).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.token).toBeDefined()
      expect(cols.expiresAt).toBeDefined()
      expect(cols.createdAt).toBeDefined()
    })

    test('admin_sessions 테이블이 존재해야 한다', () => {
      expect(schema.adminSessions).toBeDefined()
      const cols = schema.adminSessions as any
      expect(cols.id).toBeDefined()
      expect(cols.adminUserId).toBeDefined()
      expect(cols.token).toBeDefined()
      expect(cols.expiresAt).toBeDefined()
      expect(cols.createdAt).toBeDefined()
    })

    test('notification_preferences 테이블이 존재해야 한다', () => {
      expect(schema.notificationPreferences).toBeDefined()
      const cols = schema.notificationPreferences as any
      expect(cols.id).toBeDefined()
      expect(cols.userId).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.inApp).toBeDefined()
      expect(cols.email).toBeDefined()
      expect(cols.push).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.updatedAt).toBeDefined()
    })
  })

  // === Task 2: api_keys 스키마 수정 확인 ===
  describe('api_keys 스키마 수정', () => {
    test('credentials JSONB 컬럼이 존재해야 한다', () => {
      const cols = schema.apiKeys as any
      expect(cols.credentials).toBeDefined()
    })

    test('scope ENUM 컬럼이 존재해야 한다', () => {
      expect(schema.apiKeyScopeEnum).toBeDefined()
      const cols = schema.apiKeys as any
      expect(cols.scope).toBeDefined()
    })

    test('encryptedKey 컬럼이 제거되어야 한다', () => {
      const cols = schema.apiKeys as any
      expect(cols.encryptedKey).toBeUndefined()
    })
  })

  // === Task 3: activity_logs 스키마 수정 확인 ===
  describe('activity_logs 스키마 수정', () => {
    test('event_id UUID UNIQUE 컬럼이 존재해야 한다', () => {
      const cols = schema.activityLogs as any
      expect(cols.eventId).toBeDefined()
    })

    test('phase ENUM 컬럼이 존재해야 한다', () => {
      expect(schema.activityPhaseEnum).toBeDefined()
      const cols = schema.activityLogs as any
      expect(cols.phase).toBeDefined()
    })

    test('userId nullable FK 컬럼이 존재해야 한다', () => {
      const cols = schema.activityLogs as any
      expect(cols.userId).toBeDefined()
    })

    test('agentId nullable FK 컬럼이 존재해야 한다', () => {
      const cols = schema.activityLogs as any
      expect(cols.agentId).toBeDefined()
    })
  })

  // === Task 4: tools → tool_definitions 리네임 확인 ===
  describe('tool_definitions 리네임', () => {
    test('toolDefinitions export가 존재해야 한다', () => {
      expect(schema.toolDefinitions).toBeDefined()
    })

    test('기존 tools export는 제거되어야 한다', () => {
      expect((schema as any).tools).toBeUndefined()
    })
  })

  // === Task 5: 인덱스 확인 ===
  describe('인덱스 정의', () => {
    test('모든 P1 테이블에 company_id 컬럼이 존재해야 한다', () => {
      const p1Tables = [
        schema.companies, schema.adminUsers, schema.users, schema.sessions,
        schema.adminSessions, schema.departments, schema.agents, schema.apiKeys,
        schema.reportLines, schema.agentTools, schema.toolDefinitions,
        schema.chatSessions, schema.chatMessages, schema.activityLogs,
        schema.notificationPreferences,
      ]

      for (const table of p1Tables) {
        const cols = table as any
        // companies는 tenant root, adminUsers/adminSessions는 시스템 레벨이므로 companyId 없음
        if (table === schema.companies || table === schema.adminUsers || table === schema.adminSessions) continue
        expect(cols.companyId).toBeDefined()
      }
    })
  })
})
