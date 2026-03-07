import type { ToolHandler } from '../types'

function queryPath(obj: unknown, path: string): unknown {
  const parts = path.split('.').flatMap((p) => {
    const match = p.match(/^(\w+)\[(\d+)\]$/)
    return match ? [match[1], Number(match[2])] : [p]
  })
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof part === 'number' && Array.isArray(current)) {
      current = current[part]
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[String(part)]
    } else {
      return undefined
    }
  }
  return current
}

function flattenObj(obj: unknown, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return { [prefix || 'value']: obj }
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      const key = prefix ? `${prefix}.${idx}` : String(idx)
      Object.assign(result, flattenObj(item, key))
    })
  } else {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k
      if (v !== null && typeof v === 'object') {
        Object.assign(result, flattenObj(v, key))
      } else {
        result[key] = v
      }
    }
  }
  return result
}

export const jsonParser: ToolHandler = (input) => {
  const action = String(input.action || 'parse')
  const data = String(input.data || '')

  if (!data && action !== 'validate') {
    return '데이터(data)를 입력하세요.'
  }

  switch (action) {
    case 'parse': {
      try {
        const parsed = JSON.parse(data)
        return JSON.stringify({ parsed, type: Array.isArray(parsed) ? 'array' : typeof parsed }, null, 2)
      } catch (e) {
        return `JSON 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
      }
    }

    case 'query': {
      const path = String(input.path || '')
      if (!path) return '조회할 경로(path)를 지정하세요. 예: "users.0.name"'
      try {
        const parsed = JSON.parse(data)
        const result = queryPath(parsed, path)
        return JSON.stringify({ path, result, type: result === undefined ? 'undefined' : typeof result })
      } catch (e) {
        return `JSON 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
      }
    }

    case 'keys': {
      try {
        const parsed = JSON.parse(data)
        if (typeof parsed !== 'object' || parsed === null) return '객체가 아닙니다.'
        const keys = Object.keys(parsed)
        return JSON.stringify({ keys, count: keys.length })
      } catch (e) {
        return `JSON 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
      }
    }

    case 'flatten': {
      try {
        const parsed = JSON.parse(data)
        const flattened = flattenObj(parsed)
        return JSON.stringify({ flattened, keyCount: Object.keys(flattened).length })
      } catch (e) {
        return `JSON 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`
      }
    }

    case 'validate': {
      if (!data) return JSON.stringify({ valid: false, error: '데이터가 비어있습니다.' })
      try {
        JSON.parse(data)
        return JSON.stringify({ valid: true, length: data.length })
      } catch (e) {
        return JSON.stringify({ valid: false, error: e instanceof Error ? e.message : '알 수 없는 오류' })
      }
    }

    default:
      return '지원하지 않는 action입니다. (parse, query, keys, flatten, validate)'
  }
}
