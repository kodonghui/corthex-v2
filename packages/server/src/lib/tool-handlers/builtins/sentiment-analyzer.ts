import type { ToolHandler } from '../types'

// Korean sentiment dictionary (ported from v1 sentiment_analyzer.py)
const POSITIVE_WORDS = [
  '좋다', '좋은', '좋아', '훌륭', '추천', '만족', '최고', '편리', '유용', '도움',
  '잘했', '대박', '짱', '꿀팁', '강추', '괜찮', '나이스', '굿', '효과적', '깔끔',
  '정확', '친절', '빠르', '쉽다', '알차', '유익', '감동', '기대', '완벽', '뛰어나',
  '성공', '혁신', '안정', '신뢰', '합리', '저렴', '세련', '멋지', '탁월', '우수',
]

const NEGATIVE_WORDS = [
  '별로', '실망', '불만', '최악', '짜증', '부족', '비싸', '불편', '쓰레기', '후회',
  '거지', '노답', '폐급', '사기', '망했', '느리', '어렵', '복잡', '불친절', '에러',
  '오류', '버그', '허접', '형편없', '안좋', '나쁘', '구리', '별점', '환불', '해지',
  '답답', '의문', '아쉽', '허술', '미흡', '위험', '피해', '불신', '역겹',
]

function analyzeSentiment(text: string) {
  const positiveCount = POSITIVE_WORDS.filter((w) => text.includes(w)).length
  const negativeCount = NEGATIVE_WORDS.filter((w) => text.includes(w)).length
  const total = positiveCount + negativeCount

  if (total === 0) {
    return { label: '중립' as const, score: 0.5, positiveCount: 0, negativeCount: 0, keywords: [] as string[] }
  }

  const posRatio = positiveCount / total
  const label = posRatio > 0.6 ? '긍정' as const : posRatio < 0.4 ? '부정' as const : '중립' as const
  const foundPositive = POSITIVE_WORDS.filter((w) => text.includes(w))
  const foundNegative = NEGATIVE_WORDS.filter((w) => text.includes(w))

  return {
    label,
    score: Math.round(posRatio * 1000) / 1000,
    positiveCount,
    negativeCount,
    keywords: [...foundPositive.map((w) => `+${w}`), ...foundNegative.map((w) => `-${w}`)],
  }
}

export const sentimentAnalyzer: ToolHandler = (input) => {
  const action = String(input.action || 'analyze')

  if (action === 'analyze') {
    const text = String(input.text || '')
    if (!text) return JSON.stringify({ success: false, message: '분석할 텍스트(text)를 입력하세요.' })
    return JSON.stringify({ success: true, ...analyzeSentiment(text) })
  }

  if (action === 'batch') {
    const texts = input.texts
    if (!Array.isArray(texts) || texts.length === 0) {
      return JSON.stringify({ success: false, message: '분석할 텍스트 배열(texts)을 입력하세요.' })
    }
    const results = texts.map((t: unknown) => {
      const text = String(t || '')
      return { text: text.slice(0, 50), ...analyzeSentiment(text) }
    })
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
    return JSON.stringify({ success: true, results, averageScore: Math.round(avgScore * 1000) / 1000, count: results.length })
  }

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. analyze 또는 batch를 사용하세요.` })
}
