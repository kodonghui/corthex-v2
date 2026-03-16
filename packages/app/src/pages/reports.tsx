import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { MarkdownRenderer } from '../components/markdown-renderer'
import { useAuthStore } from '../stores/auth-store'
import { toast } from '@corthex/ui'
import { ShareToConversationModal } from '../components/messenger/share-to-conversation-modal'
import { Plus, Search, FileText, Download, Share2, Trash2, Bot } from 'lucide-react'

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

const STATUS_STYLES: Record<string, { label: string; className: string; ringClass: string }> = {
  draft: { label: '초안', className: 'bg-slate-700 text-slate-300', ringClass: '' },
  submitted: { label: '작성 중', className: 'bg-blue-500/10 text-blue-400', ringClass: 'ring-1 ring-inset ring-blue-500/20' },
  reviewed: { label: '완료', className: 'bg-emerald-500/10 text-emerald-400', ringClass: 'ring-1 ring-inset ring-emerald-500/20' },
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
  const [searchQuery, setSearchQuery] = useState('')

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

  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'reviewed', label: 'Completed' },
    { value: 'draft', label: 'Drafting' },
    { value: 'submitted', label: 'Reviewing' },
  ]

  const filteredReports = reportList.filter((r) => {
    if (activeTab !== 'all' && r.status !== activeTab) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return r.title.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q)
    }
    return true
  })

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

  const inputClass = 'w-full bg-slate-900 border border-slate-700 focus:border-cyan-500/50 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-cyan-500/50 focus:outline-none text-slate-50'

  // === List + Detail split layout (Stitch-matching) ===

  if (view === 'list' || (view === 'detail' && report)) {
    return (
      <div className="h-full flex flex-col bg-slate-950 overflow-hidden" data-testid="reports-page">
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: List */}
          <main className={`flex-1 flex flex-col overflow-y-auto ${view === 'detail' ? 'border-r border-slate-800' : ''}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-slate-50 tracking-tight text-2xl font-bold leading-tight">
                  Reports (보고서)
                </h1>
                <p className="text-slate-400 text-sm font-normal leading-normal">
                  Browse and view AI-generated business reports
                </p>
              </div>
              <button
                onClick={() => {
                  setTitle('')
                  setContent('')
                  setView('create')
                }}
                className="flex cursor-pointer items-center justify-center gap-2 rounded px-4 py-2 bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 text-sm font-semibold transition-colors"
                data-testid="new-report-btn"
              >
                <Plus className="w-4 h-4" />
                <span>New Report</span>
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-2">
              <label className="flex flex-col w-full h-10">
                <div className="flex w-full flex-1 items-stretch rounded bg-slate-900 border border-slate-800 focus-within:border-cyan-500/50 transition-colors">
                  <div className="text-slate-400 flex items-center justify-center pl-4 pr-2">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    className="w-full min-w-0 flex-1 bg-transparent text-slate-50 focus:outline-none placeholder:text-slate-500 px-2 text-sm"
                    placeholder="Search reports by title or agent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-6 pt-4 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex h-8 items-center justify-center rounded px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.value
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-400 hover:bg-slate-900 border border-transparent hover:border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Report List */}
            <div className="flex flex-col px-6 gap-2 pb-6">
              {isLoading ? (
                <div className="space-y-3" data-testid="reports-loading">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-900 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-16 text-sm text-slate-400" data-testid="reports-empty">
                  보고서가 없습니다
                </div>
              ) : (
                filteredReports.map((r) => {
                  const isSelected = selectedReport === r.id
                  const style = STATUS_STYLES[r.status] || STATUS_STYLES.draft
                  const isCompleted = r.status === 'reviewed'
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleOpenDetail(r.id)}
                      className={`group flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-900 border border-cyan-400/30 hover:border-cyan-400/50'
                          : 'bg-slate-950 border border-transparent hover:bg-slate-900 hover:border-slate-800'
                      }`}
                      data-testid={`report-item-${r.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex items-center justify-center rounded size-10 shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-cyan-400/10 text-cyan-400'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3 mb-1">
                            <p className={`text-base font-medium leading-tight ${isSelected ? 'text-slate-50' : 'text-slate-300'}`}>
                              {r.title}
                            </p>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.className} ${style.ringClass}`}>
                              {style.label}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm flex items-center gap-2">
                            <span>Agent: {r.authorName}</span>
                            <span>·</span>
                            <span className="font-mono text-xs">
                              {new Date(r.submittedAt || r.updatedAt).toLocaleDateString('ko-KR')}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </main>

          {/* Right panel: Detail (Stitch sidebar style) */}
          {view === 'detail' && report && (
            <aside className="w-[600px] flex-none bg-slate-900 flex flex-col h-full border-l border-slate-800 hidden lg:flex">
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-800 flex-none">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-slate-50 leading-tight">{report.title}</h2>
                  <div className="flex gap-2">
                    {report.status !== 'draft' && (
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded transition-colors"
                        title="다운로드 (Download)"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    {report.status !== 'draft' && (
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded transition-colors"
                        title="공유 (Share)"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    )}
                    {isMyReport && report.status === 'draft' && (
                      <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                        title="삭제 (Delete)"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>{report.authorName}</span>
                  </div>
                  <span>|</span>
                  <span className="font-mono text-xs">
                    {new Date(report.createdAt).toLocaleString('ko-KR')}
                  </span>
                  <span>|</span>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLES[report.status]?.className || ''}`}>
                    {STATUS_STYLES[report.status]?.label || report.status}
                  </span>
                </div>
              </div>

              {/* Detail Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {editMode ? (
                  <div className="space-y-4">
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
                        className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
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
                  </div>
                ) : (
                  <MarkdownRenderer
                    content={report.content || '(내용 없음)'}
                    className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-headings:text-slate-50 prose-a:text-cyan-400"
                  />
                )}

                {/* Action Buttons */}
                {!editMode && (
                  <div className="flex gap-3 mt-6">
                    {isMyReport && report.status === 'draft' && (
                      <>
                        <button
                          onClick={handleStartEdit}
                          className="border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm"
                          data-testid="edit-btn"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setConfirmOpen(true)}
                          disabled={submitReport.isPending}
                          className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                          data-testid="submit-btn"
                        >
                          CEO에게 보고
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
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {report.status !== 'draft' && (
                <div className="p-6 border-t border-slate-800 bg-slate-950 flex-none">
                  <h4 className="text-sm font-semibold text-slate-50 mb-4">
                    Comments ({comments.length})
                  </h4>

                  {remainingComments > 0 && (
                    <button
                      onClick={loadMoreComments}
                      className="text-xs text-cyan-400 hover:underline mb-3"
                    >
                      이전 코멘트 {remainingComments}개 더 보기
                    </button>
                  )}

                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-none ring-1 ring-slate-700">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col bg-slate-900 p-3 rounded-lg border border-slate-800 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-200">{c.authorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(c.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{c.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-none ring-1 ring-slate-700">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex flex-1 items-stretch rounded border border-slate-800 bg-slate-900 focus-within:border-cyan-500/50 transition-colors">
                      <input
                        className="w-full bg-transparent border-none text-sm text-slate-50 focus:ring-0 placeholder:text-slate-500 px-3 py-2 focus:outline-none"
                        placeholder="Add a comment..."
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && commentInput.trim()) {
                            createComment.mutate(commentInput.trim())
                          }
                        }}
                        data-testid="comment-input"
                      />
                      <button
                        onClick={() => {
                          if (commentInput.trim()) createComment.mutate(commentInput.trim())
                        }}
                        disabled={!commentInput.trim() || createComment.isPending}
                        className="px-3 text-cyan-400 hover:text-cyan-300 transition-colors font-medium text-sm disabled:opacity-50"
                        data-testid="comment-send-btn"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Mobile detail view (when no sidebar space) */}
        {view === 'detail' && report && (
          <div className="lg:hidden flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
            <button onClick={handleBack} className="text-sm text-slate-400 hover:text-slate-200" data-testid="back-btn">
              ← 목록
            </button>
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[report.status]?.className || ''}`}>
                  {STATUS_STYLES[report.status]?.label || report.status}
                </span>
                <span className="text-xs text-slate-500">
                  작성: {report.authorName} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-50">{report.title}</h2>
              <MarkdownRenderer
                content={report.content || '(내용 없음)'}
                className="prose prose-invert max-w-none text-slate-300 text-sm"
              />
            </div>
          </div>
        )}

        {/* ConfirmDialog: CEO 보고 */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-96">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">CEO에게 보고</h3>
              <p className="text-xs text-slate-400 mb-4">이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmOpen(false)} className="border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">취소</button>
                <button onClick={() => { setConfirmOpen(false); submitReport.mutate() }} className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 rounded-lg px-4 py-2 text-sm font-medium">보고하기</button>
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

  // === Create view ===
  if (view === 'create') {
    return (
      <div className="h-full flex flex-col bg-slate-950" data-testid="reports-page">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <button onClick={handleBack} className="text-sm text-slate-400 hover:text-slate-200" data-testid="back-btn">
            ← 목록
          </button>
          <h2 className="text-lg font-semibold text-slate-50">새 보고서</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-2xl space-y-4">
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
              className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
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
      </div>
    )
  }

  // fallback
  return null
}
