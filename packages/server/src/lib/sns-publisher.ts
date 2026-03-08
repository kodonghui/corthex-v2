/**
 * SNS 발행 — PublishEngine 래퍼
 * 기존 sns.ts 라우트에서 publishContent()를 호출하는 인터페이스 유지
 * 실제 발행은 sns-publishers/publish-engine.ts가 처리
 */

import { instagramPublisher } from './sns-publishers/instagram-publisher'
import { twitterPublisher } from './sns-publishers/twitter-publisher'
import { facebookPublisher } from './sns-publishers/facebook-publisher'
import { naverBlogPublisher } from './sns-publishers/naver-blog-publisher'
import { tistoryPublisher } from './sns-publishers/tistory-publisher'
import type { SnsPlatform, PublishInput } from './sns-publishers/types'

type SnsContentInput = {
  id: string
  platform: string
  title: string
  body: string
  hashtags: string | null
  imageUrl: string | null
}

type PublishResultLegacy = {
  url: string
  platformId?: string
}

const publishers: Record<string, typeof instagramPublisher> = {
  instagram: instagramPublisher,
  twitter: twitterPublisher,
  facebook: facebookPublisher,
  naver_blog: naverBlogPublisher,
  tistory: tistoryPublisher,
}

/**
 * 기존 라우트 호환 publishContent
 * 주의: credential은 라우트에서 전달하지 않으므로, 이 함수는
 * credential 없이 동작합니다. credential이 필요한 실제 발행은
 * publishContentById() (publish-engine.ts)를 사용하세요.
 */
export async function publishContent(content: SnsContentInput): Promise<PublishResultLegacy> {
  const publisher = publishers[content.platform]
  if (!publisher) {
    throw new Error(`지원하지 않는 플랫폼: ${content.platform}`)
  }

  const input: PublishInput = {
    id: content.id,
    platform: content.platform as SnsPlatform,
    title: content.title,
    body: content.body,
    hashtags: content.hashtags,
    imageUrl: content.imageUrl,
  }

  const result = await publisher.publish(input, {})

  if (!result.success) {
    throw new Error(result.error || '발행 실패')
  }

  return {
    url: result.url || '',
    platformId: result.platformId,
  }
}
