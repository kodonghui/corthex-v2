/**
 * Story 25.4: Admin n8n Editor Access (FR-N8N6)
 *
 * Full n8n visual editor access via proxy.
 * The editor is loaded in an iframe pointing to the CORTHEX proxy endpoint.
 * All requests go through the security chain (SEC-2/3/8 + CSRF).
 *
 * API: /api/admin/n8n-editor/* (proxied to n8n UI), /api/admin/n8n/health
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Workflow,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Activity,
} from 'lucide-react'
import { api } from '../lib/api'

interface N8nHealthStatus {
  available: boolean
  status?: string
  responseTimeMs?: number
}

function useN8nHealth() {
  return useQuery({
    queryKey: ['n8n', 'health'],
    queryFn: () => api.get<{ data: N8nHealthStatus }>('/admin/n8n/health'),
    refetchInterval: 30_000,
  })
}

export function N8nEditorPage() {
  const { data: healthData, isLoading } = useN8nHealth()
  const [iframeKey, setIframeKey] = useState(0)

  const health = healthData?.data
  const isAvailable = health?.available === true

  // Refresh iframe when health recovers
  useEffect(() => {
    if (isAvailable) {
      setIframeKey(k => k + 1)
    }
  }, [isAvailable])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <RefreshCw className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (!isAvailable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Workflow className="h-6 w-6 text-stone-400" />
          <h1 className="text-xl font-semibold text-stone-800">n8n 에디터</h1>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-amber-800">워크플로우 서비스 일시 중단</h2>
          <p className="text-amber-600 mt-2">
            n8n 서비스가 일시적으로 중단되었습니다. 자동 재시작 중입니다.
          </p>
          <p className="text-sm text-amber-500 mt-1">
            상태: {health?.status || 'unreachable'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="h-6 w-6 text-olive-600" />
          <h1 className="text-xl font-semibold text-stone-800">n8n 에디터</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-stone-500">
              n8n 정상 ({health?.responseTimeMs}ms)
            </span>
          </div>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="flex items-center gap-1.5 text-sm text-olive-600 hover:text-olive-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            새로고침
          </button>
          <a
            href="/api/admin/n8n-editor/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-olive-600 hover:text-olive-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            새 탭
          </a>
        </div>
      </div>

      <div className="rounded-lg border border-sand-200 overflow-hidden bg-white">
        <iframe
          key={iframeKey}
          src="/api/admin/n8n-editor/"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 180px)' }}
          title="n8n Workflow Editor"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
