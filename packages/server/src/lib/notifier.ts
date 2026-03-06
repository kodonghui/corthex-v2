import { db } from '../db'
import { notifications, notificationPreferences, companies, users } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { broadcastToChannel } from '../ws/channels'
import { sendEmail, buildNotificationEmail } from './email-sender'

type NotifyParams = {
  userId: string
  companyId: string
  type: 'chat_complete' | 'delegation_complete' | 'tool_error' | 'job_complete' | 'job_error' | 'system' | 'messenger_mention'
  title: string
  body?: string
  actionUrl?: string
}

/**
 * 알림 생성 + WS 브로드캐스트 + 이메일 (fire-and-forget)
 */
export async function createNotification(params: NotifyParams): Promise<void> {
  try {
    // 1. 알림 설정 확인
    const [prefs] = await db
      .select({ inApp: notificationPreferences.inApp, email: notificationPreferences.email })
      .from(notificationPreferences)
      .where(and(
        eq(notificationPreferences.userId, params.userId),
        eq(notificationPreferences.companyId, params.companyId),
      ))
      .limit(1)

    const inApp = prefs?.inApp ?? true
    const emailEnabled = prefs?.email ?? false

    // 2. 인앱 알림 생성
    if (inApp) {
      const [inserted] = await db.insert(notifications).values({
        userId: params.userId,
        companyId: params.companyId,
        type: params.type,
        title: params.title,
        body: params.body,
        actionUrl: params.actionUrl,
      }).returning()

      if (inserted) {
        broadcastToChannel(`notifications::${params.userId}`, {
          type: 'new-notification',
          notification: inserted,
        })
      }
    }

    // 3. 이메일 알림 (설정 + SMTP 존재 시)
    if (emailEnabled) {
      const [company] = await db
        .select({ smtpConfig: companies.smtpConfig })
        .from(companies)
        .where(eq(companies.id, params.companyId))
        .limit(1)

      const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, params.userId))
        .limit(1)

      if (company?.smtpConfig && user?.email) {
        const smtp = company.smtpConfig as { host: string; port: number; secure: boolean; user: string; pass: string }
        const html = buildNotificationEmail(params.title, params.body, params.actionUrl)
        sendEmail(smtp, { to: user.email, subject: `[CORTHEX] ${params.title}`, html })
          .catch((err) => console.error('[Notifier] 이메일 발송 에러:', err))
      }
    }
  } catch (err) {
    console.error('[Notifier] 알림 생성 실패:', err)
  }
}

/** 채팅 완료 알림 생성 헬퍼 */
export function notifyChatComplete(userId: string, companyId: string, agentName: string, sessionId: string) {
  return createNotification({
    userId,
    companyId,
    type: 'chat_complete',
    title: `${agentName}이(가) 응답을 완료했습니다`,
    actionUrl: `/chat?session=${sessionId}`,
  })
}

/** 위임 완료 알림 생성 헬퍼 */
export function notifyDelegationComplete(userId: string, companyId: string, agentName: string, sessionId: string) {
  return createNotification({
    userId,
    companyId,
    type: 'delegation_complete',
    title: `${agentName}이(가) 위임 작업을 완료했습니다`,
    body: '채팅에서 결과를 확인하세요',
    actionUrl: `/chat?session=${sessionId}`,
  })
}

/** 도구 호출 실패 알림 생성 헬퍼 */
export function notifyToolError(userId: string, companyId: string, toolName: string) {
  return createNotification({
    userId,
    companyId,
    type: 'tool_error',
    title: `도구 호출 실패: ${toolName}`,
    body: '작전일지에서 상세 내용을 확인하세요',
    actionUrl: '/ops-log?filter=error',
  })
}
