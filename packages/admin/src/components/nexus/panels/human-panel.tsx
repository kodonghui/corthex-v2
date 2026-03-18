import { Badge } from '@corthex/ui'
import type { OrgAgent, OrgEmployee } from '../../../lib/elk-layout'

const ROLE_BADGE: Record<string, { bg: string; label: string }> = {
  ceo: { bg: 'bg-yellow-800 text-yellow-200', label: 'CEO' },
  admin: { bg: 'bg-purple-800 text-purple-200', label: 'Admin' },
  user: { bg: 'bg-slate-700 text-slate-300', label: 'Staff' },
}

export function HumanPanel({
  employee,
  ownedAgents,
  onSelectNode,
}: {
  employee: OrgEmployee
  ownedAgents: OrgAgent[]
  onSelectNode?: (nodeId: string) => void
}) {
  const role = ROLE_BADGE[employee.role] ?? ROLE_BADGE.user

  return (
    <div className="space-y-4" data-testid="human-panel">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded bg-purple-500 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-slate-100 truncate flex-1">{employee.name}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${role.bg}`}>{role.label}</span>
        <Badge variant="default">@{employee.username}</Badge>
      </div>

      <div className="border-b border-slate-800" />

      {/* CLI Token */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">CLI 토큰</label>
        <div className="mt-1 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${employee.hasCliToken ? 'bg-emerald-500' : 'bg-slate-600'}`} />
          <span className="text-sm text-slate-300">
            {employee.hasCliToken ? '등록됨' : '미등록'}
          </span>
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">역할</label>
        <p className="mt-1 text-sm text-slate-300">{role.label}</p>
      </div>

      <div className="border-b border-slate-800" />

      {/* Owned agents */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">소유 AI 에이전트 ({ownedAgents.length})</label>
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {ownedAgents.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectNode?.(`agent-${a.id}`)}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <span className="text-xs text-slate-300 truncate">{a.name}</span>
              <span className="text-[10px] text-slate-600 ml-auto">{a.tier}</span>
            </button>
          ))}
          {ownedAgents.length === 0 && (
            <p className="text-xs text-slate-600 py-2">소유한 에이전트 없음</p>
          )}
        </div>
      </div>

      <div className="border-b border-slate-800" />

      {/* Link to employee management */}
      <div>
        <a
          href="/admin/employees"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#8fae7a] hover:text-[#a3c48a] underline"
        >
          직원 관리에서 편집 →
        </a>
      </div>
    </div>
  )
}
