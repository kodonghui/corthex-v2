import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@corthex/ui'
import { MarkdownRenderer } from '../markdown-renderer'
import { api } from '../../lib/api'

// === Types ===

type QualityGateMeta = {
  passed: boolean
  totalScore: number
  attemptNumber: number
  warningFlag: boolean
}

type FeedbackMeta = {
  rating: 'up' | 'down'
  comment: string | null
  updatedAt: string
}

type CommandMetadata = {
  qualityGate?: QualityGateMeta | null
  feedback?: FeedbackMeta | null
  classification?: { departmentId?: string; managerId?: string; confidence?: number } | null
  [key: string]: unknown
}

type CostData = {
  inputTokens: number
  outputTokens: number
  totalCostUsd: number
}

// === Section Highlight Wrapper ===

const SECTION_COLORS: Record<string, string> = {
  conclusion: 'bg-blue-50 border-l-4 border-blue-400',
  analysis: 'bg-corthex-bg border-l-4 border-corthex-border',
  risk: 'bg-orange-50 border-l-4 border-orange-400',
  recommendation: 'bg-emerald-50 border-l-4 border-emerald-400',
}

const SECTION_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /^##\s*(결론|종합\s*결론)/m, type: 'conclusion' },
  { pattern: /^##\s*(분석|상세\s*분석)/m, type: 'analysis' },
  { pattern: /^##\s*(리스크|위험\s*요소)/m, type: 'risk' },
  { pattern: /^##\s*(추천|권고\s*사항)/m, type: 'recommendation' },
]

function splitSections(text: string): Array<{ type: string; content: string }> {
  // Find all section headers with their positions
  const markers: Array<{ pos: number; type: string }> = []
  for (const sp of SECTION_PATTERNS) {
    const match = sp.pattern.exec(text)
    if (match) markers.push({ pos: match.index, type: sp.type })
  }
  markers.sort((a, b) => a.pos - b.pos)

  if (markers.length === 0) return [{ type: 'default', content: text }]

  const sections: Array<{ type: string; content: string }> = []

  // Content before first section
  if (markers[0].pos > 0) {
    sections.push({ type: 'default', content: text.slice(0, markers[0].pos) })
  }

  // Each section
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].pos
    const end = i < markers.length - 1 ? markers[i + 1].pos : text.length
    sections.push({ type: markers[i].type, content: text.slice(start, end) })
  }

  return sections
}

function HighlightedReport({ content }: { content: string }) {
  const sections = splitSections(content)
  return (
    <div className="space-y-1">
      {sections.map((section, i) => {
        const colorClass = SECTION_COLORS[section.type]
        return colorClass ? (
          <div key={i} className={`${colorClass} rounded-md px-3 py-2`}>
            <MarkdownRenderer content={section.content} />
          </div>
        ) : (
          <MarkdownRenderer key={i} content={section.content} />
        )
      })}
    </div>
  )
}

// === Quality Badge ===

