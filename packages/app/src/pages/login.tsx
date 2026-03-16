import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { RateLimitError } from '../lib/api'

/* API: POST /api/auth/login */

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#faf8f5', fontFamily: "'Pretendard', sans-serif" }}>
      {/* API: POST /api/auth/login */}
      <main className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4"
            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
          >
            <span className="text-2xl font-bold" style={{ color: '#5a7247', fontFamily: "'Noto Serif KR', serif" }}>C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>CORTHEX v2</h1>
          <p className="text-gray-500 mt-2">자연스러운 연결의 시작</p>
        </header>

        {/* Login Form Card */}
        <section
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="username">사용자 아이디</label>
              <input
                className="w-full px-4 py-3 rounded-xl border-gray-200 transition-colors duration-200"
                id="username"
                placeholder="아이디를 입력하세요"
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">비밀번호</label>
              <input
                className="w-full px-4 py-3 rounded-xl border-gray-200 transition-colors duration-200"
                id="password"
                placeholder="비밀번호를 입력하세요"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(196, 98, 45, 0.05)', border: '1px solid rgba(196, 98, 45, 0.2)', color: '#c4622d' }}>
                <p>{error}</p>
              </div>
            )}

            {/* Login Button */}
            <div className="pt-2">
              <button
                className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-md disabled:opacity-50"
                type="submit"
                disabled={loading || countdown > 0}
                style={{ backgroundColor: '#5a7247' }}
              >
                {countdown > 0
                  ? `${countdown}초 후 재시도`
                  : loading
                    ? '로그인 중...'
                    : '로그인'}
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input className="rounded border-gray-300" type="checkbox" style={{ color: '#5a7247' }} />
                <span>아이디 저장</span>
              </label>
              <div className="space-x-3">
                <a className="hover:text-gray-700 transition-colors" href="#">아이디 찾기</a>
                <span className="text-gray-300">|</span>
                <a className="hover:text-gray-700 transition-colors" href="#">비밀번호 찾기</a>
              </div>
            </div>
          </form>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-400">
          <p>© 2026 CORTHEX. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a className="hover:underline" href="#">개인정보처리방침</a>
            <a className="hover:underline" href="#">이용약관</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
