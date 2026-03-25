/**
 * Story 26.3: Marketing Content Approval (FR-MKT3)
 * References: FR-MKT2, FR-MKT3, NFR-P17
 *
 * CC-6 CEO approval view: pending content queue, approve/reject buttons,
 * multi-platform posting trigger, approval history.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserCheck, CheckCircle2, XCircle, Clock, Send, Image, Video,
  ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, RefreshCw, AlertTriangle,
} from 'lucide-react'
import { api } from '../lib/api'

// === Types ===

type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface MarketingContent {
  id: string
  type: 'card_news' | 'short_form'
  title: string
  description: string
  mediaUrl?: string
  thumbnailUrl?: string
}

interface ApprovalRequest {
  id: string
  companyId: string
  contents: MarketingContent[]
  status: ApprovalStatus
  approvalChannel?: string
  approvedBy?: string
  rejectedReason?: string
  createdAt: string
  resolvedAt?: string
}

interface PlatformPostResult {
  platform: string
  success: boolean
  postId?: string
  error?: string
  durationMs: number
}

interface PostingResult {
  approvalId: string
  results: PlatformPostResult[]
  totalSuccess: number
  totalFailed: number
  totalDurationMs: number
}

// === Constants ===

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X' },
] as const

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  pending: { label: '대기중', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: '승인됨', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rejected: { label: '거절됨', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
}

// === Helpers ===

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// === Content Preview Card ===

function ContentPreview({ content }: { content: MarketingContent }) {
  const isVideo = content.type === 'short_form'
  const Icon = isVideo ? Video : Image
  return (
    <div className="rounded-lg border border-sand-200 bg-stone-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-olive-600" />
        <span className="text-xs font-medium text-stone-500 uppercase">
          {isVideo ? '숏폼 영상' : '카드뉴스'}
        </span>
      </div>
      {content.thumbnailUrl && (
        <div className="rounded-lg overflow-hidden mb-2 bg-stone-200 aspect-video flex items-center justify-center">
          <img src={content.thumbnailUrl} alt={content.title} className="object-cover w-full h-full" />
        </div>
      )}
      <h4 className="text-sm font-medium text-stone-800">{content.title}</h4>
      <p className="text-xs text-stone-500 mt-1 line-clamp-3">{content.description}</p>
    </div>
  )
}

// === Pending Approval Card ===

function PendingApprovalCard({ approval }: { approval: ApprovalRequest }) {
  const [expanded, setExpanded] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    PLATFORMS.map((p) => p.id),
  )
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: () =>
      api.post<{ data: ApprovalRequest }>(`/workspace/marketing/approvals/${approval.id}/approve`, {
        channel: 'web',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-approvals'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      api.post<{ data: ApprovalRequest }>(`/workspace/marketing/approvals/${approval.id}/reject`, {
        channel: 'web',
        reason: rejectReason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-approvals'] })
      setShowRejectInput(false)
      setRejectReason('')
    },
  })

  const postMutation = useMutation({
    mutationFn: () =>
      api.post<{ data: PostingResult }>(`/workspace/marketing/approvals/${approval.id}/post`, {
        platforms: selectedPlatforms,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-approvals'] })
    },
  })

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  return (
    <div className="rounded-xl border border-sand-200 bg-corthex-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sand-100">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">
              콘텐츠 승인 요청 ({approval.contents.length}개)
            </p>
            <p className="text-xs text-stone-500">{formatDate(approval.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-stone-100 text-stone-400"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Content Preview (always show first item) */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(expanded ? approval.contents : approval.contents.slice(0, 2)).map((content) => (
            <ContentPreview key={content.id} content={content} />
          ))}
        </div>
        {!expanded && approval.contents.length > 2 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-olive-600 mt-2 hover:underline"
          >
            +{approval.contents.length - 2}개 더 보기
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-3">
        {/* Platform Selection */}
        <div>
          <p className="text-xs text-stone-500 mb-2">게시 플랫폼 선택</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedPlatforms.includes(p.id)
                    ? 'bg-olive-600 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reject reason input */}
        {showRejectInput && (
          <div className="space-y-2">
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거절 사유 (선택사항)"
              className="w-full px-3 py-2 text-sm border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500/30"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" />
            {approveMutation.isPending ? '처리중...' : '승인'}
          </button>

          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <ThumbsDown className="h-4 w-4" />
              거절
            </button>
          ) : (
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              {rejectMutation.isPending ? '처리중...' : '거절 확인'}
            </button>
          )}

          <button
            onClick={() => postMutation.mutate()}
            disabled={postMutation.isPending || selectedPlatforms.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-olive-600 text-white text-sm font-medium hover:bg-olive-700 disabled:opacity-50 transition-colors ml-auto"
          >
            <Send className="h-4 w-4" />
            {postMutation.isPending ? '게시중...' : `${selectedPlatforms.length}개 플랫폼 게시`}
          </button>
        </div>

        {/* Posting result display */}
        {postMutation.data && (
          <PostingResultDisplay result={postMutation.data.data} />
        )}
      </div>
    </div>
  )
}

