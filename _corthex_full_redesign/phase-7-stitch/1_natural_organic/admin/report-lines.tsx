/**
 * Report Lines Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET  /api/admin/report-lines?companyId=...
 *   PUT  /api/admin/report-lines   (bulk save)
 *   POST /api/admin/report-lines   (add single)
 */
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
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ fontFamily: "'Public Sans', sans-serif", color: '#3f3e3a' }}>
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span>Admin</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="font-medium" style={{ color: '#3f3e3a' }}>보고 라인 설정</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Noto Serif KR', serif", color: '#3f3e3a' }}>보고 라인 설정</h2>
          <p className="text-slate-600 max-w-2xl leading-relaxed">
            휴먼 사용자의 조직 내 보고 체계를 설정합니다. 이 설정은 보고서 제출 대상 결정에 사용됩니다.
            직속 상사는 하위 사용자의 성과를 관리하고 보고서를 승인할 권한을 가집니다.
          </p>
        </div>

        {/* Add New Line Row (Inline Form) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4" style={{ fontFamily: "'Noto Serif KR', serif" }}>새 보고 라인 추가</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">대상 사용자 (Reporter)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person_search</span>
                <select
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm"
                  style={{ outlineColor: '#5a7247' }}
                >
                  <option value="">사용자 선택</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">직속 상사 (Supervisor)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">manage_accounts</span>
                <select
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm"
                  style={{ outlineColor: '#5a7247' }}
                >
                  <option value="">상사 선택</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={!hasChanges || saveMutation.isPending}
                className="text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 h-[38px] disabled:opacity-50"
                style={{ backgroundColor: '#5a7247' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(90,114,71,0.9)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#5a7247')}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                {saveMutation.isPending ? '저장 중...' : '보고 라인 추가'}
              </button>
            </div>
          </div>
        </div>

        {saveMutation.isSuccess && !hasChanges && (
          <div className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm mb-6">
            저장 완료
          </div>
        )}

        {/* Table Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-slate-200 animate-pulse rounded h-4 w-24" />
                  <div className="bg-slate-200 animate-pulse rounded h-8 w-48" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">대상 사용자 (Reporter)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">직속 상사 (Supervisor)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const reportsTo = lines[u.id] || ''
                  const reportTarget = users.find((t) => t.id === reportsTo)
                  const initial = u.name.charAt(0)

                  return (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-8 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#5a7247' }}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#3f3e3a' }}>{u.name}</p>
                            <p className="text-xs text-slate-500">@{u.username} / {u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {reportTarget ? (
                          <div className="flex items-center gap-3">
                            <div
                              className="size-8 rounded-full flex items-center justify-center font-bold text-xs"
                              style={{ backgroundColor: 'rgba(212,168,67,0.1)', color: '#d4a843' }}
                            >
                              {reportTarget.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#3f3e3a' }}>{reportTarget.name}</p>
                              <p className="text-xs text-slate-500">@{reportTarget.username}</p>
                            </div>
                          </div>
                        ) : (
                          <select
                            value={reportsTo}
                            onChange={(e) => handleChange(u.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors"
                            style={{ color: '#3f3e3a' }}
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
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-slate-400 p-2 transition-colors"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#c4622d')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          onClick={() => handleChange(u.id, '')}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
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

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">전체 {users.length}개의 보고 라인이 설정됨</p>
            <div className="flex gap-2">
              <button className="p-1 text-slate-400 transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-1 text-slate-400 transition-colors" style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer / API Info */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
          <p>&copy; 2024 CORTHEX v2. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="bg-slate-100 px-2 py-1 rounded">GET /api/admin/report-lines</span>
            <span className="bg-slate-100 px-2 py-1 rounded">POST /api/admin/report-lines</span>
          </div>
        </div>
      </div>
    </div>
  )
}
