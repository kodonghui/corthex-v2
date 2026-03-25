import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { Plus, ChevronRight, Server, Cpu, Activity, HardDrive, RefreshCw, Edit2, Trash2, Copy, Filter } from 'lucide-react'

// Story 19.3: Admin MCP Servers UI (FR-MCP1, FR-MCP3, NFR-I2, D25)
// CRUD + connection test with green/red status indicators
// Journey 3: Admin connects Notion MCP in < 4 minutes

type McpServer = {
  id: string
  displayName: string
  transport: string
  command: string | null
  args: string[]
  env: Record<string, string>
  isActive: boolean
  createdAt: string
}

type TestResult =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'success'; toolCount: number; latencyMs: number }
  | { status: 'error'; code: string; message: string }

const EMPTY_FORM = {
  displayName: '',
  transport: 'stdio',
  command: 'npx',
  args: '',
  env: '',
}

function parseEnvInput(raw: string): Record<string, string> {
  raw = raw.trim()
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, string>
  } catch {
    // Fall through to KEY=VALUE parsing
  }
  const result: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const eqIdx = line.indexOf('=')
    if (eqIdx < 0) continue
    const key = line.slice(0, eqIdx).trim()
    const value = line.slice(eqIdx + 1).trim()
    if (key) result[key] = value
  }
  return result
}

function formatEnvForDisplay(env: Record<string, string>): string {
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
}

function StatusBadge({ result }: { result: TestResult }) {
  if (result.status === 'idle') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-corthex-text-disabled" />
        <span className="text-xs font-mono text-corthex-text-disabled uppercase tracking-wide">Not Tested</span>
      </div>
    )
  }
  if (result.status === 'testing') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-corthex-accent animate-pulse" />
        <span className="text-xs font-mono text-corthex-accent uppercase tracking-wide">Testing...</span>
      </div>
    )
  }
  if (result.status === 'success') {
    return (
      <div className="flex items-center gap-2" title={`Connected — ${result.toolCount} tools (${(result.latencyMs / 1000).toFixed(1)}s)`}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">Connected</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2" title={`${result.code}: ${result.message}`}>
      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
      <span className="text-xs font-bold text-red-400 tracking-wide uppercase">Error</span>
    </div>
  )
}

