import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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
      const res = await api.post<{
        data: { token: string; user: { id: string; name: string; role: string } }
      }>('/auth/admin/login', { username, password })

      login(res.data.token, { ...res.data.user, role: res.data.user.role as 'admin' | 'user' })
      const redirect = searchParams.get('redirect') || '/'
      navigate(redirect)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'retryAfter' in err) {
        setCountdown((err as { retryAfter: number }).retryAfter)
        setError('')
      } else {
        setError(err instanceof Error ? err.message : '로그인 실패')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#556B2F] text-white text-lg font-bold mb-4">
              C
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">CORTHEX ADMIN</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">관리자 콘솔</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                아이디
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent transition"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:border-transparent transition"
                required
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {countdown > 0 && (
              <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  잠시 후 다시 시도하세요 ({countdown}초 후 잠금 해제)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || countdown > 0}
              className="w-full py-2.5 px-4 bg-[#556B2F] hover:bg-[#3E4E22] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              {loading ? '로그인 중...' : countdown > 0 ? `${countdown}초 후 재시도` : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
