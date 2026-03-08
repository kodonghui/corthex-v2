/**
 * SNS Publisher 공통 타입 정의
 * 모든 플랫폼 publisher가 이 인터페이스를 구현한다.
 */

export type SnsPlatform = 'instagram' | 'twitter' | 'facebook' | 'naver_blog' | 'tistory' | 'daum_cafe'

export interface PublishInput {
  id: string
  platform: SnsPlatform
  title: string
  body: string
  hashtags: string | null
  imageUrl: string | null
  /** 카드뉴스 이미지 URL 배열 (캐러셀용) */
  mediaUrls?: string[]
}

export interface PublishResult {
  success: boolean
  url?: string
  platformId?: string
  error?: string
  screenshotPath?: string
}

export interface PlatformPublisher {
  platform: SnsPlatform
  publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult>
}
