/**
 * 이메일 발송 유틸 (SMTP 기반)
 * SMTP 미설정 시 조용히 스킵
 */

type EmailParams = {
  to: string
  subject: string
  html: string
}

type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

/**
 * 이메일 발송 (fire-and-forget)
 * SMTP 설정이 없으면 조용히 스킵
 */
export async function sendEmail(smtpConfig: SmtpConfig | null, params: EmailParams): Promise<boolean> {
  if (!smtpConfig) return false

  try {
    // nodemailer는 런타임에 동적 임포트 (미설치 시 graceful fail)
    const nodemailer = await import('nodemailer').catch(() => null)
    if (!nodemailer) {
      console.warn('[EmailSender] nodemailer 미설치 — 이메일 발송 스킵')
      return false
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    })

    await transporter.sendMail({
      from: `"CORTHEX" <${smtpConfig.user}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    return true
  } catch (err) {
    console.error('[EmailSender] 이메일 발송 실패:', err)
    return false
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** 알림 이메일 HTML 생성 */
export function buildNotificationEmail(title: string, body?: string, actionUrl?: string): string {
  const safeTitle = escapeHtml(title)
  const safeBody = body ? escapeHtml(body) : ''
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="background: #4f46e5; color: white; padding: 12px 20px; border-radius: 8px 8px 0 0; font-size: 14px; font-weight: 600;">
        CORTHEX 알림
      </div>
      <div style="border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 8px 8px; padding: 20px;">
        <p style="font-size: 15px; font-weight: 600; margin: 0 0 8px;">${safeTitle}</p>
        ${safeBody ? `<p style="font-size: 13px; color: #71717a; margin: 0 0 16px;">${safeBody}</p>` : ''}
        ${actionUrl ? `<a href="${encodeURI(actionUrl)}" style="display: inline-block; background: #4f46e5; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">확인하기</a>` : ''}
      </div>
      <p style="font-size: 11px; color: #a1a1aa; margin-top: 16px; text-align: center;">이 메일은 CORTHEX에서 자동 발송되었습니다.</p>
    </div>
  `
}
