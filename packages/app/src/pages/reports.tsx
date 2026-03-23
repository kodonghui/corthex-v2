/**
 * Reports / Archive Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET    /api/workspace/reports
 *   GET    /api/workspace/reports/:id
 *   POST   /api/workspace/reports
 *   PUT    /api/workspace/reports/:id
 *   POST   /api/workspace/reports/:id/submit
 *   POST   /api/workspace/reports/:id/review
 *   DELETE /api/workspace/reports/:id
 *   GET    /api/workspace/reports/:id/comments?limit=&before=
 *   POST   /api/workspace/reports/:id/comments
 *   GET    /api/workspace/reports/:id/download
 *
 * Stitch HTML: reports_archive/code.html (converted from Stitch Default orange to Natural Organic olive/beige)
 * Existing React: packages/app/src/pages/reports.tsx
 */

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { MarkdownRenderer } from '../components/markdown-renderer'
import { useAuthStore } from '../stores/auth-store'
import { toast } from '@corthex/ui'
import { Wrench, Download, Share2, Trash2, Lightbulb, Send } from 'lucide-react'
import { ShareToConversationModal } from '../components/messenger/share-to-conversation-modal'

// === Constants ===

// Sovereign Sage Design Tokens
const accentColor = '#606C38'
const accentHover = '#4e5a2b'

// === Types ===

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

