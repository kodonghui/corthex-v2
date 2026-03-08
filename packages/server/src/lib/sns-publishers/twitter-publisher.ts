/**
 * Twitter/X API v2 Publisher
 * OAuth 1.0a 인증, 텍스트+이미지 트윗 발행, 280자 초과 시 스레드 분할
 */

import crypto from 'node:crypto'
import type { PlatformPublisher, PublishInput, PublishResult } from './types'

const API_BASE = 'https://api.twitter.com'

interface OAuthCredentials {
  consumer_key: string
  consumer_secret: string
  access_token: string
  access_token_secret: string
}

function generateOAuthHeader(
  method: string,
  url: string,
  creds: OAuthCredentials,
  extraParams?: Record<string, string>,
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(16).toString('hex')

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.consumer_key,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: creds.access_token,
    oauth_version: '1.0',
    ...extraParams,
  }

  // 파라미터 정렬 후 서명 기반 문자열 생성
  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&')

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`

  const signingKey = `${encodeURIComponent(creds.consumer_secret)}&${encodeURIComponent(creds.access_token_secret)}`
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')

  oauthParams.oauth_signature = signature

  const headerParts = Object.keys(oauthParams)
    .filter((k) => k.startsWith('oauth_'))
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ')

  return `OAuth ${headerParts}`
}

function splitIntoThreads(text: string, maxLen = 280): string[] {
  if (text.length <= maxLen) return [text]

  const threads: string[] = []
  const sentences = text.split(/(?<=[.!?\n])\s+/)
  let current = ''

  for (const sentence of sentences) {
    const suffix = ` (${threads.length + 1}/…)`
    if (current.length + sentence.length + suffix.length > maxLen && current.length > 0) {
      threads.push(current.trim() + ` (${threads.length + 1}/…)`)
      current = sentence
    } else {
      current += (current ? ' ' : '') + sentence
    }
  }

  if (current.trim()) {
    threads.push(current.trim())
  }

  // 번호 재매기기
  return threads.map((t, i) => {
    if (threads.length <= 1) return t
    const numSuffix = ` (${i + 1}/${threads.length})`
    // 이미 번호가 있으면 교체
    return t.replace(/\s*\(\d+\/[…\d]+\)$/, '') + numSuffix
  })
}

export const twitterPublisher: PlatformPublisher = {
  platform: 'twitter',

  async publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult> {
    const creds: OAuthCredentials = {
      consumer_key: credentials.consumer_key || '',
      consumer_secret: credentials.consumer_secret || '',
      access_token: credentials.access_token || '',
      access_token_secret: credentials.access_token_secret || '',
    }

    if (!creds.consumer_key || !creds.access_token) {
      return { success: false, error: 'Twitter OAuth 인증 정보가 없습니다' }
    }

    try {
      // 트윗 텍스트 조합
      let text = input.body
      if (input.hashtags) text += `\n\n${input.hashtags}`

      const threads = splitIntoThreads(text)
      let lastTweetId = ''
      let firstTweetId = ''

      for (let i = 0; i < threads.length; i++) {
        const tweetUrl = `${API_BASE}/2/tweets`

        const tweetBody: Record<string, unknown> = { text: threads[i] }
        if (lastTweetId) {
          tweetBody.reply = { in_reply_to_tweet_id: lastTweetId }
        }

        const authHeader = generateOAuthHeader('POST', tweetUrl, creds)

        const res = await fetch(tweetUrl, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tweetBody),
        })

        if (!res.ok) {
          const err = await res.json() as { detail?: string; title?: string }
          return { success: false, error: `트윗 발행 실패: ${err.detail || err.title || res.status}` }
        }

        const data = await res.json() as { data: { id: string } }
        lastTweetId = data.data.id
        if (i === 0) firstTweetId = lastTweetId
      }

      // 사용자명 가져오기
      const username = credentials.username || 'user'

      return {
        success: true,
        url: `https://x.com/${username}/status/${firstTweetId}`,
        platformId: firstTweetId,
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Twitter 발행 오류' }
    }
  },
}

// 내보내기 — 테스트용
export { splitIntoThreads }
