import type { ToolHandler } from '../types'
import { callNotebookLM } from '../../notebooklm/bridge'

type SlideStyle = 'professional' | 'minimal' | 'data_heavy'

const VALID_STYLES: SlideStyle[] = ['professional', 'minimal', 'data_heavy']

export const notebooklmCreateSlides: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const slideCount = Math.min(Math.max(Number(input.slideCount) || 10, 1), 50)
  const style = VALID_STYLES.includes(input.style as SlideStyle)
    ? (input.style as SlideStyle)
    : 'professional'

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
    : [{ type: 'text' as const, content: text }]

  try {
    const result = await callNotebookLM({
      action: 'create_slides',
      sources,
      options: { notebookId, slideCount, style },
      credentials: { googleToken: creds.oauth_token || '' },
    })

    if (!result.success) {
      return JSON.stringify({ success: false, message: result.error || '슬라이드 생성 실패' })
    }

    return JSON.stringify({
      success: true,
      slidesUrl: result.outputUrl,
      notebookId: result.notebookId,
      slideCount,
      style,
      message: `${slideCount}장 프레젠테이션 생성 완료 (스타일: ${style}).`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `슬라이드 생성 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
