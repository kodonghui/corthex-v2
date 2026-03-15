export function Cta({ appUrl }: { appUrl: string }) {
  return (
    <section className="px-4 sm:px-10 lg:px-20 py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-white">
          지금 바로 AI 혁신을 시작하세요
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl">
          14일 무료 평가판으로 CORTHEX의 모든 엔터프라이즈 기능을 제한 없이 경험해보세요. 신용카드가 필요하지 않습니다.
        </p>
        <div className="mt-4">
          <a
            href={appUrl}
            className="inline-flex items-center justify-center rounded-lg h-16 px-10 bg-primary text-slate-900 text-lg font-bold tracking-wide hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          >
            무료 평가판 시작하기
          </a>
        </div>
      </div>
    </section>
  )
}
