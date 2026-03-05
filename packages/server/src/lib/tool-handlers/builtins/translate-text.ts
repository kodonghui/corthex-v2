import type { ToolHandler } from '../types'

type TranslateResponse = {
  data?: {
    translations?: Array<{
      translatedText?: string
      detectedSourceLanguage?: string
    }>
  }
  error?: { message?: string }
}

export const translateText: ToolHandler = async (input, ctx) => {
  const text = String(input.text || '')
  if (!text) return JSON.stringify({ success: false, message: '번역할 텍스트(text)가 필요합니다.' })

  const targetLang = String(input.target || 'en')
  const sourceLang = input.source ? String(input.source) : undefined

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('tts')
  } catch {
    return JSON.stringify({ success: false, message: 'Google API 키가 등록되지 않았습니다. TTS 설정의 API 키를 사용합니다.' })
  }

  try {
    const body: Record<string, unknown> = { q: text, target: targetLang, format: 'text' }
    if (sourceLang) body.source = sourceLang

    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${creds.api_key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return JSON.stringify({ success: false, message: `번역 API 오류: ${res.status}` })
    }

    const data = (await res.json()) as TranslateResponse
    const translation = data.data?.translations?.[0]

    return JSON.stringify({
      success: true,
      originalText: text,
      translatedText: translation?.translatedText || '',
      sourceLang: translation?.detectedSourceLanguage || sourceLang || 'auto',
      targetLang,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `번역 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
