import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// === Zod Schema (mirrored from conversations route) ===
const shareReportSchema = z.object({
  reportId: z.string().uuid(),
})

// === ai_report content JSON parser (mirrored from conversation-chat) ===
function parseAiReportContent(content: string): { reportId: string | null; title: string; summary: string } {
  try {
    const parsed = JSON.parse(content)
    return {
      reportId: parsed.reportId || null,
      title: parsed.title || '보고서',
      summary: parsed.summary || '',
    }
  } catch {
    return { reportId: null, title: '보고서', summary: content.slice(0, 200) }
  }
}

// === Report summary generation logic ===
function generateSummary(content: string | null, maxLength: number = 200): string {
  if (!content) return ''
  return content.replace(/[#*`\n]/g, ' ').trim().slice(0, maxLength)
}

// UUID helper
const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`

// === Tests ===

describe('Share Report - Zod Schema', () => {
  test('valid UUID reportId', () => {
    const result = shareReportSchema.safeParse({ reportId: uuid(1) })
    expect(result.success).toBe(true)
  })

  test('rejects non-UUID reportId', () => {
    const result = shareReportSchema.safeParse({ reportId: 'not-uuid' })
    expect(result.success).toBe(false)
  })

  test('rejects missing reportId', () => {
    const result = shareReportSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test('rejects empty string', () => {
    const result = shareReportSchema.safeParse({ reportId: '' })
    expect(result.success).toBe(false)
  })
})

describe('Share Report - ai_report Content Parsing', () => {
  test('parses valid JSON content', () => {
    const content = JSON.stringify({
      reportId: uuid(1),
      title: '분석 보고서',
      summary: '요약 내용입니다',
    })
    const result = parseAiReportContent(content)
    expect(result.reportId).toBe(uuid(1))
    expect(result.title).toBe('분석 보고서')
    expect(result.summary).toBe('요약 내용입니다')
  })

  test('handles missing fields with defaults', () => {
    const content = JSON.stringify({})
    const result = parseAiReportContent(content)
    expect(result.reportId).toBeNull()
    expect(result.title).toBe('보고서')
    expect(result.summary).toBe('')
  })

  test('handles invalid JSON gracefully', () => {
    const result = parseAiReportContent('이것은 JSON이 아닙니다')
    expect(result.reportId).toBeNull()
    expect(result.title).toBe('보고서')
    expect(result.summary).toBe('이것은 JSON이 아닙니다')
  })

  test('handles empty string', () => {
    const result = parseAiReportContent('')
    expect(result.reportId).toBeNull()
    expect(result.title).toBe('보고서')
  })

  test('truncates long non-JSON content to 200 chars', () => {
    const longContent = 'a'.repeat(300)
    const result = parseAiReportContent(longContent)
    expect(result.summary.length).toBe(200)
  })
})

describe('Share Report - Summary Generation', () => {
  test('strips markdown characters', () => {
    const result = generateSummary('# Title\n**bold** `code`')
    expect(result).not.toContain('#')
    expect(result).not.toContain('*')
    expect(result).not.toContain('`')
    expect(result).toContain('Title')
    expect(result).toContain('bold')
    expect(result).toContain('code')
  })

  test('truncates to max length', () => {
    const long = 'a'.repeat(300)
    const result = generateSummary(long, 200)
    expect(result.length).toBe(200)
  })

  test('returns empty for null content', () => {
    expect(generateSummary(null)).toBe('')
  })

  test('trims whitespace', () => {
    const result = generateSummary('  hello  ')
    expect(result).toBe('hello')
  })
})