export function McpServersPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  const { data: listData, isLoading } = useQuery({
    queryKey: ['mcp-servers', selectedCompanyId],
    queryFn: () => api.get<{ data: McpServer[] }>('/admin/mcp-servers'),
    enabled: !!selectedCompanyId,
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/mcp-servers', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', selectedCompanyId] })
      setShowForm(false)
      setForm(EMPTY_FORM)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.put(`/admin/mcp-servers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers', selectedCompanyId] })
      setShowForm(false)
      setEditId(null)
      setForm(EMPTY_FORM)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/mcp-servers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mcp-servers', selectedCompanyId] }),
  })

  const servers = listData?.data ?? []
  const connectedCount = Object.values(testResults).filter(r => r.status === 'success').length
  const totalTools = Object.values(testResults).reduce((acc, r) => r.status === 'success' ? acc + r.toolCount : acc, 0)

  function handleEdit(server: McpServer) {
    setEditId(server.id)
    setForm({
      displayName: server.displayName,
      transport: server.transport,
      command: server.command ?? 'npx',
      args: (server.args ?? []).join(' '),
      env: formatEnvForDisplay(server.env ?? {}),
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      displayName: form.displayName,
      transport: form.transport,
      command: form.command || null,
      args: form.args.trim() ? form.args.trim().split(/\s+/) : [],
      env: parseEnvInput(form.env),
    }
    if (editId) {
      updateMutation.mutate({ id: editId, body })
    } else {
      createMutation.mutate(body)
    }
  }

  async function handleTest(id: string) {
    setTestResults(prev => ({ ...prev, [id]: { status: 'testing' } }))
    try {
      const resp = await api.post<{
        success: boolean
        data?: { toolCount: number; latencyMs: number }
        error?: { code: string; message: string }
      }>(`/admin/mcp-servers/${id}/test`, {})

      if (resp.success && resp.data) {
        setTestResults(prev => ({
          ...prev,
          [id]: { status: 'success', toolCount: resp.data!.toolCount, latencyMs: resp.data!.latencyMs },
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [id]: { status: 'error', code: resp.error?.code ?? 'UNKNOWN', message: resp.error?.message ?? 'Connection failed' },
        }))
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [id]: { status: 'error', code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error' },
      }))
    }
  }

  if (!selectedCompanyId) {
    return <div className="p-6 text-corthex-text-disabled text-sm">회사를 선택해 주세요.</div>
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-corthex-text-disabled font-mono tracking-widest uppercase mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-corthex-accent/80">MCP-Servers</span>
          </div>
          <h2 className="text-2xl font-black text-corthex-text-primary tracking-tight uppercase">Server Registry</h2>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
          className="px-5 py-3 min-h-[44px] bg-corthex-accent text-corthex-text-on-accent font-black text-xs tracking-tighter rounded hover:brightness-110 transition-all flex items-center gap-2 uppercase w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          PROVISION SERVER
        </button>
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-corthex-surface border border-corthex-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-corthex-text-primary mb-4">
            {editId ? 'MCP 서버 수정' : '새 MCP 서버 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">Display Name *</label>
              <input
                required
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="notion"
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-2 text-base text-corthex-text-primary placeholder-corthex-text-disabled focus:outline-none focus:ring-1 focus:ring-corthex-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">Transport *</label>
              <select
                value={form.transport}
                onChange={e => setForm(f => ({ ...f, transport: e.target.value }))}
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-1.5 text-sm text-corthex-text-primary focus:outline-none focus:ring-1 focus:ring-corthex-accent"
              >
                <option value="stdio">stdio (Phase 1 — 권장)</option>
                <option value="sse">sse (Phase 2 — 미지원)</option>
                <option value="http">http (Phase 2 — 미지원)</option>
              </select>
              {form.transport !== 'stdio' && (
                <p className="text-xs text-amber-400">⚠ SSE/HTTP transport은 Phase 1에서 지원되지 않습니다.</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">Command</label>
              <input
                value={form.command}
                onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
                placeholder="npx"
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-1.5 text-sm text-corthex-text-primary placeholder-corthex-text-disabled focus:outline-none focus:ring-1 focus:ring-corthex-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-corthex-text-disabled">Args (공백 구분)</label>
              <input
                value={form.args}
                onChange={e => setForm(f => ({ ...f, args: e.target.value }))}
                placeholder="-y @notionhq/notion-mcp-server"
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-1.5 text-sm text-corthex-text-primary placeholder-corthex-text-disabled focus:outline-none focus:ring-1 focus:ring-corthex-accent"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-corthex-text-disabled">
                Env Variables (KEY=VALUE 형식 또는 JSON)
                <span className="text-corthex-text-secondary ml-1">— 크리덴셜 템플릿: {'{{credential:key_name}}'}</span>
              </label>
              <textarea
                value={form.env}
                onChange={e => setForm(f => ({ ...f, env: e.target.value }))}
                rows={3}
                placeholder={'NOTION_TOKEN={{credential:notion_integration_token}}'}
                className="w-full bg-corthex-bg border border-corthex-border rounded px-3 py-1.5 text-sm text-corthex-text-primary placeholder-corthex-text-disabled font-mono focus:outline-none focus:ring-1 focus:ring-corthex-accent resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-1.5 bg-corthex-accent hover:brightness-110 disabled:opacity-50 text-corthex-text-on-accent text-sm font-medium rounded transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}
                className="px-4 py-1.5 bg-corthex-elevated hover:bg-corthex-border text-corthex-text-primary text-sm rounded transition-colors"
              >
                취소
              </button>
              {(createMutation.isError || updateMutation.isError) && (
                <p className="text-xs text-red-400">저장에 실패했습니다.</p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Server Table */}
      <div className="bg-corthex-surface border border-corthex-border rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-corthex-border/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black tracking-widest text-corthex-text-secondary uppercase">Active Nodes</span>
            <span className="bg-corthex-accent/20 text-corthex-accent text-[10px] px-2 py-0.5 rounded font-mono border border-corthex-accent/30">
              {servers.length} REGISTERED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-corthex-text-disabled" />
            <select className="bg-corthex-elevated border border-corthex-border rounded text-[10px] px-3 py-1.5 font-mono text-corthex-text-secondary focus:ring-corthex-accent focus:border-corthex-accent uppercase appearance-none">
              <option>All Statuses</option>
              <option>Connected</option>
              <option>Not Tested</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-corthex-text-disabled text-sm">로딩 중...</div>
        ) : servers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Server className="w-10 h-10 text-corthex-text-disabled mx-auto mb-3" />
            <p className="text-corthex-text-disabled text-sm">등록된 MCP 서버가 없습니다.</p>
            <p className="text-xs mt-1 text-corthex-text-secondary">
              "PROVISION SERVER" 버튼으로 Notion, Playwright 등 MCP 서버를 연결하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-corthex-border/30 text-corthex-text-disabled text-[10px] font-black tracking-widest uppercase">
                  <th className="px-6 py-4">Server Name</th>
                  <th className="px-6 py-4">Command</th>
                  <th className="px-6 py-4">Transport</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tools</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border/30">
                {servers.map((server) => {
                  const testResult = testResults[server.id] ?? { status: 'idle' }
                  return (
                    <tr key={server.id} className="hover:bg-corthex-elevated/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-corthex-elevated flex items-center justify-center border border-corthex-border group-hover:border-corthex-accent/50 transition-colors">
                            <Server className="w-4 h-4 text-corthex-text-disabled group-hover:text-corthex-accent" />
                          </div>
                          <span className="font-bold text-sm tracking-tight text-corthex-text-primary">{server.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-xs text-corthex-text-secondary bg-corthex-bg px-3 py-1.5 rounded border border-corthex-border w-fit max-w-xs truncate">
                          <span className="truncate">{server.command ?? '—'}{server.args?.length ? ` ${server.args.join(' ')}` : ''}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(`${server.command ?? ''} ${(server.args ?? []).join(' ')}`)}
                            className="text-corthex-text-disabled hover:text-corthex-accent transition-colors flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                          server.transport === 'stdio'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {server.transport}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge result={testResult} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-mono text-corthex-text-secondary">
                          {testResult.status === 'success' ? testResult.toolCount : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleTest(server.id)}
                            disabled={testResult.status === 'testing'}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-corthex-elevated hover:bg-corthex-border disabled:opacity-50 text-corthex-text-primary rounded transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {testResult.status === 'testing' ? '테스트 중...' : 'Test'}
                          </button>
                          <button
                            onClick={() => handleEdit(server)}
                            className="p-1.5 text-corthex-text-secondary hover:text-corthex-accent transition-colors rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(server.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-corthex-text-disabled hover:text-red-400 transition-colors rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-corthex-surface border border-corthex-border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="w-10 h-10 text-corthex-accent" />
          </div>
          <h4 className="text-[10px] font-black tracking-widest text-corthex-text-secondary uppercase mb-3">Total Servers</h4>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-corthex-accent tracking-tighter">{servers.length}</span>
            <span className="text-xs font-bold text-corthex-text-secondary pb-1.5 tracking-widest">NODES</span>
          </div>
        </div>
        <div className="bg-corthex-surface border border-corthex-border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Cpu className="w-10 h-10 text-corthex-accent" />
          </div>
          <h4 className="text-[10px] font-black tracking-widest text-corthex-text-secondary uppercase mb-3">Total Tools</h4>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-corthex-text-primary tracking-tighter">{totalTools}</span>
            <span className="text-xs font-bold text-corthex-text-secondary pb-1.5 tracking-widest">FUNC</span>
          </div>
          <div className="text-[10px] text-corthex-text-disabled font-bold uppercase mt-1">
            Across {connectedCount} Tested Servers
          </div>
        </div>
        <div className="bg-corthex-surface border border-corthex-border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <HardDrive className="w-10 h-10 text-corthex-accent" />
          </div>
          <h4 className="text-[10px] font-black tracking-widest text-corthex-text-secondary uppercase mb-3">Connected</h4>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-corthex-text-primary tracking-tighter">{connectedCount}</span>
            <span className="text-xs font-bold text-corthex-text-secondary pb-1.5 tracking-widest">ONLINE</span>
          </div>
          <div className="w-full bg-corthex-elevated h-1 rounded-full overflow-hidden mt-2">
            <div
              className="bg-corthex-accent h-full transition-all"
              style={{ width: servers.length > 0 ? `${(connectedCount / servers.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
