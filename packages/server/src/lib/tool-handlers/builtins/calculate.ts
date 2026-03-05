import type { ToolHandler } from '../types'

function safeEvalMath(expr: string): number {
  const tokens = expr.replace(/\s+/g, '').replace(/\^/g, '**')
  let pos = 0

  function parseExpr(): number {
    let left = parseTerm()
    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++]
      const right = parseTerm()
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  function parseTerm(): number {
    let left = parsePower()
    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++]
      const right = parsePower()
      left = op === '*' ? left * right : left / right
    }
    return left
  }

  function parsePower(): number {
    let base = parseUnary()
    if (pos < tokens.length - 1 && tokens[pos] === '*' && tokens[pos + 1] === '*') {
      pos += 2
      const exp = parsePower()
      base = Math.pow(base, exp)
    }
    return base
  }

  function parseUnary(): number {
    if (tokens[pos] === '-') { pos++; return -parseAtom() }
    if (tokens[pos] === '+') { pos++ }
    return parseAtom()
  }

  function parseAtom(): number {
    if (tokens[pos] === '(') {
      pos++
      const val = parseExpr()
      if (tokens[pos] === ')') pos++
      return val
    }
    const start = pos
    while (pos < tokens.length && /[\d.]/.test(tokens[pos])) pos++
    if (pos === start) throw new Error('unexpected token')
    return parseFloat(tokens.slice(start, pos))
  }

  const result = parseExpr()
  if (!isFinite(result)) throw new Error('invalid result')
  return result
}

export const calculate: ToolHandler = (input) => {
  const expression = String(input.expression || '')
  if (!expression) return '수식이 비어있습니다.'

  if (!/^[\d\s+\-*/().^]+$/.test(expression)) {
    return '허용되지 않는 문자가 포함되어 있습니다.'
  }

  try {
    const result = safeEvalMath(expression)
    return JSON.stringify({ expression, result })
  } catch {
    return `계산 오류: '${expression}'을(를) 처리할 수 없습니다.`
  }
}
