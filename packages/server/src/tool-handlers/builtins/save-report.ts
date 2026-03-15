/**
 * save_report — Report Save & Multi-Channel Distribution (FR-RM1, FR-RM2, E13, E15, E17)
 *
 * E15 Partial Failure Contract:
 *   Step 1: DB INSERT (must succeed — throws on failure, no channels attempted)
 *   Step 2: Channel distribution via Promise.allSettled() (NOT Promise.all)
 *   - Failed channels: logged, NOT rolled back
 *   - report already in DB = always accessible via web_dashboard
 *
 * D27 Channel Phases:
 *   web_dashboard: Phase 1 (always available via DB — no-op)
 *   pdf_email: Phase 1 (md_to_pdf + send_email, implemented in Story 20.4)
 *   notion/notebooklm: Phase 2
 *   google_drive: Phase 4
 */
import { z } from 'zod'
import { marked } from 'marked'
import type { BuiltinToolHandler, ToolCallContext } from '../../engine'
import { ToolError } from '../../lib/tool-error'
import { getDB } from '../../db/scoped-query'
import { decrypt } from '../../lib/credential-crypto'
import { withPuppeteer, ToolResourceUnavailableError } from '../../lib/puppeteer-pool'

// --- Channel types ---

type ChannelResult =
  | { status: 'success'; channel: string }
  | { status: 'failed'; channel: string; error: string }

// --- Corporate HTML builder for pdf_email channel ---

