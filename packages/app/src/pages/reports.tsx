import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { MarkdownRenderer } from '../components/markdown-renderer'
import { useAuthStore } from '../stores/auth-store'
import { toast } from '@corthex/ui'
import { ShareToConversationModal } from '../components/messenger/share-to-conversation-modal'

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

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: '초안', className: 'bg-slate-700 text-slate-300' },
  submitted: { label: '📤 CEO 보고 완료', className: 'bg-amber-500/20 text-amber-400' },
  reviewed: { label: '검토 완료', className: 'bg-emerald-500/20 text-emerald-400' },
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
  const [showShareModal, setShowShareModal] = useState(false)

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

  const tabs = [
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

  const inputClass = 'w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none'

  return (
    <div className="h-full flex flex-col bg-slate-900" data-testid="reports-page">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={handleBack}
              className="text-sm text-slate-400 hover:text-slate-200"
              data-testid="back-btn"
            >
              ← 목록
            </button>
          )}
          <h2 className="text-xl font-semibold text-slate-50">
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
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
            data-testid="new-report-btn"
          >
            + 새 보고서
          </button>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {/* === 목록 뷰 === */}
        {view === 'list' && (
          <div className="px-6 py-4 space-y-4 max-w-2xl">
            {/* Tab Bar */}
            <div className="flex gap-1" data-testid="report-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeTab === tab.value
                      ? 'border-blue-500 text-blue-400 font-medium'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                  data-testid={`report-tab-${tab.value}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-3" data-testid="reports-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16" data-testid="reports-empty">
                <p className="text-sm text-slate-400">
                  {activeTab === 'received' ? '받은 보고서가 없습니다' : '아직 보고서가 없습니다'}
                </p>
                {activeTab === 'mine' && (
                  <p className="text-xs text-slate-500 mt-1">새 보고서를 작성해보세요</p>
                )}
              </div>
            ) : (
              <div className="space-y-3" data-testid="reports-list">
                {filteredReports.map((r) => {
                  const style = STATUS_STYLES[r.status] || STATUS_STYLES.draft
                  const isSubmitted = r.status === 'submitted' || r.status === 'reviewed'
                  return (
                    <article
                      key={r.id}
                      onClick={() => handleOpenDetail(r.id)}
                      className="w-full text-left rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all p-4 flex flex-col gap-3"
                      data-testid={`report-item-${r.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* File type badge icon */}
                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                          isSubmitted ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-slate-100 truncate">
                            {r.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="font-medium text-slate-400">{r.authorName}</span>
                            <span>·</span>
                            <time className="font-mono text-[11px]">{new Date(r.submittedAt || r.updatedAt).toLocaleDateString('ko-KR')}</time>
                          </div>
                        </div>
                      </div>
                      {r.content && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {(r.content || '').slice(0, 120)}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${style.className}`}>
                            {style.label}
                          </span>
                        </div>
                        {isSubmitted && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDetail(r.id) }}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                            aria-label="다운로드"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* === 작성 뷰 === */}
        {view === 'create' && (
          <div className="px-6 py-4 max-w-2xl space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="보고서 제목"
              className={inputClass}
              data-testid="report-title-input"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="보고서 내용을 마크다운으로 작성하세요..."
              rows={16}
              className={inputClass}
              data-testid="report-content-input"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!title.trim()) return
                  createReport.mutate({ title: title.trim(), content })
                }}
                disabled={!title.trim() || createReport.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                data-testid="save-draft-btn"
              >
                {createReport.isPending ? '저장 중...' : '초안 저장'}
              </button>
              <button
                onClick={handleBack}
                className="text-slate-400 hover:text-slate-200 text-sm px-5 py-2.5"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* === 상세 뷰 로딩 === */}
        {view === 'detail' && detailLoading && (
          <div className="px-6 py-4 max-w-2xl space-y-4" data-testid="detail-loading">
            <div className="h-4 w-24 bg-slate-700 animate-pulse rounded" />
            <div className="h-6 w-3/4 bg-slate-700 animate-pulse rounded" />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-slate-700 animate-pulse rounded" />
            ))}
          </div>
        )}

        {/* === 상세 뷰 === */}
        {view === 'detail' && !detailLoading && report && (
          <div className="px-6 py-4 max-w-2xl space-y-6" data-testid="report-detail">
            {/* 상태 + 메타 정보 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[report.status]?.className || ''}`}>
                  {report.status === 'submitted' || report.status === 'reviewed'
                    ? '📤 CEO 보고 완료'
                    : STATUS_STYLES[report.status]?.label || report.status}
                </span>
                <span className="text-xs text-slate-500">
                  작성: {report.authorName} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {report.submittedAt && (
                  <span className="text-xs text-slate-500">
                    · 제출: {new Date(report.submittedAt).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>

              {/* CEO 보고 완료 안내 */}
              {report.status !== 'draft' && (
                <p className="text-xs text-slate-500">
                  CEO에게 보고된 보고서입니다. 본문 수정이 제한됩니다.
                </p>
              )}

              {editMode ? (
                <>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                  />
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={14}
                    className={inputClass}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={!title.trim() || updateReport.isPending}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                    >
                      {updateReport.isPending ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="text-slate-400 hover:text-slate-200 text-sm px-4 py-2"
                    >
                      취소
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-50">{report.title}</h2>
                  <MarkdownRenderer
                    content={report.content || '(내용 없음)'}
                    className="bg-slate-800/50 rounded-xl p-5 min-h-[200px]"
                  />
                </>
              )}
            </div>

            {/* 액션 버튼 — 모바일 sticky */}
            {!editMode && (
              <div className="flex gap-3 border-t border-slate-700 pt-4 sm:static sticky bottom-0 bg-slate-900 pb-4 sm:pb-0">
                {isMyReport && report.status === 'draft' && (
                  <>
                    <button
                      onClick={handleStartEdit}
                      className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm"
                      data-testid="edit-btn"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setConfirmOpen(true)}
                      disabled={submitReport.isPending}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                      data-testid="submit-btn"
                    >
                      📤 CEO에게 보고
                    </button>
                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="text-red-400 hover:text-red-300 text-sm px-4 py-2"
                      data-testid="delete-btn"
                    >
                      삭제
                    </button>
                  </>
                )}
                {isReceivedReport && report.status === 'submitted' && (
                  <button
                    onClick={() => reviewReport.mutate()}
                    disabled={reviewReport.isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                    data-testid="review-btn"
                  >
                    {reviewReport.isPending ? '처리 중...' : '검토 완료'}
                  </button>
                )}
                {report.status !== 'draft' && (
                  <>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm"
                      data-testid="download-btn"
                    >
                      {downloading ? '다운로드 중...' : '📥 다운로드'}
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm"
                      data-testid="share-btn"
                    >
                      💬 메신저로 공유
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 코멘트 섹션 (제출 이후만) */}
            {report.status !== 'draft' && (
              <div className="border-t border-slate-700 pt-4 space-y-4" data-testid="comments-section">
                <h3 className="text-sm font-medium text-slate-500">
                  코멘트 ({comments.length})
                </h3>

                {comments.length === 0 && (
                  <p className="text-xs text-slate-500">아직 코멘트가 없습니다</p>
                )}

                {remainingComments > 0 && (
                  <button
                    onClick={loadMoreComments}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    이전 코멘트 {remainingComments}개 더 보기
                  </button>
                )}

                {comments.map((c) => {
                  const isCeo = c.authorId === report.submittedTo
                  return (
                    <div
                      key={c.id}
                      className={`max-w-[85%] rounded-xl px-4 py-3 ${
                        isCeo
                          ? 'ml-auto bg-blue-600/10'
                          : 'mr-auto bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">
                          {c.authorName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.createdAt).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-slate-300">
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
                    className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-4 py-2 text-sm focus:outline-none"
                    data-testid="comment-input"
                  />
                  <button
                    onClick={() => {
                      if (commentInput.trim()) createComment.mutate(commentInput.trim())
                    }}
                    disabled={!commentInput.trim() || createComment.isPending}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                    data-testid="comment-send-btn"
                  >
                    전송
                  </button>
                </div>
              </div>
            )}

            {/* 에이전트와 이어서 논의하기 */}
            {report.status !== 'draft' && (
              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => navigate('/chat?newSession=true')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  data-testid="agent-discussion-btn"
                >
                  <span>에이전트와 이어서 논의하기</span>
                  <span className="text-xs text-slate-500">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ConfirmDialog: CEO 보고 */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">CEO에게 보고</h3>
            <p className="text-xs text-slate-400 mb-4">이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">취소</button>
              <button onClick={() => { setConfirmOpen(false); submitReport.mutate() }} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium">보고하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmDialog: 삭제 */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">보고서 삭제</h3>
            <p className="text-xs text-slate-400 mb-4">이 보고서를 삭제하시겠습니까? 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmOpen(false)} className="border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">취소</button>
              <button onClick={() => { setDeleteConfirmOpen(false); deleteReport.mutate() }} className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium">삭제</button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && report && (
        <ShareToConversationModal
          reportId={report.id}
          reportTitle={report.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