const STATUS_STYLES: Record<string, { label: string; bgClass: string; textClass: string }> = {
  draft: { label: 'Draft', bgClass: 'bg-[#f0ebe0]', textClass: 'text-[#6b705c]' },
  submitted: { label: 'Submitted', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  reviewed: { label: 'Reviewed', bgClass: 'bg-green-100', textClass: 'text-green-700' },
}

// === Main Page ===

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

  // Queries
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get<{ data: Report[] }>('/workspace/reports'),
  })

  const { data: reportDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['report', selectedReport],
    queryFn: () => api.get<{ data: Report }>(`/workspace/reports/${selectedReport}`),
    enabled: !!selectedReport,
  })

  const [allComments, setAllComments] = useState<Comment[]>([])
  const [commentTotal, setCommentTotal] = useState(0)

  const { data: commentsData } = useQuery({
    queryKey: ['reportComments', selectedReport],
    queryFn: () => api.get<{ data: Comment[]; total: number }>(`/workspace/reports/${selectedReport}/comments?limit=5`),
    enabled: !!selectedReport && view === 'detail',
  })

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

  const filterTabs = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewed', label: 'Reviewed' },
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

  const inputClass = 'w-full bg-white border border-[#e5e1d3] focus:border-[#606C38] text-[#1a1a1a] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#606C38]/20 focus:outline-none'

  // === Create view ===
  if (view === 'create') {
    return (
      <div className="h-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#faf8f5' }} data-testid="reports-page">
        <div className="px-8 py-4 border-b border-[#e5e1d3] flex items-center gap-3 bg-white">
          <button onClick={handleBack} className="text-sm text-[#6b705c] hover:text-[#6b705c]" data-testid="back-btn">
            &larr; 목록
          </button>
          <h2 className="text-lg font-semibold text-[#1a1a1a]">새 보고서</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-12 py-8 max-w-2xl mx-auto w-full space-y-4">
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
              className="text-white rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-colors shadow-sm"
              style={{ backgroundColor: accentColor }}
              data-testid="save-draft-btn"
            >
              {createReport.isPending ? '저장 중...' : '초안 저장'}
            </button>
            <button onClick={handleBack} className="text-[#6b705c] hover:text-[#6b705c] text-sm px-5 py-2.5">
              취소
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === List + Detail split layout ===
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#faf8f5' }} data-testid="reports-page">
      <div className="flex h-full overflow-hidden">
        {/* Main Content Area */}
          {/* Dashboard Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Report List Column */}
            <div className="w-1/3 border-r border-[#e5e1d3] flex flex-col overflow-hidden bg-[#f5f0e8]/50">
              <div className="p-4 flex gap-2 overflow-x-auto shrink-0 border-b border-[#e5e1d3]">
                {filterTabs.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      activeTab === tab.value
                        ? 'text-white'
                        : 'bg-white border border-[#e5e1d3] text-[#6b705c]'
                    }`}
                    style={activeTab === tab.value ? { backgroundColor: accentColor } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl h-24 animate-pulse border border-[#e5e1d3]" />
                  ))
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-16 text-sm text-[#756e5a]" data-testid="reports-empty">
                    보고서가 없습니다
                  </div>
                ) : (
                  filteredReports.map((r) => {
                    const isSelected = selectedReport === r.id
                    const style = STATUS_STYLES[r.status] || STATUS_STYLES.draft
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleOpenDetail(r.id)}
                        className={`p-4 bg-white rounded-xl transition-all cursor-pointer shadow-sm ${
                          isSelected
                            ? 'border-2 ring-1'
                            : 'border border-[#e5e1d3] hover:border-stone-400'
                        }`}
                        style={isSelected ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}1a` } : {}}
                        data-testid={`report-item-${r.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bgClass} ${style.textClass}`}>
                            {style.label}
                          </span>
                          <span className="text-[10px] text-[#756e5a] font-medium">
                            {new Date(r.submittedAt || r.updatedAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#1a1a1a] mb-1 leading-tight">{r.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-[#6b705c]">
                          <Wrench className="w-4 h-4" />
                          <span>Agent: {r.authorName}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Report Detail Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {!selectedReport || !report ? (
                <div className="flex-1 flex items-center justify-center text-[#756e5a] text-sm">
                  보고서를 선택하세요
                </div>
              ) : (
                <>
                  {/* Detail Header Actions */}
                  <div className="px-8 py-4 border-b border-[#e5e1d3] flex justify-between items-center bg-[#f5f0e8]/30">
                    <div className="flex gap-4">
                      {report.status !== 'draft' && (
                        <button onClick={handleDownload} disabled={downloading} className="p-2 hover:bg-[#f0ebe0] rounded-lg transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                      {report.status !== 'draft' && (
                        <button onClick={() => setShowShareModal(true)} className="p-2 hover:bg-[#f0ebe0] rounded-lg transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      )}
                      {isMyReport && report.status === 'draft' && (
                        <button onClick={() => setDeleteConfirmOpen(true)} className="p-2 hover:bg-[#f0ebe0] rounded-lg transition-colors text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {isMyReport && report.status === 'draft' && (
                        <>
                          <button
                            onClick={handleStartEdit}
                            className="px-4 py-2 bg-[#f0ebe0] text-[#6b705c] rounded-xl text-sm font-bold hover:bg-[#f0ebe0] transition-colors"
                            data-testid="edit-btn"
                          >
                            Request Edit
                          </button>
                          <button
                            onClick={() => setConfirmOpen(true)}
                            disabled={submitReport.isPending}
                            className="px-6 py-2 text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
                            style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px ${accentColor}33` }}
                            data-testid="submit-btn"
                          >
                            Complete Review
                          </button>
                        </>
                      )}
                      {isReceivedReport && report.status === 'submitted' && (
                        <button
                          onClick={() => reviewReport.mutate()}
                          disabled={reviewReport.isPending}
                          className="px-6 py-2 text-white rounded-xl text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
                          style={{ backgroundColor: accentColor }}
                          data-testid="review-btn"
                        >
                          {reviewReport.isPending ? '처리 중...' : 'Complete Review'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Markdown Content */}
                  <div className="flex-1 overflow-y-auto px-12 py-10 max-w-4xl mx-auto w-full space-y-8">
                    {editMode ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={inputClass}
                          style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem' }}
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
                            className="text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                            style={{ backgroundColor: accentColor }}
                          >
                            {updateReport.isPending ? '저장 중...' : '저장'}
                          </button>
                          <button onClick={() => setEditMode(false)} className="text-[#6b705c] hover:text-[#6b705c] text-sm px-4 py-2">
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <h1 className="text-4xl leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{report.title}</h1>
                          <div className="flex items-center gap-6 py-4 border-y border-[#e5e1d3]/50">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#756e5a] uppercase tracking-widest font-bold">Created Date</span>
                              <span className="text-sm font-medium">{new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#756e5a] uppercase tracking-widest font-bold">Authoring Agent</span>
                              <span className="text-sm font-medium">{report.authorName}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[#756e5a] uppercase tracking-widest font-bold">Status</span>
                              <span className="text-sm font-medium" style={{ color: accentColor }}>{STATUS_STYLES[report.status]?.label ?? report.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Markdown Body */}
                        <div className="prose prose-neutral max-w-none space-y-6">
                          <MarkdownRenderer
                            content={report.content || '(내용 없음)'}
                            className="prose prose-neutral max-w-none text-[#6b705c] text-sm leading-relaxed"
                          />
                        </div>

                        {/* AI Recommendation callout */}
                        {report.content && report.content.length > 100 && (
                          <div className="p-6 rounded-r-xl my-8" style={{ backgroundColor: `${accentColor}0d`, borderLeft: `4px solid ${accentColor}` }}>
                            <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: accentColor }}>
                              <Lightbulb className="w-5 h-5" />
                              AI Recommendation
                            </h4>
                            <p className="text-sm italic text-[#6b705c]">
                              "This report contains actionable insights. Consider sharing with relevant department heads for review."
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* CEO Feedback Section */}
                    {report.status !== 'draft' && (
                      <div className="mt-16 pt-8 border-t border-[#e5e1d3]">
                        <h3 className="text-xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>CEO Feedback &amp; Comments</h3>
                        <div className="space-y-4">
                          {remainingComments > 0 && (
                            <button onClick={loadMoreComments} className="text-xs hover:underline" style={{ color: accentColor }}>
                              이전 코멘트 {remainingComments}개 더 보기
                            </button>
                          )}

                          {comments.map((c) => (
                            <div key={c.id} className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#e5e1d3] overflow-hidden shrink-0 border border-[#d4cfc4] flex items-center justify-center text-[#6b705c] text-xs font-bold">
                                {c.authorName[0]?.toUpperCase() ?? 'U'}
                              </div>
                              <div className="flex-1 bg-[#f5f0e8] p-4 rounded-2xl rounded-tl-none">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-sm">{c.authorName}
                                    {c.authorId === user?.id && <span className="ml-2 text-[10px] bg-[#e5e1d3] px-1.5 py-0.5 rounded text-[#6b705c]">YOU</span>}
                                  </span>
                                  <span className="text-[10px] text-[#756e5a]">
                                    {new Date(c.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-sm text-[#6b705c] leading-relaxed">{c.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* Input Area */}
                          <div className="mt-6">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#756e5a] mb-2 px-1">Add your feedback</label>
                            <div className="relative">
                              <textarea
                                className="w-full bg-white border-[#e5e1d3] rounded-2xl p-4 text-sm placeholder:text-[#756e5a] border"
                                placeholder="Write a comment..."
                                rows={3}
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                style={{ outline: 'none' }}
                                data-testid="comment-input"
                              />
                              <button
                                onClick={() => {
                                  if (commentInput.trim()) createComment.mutate(commentInput.trim())
                                }}
                                disabled={!commentInput.trim() || createComment.isPending}
                                className="absolute bottom-3 right-3 text-white p-2 rounded-xl transition-colors shadow-lg disabled:opacity-50"
                                style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px ${accentColor}4d` }}
                                data-testid="comment-send-btn"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
      </div>

      {/* ConfirmDialog: CEO 보고 */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-[#e5e1d3] rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">CEO에게 보고</h3>
            <p className="text-xs text-[#6b705c] mb-4">이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="border border-[#d4cfc4] rounded-lg px-4 py-2 text-sm text-[#6b705c] hover:bg-[#f5f0e8]">취소</button>
              <button onClick={() => { setConfirmOpen(false); submitReport.mutate() }} className="text-white rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: accentColor }}>보고하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmDialog: 삭제 */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-[#e5e1d3] rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">보고서 삭제</h3>
            <p className="text-xs text-[#6b705c] mb-4">이 보고서를 삭제하시겠습니까? 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmOpen(false)} className="border border-[#d4cfc4] rounded-lg px-4 py-2 text-sm text-[#6b705c] hover:bg-[#f5f0e8]">취소</button>
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
