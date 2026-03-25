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
  success: { label: '성공', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  error: { label: '실패', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  running: { label: '실행중', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
  waiting: { label: '대기', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
      <div>
        <p className="font-medium text-amber-800">워크플로우 서비스 일시 중단</p>
        <p className="text-sm text-amber-600 mt-1">
          n8n 서비스가 일시적으로 중단되었습니다. 자동 재시작 중입니다.
        </p>
      </div>
    </div>
  )
}

function WorkflowCard({ workflow, selected, onClick }: {
  workflow: N8nWorkflow
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        selected
          ? 'border-olive-500 bg-olive-50'
          : 'border-sand-200 hover:border-sand-300 bg-corthex-surface'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-olive-600" />
          <span className="font-medium text-stone-800">{workflow.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          workflow.active
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-stone-100 text-stone-500'
        }`}>
          {workflow.active ? '활성' : '비활성'}
        </span>
      </div>
      <p className="text-xs text-stone-500 mt-2">
        마지막 수정: {formatDate(workflow.updatedAt)}
      </p>
    </button>
  )
}

function ExecutionRow({ execution }: { execution: N8nExecution }) {
  const config = STATUS_CONFIG[execution.status] || STATUS_CONFIG.waiting
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-sand-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded ${config.bg}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">
            {execution.workflowData?.name || `실행 #${execution.id.slice(-6)}`}
          </p>
          <p className="text-xs text-stone-500">{formatDate(execution.startedAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        <p className="text-xs text-stone-400 mt-0.5">
          {formatDuration(execution.startedAt, execution.stoppedAt)}
        </p>
      </div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-6 w-6 text-olive-600" />
          <h1 className="text-xl font-semibold text-stone-800">워크플로우</h1>
        </div>
        {health && (
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${health.available ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-sm text-stone-500">
              {health.available ? `n8n 정상 (${health.responseTimeMs}ms)` : 'n8n 중단됨'}
            </span>
          </div>
        )}
      </div>

      {/* FR-N8N5: Service suspended banner */}
      {isUnavailable && <ServiceSuspendedBanner />}

      {/* UXR121: Error state */}
      {wfError && !isUnavailable && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">워크플로우 목록을 불러올 수 없습니다.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UXR119: Workflow list */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider">
            워크플로우 목록
          </h2>
          {wfLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-lg bg-sand-100 animate-pulse" />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Workflow className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>등록된 워크플로우가 없습니다</p>
            </div>
          ) : (
            workflows.map(wf => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                selected={selectedWorkflowId === wf.id}
                onClick={() => setSelectedWorkflowId(wf.id)}
              />
            ))
          )}
        </div>

        {/* FR-N8N2: Execution results (read-only) */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3">
            {selectedWorkflowId ? '실행 결과' : '최근 실행'}
          </h2>
          <div className="rounded-lg border border-sand-200 bg-corthex-surface overflow-hidden">
            {execLoading ? (
              <div className="p-8 text-center text-stone-400">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                <p>로딩 중...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>실행 기록이 없습니다</p>
              </div>
            ) : (
              executions.map(exec => (
                <ExecutionRow key={exec.id} execution={exec} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
