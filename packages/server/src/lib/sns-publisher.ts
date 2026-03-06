/**
 * SNS 발행 스텁 (Stub)
 *
 * v2 초기에는 실제 SNS 발행 대신 스텁 결과를 반환합니다.
 * 추후 각 플랫폼별 실제 발행 로직으로 교체:
 * - Instagram: Graph API v21.0 (photo/reel)
 * - Tistory: Selenium 기반 (카카오 로그인 → 블로그 에디터)
 * - Daum Cafe: Selenium 기반 (카카오 OAuth → TinyMCE)
 */

type PublishResult = {
  url: string
  platformId?: string
}

type SnsAccountInfo = {
  accountId: string
  accountName: string
  credentials: Record<string, string> | null
}

type SnsContentInput = {
  id: string
  platform: string
  title: string
  body: string
  hashtags: string | null
  imageUrl: string | null
  account?: SnsAccountInfo | null
}

export async function publishToInstagram(content: SnsContentInput): Promise<PublishResult> {
  // TODO: Instagram Graph API 연동
  // 1. 미디어 컨테이너 생성 (image_url + caption)
  // 2. 발행 (publish media container)
  // 3. permalink 반환
  console.log(`[SNS:Instagram] STUB 발행 — "${content.title}"`)
  return {
    url: `https://instagram.com/p/stub-${content.id.slice(0, 8)}`,
    platformId: `ig-${content.id.slice(0, 8)}`,
  }
}

export async function publishToTistory(content: SnsContentInput): Promise<PublishResult> {
  // TODO: Tistory Selenium 발행
  // 1. 카카오 로그인
  // 2. 블로그 에디터에 HTML 입력
  // 3. 발행 후 URL 크롤링
  console.log(`[SNS:Tistory] STUB 발행 — "${content.title}"`)
  return {
    url: `https://corthex.tistory.com/stub-${content.id.slice(0, 8)}`,
  }
}

export async function publishToDaumCafe(content: SnsContentInput): Promise<PublishResult> {
  // TODO: Daum Cafe Selenium 발행
  // 1. 카카오 OAuth
  // 2. TinyMCE 에디터에 HTML 입력
  // 3. 발행 후 URL 크롤링
  console.log(`[SNS:DaumCafe] STUB 발행 — "${content.title}"`)
  return {
    url: `https://cafe.daum.net/corthex/stub-${content.id.slice(0, 8)}`,
  }
}

export async function publishContent(content: SnsContentInput): Promise<PublishResult> {
  switch (content.platform) {
    case 'instagram':
      return publishToInstagram(content)
    case 'tistory':
      return publishToTistory(content)
    case 'daum_cafe':
      return publishToDaumCafe(content)
    default:
      throw new Error(`지원하지 않는 플랫폼: ${content.platform}`)
  }
}
