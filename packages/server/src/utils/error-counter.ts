type ErrorEntry = { timestamp: number; message: string }

const errors: ErrorEntry[] = []
const MAX_ERRORS = 100
const MAX_MESSAGE_LENGTH = 500

export function recordError(message: string) {
  const truncated = message.length > MAX_MESSAGE_LENGTH ? message.slice(0, MAX_MESSAGE_LENGTH) + '...' : message
  errors.push({ timestamp: Date.now(), message: truncated })
  if (errors.length > MAX_ERRORS) errors.shift()
}

export function getRecentErrors(limit = 5): ErrorEntry[] {
  return errors.slice(-limit).reverse()
}

export function getErrorCount24h(): number {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  // 조회 시 오래된 항목 정리 (메모리 관리)
  while (errors.length > 0 && errors[0].timestamp < cutoff) errors.shift()
  return errors.length
}

/** 테스트용: 에러 목록 초기화 */
export function _resetErrors() {
  errors.length = 0
}
