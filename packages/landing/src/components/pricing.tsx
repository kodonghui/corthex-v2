const STATS = [
  { label: '서비스 가동률', value: '99.9%' },
  { label: '엔터프라이즈 고객 만족도', value: '4.9/5' },
  { label: '일일 처리 데이터량', value: '10TB+' },
]

export function Pricing() {
  return (
    <section id="pricing" className="px-4 sm:px-10 lg:px-20 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-4 p-8 rounded-xl bg-surface-alt border border-border-dark text-center"
            >
              <p className="text-slate-400 font-medium">{stat.label}</p>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
