import type { BudgetExceededModalData } from '../hooks/use-budget-alerts'

type Props = {
  data: BudgetExceededModalData
  onConfirm: () => void
}

export function BudgetExceededModal({ data, onConfirm }: Props) {
  const levelLabel = data.level === 'monthly' ? '월간' : '일일'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl border border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚨</span>
          <h2 className="text-lg font-bold text-red-600">
            {levelLabel} 예산 초과
          </h2>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">현재 비용</span>
            <span className="font-semibold text-red-600">
              ${data.currentSpendUsd.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">예산 한도</span>
            <span className="font-semibold">${data.budgetUsd.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mb-4">
          {levelLabel} 예산 초과로 AI 호출이 차단되었습니다.
          관리자에게 문의하여 예산을 조정하세요.
        </p>

        <button
          onClick={onConfirm}
          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  )
}
