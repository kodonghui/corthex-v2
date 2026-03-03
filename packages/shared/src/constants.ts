// === 에러 코드 표준 ===
export const ERROR_CODES = {
  // 인증
  AUTH_001: '로그인 실패',
  AUTH_002: '토큰 만료',
  AUTH_003: '권한 없음',
  // 테넌트
  TENANT_001: '격리 위반 시도',
  TENANT_002: '다른 회사 데이터 접근 차단',
  // 에이전트
  AGENT_001: 'CLI 연결 끊김',
  AGENT_002: '에이전트 실행 실패',
  AGENT_003: '에이전트 메모리 로드 실패',
  // 작업 큐
  QUEUE_001: '야간 작업 실패',
  QUEUE_002: '재시도 한도 초과',
} as const

export type ErrorCode = keyof typeof ERROR_CODES
