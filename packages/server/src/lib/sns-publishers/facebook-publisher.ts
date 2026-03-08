/**
 * Facebook Graph API Publisher
 * 페이지 게시물 발행: 텍스트 + 이미지 지원
 */

import type { PlatformPublisher, PublishInput, PublishResult } from './types'

const API_BASE = 'https://graph.facebook.com/v21.0'

export const facebookPublisher: PlatformPublisher = {
  platform: 'facebook',

  async publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult> {
    const pageAccessToken = credentials.page_access_token || credentials.access_token
    const pageId = credentials.page_id

    if (!pageAccessToken) {
      return { success: false, error: 'Facebook page_access_token이 없습니다' }
    }
    if (!pageId) {
      return { success: false, error: 'Facebook page_id가 없습니다' }
    }

    try {
      // 메시지 조합: title + body + hashtags
      const message = [
        input.title,
        '',
        input.body,
        input.hashtags ? `\n${input.hashtags}` : '',
      ].filter(Boolean).join('\n')

      let res: Response
      let postId: string

      if (input.imageUrl) {
        // 이미지 게시물: /{page-id}/photos
        res = await fetch(`${API_BASE}/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            url: input.imageUrl,
            caption: message,
            access_token: pageAccessToken,
          }),
        })
      } else {
        // 텍스트 게시물: /{page-id}/feed
        res = await fetch(`${API_BASE}/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            message,
            access_token: pageAccessToken,
          }),
        })
      }

      if (!res.ok) {
        const err = await res.json() as { error?: { message?: string } }
        return { success: false, error: `Facebook 발행 실패: ${err.error?.message || res.status}` }
      }

      const data = await res.json() as { id?: string; post_id?: string }
      postId = data.post_id || data.id || ''

      return {
        success: true,
        url: `https://facebook.com/${postId}`,
        platformId: postId,
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Facebook 발행 오류' }
    }
  },
}
