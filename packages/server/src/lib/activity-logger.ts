import { db } from '../db'
import { activityLogs } from '../db/schema'
import { broadcastToChannel } from '../ws/channels'

type LogParams = {
  companyId: string
  type: 'chat' | 'delegation' | 'tool_call' | 'job' | 'sns' | 'error' | 'system' | 'login'
  phase: 'start' | 'end' | 'error'
  actorType: 'user' | 'agent' | 'system'
  actorId?: string
  actorName?: string
  userId?: string
  agentId?: string
  action: string
  detail?: string
  metadata?: Record<string, unknown>
  eventId?: string  // 외부에서 제공 시 사용, 없으면 자동 생성
}

/**
 * 활동 로그 기록 (fire-and-forget)
 * 메인 요청 플로우를 차단하지 않기 위해 내부 try-catch 처리
 */
export async function logActivity(params: LogParams): Promise<void> {
  try {
    const eventId = params.eventId ?? crypto.randomUUID()
    const [inserted] = await db.insert(activityLogs).values({
      eventId,
      companyId: params.companyId,
      type: params.type,
      phase: params.phase,
      actorType: params.actorType,
      actorId: params.actorId,
      actorName: params.actorName,
      userId: params.userId,
      agentId: params.agentId,
      action: params.action,
      detail: params.detail,
      metadata: params.metadata,
    }).returning()

    // 실시간 브로드캐스트
    if (inserted) {
      broadcastToChannel(`activity-log::${params.companyId}`, {
        type: 'new-log',
        log: inserted,
      })
    }
  } catch (err) {
    console.error('[ActivityLogger] 로그 기록 실패:', err)
  }
}
