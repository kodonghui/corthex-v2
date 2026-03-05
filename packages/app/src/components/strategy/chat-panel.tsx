import { EmptyState } from '@corthex/ui'

export function ChatPanel() {
  return (
    <div className="flex items-center justify-center h-full border-l border-zinc-200 dark:border-zinc-800">
      <EmptyState
        title="전략 에이전트와 대화하세요"
        description="투자 전략, 종목 분석, 시장 동향에 대해 질문해보세요"
      />
    </div>
  )
}
