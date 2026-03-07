import { useQuery } from '@tanstack/react-query'
import { Modal, Badge, Spinner } from '@corthex/ui'
import { MarkdownRenderer } from '../markdown-renderer'
import { api } from '../../lib/api'
import { ReportView } from './report-view'
import type { ReportViewProps } from './report-view'

// === Types ===

type DelegationChainItem = {
  taskId: string
  agentId: string
  agentName: string
  agentTier: string
  taskType: string
  status: string
  parentTaskId: string | null
  startedAt: string | null
  completedAt: string | null
  durationMs: number | null
}

type QualityReviewItem = {
  id: string
  conclusion: string
  scores: Record<string, number>
  feedback: string | null
  attemptNumber: number
  createdAt: string
}

type DelegationResponse = {
  success: boolean
  data: {
    chain: DelegationChainItem[]
    qualityReviews: QualityReviewItem[]
  }
}

type CostResponse = {
  success: boolean
  data: {
    inputTokens: number
    outputTokens: number
    totalCostUsd: number
  }
}

// === Helpers ===

function formatDuration(ms: number | null): string {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}초`
}

const TASK_TYPE_LABELS: Record<string, string> = {
  classify: '분류',
  delegate: '위임',
  execute: '실행',
  synthesize: '종합',
  review: '검수',
}

const TIER_LABELS: Record<string, string> = {
  secretary: '비서실장',
  manager: '부서장',
  specialist: '전문가',
  worker: '실무자',
}

const SCORE_LABELS: Record<string, string> = {
  conclusionClarity: '결론 명확도',
  evidenceSufficiency: '근거 충분도',
  riskMention: '리스크 언급',
  formatAdequacy: '형식 적합도',
  logicalConsistency: '논리 일관성',
}

// === Delegation Chain Visualization ===

function DelegationChain({ chain }: { chain: DelegationChainItem[] }) {
  if (chain.length === 0) return <p className="text-sm text-zinc-400">위임 데이터가 없습니다</p>

  return (
    <div className="space-y-2">
      {chain.map((item) => (
        <div
          key={item.taskId}
          className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {item.agentName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {item.agentName}
            </p>
            <p className="text-xs text-zinc-500">
              {TIER_LABELS[item.agentTier] ?? item.agentTier} · {TASK_TYPE_LABELS[item.taskType] ?? item.taskType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{formatDuration(item.durationMs)}</span>
            <Badge variant={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'default'}>
              {item.status === 'completed' ? '완료' : item.status === 'failed' ? '실패' : '진행중'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

// === Quality Score Card ===

function QualityScoreCard({ reviews }: { reviews: QualityReviewItem[] }) {
  if (reviews.length === 0) return <p className="text-sm text-zinc-400">검수 데이터가 없습니다</p>

  // Show the latest review
  const latest = reviews[reviews.length - 1]
  const scores = latest.scores

  return (
    <div className="space-y-3">
      {reviews.length > 1 && (
        <p className="text-xs text-amber-500">재작업 {reviews.length - 1}회 수행됨</p>
      )}
      <div className="space-y-2">
        {Object.entries(SCORE_LABELS).map(([key, label]) => {
          const score = scores[key] ?? 0
          const maxScore = 5
          const pct = (score / maxScore) * 100
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
                <span className="text-zinc-500">{score}/{maxScore}</span>
              </div>
              <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">총점</span>
        <Badge variant={latest.conclusion === 'pass' ? 'success' : 'error'}>
          {latest.conclusion === 'pass' ? 'PASS' : 'FAIL'}{' '}
          {Object.values(scores).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)}/25
        </Badge>
      </div>
      {latest.feedback && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
          <strong>재작업 지시:</strong> {latest.feedback}
        </div>
      )}
    </div>
  )
}

// === Main Modal ===

type CommandDetail = {
  id: string
  result: string | null
  metadata: Record<string, unknown> | null
}

export type ReportDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  commandId: string
}

export function ReportDetailModal({ isOpen, onClose, commandId }: ReportDetailModalProps) {
  const { data: commandData } = useQuery({
    queryKey: ['command', commandId],
    queryFn: () => api.get<{ data: CommandDetail }>(`/workspace/commands/${commandId}`),
    enabled: isOpen,
    staleTime: 60_000,
  })

  const result = commandData?.data?.result ?? ''
  const metadata = commandData?.data?.metadata ?? null

  const { data: delegationData, isLoading: loadingDelegation } = useQuery({
    queryKey: ['command-delegation', commandId],
    queryFn: () => api.get<DelegationResponse>(`/workspace/commands/${commandId}/delegation`),
    enabled: isOpen,
    staleTime: 60_000,
  })

  const { data: costData } = useQuery({
    queryKey: ['command-cost', commandId],
    queryFn: () => api.get<CostResponse>(`/workspace/commands/${commandId}/cost`),
    enabled: isOpen,
    staleTime: 60_000,
  })

  const chain = delegationData?.data?.chain ?? []
  const reviews = delegationData?.data?.qualityReviews ?? []
  const cost = costData?.data

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="보고서 상세" className="max-w-2xl max-h-[85vh] overflow-y-auto">
      {/* Report content */}
      <div className="mb-4">
        <ReportView
          commandId={commandId}
          result={result}
          metadata={metadata as ReportViewProps['metadata']}
        />
      </div>

      {/* Cost Summary */}
      {cost && (cost.inputTokens > 0 || cost.outputTokens > 0) && (
        <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">비용 요약</h3>
          <div className="flex gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            <span>입력: {cost.inputTokens.toLocaleString()} 토큰</span>
            <span>출력: {cost.outputTokens.toLocaleString()} 토큰</span>
            <span className="font-medium">${cost.totalCostUsd.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Delegation Chain */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">위임 체인</h3>
        {loadingDelegation ? <Spinner /> : <DelegationChain chain={chain} />}
      </div>

      {/* Quality Gate Details */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">품질 검수</h3>
        {loadingDelegation ? <Spinner /> : <QualityScoreCard reviews={reviews} />}
      </div>

      {/* Close button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>
    </Modal>
  )
}
