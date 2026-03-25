import { useEffect, useCallback } from 'react'
import type { OrgChartData, OrgAgent, OrgEmployee } from '../../lib/elk-layout'
import { AgentPanel } from './panels/agent-panel'
import { DepartmentPanel } from './panels/department-panel'
import { HumanPanel } from './panels/human-panel'
import { CompanyPanel } from './panels/company-panel'

/** Parse a ReactFlow node ID into type + entity UUID */
export function parseNodeId(nodeId: string): { type: 'agent' | 'department' | 'human' | 'company' | null; id: string } {
  if (nodeId.startsWith('agent-')) return { type: 'agent', id: nodeId.slice(6) }
  if (nodeId.startsWith('dept-')) return { type: 'department', id: nodeId.slice(5) }
  if (nodeId.startsWith('human-')) return { type: 'human', id: nodeId.slice(6) }
  if (nodeId.startsWith('company-')) return { type: 'company', id: nodeId.slice(8) }
  return { type: null, id: '' }
}

/** Find an agent across all departments + unassigned */
export function findAgent(org: OrgChartData, agentId: string): OrgAgent | undefined {
  for (const d of org.departments) {
    const found = d.agents.find((a) => a.id === agentId)
    if (found) return found
  }
  return org.unassignedAgents.find((a) => a.id === agentId)
}

/** Collect all agents from org data */
export function getAllAgents(org: OrgChartData): OrgAgent[] {
  return [...org.departments.flatMap((d) => d.agents), ...org.unassignedAgents]
}

/** Find an employee across all departments + unassigned */
export function findEmployee(org: OrgChartData, userId: string): OrgEmployee | undefined {
  for (const d of org.departments) {
    const found = d.employees?.find((e) => e.id === userId)
    if (found) return found
  }
  return org.unassignedEmployees?.find((e) => e.id === userId)
}

type PropertyPanelProps = {
  selectedNodeId: string | null
  orgData: OrgChartData
  onClose: () => void
  onSelectNode?: (nodeId: string) => void
}

export function PropertyPanel({ selectedNodeId, orgData, onClose, onSelectNode }: PropertyPanelProps) {
  // Esc to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!selectedNodeId) return null

  const parsed = parseNodeId(selectedNodeId)
  if (!parsed.type) return null

  let panelContent: React.ReactNode = null
  let panelTitle = ''

  switch (parsed.type) {
    case 'agent': {
      const agent = findAgent(orgData, parsed.id)
      if (!agent) break
      panelTitle = '에이전트 속성'
      panelContent = <AgentPanel agent={agent} />
      break
    }
    case 'department': {
      const dept = orgData.departments.find((d) => d.id === parsed.id)
      if (!dept) break
      panelTitle = '부서 속성'
      panelContent = <DepartmentPanel department={dept} onSelectNode={onSelectNode} />
      break
    }
    case 'human': {
      const employee = findEmployee(orgData, parsed.id)
      if (!employee) break
      const allAgents = getAllAgents(orgData)
      const ownedAgents = allAgents.filter((a) => a.ownerUserId === parsed.id)
      panelTitle = '직원 속성'
      panelContent = <HumanPanel employee={employee} ownedAgents={ownedAgents} onSelectNode={onSelectNode} />
      break
    }
    case 'company': {
      panelTitle = '회사 정보'
      panelContent = <CompanyPanel orgData={orgData} />
      break
    }
  }

  if (!panelContent) {
    return (
      <div className="w-80 bg-corthex-bg border-l border-corthex-border h-full p-4" data-testid="property-panel">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-corthex-text-secondary">속성</span>
          <button onClick={onClose} className="text-corthex-text-secondary hover:text-corthex-text-disabled text-sm">✕</button>
        </div>
        <p className="text-xs text-corthex-text-secondary">선택한 노드의 데이터를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div
      className="w-80 bg-corthex-bg border-l border-corthex-border h-full overflow-y-auto flex-shrink-0"
      data-testid="property-panel"
    >
      {/* Panel header with close */}
      <div className="sticky top-0 bg-corthex-bg border-b border-corthex-border px-4 py-3 flex items-center justify-between z-10">
        <span className="text-xs font-medium text-corthex-text-disabled uppercase tracking-wide">{panelTitle}</span>
        <button
          onClick={onClose}
          className="text-corthex-text-secondary hover:text-corthex-text-disabled text-sm transition-colors"
          aria-label="패널 닫기"
          data-testid="panel-close-btn"
        >
          ✕
        </button>
      </div>
      {/* Panel body */}
      <div className="p-4">
        {panelContent}
      </div>
    </div>
  )
}
