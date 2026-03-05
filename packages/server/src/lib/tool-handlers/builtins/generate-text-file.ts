import type { ToolHandler } from '../types'

export const generateTextFile: ToolHandler = (input) => {
  const filename = String(input.filename || 'output.txt').replace(/[/\\:*?"<>|]/g, '_')
  const content = String(input.content || '')
  const format = String(input.format || 'text')

  if (!content) {
    return JSON.stringify({ success: false, message: '내용(content)이 비어있습니다.' })
  }

  const ext = format === 'markdown' ? '.md' : format === 'csv' ? '.csv' : '.txt'
  const finalName = filename.includes('.') ? filename : `${filename}${ext}`

  return JSON.stringify({
    success: true,
    filename: finalName,
    format,
    content,
    length: content.length,
    message: `파일 내용이 생성되었습니다: ${finalName} (${content.length}자)`,
  })
}
