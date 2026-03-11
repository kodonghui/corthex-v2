/**
 * Story 6.3: 에러 코드 → 한국어 메시지 매핑 (S10, D3)
 *
 * 서버 error-codes.ts의 모든 코드에 대한 1:1 한국어 변환.
 * api.ts와 SSE hook 모두에서 이 파일을 단일 소스로 사용.
 */

/** 에러 코드 → 한국어 사용자 메시지 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth 관련
  AUTH_INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다',
  AUTH_TOKEN_EXPIRED: '로그인이 만료되었습니다. 다시 로그인해주세요',
  AUTH_FORBIDDEN: '접근 권한이 없습니다',

  // Legacy numeric codes (api.ts 호환)
  AUTH_001: '아이디 또는 비밀번호가 올바르지 않습니다',
  AUTH_002: '로그인이 만료되었습니다. 다시 로그인해주세요',
  AUTH_004: '로그인 시도가 너무 많습니다',
  USER_001: '직원을 찾을 수 없습니다',
  TENANT_001: '접근 권한이 없습니다',

  // Agent 관련
  AGENT_NOT_FOUND: '에이전트를 찾을 수 없습니다',
  AGENT_001: '에이전트를 찾을 수 없습니다',
  AGENT_SPAWN_FAILED: '에이전트 실행에 실패했습니다. 잠시 후 다시 시도해주세요',
  AGENT_TIMEOUT: '에이전트 응답 시간이 초과되었습니다',

  // Rate limit
  RATE_LIMIT_EXCEEDED: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  RATE_001: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',

  // Session
  SESSION_LIMIT_EXCEEDED: '동시 세션 수가 제한을 초과했습니다',

  // Handoff 관련
  HANDOFF_DEPTH_EXCEEDED: '위임 깊이 제한을 초과했습니다',
  HANDOFF_CIRCULAR: '순환 위임이 감지되었습니다',
  HANDOFF_TARGET_NOT_FOUND: '위임 대상 에이전트를 찾을 수 없습니다',

  // Tool
  TOOL_PERMISSION_DENIED: '도구 사용 권한이 없습니다',

  // Hook / Pipeline
  HOOK_PIPELINE_ERROR: '처리 파이프라인에서 오류가 발생했습니다',

  // Server
  SERVER_SHUTTING_DOWN: '서버가 점검 중입니다. 잠시 후 다시 시도해주세요',

  // Org
  ORG_SECRETARY_DELETE_DENIED: '비서실장은 삭제할 수 없습니다',
}

/**
 * 에러 코드를 한국어 메시지로 변환.
 * 미등록 코드 fallback: "오류가 발생했습니다 (코드: {code})" (P11)
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || `오류가 발생했습니다 (코드: ${code})`
}

/**
 * 핸드오프 에러 코드에 대한 상세 메시지 생성.
 * agentName, depth 등 컨텍스트 정보를 포함.
 */
export function getHandoffErrorMessage(
  code: string,
  context?: { agentName?: string; depth?: number }
): string {
  switch (code) {
    case 'HANDOFF_DEPTH_EXCEEDED':
      return context?.depth
        ? `위임 깊이 제한(${context.depth}단계)을 초과했습니다`
        : '위임 깊이 제한을 초과했습니다'

    case 'HANDOFF_CIRCULAR':
      return context?.agentName
        ? `순환 위임이 감지되었습니다 (${context.agentName})`
        : '순환 위임이 감지되었습니다'

    case 'HANDOFF_TARGET_NOT_FOUND':
      return context?.agentName
        ? `위임 대상 에이전트(${context.agentName})를 찾을 수 없습니다`
        : '위임 대상 에이전트를 찾을 수 없습니다'

    default:
      return getErrorMessage(code)
  }
}

/** 에러 코드가 핸드오프 관련인지 확인 */
export function isHandoffError(code: string): boolean {
  return code.startsWith('HANDOFF_')
}

export { ERROR_MESSAGES }
