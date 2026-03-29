/**
 * Story 25.4: CEO n8n Workflow Results View (Read-Only)
 *
 * FR-N8N2: CEO app can view n8n workflow execution results in read-only mode
 * FR-N8N5: On n8n failure, displays "Workflow service temporarily suspended"
 * UXR119: Workflow list with active/inactive toggle, last execution, next scheduled
 * UXR121: Error handling — OOM, API failure, timeout
 *
 * API: GET /api/admin/n8n/workflows, GET /api/admin/n8n/executions, GET /api/admin/n8n/health
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Workflow,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity,
  TrendingUp,
  Plus,
  Pencil,
  Minimize2,
  Terminal,
  Globe,
} from 'lucide-react'
import { api } from '../lib/api'

// === Types ===

interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  tags?: Array<{ name: string }>
}

interface N8nExecution {
  id: string
  workflowId: string
  status: 'success' | 'error' | 'running' | 'waiting'
  startedAt: string
  stoppedAt?: string
  mode: string
  workflowData?: { name: string }
}

interface N8nHealthStatus {
  available: boolean
  url: string
  status?: string
  responseTimeMs?: number
  error?: string
}

// === API Hooks ===

function useN8nHealth() {
  return useQuery({
    queryKey: ['n8n', 'health'],
    queryFn: () => api.get<{ data: N8nHealthStatus }>('/admin/n8n/health'),
    refetchInterval: 30_000,
  })
}

function useN8nWorkflows() {
  return useQuery({
    queryKey: ['n8n', 'workflows'],
    queryFn: () => api.get<{ data: { data: N8nWorkflow[] } }>('/admin/n8n/workflows'),
    retry: 1,
  })
}

function useN8nExecutions(workflowId?: string) {
  return useQuery({
    queryKey: ['n8n', 'executions', workflowId],
    queryFn: () => {
      const params = workflowId ? `?workflowId=${workflowId}&limit=20` : '?limit=20'
      return api.get<{ data: { data: N8nExecution[] } }>(`/admin/n8n/executions${params}`)
    },
    retry: 1,
  })
}

// === Status helpers ===

const STATUS_CONFIG = {
  success: { label: 'SUCCESS', icon: CheckCircle2, color: 'text-corthex-success', bg: 'bg-corthex-success/10' },
  error: { label: 'ERROR', icon: XCircle, color: 'text-corthex-error', bg: 'bg-corthex-error/10' },
  running: { label: 'RUNNING', icon: RefreshCw, color: 'text-corthex-info', bg: 'bg-corthex-info/10' },
  waiting: { label: 'WAITING', icon: Clock, color: 'text-corthex-warning', bg: 'bg-corthex-warning/10' },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatDuration(start: string, end?: string) {
  if (!end) return '진행중'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`
}

// === Components ===

function ServiceSuspendedBanner() {
  return (
    <div className="border border-corthex-warning/30 bg-corthex-warning/10 p-4 rounded flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-corthex-warning shrink-0" />
      <div>
        <p className="font-medium text-corthex-text-primary text-sm">워크플로우 서비스 일시 중단</p>
        <p className="text-xs text-corthex-text-secondary mt-0.5">
          n8n 서비스가 일시적으로 중단되었습니다. 자동 재시작 중입니다.
        </p>
      </div>
    </div>
  )
}

function WorkflowRow({ workflow, selected, onClick }: {
  workflow: N8nWorkflow
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`grid items-center px-6 py-5 border-b border-corthex-border/50 hover:bg-corthex-elevated/40 transition-colors cursor-pointer group ${
        selected ? 'bg-corthex-accent/5 border-l-2 border-l-corthex-accent' : 'bg-corthex-surface/20'
      }`}
      style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 80px' }}
    >
      {/* Name + Trigger */}
      <div className="flex flex-col gap-1">
        <span className="text-corthex-text-primary font-bold tracking-tight text-sm">{workflow.name}</span>
        <span className="text-[10px] font-mono text-corthex-text-secondary flex items-center gap-1 uppercase">
          <Clock className="w-3 h-3" /> Scheduled
        </span>
      </div>
      {/* Status Toggle */}
      <div>
        <div className="flex items-center gap-2">
          <div
            className={`relative w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${
              workflow.active ? 'bg-corthex-accent' : 'bg-corthex-elevated'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full transition-transform ${
                workflow.active ? 'bg-corthex-text-on-accent translate-x-4' : 'bg-corthex-border-strong'
              }`}
            />
          </div>
          <span className={`text-[10px] font-mono uppercase ${
            workflow.active ? 'text-corthex-accent' : 'text-corthex-text-disabled'
          }`}>
            {workflow.active ? 'Active' : 'Standby'}
          </span>
        </div>
      </div>
      {/* Last Execution */}
      <div className="font-mono text-xs text-corthex-text-secondary tracking-tighter">
        {formatDate(workflow.updatedAt)}
      </div>
      {/* Health Bar */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-corthex-elevated overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full ${workflow.active ? 'bg-corthex-accent' : 'bg-corthex-border-strong'}`}
              style={{ width: workflow.active ? '98%' : '0%' }}
            />
          </div>
          <span className="font-mono text-[10px] text-corthex-text-secondary">
            {workflow.active ? '98%' : 'N/A'}
          </span>
        </div>
      </div>
      {/* Action */}
      <div className="flex justify-end">
        <button className="p-1.5 border border-corthex-border text-corthex-text-disabled hover:text-corthex-text-primary hover:border-corthex-border-strong rounded transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function ExecutionLogItem({ execution }: { execution: N8nExecution }) {
  const config = STATUS_CONFIG[execution.status] || STATUS_CONFIG.waiting
  const statusColors: Record<string, string> = {
    success: 'text-corthex-success',
    error: 'text-corthex-error',
    running: 'text-corthex-info',
    waiting: 'text-corthex-text-secondary',
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-corthex-text-disabled text-[10px] font-mono">
        <span>{formatDate(execution.startedAt)}</span>
        <span className={statusColors[execution.status] ?? 'text-corthex-text-secondary'}>
          [{config.label}]
        </span>
      </div>
      <p className={`text-[11px] font-mono break-all border-l pl-3 py-1 ${
        execution.status === 'error'
          ? 'text-corthex-error/80 border-corthex-error/30 bg-corthex-error/5'
          : 'text-corthex-text-secondary border-corthex-border'
      }`}>
        {execution.workflowData?.name || `실행 #${execution.id.slice(-6)}`}
        {' · '}
        {formatDuration(execution.startedAt, execution.stoppedAt)}
      </p>
    </div>
  )
}

