import { db } from '../db'
import { activityLogs } from '../db/schema'

type LogParams = {
  companyId: string
  type: 'chat' | 'delegation' | 'tool_call' | 'job' | 'sns' | 'error' | 'system' | 'login'
  actorType: 'user' | 'agent' | 'system'
  actorId?: string
  actorName?: string
  action: string
  detail?: string
  metadata?: Record<string, unknown>
}

/**
 * 활동 로그 기록 (fire-and-forget)
 * 메인 요청 플로우를 차단하지 않기 위해 내부 try-catch 처리
 */
export async function logActivity(params: LogParams): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      companyId: params.companyId,
      type: params.type,
      actorType: params.actorType,
      actorId: params.actorId,
      actorName: params.actorName,
      action: params.action,
      detail: params.detail,
      metadata: params.metadata,
    })
  } catch (err) {
    console.error('[ActivityLogger] 로그 기록 실패:', err)
  }
}
