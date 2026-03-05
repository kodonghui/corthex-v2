import type { ToolHandler } from '../types'

type NotionPageResponse = {
  id?: string
  url?: string
}

export const createNotionPage: ToolHandler = async (input, ctx) => {
  const parentId = String(input.parentId || '')
  const title = String(input.title || '')
  const content = String(input.content || '')

  if (!parentId || !title) {
    return JSON.stringify({ success: false, message: '부모 ID(parentId)와 제목(title)은 필수입니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('notion')
  } catch {
    return JSON.stringify({ success: false, message: 'Notion API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  const paragraphs = content.split('\n').filter(Boolean).map((line) => ({
    object: 'block' as const,
    type: 'paragraph' as const,
    paragraph: {
      rich_text: [{ type: 'text' as const, text: { content: line } }],
    },
  }))

  const body = {
    parent: { page_id: parentId },
    properties: {
      title: { title: [{ text: { content: title } }] },
    },
    children: paragraphs.slice(0, 100),
  }

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.api_key}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      return JSON.stringify({ success: false, message: `Notion API 오류: ${res.status} ${errText.slice(0, 200)}` })
    }

    const data = (await res.json()) as NotionPageResponse

    return JSON.stringify({
      success: true,
      message: `페이지가 생성되었습니다: ${title}`,
      pageId: data.id,
      url: data.url,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `Notion 페이지 생성 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
