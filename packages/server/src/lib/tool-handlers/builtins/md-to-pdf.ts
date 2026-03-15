import { marked } from 'marked'
import type { ToolHandler } from '../types'
import { withPuppeteer, ToolResourceUnavailableError } from '../../puppeteer-pool'

// Story 17.2: md_to_pdf — markdown → base64 PDF (D24, E14, NFR-P1)
// Corporate: #0f172a header + Pretendard + Korean support. Minimal: clean white.
// p95: 1-page <10s, 10-page <20s (Chromium startup included).

type Style = 'corporate' | 'minimal' | 'default'

function buildHtml(content: string, style: Style): string {
  const htmlBody = marked.parse(content) as string

  if (style === 'minimal') {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; line-height: 1.6; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 8px; }
  pre { background: #f4f4f4; padding: 12px; border-radius: 4px; overflow-x: auto; }
  code { font-family: monospace; }
</style>
</head>
<body>${htmlBody}</body>
</html>`
  }

  // corporate (default)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
  body {
    font-family: 'Pretendard', 'Noto Sans KR', -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    color: #1e293b;
    line-height: 1.7;
  }
  .header {
    background: #0f172a;
    color: #f8fafc;
    padding: 24px 40px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .content {
    padding: 40px;
  }
  h1 { color: #0f172a; font-size: 24px; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
  h2 { color: #0f172a; font-size: 20px; margin-top: 32px; }
  h3 { color: #334155; font-size: 16px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th { background: #0f172a; color: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e2e8f0; padding: 10px 12px; }
  tr:nth-child(even) td { background: #f8fafc; }
  pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; overflow-x: auto; }
  code { font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 0.9em; }
  blockquote { border-left: 4px solid #3b82f6; margin-left: 0; padding-left: 16px; color: #64748b; }
  .footer {
    background: #0f172a;
    color: #94a3b8;
    padding: 12px 40px;
    font-size: 11px;
    text-align: right;
    position: fixed;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
  }
</style>
</head>
<body>
<div class="header">CORTHEX Intelligence Report</div>
<div class="content">${htmlBody}</div>
</body>
</html>`
}

export const mdToPdf: ToolHandler = async (input) => {
  const content = String(input.content ?? '').trim()
  const styleRaw = String(input.style ?? 'default').trim() as Style

  if (!content) {
    return JSON.stringify({ error: 'content is required' })
  }
  if (content.length > 500_000) {
    return JSON.stringify({ error: 'content exceeds 500,000 character limit' })
  }

  const style: Style = ['corporate', 'minimal', 'default'].includes(styleRaw)
    ? styleRaw
    : 'default'

  try {
    const pdfBase64 = await withPuppeteer(async (browser) => {
      const page = await browser.newPage()
      try {
        const html = buildHtml(content, style === 'default' ? 'corporate' : style)
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20_000 })
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', bottom: '0', left: '0', right: '0' },
        })
        return Buffer.from(pdf).toString('base64')
      } finally {
        await page.close().catch(() => {})
      }
    })
    return JSON.stringify({ pdf: pdfBase64, encoding: 'base64', style })
  } catch (err) {
    if (err instanceof ToolResourceUnavailableError) {
      return JSON.stringify({ error: 'TOOL_RESOURCE_UNAVAILABLE', message: err.message })
    }
    return JSON.stringify({
      error: 'PDF generation failed',
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
