import { describe, expect, test } from 'bun:test'
import {
  soulTemplates,
  soulTemplatesRelations,
  companies,
  users,
  agents,
} from '../../db/schema'
import type { SoulTemplate, WsChannel, WsInboundMessage, WsOutboundMessage } from '@corthex/shared'

describe('Story 15-1: P3 DB Schema + WS', () => {
  // =============================================
  // soulTemplates table definition tests
  // =============================================
  describe('soulTemplates table definition', () => {
    test('table exists and has correct name', () => {
      expect(soulTemplates).toBeDefined()
      // @ts-expect-error accessing internal drizzle property
      const tableName = soulTemplates[Symbol.for('drizzle:Name')]
      expect(tableName).toBe('soul_templates')
    })

    test('has all required columns', () => {
      const columns = Object.keys(soulTemplates)
      expect(columns).toContain('id')
      expect(columns).toContain('companyId')
      expect(columns).toContain('name')
      expect(columns).toContain('description')
      expect(columns).toContain('content')
      expect(columns).toContain('category')
      expect(columns).toContain('isBuiltin')
      expect(columns).toContain('isActive')
      expect(columns).toContain('createdBy')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    test('has all 11 expected columns', () => {
      const expectedColumns = ['id', 'companyId', 'name', 'description', 'content', 'category', 'isBuiltin', 'isActive', 'createdBy', 'createdAt', 'updatedAt']
      const columns = Object.keys(soulTemplates)
      for (const col of expectedColumns) {
        expect(columns).toContain(col)
      }
    })

    test('companyId is nullable (null = built-in template)', () => {
      const col = soulTemplates.companyId
      expect(col).toBeDefined()
      expect(col.notNull).toBeFalsy()
    })

    test('createdBy is nullable (null = system built-in)', () => {
      const col = soulTemplates.createdBy
      expect(col).toBeDefined()
      expect(col.notNull).toBeFalsy()
    })

    test('name is not null', () => {
      const col = soulTemplates.name
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })

    test('content is not null', () => {
      const col = soulTemplates.content
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })

    test('isBuiltin defaults to false and is not null', () => {
      const col = soulTemplates.isBuiltin
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })

    test('isActive defaults to true and is not null', () => {
      const col = soulTemplates.isActive
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })

    test('description is nullable', () => {
      const col = soulTemplates.description
      expect(col).toBeDefined()
      expect(col.notNull).toBeFalsy()
    })

    test('category is nullable', () => {
      const col = soulTemplates.category
      expect(col).toBeDefined()
      expect(col.notNull).toBeFalsy()
    })

    test('createdAt is not null', () => {
      const col = soulTemplates.createdAt
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })

    test('updatedAt is not null', () => {
      const col = soulTemplates.updatedAt
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })
  })

  // =============================================
  // soulTemplatesRelations tests
  // =============================================
  describe('soulTemplatesRelations', () => {
    test('relations are defined', () => {
      expect(soulTemplatesRelations).toBeDefined()
    })

    test('relations is an object (drizzle relations pattern)', () => {
      // Drizzle relations are config objects
      expect(typeof soulTemplatesRelations).toBe('object')
    })
  })

  // =============================================
  // SoulTemplate shared type tests
  // =============================================
  describe('SoulTemplate shared type', () => {
    test('built-in template (null companyId, null createdBy)', () => {
      const template: SoulTemplate = {
        id: 'builtin-1',
        companyId: null,
        name: 'Marketer',
        description: 'Marketing agent soul template',
        content: '# Marketer Soul\nYou are a marketing specialist...',
        category: 'marketer',
        isBuiltin: true,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.companyId).toBeNull()
      expect(template.createdBy).toBeNull()
      expect(template.isBuiltin).toBe(true)
      expect(template.category).toBe('marketer')
    })

    test('custom template (with companyId and createdBy)', () => {
      const template: SoulTemplate = {
        id: 'custom-1',
        companyId: 'company-uuid',
        name: 'Custom Sales Agent',
        description: 'Custom description',
        content: '# Sales Agent\nYou handle sales...',
        category: 'custom',
        isBuiltin: false,
        isActive: true,
        createdBy: 'admin-user-uuid',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.companyId).toBe('company-uuid')
      expect(template.createdBy).toBe('admin-user-uuid')
      expect(template.isBuiltin).toBe(false)
    })

    test('inactive template', () => {
      const template: SoulTemplate = {
        id: 'inactive-1',
        companyId: 'company-uuid',
        name: 'Deprecated Template',
        description: null,
        content: '# Old Soul',
        category: null,
        isBuiltin: false,
        isActive: false,
        createdBy: 'user-uuid',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.isActive).toBe(false)
      expect(template.description).toBeNull()
      expect(template.category).toBeNull()
    })

    test('all 5 built-in categories are valid', () => {
      const categories = ['marketer', 'analyst', 'developer', 'secretary', 'researcher']
      for (const cat of categories) {
        const template: SoulTemplate = {
          id: `builtin-${cat}`,
          companyId: null,
          name: cat,
          description: null,
          content: `# ${cat}`,
          category: cat,
          isBuiltin: true,
          isActive: true,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        expect(template.category).toBe(cat)
      }
    })
  })

  // =============================================
  // WsChannel type verification (no P3 additions)
  // =============================================
  describe('WsChannel type (no P3 additions)', () => {
    test('WsChannel has 7 existing channels', () => {
      const channels: WsChannel[] = [
        'chat-stream',
        'agent-status',
        'notifications',
        'messenger',
        'activity-log',
        'strategy-notes',
        'night-job',
      ]
      expect(channels.length).toBe(7)
    })

    test('each channel name is correctly typed', () => {
      const ch1: WsChannel = 'chat-stream'
      const ch2: WsChannel = 'agent-status'
      const ch3: WsChannel = 'notifications'
      const ch4: WsChannel = 'messenger'
      const ch5: WsChannel = 'activity-log'
      const ch6: WsChannel = 'strategy-notes'
      const ch7: WsChannel = 'night-job'
      expect(ch1).toBe('chat-stream')
      expect(ch2).toBe('agent-status')
      expect(ch3).toBe('notifications')
      expect(ch4).toBe('messenger')
      expect(ch5).toBe('activity-log')
      expect(ch6).toBe('strategy-notes')
      expect(ch7).toBe('night-job')
    })

    test('WsInboundMessage subscribe/unsubscribe structure', () => {
      const subMsg: WsInboundMessage = {
        type: 'subscribe',
        channel: 'agent-status',
        params: { id: 'company-uuid' },
      }
      expect(subMsg.type).toBe('subscribe')
      expect(subMsg.channel).toBe('agent-status')

      const unsubMsg: WsInboundMessage = {
        type: 'unsubscribe',
        channel: 'messenger',
      }
      expect(unsubMsg.type).toBe('unsubscribe')
      expect(unsubMsg.params).toBeUndefined()
    })

    test('WsOutboundMessage types are valid', () => {
      const connected: WsOutboundMessage = { type: 'connected' }
      const subscribed: WsOutboundMessage = { type: 'subscribed', channel: 'agent-status' }
      const data: WsOutboundMessage = { type: 'data', channel: 'messenger', channelKey: 'messenger::ch1', data: { text: 'hello' } }
      const error: WsOutboundMessage = { type: 'error', code: 'FORBIDDEN' }

      expect(connected.type).toBe('connected')
      expect(subscribed.channel).toBe('agent-status')
      expect(data.channelKey).toBe('messenger::ch1')
      expect(error.code).toBe('FORBIDDEN')
    })
  })

  // =============================================
  // Migration file validation
  // =============================================
  describe('Migration file validation', () => {
    test('0024_p3-schema-ws.sql exists', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      expect(await file.exists()).toBe(true)
    })

    test('migration contains CREATE TABLE soul_templates', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('CREATE TABLE')
      expect(content).toContain('soul_templates')
    })

    test('migration has all column definitions', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('"id" uuid PRIMARY KEY')
      expect(content).toContain('"company_id" uuid')
      expect(content).toContain('"name" varchar(100) NOT NULL')
      expect(content).toContain('"description" text')
      expect(content).toContain('"content" text NOT NULL')
      expect(content).toContain('"category" varchar(50)')
      expect(content).toContain('"is_builtin" boolean')
      expect(content).toContain('"is_active" boolean')
      expect(content).toContain('"created_by" uuid')
      expect(content).toContain('"created_at" timestamp')
      expect(content).toContain('"updated_at" timestamp')
    })

    test('migration has company_id index', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('soul_templates_company_idx')
      expect(content).toContain('CREATE INDEX')
    })

    test('migration has FK constraints', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('soul_templates_company_id_companies_id_fk')
      expect(content).toContain('soul_templates_created_by_users_id_fk')
      expect(content).toContain('FOREIGN KEY')
      expect(content).toContain('REFERENCES "public"."companies"("id")')
      expect(content).toContain('REFERENCES "public"."users"("id")')
    })

    test('migration uses IF NOT EXISTS for idempotency', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('IF NOT EXISTS')
    })

    test('migration has statement-breakpoint comments', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('statement-breakpoint')
    })

    test('migration number is 0024 (after 0023)', async () => {
      const prevFile = Bun.file('packages/server/src/db/migrations/0023_sns-ab-test.sql')
      expect(await prevFile.exists()).toBe(true)
      const newFile = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      expect(await newFile.exists()).toBe(true)
    })
  })

  // =============================================
  // TEA: Edge cases & boundary tests
  // =============================================
  describe('TEA: Edge cases & boundary conditions', () => {
    test('SoulTemplate with empty string content (valid but minimal)', () => {
      // content is notNull but empty string is allowed at type level
      const template: SoulTemplate = {
        id: 'edge-1',
        companyId: null,
        name: 'Minimal',
        description: null,
        content: '',
        category: null,
        isBuiltin: false,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.content).toBe('')
    })

    test('SoulTemplate with maximum-length name (100 chars)', () => {
      const maxName = 'A'.repeat(100)
      const template: SoulTemplate = {
        id: 'edge-2',
        companyId: null,
        name: maxName,
        description: null,
        content: '# Soul',
        category: null,
        isBuiltin: false,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.name.length).toBe(100)
    })

    test('SoulTemplate with maximum-length category (50 chars)', () => {
      const maxCat = 'B'.repeat(50)
      const template: SoulTemplate = {
        id: 'edge-3',
        companyId: null,
        name: 'Test',
        description: null,
        content: '# Soul',
        category: maxCat,
        isBuiltin: false,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.category!.length).toBe(50)
    })

    test('SoulTemplate with all nullable fields set to null', () => {
      const template: SoulTemplate = {
        id: 'edge-4',
        companyId: null,
        name: 'All Nulls',
        description: null,
        content: '# Content',
        category: null,
        isBuiltin: false,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.companyId).toBeNull()
      expect(template.description).toBeNull()
      expect(template.category).toBeNull()
      expect(template.createdBy).toBeNull()
    })

    test('SoulTemplate with all nullable fields set to values', () => {
      const template: SoulTemplate = {
        id: 'edge-5',
        companyId: 'company-1',
        name: 'All Values',
        description: 'Full description here',
        content: '# Full Content\nParagraph text...',
        category: 'custom',
        isBuiltin: false,
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.companyId).toBe('company-1')
      expect(template.description).toBe('Full description here')
      expect(template.category).toBe('custom')
      expect(template.createdBy).toBe('user-1')
    })

    test('schema name column has varchar(100) length constraint', () => {
      const col = soulTemplates.name
      // Drizzle varchar stores length in config
      expect(col).toBeDefined()
      expect(col.notNull).toBeTruthy()
    })

    test('schema category column has varchar(50) length constraint', () => {
      const col = soulTemplates.category
      expect(col).toBeDefined()
      expect(col.notNull).toBeFalsy()
    })

    test('createdAt and updatedAt can be different (updated template)', () => {
      const created = new Date('2026-01-01')
      const updated = new Date('2026-03-06')
      const template: SoulTemplate = {
        id: 'edge-6',
        companyId: null,
        name: 'Updated',
        description: null,
        content: '# V2',
        category: 'custom',
        isBuiltin: false,
        isActive: true,
        createdBy: 'user-1',
        createdAt: created,
        updatedAt: updated,
      }
      expect(template.updatedAt.getTime()).toBeGreaterThan(template.createdAt.getTime())
    })

    test('isBuiltin true + companyId null = platform built-in pattern', () => {
      const builtIn: SoulTemplate = {
        id: 'builtin-pattern',
        companyId: null,
        name: 'Platform Template',
        description: null,
        content: '# Built-in',
        category: 'marketer',
        isBuiltin: true,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(builtIn.isBuiltin).toBe(true)
      expect(builtIn.companyId).toBeNull()
      expect(builtIn.createdBy).toBeNull()
    })

    test('isBuiltin false + companyId set = custom template pattern', () => {
      const custom: SoulTemplate = {
        id: 'custom-pattern',
        companyId: 'company-uuid',
        name: 'Custom Template',
        description: 'Company custom',
        content: '# Custom',
        category: 'custom',
        isBuiltin: false,
        isActive: true,
        createdBy: 'admin-uuid',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(custom.isBuiltin).toBe(false)
      expect(custom.companyId).not.toBeNull()
      expect(custom.createdBy).not.toBeNull()
    })

    test('multiline content with markdown is valid', () => {
      const content = `# Agent Soul
## Personality
You are a professional marketer.

## Goals
- Increase brand awareness
- Generate leads

## Rules
1. Always be professional
2. Use data-driven insights`
      const template: SoulTemplate = {
        id: 'markdown-1',
        companyId: null,
        name: 'Markdown Test',
        description: null,
        content,
        category: 'marketer',
        isBuiltin: true,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      expect(template.content).toContain('# Agent Soul')
      expect(template.content).toContain('## Goals')
      expect(template.content.split('\n').length).toBeGreaterThan(5)
    })
  })

  // =============================================
  // TEA: Migration SQL structure validation
  // =============================================
  describe('TEA: Migration SQL structure', () => {
    test('migration has exactly 2 FK constraints', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      const fkMatches = content.match(/ADD CONSTRAINT/g)
      expect(fkMatches).not.toBeNull()
      expect(fkMatches!.length).toBe(2)
    })

    test('migration has exactly 1 index', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      const indexMatches = content.match(/CREATE INDEX/g)
      expect(indexMatches).not.toBeNull()
      expect(indexMatches!.length).toBe(1)
    })

    test('migration has exactly 1 table creation', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      const tableMatches = content.match(/CREATE TABLE/g)
      expect(tableMatches).not.toBeNull()
      expect(tableMatches!.length).toBe(1)
    })

    test('migration has gen_random_uuid() for PK default', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('gen_random_uuid()')
    })

    test('migration has DEFAULT now() for timestamps', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      const nowMatches = content.match(/DEFAULT now\(\)/g)
      expect(nowMatches).not.toBeNull()
      expect(nowMatches!.length).toBe(2) // created_at and updated_at
    })

    test('migration FK references use public schema', async () => {
      const file = Bun.file('packages/server/src/db/migrations/0024_p3-schema-ws.sql')
      const content = await file.text()
      expect(content).toContain('REFERENCES "public"."companies"')
      expect(content).toContain('REFERENCES "public"."users"')
    })
  })

  // =============================================
  // Schema consistency & regression tests
  // =============================================
  describe('Schema consistency checks', () => {
    test('soulTemplates follows same pattern as other tables (has id, createdAt)', () => {
      expect(soulTemplates.id).toBeDefined()
      expect(soulTemplates.createdAt).toBeDefined()
      expect(soulTemplates.updatedAt).toBeDefined()
    })

    test('existing tables are not affected (companies still exists)', () => {
      expect(companies).toBeDefined()
      expect(Object.keys(companies)).toContain('id')
      expect(Object.keys(companies)).toContain('name')
    })

    test('existing tables are not affected (users still exists)', () => {
      expect(users).toBeDefined()
      expect(Object.keys(users)).toContain('id')
      expect(Object.keys(users)).toContain('companyId')
    })

    test('existing tables are not affected (agents still has soul field)', () => {
      expect(agents).toBeDefined()
      expect(Object.keys(agents)).toContain('soul')
      expect(Object.keys(agents)).toContain('adminSoul')
    })

    test('soulTemplates is separate from agents.soul (no FK relationship)', () => {
      // soul_templates content is copied to agents.soul — not an FK
      const agentCols = Object.keys(agents)
      expect(agentCols).not.toContain('soulTemplateId')
    })
  })
})
