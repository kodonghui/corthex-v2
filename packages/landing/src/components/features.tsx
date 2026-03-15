const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
        <circle cx="12" cy="3" r="1" />
        <circle cx="12" cy="21" r="1" />
        <circle cx="3" cy="12" r="1" />
        <circle cx="21" cy="12" r="1" />
      </svg>
    ),
    title: 'AI 허브',
    description:
      '분산된 모든 AI 모델, 프롬프트, 데이터셋을 중앙 집중식으로 관리하고 팀 전체와 안전하게 공유하세요.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M3 9h18" />
      </svg>
    ),
    title: '조직도 시각화',
    description:
      'AI 에이전트와 휴먼 작업자의 복잡한 상호작용 구조를 직관적인 노드 그래프로 한눈에 파악하고 재배치하세요.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: '자동화된 워크플로우',
    description:
      '반복적인 검증 작업과 배포 파이프라인을 자동화하여 팀이 더 창의적이고 중요한 문제에 집중하도록 지원하세요.',
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 sm:px-10 lg:px-20 py-24 bg-surface border-y border-border-dark">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        {/* Section header */}
        <div className="flex flex-col gap-4 items-center text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white">
            강력한 기능으로 완벽한 통제
          </h2>
          <p className="text-lg text-slate-400">
            CORTHEX가 제공하는 강력한 도구들로 AI 조직을 효율적으로 관리하고 확장하세요.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-6 p-8 rounded-xl border border-border-dark bg-surface-alt hover:border-primary/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                {feature.icon}
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
