import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { RateLimitError } from '../lib/api'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (countdown > 0) return
    setError('')
    setLoading(true)

    try {
      const res = await api.post<{ data: { token: string; user: { id: string; name: string; role: 'admin' | 'user'; companyId: string } } }>(
        '/auth/login',
        { username, password },
      )
      login(res.data.token, res.data.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof RateLimitError) {
        setCountdown(err.retryAfter)
        setError(`로그인 시도가 너무 많습니다. ${err.retryAfter}초 후 다시 시도해주세요`)
      } else {
        setError(err instanceof Error ? err.message : '로그인 실패')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-50">CORTHEX</h1>
          <p className="mt-2 text-sm text-slate-500">로그인하여 워크스페이스에 접속하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-900 text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-md bg-slate-900 text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || countdown > 0}
            className="w-full py-2 px-4 bg-cyan-400 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-md text-sm font-medium transition-colors"
          >
            {countdown > 0
              ? `${countdown}초 후 재시도`
              : loading
                ? '로그인 중...'
                : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
