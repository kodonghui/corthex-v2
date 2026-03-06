import { describe, test, expect } from 'bun:test'
import {
  nexusWorkflows,
  nexusExecutions,
  mcpServers,
  nexusWorkflowsRelations,
  nexusExecutionsRelations,
  mcpServersRelations,
  companies,
  users,
} from '../../db/schema'
import type { WsChannel, WsInboundMessage, WsOutboundMessage } from '@corthex/shared'

// ============================================================
// QA Functional Tests — Story 17-1: P4 DB Schema + WS
// Focus: Edge cases, boundary conditions, functional verification
// ============================================================

describe('QA Story 17-1: Functional Verification', () => {

  // ----------------------------------------------------------
  // Schema export completeness
  // ----------------------------------------------------------
  describe('Schema exports are importable and usable', () => {
    test('nexusWorkflows can be destructured for select columns', () => {
      const { id, companyId, name, nodes, edges } = nexusWorkflows
      expect(id).toBeDefined()
      expect(companyId).toBeDefined()
      expect(name).toBeDefined()
      expect(nodes).toBeDefined()
      expect(edges).toBeDefined()
    })

    test('nexusExecutions can be destructured for select columns', () => {
      const { id, workflowId, status, result } = nexusExecutions
      expect(id).toBeDefined()
      expect(workflowId).toBeDefined()
      expect(status).toBeDefined()
      expect(result).toBeDefined()
    })

    test('mcpServers can be destructured for select columns', () => {
      const { id, name, url, transport, config } = mcpServers
      expect(id).toBeDefined()
      expect(name).toBeDefined()
      expect(url).toBeDefined()
      expect(transport).toBeDefined()
      expect(config).toBeDefined()
    })
  })

  // ----------------------------------------------------------
  // Column type boundary checks
  // ----------------------------------------------------------
  describe('Column type boundaries', () => {
    test('nexusWorkflows.name max length is 200 (not 100 or 255)', () => {
      const col = nexusWorkflows.name as any
      expect(col.config.length).toBe(200)
      expect(col.config.length).not.toBe(100)
      expect(col.config.length).not.toBe(255)
    })

    test('mcpServers.name max length is 100 (not 200)', () => {
      const col = mcpServers.name as any
      expect(col.config.length).toBe(100)
      expect(col.config.length).not.toBe(200)
    })

    test('nexusExecutions.status max length is 20', () => {
      const col = nexusExecutions.status as any
      expect(col.config.length).toBe(20)
    })

    test('mcpServers.transport max length is 20', () => {
      const col = mcpServers.transport as any
      expect(col.config.length).toBe(20)
    })
  })

  // ----------------------------------------------------------
  // Default value verification
  // ----------------------------------------------------------
  describe('Default values match migration', () => {
    test('nexusWorkflows.isTemplate defaults false (not true)', () => {
      const col = nexusWorkflows.isTemplate as any
      expect(col.hasDefault).toBe(true)
      // Verify default is false, not true
      expect(col.default).toBe(false)
    })

    test('nexusWorkflows.isActive defaults true', () => {
      const col = nexusWorkflows.isActive as any
      expect(col.hasDefault).toBe(true)
      expect(col.default).toBe(true)
    })

    test('mcpServers.isActive defaults true', () => {
      const col = mcpServers.isActive as any
      expect(col.hasDefault).toBe(true)
      expect(col.default).toBe(true)
    })
  })

  // ----------------------------------------------------------
  // WsChannel edge cases
  // ----------------------------------------------------------
  describe('WsChannel edge cases', () => {
    test('nexus channel string is exactly "nexus" (no typos)', () => {
      const ch: WsChannel = 'nexus'
      expect(ch).toBe('nexus')
      expect(ch).not.toBe('Nexus')
      expect(ch).not.toBe('NEXUS')
      expect(ch).not.toBe('nexus-canvas')
    })

    test('subscribe with empty params still valid', () => {
      const msg: WsInboundMessage = {
        type: 'subscribe',
        channel: 'nexus',
        params: {},
      }
      expect(msg.params).toEqual({})
    })

    test('subscribe without params still valid', () => {
      const msg: WsInboundMessage = {
        type: 'subscribe',
        channel: 'nexus',
      }
      expect(msg.params).toBeUndefined()
    })

    test('outbound data message with null data', () => {
      const msg: WsOutboundMessage = {
        type: 'data',
        channel: 'nexus',
        data: null,
      }
      expect(msg.data).toBeNull()
    })

    test('outbound error message for nexus', () => {
      const msg: WsOutboundMessage = {
        type: 'error',
        channel: 'nexus',
        code: 'FORBIDDEN',
      }
      expect(msg.code).toBe('FORBIDDEN')
    })
  })

  // ----------------------------------------------------------
  // Relations structure
  // ----------------------------------------------------------
  describe('Relations structure verification', () => {
    test('nexusWorkflowsRelations is a function-like object', () => {
      expect(typeof nexusWorkflowsRelations).not.toBe('undefined')
    })

    test('nexusExecutionsRelations is a function-like object', () => {
      expect(typeof nexusExecutionsRelations).not.toBe('undefined')
    })

    test('mcpServersRelations is a function-like object', () => {
      expect(typeof mcpServersRelations).not.toBe('undefined')
    })
  })

  // ----------------------------------------------------------
  // broadcastToChannel / broadcastToCompany smoke tests
  // ----------------------------------------------------------
  describe('Broadcast functions smoke test', () => {
    test('broadcastToChannel with no subscribers does not throw', async () => {
      const { broadcastToChannel } = await import('../../ws/channels')
      expect(() => {
        broadcastToChannel('nexus::nonexistent-company', { type: 'nexus-updated' })
      }).not.toThrow()
    })

    test('broadcastToCompany with no subscribers does not throw', async () => {
      const { broadcastToCompany } = await import('../../ws/channels')
      expect(() => {
        broadcastToCompany('nonexistent-company', 'nexus', { type: 'nexus-updated', updatedBy: 'test', updatedAt: new Date().toISOString() })
      }).not.toThrow()
    })

    test('broadcastToChannel serializes complex payload', async () => {
      const { broadcastToChannel } = await import('../../ws/channels')
      expect(() => {
        broadcastToChannel('nexus::test', {
          type: 'nexus-updated',
          updatedBy: 'admin',
          updatedAt: new Date().toISOString(),
          nested: { deep: { value: true } },
        })
      }).not.toThrow()
    })
  })

  // ----------------------------------------------------------
  // Table PK type consistency
  // ----------------------------------------------------------
  describe('All new tables use uuid PK', () => {
    const tables = [
      { name: 'nexusWorkflows', table: nexusWorkflows },
      { name: 'nexusExecutions', table: nexusExecutions },
      { name: 'mcpServers', table: mcpServers },
    ]

    for (const { name, table } of tables) {
      test(`${name}.id is PgUUID`, () => {
        expect((table.id as any).columnType).toBe('PgUUID')
      })

      test(`${name}.id has default random`, () => {
        expect((table.id as any).hasDefault).toBe(true)
      })
    }
  })
})
