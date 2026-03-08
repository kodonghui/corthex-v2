import { describe, test, expect, beforeEach, mock, spyOn } from 'bun:test'

// ===== Rate Limiter Tests =====
import {
  canPublish,
  recordPublish,
  getWaitTime,
  getRateLimit,
  resetRateLimits,
} from '../../lib/sns-publishers/rate-limiter'

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  test('canPublish returns true when under limit', () => {
    expect(canPublish('instagram')).toBe(true)
    expect(canPublish('twitter')).toBe(true)
    expect(canPublish('facebook')).toBe(true)
    expect(canPublish('naver_blog')).toBe(true)
    expect(canPublish('tistory')).toBe(true)
  })

  test('canPublish returns false when limit reached', () => {
    // naver_blog: 5/hr
    for (let i = 0; i < 5; i++) {
      recordPublish('naver_blog')
    }
    expect(canPublish('naver_blog')).toBe(false)
  })

  test('getWaitTime returns 0 when under limit', () => {
    expect(getWaitTime('instagram')).toBe(0)
  })

  test('getWaitTime returns positive when limit reached', () => {
    for (let i = 0; i < 5; i++) {
      recordPublish('naver_blog')
    }
    expect(getWaitTime('naver_blog')).toBeGreaterThan(0)
  })

  test('getRateLimit returns config for known platform', () => {
    const config = getRateLimit('instagram')
    expect(config).toBeDefined()
    expect(config!.maxRequests).toBe(25)
    expect(config!.windowMs).toBe(3600_000)
  })

  test('getRateLimit returns undefined for unknown platform', () => {
    expect(getRateLimit('unknown' as any)).toBeUndefined()
  })

  test('canPublish returns true for unknown platform', () => {
    expect(canPublish('unknown' as any)).toBe(true)
  })

  test('recordPublish does nothing for unknown platform', () => {
    recordPublish('unknown' as any)
    expect(canPublish('unknown' as any)).toBe(true)
  })

  test('multiple platforms tracked independently', () => {
    for (let i = 0; i < 5; i++) {
      recordPublish('naver_blog')
    }
    expect(canPublish('naver_blog')).toBe(false)
    expect(canPublish('instagram')).toBe(true)
    expect(canPublish('twitter')).toBe(true)
  })

  test('tistory limit is 10/hr', () => {
    for (let i = 0; i < 10; i++) {
      recordPublish('tistory')
    }
    expect(canPublish('tistory')).toBe(false)
  })

  test('daum_cafe limit is 5/hr', () => {
    for (let i = 0; i < 5; i++) {
      recordPublish('daum_cafe')
    }
    expect(canPublish('daum_cafe')).toBe(false)
  })
})

// ===== Publisher Types Tests =====
import type { PlatformPublisher, PublishInput, PublishResult, SnsPlatform } from '../../lib/sns-publishers/types'

