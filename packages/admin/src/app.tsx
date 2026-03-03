import { useState, useEffect } from 'react'

export function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">CORTHEX ADMIN</h1>
          <p className="text-zinc-500 dark:text-zinc-400">관리자 콘솔 — 세팅 완료</p>
          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {dark ? '☀️ 라이트' : '🌙 다크'}
          </button>
        </div>
      </div>
    </div>
  )
}
