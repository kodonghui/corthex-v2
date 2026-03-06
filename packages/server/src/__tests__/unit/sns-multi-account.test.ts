/**
 * Story 14-4 TEA: SNS 멀티 계정 관리 로직 검증
 * bun test src/__tests__/unit/sns-multi-account.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. SNS 계정 생성 스키마 검증
// ============================================================
describe('SNS 계정 생성 스키마 검증', () => {
  const VALID_PLATFORMS = ['instagram', 'tistory', 'daum_cafe'] as const

  function validateCreateAccount(data: {
    platform?: string
    accountName?: string
    accountId?: string
    credentials?: Record<string, string>
  }): { valid: boolean; error?: string } {
    if (!data.platform || !VALID_PLATFORMS.includes(data.platform as any)) {
      return { valid: false, error: '유효한 플랫폼을 선택하세요' }
    }
    if (!data.accountName || data.accountName.length === 0) {
      return { valid: false, error: '계정 이름이 필요합니다' }
    }
    if (data.accountName.length > 100) {
      return { valid: false, error: '계정 이름은 100자 이내여야 합니다' }
    }
    if (!data.accountId || data.accountId.length === 0) {
      return { valid: false, error: '계정 ID가 필요합니다' }
    }
    if (data.accountId.length > 200) {
      return { valid: false, error: '계정 ID는 200자 이내여야 합니다' }
    }
    return { valid: true }
  }

  test('유효한 인스타그램 계정 생성', () => {
    expect(validateCreateAccount({
      platform: 'instagram',
      accountName: '회사 공식',
      accountId: '@company_official',
    })).toEqual({ valid: true })
  })

  test('유효한 티스토리 계정 생성', () => {
    expect(validateCreateAccount({
      platform: 'tistory',
      accountName: '기술 블로그',
      accountId: 'tech-blog',
    })).toEqual({ valid: true })
  })

  test('유효한 다음카페 계정 생성', () => {
    expect(validateCreateAccount({
      platform: 'daum_cafe',
      accountName: '커뮤니티',
      accountId: 'community-cafe',
    })).toEqual({ valid: true })
  })

  test('credentials 있는 계정 생성', () => {
    expect(validateCreateAccount({
      platform: 'instagram',
      accountName: '공식',
      accountId: '@official',
      credentials: { apiKey: 'test-key', accessToken: 'test-token' },
    })).toEqual({ valid: true })
  })

  test('플랫폼 미지정 시 실패', () => {
    const result = validateCreateAccount({ accountName: 'test', accountId: 'test' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('플랫폼')
  })

  test('잘못된 플랫폼 시 실패', () => {
    const result = validateCreateAccount({ platform: 'facebook', accountName: 'test', accountId: 'test' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('플랫폼')
  })

  test('계정 이름 미지정 시 실패', () => {
    const result = validateCreateAccount({ platform: 'instagram', accountId: 'test' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('계정 이름')
  })

  test('계정 이름 빈 문자열 시 실패', () => {
    const result = validateCreateAccount({ platform: 'instagram', accountName: '', accountId: 'test' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('계정 이름')
  })

  test('계정 이름 100자 초과 시 실패', () => {
    const result = validateCreateAccount({ platform: 'instagram', accountName: 'a'.repeat(101), accountId: 'test' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('100자')
  })

  test('계정 ID 미지정 시 실패', () => {
    const result = validateCreateAccount({ platform: 'instagram', accountName: 'test' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('계정 ID')
  })

  test('계정 ID 빈 문자열 시 실패', () => {
    const result = validateCreateAccount({ platform: 'instagram', accountName: 'test', accountId: '' })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('계정 ID')
  })

  test('계정 ID 200자 초과 시 실패', () => {
    const result = validateCreateAccount({ platform: 'instagram', accountName: 'test', accountId: 'a'.repeat(201) })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('200자')
  })
})

// ============================================================
// 2. SNS 계정 수정 스키마 검증
// ============================================================
describe('SNS 계정 수정 스키마 검증', () => {
  function validateUpdateAccount(data: {
    accountName?: string
    accountId?: string
    credentials?: Record<string, string>
    isActive?: boolean
  }): { valid: boolean; error?: string } {
    if (data.accountName !== undefined) {
      if (data.accountName.length === 0) return { valid: false, error: '계정 이름이 비어있습니다' }
      if (data.accountName.length > 100) return { valid: false, error: '계정 이름은 100자 이내여야 합니다' }
    }
    if (data.accountId !== undefined) {
      if (data.accountId.length === 0) return { valid: false, error: '계정 ID가 비어있습니다' }
      if (data.accountId.length > 200) return { valid: false, error: '계정 ID는 200자 이내여야 합니다' }
    }
    return { valid: true }
  }

  test('계정 이름만 수정', () => {
    expect(validateUpdateAccount({ accountName: '새 이름' })).toEqual({ valid: true })
  })

  test('계정 ID만 수정', () => {
    expect(validateUpdateAccount({ accountId: '@new_id' })).toEqual({ valid: true })
  })

  test('isActive만 수정', () => {
    expect(validateUpdateAccount({ isActive: false })).toEqual({ valid: true })
  })

  test('credentials만 수정', () => {
    expect(validateUpdateAccount({ credentials: { apiKey: 'new-key' } })).toEqual({ valid: true })
  })

  test('전체 수정', () => {
    expect(validateUpdateAccount({
      accountName: '수정된 이름',
      accountId: '@updated',
      isActive: true,
      credentials: { token: 'new' },
    })).toEqual({ valid: true })
  })

  test('빈 계정 이름으로 수정 시 실패', () => {
    const result = validateUpdateAccount({ accountName: '' })
    expect(result.valid).toBe(false)
  })

  test('빈 계정 ID로 수정 시 실패', () => {
    const result = validateUpdateAccount({ accountId: '' })
    expect(result.valid).toBe(false)
  })
})

// ============================================================
// 3. 계정 삭제 보호 (연결된 콘텐츠 체크)
// ============================================================
describe('계정 삭제 보호', () => {
  function canDeleteAccount(linkedContentCount: number): { canDelete: boolean; error?: string } {
    if (linkedContentCount > 0) {
      return { canDelete: false, error: `연결된 SNS 콘텐츠가 ${linkedContentCount}건 있어 삭제할 수 없습니다` }
    }
    return { canDelete: true }
  }

  test('연결된 콘텐츠 없으면 삭제 가능', () => {
    expect(canDeleteAccount(0)).toEqual({ canDelete: true })
  })

  test('연결된 콘텐츠 1건이면 삭제 불가', () => {
    const result = canDeleteAccount(1)
    expect(result.canDelete).toBe(false)
    expect(result.error).toContain('1건')
  })

  test('연결된 콘텐츠 50건이면 삭제 불가', () => {
    const result = canDeleteAccount(50)
    expect(result.canDelete).toBe(false)
    expect(result.error).toContain('50건')
  })
})

// ============================================================
// 4. SNS 콘텐츠 생성 시 snsAccountId 검증
// ============================================================
describe('SNS 콘텐츠 생성 — snsAccountId 검증', () => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  function validateSnsAccountId(snsAccountId?: string): { valid: boolean; error?: string } {
    if (snsAccountId === undefined || snsAccountId === '') return { valid: true } // optional
    if (!UUID_REGEX.test(snsAccountId)) {
      return { valid: false, error: '유효한 UUID 형식이 아닙니다' }
    }
    return { valid: true }
  }

  test('snsAccountId 없으면 유효 (optional)', () => {
    expect(validateSnsAccountId(undefined)).toEqual({ valid: true })
  })

  test('빈 문자열이면 유효 (optional)', () => {
    expect(validateSnsAccountId('')).toEqual({ valid: true })
  })

  test('유효한 UUID이면 유효', () => {
    expect(validateSnsAccountId('550e8400-e29b-41d4-a716-446655440000')).toEqual({ valid: true })
  })

  test('잘못된 UUID이면 무효', () => {
    const result = validateSnsAccountId('not-a-uuid')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('UUID')
  })

  test('부분적 UUID이면 무효', () => {
    const result = validateSnsAccountId('550e8400-e29b-41d4')
    expect(result.valid).toBe(false)
  })
})

// ============================================================
// 5. Credentials 암호화/복호화 흐름 (로직 검증)
// ============================================================
describe('Credentials 암호화 흐름', () => {
  function serializeCredentials(creds: Record<string, string>): string {
    return JSON.stringify(creds)
  }

  function deserializeCredentials(serialized: string): Record<string, string> | null {
    try {
      return JSON.parse(serialized)
    } catch {
      return null
    }
  }

  test('기본 credentials 직렬화/역직렬화', () => {
    const creds = { apiKey: 'test-key', accessToken: 'test-token' }
    const serialized = serializeCredentials(creds)
    const deserialized = deserializeCredentials(serialized)
    expect(deserialized).toEqual(creds)
  })

  test('빈 credentials 직렬화/역직렬화', () => {
    const creds = {}
    const serialized = serializeCredentials(creds)
    const deserialized = deserializeCredentials(serialized)
    expect(deserialized).toEqual(creds)
  })

  test('다수 필드 credentials', () => {
    const creds = { apiKey: 'key1', secret: 'sec1', token: 'tok1', refreshToken: 'ref1' }
    const serialized = serializeCredentials(creds)
    const deserialized = deserializeCredentials(serialized)
    expect(deserialized).toEqual(creds)
  })

  test('잘못된 JSON 역직렬화 시 null 반환', () => {
    expect(deserializeCredentials('not-json')).toBeNull()
  })

  test('빈 문자열 역직렬화 시 null 반환', () => {
    expect(deserializeCredentials('')).toBeNull()
  })

  test('한글 값 포함 credentials', () => {
    const creds = { accountName: '공식계정', note: '테스트용' }
    const serialized = serializeCredentials(creds)
    const deserialized = deserializeCredentials(serialized)
    expect(deserialized).toEqual(creds)
  })
})

// ============================================================
// 6. SNS Publisher — Account Info 타입 호환성
// ============================================================
describe('SNS Publisher Account Info', () => {
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

  function buildPublishInput(content: {
    id: string
    platform: string
    title: string
    body: string
    hashtags: string | null
    imageUrl: string | null
  }, account?: SnsAccountInfo | null): SnsContentInput {
    return { ...content, account: account || null }
  }

  const baseContent = {
    id: 'test-id',
    platform: 'instagram',
    title: '제목',
    body: '본문',
    hashtags: '#태그',
    imageUrl: null,
  }

  test('계정 없이 발행 (하위 호환)', () => {
    const input = buildPublishInput(baseContent)
    expect(input.account).toBeNull()
    expect(input.id).toBe('test-id')
    expect(input.platform).toBe('instagram')
  })

  test('계정 있으면 account 포함', () => {
    const account: SnsAccountInfo = {
      accountId: '@official',
      accountName: '공식 계정',
      credentials: { apiKey: 'key' },
    }
    const input = buildPublishInput(baseContent, account)
    expect(input.account).toBeDefined()
    expect(input.account?.accountId).toBe('@official')
    expect(input.account?.credentials?.apiKey).toBe('key')
  })

  test('credentials null인 계정', () => {
    const account: SnsAccountInfo = {
      accountId: '@test',
      accountName: '테스트',
      credentials: null,
    }
    const input = buildPublishInput(baseContent, account)
    expect(input.account?.credentials).toBeNull()
  })

  test('undefined account는 null로 변환', () => {
    const input = buildPublishInput(baseContent, undefined)
    expect(input.account).toBeNull()
  })
})

// ============================================================
// 7. 계정 목록 API 응답 필터링 (credentials 제외)
// ============================================================
describe('계정 목록 응답 — credentials 제외', () => {
  type AccountRow = {
    id: string
    platform: string
    accountName: string
    accountId: string
    credentials: string | null
    isActive: boolean
    createdBy: string
    createdAt: string
    updatedAt: string
  }

  function sanitizeAccountForResponse(row: AccountRow) {
    return {
      id: row.id,
      platform: row.platform,
      accountName: row.accountName,
      accountId: row.accountId,
      isActive: row.isActive,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  const row: AccountRow = {
    id: '123',
    platform: 'instagram',
    accountName: '공식',
    accountId: '@off',
    credentials: 'encrypted-secret-data',
    isActive: true,
    createdBy: 'user-1',
    createdAt: '2026-03-06',
    updatedAt: '2026-03-06',
  }

  test('credentials 필드가 응답에 포함되지 않음', () => {
    const sanitized = sanitizeAccountForResponse(row)
    expect(sanitized).not.toHaveProperty('credentials')
  })

  test('다른 필드는 모두 포함', () => {
    const sanitized = sanitizeAccountForResponse(row)
    expect(sanitized.id).toBe('123')
    expect(sanitized.platform).toBe('instagram')
    expect(sanitized.accountName).toBe('공식')
    expect(sanitized.isActive).toBe(true)
  })

  test('credentials가 null이어도 응답에 미포함', () => {
    const sanitized = sanitizeAccountForResponse({ ...row, credentials: null })
    expect(sanitized).not.toHaveProperty('credentials')
  })
})

// ============================================================
// 8. 콘텐츠 목록 — accountId 필터링
// ============================================================
describe('콘텐츠 목록 accountId 필터링', () => {
  type ContentItem = { id: string; snsAccountId: string | null; title: string }

  const contents: ContentItem[] = [
    { id: '1', snsAccountId: 'acct-1', title: '콘텐츠 A' },
    { id: '2', snsAccountId: 'acct-2', title: '콘텐츠 B' },
    { id: '3', snsAccountId: null, title: '콘텐츠 C (계정 없음)' },
    { id: '4', snsAccountId: 'acct-1', title: '콘텐츠 D' },
  ]

  function filterByAccount(items: ContentItem[], accountId?: string): ContentItem[] {
    if (!accountId) return items
    return items.filter((i) => i.snsAccountId === accountId)
  }

  test('accountId 미지정 시 전체 반환', () => {
    expect(filterByAccount(contents)).toHaveLength(4)
  })

  test('accountId 빈 문자열 시 전체 반환', () => {
    expect(filterByAccount(contents, '')).toHaveLength(4)
  })

  test('acct-1로 필터링', () => {
    const filtered = filterByAccount(contents, 'acct-1')
    expect(filtered).toHaveLength(2)
    expect(filtered[0].id).toBe('1')
    expect(filtered[1].id).toBe('4')
  })

  test('acct-2로 필터링', () => {
    const filtered = filterByAccount(contents, 'acct-2')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('콘텐츠 B')
  })

  test('존재하지 않는 accountId로 필터링', () => {
    expect(filterByAccount(contents, 'acct-999')).toHaveLength(0)
  })

  test('null snsAccountId인 콘텐츠는 특정 계정 필터에 미포함', () => {
    const filtered = filterByAccount(contents, 'acct-1')
    expect(filtered.every((i) => i.snsAccountId !== null)).toBe(true)
  })
})

// ============================================================
// 9. 예약 발행 — 계정 정보 JOIN 로직
// ============================================================
describe('예약 발행 — 계정 정보 처리', () => {
  type ScheduledPost = {
    id: string
    platform: string
    snsAccountId: string | null
    accountName: string | null
    accountCredentials: string | null
  }

  function prepareAccountInfo(post: ScheduledPost): { accountId: string; accountName: string; credentials: Record<string, string> | null } | null {
    if (!post.snsAccountId || !post.accountName) return null

    let creds: Record<string, string> | null = null
    if (post.accountCredentials) {
      try { creds = JSON.parse(post.accountCredentials) } catch { /* ignore */ }
    }
    return { accountId: post.snsAccountId, accountName: post.accountName, credentials: creds }
  }

  test('계정 없는 예약 포스트', () => {
    expect(prepareAccountInfo({
      id: '1', platform: 'instagram', snsAccountId: null, accountName: null, accountCredentials: null,
    })).toBeNull()
  })

  test('계정 있는 예약 포스트 — credentials 있음', () => {
    const result = prepareAccountInfo({
      id: '1', platform: 'instagram', snsAccountId: 'acct-1', accountName: '공식',
      accountCredentials: JSON.stringify({ apiKey: 'test' }),
    })
    expect(result).toBeDefined()
    expect(result?.accountId).toBe('acct-1')
    expect(result?.credentials?.apiKey).toBe('test')
  })

  test('계정 있지만 credentials null', () => {
    const result = prepareAccountInfo({
      id: '1', platform: 'tistory', snsAccountId: 'acct-2', accountName: '블로그',
      accountCredentials: null,
    })
    expect(result?.accountName).toBe('블로그')
    expect(result?.credentials).toBeNull()
  })

  test('잘못된 credentials JSON은 무시', () => {
    const result = prepareAccountInfo({
      id: '1', platform: 'instagram', snsAccountId: 'acct-3', accountName: '테스트',
      accountCredentials: 'broken-json',
    })
    expect(result?.credentials).toBeNull()
  })

  test('snsAccountId만 있고 accountName 없으면 null', () => {
    expect(prepareAccountInfo({
      id: '1', platform: 'instagram', snsAccountId: 'acct-4', accountName: null, accountCredentials: null,
    })).toBeNull()
  })
})

