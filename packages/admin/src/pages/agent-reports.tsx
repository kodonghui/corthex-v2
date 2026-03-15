import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'

// Story 19.5: Admin Agent Reports UI (FR-RM5, NFR-S4)
// Read-only view of AI-generated agent_reports. Separate from /reports (human workflow).

type AgentReport = {
  id: string
  title: string
  type: string | null
  tags: string[]
  createdAt: string
  agentId: string | null
}

type AgentReportDetail = AgentReport & {
  content: string
  runId: string
  distributionResults: Record<string, string> | null
}

const TYPE_COLORS: Record<string, string> = {
  competitor_analysis: 'bg-blue-500/20 text-blue-400',
  market_research: 'bg-emerald-500/20 text-emerald-400',
  ai_analysis: 'bg-purple-500/20 text-purple-400',
}

function typeColor(type: string | null): string {
  if (!type) return 'bg-slate-500/20 text-slate-400'
  return TYPE_COLORS[type] ?? 'bg-amber-500/20 text-amber-400'
}

export function AgentReportsPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')

  const { data: listData, isLoading } = useQuery({
    queryKey: ['agent-reports', selectedCompanyId, typeFilter],
    queryFn: () =>
      api.get<{ data: AgentReport[] }>(
        `/admin/agent-reports${typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : ''}`,
      ),
    enabled: !!selectedCompanyId,
  })

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['agent-report', selectedId],
    queryFn: () => api.get<{ data: AgentReportDetail }>(`/admin/agent-reports/${selectedId}`),
    enabled: !!selectedId,
  })

  const reports = listData?.data ?? []
  const detail = detailData?.data

  function handleDownloadPdf(id: string) {
    window.open(`/api/admin/agent-reports/${id}/pdf`, '_blank')
  }

  if (!selectedCompanyId) {
    return (
      <div className="p-6 text-slate-400 text-sm">
        회사를 선택해 주세요.
      </div>
    )
  }

  return (
    <div className="flex h-full divide-x divide-slate-700">
      {/* Left: Report List */}
      <div className="w-96 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-3">에이전트 리포트</h2>
          <input
            type="text"
            placeholder="타입 필터 (예: competitor_analysis)"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-slate-400 text-sm">로딩 중...</div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              <p>리포트가 없습니다.</p>
              <p className="mt-1 text-xs text-slate-500">
                에이전트에게 save_report 실행을 요청하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <ul>
              {reports.map((r) => (
                <li
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`p-4 cursor-pointer border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors ${selectedId === r.id ? 'bg-slate-800' : ''}`}
                >
                  <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {r.type && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColor(r.type)}`}>
                        {r.type}
                      </span>
                    )}
                    {r.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(r.createdAt).toLocaleString('ko-KR')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right: Report Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            리포트를 선택하세요
          </div>
        ) : detailLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            로딩 중...
          </div>
        ) : detail ? (
          <>
            {/* Detail Header */}
            <div className="p-4 border-b border-slate-700 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white truncate">{detail.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {detail.type && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeColor(detail.type)}`}>
                      {detail.type}
                    </span>
                  )}
                  {detail.tags.map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(detail.createdAt).toLocaleString('ko-KR')}
                  {detail.agentId && ` · Agent ${detail.agentId.slice(0, 8)}...`}
                </p>
              </div>
              <button
                onClick={() => handleDownloadPdf(detail.id)}
                className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                PDF 다운로드
              </button>
            </div>

            {/* Distribution Results */}
            {detail.distributionResults && Object.keys(detail.distributionResults).length > 0 && (
              <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50">
                <p className="text-xs text-slate-400 font-medium mb-1">배포 결과</p>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(detail.distributionResults).map(([channel, status]) => (
                    <span
                      key={channel}
                      className={`text-xs px-2 py-0.5 rounded ${
                        status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {channel}: {status}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {detail.content}
              </pre>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
