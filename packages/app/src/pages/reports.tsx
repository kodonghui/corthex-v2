import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Textarea } from '@corthex/ui'

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

const statusColor: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  reviewed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
}

export function ReportsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [commentInput, setCommentInput] = useState('')

  // 보고서 목록
  const { data: reportsData } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get<{ data: Report[] }>('/workspace/reports'),
  })

  // 보고서 상세
  const { data: reportDetail } = useQuery({
    queryKey: ['report', selectedReport],
    queryFn: () => api.get<{ data: Report }>(`/workspace/reports/${selectedReport}`),
    enabled: !!selectedReport,
  })

  // 코멘트 목록
  const { data: commentsData } = useQuery({
    queryKey: ['reportComments', selectedReport],
    queryFn: () => api.get<{ data: Comment[] }>(`/workspace/reports/${selectedReport}/comments`),
    enabled: !!selectedReport && view === 'detail',
  })

  // 보고서 생성
  const createReport = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.post<{ data: Report }>('/workspace/reports', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setSelectedReport(res.data.id)
      setView('detail')
      setTitle('')
      setContent('')
    },
  })

  // 보고서 수정
  const updateReport = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.put<{ data: Report }>(`/workspace/reports/${selectedReport}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', selectedReport] })
      setEditMode(false)
    },
  })

  // CEO에게 보고 (제출)
  const submitReport = useMutation({
    mutationFn: () =>
      api.post<{ data: Report }>(`/workspace/reports/${selectedReport}/submit`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', selectedReport] })
    },
  })

  // 검토 완료 (CEO)
  const reviewReport = useMutation({
    mutationFn: () =>
      api.post<{ data: Report }>(`/workspace/reports/${selectedReport}/review`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['report', selectedReport] })
    },
  })

  // 보고서 삭제
  const deleteReport = useMutation({
    mutationFn: () => api.delete(`/workspace/reports/${selectedReport}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setSelectedReport(null)
      setView('list')
    },
  })

  // 코멘트 작성
  const createComment = useMutation({
    mutationFn: (commentContent: string) =>
      api.post<{ data: Comment }>(`/workspace/reports/${selectedReport}/comments`, {
        content: commentContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportComments', selectedReport] })
      setCommentInput('')
    },
  })

  const reportList = reportsData?.data || []
  const report = reportDetail?.data
  const comments = commentsData?.data || []
  const isMyReport = report?.authorId === user?.id
  const isReceivedReport = report?.submittedTo === user?.id

  // 내가 작성한 보고서 vs 나에게 온 보고서 분리
  const myReports = reportList.filter((r) => r.authorId === user?.id)
  const receivedReports = reportList.filter(
    (r) => r.submittedTo === user?.id && r.authorId !== user?.id,
  )

  const handleOpenDetail = (id: string) => {
    setSelectedReport(id)
    setEditMode(false)
    setView('detail')
  }

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

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'list' && (
            <button
              onClick={() => {
                setView('list')
                setSelectedReport(null)
                setEditMode(false)
              }}
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
      <div className="flex-1 overflow-y-auto">
        {/* === 목록 뷰 === */}
        {view === 'list' && (
          <div className="px-6 py-4 space-y-6">
            {/* 나에게 온 보고서 (CEO) */}
            {receivedReports.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-500 mb-3">받은 보고서</h3>
                <div className="space-y-2">
                  {receivedReports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleOpenDetail(r.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{r.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[r.status]}`}
                          >
                            {statusLabel[r.status]}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {r.authorName} &middot;{' '}
                          {new Date(r.submittedAt || r.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 내 보고서 */}
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-3">내 보고서</h3>
              {myReports.length === 0 ? (
                <p className="text-sm text-zinc-400 py-8 text-center">
                  아직 작성한 보고서가 없습니다
                </p>
              ) : (
                <div className="space-y-2">
                  {myReports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleOpenDetail(r.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{r.title}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[r.status]}`}
                          >
                            {statusLabel[r.status]}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {new Date(r.updatedAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="보고서 내용을 작성하세요..."
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
                onClick={() => setView('list')}
                className="px-5 py-2.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* === 상세 뷰 === */}
        {view === 'detail' && report && (
          <div className="px-6 py-4 max-w-2xl space-y-6">
            {/* 보고서 정보 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[report.status]}`}
                >
                  {statusLabel[report.status]}
                </span>
                <span className="text-xs text-zinc-400">
                  작성: {report.authorName} &middot;{' '}
                  {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {report.submittedAt && (
                  <span className="text-xs text-zinc-400">
                    &middot; 제출: {new Date(report.submittedAt).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>

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
                  <h2 className="text-xl font-bold">{report.title}</h2>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                    {report.content || '(내용 없음)'}
                  </div>
                </>
              )}
            </div>

            {/* 액션 버튼 */}
            {!editMode && (
              <div className="flex gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                {/* 작성자: 초안 → 수정/삭제/제출 */}
                {isMyReport && report.status === 'draft' && (
                  <>
                    <button
                      onClick={handleStartEdit}
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => submitReport.mutate()}
                      disabled={submitReport.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {submitReport.isPending ? '제출 중...' : 'CEO에게 보고'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('보고서를 삭제하시겠습니까?')) deleteReport.mutate()
                      }}
                      className="px-4 py-2 text-red-500 hover:text-red-600 text-sm"
                    >
                      삭제
                    </button>
                  </>
                )}

                {/* CEO: 제출됨 → 검토 완료 */}
                {isReceivedReport && report.status === 'submitted' && (
                  <button
                    onClick={() => reviewReport.mutate()}
                    disabled={reviewReport.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {reviewReport.isPending ? '처리 중...' : '검토 완료'}
                  </button>
                )}
              </div>
            )}

            {/* 코멘트 섹션 (제출 이후만) */}
            {report.status !== 'draft' && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-4">
                <h3 className="text-sm font-medium text-zinc-500">코멘트</h3>

                {comments.length === 0 && (
                  <p className="text-xs text-zinc-400">아직 코멘트가 없습니다</p>
                )}

                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{c.authorName}</span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(c.createdAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}

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
          </div>
        )}
      </div>
    </div>
  )
}
