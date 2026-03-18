import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'

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
  args: '',          // raw string, split on submit
  env: '',           // KEY=VALUE lines or JSON
}

function parseEnvInput(raw: string): Record<string, string> {
  raw = raw.trim()
  if (!raw) return {}
  // Try JSON first
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, string>
  } catch {
    // Fall through to KEY=VALUE parsing
  }
  // KEY=VALUE line format
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

function StatusDot({ result }: { result: TestResult }) {
  if (result.status === 'idle') {
    return <span className="inline-flex items-center gap-1 text-xs text-slate-500">—</span>
  }
  if (result.status === 'testing') {
    return <span className="inline-flex items-center gap-1 text-xs text-slate-400">⟳ Testing...</span>
  }
  if (result.status === 'success') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-emerald-400"
        title={`Connected — ${result.toolCount} tools (${(result.latencyMs / 1000).toFixed(1)}s)`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        OK · {result.toolCount} tools
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-red-400"
      title={`${result.code}: ${result.message}`}
    >
      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
      Error
    </span>
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
    return <div className="p-6 text-slate-400 text-sm">회사를 선택해 주세요.</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">MCP 서버 관리</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            에이전트가 사용할 MCP 서버를 등록하고 연결 테스트를 실행하세요
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
          className="px-3 py-1.5 bg-[#5a7247] hover:bg-[#6b8a55] text-white text-sm font-medium rounded transition-colors"
        >
          + MCP 서버 추가
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editId ? 'MCP 서버 수정' : '새 MCP 서버 등록'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Display Name *</label>
              <input
                required
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="notion"
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5a7247]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Transport *</label>
              <select
                value={form.transport}
                onChange={e => setForm(f => ({ ...f, transport: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5a7247]"
              >
                <option value="stdio">stdio (Phase 1 — 권장)</option>
                <option value="sse">sse (Phase 2 — 미지원)</option>
                <option value="http">http (Phase 2 — 미지원)</option>
              </select>
              {form.transport !== 'stdio' && (
                <p className="text-xs text-amber-400">
                  ⚠ SSE/HTTP transport은 Phase 1에서 지원되지 않습니다. stdio를 사용하세요.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Command</label>
              <input
                value={form.command}
                onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
                placeholder="npx"
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5a7247]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Args (공백 구분)</label>
              <input
                value={form.args}
                onChange={e => setForm(f => ({ ...f, args: e.target.value }))}
                placeholder="-y @notionhq/notion-mcp-server"
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5a7247]"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-xs text-slate-400">
                Env Variables (KEY=VALUE 형식 또는 JSON)
                <span className="text-slate-500 ml-1">— 크리덴셜 템플릿: {'{{credential:key_name}}'}</span>
              </label>
              <textarea
                value={form.env}
                onChange={e => setForm(f => ({ ...f, env: e.target.value }))}
                rows={3}
                placeholder={'NOTION_TOKEN={{credential:notion_integration_token}}'}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-[#5a7247] resize-none"
              />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-1.5 bg-[#5a7247] hover:bg-[#6b8a55] disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
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

      {/* Table */}
      {isLoading ? (
        <div className="text-slate-400 text-sm">로딩 중...</div>
      ) : servers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <p>등록된 MCP 서버가 없습니다.</p>
          <p className="text-xs mt-1 text-slate-500">
            "MCP 서버 추가" 버튼으로 Notion, Playwright 등 MCP 서버를 연결하세요.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4 font-medium">Display Name</th>
                <th className="pb-2 pr-4 font-medium">Transport</th>
                <th className="pb-2 pr-4 font-medium">Command</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => {
                const testResult = testResults[server.id] ?? { status: 'idle' }
                return (
                  <tr key={server.id} className="border-b border-slate-700/50">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-white">{server.displayName}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                        server.transport === 'stdio'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {server.transport}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-300">
                      {server.command ?? '—'}
                      {server.args?.length ? ` ${server.args.join(' ')}` : ''}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusDot result={testResult} />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTest(server.id)}
                          disabled={testResult.status === 'testing'}
                          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded transition-colors"
                        >
                          {testResult.status === 'testing' ? '테스트 중...' : '연결 테스트'}
                        </button>
                        <button
                          onClick={() => handleEdit(server)}
                          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(server.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs px-2 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 rounded transition-colors"
                        >
                          삭제
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
  )
}
