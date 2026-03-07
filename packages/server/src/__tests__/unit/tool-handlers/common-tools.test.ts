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
import { getCurrentTime } from '../../../lib/tool-handlers/builtins/get-current-time'

const mockCtx: ToolExecContext = {
  companyId: 'test-company',
  agentId: 'test-agent',
  sessionId: 'test-session',
  departmentId: null,
  userId: 'test-user',
  getCredentials: async () => ({ api_key: 'test-key' }),
}

// ===== 1. calculate (existing) =====
describe('calculate', () => {
  it('evaluates basic arithmetic', () => {
    const result = calculate({ expression: '2 + 3' }, mockCtx)
    expect(JSON.parse(result as string)).toEqual({ expression: '2 + 3', result: 5 })
  })

  it('handles multiplication and division', () => {
    const result = JSON.parse(calculate({ expression: '10 * 3 / 5' }, mockCtx) as string)
    expect(result.result).toBe(6)
  })

  it('handles exponentiation', () => {
    const result = JSON.parse(calculate({ expression: '2^10' }, mockCtx) as string)
    expect(result.result).toBe(1024)
  })

  it('handles parentheses', () => {
    const result = JSON.parse(calculate({ expression: '(2+3)*4' }, mockCtx) as string)
    expect(result.result).toBe(20)
  })

  it('returns error for empty expression', () => {
    expect(calculate({ expression: '' }, mockCtx)).toContain('비어있습니다')
  })

  it('returns error for invalid characters', () => {
    expect(calculate({ expression: 'abc' }, mockCtx)).toContain('허용되지 않는')
  })
})

// ===== 2. getCurrentTime (existing) =====
describe('getCurrentTime', () => {
  it('returns time with utc and kst', () => {
    const result = JSON.parse(getCurrentTime({}, mockCtx) as string)
    expect(result).toHaveProperty('utc')
    expect(result).toHaveProperty('kst')
    expect(result).toHaveProperty('date')
    expect(result).toHaveProperty('dayOfWeek')
  })
})

// ===== 3. spreadsheetTool =====
describe('spreadsheetTool', () => {
  const csvData = 'name,age,score\nAlice,30,95\nBob,25,80\nCharlie,35,90'

  it('parses CSV data', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'parse', data: csvData }, mockCtx) as string)
    expect(result.headers).toEqual(['name', 'age', 'score'])
    expect(result.rowCount).toBe(3)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('filters by column value', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'filter', data: csvData, column: 'name', value: 'Bob' }, mockCtx) as string)
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].name).toBe('Bob')
  })

  it('sorts by numeric column ascending', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'sort', data: csvData, column: 'age', order: 'asc' }, mockCtx) as string)
    expect(result.rows[0].name).toBe('Bob')
    expect(result.rows[2].name).toBe('Charlie')
  })

  it('sorts descending', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'sort', data: csvData, column: 'score', order: 'desc' }, mockCtx) as string)
    expect(result.rows[0].score).toBe('95')
  })

  it('aggregates sum', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'aggregate', data: csvData, column: 'score', operation: 'sum' }, mockCtx) as string)
    expect(result.result).toBe(265)
  })

  it('aggregates avg', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'aggregate', data: csvData, column: 'age', operation: 'avg' }, mockCtx) as string)
    expect(result.result).toBe(30)
  })

  it('aggregates min/max', () => {
    const min = JSON.parse(spreadsheetTool({ action: 'aggregate', data: csvData, column: 'score', operation: 'min' }, mockCtx) as string)
    const max = JSON.parse(spreadsheetTool({ action: 'aggregate', data: csvData, column: 'score', operation: 'max' }, mockCtx) as string)
    expect(min.result).toBe(80)
    expect(max.result).toBe(95)
  })

  it('converts to CSV', () => {
    const result = JSON.parse(spreadsheetTool({ action: 'to_csv', data: csvData }, mockCtx) as string)
    expect(result.csv).toContain('name,age,score')
    expect(result.rowCount).toBe(3)
  })

  it('handles TSV data', () => {
    const tsv = 'name\tage\nAlice\t30'
    const result = JSON.parse(spreadsheetTool({ action: 'parse', data: tsv }, mockCtx) as string)
    expect(result.headers).toEqual(['name', 'age'])
    expect(result.rows[0].name).toBe('Alice')
  })

  it('returns error for empty data', () => {
    expect(spreadsheetTool({ action: 'parse', data: '' }, mockCtx)).toContain('비어있습니다')
  })

  it('returns error for missing column in filter', () => {
    expect(spreadsheetTool({ action: 'filter', data: csvData, column: '' }, mockCtx)).toContain('열 이름')
  })

  it('returns error for invalid action', () => {
    expect(spreadsheetTool({ action: 'invalid', data: csvData }, mockCtx)).toContain('지원하지 않는')
  })
})

