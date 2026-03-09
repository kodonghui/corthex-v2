import { useState, useEffect } from 'react'
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
    const payload = users.map((u) => ({
      userId: u.id,
      reportsToUserId: lines[u.id] || null,
    }))
    saveMutation.mutate({ companyId: selectedCompanyId, lines: payload })
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-slate-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" data-testid="report-lines-header">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">보고 라인</h1>
          <p className="text-sm text-slate-400 mt-0.5">직원 간 보고 구조를 설정합니다 (H → 상위자)</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          {saveMutation.isPending ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>

      {saveMutation.isSuccess && !hasChanges && (
        <div data-testid="report-lines-success" className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          저장 완료
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-slate-700 animate-pulse rounded h-4 w-24" />
                <div className="bg-slate-700 animate-pulse rounded h-8 w-20" />
                <div className="bg-slate-700 animate-pulse rounded h-8 w-48" />
                <div className="bg-slate-700 animate-pulse rounded-full h-5 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">직원</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">역할</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">보고 대상</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-5 py-3">유형</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map((u) => {
                const reportsTo = lines[u.id] || ''
                const reportTarget = users.find((t) => t.id === reportsTo)

                return (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-50">{u.name}</p>
                        <p className="text-xs text-slate-500 font-mono">@{u.username}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={reportsTo}
                        onChange={(e) => handleChange(u.id, e.target.value)}
                        className="bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-1.5 text-sm text-white outline-none transition-colors"
                      >
                        <option value="">없음 (최상위)</option>
                        {users
                          .filter((t) => t.id !== u.id)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} (@{t.username})
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      {reportTarget ? (
                        <span className="text-xs text-slate-400">→ {reportTarget.name}</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">최상위</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!isLoading && users.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            직원을 먼저 등록하세요
          </div>
        )}
      </div>

      <div className="px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-xs text-slate-500 space-y-1">
        <p>보고 라인은 보고서 전달 경로와 비서 오케스트레이션에 사용됩니다.</p>
        <p>"없음 (최상위)"으로 설정된 직원은 보고 체계의 최상위에 위치합니다.</p>
      </div>
    </div>
  )
}
