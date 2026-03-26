/**
 * Report Lines Page
 *
 * API Endpoints:
 *   GET  /api/admin/report-lines?companyId=...
 *   PUT  /api/admin/report-lines   (bulk save)
 *   POST /api/admin/report-lines   (add single)
 */
import { useState, useEffect } from 'react'
import { UserSearch, UserCog, Plus, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type User = { id: string; name: string; username: string; role: string }
type ReportLine = { id: string; userId: string; reportsToUserId: string | null }

export function ReportLinesPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [lines, setLines] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [newReporter, setNewReporter] = useState('')
  const [newSupervisor, setNewSupervisor] = useState('')

  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', selectedCompanyId],
    queryFn: () => api.get<{ data: User[] }>(`/admin/users?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: reportLineData, isLoading: linesLoading } = useQuery({
    queryKey: ['report-lines', selectedCompanyId],
    queryFn: () => api.get<{ data: ReportLine[] }>(`/admin/report-lines?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const users = userData?.data || []
  const isLoading = usersLoading || linesLoading

  useEffect(() => {
    if (reportLineData?.data) {
      const existing: Record<string, string> = {}
      reportLineData.data.forEach((rl) => {
        if (rl.reportsToUserId) {
          existing[rl.userId] = rl.reportsToUserId
        }
      })
      setLines(existing)
      setHasChanges(false)
    }
  }, [reportLineData])

  const saveMutation = useMutation({
    mutationFn: (data: { companyId: string; lines: { userId: string; reportsToUserId: string | null }[] }) =>
      api.put('/admin/report-lines', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report-lines'] })
      setHasChanges(false)
      addToast({ type: 'success', message: '보고 라인이 저장되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleChange = (userId: string, reportsTo: string) => {
    setLines((prev) => ({ ...prev, [userId]: reportsTo }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!selectedCompanyId) return
    const payload = users
      .filter((u) => lines[u.id])
      .map((u) => ({
        userId: u.id,
        reportsToUserId: lines[u.id],
      }))
    saveMutation.mutate({ companyId: selectedCompanyId, lines: payload })
  }

  const handleAddLine = () => {
    if (!newReporter || !newSupervisor || newReporter === newSupervisor) return
    setLines((prev) => ({ ...prev, [newReporter]: newSupervisor }))
    setHasChanges(true)
    setNewReporter('')
    setNewSupervisor('')
  }

  if (!selectedCompanyId) return <div className="p-8 text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">회사를 선택하세요</div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-corthex-border pb-6">
        <h1 className="text-lg font-bold uppercase tracking-widest text-corthex-text-primary">
          보고 라인 설정
        </h1>
        <p className="text-xs font-mono text-corthex-text-secondary uppercase tracking-wider mt-1">
          Human org reporting hierarchy configuration
        </p>
      </div>

      {/* Add New Line Section */}
      <section className="bg-corthex-surface border border-corthex-border p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">새 보고 라인 추가</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">
              대상 사용자 (Reporter)
            </label>
            <div className="relative">
              <UserSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <select value={newReporter} onChange={(e) => setNewReporter(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-corthex-bg border border-corthex-border text-corthex-text-primary font-mono text-xs focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none appearance-none">
                <option value="">사용자 선택</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">
              직속 상사 (Supervisor)
            </label>
            <div className="relative">
              <UserCog className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <select value={newSupervisor} onChange={(e) => setNewSupervisor(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-corthex-bg border border-corthex-border text-corthex-text-primary font-mono text-xs focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none appearance-none">
                <option value="">상사 선택</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddLine}
              disabled={!newReporter || !newSupervisor || newReporter === newSupervisor}
              className="px-4 py-2 min-h-[44px] text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors w-full md:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              추가
            </button>
          </div>
        </div>
      </section>

      {/* Save success banner */}
      {saveMutation.isSuccess && !hasChanges && (
        <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest">
          저장 완료
        </div>
      )}

      {/* Table */}
      <section className="bg-corthex-surface border border-corthex-border overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-corthex-elevated animate-pulse h-4 w-24" />
                <div className="bg-corthex-elevated animate-pulse h-8 w-48" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-corthex-elevated border-b border-corthex-border">
                <th className="px-3 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">대상 사용자</th>
                <th className="px-3 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">직속 상사</th>
                <th className="px-3 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-corthex-border">
              {users.map((u) => {
                const reportsTo = lines[u.id] || ''
                const reportTarget = users.find((t) => t.id === reportsTo)
                const initial = u.name.charAt(0)

                return (
                  <tr key={u.id} className="hover:bg-corthex-elevated/50 transition-colors">
                    <td className="px-3 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center text-corthex-accent font-bold text-xs font-mono flex-shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold font-mono text-corthex-text-primary uppercase tracking-tight truncate">{u.name}</p>
                          <p className="text-xs font-mono text-corthex-text-disabled truncate">@{u.username} / {u.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-4">
                      {reportTarget ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center text-corthex-accent font-bold text-xs font-mono flex-shrink-0">
                            {reportTarget.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold font-mono text-corthex-text-primary uppercase tracking-tight">{reportTarget.name}</p>
                            <p className="text-xs font-mono text-corthex-text-disabled">@{reportTarget.username}</p>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={reportsTo}
                          onChange={(e) => handleChange(u.id, e.target.value)}
                          className="bg-corthex-bg border border-corthex-border px-3 py-1.5 text-xs font-mono text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none appearance-none"
                        >
                          <option value="">없음 (최상위)</option>
                          {users.filter((t) => t.id !== u.id).map((t) => (
                            <option key={t.id} value={t.id}>{t.name} (@{t.username})</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-4 text-right">
                      <button
                        className="text-corthex-text-disabled hover:text-corthex-error transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        onClick={() => handleChange(u.id, '')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!isLoading && users.length === 0 && (
          <div className="py-12 text-center text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
            직원을 먼저 등록하세요
          </div>
        )}

        <div className="px-3 sm:px-5 py-3 border-t border-corthex-border bg-corthex-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
            전체 {users.length}명 · 보고 라인 {Object.keys(lines).filter((k) => lines[k]).length}개 설정됨
          </p>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-4 py-2 min-h-[44px] text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-40 transition-colors"
            >
              {saveMutation.isPending ? '저장 중...' : '변경사항 저장'}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
