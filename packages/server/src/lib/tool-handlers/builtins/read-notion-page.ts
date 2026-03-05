import type { ToolHandler } from '../types'

type RichText = { plain_text: string }
type NotionBlock = {
  type: string
  [key: string]: unknown
}
type NotionBlocksResponse = {
  results?: NotionBlock[]
}

function extractBlockText(block: NotionBlock): string {
  const type = block.type
  const data = block[type] as { rich_text?: RichText[] } | undefined
  if (!data?.rich_text) return ''
  const text = data.rich_text.map((rt) => rt.plain_text).join('')

  switch (type) {
    case 'heading_1': return `# ${text}`
    case 'heading_2': return `## ${text}`
    case 'heading_3': return `### ${text}`
    case 'bulleted_list_item': return `- ${text}`
    case 'numbered_list_item': return `1. ${text}`
    case 'to_do': return `- [ ] ${text}`
    case 'code': return `\`\`\`\n${text}\n\`\`\``
    case 'quote': return `> ${text}`
    default: return text
  }
}

export const readNotionPage: ToolHandler = async (input, ctx) => {
  const pageId = String(input.pageId || '')
  if (!pageId) return JSON.stringify({ content: '', message: '페이지 ID(pageId)가 필요합니다.' })

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('notion')
  } catch {
    return JSON.stringify({ content: '', message: 'Notion API 키가 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      headers: {
        'Authorization': `Bearer ${creds.api_key}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (!res.ok) {
      return JSON.stringify({ content: '', message: `Notion API 오류: ${res.status}` })
    }

    const data = (await res.json()) as NotionBlocksResponse
    const lines = (data.results || []).map(extractBlockText).filter(Boolean)

    return JSON.stringify({ content: lines.join('\n'), blockCount: lines.length })
  } catch (err) {
    return JSON.stringify({
      content: '',
      message: `Notion 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
