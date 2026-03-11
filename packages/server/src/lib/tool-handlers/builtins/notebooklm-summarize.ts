import type { ToolHandler } from '../types'
import { callNotebookLM } from '../../notebooklm/bridge'

export const notebooklmSummarize: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const maxLength = Math.min(Math.max(Number(input.maxLength) || 500, 50), 5000)

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
      action: 'summarize',
      sources,
      options: { notebookId, maxLength },
      credentials: { googleToken: creds.oauth_token || '' },
    })

    if (!result.success) {
      return JSON.stringify({ success: false, message: result.error || '요약 실패' })
    }

    const summary = (result.outputData as Record<string, unknown>)?.summary || ''

    return JSON.stringify({
      success: true,
      summary,
      notebookId: result.notebookId,
      maxLength,
      message: `요약 생성 완료 (최대 ${maxLength}자).`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `요약 생성 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