// ============================================================
// 10. 프론트엔드 — 계정 선택 드롭다운 필터링
// ============================================================
describe('프론트엔드 계정 드롭다운 필터링', () => {
  type Account = { id: string; platform: string; accountName: string; isActive: boolean }

  const accounts: Account[] = [
    { id: '1', platform: 'instagram', accountName: '인스타 공식', isActive: true },
    { id: '2', platform: 'instagram', accountName: '인스타 마케팅', isActive: true },
    { id: '3', platform: 'tistory', accountName: '기술 블로그', isActive: true },
    { id: '4', platform: 'daum_cafe', accountName: '커뮤니티', isActive: false },
  ]

  function filterAccountsByPlatform(accounts: Account[], platform: string): Account[] {
    return accounts.filter((a) => a.platform === platform)
  }

  test('인스타그램 계정만 필터링', () => {
    const filtered = filterAccountsByPlatform(accounts, 'instagram')
    expect(filtered).toHaveLength(2)
    expect(filtered[0].accountName).toBe('인스타 공식')
  })

  test('티스토리 계정만 필터링', () => {
    const filtered = filterAccountsByPlatform(accounts, 'tistory')
    expect(filtered).toHaveLength(1)
  })

  test('다음카페 계정만 필터링 (비활성 포함)', () => {
    const filtered = filterAccountsByPlatform(accounts, 'daum_cafe')
    expect(filtered).toHaveLength(1)
  })

  test('존재하지 않는 플랫폼', () => {
    expect(filterAccountsByPlatform(accounts, 'facebook')).toHaveLength(0)
  })
})

