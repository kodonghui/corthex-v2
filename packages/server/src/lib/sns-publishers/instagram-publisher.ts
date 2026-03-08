/**
 * Instagram Graph API v21.0 Publisher
 * 이미지 게시물 발행: 미디어 컨테이너 생성 → 발행 → permalink 반환
 */

import type { PlatformPublisher, PublishInput, PublishResult } from './types'

const API_BASE = 'https://graph.instagram.com/v21.0'

async function getUserId(accessToken: string): Promise<string> {
  const res = await fetch(`${API_BASE}/me?fields=id&access_token=${accessToken}`)
  if (!res.ok) throw new Error(`Instagram user ID 조회 실패: ${res.status}`)
  const data = await res.json() as { id: string }
  return data.id
}

export const instagramPublisher: PlatformPublisher = {
  platform: 'instagram',

  async publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult> {
    const accessToken = credentials.access_token
    if (!accessToken) {
      return { success: false, error: 'Instagram access_token이 없습니다' }
    }

    if (!input.imageUrl) {
      return { success: false, error: 'Instagram 게시물에는 이미지가 필요합니다' }
    }

    try {
      const userId = credentials.user_id || await getUserId(accessToken)

      // caption = body + hashtags
      const caption = input.hashtags
        ? `${input.body}\n\n${input.hashtags}`
        : input.body

      // 1. 미디어 컨테이너 생성
      const containerRes = await fetch(`${API_BASE}/${userId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          image_url: input.imageUrl,
          caption,
          access_token: accessToken,
        }),
      })

      if (!containerRes.ok) {
        const err = await containerRes.json() as { error?: { message?: string } }
        return { success: false, error: `미디어 컨테이너 생성 실패: ${err.error?.message || containerRes.status}` }
      }

      const container = await containerRes.json() as { id: string }

      // 2. 발행 (비동기 처리 — 최대 3회 재시도, 에러코드 9007 대응)
      let publishData: { id: string } | null = null
      for (let attempt = 0; attempt < 3; attempt++) {
        const publishRes = await fetch(`${API_BASE}/${userId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            creation_id: container.id,
            access_token: accessToken,
          }),
        })

        if (publishRes.ok) {
          publishData = await publishRes.json() as { id: string }
          break
        }

        const pubErr = await publishRes.json() as { error?: { code?: number; message?: string } }
        if (pubErr.error?.code === 9007 && attempt < 2) {
          // 미디어 처리 중 — 2초 대기 후 재시도
          await new Promise((r) => setTimeout(r, 2000))
          continue
        }

        return { success: false, error: `발행 실패: ${pubErr.error?.message || publishRes.status}` }
      }

      if (!publishData) {
        return { success: false, error: '미디어 처리 시간 초과' }
      }

      // 3. permalink 조회
      const permalinkRes = await fetch(
        `${API_BASE}/${publishData.id}?fields=permalink&access_token=${accessToken}`,
      )
      let permalink = `https://instagram.com/p/${publishData.id}`
      if (permalinkRes.ok) {
        const plData = await permalinkRes.json() as { permalink?: string }
        if (plData.permalink) permalink = plData.permalink
      }

      return {
        success: true,
        url: permalink,
        platformId: publishData.id,
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Instagram 발행 오류' }
    }
  },
}
