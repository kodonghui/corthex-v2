import type { ToolHandler } from '../types'

type Row = Record<string, string>

function parseCsv(text: string, delimiter = ','): { headers: string[]; rows: Row[] } {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }

  const sep = delimiter === 'auto'
    ? (lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',')
    : delimiter

  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(sep).map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Row = {}
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? '' })
    rows.push(row)
  }
  return { headers, rows }
}

function rowsToCsv(headers: string[], rows: Row[], delimiter = ','): string {
  const lines = [headers.join(delimiter)]
  for (const row of rows) {
    lines.push(headers.map((h) => row[h] ?? '').join(delimiter))
  }
  return lines.join('\n')
}

function aggregate(rows: Row[], column: string, op: string): number | string {
  const vals = rows.map((r) => parseFloat(r[column])).filter((v) => !isNaN(v))
  if (vals.length === 0) return '해당 열에 숫자 데이터가 없습니다.'
  switch (op) {
    case 'sum': return vals.reduce((a, b) => a + b, 0)
    case 'avg': return vals.reduce((a, b) => a + b, 0) / vals.length
    case 'min': return Math.min(...vals)
    case 'max': return Math.max(...vals)
    case 'count': return vals.length
    default: return '지원하지 않는 연산입니다. (sum, avg, min, max, count)'
  }
}

export const spreadsheetTool: ToolHandler = (input) => {
  const action = String(input.action || 'parse')
  const data = String(input.data || '')
  const delimiter = String(input.delimiter || 'auto')

  if (!data && action !== 'help') {
    return '데이터(data)가 비어있습니다. CSV/TSV 형식의 텍스트를 입력하세요.'
  }

  switch (action) {
    case 'parse': {
      const { headers, rows } = parseCsv(data, delimiter)
      return JSON.stringify({ headers, rows, rowCount: rows.length, columnCount: headers.length })
    }

    case 'filter': {
      const column = String(input.column || '')
      const value = String(input.value || '')
      if (!column) return '필터링할 열 이름(column)을 지정하세요.'
      const { headers, rows } = parseCsv(data, delimiter)
      const filtered = rows.filter((r) => (r[column] ?? '').includes(value))
      return JSON.stringify({ headers, rows: filtered, rowCount: filtered.length, originalCount: rows.length })
    }

    case 'sort': {
      const column = String(input.column || '')
      const order = String(input.order || 'asc')
      if (!column) return '정렬할 열 이름(column)을 지정하세요.'
      const { headers, rows } = parseCsv(data, delimiter)
      const sorted = [...rows].sort((a, b) => {
        const va = a[column] ?? '', vb = b[column] ?? ''
        const na = parseFloat(va), nb = parseFloat(vb)
        if (!isNaN(na) && !isNaN(nb)) return order === 'desc' ? nb - na : na - nb
        return order === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb)
      })
      return JSON.stringify({ headers, rows: sorted, rowCount: sorted.length })
    }

    case 'aggregate': {
      const column = String(input.column || '')
      const operation = String(input.operation || 'sum')
      if (!column) return '집계할 열 이름(column)을 지정하세요.'
      const { rows } = parseCsv(data, delimiter)
      const result = aggregate(rows, column, operation)
      return JSON.stringify({ column, operation, result })
    }

    case 'to_csv': {
      const { headers, rows } = parseCsv(data, delimiter)
      const csvOutput = rowsToCsv(headers, rows, ',')
      return JSON.stringify({ csv: csvOutput, rowCount: rows.length })
    }

    default:
      return '지원하지 않는 action입니다. (parse, filter, sort, aggregate, to_csv)'
  }
}
