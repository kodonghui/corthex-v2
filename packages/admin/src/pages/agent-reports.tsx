import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { Search, Download, FileText, Shield, Settings, X, AlertTriangle } from 'lucide-react'

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

const TYPE_ICON: Record<string, typeof Search> = {
  competitor_analysis: Search,
  market_research: FileText,
  ai_analysis: Shield,
  security: Shield,
  compliance: Settings,
  operational: Settings,
}

function typeLabel(type: string | null): string {
  if (!type) return 'GENERAL'
  return type.replace(/_/g, ' ').toUpperCase()
}

function typeClass(type: string | null): string {
  if (!type) return 'bg-corthex-elevated text-corthex-text-disabled border-corthex-border'
  const map: Record<string, string> = {
    competitor_analysis: 'bg-corthex-accent-muted text-corthex-accent border-corthex-border',
    market_research: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ai_analysis: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    security: 'bg-corthex-accent-muted text-corthex-accent border-corthex-border',
    compliance: 'bg-corthex-elevated text-corthex-text-secondary border-corthex-border',
  }
  return map[type] ?? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
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
      <div className="p-8 text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
        회사를 선택해 주세요.
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-full relative">
      {/* Main Table Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Utility Bar */}
        <div className="px-4 lg:px-6 py-4 border-b border-corthex-border bg-corthex-surface flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 flex-1 w-full sm:max-w-xs">
            <label className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
              Report Classification
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-corthex-text-disabled" />
              <input
                type="text"
                placeholder="FILTER BY TYPE..."
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-corthex-elevated border-b-2 border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-base sm:text-xs py-2 pl-8 pr-3 focus:ring-0 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="ml-auto text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
            Archive_v2.0.4
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-corthex-elevated border-b border-corthex-border">
                <th className="px-3 lg:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Title</th>
                <th className="px-3 lg:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary hidden sm:table-cell">Type</th>
                <th className="px-3 lg:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary hidden lg:table-cell">Generated</th>
                <th className="px-3 lg:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary hidden lg:table-cell">Tags</th>
                <th className="px-3 lg:px-5 py-3 text-xs font-bold uppercase tracking-widest text-corthex-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-corthex-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs font-mono text-corthex-text-disabled uppercase tracking-widest animate-pulse">
                    Loading...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-corthex-text-disabled" />
                      <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">No reports found</p>
                      <p className="text-xs text-corthex-text-disabled mt-1">
                        에이전트에게 save_report 실행을 요청하면 여기에 표시됩니다.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : reports.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`group cursor-pointer border-l-2 transition-colors hover:bg-corthex-elevated/50 ${
                    selectedId === r.id
                      ? 'bg-corthex-accent-muted border-l-corthex-accent'
                      : 'border-l-transparent hover:border-l-corthex-border'
                  }`}
                >
                  <td className="px-3 lg:px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedId === r.id ? 'bg-corthex-accent' : 'bg-corthex-border'}`} />
                      <span className="text-sm font-bold text-corthex-text-primary font-mono uppercase tracking-tight truncate max-w-[200px] lg:max-w-xs">
                        {r.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 lg:px-5 py-4 hidden sm:table-cell">
                    {r.type && (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-bold font-mono uppercase tracking-widest ${typeClass(r.type)}`}>
                        {typeLabel(r.type)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 lg:px-5 py-4 text-xs font-mono text-corthex-text-disabled hidden lg:table-cell">
                    {new Date(r.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-3 lg:px-5 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {r.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-corthex-elevated text-corthex-text-disabled font-mono border border-corthex-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 lg:px-5 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownloadPdf(r.id) }}
                      className="text-corthex-text-disabled hover:text-corthex-accent transition-colors p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-corthex-border bg-corthex-elevated flex items-center justify-between">
          <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
            DISPLAYING {reports.length} RECORDS
          </p>
        </div>
      </div>

      {/* Detail Panel (slide-in from right, full overlay on mobile) */}
      {selectedId && (
        <div className="fixed inset-0 lg:static lg:inset-auto w-full lg:w-[440px] border-l-0 lg:border-l border-corthex-border bg-corthex-surface flex flex-col overflow-hidden z-20 lg:z-auto">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center text-xs font-mono text-corthex-text-disabled uppercase tracking-widest animate-pulse">
              Loading...
            </div>
          ) : detail ? (
            <>
              {/* Detail Header */}
              <div className="px-4 lg:px-5 py-4 border-b border-corthex-border bg-corthex-elevated flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-corthex-text-primary font-mono truncate">
                    {detail.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {detail.type && (
                      <span className={`px-1.5 py-0.5 border text-xs font-bold font-mono uppercase tracking-widest ${typeClass(detail.type)}`}>
                        {typeLabel(detail.type)}
                      </span>
                    )}
                    {detail.tags.map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-corthex-elevated text-corthex-text-disabled font-mono border border-corthex-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-mono text-corthex-text-disabled mt-1.5 uppercase tracking-widest">
                    {new Date(detail.createdAt).toLocaleString('ko-KR')}
                    {detail.agentId && ` · ${detail.agentId.slice(0, 8)}...`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadPdf(detail.id)}
                    className="px-3 py-2 min-h-[44px] bg-corthex-accent text-corthex-text-on-accent text-xs font-bold uppercase tracking-widest transition-colors hover:bg-corthex-accent-hover"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-corthex-text-disabled hover:text-corthex-text-primary transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Distribution Results */}
              {detail.distributionResults && Object.keys(detail.distributionResults).length > 0 && (
                <div className="px-5 py-2.5 border-b border-corthex-border bg-corthex-elevated/50">
                  <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1.5">배포 결과</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(detail.distributionResults).map(([channel, status]) => (
                      <span
                        key={channel}
                        className={`text-xs px-2 py-0.5 border font-mono uppercase tracking-widest ${
                          status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-corthex-error border-red-500/20'
                        }`}
                      >
                        {channel}: {status}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <pre className="text-xs text-corthex-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                  {detail.content}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-corthex-text-disabled mx-auto mb-2" />
                <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">Report not found</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
