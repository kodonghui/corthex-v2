/**
 * Story 14-2 TEA: AI 이미지 생성 + 자동 포스팅 로직 검증
 * bun test src/__tests__/unit/sns-ai-image-gen.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. 이미지 프롬프트 검증 로직
// ============================================================
describe('이미지 프롬프트 검증', () => {
  function validateImagePrompt(prompt: string | undefined): { valid: boolean; error?: string } {
    if (!prompt) return { valid: false, error: '이미지 설명(prompt)이 필요합니다.' }
    if (prompt.length > 4000) return { valid: false, error: '프롬프트가 너무 깁니다. 4000자 이내로 입력하세요.' }
    return { valid: true }
  }

  test('유효한 프롬프트', () => {
    expect(validateImagePrompt('A beautiful sunset over the ocean')).toEqual({ valid: true })
  })

  test('빈 문자열은 무효', () => {
    const result = validateImagePrompt('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('필요합니다')
  })

  test('undefined는 무효', () => {
    const result = validateImagePrompt(undefined)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('필요합니다')
  })

  test('4000자 이하는 유효', () => {
    const prompt = 'a'.repeat(4000)
    expect(validateImagePrompt(prompt).valid).toBe(true)
  })

  test('4001자 이상은 무효', () => {
    const prompt = 'a'.repeat(4001)
    const result = validateImagePrompt(prompt)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('4000자')
  })

  test('한글 프롬프트도 유효', () => {
    expect(validateImagePrompt('미래적인 로봇이 마케팅 회의하는 장면')).toEqual({ valid: true })
  })
})

// ============================================================
// 2. generateSnsImage 결과 처리 로직
// ============================================================
describe('이미지 생성 결과 처리', () => {
  type ImageGenResult = { imageUrl: string | null; error?: string }

  function processImageResult(result: ImageGenResult): {
    hasImage: boolean
    imageUrl: string | null
    errorMessage?: string
  } {
    return {
      hasImage: !!result.imageUrl,
      imageUrl: result.imageUrl,
      errorMessage: result.error,
    }
  }

  test('성공 시 imageUrl 반환', () => {
    const result = processImageResult({ imageUrl: 'https://example.com/image.png' })
    expect(result.hasImage).toBe(true)
    expect(result.imageUrl).toBe('https://example.com/image.png')
    expect(result.errorMessage).toBeUndefined()
  })

  test('실패 시 null + 에러 메시지', () => {
    const result = processImageResult({ imageUrl: null, error: 'OpenAI API 키가 등록되지 않았습니다.' })
    expect(result.hasImage).toBe(false)
    expect(result.imageUrl).toBeNull()
    expect(result.errorMessage).toContain('OpenAI')
  })

  test('실패 시 에러 메시지 없으면 undefined', () => {
    const result = processImageResult({ imageUrl: null })
    expect(result.hasImage).toBe(false)
    expect(result.errorMessage).toBeUndefined()
  })
})

// ============================================================
// 3. generate-with-image 부분 실패 로직
// ============================================================
describe('텍스트+이미지 동시 생성 부분 실패 처리', () => {
  type GenerateResult = {
    content: { id: string; title: string; imageUrl: string | null }
    imageGenerationError?: string
  }

  function simulateGenerateWithImage(
    textSuccess: boolean,
    imageSuccess: boolean,
    imagePrompt?: string,
  ): GenerateResult | { error: string } {
    if (!textSuccess) return { error: '텍스트 생성 실패' }

    const content = {
      id: 'test-id',
      title: '테스트 제목',
      imageUrl: imageSuccess && imagePrompt ? 'https://example.com/image.png' : null,
    }

    return {
      content,
      imageGenerationError: imagePrompt && !imageSuccess ? '이미지 생성 실패' : undefined,
    }
  }

  test('텍스트+이미지 모두 성공', () => {
    const result = simulateGenerateWithImage(true, true, '이미지 프롬프트')
    expect(result).not.toHaveProperty('error')
    const r = result as GenerateResult
    expect(r.content.imageUrl).toBe('https://example.com/image.png')
    expect(r.imageGenerationError).toBeUndefined()
  })

  test('텍스트 성공 + 이미지 실패 → 콘텐츠 저장됨 (부분 실패)', () => {
    const result = simulateGenerateWithImage(true, false, '이미지 프롬프트')
    expect(result).not.toHaveProperty('error')
    const r = result as GenerateResult
    expect(r.content.id).toBe('test-id')
    expect(r.content.imageUrl).toBeNull()
    expect(r.imageGenerationError).toBe('이미지 생성 실패')
  })

  test('이미지 프롬프트 없으면 이미지 생성 안 함', () => {
    const result = simulateGenerateWithImage(true, false) // imagePrompt 없음
    expect(result).not.toHaveProperty('error')
    const r = result as GenerateResult
    expect(r.content.imageUrl).toBeNull()
    expect(r.imageGenerationError).toBeUndefined() // 에러도 없음
  })

  test('텍스트 실패 → 전체 실패', () => {
    const result = simulateGenerateWithImage(false, true, '이미지 프롬프트')
    expect(result).toHaveProperty('error')
    expect((result as { error: string }).error).toBe('텍스트 생성 실패')
  })
})

// ============================================================
// 4. generate-image 상태 검증 (기존 콘텐츠에 이미지 추가)
// ============================================================
describe('기존 콘텐츠 이미지 생성 상태 검증', () => {
  function canGenerateImage(status: string): boolean {
    return status === 'draft' || status === 'rejected'
  }

  test('draft에서 이미지 생성 가능', () => {
    expect(canGenerateImage('draft')).toBe(true)
  })

  test('rejected에서 이미지 생성 가능', () => {
    expect(canGenerateImage('rejected')).toBe(true)
  })

  test('pending에서 이미지 생성 불가', () => {
    expect(canGenerateImage('pending')).toBe(false)
  })

  test('approved에서 이미지 생성 불가', () => {
    expect(canGenerateImage('approved')).toBe(false)
  })

  test('scheduled에서 이미지 생성 불가', () => {
    expect(canGenerateImage('scheduled')).toBe(false)
  })

  test('published에서 이미지 생성 불가', () => {
    expect(canGenerateImage('published')).toBe(false)
  })

  test('failed에서 이미지 생성 불가', () => {
    expect(canGenerateImage('failed')).toBe(false)
  })
})

// ============================================================
// 5. 소유권 검증 로직
// ============================================================
describe('이미지 생성 소유권 검증', () => {
  function canUserGenerateImage(createdBy: string, requestUserId: string): boolean {
    return createdBy === requestUserId
  }

  test('본인 콘텐츠는 이미지 생성 가능', () => {
    expect(canUserGenerateImage('user-1', 'user-1')).toBe(true)
  })

  test('타인 콘텐츠는 이미지 생성 불가', () => {
    expect(canUserGenerateImage('user-1', 'user-2')).toBe(false)
  })
})

// ============================================================
// 6. DALL-E 3 요청 파라미터 검증
// ============================================================
describe('DALL-E 3 요청 파라미터', () => {
  function buildDalleRequest(prompt: string) {
    return {
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    }
  }

  test('모델은 dall-e-3', () => {
    const req = buildDalleRequest('test')
    expect(req.model).toBe('dall-e-3')
  })

  test('이미지 수는 1', () => {
    const req = buildDalleRequest('test')
    expect(req.n).toBe(1)
  })

  test('크기는 1024x1024', () => {
    const req = buildDalleRequest('test')
    expect(req.size).toBe('1024x1024')
  })

  test('프롬프트가 전달됨', () => {
    const req = buildDalleRequest('A cat sitting on a chair')
    expect(req.prompt).toBe('A cat sitting on a chair')
  })
})

// ============================================================
// 7. 크레덴셜 에러 처리
// ============================================================
describe('OpenAI 크레덴셜 에러 처리', () => {
  function handleCredentialError(hasCredential: boolean): { canProceed: boolean; error?: string } {
    if (!hasCredential) {
      return { canProceed: false, error: 'OpenAI API 키가 등록되지 않았습니다. 설정에서 등록하세요.' }
    }
    return { canProceed: true }
  }

  test('크레덴셜 있으면 진행 가능', () => {
    expect(handleCredentialError(true)).toEqual({ canProceed: true })
  })

  test('크레덴셜 없으면 진행 불가 + 에러', () => {
    const result = handleCredentialError(false)
    expect(result.canProceed).toBe(false)
    expect(result.error).toContain('OpenAI API 키')
  })
})

// ============================================================
// 8. generate-with-image 스키마 검증
// ============================================================
describe('generate-with-image 스키마 검증', () => {
  type GenerateWithImageInput = {
    platform: string
    agentId: string
    topic: string
    imagePrompt?: string
  }

  function validateInput(input: Partial<GenerateWithImageInput>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    if (!input.platform || !['instagram', 'tistory', 'daum_cafe'].includes(input.platform)) {
      errors.push('유효하지 않은 플랫폼')
    }
    if (!input.agentId) errors.push('에이전트 ID 필요')
    if (!input.topic || input.topic.length === 0) errors.push('주제 필요')
    if (input.imagePrompt !== undefined && input.imagePrompt.length > 4000) {
      errors.push('이미지 프롬프트 4000자 초과')
    }
    return { valid: errors.length === 0, errors }
  }

  test('모든 필수 필드 있으면 유효', () => {
    const result = validateInput({
      platform: 'instagram',
      agentId: '123e4567-e89b-12d3-a456-426614174000',
      topic: 'AI 마케팅',
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('imagePrompt 없어도 유효 (optional)', () => {
    const result = validateInput({
      platform: 'tistory',
      agentId: 'uuid',
      topic: '기술 블로그',
    })
    expect(result.valid).toBe(true)
  })

  test('imagePrompt 포함해도 유효', () => {
    const result = validateInput({
      platform: 'daum_cafe',
      agentId: 'uuid',
      topic: '카페 게시물',
      imagePrompt: '따뜻한 카페 인테리어',
    })
    expect(result.valid).toBe(true)
  })

  test('platform 누락 시 무효', () => {
    const result = validateInput({ agentId: 'uuid', topic: 'test' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('유효하지 않은 플랫폼')
  })

  test('잘못된 platform 무효', () => {
    const result = validateInput({ platform: 'twitter', agentId: 'uuid', topic: 'test' })
    expect(result.valid).toBe(false)
  })

  test('topic 누락 시 무효', () => {
    const result = validateInput({ platform: 'instagram', agentId: 'uuid' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('주제 필요')
  })

  test('imagePrompt 4000자 초과 시 무효', () => {
    const result = validateInput({
      platform: 'instagram',
      agentId: 'uuid',
      topic: 'test',
      imagePrompt: 'a'.repeat(4001),
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('이미지 프롬프트 4000자 초과')
  })
})

// ============================================================
// 9. generate-image 스키마 검증
// ============================================================
describe('generate-image 스키마 검증', () => {
  function validateImagePromptSchema(imagePrompt: unknown): { valid: boolean; error?: string } {
    if (typeof imagePrompt !== 'string') return { valid: false, error: '문자열이어야 합니다' }
    if (imagePrompt.length === 0) return { valid: false, error: '최소 1자 이상' }
    if (imagePrompt.length > 4000) return { valid: false, error: '4000자 초과' }
    return { valid: true }
  }

  test('유효한 프롬프트', () => {
    expect(validateImagePromptSchema('이미지 설명')).toEqual({ valid: true })
  })

  test('빈 문자열 무효', () => {
    const result = validateImagePromptSchema('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('1자')
  })

  test('4000자 초과 무효', () => {
    const result = validateImagePromptSchema('a'.repeat(4001))
    expect(result.valid).toBe(false)
  })

  test('숫자 무효', () => {
    expect(validateImagePromptSchema(123).valid).toBe(false)
  })

  test('undefined 무효', () => {
    expect(validateImagePromptSchema(undefined).valid).toBe(false)
  })

  test('null 무효', () => {
    expect(validateImagePromptSchema(null).valid).toBe(false)
  })
})

// ============================================================
// 10. 이미지 포함 발행 로직
// ============================================================
describe('이미지 포함 발행', () => {
  type SnsPublishInput = {
    id: string
    platform: string
    title: string
    body: string
    hashtags: string | null
    imageUrl: string | null
  }

  function buildPublishPayload(content: SnsPublishInput) {
    return {
      id: content.id,
      platform: content.platform,
      title: content.title,
      body: content.body,
      hashtags: content.hashtags,
      imageUrl: content.imageUrl,
    }
  }

  test('이미지 URL 포함하여 발행 페이로드 생성', () => {
    const payload = buildPublishPayload({
      id: '1',
      platform: 'instagram',
      title: '테스트',
      body: '본문',
      hashtags: '#test',
      imageUrl: 'https://example.com/image.png',
    })
    expect(payload.imageUrl).toBe('https://example.com/image.png')
  })

  test('이미지 URL 없이 발행 페이로드 생성', () => {
    const payload = buildPublishPayload({
      id: '1',
      platform: 'tistory',
      title: '테스트',
      body: '본문',
      hashtags: null,
      imageUrl: null,
    })
    expect(payload.imageUrl).toBeNull()
  })
})

// ============================================================
// 11. 활동 로그 기록 검증
// ============================================================
describe('이미지 생성 활동 로그', () => {
  function buildImageGenLogEntry(params: {
    companyId: string
    userId: string
    action: string
    title: string
  }) {
    return {
      companyId: params.companyId,
      type: 'sns' as const,
      phase: 'end' as const,
      actorType: params.action.includes('AI') ? 'agent' : 'user',
      actorId: params.userId,
      action: params.action,
      detail: params.title,
    }
  }

  test('AI 이미지+텍스트 생성 로그', () => {
    const log = buildImageGenLogEntry({
      companyId: 'c1',
      userId: 'u1',
      action: 'AI SNS 콘텐츠+이미지 생성 (instagram)',
      title: '테스트 제목',
    })
    expect(log.type).toBe('sns')
    expect(log.actorType).toBe('agent')
    expect(log.action).toContain('이미지')
  })

  test('개별 이미지 생성 로그', () => {
    const log = buildImageGenLogEntry({
      companyId: 'c1',
      userId: 'u1',
      action: 'SNS AI 이미지 생성',
      title: '테스트',
    })
    expect(log.type).toBe('sns')
    expect(log.actorType).toBe('agent')
    expect(log.action).toBe('SNS AI 이미지 생성')
  })
})

// ============================================================
// 12. DALL-E API 응답 파싱
// ============================================================
describe('DALL-E API 응답 파싱', () => {
  type DalleResponse = {
    data?: Array<{ url?: string; revised_prompt?: string }>
    error?: { message?: string }
  }

  function parseImageUrl(response: DalleResponse): string | null {
    return response.data?.[0]?.url ?? null
  }

  test('정상 응답에서 URL 추출', () => {
    const url = parseImageUrl({
      data: [{ url: 'https://oaidalleapiprodscus.blob.core.windows.net/image.png', revised_prompt: 'revised' }],
    })
    expect(url).toBe('https://oaidalleapiprodscus.blob.core.windows.net/image.png')
  })

  test('data 배열 비어있으면 null', () => {
    expect(parseImageUrl({ data: [] })).toBeNull()
  })

  test('data 없으면 null', () => {
    expect(parseImageUrl({})).toBeNull()
  })

  test('url 없는 항목이면 null', () => {
    expect(parseImageUrl({ data: [{ revised_prompt: 'test' }] })).toBeNull()
  })

  test('에러 응답이면 null', () => {
    expect(parseImageUrl({ error: { message: 'Rate limit exceeded' } })).toBeNull()
  })
})

// ============================================================
// 13. imagePrompt optional 필드 처리
// ============================================================
describe('imagePrompt optional 필드 전달', () => {
  function buildGeneratePayload(aiForm: {
    platform: string
    agentId: string
    topic: string
    imagePrompt: string
  }) {
    return {
      ...aiForm,
      imagePrompt: aiForm.imagePrompt || undefined,
    }
  }

  test('imagePrompt 있으면 포함', () => {
    const payload = buildGeneratePayload({
      platform: 'instagram',
      agentId: 'uuid',
      topic: 'test',
      imagePrompt: 'beautiful image',
    })
    expect(payload.imagePrompt).toBe('beautiful image')
  })

  test('imagePrompt 빈 문자열이면 undefined로 변환', () => {
    const payload = buildGeneratePayload({
      platform: 'instagram',
      agentId: 'uuid',
      topic: 'test',
      imagePrompt: '',
    })
    expect(payload.imagePrompt).toBeUndefined()
  })
})

// ============================================================
// 14. 이미지 미리보기 표시 조건
// ============================================================
describe('이미지 미리보기 표시 조건', () => {
  function shouldShowImagePreview(imageUrl: string | null | undefined): boolean {
    return !!imageUrl
  }

  test('imageUrl 있으면 표시', () => {
    expect(shouldShowImagePreview('https://example.com/image.png')).toBe(true)
  })

  test('imageUrl null이면 미표시', () => {
    expect(shouldShowImagePreview(null)).toBe(false)
  })

  test('imageUrl undefined이면 미표시', () => {
    expect(shouldShowImagePreview(undefined)).toBe(false)
  })

  test('imageUrl 빈 문자열이면 미표시', () => {
    expect(shouldShowImagePreview('')).toBe(false)
  })
})

// ============================================================
// 15. 이미지 생성 버튼 표시 조건
// ============================================================
describe('이미지 생성 버튼 표시 조건', () => {
  function shouldShowGenerateImageButton(status: string, showImagePrompt: boolean): boolean {
    return (status === 'draft' || status === 'rejected') && !showImagePrompt
  }

  test('draft + 프롬프트 미표시 → 버튼 표시', () => {
    expect(shouldShowGenerateImageButton('draft', false)).toBe(true)
  })

  test('rejected + 프롬프트 미표시 → 버튼 표시', () => {
    expect(shouldShowGenerateImageButton('rejected', false)).toBe(true)
  })

  test('draft + 프롬프트 표시 중 → 버튼 숨김', () => {
    expect(shouldShowGenerateImageButton('draft', true)).toBe(false)
  })

  test('approved → 버튼 숨김', () => {
    expect(shouldShowGenerateImageButton('approved', false)).toBe(false)
  })

  test('published → 버튼 숨김', () => {
    expect(shouldShowGenerateImageButton('published', false)).toBe(false)
  })
})

// ============================================================
// 16. HTTP 에러 코드 매핑
// ============================================================
describe('이미지 생성 HTTP 에러 코드', () => {
  function getExpectedErrorCode(scenario: string): { status: number; code: string } {
    switch (scenario) {
      case 'content_not_found':
        return { status: 404, code: 'SNS_001' }
      case 'not_owner':
        return { status: 403, code: 'AUTH_003' }
      case 'wrong_status':
        return { status: 400, code: 'SNS_002' }
      case 'image_gen_failed':
        return { status: 500, code: 'SNS_007' }
      default:
        return { status: 500, code: 'UNKNOWN' }
    }
  }

  test('콘텐츠 미발견 → 404 SNS_001', () => {
    expect(getExpectedErrorCode('content_not_found')).toEqual({ status: 404, code: 'SNS_001' })
  })

  test('소유자 아님 → 403 AUTH_003', () => {
    expect(getExpectedErrorCode('not_owner')).toEqual({ status: 403, code: 'AUTH_003' })
  })

  test('잘못된 상태 → 400 SNS_002', () => {
    expect(getExpectedErrorCode('wrong_status')).toEqual({ status: 400, code: 'SNS_002' })
  })

  test('이미지 생성 실패 → 500 SNS_007', () => {
    expect(getExpectedErrorCode('image_gen_failed')).toEqual({ status: 500, code: 'SNS_007' })
  })
})
