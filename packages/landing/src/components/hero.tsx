export function Hero({ appUrl }: { appUrl: string }) {
  return (
    <section className="relative px-4 sm:px-10 lg:px-20 py-20 lg:py-32 flex flex-col items-center justify-center min-h-[70vh]">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Corthex 2.0 출시
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tighter text-white">
          당신의 AI 조직을
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            지휘하세요
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
          CORTHEX AI 관리 플랫폼으로 팀의 생산성을 극대화하고,
          <br className="hidden sm:block" />
          모든 AI 자산을 완벽하게 통제하세요.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <a
            href={appUrl}
            className="flex items-center justify-center rounded-lg h-14 px-8 bg-primary text-slate-900 text-base font-bold tracking-wide hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] w-full sm:w-auto"
          >
            무료로 시작하기
          </a>
          <a
            href="#features"
            className="flex items-center justify-center rounded-lg h-14 px-8 bg-transparent border-2 border-border-dark text-white text-base font-bold tracking-wide hover:bg-surface-alt transition-colors w-full sm:w-auto"
          >
            자세히 알아보기
          </a>
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="mt-20 w-full max-w-6xl relative z-10 rounded-xl overflow-hidden shadow-2xl border border-border-dark bg-surface-alt h-[300px] sm:h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50" />
        <div className="text-slate-500 font-mono text-sm opacity-50 flex flex-col items-center gap-4">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          CORTHEX Dashboard
        </div>
      </div>
    </section>
  )
}
