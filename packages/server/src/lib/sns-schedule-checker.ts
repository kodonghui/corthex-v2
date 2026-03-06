/**
 * SNS 예약 발행 체커 — snsContents 테이블에서 scheduled 상태 + scheduledAt <= now 인 콘텐츠를 자동 발행
 */

import { db } from '../db'
import { snsContents } from '../db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { publishContent } from './sns-publisher'
import { logActivity } from './activity-logger'

const SNS_POLL_INTERVAL_MS = 60_000 // 60초마다 폴링

let snsTimer: ReturnType<typeof setInterval> | null = null

export async function checkScheduledSns() {
  try {
    const now = new Date()

    const duePosts = await db
      .select({
        id: snsContents.id,
        companyId: snsContents.companyId,
        platform: snsContents.platform,
        title: snsContents.title,
        body: snsContents.body,
        hashtags: snsContents.hashtags,
        imageUrl: snsContents.imageUrl,
        status: snsContents.status,
      })
      .from(snsContents)
      .where(
        and(
          eq(snsContents.status, 'scheduled'),
          lte(snsContents.scheduledAt, now),
        ),
      )
      .limit(20)

    for (const post of duePosts) {
      try {
        // 상태를 먼저 변경하여 중복 발행 방지
        const [locked] = await db
          .update(snsContents)
          .set({ status: 'published', updatedAt: new Date() })
          .where(and(eq(snsContents.id, post.id), eq(snsContents.status, 'scheduled')))
          .returning({ id: snsContents.id })

        if (!locked) continue // 이미 다른 폴링에서 처리됨

        const result = await publishContent({
          id: post.id,
          platform: post.platform,
          title: post.title,
          body: post.body,
          hashtags: post.hashtags,
          imageUrl: post.imageUrl,
        })

        await db
          .update(snsContents)
          .set({
            publishedUrl: result.url,
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(snsContents.id, post.id))

        logActivity({
          companyId: post.companyId,
          type: 'sns',
          phase: 'end',
          actorType: 'system',
          action: `SNS 예약 발행 완료 (${post.platform})`,
          detail: `${post.title} → ${result.url}`,
        })

        console.log(`📤 SNS 예약 발행 완료: ${post.title} (${post.platform})`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '예약 발행 실패'

        await db
          .update(snsContents)
          .set({ status: 'failed', publishError: errorMsg, updatedAt: new Date() })
          .where(eq(snsContents.id, post.id))

        logActivity({
          companyId: post.companyId,
          type: 'sns',
          phase: 'error',
          actorType: 'system',
          action: `SNS 예약 발행 실패 (${post.platform})`,
          detail: `${post.title} — ${errorMsg}`,
        })

        console.error(`❌ SNS 예약 발행 실패 (${post.id}):`, errorMsg)
      }
    }
  } catch (err) {
    console.error('SNS 예약 발행 체커 오류:', err)
  }
}

export function startSnsScheduleChecker() {
  if (snsTimer) return
  console.log(`📤 SNS 예약 발행 체커 시작 (폴링 간격: ${SNS_POLL_INTERVAL_MS / 1000}초)`)
  snsTimer = setInterval(checkScheduledSns, SNS_POLL_INTERVAL_MS)
  checkScheduledSns()
}

export function stopSnsScheduleChecker() {
  if (snsTimer) {
    clearInterval(snsTimer)
    snsTimer = null
    console.log('🛑 SNS 예약 발행 체커 중지')
  }
}
