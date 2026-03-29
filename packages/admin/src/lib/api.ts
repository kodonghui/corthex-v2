import { useAdminStore } from '../stores/admin-store'

const API_BASE = '/api'

/** Append ?companyId= to admin API paths if not already present.
 *  Admin JWT has companyId='system', so we inject the selected company from the store. */
function injectCompanyId(path: string): string {
  const companyId = useAdminStore.getState().selectedCompanyId
  if (!companyId) return path
  if (path.includes('companyId=')) return path  // already has it
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}companyId=${companyId}`
}

const errorMessages: Record<string, string> = {
  AUTH_001: '아이디 또는 비밀번호가 올바르지 않습니다',
  AUTH_002: '로그인이 만료되었습니다. 다시 로그인해주세요',
  AUTH_003: '관리자 권한이 필요합니다',
  AUTH_004: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요',
  USER_001: '직원을 찾을 수 없습니다',
  USER_002: '이미 존재하는 아이디입니다',
  COMPANY_001: '회사를 찾을 수 없습니다',
  DEPT_001: '부서를 찾을 수 없습니다',
  DEPT_DUPLICATE: '이미 존재하는 부서 이름입니다',
  CREDENTIAL_DUPLICATE_KEY: '이미 등록된 키입니다',
  CIRCULAR_REPORT: '순환 보고 라인이 감지되었습니다',
  TENANT_001: '접근 권한이 없습니다',
  RATE_001: 'API 요청 한도를 초과했습니다',
  ST_006: '이미 공개된 템플릿입니다',
  ST_007: '이미 비공개 상태입니다',
  CASCADE_003: 'mode는 force 또는 wait_completion만 가능합니다',
}

function friendlyMessage(raw: string): string {
  if (raw.includes('unique constraint')) {
    if (raw.includes('slug')) return '이미 사용 중인 슬러그입니다'
    if (raw.includes('name')) return '이미 사용 중인 이름입니다'
    return '이미 존재하는 데이터입니다'
  }
  if (raw.includes('foreign key constraint')) return '연관된 데이터가 있어 처리할 수 없습니다'
  if (raw.includes('violates check constraint')) return '입력값이 허용 범위를 벗어났습니다'
  return raw
}

class RateLimitError extends Error {
  retryAfter: number
  constructor(retryAfter: number) {
    super('요청이 너무 많습니다')
    this.retryAfter = retryAfter
  }
}

export class ApiError extends Error {
  code?: string
  data?: Record<string, unknown>
  constructor(message: string, code?: string, data?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.data = data
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('corthex_admin_token')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    const isLoginRequest = path.includes('/auth/admin/login')
    if (!isLoginRequest) {
      localStorage.removeItem('corthex_admin_token')
      localStorage.removeItem('corthex_admin_user')
      const currentPath = window.location.pathname.replace(/^\/admin/, '') || '/'
      window.location.href = `/admin/login?redirect=${encodeURIComponent(currentPath)}`
    }
    const body = await res.json().catch(() => ({ error: { message: '인증 실패' } }))
    throw new Error(body.error?.message || '아이디 또는 비밀번호가 올바르지 않습니다')
  }

  if (res.status === 429) {
    const err = await res.json().catch(() => ({ error: {} }))
    throw new RateLimitError(err.error?.retryAfter || 60)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Network error' } }))
    const code = err.error?.code as string | undefined
    const raw = err.error?.message || `HTTP ${res.status}`
    const message = (code && errorMessages[code]) || friendlyMessage(raw)
    throw new ApiError(message, code, err.data)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(injectCompanyId(path)),
  post: <T>(path: string, body: unknown) =>
    request<T>(injectCompanyId(path), { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(injectCompanyId(path), { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(injectCompanyId(path), { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(injectCompanyId(path), { method: 'DELETE' }),
}
