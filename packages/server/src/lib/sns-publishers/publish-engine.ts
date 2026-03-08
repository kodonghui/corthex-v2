/**
 * SNS 통합 발행 엔진
 * 플랫폼별 publisher 레지스트리 + credential 복호화 + rate limit + 재시도
 */

import { db } from '../../db'
import { snsContents, snsAccounts } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { decryptCredentials } from '../../services/credential-vault'
import { canPublish, recordPublish, getWaitTime } from './rate-limiter'
import { instagramPublisher } from './instagram-publisher'
import { twitterPublisher } from './twitter-publisher'
import { facebookPublisher } from './facebook-publisher'
import { naverBlogPublisher } from './naver-blog-publisher'
import { tistoryPublisher } from './tistory-publisher'
import type { PlatformPublisher, PublishInput, PublishResult, SnsPlatform } from './types'

// Publisher 레지스트리
const publisherRegistry = new Map<SnsPlatform, PlatformPublisher>()
publisherRegistry.set('instagram', instagramPublisher)
publisherRegistry.set('twitter', twitterPublisher)
publisherRegistry.set('facebook', facebookPublisher)
publisherRegistry.set('naver_blog', naverBlogPublisher)
publisherRegistry.set('tistory', tistoryPublisher)

// daum_cafe는 Tistory와 동일한 publisher 사용 (하위 호환)
publisherRegistry.set('daum_cafe', {
  platform: 'daum_cafe',
  async publish(input, credentials) {
    // daum_cafe는 Selenium이 필요하지만 v2에서는 deprecated
    return { success: false, error: 'Daum Cafe 발행은 더 이상 지원되지 않습니다. Twitter/Facebook을 사용하세요.' }
  },
})

const MAX_RETRIES = 3
const RETRY_DELAYS = [60_000, 300_000, 900_000] // 1분, 5분, 15분