// ===== 4. chartGenerator =====
describe('chartGenerator', () => {
  it('generates bar chart from simple arrays', () => {
    const result = JSON.parse(chartGenerator({
      type: 'bar', title: 'Sales', labels: ['Q1', 'Q2', 'Q3'], data: [100, 200, 150],
    }, mockCtx) as string)
    expect(result.type).toBe('bar')
    expect(result.title).toBe('Sales')
    expect(result.labels).toEqual(['Q1', 'Q2', 'Q3'])
    expect(result.datasets[0].data).toEqual([100, 200, 150])
  })

  it('generates from comma-separated strings', () => {
    const result = JSON.parse(chartGenerator({
      type: 'line', title: 'Test', labels: 'A,B,C', data: '1,2,3',
    }, mockCtx) as string)
    expect(result.labels).toEqual(['A', 'B', 'C'])
    expect(result.datasets[0].data).toEqual([1, 2, 3])
  })

  it('generates from CSV data string', () => {
    const result = JSON.parse(chartGenerator({
      type: 'pie', title: 'Budget',
      data: 'Category,Amount\nFood,300\nTransport,200\nOther,100',
    }, mockCtx) as string)
    expect(result.labels).toEqual(['Food', 'Transport', 'Other'])
    expect(result.datasets[0].data).toEqual([300, 200, 100])
  })

  it('generates with multiple datasets', () => {
    const result = JSON.parse(chartGenerator({
      type: 'bar', title: 'Compare', labels: ['A', 'B'],
      datasets: [{ label: 'S1', data: [1, 2] }, { label: 'S2', data: [3, 4] }],
    }, mockCtx) as string)
    expect(result.datasets.length).toBe(2)
  })

  it('returns error for missing data', () => {
    const result = JSON.parse(chartGenerator({ type: 'bar' }, mockCtx) as string)
    expect(result.error).toBe(true)
  })
})

// ===== 5. fileManager =====
describe('fileManager', () => {
  it('generates text file content', () => {
    const result = JSON.parse(fileManager({ action: 'generate', filename: 'test', content: 'hello', format: 'text' }, mockCtx) as string)
    expect(result.filename).toBe('test.txt')
    expect(result.content).toBe('hello')
    expect(result.size).toBe(5)
  })

  it('generates markdown file', () => {
    const result = JSON.parse(fileManager({ action: 'generate', filename: 'doc', content: '# Title', format: 'markdown' }, mockCtx) as string)
    expect(result.filename).toBe('doc.md')
  })

  it('preserves filename with extension', () => {
    const result = JSON.parse(fileManager({ action: 'generate', filename: 'data.csv', content: 'a,b', format: 'csv' }, mockCtx) as string)
    expect(result.filename).toBe('data.csv')
  })

  it('lists formats', () => {
    const result = JSON.parse(fileManager({ action: 'list_formats' }, mockCtx) as string)
    expect(result.formats.length).toBeGreaterThanOrEqual(5)
  })

  it('provides templates', () => {
    const result = JSON.parse(fileManager({ action: 'template', template: 'report' }, mockCtx) as string)
    expect(result.content).toContain('보고서')
    expect(result.template).toBe('report')
  })

  it('returns error for empty content', () => {
    expect(fileManager({ action: 'generate', content: '' }, mockCtx)).toContain('비어있습니다')
  })

  it('returns error for invalid template', () => {
    const result = JSON.parse(fileManager({ action: 'template', template: 'nonexistent' }, mockCtx) as string)
    expect(result.error).toBe(true)
  })
})

