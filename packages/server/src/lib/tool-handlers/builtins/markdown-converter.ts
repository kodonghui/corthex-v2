import type { ToolHandler } from '../types'

function mdToText(md: string): string {
  return md
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function htmlToMd(html: string): string {
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function mdToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="$1">$2</code></pre>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // List items
    .replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr>')
    // Paragraphs (lines not already tagged)
    .replace(/^(?!<[hluop]|<li|<hr|<pre)(.+)$/gm, '<p>$1</p>')

  return html
}

function arrayToTable(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return '데이터가 비어있거나 배열이 아닙니다.'
  const first = data[0]
  if (typeof first !== 'object' || first === null) return '배열의 각 요소는 객체여야 합니다.'

  const headers = Object.keys(first as Record<string, unknown>)
  const sep = headers.map(() => '---')
  const rows = data.map((row: Record<string, unknown>) =>
    headers.map((h) => String(row[h] ?? '')).join(' | ')
  )

  return `| ${headers.join(' | ')} |\n| ${sep.join(' | ')} |\n${rows.map((r) => `| ${r} |`).join('\n')}`
}

export const markdownConverter: ToolHandler = (input) => {
  const action = String(input.action || 'to_text')

  switch (action) {
    case 'to_text': {
      const md = String(input.text || input.markdown || '')
      if (!md) return '변환할 마크다운 텍스트를 입력하세요.'
      return JSON.stringify({ text: mdToText(md), originalLength: md.length })
    }

    case 'to_table': {
      const dataStr = String(input.data || '')
      if (!dataStr) return '테이블로 변환할 데이터(JSON 배열)를 입력하세요.'
      try {
        const data = JSON.parse(dataStr)
        const table = arrayToTable(data)
        return JSON.stringify({ table, rowCount: Array.isArray(data) ? data.length : 0 })
      } catch {
        return 'JSON 파싱에 실패했습니다. 유효한 JSON 배열을 입력하세요.'
      }
    }

    case 'from_html': {
      const html = String(input.html || '')
      if (!html) return '변환할 HTML을 입력하세요.'
      return JSON.stringify({ markdown: htmlToMd(html), originalLength: html.length })
    }

    case 'to_html': {
      const md = String(input.text || input.markdown || '')
      if (!md) return '변환할 마크다운 텍스트를 입력하세요.'
      return JSON.stringify({ html: mdToHtml(md), originalLength: md.length })
    }

    default:
      return '지원하지 않는 action입니다. (to_text, to_table, from_html, to_html)'
  }
}
