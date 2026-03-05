import { db } from '../db'
import { notifications } from '../db/schema'
import { broadcastToChannel } from '../ws/channels'

type NotifyParams = {
  userId: string
  companyId: string
  type: 'chat_complete' | 'delegation_complete' | 'tool_error' | 'job_complete' | 'job_error' | 'system'
  title: string
  body?: string
  actionUrl?: string
}

/**
 * 알림 생성 + WS 브로드캐스트 (fire-and-forget)
 */
export async function createNotification(params: NotifyParams): Promise<void> {
  try {
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
