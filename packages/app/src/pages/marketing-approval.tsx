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
    <div className="rounded-lg border border-corthex-border bg-corthex-surface p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-corthex-accent" />
        <span className="text-xs font-medium text-corthex-text-secondary uppercase">
          {isVideo ? '숏폼 영상' : '카드뉴스'}
        </span>
      </div>
      {content.thumbnailUrl && (
        <div className="rounded-lg overflow-hidden mb-2 bg-corthex-elevated aspect-video flex items-center justify-center">
          <img src={content.thumbnailUrl} alt={content.title} className="object-cover w-full h-full" />
        </div>
      )}
      <h4 className="text-sm font-medium text-corthex-text-primary">{content.title}</h4>
      <p className="text-xs text-corthex-text-secondary mt-1 line-clamp-3">{content.description}</p>
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
    <div className="rounded-xl border border-corthex-border bg-corthex-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-corthex-border">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-corthex-text-primary">
              콘텐츠 승인 요청 ({approval.contents.length}개)
            </p>
            <p className="text-xs text-corthex-text-secondary">{formatDate(approval.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-corthex-elevated text-corthex-text-secondary"
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
            className="text-xs text-corthex-accent mt-2 hover:underline"
          >
            +{approval.contents.length - 2}개 더 보기
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-3">
        {/* Platform Selection */}
        <div>
          <p className="text-xs text-corthex-text-secondary mb-2">게시 플랫폼 선택</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedPlatforms.includes(p.id)
                    ? 'text-white'
                    : 'bg-corthex-elevated text-corthex-text-secondary hover:opacity-80'
                }`}
                style={selectedPlatforms.includes(p.id) ? { backgroundColor: 'var(--color-corthex-accent)' } : undefined}
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
              className="w-full px-3 py-2 text-sm border border-corthex-border rounded-lg bg-corthex-bg text-corthex-text-primary focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--color-corthex-accent)' } as React.CSSProperties}
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-colors ml-auto hover:opacity-90"
            style={{ backgroundColor: 'var(--color-corthex-accent)' }}
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
    <div className="rounded-lg border border-corthex-border bg-corthex-elevated p-3 mt-2">
      <p className="text-xs font-medium text-corthex-text-primary mb-2">
        게시 결과: 성공 {result.totalSuccess}개 / 실패 {result.totalFailed}개
        <span className="text-corthex-text-secondary ml-2">({(result.totalDurationMs / 1000).toFixed(1)}s)</span>
      </p>
      <div className="space-y-1">
        {result.results.map((r) => (
          <div key={r.platform} className="flex items-center justify-between text-xs">
            <span className="text-corthex-text-secondary capitalize">{r.platform.replace('_', ' ')}</span>
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
          <p className="text-sm font-medium text-corthex-text-primary">
            {approval.contents.length}개 콘텐츠
            {approval.approvalChannel && (
              <span className="text-xs text-corthex-text-secondary ml-2">via {approval.approvalChannel}</span>
            )}
          </p>
          <p className="text-xs text-corthex-text-secondary">{formatDate(approval.createdAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        {approval.rejectedReason && (
          <p className="text-xs text-corthex-text-secondary mt-0.5 max-w-[200px] truncate">{approval.rejectedReason}</p>
        )}
        {approval.resolvedAt && (
          <p className="text-xs text-corthex-text-secondary mt-0.5">{formatDate(approval.resolvedAt)}</p>
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
    <div
      data-testid="marketing-approval-page"
      className="font-sans min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-corthex-bg)', color: 'var(--color-corthex-text-primary)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 border-b border-corthex-border" style={{ backgroundColor: 'var(--color-corthex-surface)' }}>
        <div className="flex items-center gap-4">
          <UserCheck className="h-5 w-5 text-corthex-accent" />
          <h1 className="text-xl font-black tracking-tighter text-corthex-accent">APPROVAL QUEUE</h1>
          {!pendingLoading && (
            <span className="text-[10px] px-2 py-0.5 rounded font-bold border text-corthex-accent" style={{ backgroundColor: 'rgba(96,108,56,0.1)', borderColor: 'rgba(96,108,56,0.2)' }}>
              {pendingApprovals.length} PENDING
            </span>
          )}
        </div>
      </header>

      {/* Content Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Batch Action Toolbar */}
        <div className="flex items-center justify-between bg-corthex-surface border border-corthex-border p-3 rounded-xl">
          <div className="flex items-center gap-4 px-2">
            <input type="checkbox" className="rounded border-corthex-border bg-corthex-elevated" />
            <span className="text-sm font-medium text-corthex-text-secondary">
              전체 선택 <span className="text-corthex-text-secondary opacity-60">({pendingApprovals.length}건)</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-corthex-elevated text-corthex-text-primary rounded-lg text-sm font-semibold hover:opacity-80 transition-all">
              <XCircle className="h-4 w-4" />
              전체 거절
            </button>
            <button className="flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--color-corthex-accent)' }}>
              <CheckCircle2 className="h-4 w-4" />
              전체 승인
            </button>
          </div>
        </div>

        {/* Pending Queue */}
        <section>
          {pendingLoading ? (
            <div className="rounded-xl border border-corthex-border bg-corthex-surface p-8 text-center text-corthex-text-secondary">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
              <p>로딩 중...</p>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="rounded-xl border border-corthex-border bg-corthex-surface p-8 text-center text-corthex-text-secondary">
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

        {/* Stats Section */}
        <div className="border-t border-corthex-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-corthex-surface border border-corthex-border p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-corthex-accent" style={{ backgroundColor: 'rgba(96,108,56,0.1)' }}>
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-corthex-text-primary">승인 속도</h3>
                <p className="text-xs text-corthex-text-secondary mt-1">평균 승인까지 4.2시간 소요</p>
              </div>
              <div className="w-full h-1 bg-corthex-elevated rounded-full overflow-hidden">
                <div className="w-3/4 h-full rounded-full" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
              </div>
            </div>
            <div className="bg-corthex-surface border border-corthex-border p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-corthex-accent" style={{ backgroundColor: 'rgba(96,108,56,0.1)' }}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-corthex-text-primary">준수율</h3>
                <p className="text-xs text-corthex-text-secondary mt-1">브랜드 가이드라인 충족 항목</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-corthex-text-primary">
                  {historyTotal > 0
                    ? `${Math.round((historyItems.filter(i => i.status === 'approved').length / Math.max(historyItems.length, 1)) * 100)}%`
                    : '--'}
                </span>
              </div>
            </div>
            <div className="bg-corthex-surface border border-corthex-border p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-corthex-accent" style={{ backgroundColor: 'rgba(96,108,56,0.1)' }}>
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-corthex-text-primary">AI 보조 상태</h3>
                <p className="text-xs text-corthex-text-secondary mt-1">전처리 활성화됨</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--color-corthex-accent)' }} />
                </span>
                <span className="text-[10px] font-bold tracking-widest text-corthex-accent uppercase">동기화됨</span>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <section>
          <h2 className="text-sm font-medium text-corthex-text-secondary uppercase tracking-wider mb-3">
            승인 이력 ({historyTotal}건)
          </h2>
          <div className="rounded-xl border border-corthex-border bg-corthex-surface overflow-hidden">
            {historyLoading ? (
              <div className="p-8 text-center text-corthex-text-secondary">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                <p>로딩 중...</p>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="p-8 text-center text-corthex-text-secondary">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>승인 이력이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-corthex-border">
                {historyItems.map((item) => (
                  <HistoryItem key={item.id} approval={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-corthex-border flex items-center justify-between px-6 bg-corthex-surface text-[11px] text-corthex-text-secondary">
        <span>총 {historyTotal}건 이력</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>시스템 정상</span>
        </div>
      </footer>
    </div>
  )
}