function buildCorporateHtml(htmlBody: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; color: #1e293b; line-height: 1.7; }
  .header { background: #0f172a; color: #f8fafc; padding: 24px 40px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  .content { padding: 40px; }
  h1 { color: #0f172a; font-size: 24px; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
  h2 { color: #0f172a; font-size: 20px; margin-top: 32px; }
  h3 { color: #334155; font-size: 16px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th { background: #0f172a; color: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e2e8f0; padding: 10px 12px; }
  tr:nth-child(even) td { background: #f8fafc; }
  pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; overflow-x: auto; }
  code { font-family: monospace; font-size: 0.9em; }
  blockquote { border-left: 4px solid #3b82f6; margin-left: 0; padding-left: 16px; color: #64748b; }
</style>
</head>
<body>
<div class="header">CORTHEX Intelligence Report</div>
<div class="content">${htmlBody}</div>
</body>
</html>`
}

// --- Channel dispatcher (E15) ---

async function distributeToChannel(
  reportId: string,
  content: string,
  title: string,
  channel: string,
  ctx: ToolCallContext,
): Promise<ChannelResult> {
  switch (channel) {
    case 'web_dashboard':
      // Phase 1: report in DB = automatically accessible via web_dashboard — no extra distribution
      return { status: 'success', channel }

    case 'pdf_email': {
      // Phase 1: md_to_pdf(corporate) → send_email(attachment: PDF) (Story 20.4, D27)
      // Step 1: Get SMTP credentials
      const db = getDB(ctx.companyId)
      const [hostRow, userRow, passRow, portRow, recipientRow] = await Promise.all([
        db.getCredential('smtp_host'),
        db.getCredential('smtp_user'),
        db.getCredential('smtp_password'),
        db.getCredential('smtp_port'),
        db.getCredential('smtp_recipient'),
      ])

      if (!hostRow.length) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'smtp_host not configured — register SMTP credentials in admin settings')
      }
      if (!userRow.length) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'smtp_user not configured — register SMTP credentials in admin settings')
      }
      if (!passRow.length) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'smtp_password not configured — register SMTP credentials in admin settings')
      }

      const smtpHost = await decrypt(hostRow[0].encryptedValue)
      const smtpUser = await decrypt(userRow[0].encryptedValue)
      const smtpPass = await decrypt(passRow[0].encryptedValue)
      const smtpPort = portRow.length ? Number(await decrypt(portRow[0].encryptedValue)) || 587 : 587
      // Recipient: use smtp_recipient if configured, otherwise fall back to smtp_user (send-to-self)
      const recipientEmail = recipientRow.length
        ? await decrypt(recipientRow[0].encryptedValue)
        : smtpUser

      // Step 2: Generate PDF via Puppeteer (corporate style — same as md_to_pdf handler)
      let base64Pdf: string
      try {
        base64Pdf = await withPuppeteer(async (browser) => {
          const page = await browser.newPage()
          try {
            const htmlBody = marked.parse(content) as string
            const html = buildCorporateHtml(htmlBody)
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
      } catch (err) {
        if (err instanceof ToolResourceUnavailableError) {
          throw new ToolError('TOOL_RESOURCE_UNAVAILABLE', `md_to_pdf failed: ${err.message}`)
        }
        throw new ToolError('TOOL_RESOURCE_UNAVAILABLE', 'PDF generation failed')
      }

      // Step 3: Send email with PDF as MIME attachment
      // @ts-ignore — nodemailer optional dependency
      const nodemailer = await import('nodemailer').catch(() => null)
      if (!nodemailer) {
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'nodemailer not available')
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })

      const safeTitle = title.replace(/[/\\:*?"<>|]/g, '-')
      await transporter.sendMail({
        from: `"CORTHEX" <${smtpUser}>`,
        to: recipientEmail,
        subject: title,
        html: '<p>CORTHEX AI 보고서가 첨부파일로 전달되었습니다.</p>',
        attachments: [
          {
            filename: `${safeTitle}.pdf`,
            content: base64Pdf,
            encoding: 'base64',
            contentType: 'application/pdf',
          },
        ],
      })

      return { status: 'success', channel }
    }

    case 'notion':
    case 'notebooklm':
      throw new ToolError(
        'CHANNEL_NOT_IMPLEMENTED',
        `Channel '${channel}' is available in Phase 2. Currently Phase 1 only.`,
      )

    case 'google_drive':
      throw new ToolError(
        'CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4',
        `Channel 'google_drive' is not available until Phase 4 (Google Workspace MCP).`,
      )

    default:
      throw new ToolError(
        'CHANNEL_NOT_IMPLEMENTED',
        `Unknown channel: '${channel}'. Supported Phase 1 channels: web_dashboard, pdf_email.`,
      )
  }
}

// --- Handler ---

export const handler: BuiltinToolHandler = {
  name: 'save_report',

  schema: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    distribute_to: z.array(z.string()).optional(),
  }),

  execute: async (input, ctx) => {
    const title = input.title as string
    const content = input.content as string
    const type = input.type as string | undefined
    const tags = (input.tags as string[] | undefined) ?? []
    const distributeTo = (input.distribute_to as string[] | undefined) ?? ['web_dashboard']

    // E17: INSERT telemetry row at start
    const startTime = Date.now()
    const [{ id: eventId }] = await getDB(ctx.companyId).insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'save_report',
      startedAt: new Date(),
    })

    try {
      // === Step 1: DB INSERT (must succeed before any channel distribution) ===
      let reportId: string
      try {
        const [{ id }] = await getDB(ctx.companyId).insertReport({
          title,
          content,
          type,
          runId: ctx.runId,
          agentId: ctx.agentId,
          tags,
        })
        reportId = id
      } catch {
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'save_report: DB insert failed')
      }

      // === Step 2: Channel distribution (E15 partial failure — Promise.allSettled) ===
      const settled = await Promise.allSettled(
        distributeTo.map((channel) =>
          distributeToChannel(reportId, content, title, channel, ctx),
        ),
      )

      const channelResults: ChannelResult[] = settled.map((result, i) => {
        const channel = distributeTo[i]!
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          const err = result.reason as Error | ToolError
          const errorCode =
            err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
          return { status: 'failed' as const, channel, error: errorCode }
        }
      })

      // === Step 3: Update distributionResults JSONB ===
      const distributionResults = Object.fromEntries(
        channelResults.map((r) => [
          r.channel,
          r.status === 'success' ? 'success' : r.error,
        ]),
      )
      await getDB(ctx.companyId).updateReportDistribution(reportId, distributionResults)

      // E17: UPDATE on success
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      // === Step 4: Return structured result to LLM ===
      const successCount = channelResults.filter((r) => r.status === 'success').length
      return JSON.stringify({
        reportId,
        summary: `Report saved. ${successCount}/${channelResults.length} channels succeeded.`,
        channels: channelResults,
      })
    } catch (err) {
      // E17: UPDATE on failure
      const errorCode = err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode,
        durationMs: Date.now() - startTime,
      })
      throw err
    }
  },
}
