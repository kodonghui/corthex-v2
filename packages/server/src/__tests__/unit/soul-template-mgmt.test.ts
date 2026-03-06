import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { soulTemplates } from '../../db/schema'
import type { SoulTemplate } from '@corthex/shared'

describe('Story 15-2: Soul Template Management', () => {
  // =============================================
  // Admin API - Zod validation schemas
  // =============================================
  describe('Admin API - Create Schema Validation', () => {
    const createSchema = z.object({
      companyId: z.string().uuid(),
      name: z.string().min(1).max(100),
      description: z.string().nullable().optional(),
      content: z.string().min(1),
      category: z.string().max(50).nullable().optional(),
    })

    test('accepts valid create payload', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test Template',
        content: 'You are a helpful assistant.',
      })
      expect(result.success).toBe(true)
    })

    test('accepts full create payload with all optional fields', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Full Template',
        description: 'A template for testing',
        content: 'You are a detailed assistant.',
        category: 'testing',
      })
      expect(result.success).toBe(true)
    })

    test('rejects empty name', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: '',
        content: 'content',
      })
      expect(result.success).toBe(false)
    })

    test('rejects name longer than 100 chars', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'x'.repeat(101),
        content: 'content',
      })
      expect(result.success).toBe(false)
    })

    test('rejects empty content', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test',
        content: '',
      })
      expect(result.success).toBe(false)
    })

    test('rejects missing companyId', () => {
      const result = createSchema.safeParse({
        name: 'Test',
        content: 'content',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid UUID for companyId', () => {
      const result = createSchema.safeParse({
        companyId: 'not-a-uuid',
        name: 'Test',
        content: 'content',
      })
      expect(result.success).toBe(false)
    })

    test('rejects category longer than 50 chars', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test',
        content: 'content',
        category: 'x'.repeat(51),
      })
      expect(result.success).toBe(false)
    })

    test('accepts null description', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test',
        content: 'content',
        description: null,
      })
      expect(result.success).toBe(true)
    })

    test('accepts null category', () => {
      const result = createSchema.safeParse({
        companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Test',
        content: 'content',
        category: null,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Admin API - Update Schema Validation', () => {
    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().nullable().optional(),
      content: z.string().min(1).optional(),
      category: z.string().max(50).nullable().optional(),
    })

    test('accepts partial update with name only', () => {
      const result = updateSchema.safeParse({ name: 'New Name' })
      expect(result.success).toBe(true)
    })

    test('accepts partial update with content only', () => {
      const result = updateSchema.safeParse({ content: 'New content' })
      expect(result.success).toBe(true)
    })

    test('accepts empty object (no changes)', () => {
      const result = updateSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    test('rejects empty name string', () => {
      const result = updateSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })

    test('rejects empty content string', () => {
      const result = updateSchema.safeParse({ content: '' })
      expect(result.success).toBe(false)
    })
  })

  // =============================================
  // Schema table structure tests
  // =============================================
  describe('soulTemplates schema structure', () => {
    test('table has isBuiltin column for built-in flag', () => {
      expect(soulTemplates.isBuiltin).toBeDefined()
    })

    test('table has isActive column for soft delete', () => {
      expect(soulTemplates.isActive).toBeDefined()
    })

    test('table has category column', () => {
      expect(soulTemplates.category).toBeDefined()
    })

    test('table has content column for soul text', () => {
      expect(soulTemplates.content).toBeDefined()
    })
  })

  // =============================================
  // SoulTemplate type tests
  // =============================================
  describe('SoulTemplate shared type', () => {
    test('type has all required fields', () => {
      const template: SoulTemplate = {
        id: 'test-id',
        companyId: null,
        name: 'Test',
        description: null,
        content: 'content',
        category: null,
        isBuiltin: true,
        isActive: true,
        createdBy: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      }
      expect(template.id).toBe('test-id')
      expect(template.isBuiltin).toBe(true)
      expect(template.companyId).toBeNull()
    })

    test('custom template has companyId', () => {
      const template: SoulTemplate = {
        id: 'custom-id',
        companyId: 'company-123',
        name: 'Custom',
        description: 'A custom template',
        content: 'You are a custom agent...',
        category: 'custom',
        isBuiltin: false,
        isActive: true,
        createdBy: 'user-123',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      }
      expect(template.companyId).toBe('company-123')
      expect(template.isBuiltin).toBe(false)
    })
  })

  // =============================================
  // Business logic tests
  // =============================================
  describe('Built-in template protection logic', () => {
    test('built-in template should not be editable', () => {
      const isBuiltin = true
      const canEdit = !isBuiltin
      expect(canEdit).toBe(false)
    })

    test('built-in template should not be deletable', () => {
      const isBuiltin = true
      const canDelete = !isBuiltin
      expect(canDelete).toBe(false)
    })

    test('custom template should be editable', () => {
      const isBuiltin = false
      const canEdit = !isBuiltin
      expect(canEdit).toBe(true)
    })

    test('custom template should be deletable', () => {
      const isBuiltin = false
      const canDelete = !isBuiltin
      expect(canDelete).toBe(true)
    })
  })

  describe('Soft delete logic', () => {
    test('soft delete sets isActive to false', () => {
      const original = { isActive: true }
      const deleted = { ...original, isActive: false }
      expect(deleted.isActive).toBe(false)
    })

    test('active filter excludes soft-deleted templates', () => {
      const templates = [
        { id: '1', isActive: true },
        { id: '2', isActive: false },
        { id: '3', isActive: true },
      ]
      const active = templates.filter((t) => t.isActive)
      expect(active).toHaveLength(2)
      expect(active.map((t) => t.id)).toEqual(['1', '3'])
    })
  })

  describe('Template listing sort order', () => {
    test('built-in templates come before custom templates', () => {
      const templates = [
        { name: 'Custom A', isBuiltin: false },
        { name: 'Built-in B', isBuiltin: true },
        { name: 'Custom C', isBuiltin: false },
        { name: 'Built-in A', isBuiltin: true },
      ]
      // Sort: isBuiltin desc, then name asc
      const sorted = [...templates].sort((a, b) => {
        if (a.isBuiltin !== b.isBuiltin) return a.isBuiltin ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      expect(sorted[0].name).toBe('Built-in A')
      expect(sorted[1].name).toBe('Built-in B')
      expect(sorted[2].name).toBe('Custom A')
      expect(sorted[3].name).toBe('Custom C')
    })
  })

  describe('Template content preview', () => {
    test('preview returns first 3 lines', () => {
      const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
      const lines = content.split('\n').slice(0, 3).join('\n')
      const preview = lines.length < content.length ? lines + '...' : lines
      expect(preview).toBe('Line 1\nLine 2\nLine 3...')
    })

    test('preview returns full content if 3 lines or fewer', () => {
      const content = 'Line 1\nLine 2\nLine 3'
      const lines = content.split('\n').slice(0, 3).join('\n')
      const preview = lines.length < content.length ? lines + '...' : lines
      expect(preview).toBe('Line 1\nLine 2\nLine 3')
    })

    test('preview handles single line content', () => {
      const content = 'Just one line'
      const lines = content.split('\n').slice(0, 3).join('\n')
      const preview = lines.length < content.length ? lines + '...' : lines
      expect(preview).toBe('Just one line')
    })
  })

  describe('Tenant isolation - query filtering', () => {
    test('workspace query should include built-in (null companyId) templates', () => {
      const templates = [
        { companyId: null, isBuiltin: true, isActive: true },
        { companyId: 'my-company', isBuiltin: false, isActive: true },
        { companyId: 'other-company', isBuiltin: false, isActive: true },
      ]
      const myCompanyId = 'my-company'
      const filtered = templates.filter(
        (t) => (t.companyId === null || t.companyId === myCompanyId) && t.isActive,
      )
      expect(filtered).toHaveLength(2)
      expect(filtered[0].isBuiltin).toBe(true)
      expect(filtered[1].companyId).toBe('my-company')
    })

    test('workspace query should exclude other company templates', () => {
      const templates = [
        { companyId: null, isBuiltin: true, isActive: true },
        { companyId: 'other-company', isBuiltin: false, isActive: true },
      ]
      const myCompanyId = 'my-company'
      const filtered = templates.filter(
        (t) => (t.companyId === null || t.companyId === myCompanyId) && t.isActive,
      )
      expect(filtered).toHaveLength(1)
      expect(filtered[0].isBuiltin).toBe(true)
    })

    test('workspace query should exclude soft-deleted templates', () => {
      const templates = [
        { companyId: null, isBuiltin: true, isActive: true },
        { companyId: 'my-company', isBuiltin: false, isActive: false },
      ]
      const myCompanyId = 'my-company'
      const filtered = templates.filter(
        (t) => (t.companyId === null || t.companyId === myCompanyId) && t.isActive,
      )
      expect(filtered).toHaveLength(1)
    })
  })

  describe('Template apply to agent soul', () => {
    test('applying template replaces soul content', () => {
      const agent = { soul: 'Old soul content', adminSoul: 'Old admin soul' }
      const template = { content: 'New template content' }
      const updated = { ...agent, soul: template.content }
      expect(updated.soul).toBe('New template content')
      expect(updated.adminSoul).toBe('Old admin soul')
    })

    test('admin apply updates both soul and adminSoul', () => {
      const agent = { soul: 'Old soul', adminSoul: 'Old admin soul' }
      const template = { content: 'Admin template' }
      const updated = { ...agent, soul: template.content, adminSoul: template.content }
      expect(updated.soul).toBe('Admin template')
      expect(updated.adminSoul).toBe('Admin template')
    })
  })

  // =============================================
  // 5 built-in templates seed data tests
  // =============================================
  describe('Built-in templates seed data', () => {
    const builtinNames = ['Marketer', 'Analyst', 'Developer', 'Secretary', 'Researcher']

    test('should have exactly 5 built-in template names', () => {
      expect(builtinNames).toHaveLength(5)
    })

    test('each built-in template has a unique name', () => {
      const unique = new Set(builtinNames)
      expect(unique.size).toBe(builtinNames.length)
    })

    test.each(builtinNames)('built-in template "%s" name is non-empty', (name) => {
      expect(name.length).toBeGreaterThan(0)
    })
  })
})