// ===== 6. dateUtils =====
describe('dateUtils', () => {
  it('returns current time', () => {
    const result = JSON.parse(dateUtils({ action: 'now' }, mockCtx) as string)
    expect(result).toHaveProperty('utc')
    expect(result).toHaveProperty('local')
    expect(result.timezone).toBe('KST')
  })

  it('returns current time in different timezone', () => {
    const result = JSON.parse(dateUtils({ action: 'now', timezone: 'EST' }, mockCtx) as string)
    expect(result.timezone).toBe('EST')
  })

  it('formats a date', () => {
    const result = JSON.parse(dateUtils({ action: 'format', date: '2025-06-15T12:00:00Z', format: 'YYYY-MM-DD' }, mockCtx) as string)
    expect(result.formatted).toBe('2025-06-15')
  })

  it('calculates date diff', () => {
    const result = JSON.parse(dateUtils({ action: 'diff', from: '2025-01-01', to: '2025-01-31' }, mockCtx) as string)
    expect(result.days).toBe(30)
  })

  it('adds days to date', () => {
    const result = JSON.parse(dateUtils({ action: 'add', date: '2025-01-01T00:00:00Z', days: 10 }, mockCtx) as string)
    expect(result.result).toContain('2025-01-11')
  })

  it('adds months to date', () => {
    const result = JSON.parse(dateUtils({ action: 'add', date: '2025-01-15T00:00:00Z', months: 2 }, mockCtx) as string)
    expect(result.result).toContain('2025-03')
  })

  it('parses date string', () => {
    const result = JSON.parse(dateUtils({ action: 'parse', text: '2025-12-25' }, mockCtx) as string)
    expect(result.date).toBe('2025-12-25')
  })

  it('returns error for invalid date', () => {
    expect(dateUtils({ action: 'format', date: 'not-a-date' }, mockCtx)).toContain('파싱할 수 없습니다')
  })

  it('returns error for missing diff dates', () => {
    expect(dateUtils({ action: 'diff', from: '', to: '' }, mockCtx)).toContain('모두 입력')
  })
})

// ===== 7. jsonParser =====
describe('jsonParser', () => {
  const testJson = '{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}]}'

  it('parses valid JSON', () => {
    const result = JSON.parse(jsonParser({ action: 'parse', data: testJson }, mockCtx) as string)
    expect(result.type).toBe('object')
    expect(result.parsed.users).toHaveLength(2)
  })

  it('queries by dot path', () => {
    const result = JSON.parse(jsonParser({ action: 'query', data: testJson, path: 'users.0.name' }, mockCtx) as string)
    expect(result.result).toBe('Alice')
  })

  it('queries nested array index', () => {
    const result = JSON.parse(jsonParser({ action: 'query', data: testJson, path: 'users.1.age' }, mockCtx) as string)
    expect(result.result).toBe(25)
  })

  it('lists keys', () => {
    const result = JSON.parse(jsonParser({ action: 'keys', data: testJson }, mockCtx) as string)
    expect(result.keys).toEqual(['users'])
    expect(result.count).toBe(1)
  })

  it('flattens nested object', () => {
    const result = JSON.parse(jsonParser({ action: 'flatten', data: '{"a":{"b":1,"c":2}}' }, mockCtx) as string)
    expect(result.flattened['a.b']).toBe(1)
    expect(result.flattened['a.c']).toBe(2)
  })

  it('validates valid JSON', () => {
    const result = JSON.parse(jsonParser({ action: 'validate', data: testJson }, mockCtx) as string)
    expect(result.valid).toBe(true)
  })

  it('validates invalid JSON', () => {
    const result = JSON.parse(jsonParser({ action: 'validate', data: '{bad json}' }, mockCtx) as string)
    expect(result.valid).toBe(false)
  })

  it('returns error for empty data on validate', () => {
    const result = JSON.parse(jsonParser({ action: 'validate', data: '' }, mockCtx) as string)
    expect(result.valid).toBe(false)
  })

  it('handles parse error', () => {
    expect(jsonParser({ action: 'parse', data: 'not json' }, mockCtx)).toContain('파싱 실패')
  })
})

