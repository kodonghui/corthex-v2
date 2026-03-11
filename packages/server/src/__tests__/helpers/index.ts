/**
 * 테스트 헬퍼 배럴 내보내기
 *
 * 기존 test-utils.ts + 신규 모킹 헬퍼 통합 re-export
 */

// 기존 API 테스트 헬퍼 (수정 금지)
export {
  BASE,
  JWT_SECRET,
  REAL_COMPANY_ID,
  REAL_CEO_ID,
  REAL_ADMIN_ID,
  REAL_AGENT_ID,
  FAKE_COMPANY_ID,
  FAKE_USER_ID,
  makeToken,
  makeExpiredToken,
  api,
  apiNoAuth,
  createTestTokens,
} from './test-utils'

// SDK 모킹 헬퍼 (Story 12.1, Architecture E9)
export {
  mockSDK,
  mockSDKSequential,
  createMockSessionContext,
  type MockSDKOptions,
  type MockToolCall,
} from './sdk-mock'

// DB 모킹 헬퍼 (Architecture D1, E3)
export {
  mockGetDB,
  type MockDBData,
  type MockGetDBOptions,
} from './db-mock'

// 도구 실행 모킹 헬퍼
export {
  mockToolPermission,
  mockToolPermissionMap,
  createMockToolResult,
  createMockTool,
  mockCredentialScrubber,
  mockCostTracker,
  type MockToolConfig,
} from './tool-mock'
