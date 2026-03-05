import { describe, expect, test } from 'bun:test'
import { ERROR_CODES } from '@corthex/shared'

describe('Error Codes', () => {
  test('TRADE 에러 코드가 정의되어야 한다', () => {
    expect(ERROR_CODES.TRADE_001).toBe('자동매매 한도 초과')
    expect(ERROR_CODES.TRADE_002).toBe('모의/실투자 모드 불일치')
  })

  test('TOOL 에러 코드가 정의되어야 한다', () => {
    expect(ERROR_CODES.TOOL_001).toBe('API key 없음 또는 조회 실패')
    expect(ERROR_CODES.TOOL_002).toBe('도구 실행 타임아웃')
  })

  test('AUTH_004 rate limit 에러 코드가 정의되어야 한다', () => {
    expect(ERROR_CODES.AUTH_004).toBeDefined()
  })

  test('RATE_001 에러 코드가 정의되어야 한다', () => {
    expect(ERROR_CODES.RATE_001).toBe('API 요청 한도 초과')
  })

  test('기존 에러 코드가 유지되어야 한다', () => {
    expect(ERROR_CODES.AUTH_001).toBe('로그인 실패')
    expect(ERROR_CODES.AUTH_002).toBe('토큰 만료')
    expect(ERROR_CODES.AUTH_003).toBe('권한 없음')
    expect(ERROR_CODES.TENANT_001).toBe('격리 위반 시도')
    expect(ERROR_CODES.AGENT_001).toBe('CLI 연결 끊김')
  })
})