// ===== 8. textSummarizer =====
describe('textSummarizer', () => {
  const text = 'This is the first sentence. Here is the second sentence. And a third one follows. Finally the fourth sentence arrives.'

  it('returns text stats', () => {
    const result = JSON.parse(textSummarizer({ action: 'stats', text }, mockCtx) as string)
    expect(result.wordCount).toBeGreaterThan(0)
    expect(result.sentenceCount).toBeGreaterThanOrEqual(3)
    expect(result.charCount).toBe(text.length)
    expect(result.readingTimeMinutes).toBeGreaterThanOrEqual(1)
  })

  it('extracts keywords', () => {
    const result = JSON.parse(textSummarizer({ action: 'keywords', text: 'apple banana apple cherry apple banana', count: 3 }, mockCtx) as string)
    expect(result.keywords[0].word).toBe('apple')
    expect(result.keywords[0].count).toBe(3)
  })

  it('extracts first N sentences', () => {
    const result = JSON.parse(textSummarizer({ action: 'sentences', text, count: 2 }, mockCtx) as string)
    expect(result.extractedCount).toBe(2)
    expect(result.sentences[0]).toContain('first sentence')
  })

  it('truncates at sentence boundary', () => {
    const result = JSON.parse(textSummarizer({ action: 'truncate', text, max_length: 60 }, mockCtx) as string)
    expect(result.truncated).toBe(true)
    expect(result.length).toBeLessThanOrEqual(60)
  })

  it('does not truncate short text', () => {
    const result = JSON.parse(textSummarizer({ action: 'truncate', text: 'short', max_length: 500 }, mockCtx) as string)
    expect(result.truncated).toBe(false)
  })

  it('returns error for empty text', () => {
    expect(textSummarizer({ action: 'stats', text: '' }, mockCtx)).toContain('입력하세요')
  })

  it('handles Korean text stats', () => {
    const koreanText = '이것은 첫 번째 문장입니다. 두 번째 문장이 있습니다.'
    const result = JSON.parse(textSummarizer({ action: 'stats', text: koreanText }, mockCtx) as string)
    expect(result.charCount).toBe(koreanText.length)
    expect(result.wordCount).toBeGreaterThan(0)
  })
})

// ===== 9. markdownConverter =====
describe('markdownConverter', () => {
  it('converts markdown to plain text', () => {
    const md = '# Title\n\n**bold** and *italic* and `code`'
    const result = JSON.parse(markdownConverter({ action: 'to_text', text: md }, mockCtx) as string)
    expect(result.text).toContain('Title')
    expect(result.text).toContain('bold')
    expect(result.text).not.toContain('**')
    expect(result.text).not.toContain('`')
  })

  it('strips links from markdown', () => {
    const md = 'Visit [Google](https://google.com) for search'
    const result = JSON.parse(markdownConverter({ action: 'to_text', text: md }, mockCtx) as string)
    expect(result.text).toContain('Google')
    expect(result.text).not.toContain('https')
  })

  it('converts array to markdown table', () => {
    const data = JSON.stringify([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }])
    const result = JSON.parse(markdownConverter({ action: 'to_table', data }, mockCtx) as string)
    expect(result.table).toContain('| name | age |')
    expect(result.table).toContain('Alice')
    expect(result.rowCount).toBe(2)
  })

  it('converts HTML to markdown', () => {
    const html = '<h1>Title</h1><p>Text with <strong>bold</strong></p>'
    const result = JSON.parse(markdownConverter({ action: 'from_html', html }, mockCtx) as string)
    expect(result.markdown).toContain('# Title')
    expect(result.markdown).toContain('**bold**')
  })

  it('converts markdown to HTML', () => {
    const md = '# Title\n\n**bold** text'
    const result = JSON.parse(markdownConverter({ action: 'to_html', text: md }, mockCtx) as string)
    expect(result.html).toContain('<h1>Title</h1>')
    expect(result.html).toContain('<strong>bold</strong>')
  })

  it('returns error for empty input', () => {
    expect(markdownConverter({ action: 'to_text', text: '' }, mockCtx)).toContain('입력하세요')
  })
})

