import type { ToolHandler } from '../types'

function countMetrics(code: string) {
  const lines = code.split('\n')
  const totalLines = lines.length
  const blankLines = lines.filter((l) => l.trim() === '').length
  const commentLines = lines.filter((l) => {
    const trimmed = l.trim()
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('#')
  }).length
  const codeLines = totalLines - blankLines - commentLines

  // Function/method count
  const functionMatches = code.match(/\b(function|const\s+\w+\s*=\s*(?:async\s*)?\(|(?:async\s+)?[\w]+\s*\([^)]*\)\s*\{|=>\s*\{)/g)
  const functionCount = functionMatches?.length || 0

  // Import count
  const importMatches = code.match(/^import\s/gm)
  const importCount = importMatches?.length || 0

  return { totalLines, codeLines, blankLines, commentLines, functionCount, importCount }
}

function estimateComplexity(code: string) {
  // Cyclomatic complexity estimation based on branching keywords
  const wordKeywords = ['if', 'else if', 'else', 'switch', 'case', 'for', 'while', 'do', 'catch']
  const symbolKeywords = ['\\?', '&&', '\\|\\|']
  let complexity = 1 // Base complexity

  for (const keyword of wordKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
    const matches = code.match(regex)
    if (matches) complexity += matches.length
  }
  for (const keyword of symbolKeywords) {
    const regex = new RegExp(keyword, 'g')
    const matches = code.match(regex)
    if (matches) complexity += matches.length
  }

  // Nesting depth
  let maxDepth = 0
  let currentDepth = 0
  for (const char of code) {
    if (char === '{') { currentDepth++; maxDepth = Math.max(maxDepth, currentDepth) }
    if (char === '}') currentDepth--
  }

  let level: string
  if (complexity <= 5) level = '낮음 (단순)'
  else if (complexity <= 10) level = '보통'
  else if (complexity <= 20) level = '높음 (리팩토링 권장)'
  else level = '매우 높음 (리팩토링 필수)'

  return { cyclomaticComplexity: complexity, maxNestingDepth: maxDepth, level }
}

function checkNaming(code: string) {
  const issues: string[] = []

  // Check for snake_case in JS/TS (should be camelCase)
  const varMatches = code.matchAll(/\b(?:const|let|var)\s+([a-z][a-z0-9]*(?:_[a-z0-9]+)+)/g)
  for (const match of varMatches) {
    issues.push(`snake_case 변수 발견: '${match[1]}' -> camelCase 권장`)
  }

  // Check for non-PascalCase class/type names
  const classMatches = code.matchAll(/\b(?:class|interface|type)\s+([a-z]\w*)/g)
  for (const match of classMatches) {
    issues.push(`소문자 시작 타입/클래스: '${match[1]}' -> PascalCase 권장`)
  }

  // Check for single-letter variables (except loop counters i, j, k)
  const singleLetterMatches = code.matchAll(/\b(?:const|let|var)\s+([a-hA-Hl-zL-Z])\b/g)
  for (const match of singleLetterMatches) {
    issues.push(`단일 문자 변수: '${match[1]}' -> 의미 있는 이름 권장`)
  }

  // Check for long lines
  const longLines = code.split('\n').filter((l) => l.length > 120)
  if (longLines.length > 0) {
    issues.push(`120자 초과 라인 ${longLines.length}개 발견`)
  }

  return { issues, issueCount: issues.length, status: issues.length === 0 ? '양호' : '개선 필요' }
}

export const codeQualityTool: ToolHandler = (input) => {
  const action = String(input.action || 'analyze')
  const code = String(input.code || '')

  if (!code) return JSON.stringify({ success: false, message: '분석할 코드(code)를 입력하세요.' })

  if (action === 'analyze') {
    const metrics = countMetrics(code)
    const complexity = estimateComplexity(code)
    const commentRatio = metrics.totalLines > 0
      ? Math.round((metrics.commentLines / metrics.totalLines) * 100)
      : 0

    return JSON.stringify({
      success: true,
      metrics: { ...metrics, commentRatio: `${commentRatio}%` },
      complexity,
    })
  }

  if (action === 'naming') {
    const naming = checkNaming(code)
    return JSON.stringify({ success: true, ...naming })
  }

  if (action === 'metrics') {
    const metrics = countMetrics(code)
    const readingTime = Math.ceil(metrics.codeLines / 50) // ~50 lines/min
    return JSON.stringify({
      success: true,
      ...metrics,
      estimatedReadingMinutes: readingTime,
    })
  }

  if (action === 'all') {
    const metrics = countMetrics(code)
    const complexity = estimateComplexity(code)
    const naming = checkNaming(code)
    const commentRatio = metrics.totalLines > 0
      ? Math.round((metrics.commentLines / metrics.totalLines) * 100)
      : 0

    return JSON.stringify({
      success: true,
      metrics: { ...metrics, commentRatio: `${commentRatio}%` },
      complexity,
      naming,
    })
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. analyze, naming, metrics, all을 사용하세요.` })
}
