import { getErrorMessage } from './error-messages'

const API_BASE = '/api'

export class RateLimitError extends Error {
  retryAfter: number
  constructor(retryAfter: number) {
    super('요청이 너무 많습니다')
    this.retryAfter = retryAfter
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('corthex_token')
  const isFormData = options?.body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('corthex_token')
    localStorage.removeItem('corthex_user')
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
    }
    throw new Error('인증이 만료되었습니다')
  }

  if (res.status === 429) {
    const err = await res.json().catch(() => ({ error: {} }))
    throw new RateLimitError(err.error?.retryAfter || 60)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Network error' } }))
    const code = err.error?.code as string | undefined
    const message = code ? getErrorMessage(code) : (err.error?.message || `HTTP ${res.status}`)
    throw new Error(message)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
}
