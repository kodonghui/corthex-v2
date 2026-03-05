import type { ToolHandler } from '../types'

type TtsResponse = {
  audioContent?: string
}

export const textToSpeech: ToolHandler = async (input, ctx) => {
  const text = String(input.text || '')
  if (!text) return JSON.stringify({ success: false, message: '변환할 텍스트(text)가 필요합니다.' })

  if (text.length > 5000) {
    return JSON.stringify({ success: false, message: '텍스트가 너무 깁니다. 5000자 이내로 입력하세요.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('tts')
  } catch {
    return JSON.stringify({ success: false, message: 'TTS API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  const language = String(input.language || 'ko-KR')
  const speed = Number(input.speed || 1.0)

  try {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${creds.api_key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: language, ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: speed },
      }),
    })

    if (!res.ok) {
      return JSON.stringify({ success: false, message: `TTS API 오류: ${res.status}` })
    }

    const data = (await res.json()) as TtsResponse

    return JSON.stringify({
      success: true,
      message: `음성 변환 완료 (${text.length}자, ${language})`,
      audioBase64: data.audioContent,
      format: 'mp3',
      textLength: text.length,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `TTS 변환 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
