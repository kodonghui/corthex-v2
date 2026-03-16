import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { RateLimitError } from '../lib/api'
import { Mail, Lock, ArrowRight, Bot, Eye, EyeOff } from 'lucide-react'

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

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center relative overflow-hidden font-display">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-cyan-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[400px] p-8 bg-slate-900 border border-slate-800 rounded-[16px] shadow-2xl z-10 mx-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CORTHEX</h1>
          <p className="text-sm font-medium text-slate-400">AI 조직 관리 플랫폼</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="login-email">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                id="login-email"
                placeholder="이메일을 입력하세요"
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300" htmlFor="login-password">비밀번호</label>
              <button type="button" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                비밀번호를 잊으셨나요?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                className="w-full h-11 pl-10 pr-10 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                id="login-password"
                placeholder="비밀번호를 입력하세요"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            className="w-full h-11 mt-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            type="submit"
            disabled={loading || countdown > 0}
          >
            <span>
              {countdown > 0
                ? `${countdown}초 후 재시도`
                : loading
                  ? '로그인 중...'
                  : '로그인'}
            </span>
            {!loading && countdown <= 0 && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-slate-800" />
          <span className="px-3 text-xs font-medium text-slate-400">또는</span>
          <div className="flex-grow h-px bg-slate-800" />
        </div>

        {/* OAuth */}
        <button
          className="w-full h-11 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-3"
          type="button"
        >
          <Bot className="w-5 h-5 text-[#D97757]" />
          <span>Claude로 로그인</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          계속 진행함으로써 CORTHEX의{' '}
          <a className="text-slate-300 hover:text-cyan-400 transition-colors underline decoration-slate-700 underline-offset-2" href="#">이용약관</a>
          {' '}및{' '}
          <a className="text-slate-300 hover:text-cyan-400 transition-colors underline decoration-slate-700 underline-offset-2" href="#">개인정보처리방침</a>
          에 동의합니다.
        </p>
      </div>
    </div>
  )
}