function QualityBadge({ qualityGate }: { qualityGate: QualityGateMeta }) {
  const [showDetail, setShowDetail] = useState(false)

  const badgeType = qualityGate.warningFlag ? 'warning' : qualityGate.passed ? 'pass' : 'fail'
  const variant = badgeType === 'pass' ? 'success' : badgeType === 'fail' ? 'error' : 'warning'
  const label = badgeType === 'pass' ? 'PASS' : badgeType === 'fail' ? 'FAIL' : 'WARNING'

  return (
    <div className="relative inline-block">
      <button onClick={() => setShowDetail(!showDetail)}>
        <Badge variant={variant}>
          {label} {qualityGate.totalScore}/25
        </Badge>
      </button>
      {showDetail && (
        <div className="absolute z-20 top-full mt-1 left-0 bg-corthex-surface rounded-lg shadow-lg border border-corthex-border p-3 min-w-[200px]">
          <p className="text-xs font-semibold text-corthex-text-secondary mb-2">품질 검수 상세</p>
          <p className="text-xs text-corthex-text-secondary">시도 횟수: {qualityGate.attemptNumber}회</p>
          <button
            onClick={() => setShowDetail(false)}
            className="mt-2 text-xs text-indigo-500 hover:text-indigo-700"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  )
}

// === Cost Summary ===

function CostSummary({ commandId }: { commandId: string }) {
  const { data } = useQuery({
    queryKey: ['command-cost', commandId],
    queryFn: () => api.get<{ success: boolean; data: CostData }>(`/workspace/commands/${commandId}/cost`),
    staleTime: 60_000,
  })

  const cost = data?.data
  if (!cost || (cost.inputTokens === 0 && cost.outputTokens === 0)) return null

  return (
    <span className="text-xs text-corthex-text-disabled">
      {cost.inputTokens.toLocaleString()}+{cost.outputTokens.toLocaleString()} 토큰
      {cost.totalCostUsd > 0 && ` · $${cost.totalCostUsd.toFixed(4)}`}
    </span>
  )
}

// === Feedback Buttons ===

function FeedbackButtons({
  commandId,
  currentFeedback,
}: {
  commandId: string
  currentFeedback?: FeedbackMeta | null
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (rating: 'up' | 'down') =>
      api.patch(`/workspace/commands/${commandId}/feedback`, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })

  const selected = currentFeedback?.rating

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => mutation.mutate('up')}
        disabled={mutation.isPending}
        className={`p-1 rounded transition-colors ${
          selected === 'up'
            ? 'text-emerald-500 bg-emerald-50'
            : 'text-corthex-text-disabled hover:text-emerald-500 hover:bg-emerald-50'
        }`}
        title="좋아요"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM5.5 6v9.25a.75.75 0 0 0 .478.698l4.65 1.86a2.75 2.75 0 0 0 2.118-.042l3.57-1.53A2.75 2.75 0 0 0 18 13.57V7.75a.75.75 0 0 0-.75-.75h-3.768a.75.75 0 0 1-.692-1.036l1.035-2.484a1.85 1.85 0 0 0-1.192-2.552 1.8 1.8 0 0 0-1.775.49L7.77 4.85A3.75 3.75 0 0 0 5.5 6Z" />
        </svg>
      </button>
      <button
        onClick={() => mutation.mutate('down')}
        disabled={mutation.isPending}
        className={`p-1 rounded transition-colors ${
          selected === 'down'
            ? 'text-red-500 bg-red-50'
            : 'text-corthex-text-disabled hover:text-red-500 hover:bg-red-50'
        }`}
        title="별로예요"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M19 11.75a1.25 1.25 0 1 1-2.5 0v-7.5a1.25 1.25 0 1 1 2.5 0v7.5ZM14.5 14V4.75a.75.75 0 0 0-.478-.698l-4.65-1.86a2.75 2.75 0 0 0-2.118.042l-3.57 1.53A2.75 2.75 0 0 0 2 6.43v5.82a.75.75 0 0 0 .75.75h3.768a.75.75 0 0 1 .692 1.036l-1.035 2.484a1.85 1.85 0 0 0 1.192 2.552 1.8 1.8 0 0 0 1.775-.49l3.088-3.432A3.75 3.75 0 0 0 14.5 14Z" />
        </svg>
      </button>
    </div>
  )
}

// === Main ReportView Component ===

export type ReportViewProps = {
  commandId: string
  result: string
  metadata?: CommandMetadata | null
  onDetailClick?: () => void
}

export function ReportView({ commandId, result, metadata, onDetailClick }: ReportViewProps) {
  const qualityGate = metadata?.qualityGate
  const feedback = metadata?.feedback

  return (
    <div className="space-y-2">
      {/* Quality badge + cost row */}
      <div className="flex items-center gap-2 flex-wrap">
        {qualityGate && <QualityBadge qualityGate={qualityGate} />}
        <CostSummary commandId={commandId} />
      </div>

      {/* Report content with section highlighting */}
      <div
        className={onDetailClick ? 'cursor-pointer hover:bg-corthex-bg rounded-lg transition-colors' : ''}
        onClick={onDetailClick}
      >
        <HighlightedReport content={result} />
      </div>

      {/* Feedback buttons */}
      <div className="flex items-center justify-end">
        <FeedbackButtons commandId={commandId} currentFeedback={feedback} />
      </div>
    </div>
  )
}
