import type { ToolHandler } from '../types'

function countWords(text: string): number {
  // Handle both Korean and English
  const korean = (text.match(/[\uAC00-\uD7AF]+/g) || []).length
  const english = text.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length
  return korean + english || text.split(/\s+/).filter(Boolean).length
}

function splitSentences(text: string): string[] {
  // Split on Korean/English sentence endings
  return text
    .split(/(?<=[.!?。])\s+|(?<=다\.)\s+|(?<=요\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function extractKeywords(text: string, topN = 10): { word: string; count: number }[] {
  // Simple TF-based keyword extraction
  const stopWords = new Set([
    '이', '그', '저', '것', '수', '등', '및', '더', '또', '를', '의', '에', '은', '는',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'and', 'or', 'not',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'it', 'this', 'that',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  ])

  const words = text.toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7AF]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))

  const freq = new Map<string, number>()
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1)
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }))
}

export const textSummarizer: ToolHandler = (input) => {
  const action = String(input.action || 'stats')
  const text = String(input.text || '')

  if (!text) return '텍스트(text)를 입력하세요.'

  switch (action) {
    case 'stats': {
      const words = countWords(text)
      const sentences = splitSentences(text)
      const chars = text.length
      const charsNoSpace = text.replace(/\s/g, '').length
      const readingTimeMin = Math.ceil(words / 200) // ~200 words per minute
      return JSON.stringify({
        wordCount: words,
        sentenceCount: sentences.length,
        charCount: chars,
        charCountNoSpaces: charsNoSpace,
        paragraphCount: text.split(/\n\s*\n/).filter(Boolean).length,
        readingTimeMinutes: readingTimeMin,
      })
    }

    case 'keywords': {
      const topN = Number(input.count || 10)
      const keywords = extractKeywords(text, topN)
      return JSON.stringify({ keywords, total: keywords.length })
    }

    case 'sentences': {
      const count = Number(input.count || 3)
      const sentences = splitSentences(text)
      const extracted = sentences.slice(0, count)
      return JSON.stringify({
        sentences: extracted,
        extractedCount: extracted.length,
        totalSentences: sentences.length,
      })
    }

    case 'truncate': {
      const maxLength = Number(input.max_length || 500)
      if (text.length <= maxLength) {
        return JSON.stringify({ text, truncated: false, length: text.length })
      }
      // Smart truncation at sentence boundary
      const sentences = splitSentences(text)
      let result = ''
      for (const sentence of sentences) {
        if ((result + ' ' + sentence).trim().length > maxLength) break
        result = (result + ' ' + sentence).trim()
      }
      if (!result) result = text.slice(0, maxLength).trim() + '...'
      return JSON.stringify({ text: result, truncated: true, originalLength: text.length, length: result.length })
    }

    default:
      return '지원하지 않는 action입니다. (stats, keywords, sentences, truncate)'
  }
}
