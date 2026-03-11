import type { ToolHandler } from '../types'
import { callNotebookLM } from '../../notebooklm/bridge'

type MindmapFormat = 'mermaid' | 'json' | 'image'

const VALID_FORMATS: MindmapFormat[] = ['mermaid', 'json', 'image']

export const notebooklmGetMindmap: ToolHandler = async (input, ctx) => {
  const notebookId = String(input.notebookId || '')
  const text = String(input.text || '')
  const format = VALID_FORMATS.includes(input.format as MindmapFormat)
    ? (input.format as MindmapFormat)
    : 'mermaid'

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
      action: 'get_mindmap',
      sources,
      options: { notebookId, format },
      credentials: { googleToken: creds.oauth_token || '' },
    })

    if (!result.success) {
      return JSON.stringify({ success: false, message: result.error || '마인드맵 생성 실패' })
    }

    const formatLabel = format === 'mermaid'
      ? 'Mermaid 형식 마인드맵 생성 완료. NEXUS/SketchVibe에서 렌더링 가능.'
      : format === 'json'
        ? 'JSON 구조 마인드맵 생성 완료.'
        : '이미지 마인드맵 생성 완료.'

    return JSON.stringify({
      success: true,
      mindmapData: result.outputData,
      format,
      notebookId: result.notebookId,
      message: formatLabel,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `마인드맵 생성 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
