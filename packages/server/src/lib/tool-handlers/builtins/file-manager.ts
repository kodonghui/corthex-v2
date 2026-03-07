import type { ToolHandler } from '../types'

export const fileManager: ToolHandler = (input) => {
  const action = String(input.action || 'generate')

  switch (action) {
    case 'generate': {
      const filename = String(input.filename || 'output.txt')
        .replace(/\.\./g, '')
        .replace(/[/\\:*?"<>|]/g, '_')
        .replace(/^_+/, '') || 'output'
      const content = String(input.content || '')
      const format = String(input.format || 'text')

      if (!content) {
        return '내용(content)이 비어있습니다.'
      }

      const extMap: Record<string, string> = {
        text: '.txt', markdown: '.md', csv: '.csv', json: '.json', html: '.html', yaml: '.yaml',
      }
      const ext = extMap[format] || '.txt'
      const finalName = filename.includes('.') ? filename : `${filename}${ext}`

      return JSON.stringify({
        filename: finalName,
        format,
        content,
        size: content.length,
        message: `파일 내용이 생성되었습니다: ${finalName} (${content.length}자)`,
      })
    }

    case 'list_formats': {
      return JSON.stringify({
        formats: [
          { id: 'text', ext: '.txt', description: '일반 텍스트' },
          { id: 'markdown', ext: '.md', description: '마크다운 문서' },
          { id: 'csv', ext: '.csv', description: 'CSV 데이터' },
          { id: 'json', ext: '.json', description: 'JSON 데이터' },
          { id: 'html', ext: '.html', description: 'HTML 문서' },
          { id: 'yaml', ext: '.yaml', description: 'YAML 설정' },
        ],
      })
    }

    case 'template': {
      const templateType = String(input.template || 'report')
      const templates: Record<string, { filename: string; content: string }> = {
        report: {
          filename: 'report.md',
          content: '# 보고서 제목\n\n## 요약\n\n## 본문\n\n## 결론\n\n---\n작성일: ' + new Date().toISOString().slice(0, 10),
        },
        meeting: {
          filename: 'meeting-notes.md',
          content: '# 회의록\n\n- 일시: \n- 참석자: \n\n## 안건\n\n## 결정 사항\n\n## 다음 단계\n',
        },
        email: {
          filename: 'email-draft.txt',
          content: '수신: \n참조: \n제목: \n\n안녕하세요,\n\n\n\n감사합니다.\n',
        },
      }

      const tmpl = templates[templateType]
      if (!tmpl) {
        return JSON.stringify({ error: true, message: `지원하지 않는 템플릿입니다. (${Object.keys(templates).join(', ')})` })
      }

      return JSON.stringify({ filename: tmpl.filename, content: tmpl.content, template: templateType })
    }

    default:
      return '지원하지 않는 action입니다. (generate, list_formats, template)'
  }
}
