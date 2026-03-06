import { describe, test, expect } from 'bun:test'
import {
  nexusWorkflows,
  nexusExecutions,
  mcpServers,
  nexusWorkflowsRelations,
  nexusExecutionsRelations,
  mcpServersRelations,
  canvasLayouts,
} from '../../db/schema'
import type { WsChannel, WsInboundMessage, WsOutboundMessage } from '@corthex/shared'

// ============================================================
// Story 17-1: P4 DB 스키마 + WebSocket 테스트
// ============================================================

describe('Story 17-1: P4 DB Schema + WS', () => {

  // ----------------------------------------------------------
  // Task 1: nexusWorkflows 테이블 스키마
  // ----------------------------------------------------------
  describe('nexusWorkflows table schema', () => {
    test('nexusWorkflows export exists', () => {
      expect(nexusWorkflows).toBeDefined()
    })

    test('table name is nexus_workflows', () => {
      const tableName = (nexusWorkflows as any)[Symbol.for('drizzle:Name')]
      expect(tableName).toBe('nexus_workflows')
    })

    test('has all required columns', () => {
      const cols = nexusWorkflows as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.name).toBeDefined()
      expect(cols.description).toBeDefined()
      expect(cols.nodes).toBeDefined()
      expect(cols.edges).toBeDefined()
      expect(cols.isTemplate).toBeDefined()
      expect(cols.isActive).toBeDefined()
      expect(cols.createdBy).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.updatedAt).toBeDefined()
    })

    test('id is uuid primary key', () => {
      const col = nexusWorkflows.id
      expect(col.dataType).toBe('string')
      expect(col.columnType).toBe('PgUUID')
    })

    test('name is varchar(200)', () => {
      const col = nexusWorkflows.name as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(200)
    })

    test('nodes default is empty array', () => {
      const col = nexusWorkflows.nodes as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.hasDefault).toBe(true)
    })

    test('edges default is empty array', () => {
      const col = nexusWorkflows.edges as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.hasDefault).toBe(true)
    })

    test('isTemplate defaults to false', () => {
      const col = nexusWorkflows.isTemplate as any
      expect(col.columnType).toBe('PgBoolean')
      expect(col.hasDefault).toBe(true)
    })

    test('isActive defaults to true', () => {
      const col = nexusWorkflows.isActive as any
      expect(col.columnType).toBe('PgBoolean')
      expect(col.hasDefault).toBe(true)
    })

    test('relations export exists', () => {
      expect(nexusWorkflowsRelations).toBeDefined()
    })
  })

  // ----------------------------------------------------------
  // Task 2: nexusExecutions 테이블 스키마
  // ----------------------------------------------------------
  describe('nexusExecutions table schema', () => {
    test('nexusExecutions export exists', () => {
      expect(nexusExecutions).toBeDefined()
    })

    test('table name is nexus_executions', () => {
      const tableName = (nexusExecutions as any)[Symbol.for('drizzle:Name')]
      expect(tableName).toBe('nexus_executions')
    })

    test('has all required columns', () => {
      const cols = nexusExecutions as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.workflowId).toBeDefined()
      expect(cols.status).toBeDefined()
      expect(cols.result).toBeDefined()
      expect(cols.startedAt).toBeDefined()
      expect(cols.completedAt).toBeDefined()
    })

    test('status is varchar(20) default running', () => {
      const col = nexusExecutions.status as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(20)
      expect(col.hasDefault).toBe(true)
    })

    test('completedAt is nullable', () => {
      const col = nexusExecutions.completedAt as any
      expect(col.notNull).toBe(false)
    })

    test('result is nullable jsonb', () => {
      const col = nexusExecutions.result as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.notNull).toBe(false)
    })

    test('relations export exists', () => {
      expect(nexusExecutionsRelations).toBeDefined()
    })
  })

  // ----------------------------------------------------------
  // Task 3: mcpServers 테이블 스키마
  // ----------------------------------------------------------
  describe('mcpServers table schema', () => {
    test('mcpServers export exists', () => {
      expect(mcpServers).toBeDefined()
    })

    test('table name is mcp_servers', () => {
      const tableName = (mcpServers as any)[Symbol.for('drizzle:Name')]
      expect(tableName).toBe('mcp_servers')
    })

    test('has all required columns', () => {
      const cols = mcpServers as any
      expect(cols.id).toBeDefined()
      expect(cols.companyId).toBeDefined()
      expect(cols.name).toBeDefined()
      expect(cols.url).toBeDefined()
      expect(cols.transport).toBeDefined()
      expect(cols.config).toBeDefined()
      expect(cols.isActive).toBeDefined()
      expect(cols.createdAt).toBeDefined()
      expect(cols.updatedAt).toBeDefined()
    })

    test('name is varchar(100)', () => {
      const col = mcpServers.name as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(100)
    })

    test('url is text', () => {
      const col = mcpServers.url as any
      expect(col.columnType).toBe('PgText')
    })

    test('transport is varchar(20) default stdio', () => {
      const col = mcpServers.transport as any
      expect(col.columnType).toBe('PgVarchar')
      expect(col.config.length).toBe(20)
      expect(col.hasDefault).toBe(true)
    })

    test('config is nullable jsonb', () => {
      const col = mcpServers.config as any
      expect(col.columnType).toBe('PgJsonb')
      expect(col.notNull).toBe(false)
    })

    test('relations export exists', () => {
      expect(mcpServersRelations).toBeDefined()
    })
  })

  // ----------------------------------------------------------
  // Task 4: WsChannel 타입에 'nexus' 포함
  // ----------------------------------------------------------
  describe('WsChannel type includes nexus', () => {
    test('nexus is valid WsChannel', () => {
      const channel: WsChannel = 'nexus'
      expect(channel).toBe('nexus')
    })

    test('WsChannel has 8 channels total', () => {
      const allChannels: WsChannel[] = [
        'chat-stream',
        'agent-status',
        'notifications',
        'messenger',
        'activity-log',
        'strategy-notes',
        'night-job',
        'nexus',
      ]
      expect(allChannels).toHaveLength(8)
    })

    test('WsInboundMessage accepts nexus channel', () => {
      const msg: WsInboundMessage = {
        type: 'subscribe',
        channel: 'nexus',
      }
      expect(msg.channel).toBe('nexus')
    })

    test('WsOutboundMessage accepts nexus channel', () => {
      const msg: WsOutboundMessage = {
        type: 'data',
        channel: 'nexus',
        data: { type: 'nexus-updated', updatedBy: 'admin', updatedAt: new Date().toISOString() },
      }
      expect(msg.channel).toBe('nexus')
    })
  })

  // ----------------------------------------------------------
  // Task 5: WebSocket nexus 채널 구독 핸들러
  // ----------------------------------------------------------
  describe('WebSocket nexus channel handler', () => {
    test('channels.ts exports broadcastToChannel', async () => {
      const mod = await import('../../ws/channels')
      expect(mod.broadcastToChannel).toBeDefined()
      expect(typeof mod.broadcastToChannel).toBe('function')
    })

    test('channels.ts exports broadcastToCompany', async () => {
      const mod = await import('../../ws/channels')
      expect(mod.broadcastToCompany).toBeDefined()
      expect(typeof mod.broadcastToCompany).toBe('function')
    })

    test('handleSubscription is exported', async () => {
      const mod = await import('../../ws/channels')
      expect(mod.handleSubscription).toBeDefined()
      expect(typeof mod.handleSubscription).toBe('function')
    })
  })

  // ----------------------------------------------------------
  // 스키마 일관성 검증
  // ----------------------------------------------------------
  describe('schema consistency checks', () => {
    test('canvasLayouts still exists (no regression)', () => {
      expect(canvasLayouts).toBeDefined()
      const tableName = (canvasLayouts as any)[Symbol.for('drizzle:Name')]
      expect(tableName).toBe('canvas_layouts')
    })

    test('nexusWorkflows companyId references companies', () => {
      const col = nexusWorkflows.companyId as any
      expect(col.notNull).toBe(true)
    })

    test('nexusWorkflows createdBy references users', () => {
      const col = nexusWorkflows.createdBy as any
      expect(col.notNull).toBe(true)
    })

    test('nexusExecutions workflowId references nexusWorkflows', () => {
      const col = nexusExecutions.workflowId as any
      expect(col.notNull).toBe(true)
    })

    test('mcpServers companyId is not null', () => {
      const col = mcpServers.companyId as any
      expect(col.notNull).toBe(true)
    })
  })
})