export async function publishContentById(contentId: string, companyId: string): Promise<PublishResult> {
  // 1. 콘텐츠 조회
  const [content] = await db
    .select()
    .from(snsContents)
    .where(and(eq(snsContents.id, contentId), eq(snsContents.companyId, companyId)))
    .limit(1)

  if (!content) {
    return { success: false, error: 'SNS 콘텐츠를 찾을 수 없습니다' }
  }

  if (content.status !== 'approved' && content.status !== 'scheduled') {
    return { success: false, error: `발행할 수 없는 상태입니다: ${content.status}` }
  }

  const platform = content.platform as SnsPlatform

  // 2. Rate limit 확인
  if (!canPublish(platform)) {
    const waitMs = getWaitTime(platform)
    return { success: false, error: `Rate limit 초과 — ${Math.ceil(waitMs / 60000)}분 후 재시도하세요` }
  }

  // 3. Publisher 찾기
  const publisher = publisherRegistry.get(platform)
  if (!publisher) {
    return { success: false, error: `지원하지 않는 플랫폼: ${platform}` }
  }

  // 4. Credential 복호화
  let credentials: Record<string, string> = {}
  if (content.snsAccountId) {
    const [account] = await db
      .select()
      .from(snsAccounts)
      .where(and(eq(snsAccounts.id, content.snsAccountId), eq(snsAccounts.companyId, companyId)))
      .limit(1)

    if (account?.credentials) {
      try {
        const encryptedObj = typeof account.credentials === 'string'
          ? JSON.parse(account.credentials) as Record<string, string>
          : account.credentials as Record<string, string>
        credentials = await decryptCredentials(encryptedObj)
      } catch (err) {
        return { success: false, error: `Credential 복호화 실패: ${err instanceof Error ? err.message : 'unknown'}` }
      }
    }
  }

  // 5. 카드뉴스 시리즈 이미지 수집
  let mediaUrls: string[] | undefined
  if (content.isCardNews) {
    const meta = (content.metadata as Record<string, unknown>) || {}
    const cards = (meta.cards as Array<{ imageUrl?: string }>) || []
    const urls = cards.map((c) => c.imageUrl).filter((u): u is string => !!u)
    if (urls.length > 0) {
      mediaUrls = urls
    }
  }

  // 6. 발행 실행
  const publishInput: PublishInput = {
    id: content.id,
    platform,
    title: content.title,
    body: content.body,
    hashtags: content.hashtags,
    imageUrl: content.imageUrl,
    mediaUrls,
  }

  const result = await publisher.publish(publishInput, credentials)

  // 7. Rate limit 기록
  if (result.success) {
    recordPublish(platform)
  }

  // 8. 메타데이터 업데이트 (재시도 횟수 등)
  const existingMeta = (content.metadata as Record<string, unknown>) || {}
  const retryCount = (existingMeta.retryCount as number) || 0

  if (result.success) {
    await db
      .update(snsContents)
      .set({
        status: 'published',
        publishedUrl: result.url,
        publishedAt: new Date(),
        publishError: null,
        metadata: {
          ...existingMeta,
          retryCount,
          publishedPlatformId: result.platformId,
          ...(result.screenshotPath ? { screenshotPath: result.screenshotPath } : {}),
        },
        updatedAt: new Date(),
      })
      .where(eq(snsContents.id, contentId))
  } else {
    const newRetryCount = retryCount + 1
    const isFinalFailure = newRetryCount >= MAX_RETRIES

    await db
      .update(snsContents)
      .set({
        status: isFinalFailure ? 'failed' : content.status, // 최종 실패 시 failed, 아니면 유지
        publishError: result.error || '발행 실패',
        metadata: {
          ...existingMeta,
          retryCount: newRetryCount,
          lastError: result.error,
          lastRetryAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(snsContents.id, contentId))
  }

  return result
}

// 재시도용 — 실패한 콘텐츠 재발행
export async function retryPublish(contentId: string, companyId: string): Promise<PublishResult> {
  const [content] = await db
    .select()
    .from(snsContents)
    .where(and(eq(snsContents.id, contentId), eq(snsContents.companyId, companyId)))
    .limit(1)

  if (!content) {
    return { success: false, error: 'SNS 콘텐츠를 찾을 수 없습니다' }
  }

  const meta = (content.metadata as Record<string, unknown>) || {}
  const retryCount = (meta.retryCount as number) || 0

  if (retryCount >= MAX_RETRIES) {
    return { success: false, error: `최대 재시도 횟수(${MAX_RETRIES}회)를 초과했습니다` }
  }

  // 상태를 approved로 복구 후 재시도
  if (content.status === 'failed') {
    await db
      .update(snsContents)
      .set({ status: 'approved', publishError: null, updatedAt: new Date() })
      .where(eq(snsContents.id, contentId))
  }

  return publishContentById(contentId, companyId)
}

// 발행 결과 조회
export async function getPublishResult(contentId: string, companyId: string) {
  const [content] = await db
    .select({
      id: snsContents.id,
      platform: snsContents.platform,
      status: snsContents.status,
      publishedUrl: snsContents.publishedUrl,
      publishedAt: snsContents.publishedAt,
      publishError: snsContents.publishError,
      metadata: snsContents.metadata,
    })
    .from(snsContents)
    .where(and(eq(snsContents.id, contentId), eq(snsContents.companyId, companyId)))
    .limit(1)

  if (!content) return null

  const meta = (content.metadata as Record<string, unknown>) || {}

  return {
    id: content.id,
    platform: content.platform,
    status: content.status,
    publishedUrl: content.publishedUrl,
    publishedAt: content.publishedAt,
    publishError: content.publishError,
    retryCount: (meta.retryCount as number) || 0,
    maxRetries: MAX_RETRIES,
    platformId: meta.publishedPlatformId as string | undefined,
    screenshotPath: meta.screenshotPath as string | undefined,
    lastRetryAt: meta.lastRetryAt as string | undefined,
  }
}

// 레지스트리 접근 (테스트용)
export function getPublisher(platform: SnsPlatform): PlatformPublisher | undefined {
  return publisherRegistry.get(platform)
}

export { publisherRegistry }
