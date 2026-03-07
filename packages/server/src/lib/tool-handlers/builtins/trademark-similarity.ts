import type { ToolHandler } from '../types'

// Hangul jamo decomposition (ported from v1 trademark_similarity.py)
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

const KO_TO_EN: Record<string, string> = {
  'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae',
  'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye',
  'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe',
  'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we',
  'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i',
}

// Jongsung (final consonant) romanization differs from chosung
const JONG_TO_EN: Record<string, string> = {
  'ㄱ': 'k', 'ㄲ': 'k', 'ㄴ': 'n', 'ㄷ': 't', 'ㄹ': 'l',
  'ㅁ': 'm', 'ㅂ': 'p', 'ㅅ': 't', 'ㅆ': 't', 'ㅇ': 'ng',
  'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  'ㄳ': 'k', 'ㄵ': 'n', 'ㄶ': 'n', 'ㄺ': 'k', 'ㄻ': 'm',
  'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'l', 'ㅀ': 'l', 'ㅄ': 'p',
}

type JamoEntry = { jamo: string; position: 'cho' | 'jung' | 'jong' | 'other' }

function decomposeHangul(text: string): string[] {
  const jamos: string[] = []
  for (const char of text) {
    const code = char.charCodeAt(0)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const offset = code - 0xAC00
      const cho = Math.floor(offset / (21 * 28))
      const jung = Math.floor((offset % (21 * 28)) / 28)
      const jong = offset % 28
      jamos.push(CHOSUNG[cho], JUNGSUNG[jung])
      if (jong > 0) jamos.push(JONGSUNG[jong])
    } else {
      jamos.push(char.toLowerCase())
    }
  }
  return jamos
}

function decomposeWithPosition(text: string): JamoEntry[] {
  const entries: JamoEntry[] = []
  for (const char of text) {
    const code = char.charCodeAt(0)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const offset = code - 0xAC00
      const cho = Math.floor(offset / (21 * 28))
      const jung = Math.floor((offset % (21 * 28)) / 28)
      const jong = offset % 28
      entries.push({ jamo: CHOSUNG[cho], position: 'cho' })
      entries.push({ jamo: JUNGSUNG[jung], position: 'jung' })
      if (jong > 0) entries.push({ jamo: JONGSUNG[jong], position: 'jong' })
    } else {
      entries.push({ jamo: char.toLowerCase(), position: 'other' })
    }
  }
  return entries
}

function romanize(text: string): string {
  const entries = decomposeWithPosition(text)
  return entries.map((e) => {
    if (e.position === 'jong') return JONG_TO_EN[e.jamo] || e.jamo
    return KO_TO_EN[e.jamo] || e.jamo
  }).join('')
}

function jamoSimilarity(a: string, b: string): number {
  const jamosA = decomposeHangul(a)
  const jamosB = decomposeHangul(b)
  if (jamosA.length === 0 && jamosB.length === 0) return 1
  if (jamosA.length === 0 || jamosB.length === 0) return 0

  const setA = new Set(jamosA)
  const setB = new Set(jamosB)
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size

  return union === 0 ? 0 : Math.round((intersection / union) * 1000) / 1000
}

function phoneticSimilarity(a: string, b: string): number {
  const romA = romanize(a)
  const romB = romanize(b)
  if (romA === romB) return 1
  if (romA.length === 0 || romB.length === 0) return 0

  // Levenshtein-based similarity
  const maxLen = Math.max(romA.length, romB.length)
  const dist = levenshtein(romA, romB)
  return Math.round(((maxLen - dist) / maxLen) * 1000) / 1000
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function compareBrands(name1: string, name2: string) {
  const visual = jamoSimilarity(name1, name2)
  const phonetic = phoneticSimilarity(name1, name2)
  const overall = Math.round(((visual * 0.4 + phonetic * 0.6)) * 1000) / 1000

  let riskLevel: string
  if (overall >= 0.8) riskLevel = '높음 - 상표 분쟁 가능성 높음'
  else if (overall >= 0.5) riskLevel = '보통 - 추가 검토 필요'
  else riskLevel = '낮음 - 분쟁 가능성 낮음'

  return {
    name1,
    name2,
    visualSimilarity: visual,
    phoneticSimilarity: phonetic,
    overallSimilarity: overall,
    riskLevel,
    romanized1: romanize(name1),
    romanized2: romanize(name2),
  }
}

export const trademarkSimilarity: ToolHandler = (input) => {
  const action = String(input.action || 'check')

  if (action === 'check') {
    const name1 = String(input.name1 || '')
    const name2 = String(input.name2 || '')
    if (!name1 || !name2) return JSON.stringify({ success: false, message: '비교할 두 상표명(name1, name2)을 입력하세요.' })

    const result = compareBrands(name1, name2)
    return JSON.stringify({
      success: true,
      ...result,
      disclaimer: '이 검사는 참고용이며, 실제 상표 등록은 변리사와 상담하세요.',
    })
  }

  if (action === 'batch') {
    const name = String(input.name || '')
    const candidates = input.candidates
    if (!name || !Array.isArray(candidates) || candidates.length === 0) {
      return JSON.stringify({ success: false, message: '기준 상표명(name)과 비교 대상 배열(candidates)을 입력하세요.' })
    }

    const results = candidates.map((c: unknown) => compareBrands(name, String(c)))
    results.sort((a, b) => b.overallSimilarity - a.overallSimilarity)

    return JSON.stringify({
      success: true,
      baseName: name,
      results,
      highestRisk: results[0],
      disclaimer: '이 검사는 참고용이며, 실제 상표 등록은 변리사와 상담하세요.',
    })
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. check 또는 batch를 사용하세요.` })
}