// ===== 10. regexMatcher =====
describe('regexMatcher', () => {
  it('tests regex pattern', () => {
    const result = JSON.parse(regexMatcher({ action: 'test', pattern: '\\d+', text: 'abc123' }, mockCtx) as string)
    expect(result.matches).toBe(true)
  })

  it('tests non-matching pattern', () => {
    const result = JSON.parse(regexMatcher({ action: 'test', pattern: '\\d+', text: 'abc' }, mockCtx) as string)
    expect(result.matches).toBe(false)
  })

  it('finds all matches', () => {
    const result = JSON.parse(regexMatcher({ action: 'match', pattern: '\\d+', text: 'a1b23c456' }, mockCtx) as string)
    expect(result.count).toBe(3)
    expect(result.matches[0].match).toBe('1')
    expect(result.matches[2].match).toBe('456')
  })

  it('replaces matches', () => {
    const result = JSON.parse(regexMatcher({
      action: 'replace', pattern: '\\d+', text: 'abc123def456', replacement: 'N',
    }, mockCtx) as string)
    expect(result.result).toBe('abcNdefN')
  })

  it('extracts groups', () => {
    const result = JSON.parse(regexMatcher({
      action: 'extract', pattern: '(\\w+)@(\\w+)', text: 'user@example',
    }, mockCtx) as string)
    expect(result.matches[0].groups).toEqual(['user', 'example'])
  })

  it('splits by pattern', () => {
    const result = JSON.parse(regexMatcher({
      action: 'split', pattern: '[,;\\s]+', text: 'a, b; c d',
    }, mockCtx) as string)
    expect(result.parts).toEqual(['a', 'b', 'c', 'd'])
  })

  it('validates regex', () => {
    const result = JSON.parse(regexMatcher({ action: 'validate', pattern: '\\d+', text: '' }, mockCtx) as string)
    expect(result.valid).toBe(true)
  })

  it('handles invalid regex', () => {
    const result = JSON.parse(regexMatcher({ action: 'test', pattern: '[invalid', text: 'test' }, mockCtx) as string)
    expect(result.valid).toBe(false)
  })

  it('returns error for empty pattern', () => {
    expect(regexMatcher({ action: 'test', pattern: '', text: 'abc' }, mockCtx)).toContain('패턴')
  })
})

// ===== 11. unitConverter =====
describe('unitConverter', () => {
  it('converts km to mi', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 10, from: 'km', to: 'mi' }, mockCtx) as string)
    expect(result.result).toBeCloseTo(6.2137, 2)
    expect(result.category).toBe('length')
  })

  it('converts kg to lb', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 100, from: 'kg', to: 'lb' }, mockCtx) as string)
    expect(result.result).toBeCloseTo(220.462, 1)
    expect(result.category).toBe('weight')
  })

  it('converts Celsius to Fahrenheit', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 100, from: 'C', to: 'F', category: 'temperature' }, mockCtx) as string)
    expect(result.result).toBe(212)
  })

  it('converts Fahrenheit to Celsius', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 32, from: 'F', to: 'C', category: 'temperature' }, mockCtx) as string)
    expect(result.result).toBe(0)
  })

  it('converts data sizes', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 1, from: 'GB', to: 'MB' }, mockCtx) as string)
    expect(result.result).toBe(1024)
  })

  it('converts time', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 2, from: 'hr', to: 'min' }, mockCtx) as string)
    expect(result.result).toBe(120)
  })

  it('converts pyeong to m2', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 30, from: 'pyeong', to: 'm2' }, mockCtx) as string)
    expect(result.result).toBeCloseTo(99.17, 0)
  })

  it('lists categories', () => {
    const result = JSON.parse(unitConverter({ action: 'categories' }, mockCtx) as string)
    expect(result.categories).toContain('length')
    expect(result.categories).toContain('temperature')
    expect(result.units.length).toContain('km')
  })

  it('auto-detects category', () => {
    const result = JSON.parse(unitConverter({ action: 'convert', value: 5, from: 'm', to: 'ft' }, mockCtx) as string)
    expect(result.category).toBe('length')
  })

  it('returns error for missing value', () => {
    expect(unitConverter({ action: 'convert', from: 'km', to: 'mi' }, mockCtx)).toContain('숫자')
  })

  it('returns error for unknown units', () => {
    expect(unitConverter({ action: 'convert', value: 1, from: 'xyz', to: 'abc' }, mockCtx)).toContain('찾을 수 없습니다')
  })
})

