import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, Badge, Button, Skeleton } from '@corthex/ui'

type User = { id: string; name: string; username: string; role: string }
type ReportLine = { id: string; userId: string; reportsToUserId: string | null }

export function ReportLinesPage() {
  const qc = useQueryClient()
  const [lines, setLines] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const { data: companyData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<{ data: { id: string }[] }>('/admin/companies'),
  })
  const companyId = companyData?.data?.[0]?.id

  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => api.get<{ data: User[] }>(`/admin/users?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const { data: reportLineData, isLoading: linesLoading } = useQuery({
    queryKey: ['report-lines', companyId],
    queryFn: () => api.get<{ data: ReportLine[] }>(`/admin/report-lines?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const users = userData?.data || []
  const isLoading = usersLoading || linesLoading

  // 기존 보고 라인 데이터 로드
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
    },
  })

  const handleChange = (userId: string, reportsTo: string) => {
    setLines((prev) => ({ ...prev, [userId]: reportsTo }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!companyId) return
    const payload = users.map((u) => ({
      userId: u.id,
      reportsToUserId: lines[u.id] || null,
    }))
    saveMutation.mutate({ companyId, lines: payload })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">보고 라인</h1>
          <p className="text-sm text-zinc-500 mt-0.5">직원 간 보고 구조를 설정합니다 (H → 상위자)</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          size="sm"
        >
          {saveMutation.isPending ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>

      {saveMutation.isSuccess && !hasChanges && (
        <div className="px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm">
          저장 완료
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">직원</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">역할</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">보고 대상</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">유형</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {users.map((u) => {
                  const reportsTo = lines[u.id] || ''
                  const reportTarget = users.find((t) => t.id === reportsTo)

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.name}</p>
                          <p className="text-xs text-zinc-500">@{u.username}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>{u.role}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={reportsTo}
                          onChange={(e) => handleChange(u.id, e.target.value)}
                          className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
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
                          <span className="text-xs text-zinc-500">→ {reportTarget.name}</span>
                        ) : (
                          <Badge variant="info">최상위</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {!isLoading && users.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              직원을 먼저 등록하세요
            </div>
          )}
        </CardContent>
      </Card>

      <div className="px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500 space-y-1">
        <p>보고 라인은 보고서 전달 경로와 비서 오케스트레이션에 사용됩니다.</p>
        <p>"없음 (최상위)"으로 설정된 직원은 보고 체계의 최상위에 위치합니다.</p>
      </div>
    </div>
  )
}
