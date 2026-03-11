import type { ToolHandler } from '../types'
import { callNotebookLM } from '../../notebooklm/bridge'

type AudioStyle = 'briefing' | 'deep_dive' | 'conversation'

const VALID_STYLES: AudioStyle[] = ['briefing', 'deep_dive', 'conversation']

export const notebooklmGenerateAudio: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const topic = String(input.topic || '')
  const style = VALID_STYLES.includes(input.style as AudioStyle)
    ? (input.style as AudioStyle)
    : 'briefing'

  if (!notebookId && !text) {
    return JSON.stringify({ success: false, message: 'notebookId 또는 text 중 하나가 필요합니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('google')
  } catch {
    return JSON.stringify({ success: false, message: 'Google API 자격증명이 등록되지 않았습니다.' })
  }

  const sources = notebookId
    ? [{ type: 'notebook' as const, content: notebookId }]
    : [{ type: 'text' as const, content: text, title: topic }]

  try {
    const result = await callNotebookLM({
      action: 'generate_audio',
      sources,
      options: { notebookId, style, topic, language: 'ko' },
      credentials: { googleToken: creds.oauth_token || '' },
    })

    if (!result.success) {
      return JSON.stringify({ success: false, message: result.error || '오디오 생성 실패' })
    }

    const duration = (result.outputData as Record<string, unknown>)?.durationSeconds
    const styleLabel = style === 'briefing' ? '약 5분' : style === 'deep_dive' ? '약 15분' : '약 20분'

    return JSON.stringify({
      success: true,
      audioUrl: result.outputUrl,
      notebookId: result.notebookId,
      durationSeconds: duration,
      style,
      message: `음성 브리핑 생성 완료 (${styleLabel} 분량, 스타일: ${style}).`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `오디오 생성 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
