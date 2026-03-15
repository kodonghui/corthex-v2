/**
 * send_email — Email Tool Handler with MIME Attachment Support (Story 20.4, NFR-I3)
 *
 * Upgrade from v1 send-email.ts: supports MIME multipart attachments
 * (required for pdf_email channel: md_to_pdf → send_email with PDF attachment).
 *
 * Credential keys (registered in credentials store):
 *   smtp_host        — SMTP server hostname (required)
 *   smtp_port        — SMTP port (optional, default 587)
 *   smtp_user        — SMTP auth username (required)
 *   smtp_password    — SMTP auth password (required)
 *
 * Backward compatible: attachments field is optional.
 * When absent, behaves identically to prior no-attachment behavior.
 */
import { z } from 'zod'
import type { BuiltinToolHandler } from '../../engine'
import { ToolError } from '../../lib/tool-error'
import { getDB } from '../../db/scoped-query'
import { decrypt } from '../../lib/credential-crypto'

// --- SMTP credential helper ---

async function getSmtpCreds(companyId: string): Promise<{
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}> {
  const db = getDB(companyId)

  const [hostRow, portRow, userRow, passRow] = await Promise.all([
    db.getCredential('smtp_host'),
    db.getCredential('smtp_port'),
    db.getCredential('smtp_user'),
    db.getCredential('smtp_password'),
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

  const host = await decrypt(hostRow[0].encryptedValue)
  const user = await decrypt(userRow[0].encryptedValue)
  const pass = await decrypt(passRow[0].encryptedValue)
  const portStr = portRow.length ? await decrypt(portRow[0].encryptedValue) : '587'
  const port = Number(portStr) || 587

  return { host, port, secure: port === 465, user, pass }
}

// --- HTML body builder (backward compat) ---

function buildHtmlBody(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escaped}</div>
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
      <p style="font-size: 11px; color: #a1a1aa;">CORTHEX AI 에이전트가 발송한 메일입니다.</p>
    </div>
  `
}

// --- Handler ---

export const handler: BuiltinToolHandler = {
  name: 'send_email',

  schema: z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    body: z.string().optional(),
    attachments: z
      .array(
        z.object({
          filename: z.string().min(1),
          content: z.string().min(1),
          encoding: z.literal('base64'),
        }),
      )
      .optional(),
  }),

  execute: async (input, ctx) => {
    const to = input.to as string
    const subject = (input.subject as string).replace(/[\r\n]/g, ' ')
    const body = (input.body as string | undefined) ?? ''
    const attachments = input.attachments as Array<{ filename: string; content: string; encoding: 'base64' }> | undefined

    // E17: telemetry start
    const startTime = Date.now()
    const [{ id: eventId }] = await getDB(ctx.companyId).insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'send_email',
      startedAt: new Date(),
    })

    try {
      // Get SMTP credentials from encrypted credential store
      const creds = await getSmtpCreds(ctx.companyId)

      // @ts-ignore — nodemailer optional dependency, gracefully fails if missing
      const nodemailer = await import('nodemailer').catch(() => null)
      if (!nodemailer) {
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'nodemailer not available — check server dependencies')
      }

      const transporter = nodemailer.createTransport({
        host: creds.host,
        port: creds.port,
        secure: creds.secure,
        auth: { user: creds.user, pass: creds.pass },
      })

      const html = buildHtmlBody(body)

      const mailOptions: Record<string, unknown> = {
        from: `"CORTHEX" <${creds.user}>`,
        to,
        subject,
        html,
      }

      // NFR-I3: MIME multipart — only added when attachments are present
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          encoding: a.encoding,
          contentType: a.filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        }))
      }

      await transporter.sendMail(mailOptions)

      // E17: success
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      return JSON.stringify({
        success: true,
        to,
        subject,
        attachments: attachments?.map((a) => a.filename) ?? [],
      })
    } catch (err) {
      // E17: failure
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