// ===== 12. randomGenerator =====
describe('randomGenerator', () => {
  it('generates random numbers in range', () => {
    const result = JSON.parse(randomGenerator({ action: 'number', min: 1, max: 10, count: 5 }, mockCtx) as string)
    expect(result.numbers).toHaveLength(5)
    result.numbers.forEach((n: number) => {
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(10)
    })
  })

  it('generates UUID', () => {
    const result = JSON.parse(randomGenerator({ action: 'uuid', count: 3 }, mockCtx) as string)
    expect(result.uuids).toHaveLength(3)
    result.uuids.forEach((u: string) => {
      expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })

  it('generates random string', () => {
    const result = JSON.parse(randomGenerator({ action: 'string', length: 20, charset: 'hex' }, mockCtx) as string)
    expect(result.value).toHaveLength(20)
    expect(result.value).toMatch(/^[0-9a-f]+$/)
  })

  it('picks from items', () => {
    const result = JSON.parse(randomGenerator({ action: 'pick', items: ['a', 'b', 'c', 'd'], count: 2 }, mockCtx) as string)
    expect(result.picked).toHaveLength(2)
    expect(result.totalItems).toBe(4)
  })

  it('shuffles items', () => {
    const result = JSON.parse(randomGenerator({ action: 'shuffle', items: [1, 2, 3, 4, 5] }, mockCtx) as string)
    expect(result.shuffled).toHaveLength(5)
    expect(result.shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('flips coins', () => {
    const result = JSON.parse(randomGenerator({ action: 'coin', count: 10 }, mockCtx) as string)
    expect(result.results).toHaveLength(10)
    expect(result.heads + result.tails).toBe(10)
  })

  it('rolls dice', () => {
    const result = JSON.parse(randomGenerator({ action: 'dice', sides: 20, count: 5 }, mockCtx) as string)
    expect(result.results).toHaveLength(5)
    result.results.forEach((r: number) => {
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(20)
    })
    expect(result.sides).toBe(20)
  })

  it('returns error for invalid min/max', () => {
    expect(randomGenerator({ action: 'number', min: 10, max: 5 }, mockCtx)).toContain('클 수 없습니다')
  })

  it('returns error for empty items in pick', () => {
    expect(randomGenerator({ action: 'pick', items: [] }, mockCtx)).toContain('항목')
  })
})

// ===== Registry integration =====
describe('registry integration', () => {
  it('all 36 handlers registered', async () => {
    // Dynamic import to test registration
    const { registry } = await import('../../../lib/tool-handlers/index')
    const tools = registry.list()
    expect(tools.length).toBeGreaterThanOrEqual(35)

    // Verify new common tools
    const commonToolNames = [
      'spreadsheet_tool', 'chart_generator', 'file_manager', 'date_utils',
      'json_parser', 'text_summarizer', 'url_fetcher', 'markdown_converter',
      'regex_matcher', 'unit_converter', 'random_generator',
    ]
    for (const name of commonToolNames) {
      expect(tools).toContain(name)
    }

    // Verify existing tools still registered
    const existingToolNames = [
      'search_web', 'calculate', 'translate_text', 'send_email', 'get_current_time',
    ]
    for (const name of existingToolNames) {
      expect(tools).toContain(name)
    }
  })
})
