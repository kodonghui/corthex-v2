/**
 * TEA Risk-Based Test Expansion for Story 4-3: Common Tools 15
 * Focus: Edge cases, boundary conditions, security, and error resilience
 */
import { describe, it, expect } from 'bun:test'
import type { ToolExecContext } from '../../../lib/tool-handlers/types'
import { spreadsheetTool } from '../../../lib/tool-handlers/builtins/spreadsheet-tool'
import { chartGenerator } from '../../../lib/tool-handlers/builtins/chart-generator'
import { fileManager } from '../../../lib/tool-handlers/builtins/file-manager'
import { dateUtils } from '../../../lib/tool-handlers/builtins/date-utils'
import { jsonParser } from '../../../lib/tool-handlers/builtins/json-parser'
import { textSummarizer } from '../../../lib/tool-handlers/builtins/text-summarizer'
import { markdownConverter } from '../../../lib/tool-handlers/builtins/markdown-converter'
import { regexMatcher } from '../../../lib/tool-handlers/builtins/regex-matcher'
import { unitConverter } from '../../../lib/tool-handlers/builtins/unit-converter'
import { randomGenerator } from '../../../lib/tool-handlers/builtins/random-generator'
import { calculate } from '../../../lib/tool-handlers/builtins/calculate'

const mockCtx: ToolExecContext = {
  companyId: 'c', agentId: 'a', sessionId: 's', departmentId: null, userId: 'u',
  getCredentials: async () => ({ api_key: 'k' }),
}

// === SPREADSHEET EDGE CASES ===
describe('spreadsheetTool edge cases', () => {
  it('handles single-row CSV (headers only)', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'parse', data: 'a,b,c' }, mockCtx) as string)
    expect(result.rowCount).toBe(0)
    expect(result.headers).toEqual(['a', 'b', 'c'])
  })

  it('handles quoted values (strips quotes)', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'parse', data: 'name,city\n"Alice",Seoul' }, mockCtx) as string)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('handles semicolon delimiter', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'parse', data: 'a;b\n1;2', delimiter: ';' }, mockCtx) as string)
    expect(result.headers).toEqual(['a', 'b'])
  })

  it('aggregate on non-numeric column returns message', () => {
    const result = JSON.parse(spreadsheetTool({
      action: 'aggregate', data: 'name,city\nAlice,Seoul\nBob,Busan', column: 'city', operation: 'sum',
    }, mockCtx) as string)
    expect(typeof result.result).toBe('string')
  })

  it('filter returns empty for no matches', () => {
    const result = JSON.parse(spreadsheetTool({
      action: 'filter', data: 'name\nAlice\nBob', column: 'name', value: 'Charlie',
    }, mockCtx) as string)
    expect(result.rowCount).toBe(0)
  })

  it('handles large row count', () => {
    const rows = Array.from({ length: 100 }, (_, i) => `item${i},${i}`).join('\n')
    const data = `name,value\n${rows}`
    const result = JSON.parse(spreadsheetTool({ action: 'parse', data }, mockCtx) as string)
    expect(result.rowCount).toBe(100)
  })
})

// === CALCULATE EDGE CASES ===
describe('calculate edge cases', () => {
  it('handles nested parentheses', () => {
    const result = JSON.parse(calculate({ expression: '((2+3)*(4+1))' }, mockCtx) as string)
    expect(result.result).toBe(25)
  })

  it('handles negative numbers', () => {
    const result = JSON.parse(calculate({ expression: '-5+3' }, mockCtx) as string)
    expect(result.result).toBe(-2)
  })

  it('handles decimal numbers', () => {
    const result = JSON.parse(calculate({ expression: '0.1+0.2' }, mockCtx) as string)
    expect(result.result).toBeCloseTo(0.3, 10)
  })

  it('handles large exponents', () => {
    const result = JSON.parse(calculate({ expression: '2^20' }, mockCtx) as string)
    expect(result.result).toBe(1048576)
  })

  it('rejects scripts and injection', () => {
    const result = calculate({ expression: 'console.log(1)' }, mockCtx) as string
    expect(result).toContain('허용되지 않는')
  })
})