// === Main Page ===

export function N8nWorkflowsPage() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)

  const { data: healthData } = useN8nHealth()
  const { data: workflowsData, isLoading: wfLoading, error: wfError } = useN8nWorkflows()
  const { data: execData, isLoading: execLoading } = useN8nExecutions(selectedWorkflowId ?? undefined)

  const health = healthData?.data
  const isUnavailable = health && !health.available
  const workflows = workflowsData?.data?.data ?? []
  const executions = execData?.data?.data ?? []

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 lg:px-8 py-4 border-b border-corthex-border bg-corthex-surface/50 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-corthex-text-disabled" />
            <input
              className="bg-corthex-elevated border border-corthex-border rounded text-base sm:text-sm pl-10 pr-4 py-2 sm:py-1.5 w-full sm:w-64 text-corthex-text-secondary placeholder:text-corthex-text-disabled focus:outline-none focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent"
              placeholder="Filter active workflows..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          {health && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${health.available ? 'bg-corthex-success' : 'bg-corthex-error'}`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-corthex-text-secondary">
                {health.available ? `System Nominal (${health.responseTimeMs}ms)` : 'n8n 중단됨'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Content Canvas */}
      <div className="flex-1 p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8 min-h-0">
        {/* Left: Workflow Inventory */}
        <div className="flex-1 flex flex-col space-y-4 lg:space-y-6 min-w-0">
          {/* FR-N8N5: Service suspended banner */}
          {isUnavailable && <ServiceSuspendedBanner />}

          {/* UXR121: Error state */}
          {wfError && !isUnavailable && (
            <div className="border border-corthex-error/30 bg-corthex-error/10 p-4 rounded">
              <p className="text-sm text-corthex-error">워크플로우 목록을 불러올 수 없습니다.</p>
            </div>
          )}

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-corthex-text-primary">WORKFLOWS</h2>
              <p className="text-xs font-mono text-corthex-text-secondary uppercase tracking-widest mt-1">
                {wfLoading ? 'Loading...' : `Found ${workflows.length} automated sequences`}
              </p>
            </div>
            <button className="bg-corthex-accent text-corthex-text-on-accent font-black px-6 py-2.5 min-h-[44px] w-full sm:w-auto justify-center flex items-center gap-2 hover:bg-corthex-accent-hover transition-colors text-xs tracking-tighter uppercase rounded">
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
          </div>

          {/* Table — Desktop */}
          <div className="hidden lg:block border border-corthex-border rounded overflow-hidden">
            {/* Table Header */}
            <div
              className="px-6 py-3 bg-corthex-elevated/30 border-b border-corthex-border text-[10px] font-mono text-corthex-text-disabled uppercase tracking-[0.2em]"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 80px' }}
            >
              <div>Identification / Trigger</div>
              <div>Status</div>
              <div>Last Execution</div>
              <div>Health</div>
              <div className="text-right">Action</div>
            </div>

            {/* UXR119: Workflow list */}
            {wfLoading ? (
              <div className="space-y-px">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-corthex-surface/20 animate-pulse border-b border-corthex-border/50" />
                ))}
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-12 text-corthex-text-disabled">
                <Workflow className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">등록된 워크플로우가 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-corthex-border/30">
                {workflows.map((wf) => (
                  <WorkflowRow
                    key={wf.id}
                    workflow={wf}
                    selected={selectedWorkflowId === wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cards — Mobile */}
          <div className="lg:hidden space-y-3">
            {wfLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-corthex-surface/20 animate-pulse rounded-lg border border-corthex-border/50" />
              ))
            ) : workflows.length === 0 ? (
              <div className="text-center py-12 text-corthex-text-disabled">
                <Workflow className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">등록된 워크플로우가 없습니다</p>
              </div>
            ) : (
              workflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedWorkflowId === wf.id
                      ? 'bg-corthex-accent/5 border-corthex-accent'
                      : 'bg-corthex-surface/20 border-corthex-border hover:bg-corthex-elevated/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-corthex-text-primary font-bold text-sm">{wf.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${wf.active ? 'bg-corthex-accent' : 'bg-corthex-elevated'}`} />
                      <span className={`text-[10px] font-mono uppercase ${wf.active ? 'text-corthex-accent' : 'text-corthex-text-disabled'}`}>
                        {wf.active ? 'Active' : 'Standby'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-corthex-text-secondary font-mono">{formatDate(wf.updatedAt)}</span>
                    <span className="font-mono text-corthex-text-secondary">{wf.active ? '98%' : 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="bg-corthex-elevated/40 border border-corthex-border p-6 flex flex-col justify-between aspect-video rounded">
              <span className="text-[10px] font-mono text-corthex-text-disabled uppercase tracking-widest">
                Total Executions
              </span>
              <div>
                <div className="text-4xl font-black text-corthex-text-primary">{executions.length > 0 ? executions.length : '—'}</div>
                <div className="text-[10px] font-mono text-corthex-text-disabled mt-1 uppercase">
                  Recorded Runs
                </div>
              </div>
            </div>
            <div className="bg-corthex-elevated/40 border border-corthex-border p-6 flex flex-col justify-between aspect-video rounded">
              <span className="text-[10px] font-mono text-corthex-text-disabled uppercase tracking-widest">
                Active Workflows
              </span>
              <div>
                <div className="text-4xl font-black text-corthex-text-primary">{workflows.filter(w => w.active).length > 0 ? workflows.filter(w => w.active).length : '—'}</div>
                <div className="text-[10px] font-mono text-corthex-text-disabled mt-1 uppercase">
                  Currently Running
                </div>
              </div>
            </div>
            <div className={`p-6 flex flex-col justify-between aspect-video rounded border ${
              health?.available ? 'bg-corthex-accent/5 border-corthex-accent/20' : 'bg-corthex-elevated/40 border-corthex-border'
            }`}>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${health?.available ? 'text-corthex-accent' : 'text-corthex-text-disabled'}`}>System Health</span>
              <div>
                <div className={`text-4xl font-black ${health?.available ? 'text-corthex-accent' : 'text-corthex-text-disabled'}`}>
                  {health ? (health.available ? 'OK' : 'DOWN') : '—'}
                </div>
                <div className="text-[10px] font-mono text-corthex-text-secondary mt-1 uppercase tracking-tighter">
                  {health?.responseTimeMs ? `${health.responseTimeMs}ms response` : 'n8n Service'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Execution Stream */}
        <aside className="w-full lg:w-96 flex flex-col bg-corthex-surface border border-corthex-border rounded overflow-hidden shrink-0">
          <div className="p-4 border-b border-corthex-border flex items-center justify-between bg-corthex-elevated/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-corthex-accent animate-pulse rounded-full" />
              <h3 className="font-mono text-[11px] font-bold text-corthex-text-primary uppercase tracking-widest">
                {selectedWorkflowId ? '실행 결과' : 'Live Execution Stream'}
              </h3>
            </div>
            <button className="text-corthex-text-disabled hover:text-corthex-text-secondary">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* FR-N8N2: Execution results (read-only) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] max-h-64 lg:max-h-none">
            {execLoading ? (
              <div className="flex flex-col items-center justify-center h-32 text-corthex-text-disabled">
                <RefreshCw className="w-5 h-5 mb-2 animate-spin" />
                <p>로딩 중...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-corthex-text-disabled">
                <Play className="w-7 h-7 mb-2 opacity-30" />
                <p>실행 기록이 없습니다</p>
              </div>
            ) : (
              executions.map((exec) => (
                <ExecutionLogItem key={exec.id} execution={exec} />
              ))
            )}
          </div>

          <div className="p-4 border-t border-corthex-border bg-corthex-elevated/30 flex items-center gap-3">
            <Terminal className="w-4 h-4 text-corthex-text-disabled" />
            <input
              className="bg-transparent border-none p-0 text-base sm:text-[10px] font-mono text-corthex-text-secondary focus:ring-0 focus:outline-none placeholder:text-corthex-text-disabled w-full"
              placeholder="Send command to kernel..."
              type="text"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
