/**
 * Story 26.2: Marketing Pipeline View (UXR101)
 * References: FR-MKT2, UXR101
 *
 * CC-6 WorkflowPipelineView: DAG node graph, execution status, history table.
 * CEO read-only view of the marketing content automation pipeline.
 */

import { useQuery } from '@tanstack/react-query'
import {
  GitBranch, Play, CheckCircle2, XCircle, Clock, AlertTriangle,
  Image, Video, Mic, Subtitles, Send, UserCheck, Search, RefreshCw,
} from 'lucide-react'
import { api } from '../lib/api'
import type { LucideIcon } from 'lucide-react'

// === Types ===

interface PresetStage {
  id: string
  name: string
  type: 'trigger' | 'processing' | 'approval' | 'output'
  description: string
  position: [number, number]
  next: string[]
}

interface PresetWorkflow {
  presetId: string
  name: string
  description: string
  version: string
  stages: PresetStage[]
  platforms: string[]
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

// === Stage icon mapping ===

const STAGE_ICONS: Record<string, LucideIcon> = {
  'topic-input': Search,
  'ai-research': RefreshCw,
  'card-news': Image,
  'short-form': Video,
  'human-approval': UserCheck,
  'multi-platform-post': Send,
}

const STAGE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  trigger: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  processing: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  approval: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  output: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
}

const EXEC_STATUS = {
  success: { label: '성공', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  error: { label: '실패', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  running: { label: '실행중', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
  waiting: { label: '대기', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
} as const

// === Helpers ===

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

// === DAG Node Component ===

function StageNode({ stage }: { stage: PresetStage }) {
  const Icon = STAGE_ICONS[stage.id] || GitBranch
  const colors = STAGE_TYPE_COLORS[stage.type] || STAGE_TYPE_COLORS.processing

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-3 w-44 shadow-sm`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-sm font-medium ${colors.text}`}>{stage.name}</span>
      </div>
      <p className="text-xs text-stone-500 line-clamp-2">{stage.description}</p>
      <span className={`text-[10px] font-medium uppercase mt-1 inline-block ${colors.text}`}>
        {stage.type}
      </span>
    </div>
  )
}

// === DAG Graph Component (UXR101) ===

function PipelineDAG({ stages }: { stages: PresetStage[] }) {
  // Group stages by column (based on position.x)
  const columns = new Map<number, PresetStage[]>()
  for (const stage of stages) {
    const col = stage.position[0]
    if (!columns.has(col)) columns.set(col, [])
    columns.get(col)!.push(stage)
  }

  const sortedColumns = Array.from(columns.entries()).sort((a, b) => a[0] - b[0])

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-4 min-w-max p-4">
        {sortedColumns.map(([col, colStages], colIdx) => (
          <div key={col} className="flex items-center gap-4">
            <div className="flex flex-col gap-3">
              {colStages.map((stage) => (
                <StageNode key={stage.id} stage={stage} />
              ))}
            </div>
            {/* Arrow connector */}
            {colIdx < sortedColumns.length - 1 && (
              <div className="flex items-center">
                <div className="w-8 h-0.5 bg-stone-300" />
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-stone-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// === Execution History Table ===

function ExecutionHistory({ executions }: { executions: N8nExecution[] }) {
  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>실행 기록이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-stone-100">
      {executions.map((exec) => {
        const config = EXEC_STATUS[exec.status] || EXEC_STATUS.waiting
        const StatusIcon = config.icon
        return (
          <div key={exec.id} className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded ${config.bg}`}>
                <StatusIcon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {exec.workflowData?.name || `실행 #${exec.id.slice(-6)}`}
                </p>
                <p className="text-xs text-stone-500">{formatDate(exec.startedAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              <p className="text-xs text-stone-400 mt-0.5">
                {formatDuration(exec.startedAt, exec.stoppedAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// === Main Page ===

export function MarketingPipelinePage() {
  const selectedPresetId = 'marketing-content-pipeline'

  // Fetch preset detail (DAG structure)
  const { data: presetData, isLoading: presetLoading } = useQuery({
    queryKey: ['marketing-preset', selectedPresetId],
    queryFn: () => api.get<{ data: PresetWorkflow }>(`/admin/n8n/presets/${selectedPresetId}`),
  })

  // Fetch install status to get n8nWorkflowId for filtering executions
  const { data: statusData } = useQuery({
    queryKey: ['marketing-preset-status', selectedPresetId],
    queryFn: () => api.get<{ data: { presetId: string; installed: boolean; n8nWorkflowId?: string } }>(`/admin/n8n/presets/${selectedPresetId}/status`),
  })

  const installedWorkflowId = statusData?.data?.n8nWorkflowId

  // Fetch recent executions — filtered to marketing pipeline workflow when available (Quinn MEDIUM fix)
  const { data: execData, isLoading: execLoading } = useQuery({
    queryKey: ['n8n', 'executions', 'marketing', installedWorkflowId],
    queryFn: () => {
      const params = installedWorkflowId
        ? `?workflowId=${installedWorkflowId}&limit=20`
        : '?limit=20'
      return api.get<{ data: { data: N8nExecution[] } }>(`/admin/n8n/executions${params}`)
    },
    retry: 1,
  })

  const preset = presetData?.data
  const executions = execData?.data?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-olive-600" />
        <div>
          <h1 className="text-xl font-semibold text-stone-800">마케팅 파이프라인</h1>
          <p className="text-sm text-stone-500">콘텐츠 자동 생성 워크플로우 실행 현황</p>
        </div>
      </div>

      {/* DAG Pipeline View (UXR101) */}
      <section>
        <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3">
          파이프라인 구조
        </h2>
        <div className="rounded-xl border border-sand-200 bg-corthex-surface">
          {presetLoading ? (
            <div className="p-8 text-center text-stone-400">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
              <p>로딩 중...</p>
            </div>
          ) : preset?.stages ? (
            <PipelineDAG stages={preset.stages} />
          ) : (
            <div className="p-8 text-center text-stone-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>파이프라인 구조를 불러올 수 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* Pipeline info */}
      {preset && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-sand-200 bg-corthex-surface p-3">
            <p className="text-xs text-stone-500">단계</p>
            <p className="text-lg font-semibold text-stone-800">{preset.stages.length}단계</p>
          </div>
          <div className="rounded-lg border border-sand-200 bg-corthex-surface p-3">
            <p className="text-xs text-stone-500">게시 플랫폼</p>
            <p className="text-lg font-semibold text-stone-800">{preset.platforms.length}개</p>
          </div>
          <div className="rounded-lg border border-sand-200 bg-corthex-surface p-3">
            <p className="text-xs text-stone-500">버전</p>
            <p className="text-lg font-semibold text-stone-800">{preset.version}</p>
          </div>
          <div className="rounded-lg border border-sand-200 bg-corthex-surface p-3">
            <p className="text-xs text-stone-500">최근 실행</p>
            <p className="text-lg font-semibold text-stone-800">{executions.length}건</p>
          </div>
        </div>
      )}

      {/* Execution History */}
      <section>
        <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-3">
          실행 이력
        </h2>
        <div className="rounded-xl border border-sand-200 bg-corthex-surface overflow-hidden">
          {execLoading ? (
            <div className="p-8 text-center text-stone-400">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
              <p>로딩 중...</p>
            </div>
          ) : (
            <ExecutionHistory executions={executions} />
          )}
        </div>
      </section>
    </div>
  )
}