// === CHART GENERATOR EDGE CASES ===
describe('chartGenerator edge cases', () => {
  it('handles empty labels array', () => {
    const result = JSON.parse(chartGenerator({ type: 'bar', labels: [], data: [] }, mockCtx) as string)
    expect(result.labels).toEqual([])
  })

  it('handles single data point', () => {
    const result = JSON.parse(chartGenerator({ type: 'pie', labels: ['A'], data: [100] }, mockCtx) as string)
    expect(result.datasets[0].data).toEqual([100])
  })

  it('defaults to bar type', () => {
    const result = JSON.parse(chartGenerator({ labels: ['A'], data: [1] }, mockCtx) as string)
    expect(result.type).toBe('bar')
  })
})

// === DATE UTILS EDGE CASES ===
describe('dateUtils edge cases', () => {
  it('handles leap year date add', () => {
    const result = JSON.parse(dateUtils({ action: 'add', date: '2024-02-29T00:00:00Z', years: 1 }, mockCtx) as string)
    expect(result.result).toContain('2025')
  })

  it('handles negative day diff', () => {
    const result = JSON.parse(dateUtils({ action: 'diff', from: '2025-12-31', to: '2025-01-01' }, mockCtx) as string)
    expect(result.days).toBeLessThan(0)
  })

  it('formats with day of week', () => {
    const result = JSON.parse(dateUtils({ action: 'format', date: '2025-01-01T00:00:00Z', format: 'YYYY-MM-DD ddd' }, mockCtx) as string)
    expect(result.formatted).toContain('요일')
  })

  it('handles add with negative values', () => {
    const result = JSON.parse(dateUtils({ action: 'add', date: '2025-06-15T00:00:00Z', days: -10 }, mockCtx) as string)
    expect(result.result).toContain('2025-06-05')
  })

  it('handles UTC timezone explicitly', () => {
    const result = JSON.parse(dateUtils({ action: 'now', timezone: 'UTC' }, mockCtx) as string)
    expect(result.timezone).toBe('UTC')
  })
})

// === JSON PARSER EDGE CASES ===
describe('jsonParser edge cases', () => {
  it('handles deeply nested object', () => {
    const deep = '{"a":{"b":{"c":{"d":1}}}}'
    const result = JSON.parse(jsonParser({ action: 'query', data: deep, path: 'a.b.c.d' }, mockCtx) as string)
    expect(result.result).toBe(1)
  })

  it('handles array at root', () => {
    const result = JSON.parse(jsonParser({ action: 'parse', data: '[1,2,3]' }, mockCtx) as string)
    expect(result.type).toBe('array')
  })

  it('handles null values', () => {
    const result = JSON.parse(jsonParser({ action: 'parse', data: '{"a":null}' }, mockCtx) as string)
    expect(result.parsed.a).toBeNull()
  })

  it('handles empty object', () => {
    const result = JSON.parse(jsonParser({ action: 'keys', data: '{}' }, mockCtx) as string)
    expect(result.keys).toEqual([])
    expect(result.count).toBe(0)
  })

  it('query returns undefined for missing path', () => {
    const result = JSON.parse(jsonParser({ action: 'query', data: '{"a":1}', path: 'b.c.d' }, mockCtx) as string)
    expect(result.type).toBe('undefined')
  })

  it('flatten handles array in object', () => {
    const result = JSON.parse(jsonParser({ action: 'flatten', data: '{"items":[1,2,3]}' }, mockCtx) as string)
    expect(result.flattened['items.0']).toBe(1)
    expect(result.flattened['items.2']).toBe(3)
  })
})

// === TEXT SUMMARIZER EDGE CASES ===
describe('textSummarizer edge cases', () => {
  it('handles single word', () => {
    const result = JSON.parse(textSummarizer({ action: 'stats', text: 'hello' }, mockCtx) as string)
    expect(result.wordCount).toBeGreaterThanOrEqual(1)
    expect(result.charCount).toBe(5)
  })

  it('handles text with only whitespace after trim', () => {
    expect(textSummarizer({ action: 'stats', text: '' }, mockCtx)).toContain('입력하세요')
  })

  it('truncate with very short max_length', () => {
    const result = JSON.parse(textSummarizer({
      action: 'truncate', text: 'First sentence. Second sentence. Third sentence.', max_length: 5,
    }, mockCtx) as string)
    expect(result.truncated).toBe(true)
    expect(result.text).toContain('...')
  })

  it('keywords ignores stop words', () => {
    const result = JSON.parse(textSummarizer({
      action: 'keywords', text: 'the cat is on the mat and the dog is on the rug', count: 3,
    }, mockCtx) as string)
    const words = result.keywords.map((k: { word: string }) => k.word)
    expect(words).not.toContain('the')
    expect(words).not.toContain('is')
  })
})

