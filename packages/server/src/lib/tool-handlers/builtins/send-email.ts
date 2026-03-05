import type { ToolHandler } from '../types'
import { sendEmail } from '../../email-sender'

export const sendEmailTool: ToolHandler = async (input, ctx) => {
  const to = String(input.to || '')
  const subject = String(input.subject || '').replace(/[\r\n]/g, ' ')
  const body = String(input.body || '')

  if (!to || !subject) {
    return JSON.stringify({ success: false, message: '받는 사람(to)과 제목(subject)은 필수입니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('smtp')
  } catch {
    try {
      creds = await ctx.getCredentials('email')
    } catch {
      return JSON.stringify({ success: false, message: 'SMTP 자격증명이 등록되지 않았습니다. 설정에서 SMTP API 키를 등록하세요.' })
    }
  }

  const smtpConfig = {
    host: creds.host,
    port: Number(creds.port) || 587,
    secure: Number(creds.port) === 465,
    user: creds.user,
    pass: creds.password,
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
      <p style="font-size: 11px; color: #a1a1aa;">CORTHEX AI 에이전트가 발송한 메일입니다.</p>
    </div>
  `

  const success = await sendEmail(smtpConfig, { to, subject, html })

  if (success) {
    return JSON.stringify({ success: true, message: `${to}에게 이메일을 발송했습니다.`, subject })
  }

  return JSON.stringify({ success: false, message: '이메일 발송에 실패했습니다. SMTP 설정을 확인하세요.' })
}
