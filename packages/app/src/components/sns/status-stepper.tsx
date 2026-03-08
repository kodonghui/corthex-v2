const STEPS = [
  { key: 'draft', label: '초안' },
  { key: 'pending', label: '승인 대기' },
  { key: 'approved', label: '승인됨' },
  { key: 'scheduled', label: '예약됨' },
  { key: 'published', label: '발행 완료' },
] as const

const STEP_INDEX: Record<string, number> = {
  draft: 0,
  pending: 1,
  approved: 2,
  scheduled: 3,
  published: 4,
  rejected: 1,
  failed: 4,
}

interface StatusStepperProps {
  status: string
  createdAt?: string
  reviewedAt?: string
  scheduledAt?: string | null
  publishedAt?: string | null
}

function fmtDate(iso?: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString('ko', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function StatusStepper({ status, createdAt, reviewedAt, scheduledAt, publishedAt }: StatusStepperProps) {
  const currentIdx = STEP_INDEX[status] ?? 0
  const isFailed = status === 'failed'
  const isRejected = status === 'rejected'

  const timestamps: Record<number, string | null> = {
    0: fmtDate(createdAt),
    1: isRejected || currentIdx >= 1 ? fmtDate(reviewedAt) : null,
    2: currentIdx >= 2 ? fmtDate(reviewedAt) : null,
    3: currentIdx >= 3 ? fmtDate(scheduledAt) : null,
    4: currentIdx >= 4 ? fmtDate(publishedAt) : null,
  }

  return (
    <div className="w-full py-3">
      {(isRejected || isFailed) && (
        <div className="mb-2 px-2 py-1.5 rounded bg-red-50 dark:bg-red-900/30 text-xs text-red-700 dark:text-red-300">
          {isRejected ? '반려됨' : '발행 실패'}
        </div>
      )}
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx || (idx === currentIdx && status === 'published')
          const active = idx === currentIdx && !done
          const failedStep = (isFailed && idx === 4) || (isRejected && idx === 1)

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-[56px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    failedStep
                      ? 'border-red-500 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : done
                        ? 'border-green-500 bg-green-500 text-white'
                        : active
                          ? 'border-indigo-500 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                          : 'border-zinc-300 dark:border-zinc-600 text-zinc-400'
                  }`}
                >
                  {failedStep ? '!' : done ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] mt-1 whitespace-nowrap ${
                  failedStep ? 'text-red-600 font-medium' : done || active ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400'
                }`}>
                  {step.label}
                </span>
                {timestamps[idx] && (
                  <span className="text-[9px] text-zinc-400 mt-0.5">{timestamps[idx]}</span>
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${idx < currentIdx ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