// === MARKDOWN CONVERTER EDGE CASES ===
describe('markdownConverter edge cases', () => {
  it('handles code blocks', () => {
    const md = '# Title\n\n```js\nconsole.log("hello")\n```'
    const result = JSON.parse(markdownConverter({ action: 'to_text', text: md }, mockCtx) as string)
    expect(result.text).not.toContain('```')
  })

  it('handles strikethrough', () => {
    const md = '~~deleted~~ text'
    const result = JSON.parse(markdownConverter({ action: 'to_text', text: md }, mockCtx) as string)
    expect(result.text).toContain('deleted')
    expect(result.text).not.toContain('~~')
  })

  it('to_table with empty array', () => {
    const result = markdownConverter({ action: 'to_table', data: '[]' }, mockCtx) as string
    const parsed = JSON.parse(result)
    expect(parsed.table).toContain('비어있')
  })

  it('handles nested HTML', () => {
    const html = '<div><p>Text with <strong><em>nested</em></strong></p></div>'
    const result = JSON.parse(markdownConverter({ action: 'from_html', html }, mockCtx) as string)
    expect(result.markdown).toContain('***nested***')
  })
})

// === REGEX MATCHER EDGE CASES ===
describe('regexMatcher edge cases', () => {
  it('handles empty text match', () => {
    const result = JSON.parse(regexMatcher({ action: 'match', pattern: '\\d+', text: 'no digits' }, mockCtx) as string)
    expect(result.count).toBe(0)
  })

  it('handles special regex characters in text', () => {
    const result = JSON.parse(regexMatcher({ action: 'test', pattern: '\\$\\d+', text: 'Price is $100' }, mockCtx) as string)
    expect(result.matches).toBe(true)
  })

  it('handles global flag replacement', () => {
    const result = JSON.parse(regexMatcher({
      action: 'replace', pattern: 'a', text: 'banana', replacement: 'o', flags: 'g',
    }, mockCtx) as string)
    expect(result.result).toBe('bonono')
  })

  it('handles case insensitive flag', () => {
    const result = JSON.parse(regexMatcher({ action: 'test', pattern: 'hello', text: 'HELLO world', flags: 'gi' }, mockCtx) as string)
    expect(result.matches).toBe(true)
  })

  it('split with no matches returns original', () => {
    const result = JSON.parse(regexMatcher({ action: 'split', pattern: ';', text: 'no semicolons' }, mockCtx) as string)
    expect(result.parts).toEqual(['no semicolons'])
  })
})

// === UNIT CONVERTER EDGE CASES ===
describe('unitConverter edge cases', () => {
  it('converts same unit (identity)', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 100, from: 'kg', to: 'kg' }, mockCtx) as string)
    expect(result.result).toBe(100)
  })

  it('converts zero value', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 0, from: 'km', to: 'mi' }, mockCtx) as string)
    expect(result.result).toBe(0)
  })

  it('converts Kelvin to Celsius', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 273.15, from: 'K', to: 'C', category: 'temperature' }, mockCtx) as string)
    expect(result.result).toBe(0)
  })

  it('converts volume', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 1, from: 'L', to: 'mL' }, mockCtx) as string)
    expect(result.result).toBe(1000)
  })

  it('converts speed', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 100, from: 'km/h', to: 'm/s' }, mockCtx) as string)
    expect(result.result).toBeCloseTo(27.78, 1)
  })

  it('handles negative temperature', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: -40, from: 'C', to: 'F', category: 'temperature' }, mockCtx) as string)
    expect(result.result).toBe(-40)  // -40 is same in C and F
  })
})

