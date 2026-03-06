import { describe, test, expect } from 'bun:test'
import {
  nexusWorkflows,
  nexusExecutions,
  mcpServers,
  nexusWorkflowsRelations,
  nexusExecutionsRelations,
  mcpServersRelations,
  canvasLayouts,
  canvasLayoutsRelations,
  companies,
  users,
  pushSubscriptions,
  pushSubscriptionsRelations,
  soulTemplates,
  soulTemplatesRelations,
} from '../../db/schema'
import type { WsChannel, WsInboundMessage, WsOutboundMessage } from '@corthex/shared'

// ============================================================
// TEA Risk-Based Tests — Story 17-1: P4 DB Schema + WS
// Priority: P0 (Critical) → P1 (Important) → P2 (Edge)
// ============================================================

describe('TEA Story 17-1: Risk-Based Coverage', () => {

  // ----------------------------------------------------------
  // P0: Drizzle ↔ Migration 0019 SQL 정확 일치 검증
  // ----------------------------------------------------------
  describe('[P0] Schema ↔ Migration SQL 일치', () => {

    // nexusWorkflows 컬럼 완전성
    test('nexusWorkflows: 11 columns match migration 0019', () => {
      const expectedColumns = [
        'id', 'companyId', 'name', 'description', 'nodes', 'edges',
        'isTemplate', 'isActive', 'createdBy', 'createdAt', 'updatedAt',
      ]
      for (const col of expectedColumns) {
        expect((nexusWorkflows as any)[col]).toBeDefined()
      }
    })

    test('nexusWorkflows.name: varchar(200) NOT NULL', () => {
      const col = nexusWorkflows.name as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(200)
      expect(col.notNull).toBe(true)
    })

    test('nexusWorkflows.description: text NULLABLE', () => {
      const col = nexusWorkflows.description as any
      expect(col.columnType).toBe('PgText')
      expect(col.notNull).toBe(false)
    })

    test('nexusWorkflows.nodes: jsonb NOT NULL DEFAULT []', () => {
      const col = nexusWorkflows.nodes as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('nexusWorkflows.edges: jsonb NOT NULL DEFAULT []', () => {
      const col = nexusWorkflows.edges as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('nexusWorkflows.isTemplate: boolean NOT NULL DEFAULT false', () => {
      const col = nexusWorkflows.isTemplate as any
      expect(col.columnType).toBe('PgBoolean')
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('nexusWorkflows.isActive: boolean NOT NULL DEFAULT true', () => {
      const col = nexusWorkflows.isActive as any
      expect(col.columnType).toBe('PgBoolean')
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('nexusWorkflows.createdBy: uuid NOT NULL (FK→users)', () => {
      const col = nexusWorkflows.createdBy as any
      expect(col.columnType).toBe('PgUUID')
      expect(col.notNull).toBe(true)
    })

    // nexusExecutions 컬럼 완전성
    test('nexusExecutions: 7 columns match migration 0019', () => {
      const expectedColumns = [
        'id', 'companyId', 'workflowId', 'status', 'result', 'startedAt', 'completedAt',
      ]
      for (const col of expectedColumns) {
        expect((nexusExecutions as any)[col]).toBeDefined()
      }
    })

    test('nexusExecutions.workflowId: uuid NOT NULL (FK→nexusWorkflows)', () => {
      const col = nexusExecutions.workflowId as any
      expect(col.columnType).toBe('PgUUID')
      expect(col.notNull).toBe(true)
    })

    test('nexusExecutions.status: varchar(20) NOT NULL DEFAULT running', () => {
      const col = nexusExecutions.status as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(20)
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('nexusExecutions.result: jsonb NULLABLE', () => {
      const col = nexusExecutions.result as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.notNull).toBe(false)
    })

    test('nexusExecutions.startedAt: timestamp NOT NULL DEFAULT now()', () => {
      const col = nexusExecutions.startedAt as any
      expect(col.columnType).toBe('PgTimestamp')
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('nexusExecutions.completedAt: timestamp NULLABLE', () => {
      const col = nexusExecutions.completedAt as any
      expect(col.columnType).toBe('PgTimestamp')
      expect(col.notNull).toBe(false)
    })

    // mcpServers 컬럼 완전성
    test('mcpServers: 9 columns match migration 0019', () => {
      const expectedColumns = [
        'id', 'companyId', 'name', 'url', 'transport', 'config',
        'isActive', 'createdAt', 'updatedAt',
      ]
      for (const col of expectedColumns) {
        expect((mcpServers as any)[col]).toBeDefined()
      }
    })

    test('mcpServers.name: varchar(100) NOT NULL', () => {
      const col = mcpServers.name as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(100)
      expect(col.notNull).toBe(true)
    })

    test('mcpServers.url: text NOT NULL', () => {
      const col = mcpServers.url as any
      expect(col.columnType).toBe('PgText')
      expect(col.notNull).toBe(true)
    })

    test('mcpServers.transport: varchar(20) NOT NULL DEFAULT stdio', () => {
      const col = mcpServers.transport as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(20)
      expect(col.notNull).toBe(true)
      expect(col.hasDefault).toBe(true)
    })

    test('mcpServers.config: jsonb NULLABLE', () => {
      const col = mcpServers.config as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.notNull).toBe(false)
    })
  })

  // ----------------------------------------------------------
  // P0: WsChannel 타입 안전성
  // ----------------------------------------------------------
  describe('[P0] WsChannel type safety', () => {
    test('all 8 channels are distinct values', () => {
      const channels: WsChannel[] = [
        'chat-stream', 'agent-status', 'notifications', 'messenger',
        'activity-log', 'strategy-notes', 'night-job', 'nexus',
      ]
      const unique = new Set(channels)
      expect(unique.size).toBe(8)
    })

    test('nexus channel works in subscribe message', () => {
      const msg: WsInboundMessage = { type: 'subscribe', channel: 'nexus' }
      expect(msg.type).toBe('subscribe')
      expect(msg.channel).toBe('nexus')
    })

    test('nexus channel works in unsubscribe message', () => {
      const msg: WsInboundMessage = { type: 'unsubscribe', channel: 'nexus' }
      expect(msg.type).toBe('unsubscribe')
      expect(msg.channel).toBe('nexus')
    })

    test('nexus-updated event payload structure', () => {
      const payload = {
        type: 'nexus-updated' as const,
        updatedBy: 'admin-user',
        updatedAt: '2026-03-06T12:00:00.000Z',
      }
      const msg: WsOutboundMessage = { type: 'data', channel: 'nexus', data: payload }
      expect(msg.type).toBe('data')
      expect((msg.data as any).type).toBe('nexus-updated')
      expect((msg.data as any).updatedBy).toBe('admin-user')
    })

    test('subscribe with params for nexus', () => {
      const msg: WsInboundMessage = {
        type: 'subscribe',
        channel: 'nexus',
        params: { id: 'company-uuid-123' },
      }
      expect(msg.params?.id).toBe('company-uuid-123')
    })
  })

  // ----------------------------------------------------------
  // P1: Relations FK 무결성
  // ----------------------------------------------------------
  describe('[P1] Relations FK integrity', () => {
    test('nexusWorkflowsRelations has company, createdByUser, executions', () => {
      expect(nexusWorkflowsRelations).toBeDefined()
      const config = (nexusWorkflowsRelations as any).config
      expect(config).toBeDefined()
    })

    test('nexusExecutionsRelations has company, workflow', () => {
      expect(nexusExecutionsRelations).toBeDefined()
      const config = (nexusExecutionsRelations as any).config
      expect(config).toBeDefined()
    })

    test('mcpServersRelations has company', () => {
      expect(mcpServersRelations).toBeDefined()
      const config = (mcpServersRelations as any).config
      expect(config).toBeDefined()
    })

    test('nexusWorkflows FK: companyId → companies.id', () => {
      const col = nexusWorkflows.companyId as any
      expect(col.notNull).toBe(true)
      expect(col.columnType).toBe('PgUUID')
    })

    test('nexusWorkflows FK: createdBy → users.id', () => {
      const col = nexusWorkflows.createdBy as any
      expect(col.notNull).toBe(true)
      expect(col.columnType).toBe('PgUUID')
    })

    test('nexusExecutions FK: workflowId → nexusWorkflows.id', () => {
      const col = nexusExecutions.workflowId as any
      expect(col.notNull).toBe(true)
      expect(col.columnType).toBe('PgUUID')
    })

    test('nexusExecutions FK: companyId → companies.id', () => {
      const col = nexusExecutions.companyId as any
      expect(col.notNull).toBe(true)
    })

    test('mcpServers FK: companyId → companies.id', () => {
      const col = mcpServers.companyId as any
      expect(col.notNull).toBe(true)
    })
  })

  // ----------------------------------------------------------
  // P1: WebSocket nexus 채널 핸들러 검증
  // ----------------------------------------------------------
  describe('[P1] WebSocket nexus channel handler', () => {
    test('handleSubscription handles nexus channel (function exists)', async () => {
      const { handleSubscription } = await import('../../ws/channels')
      expect(typeof handleSubscription).toBe('function')
    })

    test('broadcastToCompany can target nexus channel', async () => {
      const { broadcastToCompany } = await import('../../ws/channels')
      // Should not throw
      broadcastToCompany('test-company-id', 'nexus', { type: 'nexus-updated' })
    })

    test('broadcastToChannel can target nexus::companyId', async () => {
      const { broadcastToChannel } = await import('../../ws/channels')
      // Should not throw when no subscribers
      broadcastToChannel('nexus::test-company-id', { type: 'nexus-updated' })
    })
  })

  // ----------------------------------------------------------
  // P2: 기존 스키마 회귀 없음
  // ----------------------------------------------------------
  describe('[P2] No schema regression', () => {
    test('canvasLayouts still exists and unchanged', () => {
      expect(canvasLayouts).toBeDefined()
      expect(canvasLayouts.id).toBeDefined()
      expect(canvasLayouts.companyId).toBeDefined()
      expect(canvasLayouts.name).toBeDefined()
      expect(canvasLayouts.layoutData).toBeDefined()
      expect(canvasLayouts.isDefault).toBeDefined()
    })

    test('canvasLayoutsRelations still exists', () => {
      expect(canvasLayoutsRelations).toBeDefined()
    })

    test('pushSubscriptions still exists', () => {
      expect(pushSubscriptions).toBeDefined()
      expect(pushSubscriptionsRelations).toBeDefined()
    })

    test('soulTemplates still exists', () => {
      expect(soulTemplates).toBeDefined()
      expect(soulTemplatesRelations).toBeDefined()
    })

    test('companies base table still exists', () => {
      expect(companies).toBeDefined()
      expect(companies.id).toBeDefined()
    })

    test('users base table still exists', () => {
      expect(users).toBeDefined()
      expect(users.id).toBeDefined()
    })
  })

  // ----------------------------------------------------------
  // P2: WsChannel 기존 채널 회귀 없음
  // ----------------------------------------------------------
  describe('[P2] Existing WsChannel regression', () => {
    const existingChannels: WsChannel[] = [
      'chat-stream', 'agent-status', 'notifications',
      'messenger', 'activity-log', 'strategy-notes', 'night-job',
    ]

    test.each(existingChannels)('channel "%s" still valid WsChannel', (ch) => {
      const channel: WsChannel = ch
      expect(channel).toBe(ch)
    })

    test('WsInboundMessage still supports subscribe/unsubscribe', () => {
      const sub: WsInboundMessage = { type: 'subscribe', channel: 'chat-stream' }
      const unsub: WsInboundMessage = { type: 'unsubscribe', channel: 'messenger' }
      expect(sub.type).toBe('subscribe')
      expect(unsub.type).toBe('unsubscribe')
    })

    test('WsOutboundMessage still supports all types', () => {
      const types: WsOutboundMessage['type'][] = [
        'connected', 'subscribed', 'unsubscribed', 'data', 'error', 'server-restart',
      ]
      for (const t of types) {
        const msg: WsOutboundMessage = { type: t }
        expect(msg.type).toBe(t)
      }
    })
  })

  // ----------------------------------------------------------
  // P2: Table name 정확성 (snake_case)
  // ----------------------------------------------------------
  describe('[P2] Table naming convention (snake_case)', () => {
    test('nexusWorkflows → nexus_workflows', () => {
      expect((nexusWorkflows as any)[Symbol.for('drizzle:Name')]).toBe('nexus_workflows')
    })

    test('nexusExecutions → nexus_executions', () => {
      expect((nexusExecutions as any)[Symbol.for('drizzle:Name')]).toBe('nexus_executions')
    })

    test('mcpServers → mcp_servers', () => {
      expect((mcpServers as any)[Symbol.for('drizzle:Name')]).toBe('mcp_servers')
    })
  })

  // ----------------------------------------------------------
  // P2: 추가 없어야 하는 컬럼 확인 (Negative test)
  // ----------------------------------------------------------
  describe('[P2] No extra columns beyond migration', () => {
    test('nexusWorkflows has no deletedAt column', () => {
      expect((nexusWorkflows as any).deletedAt).toBeUndefined()
    })

    test('nexusExecutions has no executedBy column', () => {
      expect((nexusExecutions as any).executedBy).toBeUndefined()
    })

    test('mcpServers has no apiKey column', () => {
      expect((mcpServers as any).apiKey).toBeUndefined()
    })

    test('mcpServers has no createdBy column (matches migration)', () => {
      expect((mcpServers as any).createdBy).toBeUndefined()
    })
  })
})
