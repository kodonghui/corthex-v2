import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast } from '@corthex/ui'
import { useAuthStore } from '../../stores/auth-store'

type McpServer = {
  id: string
  name: string
  url: string
  transport: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type McpTool = {
  name: string
  description: string
}

type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'loading'

const MAX_SERVERS = 10

function suggestName(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/\./g, '-')
    const port = parsed.port ? `-${parsed.port}` : ''
    return `${host}${port}`
  } catch {
    return ''
  }
}

export function SettingsMcp() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [formUrl, setFormUrl] = useState('')
  const [formName, setFormName] = useState('')
  const [nameManuallySet, setNameManuallySet] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({})

  const { data: serversData, isLoading } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => api.get<{ data: McpServer[] }>('/workspace/settings/mcp'),
  })

  const servers = serversData?.data || []

  // 페이지 진입 시 각 서버 ping
  useEffect(() => {
    if (!servers.length) return
    for (const s of servers) {
      setStatuses((prev) => ({ ...prev, [s.id]: 'loading' }))
      api
        .get<{ status: string }>(`/workspace/settings/mcp/${s.id}/ping`)
        .then((res) => setStatuses((prev) => ({ ...prev, [s.id]: res.status as ConnectionStatus })))
        .catch(() => setStatuses((prev) => ({ ...prev, [s.id]: 'disconnected' })))
    }
  }, [servers.length])

  const createServer = useMutation({
    mutationFn: (body: { name: string; url: string }) =>
      api.post('/workspace/settings/mcp', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
      setShowForm(false)
      setFormUrl('')
      setFormName('')
      setNameManuallySet(false)
      setTestResult(null)
      toast.success('MCP 서버가 등록되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteServer = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/settings/mcp/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
      toast.success('MCP 서버가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const testConnection = useMutation({
    mutationFn: (url: string) =>
      api.post<{ success: boolean; toolCount: number; message: string }>(
        '/workspace/settings/mcp/test',
        { url },
      ),
    onSuccess: (res) => setTestResult({ success: res.success, message: res.message }),
    onError: () => setTestResult({ success: false, message: '연결 테스트에 실패했습니다' }),
  })

  const handleUrlBlur = () => {
    if (!nameManuallySet && formUrl) {
      const suggested = suggestName(formUrl)
      if (suggested) setFormName(suggested)
    }
    if (formUrl.includes('localhost')) {
      toast.warning('프로덕션 환경에서는 외부 접근 가능한 URL을 사용하세요')
    }
  }

  const handleRegister = () => {
    if (!formUrl || !formName) return
    createServer.mutate({ name: formName, url: formUrl })
  }

  const isMaxReached = servers.length >= MAX_SERVERS

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-corthex-text-secondary">MCP 서버 연결</h3>
          {isAdmin && (
            <button
              onClick={() => { setShowForm(!showForm); setTestResult(null) }}
              disabled={isMaxReached && !showForm}
              className="text-xs text-indigo-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showForm ? '취소' : '+ 서버 추가'}
            </button>
          )}
        </div>

        {isAdmin && isMaxReached && !showForm && (
          <p className="text-xs text-corthex-text-secondary mb-3">최대 {MAX_SERVERS}개까지 등록 가능합니다</p>
        )}

        {isAdmin && showForm && (
          <div className="mb-4 p-4 rounded-lg border border-indigo-200 bg-indigo-50 space-y-3">
            <div>
              <label className="block text-xs font-medium text-corthex-text-secondary mb-1">서버 URL</label>
              <input
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="http://localhost:3000/mcp 또는 https://host/sse"
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-corthex-surface text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-corthex-text-secondary mb-1">서버 이름</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => { setFormName(e.target.value); setNameManuallySet(true) }}
                placeholder="자동 제안됨 (URL 입력 후)"
                className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-corthex-surface text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => testConnection.mutate(formUrl)}
                disabled={!formUrl || testConnection.isPending}
                className="px-3 py-2 text-xs border border-zinc-300 rounded-md hover:bg-corthex-elevated disabled:opacity-50"
              >
                {testConnection.isPending ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin inline-block w-3 h-3 border border-zinc-400 border-t-transparent rounded-full" />
                    테스트 중...
                  </span>
                ) : '연결 테스트'}
              </button>
              <button
                onClick={handleRegister}
                disabled={!formUrl || !formName || createServer.isPending}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {createServer.isPending ? '등록 중...' : '등록'}
              </button>
            </div>

            {testResult && (
              <p className={`text-xs ${testResult.success ? 'text-emerald-500' : 'text-red-500'}`}>
                {testResult.success ? '✓' : '✗'} {testResult.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-6 text-sm text-corthex-text-disabled">불러오는 중...</div>
          ) : servers.length === 0 ? (
            <div className="text-center py-12 text-sm text-corthex-text-disabled">
              <p className="mb-2">연결된 MCP 서버가 없습니다</p>
              <p className="text-xs">서버를 추가하면 에이전트가 외부 도구를 사용할 수 있습니다</p>
            </div>
          ) : (
            servers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                status={statuses[server.id] || 'loading'}
                expanded={expandedId === server.id}
                onToggle={() => setExpandedId(expandedId === server.id ? null : server.id)}
                onDelete={() => {
                  if (confirm('이 MCP 서버 연결을 삭제하시겠습니까?')) {
                    deleteServer.mutate(server.id)
                  }
                }}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function ServerCard({
  server,
  status,
  expanded,
  onToggle,
  onDelete,
  isAdmin,
}: {
  server: McpServer
  status: ConnectionStatus
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
  isAdmin: boolean
}) {
  const { data: toolsData, isLoading: toolsLoading } = useQuery({
    queryKey: ['mcp-tools', server.id],
    queryFn: () => api.get<{ tools: McpTool[] }>(`/workspace/settings/mcp/${server.id}/tools`),
    enabled: expanded,
  })

  const tools = toolsData?.tools || []

  const statusDot = {
    connected: 'bg-emerald-500',
    disconnected: 'bg-zinc-400',
    error: 'bg-red-500',
    loading: 'bg-zinc-300 animate-pulse',
  }[status]

  const statusLabel = {
    connected: 'connected',
    disconnected: 'disconnected',
    error: 'error',
    loading: '...',
  }[status]

  return (
    <div className="rounded-md border border-zinc-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-corthex-bg"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{server.name}</span>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`} />
            <span className="text-[10px] text-corthex-text-disabled">{statusLabel}</span>
          </div>
          <p className="text-xs text-corthex-text-disabled truncate mt-0.5">{server.url}</p>
          {server.url.startsWith('http://') && (
            <p className="text-[10px] text-yellow-600 mt-0.5">HTTPS 사용을 권장합니다</p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-corthex-text-disabled hover:text-red-500 ml-2 flex-shrink-0"
            title="삭제"
          >
            🗑
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-zinc-200 p-3 bg-corthex-bg">
          <p className="text-xs font-medium text-corthex-text-secondary mb-2">도구 목록</p>
          {toolsLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-zinc-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-zinc-200 rounded animate-pulse w-1/2" />
            </div>
          ) : tools.length === 0 ? (
            <p className="text-xs text-corthex-text-disabled">등록된 도구가 없습니다</p>
          ) : (
            <div className="space-y-1">
              {tools.map((tool) => (
                <div key={tool.name}>
                  <span className="font-mono text-sm">{tool.name}</span>
                  {tool.description && (
                    <span className="text-xs text-corthex-text-secondary ml-2">{tool.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
