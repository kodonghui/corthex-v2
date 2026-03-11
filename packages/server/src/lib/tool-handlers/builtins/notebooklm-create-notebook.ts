import type { ToolHandler } from '../types'
import { callNotebookLM } from '../../notebooklm/bridge'

export const notebooklmCreateNotebook: ToolHandler = async (input, ctx) => {
  const title = String(input.title || '새 노트북')
  const sources = input.sources as Array<{ type: string; content: string; title?: string }> | undefined

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return JSON.stringify({ success: false, message: '소스(sources) 배열이 필요합니다. [{type, content, title}] 형식' })
  }

  if (sources.length > 50) {
    return JSON.stringify({ success: false, message: '소스는 최대 50개까지 가능합니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('google')
  } catch {
    return JSON.stringify({ success: false, message: 'Google API 자격증명이 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  try {
    const result = await callNotebookLM({
      action: 'create_notebook',
      sources: sources.map(s => ({
        type: (s.type as 'text' | 'url' | 'file') || 'text',
        content: s.content || '',
        title: s.title,
      })),
      options: { title },
      credentials: { googleToken: creds.oauth_token || '' },
    })

    if (!result.success) {
      return JSON.stringify({ success: false, message: result.error || 'NotebookLM 노트북 생성 실패' })
    }

    return JSON.stringify({
      success: true,
      notebookId: result.notebookId,
      message: `"${title}" 노트북 생성 완료. ${sources.length}개 소스 포함.`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `NotebookLM 노트북 생성 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
