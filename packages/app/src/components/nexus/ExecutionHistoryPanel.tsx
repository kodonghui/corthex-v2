import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { NexusExecution } from '@corthex/shared'

type Props = {
  workflowId: string
}

function statusBadge(status: string) {
  switch (status) {
    case 'running':
      return <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">실행 중</span>
    case 'completed':
      return <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">완료</span>
    case 'failed':
      return <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">실패</span>
    default:
      return <span className="px-2 py-0.5 rounded text-xs bg-zinc-500/20 text-corthex-text-disabled">{status}</span>
  }
}

function formatTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function ExecutionHistoryPanel({ workflowId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['nexus-executions', workflowId],
    queryFn: () =>
      api.get<{ data: NexusExecution[] }>(`/workspace/nexus/workflows/${workflowId}/executions`),
  })

  const executions = data?.data ?? []

  return (
    <div className="border-t border-zinc-700 bg-corthex-bg/50 max-h-64 overflow-auto">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-corthex-text-disabled">실행 기록</h4>
        <span className="text-xs text-corthex-text-secondary">{executions.length}건</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : executions.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-corthex-text-secondary text-xs">
          아직 실행 기록이 없습니다.
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-corthex-text-secondary border-b border-zinc-800">
              <th className="px-4 py-2 text-left font-medium">상태</th>
              <th className="px-4 py-2 text-left font-medium">시작</th>
              <th className="px-4 py-2 text-left font-medium">완료</th>
              <th className="px-4 py-2 text-left font-medium">결과</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((exec) => {
              const result = exec.result as { message?: string } | null
              return (
                <tr key={exec.id} className="border-b border-zinc-800/50 hover:bg-corthex-surface/30">
                  <td className="px-4 py-2">{statusBadge(exec.status)}</td>
                  <td className="px-4 py-2 text-corthex-text-disabled">{formatTime(exec.startedAt)}</td>
                  <td className="px-4 py-2 text-corthex-text-disabled">{formatTime(exec.completedAt)}</td>
                  <td className="px-4 py-2 text-corthex-text-disabled truncate max-w-48">
                    {result?.message ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