describe('Publisher Types', () => {
  test('PublishInput has required fields', () => {
    const input: PublishInput = {
      id: 'test-id',
      platform: 'instagram',
      title: 'Test Title',
      body: 'Test Body',
      hashtags: '#test',
      imageUrl: 'https://example.com/img.jpg',
    }
    expect(input.id).toBe('test-id')
    expect(input.platform).toBe('instagram')
  })

  test('PublishResult success shape', () => {
    const result: PublishResult = {
      success: true,
      url: 'https://instagram.com/p/123',
      platformId: '123',
    }
    expect(result.success).toBe(true)
    expect(result.url).toBeDefined()
  })

  test('PublishResult failure shape', () => {
    const result: PublishResult = {
      success: false,
      error: 'Something went wrong',
    }
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('PlatformPublisher interface compliance', () => {
    const publisher: PlatformPublisher = {
      platform: 'instagram',
      async publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult> {
        return { success: true, url: 'https://test.com' }
      },
    }
    expect(publisher.platform).toBe('instagram')
    expect(typeof publisher.publish).toBe('function')
  })

  test('SnsPlatform covers all platforms', () => {
    const platforms: SnsPlatform[] = ['instagram', 'twitter', 'facebook', 'naver_blog', 'tistory', 'daum_cafe']
    expect(platforms).toHaveLength(6)
  })
})

// ===== Twitter Thread Splitting Tests =====
import { splitIntoThreads } from '../../lib/sns-publishers/twitter-publisher'

describe('Twitter splitIntoThreads', () => {
  test('short text returns single tweet', () => {
    const result = splitIntoThreads('Hello world')
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('Hello world')
  })

  test('exact 280 chars returns single tweet', () => {
    const text = 'a'.repeat(280)
    const result = splitIntoThreads(text)
    expect(result).toHaveLength(1)
  })

  test('long text splits into multiple threads', () => {
    // Create a long text with sentence boundaries
    const sentences = Array.from({ length: 20 }, (_, i) => `This is sentence number ${i + 1}.`)
    const text = sentences.join(' ')
    const result = splitIntoThreads(text)
    expect(result.length).toBeGreaterThan(1)
    // Each should have thread numbering
    expect(result[0]).toContain('1/')
  })

  test('empty text returns empty array element', () => {
    const result = splitIntoThreads('')
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('')
  })

  test('custom maxLen splits correctly', () => {
    const text = 'Hello world. This is a test. Another sentence here.'
    const result = splitIntoThreads(text, 30)
    expect(result.length).toBeGreaterThan(1)
  })
})

// ===== Instagram Publisher Tests =====
import { instagramPublisher } from '../../lib/sns-publishers/instagram-publisher'

describe('Instagram Publisher', () => {
  const mockInput: PublishInput = {
    id: 'test-123',
    platform: 'instagram',
    title: 'Test Post',
    body: 'Test body content',
    hashtags: '#test #instagram',
    imageUrl: 'https://example.com/image.jpg',
  }

  test('returns error when no access_token', async () => {
    const result = await instagramPublisher.publish(mockInput, {})
    expect(result.success).toBe(false)
    expect(result.error).toContain('access_token')
  })

  test('returns error when no imageUrl', async () => {
    const inputNoImage = { ...mockInput, imageUrl: null }
    const result = await instagramPublisher.publish(inputNoImage, { access_token: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('이미지')
  })

  test('platform is instagram', () => {
    expect(instagramPublisher.platform).toBe('instagram')
  })
})

// ===== Twitter Publisher Tests =====
import { twitterPublisher } from '../../lib/sns-publishers/twitter-publisher'

describe('Twitter Publisher', () => {
  const mockInput: PublishInput = {
    id: 'test-456',
    platform: 'twitter',
    title: 'Test Tweet',
    body: 'Test tweet body',
    hashtags: '#test',
    imageUrl: null,
  }

  test('returns error when no credentials', async () => {
    const result = await twitterPublisher.publish(mockInput, {})
    expect(result.success).toBe(false)
    expect(result.error).toContain('OAuth')
  })

  test('platform is twitter', () => {
    expect(twitterPublisher.platform).toBe('twitter')
  })
})

// ===== Facebook Publisher Tests =====
import { facebookPublisher } from '../../lib/sns-publishers/facebook-publisher'

describe('Facebook Publisher', () => {
  const mockInput: PublishInput = {
    id: 'test-789',
    platform: 'facebook',
    title: 'Test FB Post',
    body: 'Test Facebook body',
    hashtags: '#test',
    imageUrl: null,
  }

  test('returns error when no access_token', async () => {
    const result = await facebookPublisher.publish(mockInput, {})
    expect(result.success).toBe(false)
    expect(result.error).toContain('page_access_token')
  })

  test('returns error when no page_id', async () => {
    const result = await facebookPublisher.publish(mockInput, { page_access_token: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('page_id')
  })

  test('platform is facebook', () => {
    expect(facebookPublisher.platform).toBe('facebook')
  })
})

// ===== Tistory Publisher Tests =====
import { tistoryPublisher } from '../../lib/sns-publishers/tistory-publisher'

describe('Tistory Publisher', () => {
  const mockInput: PublishInput = {
    id: 'test-tistory',
    platform: 'tistory',
    title: 'Test Tistory Post',
    body: 'Test Tistory body\nwith line breaks',
    hashtags: '#test #tistory',
    imageUrl: null,
  }

  test('returns error when no access_token', async () => {
    const result = await tistoryPublisher.publish(mockInput, {})
    expect(result.success).toBe(false)
    expect(result.error).toContain('access_token')
  })

  test('returns error when no blog_name', async () => {
    const result = await tistoryPublisher.publish(mockInput, { access_token: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('blog_name')
  })

  test('platform is tistory', () => {
    expect(tistoryPublisher.platform).toBe('tistory')
  })
})

// ===== Naver Blog Publisher Tests =====
import { naverBlogPublisher } from '../../lib/sns-publishers/naver-blog-publisher'

describe('Naver Blog Publisher', () => {
  const mockInput: PublishInput = {
    id: 'test-naver',
    platform: 'naver_blog',
    title: 'Test Naver Post',
    body: 'Test Naver body',
    hashtags: '#test #naver',
    imageUrl: null,
  }

  test('returns error when no naver_id', async () => {
    const result = await naverBlogPublisher.publish(mockInput, {})
    expect(result.success).toBe(false)
    expect(result.error).toContain('네이버 ID/PW')
  })

  test('returns error when no blog_id', async () => {
    const result = await naverBlogPublisher.publish(mockInput, { naver_id: 'test', naver_pw: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('blog_id')
  })

  test('returns error when selenium not available', async () => {
    const result = await naverBlogPublisher.publish(mockInput, {
      naver_id: 'test',
      naver_pw: 'test',
      blog_id: 'testblog',
    })
    expect(result.success).toBe(false)
    // Selenium이 설치되지 않았으면 에러 반환
    expect(result.error).toBeDefined()
  })

  test('platform is naver_blog', () => {
    expect(naverBlogPublisher.platform).toBe('naver_blog')
  })
})

// ===== Publisher Registry Tests =====
import { getPublisher, publisherRegistry } from '../../lib/sns-publishers/publish-engine'

describe('Publisher Registry', () => {
  test('has all 6 platform publishers', () => {
    expect(publisherRegistry.size).toBe(6)
    expect(getPublisher('instagram')).toBeDefined()
    expect(getPublisher('twitter')).toBeDefined()
    expect(getPublisher('facebook')).toBeDefined()
    expect(getPublisher('naver_blog')).toBeDefined()
    expect(getPublisher('tistory')).toBeDefined()
    expect(getPublisher('daum_cafe')).toBeDefined()
  })

  test('each publisher has correct platform', () => {
    expect(getPublisher('instagram')!.platform).toBe('instagram')
    expect(getPublisher('twitter')!.platform).toBe('twitter')
    expect(getPublisher('facebook')!.platform).toBe('facebook')
    expect(getPublisher('naver_blog')!.platform).toBe('naver_blog')
    expect(getPublisher('tistory')!.platform).toBe('tistory')
    expect(getPublisher('daum_cafe')!.platform).toBe('daum_cafe')
  })

  test('unknown platform returns undefined', () => {
    expect(getPublisher('unknown' as any)).toBeUndefined()
  })
})

// ===== SNS Publisher Legacy Wrapper Tests =====
import { publishContent } from '../../lib/sns-publisher'

describe('SNS Publisher Legacy Wrapper', () => {
  test('throws for unsupported platform', async () => {
    const input = {
      id: 'test',
      platform: 'unknown_platform',
      title: 'Test',
      body: 'Body',
      hashtags: null,
      imageUrl: null,
    }
    expect(() => publishContent(input)).toThrow('지원하지 않는 플랫폼')
  })

  test('delegates to correct publisher for instagram', async () => {
    // Instagram without credentials will throw (needs access_token)
    const input = {
      id: 'test',
      platform: 'instagram',
      title: 'Test',
      body: 'Body',
      hashtags: null,
      imageUrl: null,
    }
    try {
      await publishContent(input)
    } catch (err: any) {
      // Expected — no credentials
      expect(err.message).toContain('access_token')
    }
  })

  test('delegates to correct publisher for twitter', async () => {
    const input = {
      id: 'test',
      platform: 'twitter',
      title: 'Test',
      body: 'Body',
      hashtags: null,
      imageUrl: null,
    }
    try {
      await publishContent(input)
    } catch (err: any) {
      expect(err.message).toContain('OAuth')
    }
  })
})

// ===== Rate Limiter Edge Cases =====
describe('Rate Limiter Edge Cases', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  test('instagram limit is 25/hr', () => {
    for (let i = 0; i < 25; i++) {
      expect(canPublish('instagram')).toBe(true)
      recordPublish('instagram')
    }
    expect(canPublish('instagram')).toBe(false)
  })

  test('twitter limit is 100/hr', () => {
    for (let i = 0; i < 100; i++) {
      recordPublish('twitter')
    }
    expect(canPublish('twitter')).toBe(false)
  })

  test('facebook limit is 200/hr', () => {
    for (let i = 0; i < 200; i++) {
      recordPublish('facebook')
    }
    expect(canPublish('facebook')).toBe(false)
  })

  test('reset clears all windows', () => {
    recordPublish('instagram')
    recordPublish('twitter')
    resetRateLimits()
    expect(canPublish('instagram')).toBe(true)
    expect(canPublish('twitter')).toBe(true)
  })

  test('getWaitTime is approximately windowMs when all requests just made', () => {
    for (let i = 0; i < 5; i++) {
      recordPublish('naver_blog')
    }
    const waitTime = getWaitTime('naver_blog')
    // Should be close to 1 hour (3600000ms)
    expect(waitTime).toBeGreaterThan(3500_000)
    expect(waitTime).toBeLessThanOrEqual(3600_000)
  })
})

// ===== Thread Splitting Edge Cases =====
describe('Twitter Thread Edge Cases', () => {
  test('single long word exceeding limit', () => {
    const longWord = 'a'.repeat(300)
    const result = splitIntoThreads(longWord)
    // Can't split a single word — returns as is
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('text with only newlines', () => {
    const text = 'Line 1.\nLine 2.\nLine 3.'
    const result = splitIntoThreads(text)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  test('text with many short sentences', () => {
    const sentences = Array.from({ length: 50 }, (_, i) => `S${i}.`)
    const text = sentences.join(' ')
    const result = splitIntoThreads(text, 100)
    expect(result.length).toBeGreaterThan(1)
    // All threads should have numbering
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toContain(`${i + 1}/${result.length}`)
    }
  })
})

// ===== Publisher Credential Validation =====
describe('Publisher Credential Validation', () => {
  test('instagram requires access_token', async () => {
    const input: PublishInput = {
      id: 'test',
      platform: 'instagram',
      title: 'T',
      body: 'B',
      hashtags: null,
      imageUrl: 'https://img.com/a.jpg',
    }
    const r = await instagramPublisher.publish(input, {})
    expect(r.success).toBe(false)
    expect(r.error).toContain('access_token')
  })

  test('facebook requires page_access_token and page_id', async () => {
    const input: PublishInput = {
      id: 'test',
      platform: 'facebook',
      title: 'T',
      body: 'B',
      hashtags: null,
      imageUrl: null,
    }
    // No token
    let r = await facebookPublisher.publish(input, {})
    expect(r.success).toBe(false)
    expect(r.error).toContain('page_access_token')

    // Token but no page_id
    r = await facebookPublisher.publish(input, { page_access_token: 'tok' })
    expect(r.success).toBe(false)
    expect(r.error).toContain('page_id')
  })

  test('tistory requires access_token and blog_name', async () => {
    const input: PublishInput = {
      id: 'test',
      platform: 'tistory',
      title: 'T',
      body: 'B',
      hashtags: null,
      imageUrl: null,
    }
    let r = await tistoryPublisher.publish(input, {})
    expect(r.success).toBe(false)

    r = await tistoryPublisher.publish(input, { access_token: 'tok' })
    expect(r.success).toBe(false)
    expect(r.error).toContain('blog_name')
  })

  test('twitter requires consumer_key and access_token', async () => {
    const input: PublishInput = {
      id: 'test',
      platform: 'twitter',
      title: 'T',
      body: 'B',
      hashtags: null,
      imageUrl: null,
    }
    const r = await twitterPublisher.publish(input, {})
    expect(r.success).toBe(false)
    expect(r.error).toContain('OAuth')
  })

  test('naver_blog requires naver_id and naver_pw and blog_id', async () => {
    const input: PublishInput = {
      id: 'test',
      platform: 'naver_blog',
      title: 'T',
      body: 'B',
      hashtags: null,
      imageUrl: null,
    }
    let r = await naverBlogPublisher.publish(input, {})
    expect(r.success).toBe(false)
    expect(r.error).toContain('네이버 ID/PW')

    r = await naverBlogPublisher.publish(input, { naver_id: 'id', naver_pw: 'pw' })
    expect(r.success).toBe(false)
    expect(r.error).toContain('blog_id')
  })
})

// ===== DaumCafe deprecated =====
describe('DaumCafe Publisher', () => {
  test('daum_cafe returns deprecated message', async () => {
    const publisher = getPublisher('daum_cafe')!
    const input: PublishInput = {
      id: 'test',
      platform: 'daum_cafe',
      title: 'T',
      body: 'B',
      hashtags: null,
      imageUrl: null,
    }
    const r = await publisher.publish(input, {})
    expect(r.success).toBe(false)
    expect(r.error).toContain('지원되지 않습니다')
  })
})