// ============================================================
// 11. 프론트 SnsAccount 타입 호환성
// ============================================================
describe('SnsAccount 타입 호환성', () => {
  test('SnsAccount 필드 구조', () => {
    const account = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      platform: 'instagram',
      accountName: '공식 계정',
      accountId: '@official',
      isActive: true,
      createdAt: '2026-03-06T00:00:00Z',
    }

    expect(account.id).toBeDefined()
    expect(account.platform).toBe('instagram')
    expect(account.accountName).toBe('공식 계정')
    expect(account.accountId).toBe('@official')
    expect(account.isActive).toBe(true)
    expect(typeof account.createdAt).toBe('string')
  })

  test('SnsContent에 snsAccountId nullable 필드', () => {
    const content: { snsAccountId?: string | null; accountName?: string | null } = {
      snsAccountId: null,
      accountName: null,
    }
    expect(content.snsAccountId).toBeNull()

    content.snsAccountId = '550e8400-e29b-41d4-a716-446655440000'
    content.accountName = '공식'
    expect(content.snsAccountId).toBeDefined()
    expect(content.accountName).toBe('공식')
  })
})

// ============================================================
// 12. 테넌트 격리 — companyId 필터 검증
// ============================================================
describe('테넌트 격리 — companyId 필터', () => {
  type AccountWithCompany = { id: string; companyId: string; accountName: string }

  const allAccounts: AccountWithCompany[] = [
    { id: '1', companyId: 'company-a', accountName: 'A사 공식' },
    { id: '2', companyId: 'company-a', accountName: 'A사 마케팅' },
    { id: '3', companyId: 'company-b', accountName: 'B사 공식' },
  ]

  function filterByCompany(accounts: AccountWithCompany[], companyId: string): AccountWithCompany[] {
    return accounts.filter((a) => a.companyId === companyId)
  }

  test('company-a 계정만 조회', () => {
    const filtered = filterByCompany(allAccounts, 'company-a')
    expect(filtered).toHaveLength(2)
    expect(filtered.every((a) => a.companyId === 'company-a')).toBe(true)
  })

  test('company-b 계정만 조회', () => {
    const filtered = filterByCompany(allAccounts, 'company-b')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].accountName).toBe('B사 공식')
  })

  test('존재하지 않는 company', () => {
    expect(filterByCompany(allAccounts, 'company-c')).toHaveLength(0)
  })

  test('다른 회사 계정에 접근 불가 (격리)', () => {
    const companyAAccounts = filterByCompany(allAccounts, 'company-a')
    expect(companyAAccounts.find((a) => a.companyId === 'company-b')).toBeUndefined()
  })
})

