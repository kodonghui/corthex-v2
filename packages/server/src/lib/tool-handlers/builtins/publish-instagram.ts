import type { ToolHandler } from '../types'

const GRAPH_API = 'https://graph.facebook.com/v18.0'

type MediaResponse = { id?: string; error?: { message?: string } }

export const publishInstagram: ToolHandler = async (input, ctx) => {
  const imageUrl = String(input.imageUrl || '')
  const caption = String(input.caption || '')

  if (!imageUrl) {
    return JSON.stringify({ success: false, message: '이미지 URL(imageUrl)이 필요합니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('instagram')
  } catch {
    return JSON.stringify({ success: false, message: '인스타그램 자격증명이 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  const pageId = creds.page_id
  const accessToken = creds.access_token

  try {
    // Step 1: Create media container
    const containerRes = await fetch(`${GRAPH_API}/${pageId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    })

    if (!containerRes.ok) {
      const err = (await containerRes.json()) as MediaResponse
      return JSON.stringify({ success: false, message: `컨테이너 생성 오류: ${err.error?.message || containerRes.status}` })
    }

    const container = (await containerRes.json()) as MediaResponse
    if (!container.id) {
      return JSON.stringify({ success: false, message: '미디어 컨테이너 ID를 받지 못했습니다.' })
    }

    // Step 2: Publish
    const publishRes = await fetch(`${GRAPH_API}/${pageId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    })

    if (!publishRes.ok) {
      const err = (await publishRes.json()) as MediaResponse
      return JSON.stringify({ success: false, message: `게시 오류: ${err.error?.message || publishRes.status}` })
    }

    const published = (await publishRes.json()) as MediaResponse

    return JSON.stringify({
      success: true,
      message: '인스타그램 게시물이 발행되었습니다.',
      mediaId: published.id,
      caption: caption.slice(0, 100),
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `인스타그램 발행 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
