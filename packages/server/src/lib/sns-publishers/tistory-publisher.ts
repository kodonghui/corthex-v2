/**
 * Tistory Open API Publisher
 * access_token 인증, HTML 본문 + 태그 + 공개설정
 */

import type { PlatformPublisher, PublishInput, PublishResult } from './types'

const API_BASE = 'https://www.tistory.com/apis'

export const tistoryPublisher: PlatformPublisher = {
  platform: 'tistory',

  async publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult> {
    const accessToken = credentials.access_token
    const blogName = credentials.blog_name

    if (!accessToken) {
      return { success: false, error: 'Tistory access_token이 없습니다' }
    }
    if (!blogName) {
      return { success: false, error: 'Tistory blog_name이 없습니다' }
    }

    try {
      // HTML 이스케이프 헬퍼
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

      // HTML 본문 조합
      let htmlContent = esc(input.body).replace(/\n/g, '<br>')
      if (input.imageUrl) {
        htmlContent = `<p><img src="${esc(input.imageUrl)}" alt="${esc(input.title)}"></p>\n${htmlContent}`
      }

      // 해시태그 → 쉼표 구분 태그
      const tag = input.hashtags
        ? input.hashtags.replace(/#/g, '').split(/\s+/).filter(Boolean).join(',')
        : ''

      // visibility: 0(비공개), 1(보호), 3(공개) — 기본 공개
      const visibility = credentials.visibility || '3'

      const params = new URLSearchParams({
        access_token: accessToken,
        blogName,
        title: input.title,
        content: htmlContent,
        visibility,
        ...(tag ? { tag } : {}),
      })

      const res = await fetch(`${API_BASE}/post/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      })

      if (!res.ok) {
        const text = await res.text()
        return { success: false, error: `Tistory 발행 실패 (${res.status}): ${text.slice(0, 200)}` }
      }

      const data = await res.json() as {
        tistory?: {
          status?: string
          postId?: string
          url?: string
          error_message?: string
        }
      }

      if (data.tistory?.status !== '200') {
        return { success: false, error: `Tistory API 오류: ${data.tistory?.error_message || 'unknown'}` }
      }

      return {
        success: true,
        url: data.tistory.url || `https://${blogName}.tistory.com/${data.tistory.postId}`,
        platformId: data.tistory.postId,
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Tistory 발행 오류' }
    }
  },
}