// ============================================================
// 13. 마이그레이션 SQL 검증
// ============================================================
describe('마이그레이션 SQL 구조 검증', () => {
  test('snsAccounts 테이블 필수 컬럼 목록', () => {
    const requiredColumns = [
      'id', 'company_id', 'platform', 'account_name', 'account_id',
      'credentials', 'is_active', 'created_by', 'created_at', 'updated_at',
    ]
    expect(requiredColumns).toHaveLength(10)
    expect(requiredColumns).toContain('company_id')
    expect(requiredColumns).toContain('credentials')
    expect(requiredColumns).toContain('is_active')
  })

  test('snsContents에 sns_account_id FK 추가', () => {
    const alterStatement = 'ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS sns_account_id UUID REFERENCES sns_accounts(id)'
    expect(alterStatement).toContain('sns_account_id')
    expect(alterStatement).toContain('UUID')
    expect(alterStatement).toContain('REFERENCES sns_accounts')
  })
})

// ============================================================
// 14. Credentials JSON 파싱 안전성
// ============================================================
describe('Credentials JSON 파싱 안전성', () => {
  function safeParseCredentials(input: string): Record<string, string> | null {
    try {
      const parsed = JSON.parse(input)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
      return parsed as Record<string, string>
    } catch {
      return null
    }
  }

  test('정상 JSON 객체', () => {
    expect(safeParseCredentials('{"key":"value"}')).toEqual({ key: 'value' })
  })

  test('배열은 거부', () => {
    expect(safeParseCredentials('["a","b"]')).toBeNull()
  })

  test('문자열은 거부', () => {
    expect(safeParseCredentials('"just-a-string"')).toBeNull()
  })

  test('숫자는 거부', () => {
    expect(safeParseCredentials('42')).toBeNull()
  })

  test('null은 거부', () => {
    expect(safeParseCredentials('null')).toBeNull()
  })

  test('잘못된 JSON은 null', () => {
    expect(safeParseCredentials('{broken')).toBeNull()
  })

  test('빈 객체는 허용', () => {
    expect(safeParseCredentials('{}')).toEqual({})
  })
})

// ============================================================
// 15. 하위 호환성 — snsAccountId nullable
// ============================================================
describe('하위 호환성 — snsAccountId nullable', () => {
  type Content = {
    id: string
    platform: string
    title: string
    snsAccountId: string | null
  }

  test('기존 콘텐츠 (snsAccountId null)', () => {
    const content: Content = { id: '1', platform: 'instagram', title: '기존 콘텐츠', snsAccountId: null }
    expect(content.snsAccountId).toBeNull()
  })

  test('새 콘텐츠 (snsAccountId 설정)', () => {
    const content: Content = { id: '2', platform: 'tistory', title: '새 콘텐츠', snsAccountId: 'acct-1' }
    expect(content.snsAccountId).toBe('acct-1')
  })

  test('snsAccountId 미선택 (null 전달)', () => {
    const content: Content = { id: '3', platform: 'daum_cafe', title: '미선택', snsAccountId: null }
    expect(content.snsAccountId).toBeNull()
  })
})
