import { useState, useEffect } from 'react'

export function App() {
  const [health, setHealth] = useState<string>('확인 중...')
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(d.data?.status === 'ok' ? 'OK' : '실패'))
      .catch(() => setHealth('서버 연결 안 됨'))
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">CORTHEX</h1>
          <p className="text-zinc-500 dark:text-zinc-400">v2 — 모노레포 세팅 완료</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">
              서버: <span className={health === 'OK' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{health}</span>
            </span>
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {dark ? '☀️ 라이트' : '🌙 다크'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
