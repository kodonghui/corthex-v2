import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { MarkdownRenderer } from '../components/markdown-renderer'
import { useAuthStore } from '../stores/auth-store'
import { Card, Tabs, Textarea, Badge, Skeleton, ConfirmDialog, EmptyState, toast } from '@corthex/ui'
import type { TabItem } from '@corthex/ui'

type Report = {
  id: string
  title: string
  content?: string
  status: 'draft' | 'submitted' | 'reviewed'
  authorId: string
  authorName: string
  submittedTo: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

type Comment = {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

const statusLabel: Record<string, string> = {
  draft: '초안',
  submitted: '제출됨',
  reviewed: '검토 완료',
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  submitted: 'warning',
  reviewed: 'success',
}

export function ReportsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { id: urlReportId } = useParams<{ id: string }>()

  const [view, setView] = useState<'list' | 'create' | 'detail'>(urlReportId ? 'detail' : 'list')
  const [selectedReport, setSelectedReport] = useState<string | null>(urlReportId || null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // 보고서 목록
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get<{ data: Report[] }>('/workspace/reports'),
  })

  // 보고서 상세
  const { data: reportDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['report', selectedReport],
    queryFn: () => api.get<{ data: Report }>(`/workspace/reports/${selectedReport}`),
    enabled: !!selectedReport,
  })

  // 코멘트 목록 (최근 5개 + lazy load)
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [commentTotal, setCommentTotal] = useState(0)

  const { data: commentsData } = useQuery({
    queryKey: ['reportComments', selectedReport],
    queryFn: () => api.get<{ data: Comment[]; total: number }>(`/workspace/reports/${selectedReport}/comments?limit=5`),
    enabled: !!selectedReport && view === 'detail',
  })

  // 초기 로드 시 코멘트 설정
  const commentsLoaded = commentsData?.data
  useEffect(() => {
    if (commentsLoaded && commentsLoaded.length > 0 && allComments.length === 0) {
      setAllComments(commentsLoaded)
      setCommentTotal(commentsData!.total)
    }
  }, [commentsLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMoreComments = async () => {
    if (!selectedReport || allComments.length === 0) return
    const firstId = allComments[0].id
    const res = await api.get<{ data: Comment[]; total: number }>(
      `/workspace/reports/${selectedReport}/comments?limit=5&before=${firstId}`,
    )
    if (res.data.length > 0) {
      setAllComments((prev) => [...res.data, ...prev])
    }
  }

  // Mutations
  const createReport = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.post<{ data: Report }>('/workspace/reports', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      navigate(`/reports/${res.data.id}`)
      setSelectedReport(res.data.id)
      setView('detail')
      setTitle('')
      setContent('')
    },
  })

  const updateReport = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.put<{ data: Report }>(`/workspace/reports/${selectedReport}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', selectedReport] })
      setEditMode(false)
    },
  })

  const submitReport = useMutation({
    mutationFn: () =>
      api.post<{ data: Report }>(`/workspace/reports/${selectedReport}/submit`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', selectedReport] })
      toast.success('CEO에게 보고했습니다')
    },
  })

  const reviewReport = useMutation({
    mutationFn: () =>
      api.post<{ data: Report }>(`/workspace/reports/${selectedReport}/review`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', selectedReport] })
      toast.success('검토 완료 처리되었습니다')
    },
  })

  const deleteReport = useMutation({
    mutationFn: () => api.delete(`/workspace/reports/${selectedReport}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setSelectedReport(null)
      navigate('/reports')
      setView('list')
    },
  })

  const createComment = useMutation({
    mutationFn: (commentContent: string) =>
      api.post<{ data: Comment }>(`/workspace/reports/${selectedReport}/comments`, {
        content: commentContent,
      }),
    onSuccess: (res) => {
      setAllComments((prev) => [...prev, res.data])
      setCommentTotal((n) => n + 1)
      setCommentInput('')
    },
  })

  const reportList = reportsData?.data || []
  const report = reportDetail?.data
  const comments = allComments
  const remainingComments = commentTotal - allComments.length
  const isMyReport = report?.authorId === user?.id
  const isReceivedReport = report?.submittedTo === user?.id

  const myReports = reportList.filter((r) => r.authorId === user?.id)
  const receivedReports = reportList.filter(
    (r) => r.submittedTo === user?.id && r.authorId !== user?.id,
  )

  const tabItems: TabItem[] = [
    { value: 'all', label: `전체 (${reportList.length})` },
    { value: 'mine', label: `내 보고서 (${myReports.length})` },
    { value: 'received', label: `받은 보고서 (${receivedReports.length})` },
  ]

  const filteredReports =
    activeTab === 'mine' ? myReports : activeTab === 'received' ? receivedReports : reportList

  const handleOpenDetail = useCallback(
    (id: string) => {
      setSelectedReport(id)
      setEditMode(false)
      setView('detail')
      setAllComments([])
      setCommentTotal(0)
      navigate(`/reports/${id}`)
    },
    [navigate],
  )

  const handleBack = useCallback(() => {
    setView('list')
    setSelectedReport(null)
    setEditMode(false)
    navigate('/reports')
  }, [navigate])

  const handleStartEdit = () => {
    if (!report) return
    setTitle(report.title)
    setContent(report.content || '')
    setEditMode(true)
  }

  const handleSaveEdit = () => {
    if (!title.trim()) return
    updateReport.mutate({ title: title.trim(), content })
  }

  const handleDownload = async () => {
    if (!selectedReport) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/workspace/reports/${selectedReport}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('corthex_token')}` },
      })
      if (!res.ok) throw new Error('다운로드 실패')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report?.title || 'report'}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('다운로드에 실패했습니다')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={handleBack}
              className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              &larr; 목록
            </button>
          )}
          <h2 className="text-lg font-semibold">
            {view === 'list' ? '보고서' : view === 'create' ? '새 보고서' : '보고서 상세'}
          </h2>
        </div>
        {view === 'list' && (
          <button
            onClick={() => {
              setTitle('')
              setContent('')
              setView('create')
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + 새 보고서
          </button>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {/* === 목록 뷰 === */}
        {view === 'list' && (
          <div className="px-4 sm:px-6 py-4 space-y-4 max-w-2xl">
            <Tabs items={tabItems} value={activeTab} onChange={setActiveTab} />

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <EmptyState
                title={activeTab === 'received' ? '받은 보고서가 없습니다' : '아직 보고서가 없습니다'}
                description={activeTab === 'mine' ? '새 보고서를 작성해보세요' : undefined}
              />
            ) : (
              <div className="space-y-2">
                {filteredReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleOpenDetail(r.id)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {r.title}
                      </span>
                      <Badge variant={statusVariant[r.status]}>
                        {r.status === 'submitted' ? '📤 CEO 보고 완료' : statusLabel[r.status]}
                      </Badge>
                    </div>
                    {r.content && (
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-1">
                        {(r.content || '').slice(0, 120)}
                      </p>
                    )}
                    <div className="text-[11px] text-zinc-400">
                      {r.authorName} · {new Date(r.submittedAt || r.updatedAt).toLocaleDateString('ko-KR')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === 작성 뷰 === */}
        {view === 'create' && (
          <div className="px-4 sm:px-6 py-4 max-w-2xl space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="보고서 제목"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="보고서 내용을 마크다운으로 작성하세요..."
              rows={16}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!title.trim()) return
                  createReport.mutate({ title: title.trim(), content })
                }}
                disabled={!title.trim() || createReport.isPending}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {createReport.isPending ? '저장 중...' : '초안 저장'}
              </button>
              <button
                onClick={handleBack}
                className="px-5 py-2.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* === 상세 뷰 로딩 === */}
        {view === 'detail' && detailLoading && (
          <div className="px-4 sm:px-6 py-4 max-w-2xl space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        )}

        {/* === 상세 뷰 === */}
        {view === 'detail' && !detailLoading && report && (
          <div className="px-4 sm:px-6 py-4 max-w-2xl space-y-6">
            {/* 상태 + 메타 정보 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusVariant[report.status]}>
                  {report.status === 'submitted' || report.status === 'reviewed'
                    ? '📤 CEO 보고 완료'
                    : statusLabel[report.status]}
                </Badge>
                <span className="text-xs text-zinc-400">
                  작성: {report.authorName} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {report.submittedAt && (
                  <span className="text-xs text-zinc-400">
                    · 제출: {new Date(report.submittedAt).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>

              {/* CEO 보고 완료 안내 */}
              {report.status !== 'draft' && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  CEO에게 보고된 보고서입니다. 본문 수정이 제한됩니다.
                </p>
              )}

              {editMode ? (
                <>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={14}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={!title.trim() || updateReport.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {updateReport.isPending ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-zinc-500 text-sm"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{report.title}</h2>
                  <MarkdownRenderer
                    content={report.content || '(내용 없음)'}
                    className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 min-h-[200px]"
                  />
                </>
              )}
            </div>

            {/* 액션 버튼 — 모바일 sticky */}
            {!editMode && (
              <div className="flex gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 sm:static sticky bottom-0 bg-white dark:bg-zinc-900 pb-4 sm:pb-0">
                {isMyReport && report.status === 'draft' && (
                  <>
                    <button
                      onClick={handleStartEdit}
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setConfirmOpen(true)}
                      disabled={submitReport.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      📤 CEO에게 보고
                    </button>
                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="px-4 py-2 text-red-500 hover:text-red-600 text-sm"
                    >
                      삭제
                    </button>
                  </>
                )}
                {isReceivedReport && report.status === 'submitted' && (
                  <button
                    onClick={() => reviewReport.mutate()}
                    disabled={reviewReport.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {reviewReport.isPending ? '처리 중...' : '검토 완료'}
                  </button>
                )}
                {report.status !== 'draft' && (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {downloading ? '다운로드 중...' : '📥 다운로드'}
                  </button>
                )}
              </div>
            )}

            {/* 코멘트 섹션 (제출 이후만) */}
            {report.status !== 'draft' && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-4">
                <h3 className="text-sm font-medium text-zinc-500">
                  코멘트 ({comments.length})
                </h3>

                {comments.length === 0 && (
                  <p className="text-xs text-zinc-400">아직 코멘트가 없습니다</p>
                )}

                {remainingComments > 0 && (
                  <button
                    onClick={loadMoreComments}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    이전 코멘트 {remainingComments}개 더 보기
                  </button>
                )}

                {comments.map((c) => {
                  const isCeo = c.authorId === report.submittedTo
                  return (
                    <div
                      key={c.id}
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        isCeo
                          ? 'ml-auto bg-indigo-50 dark:bg-indigo-950/20'
                          : 'mr-auto bg-zinc-50 dark:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {c.authorName}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(c.createdAt).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                        {c.content}
                      </p>
                    </div>
                  )
                })}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && commentInput.trim()) {
                        createComment.mutate(commentInput.trim())
                      }
                    }}
                    placeholder="코멘트 작성..."
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => {
                      if (commentInput.trim()) createComment.mutate(commentInput.trim())
                    }}
                    disabled={!commentInput.trim() || createComment.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    전송
                  </button>
                </div>
              </div>
            )}

            {/* 에이전트와 이어서 논의하기 */}
            {report.status !== 'draft' && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                <button
                  onClick={() => navigate('/chat?newSession=true')}
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>에이전트와 이어서 논의하기</span>
                  <span className="text-xs text-zinc-400">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ConfirmDialog: CEO 보고 */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="CEO에게 보고"
        description="이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다."
        confirmText="보고하기"
        onConfirm={() => {
          setConfirmOpen(false)
          submitReport.mutate()
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* ConfirmDialog: 삭제 */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="보고서 삭제"
        description="이 보고서를 삭제하시겠습니까? 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        onConfirm={() => {
          setDeleteConfirmOpen(false)
          deleteReport.mutate()
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}
