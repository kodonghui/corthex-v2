import { describe, expect, test } from 'bun:test'
import * as schema from '../../db/schema'

describe('Phase 1 Schema Extension (Epic 1 Story 1)', () => {
  // === Task 1: 신규 테이블 존재 확인 ===
  describe('신규 Phase 1 테이블', () => {
    test('commands 테이블이 존재해야 한다', () => {
      expect(schema.commands).toBeDefined()
      const cols = schema.commands as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.userId).toBeDefined()
      expect(cols.type).toBeDefined()
      expect(cols.text).toBeDefined()
      expect(cols.targetAgentId).toBeDefined()
      expect(cols.status).toBeDefined()
      expect(cols.result).toBeDefined()
      expect(cols.metadata).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.completedAt).toBeDefined()
    })

    test('orchestrationTasks 테이블이 존재해야 한다', () => {
      expect(schema.orchestrationTasks).toBeDefined()
      const cols = schema.orchestrationTasks as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.commandId).toBeDefined()
      expect(cols.agentId).toBeDefined()
      expect(cols.parentTaskId).toBeDefined()
      expect(cols.type).toBeDefined()
      expect(cols.input).toBeDefined()
      expect(cols.output).toBeDefined()
      expect(cols.status).toBeDefined()
      expect(cols.startedAt).toBeDefined()
      expect(cols.completedAt).toBeDefined()
      expect(cols.durationMs).toBeDefined()
      expect(cols.metadata).toBeDefined()
      expect(cols.createdAt).toBeDefined()
    })

    test('qualityReviews 테이블이 존재해야 한다', () => {
      expect(schema.qualityReviews).toBeDefined()
      const cols = schema.qualityReviews as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.commandId).toBeDefined()
      expect(cols.taskId).toBeDefined()
      expect(cols.reviewerAgentId).toBeDefined()
      expect(cols.conclusion).toBeDefined()
      expect(cols.scores).toBeDefined()
      expect(cols.feedback).toBeDefined()
      expect(cols.attemptNumber).toBeDefined()
      expect(cols.createdAt).toBeDefined()
    })

    test('presets 테이블이 존재해야 한다', () => {
      expect(schema.presets).toBeDefined()
      const cols = schema.presets as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.userId).toBeDefined()
      expect(cols.name).toBeDefined()
      expect(cols.description).toBeDefined()
      expect(cols.command).toBeDefined()
      expect(cols.category).toBeDefined()
      expect(cols.isGlobal).toBeDefined()
      expect(cols.sortOrder).toBeDefined()
      expect(cols.isActive).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.updatedAt).toBeDefined()
    })

    test('orgTemplates 테이블이 존재해야 한다', () => {
      expect(schema.orgTemplates).toBeDefined()
      const cols = schema.orgTemplates as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.name).toBeDefined()
      expect(cols.description).toBeDefined()
      expect(cols.templateData).toBeDefined()
      expect(cols.isBuiltin).toBeDefined()
      expect(cols.isActive).toBeDefined()
      expect(cols.createdBy).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.updatedAt).toBeDefined()
    })

    test('auditLogs 테이블이 존재해야 한다', () => {
      expect(schema.auditLogs).toBeDefined()
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

    test('auditLogs에는 updatedAt이 없어야 한다 (INSERT ONLY)', () => {
      const cols = schema.auditLogs as any
      expect(cols.updatedAt).toBeUndefined()
    })
  })

  // === Task 2: agents 테이블 확장 ===
  describe('agents 테이블 확장', () => {
    test('isSystem boolean 칼럼이 존재해야 한다', () => {
      const cols = schema.agents as any
      expect(cols.isSystem).toBeDefined()
    })

    test('allowedTools jsonb 칼럼이 존재해야 한다', () => {
      const cols = schema.agents as any
      expect(cols.allowedTools).toBeDefined()
    })

    test('기존 isSecretary 칼럼이 유지되어야 한다', () => {
      const cols = schema.agents as any
      expect(cols.isSecretary).toBeDefined()
    })
  })

  // === Task 3: 신규 Enum 확인 ===
  describe('Phase 1 신규 Enum', () => {
    test('commandTypeEnum이 존재해야 한다', () => {
      expect(schema.commandTypeEnum).toBeDefined()
    })

    test('orchestrationTaskStatusEnum이 존재해야 한다', () => {
      expect(schema.orchestrationTaskStatusEnum).toBeDefined()
    })

    test('qualityResultEnum이 존재해야 한다', () => {
      expect(schema.qualityResultEnum).toBeDefined()
    })
  })

  // === Task 4: Relations 확인 ===
  describe('Phase 1 Relations', () => {
    test('commandsRelations이 존재해야 한다', () => {
      expect(schema.commandsRelations).toBeDefined()
    })

    test('orchestrationTasksRelations이 존재해야 한다', () => {
      expect(schema.orchestrationTasksRelations).toBeDefined()
    })

    test('qualityReviewsRelations이 존재해야 한다', () => {
      expect(schema.qualityReviewsRelations).toBeDefined()
    })

    test('presetsRelations이 존재해야 한다', () => {
      expect(schema.presetsRelations).toBeDefined()
    })

    test('orgTemplatesRelations이 존재해야 한다', () => {
      expect(schema.orgTemplatesRelations).toBeDefined()
    })

    test('auditLogsRelations이 존재해야 한다', () => {
      expect(schema.auditLogsRelations).toBeDefined()
    })
  })

  // === Task 5: 모든 신규 테이블에 companyId 존재 확인 ===
  describe('테넌트 격리 (companyId)', () => {
    test('모든 신규 Phase 1 테이블에 companyId가 존재해야 한다', () => {
      const newTables = [
        schema.commands,
        schema.orchestrationTasks,
        schema.qualityReviews,
        schema.presets,
        schema.orgTemplates,
        schema.auditLogs,
      ]
      for (const table of newTables) {
        const cols = table as any
        expect(cols.companyId).toBeDefined()
      }
    })
  })
})