// === Posting Result ===

function PostingResultDisplay({ result }: { result: PostingResult }) {
  return (
    <div className="rounded-lg border border-sand-200 bg-stone-50 p-3 mt-2">
      <p className="text-xs font-medium text-stone-700 mb-2">
        게시 결과: 성공 {result.totalSuccess}개 / 실패 {result.totalFailed}개
        <span className="text-stone-400 ml-2">({(result.totalDurationMs / 1000).toFixed(1)}s)</span>
      </p>
      <div className="space-y-1">
        {result.results.map((r) => (
          <div key={r.platform} className="flex items-center justify-between text-xs">
            <span className="text-stone-600 capitalize">{r.platform.replace('_', ' ')}</span>
            <span className={r.success ? 'text-emerald-600' : 'text-red-600'}>
              {r.success ? `✓ ${(r.durationMs / 1000).toFixed(1)}s` : `✗ ${r.error}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// === History Item ===

function HistoryItem({ approval }: { approval: ApprovalRequest }) {
  const config = STATUS_CONFIG[approval.status]
  const StatusIcon = config.icon

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded ${config.bg}`}>
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">
            {approval.contents.length}개 콘텐츠
            {approval.approvalChannel && (
              <span className="text-xs text-stone-400 ml-2">via {approval.approvalChannel}</span>
            )}
          </p>
          <p className="text-xs text-stone-500">{formatDate(approval.createdAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        {approval.rejectedReason && (
          <p className="text-xs text-stone-400 mt-0.5 max-w-[200px] truncate">{approval.rejectedReason}</p>
        )}
        {approval.resolvedAt && (
          <p className="text-xs text-stone-400 mt-0.5">{formatDate(approval.resolvedAt)}</p>
        )}
      </div>
    </div>
  )
}

// === Main Page ===

export function MarketingApprovalPage() {
  // Fetch pending approvals
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['marketing-approvals', 'pending'],
    queryFn: () => api.get<{ data: ApprovalRequest[] }>('/workspace/marketing/approvals/pending'),
    refetchInterval: 30_000, // Refresh every 30s for real-time updates
  })

  // Fetch approval history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['marketing-approvals', 'history'],
    queryFn: () =>
      api.get<{ data: { items: ApprovalRequest[]; total: number } }>(
        '/workspace/marketing/approvals/history?limit=20',
      ),
  })

  const pendingApprovals = pendingData?.data ?? []
  const historyItems = historyData?.data?.items ?? []
  const historyTotal = historyData?.data?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserCheck className="h-6 w-6 text-olive-600" />
        <div>
          <h1 className="text-xl font-semibold text-stone-800">마케팅 콘텐츠 승인</h1>
          <p className="text-sm text-stone-500">AI 생성 콘텐츠를 검토하고 승인하세요</p>
        </div>
      </div>

      {/* Pending Queue */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider">
            대기중인 승인 ({pendingApprovals.length})
          </h2>
        </div>

        {pendingLoading ? (
          <div className="rounded-xl border border-sand-200 bg-corthex-surface p-8 text-center text-stone-400">
            <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
            <p>로딩 중...</p>
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="rounded-xl border border-sand-200 bg-corthex-surface p-8 text-center text-stone-400">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>대기중인 승인 요청이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <PendingApprovalCard key={approval.id} approval={approval} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3">
          승인 이력 ({historyTotal}건)
        </h2>
        <div className="rounded-xl border border-sand-200 bg-corthex-surface overflow-hidden">
          {historyLoading ? (
            <div className="p-8 text-center text-stone-400">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
              <p>로딩 중...</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>승인 이력이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {historyItems.map((item) => (
                <HistoryItem key={item.id} approval={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
