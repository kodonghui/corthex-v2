import { db } from '../db'
import { chatSessions, messengerMembers, strategyNotes, strategyNoteShares } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import type { WsClient } from './server'
import { clientMap } from './server'
import type { WsChannel } from '@corthex/shared'
import type { WSContext } from 'hono/ws'

// 채널 구독 처리 + 권한 검증
export async function handleSubscription(
  client: WsClient,
  channel: WsChannel,
  params: Record<string, string> | undefined,
  ws: WSContext,
) {
  const id = params?.id

  switch (channel) {
    case 'chat-stream': {
      if (!id) {
        ws.send(JSON.stringify({ type: 'error', code: 'MISSING_PARAM', channel }))
        return
      }
      // DB에서 세션 소유자 확인
      const [session] = await db
        .select({ userId: chatSessions.userId })
        .from(chatSessions)
        .where(and(eq(chatSessions.id, id), eq(chatSessions.companyId, client.companyId)))
        .limit(1)
      if (!session || session.userId !== client.userId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`chat-stream::${id}`)
      break
    }

    case 'agent-status': {
      // 같은 companyId만 구독 가능
      const targetCompanyId = id || client.companyId
      if (targetCompanyId !== client.companyId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`agent-status::${client.companyId}`)
      break
    }

    case 'notifications': {
      // 본인만 구독 가능
      const targetUserId = id || client.userId
      if (targetUserId !== client.userId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`notifications::${client.userId}`)
      break
    }

    case 'messenger': {
      if (!id) {
        ws.send(JSON.stringify({ type: 'error', code: 'MISSING_PARAM', channel }))
        return
      }
      // DB에서 채널 멤버 확인
      const [member] = await db
        .select({ userId: messengerMembers.userId })
        .from(messengerMembers)
        .where(
          and(
            eq(messengerMembers.channelId, id),
            eq(messengerMembers.userId, client.userId),
            eq(messengerMembers.companyId, client.companyId),
          ),
        )
        .limit(1)
      if (!member) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`messenger::${id}`)
      break
    }

    case 'activity-log': {
      // 같은 companyId만 구독 가능
      const targetCompany = id || client.companyId
      if (targetCompany !== client.companyId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`activity-log::${client.companyId}`)
      break
    }

    case 'strategy-notes': {
      if (!id) {
        ws.send(JSON.stringify({ type: 'error', code: 'MISSING_PARAM', channel }))
        return
      }
      // 메모 작성자 또는 공유 대상만 구독 가능
      const [sNote] = await db
        .select({ userId: strategyNotes.userId })
        .from(strategyNotes)
        .where(and(eq(strategyNotes.id, id), eq(strategyNotes.companyId, client.companyId)))
        .limit(1)
      if (!sNote) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      const isNoteOwner = sNote.userId === client.userId
      if (!isNoteOwner) {
        const [noteShare] = await db
          .select({ noteId: strategyNoteShares.noteId })
          .from(strategyNoteShares)
          .where(and(
            eq(strategyNoteShares.noteId, id),
            eq(strategyNoteShares.sharedWithUserId, client.userId),
          ))
          .limit(1)
        if (!noteShare) {
          ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
          return
        }
      }
      client.subscriptions.add(`strategy-notes::${id}`)
      break
    }

    case 'night-job': {
      // 같은 companyId만 구독 가능
      const jobCompanyId = id || client.companyId
      if (jobCompanyId !== client.companyId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`night-job::${client.companyId}`)
      break
    }

    case 'nexus': {
      // 같은 companyId만 구독 가능
      const nexusCompanyId = id || client.companyId
      if (nexusCompanyId !== client.companyId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`nexus::${client.companyId}`)
      break
    }

    case 'cost':
    case 'command':
    case 'delegation':
    case 'tool': {
      // 같은 companyId만 구독 가능
      const orchCompanyId = id || client.companyId
      if (orchCompanyId !== client.companyId) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
        return
      }
      client.subscriptions.add(`${channel}::${client.companyId}`)
      break
    }

    default:
      ws.send(JSON.stringify({ type: 'error', code: 'UNKNOWN_CHANNEL', channel }))
      return
  }

  ws.send(JSON.stringify({ type: 'subscribed', channel }))
}

// 특정 채널 구독자에게 브로드캐스트
export function broadcastToChannel(channelKey: string, data: unknown) {
  const message = JSON.stringify({ type: 'data', channel: channelKey.split('::')[0], channelKey, data })
  for (const clients of clientMap.values()) {
    for (const client of clients) {
      if (client.subscriptions.has(channelKey)) {
        try {
          client.ws.send(message)
        } catch {
          // 전송 실패 무시
        }
      }
    }
  }
}

// 회사 전체 브로드캐스트 (특정 이벤트 채널)
export function broadcastToCompany(companyId: string, event: string, data: unknown) {
  const channelKey = `${event}::${companyId}`
  broadcastToChannel(channelKey, data)
}
