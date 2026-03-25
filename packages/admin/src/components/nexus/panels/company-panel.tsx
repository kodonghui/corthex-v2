import { Badge } from '@corthex/ui'
import type { OrgChartData } from '../../../lib/elk-layout'

export function CompanyPanel({ orgData }: { orgData: OrgChartData }) {
  const { company, departments, unassignedAgents, unassignedEmployees } = orgData
  const totalAgents = departments.reduce((s, d) => s + d.agents.length, 0) + unassignedAgents.length
  const totalEmployees = departments.reduce((s, d) => s + (d.employees?.length ?? 0), 0) + (unassignedEmployees?.length ?? 0)

  // Generate initials
  const initials = company.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-4" data-testid="company-panel">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-corthex-elevated flex items-center justify-center text-sm font-bold text-corthex-text-disabled">
          {initials}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-corthex-text-primary">{company.name}</h3>
          <p className="text-[10px] text-corthex-text-secondary">{company.slug}</p>
        </div>
      </div>

      <div className="border-b border-corthex-border" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="부서" value={departments.length} />
        <StatCard label="에이전트" value={totalAgents} />
        <StatCard label="직원" value={totalEmployees} />
      </div>

      <div className="border-b border-corthex-border" />

      {/* Department list */}
      <div>
        <label className="text-xs text-corthex-text-secondary uppercase tracking-wide">부서 목록</label>
        <div className="mt-2 space-y-1.5">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center gap-2 px-2 py-1.5">
              <span className="w-1.5 h-1.5 rounded bg-corthex-accent" />
              <span className="text-xs text-corthex-text-disabled truncate flex-1">{d.name}</span>
              <Badge variant="default">{d.agents.length}</Badge>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-xs text-corthex-text-secondary py-2">부서 없음</p>
          )}
        </div>
      </div>

      <div className="border-b border-corthex-border" />

      {/* Link to settings */}
      <div>
        <a
          href="/admin/settings"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-corthex-accent-hover hover:text-corthex-accent-hover underline"
        >
          회사 설정 →
        </a>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-corthex-surface/50 rounded-lg px-3 py-2 text-center">
      <p className="text-lg font-bold text-corthex-text-primary">{value}</p>
      <p className="text-[10px] text-corthex-text-secondary">{label}</p>
    </div>
  )
}
