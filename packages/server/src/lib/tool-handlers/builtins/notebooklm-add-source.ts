import type { ToolHandler } from '../types'
import { callNotebookLM } from '../../notebooklm/bridge'

export const notebooklmAddSource: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const sources = input.sources as Array<{ type: string; content: string; title?: string }> | undefined

  if (!notebookId) {
    return JSON.stringify({ success: false, message: 'notebookId가 필요합니다.' })
  }

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return JSON.stringify({ success: false, message: '소스(sources) 배열이 필요합니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('google')
  } catch {
    return JSON.stringify({ success: false, message: 'Google API 자격증명이 등록되지 않았습니다.' })
  }

  try {
    const result = await callNotebookLM({
      action: 'add_source',
      sources: sources.map(s => ({
        type: (s.type as 'text' | 'url' | 'file') || 'text',
        content: s.content || '',
        title: s.title,
      })),
      options: { notebookId },
      credentials: { googleToken: creds.oauth_token || '' },
    })

    if (!result.success) {
      return JSON.stringify({ success: false, message: result.error || '소스 추가 실패' })
    }

    return JSON.stringify({
      success: true,
      notebookId,
      message: `${sources.length}개 소스가 노트북에 추가되었습니다.`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `소스 추가 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