// === RANDOM GENERATOR EDGE CASES ===
describe('randomGenerator edge cases', () => {
  it('limits count to 100 for numbers', () => {
    const result = JSON.parse(randomGenerator({ action: 'number', count: 200 }, mockCtx) as string)
    expect(result.numbers.length).toBeLessThanOrEqual(100)
  })

  it('limits count to 20 for UUIDs', () => {
    const result = JSON.parse(randomGenerator({ action: 'uuid', count: 50 }, mockCtx) as string)
    expect(result.uuids.length).toBeLessThanOrEqual(20)
  })

  it('limits string length to 256', () => {
    const result = JSON.parse(randomGenerator({ action: 'string', length: 500 }, mockCtx) as string)
    expect(result.value.length).toBeLessThanOrEqual(256)
  })

  it('pick count capped at items length', () => {
    const result = JSON.parse(randomGenerator({ action: 'pick', items: ['a', 'b'], count: 10 }, mockCtx) as string)
    expect(result.picked.length).toBe(2)
  })

  it('single number with same min/max', () => {
    const result = JSON.parse(randomGenerator({ action: 'number', min: 5, max: 5 }, mockCtx) as string)
    expect(result.numbers[0]).toBe(5)
  })

  it('default values work', () => {
    const result = JSON.parse(randomGenerator({ action: 'number' }, mockCtx) as string)
    expect(result.numbers.length).toBe(1)
    expect(result.numbers[0]).toBeGreaterThanOrEqual(1)
    expect(result.numbers[0]).toBeLessThanOrEqual(100)
  })
})

// === FILE MANAGER EDGE CASES ===
describe('fileManager edge cases', () => {
  it('sanitizes dangerous characters in filename', () => {
    const result = JSON.parse(fileManager({ action: 'generate', filename: '../../../etc/passwd', content: 'test' }, mockCtx) as string)
    expect(result.filename).not.toContain('/')
    expect(result.filename).not.toContain('..')
  })

  it('handles all supported formats', () => {
    const formats = ['text', 'markdown', 'csv', 'json', 'html', 'yaml']
    for (const format of formats) {
      const result = JSON.parse(fileManager({ action: 'generate', filename: 'test', content: 'x', format }, mockCtx) as string)
      expect(result.filename).toBeTruthy()
    }
  })

  it('meeting template has expected structure', () => {
    const result = JSON.parse(fileManager({ action: 'template', template: 'meeting' }, mockCtx) as string)
    expect(result.content).toContain('회의록')
    expect(result.content).toContain('참석자')
  })
})

// === CROSS-TOOL INTERACTION TESTS ===
describe('cross-tool workflows', () => {
  it('spreadsheet -> chart: parse CSV then generate chart', () => {
    const csv = 'month,sales\nJan,100\nFeb,200\nMar,150'
    const parsed = JSON.parse(spreadsheetTool({ action: 'parse', data: csv }, mockCtx) as string)
    const labels = parsed.rows.map((r: Record<string, string>) => r.month)
    const data = parsed.rows.map((r: Record<string, string>) => Number(r.sales))
    const chart = JSON.parse(chartGenerator({ type: 'bar', title: 'Sales', labels, data }, mockCtx) as string)
    expect(chart.type).toBe('bar')
    expect(chart.datasets[0].data).toEqual([100, 200, 150])
  })

  it('json -> markdown: parse JSON then create table', () => {
    const data = '[{"name":"Alice","score":95},{"name":"Bob","score":80}]'
    const validated = JSON.parse(jsonParser({ action: 'validate', data }, mockCtx) as string)
    expect(validated.valid).toBe(true)
    const table = JSON.parse(markdownConverter({ action: 'to_table', data }, mockCtx) as string)
    expect(table.table).toContain('Alice')
    expect(table.rowCount).toBe(2)
  })

  it('text_summarizer -> file_manager: summarize then save', () => {
    const text = 'The quick brown fox jumps over the lazy dog. This is a common pangram used in testing.'
    const stats = JSON.parse(textSummarizer({ action: 'stats', text }, mockCtx) as string)
    const content = `Word count: ${stats.wordCount}\nSentences: ${stats.sentenceCount}`
    const file = JSON.parse(fileManager({ action: 'generate', filename: 'stats', content, format: 'text' }, mockCtx) as string)
    expect(file.content).toContain('Word count')
  })
})
