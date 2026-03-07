import type { ToolHandler } from '../types'

function createRegex(pattern: string, flags: string): RegExp {
  return new RegExp(pattern, flags)
}

export const regexMatcher: ToolHandler = (input) => {
  const action = String(input.action || 'test')
  const pattern = String(input.pattern || '')
  const text = String(input.text || '')
  const flags = String(input.flags || 'g')

  if (!pattern) return '정규식 패턴(pattern)을 입력하세요.'
  if (!text && action !== 'validate') return '대상 텍스트(text)를 입력하세요.'

  let regex: RegExp
  try {
    regex = createRegex(pattern, flags)
  } catch (e) {
    return JSON.stringify({
      valid: false,
      error: `잘못된 정규식입니다: ${e instanceof Error ? e.message : '알 수 없는 오류'}`,
    })
  }

  switch (action) {
    case 'test': {
      const result = regex.test(text)
      return JSON.stringify({ pattern, flags, matches: result })
    }

    case 'match': {
      const matches: { match: string; index: number; groups?: Record<string, string> }[] = []
      let m: RegExpExecArray | null
      const re = createRegex(pattern, flags.includes('g') ? flags : flags + 'g')
      while ((m = re.exec(text)) !== null) {
        matches.push({
          match: m[0],
          index: m.index,
          ...(m.groups ? { groups: m.groups } : {}),
        })
        if (!re.global) break
      }
      return JSON.stringify({ pattern, flags, matches, count: matches.length })
    }

    case 'replace': {
      const replacement = String(input.replacement || '')
      const result = text.replace(regex, replacement)
      return JSON.stringify({ pattern, replacement, original: text, result })
    }

    case 'extract': {
      const matches: { full: string; groups: string[] }[] = []
      let m: RegExpExecArray | null
      const re = createRegex(pattern, flags.includes('g') ? flags : flags + 'g')
      while ((m = re.exec(text)) !== null) {
        matches.push({
          full: m[0],
          groups: m.slice(1),
        })
        if (!re.global) break
      }
      return JSON.stringify({ pattern, matches, count: matches.length })
    }

    case 'split': {
      const parts = text.split(regex)
      return JSON.stringify({ pattern, parts, count: parts.length })
    }

    case 'validate': {
      return JSON.stringify({ pattern, valid: true, flags })
    }

    default:
      return '지원하지 않는 action입니다. (test, match, replace, extract, split, validate)'
  }
}
