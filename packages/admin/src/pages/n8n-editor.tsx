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
        <RefreshCw className="h-6 w-6 animate-spin text-corthex-text-disabled" />
      </div>
    )
  }

  if (!isAvailable) {
    return (
      <div className="p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center">
            <Workflow className="w-4 h-4 text-corthex-accent" />
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
              n8n Workflow Editor
            </h1>
          </div>
        </div>

        {/* Unavailable State */}
        <div className="bg-corthex-surface border border-corthex-border p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-corthex-elevated border border-corthex-border flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-corthex-warning" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-widest text-corthex-text-primary mb-2">
              워크플로우 서비스 일시 중단
            </h2>
            <p className="text-sm text-corthex-text-secondary">
              n8n 서비스가 일시적으로 중단되었습니다. 자동 재시작 중입니다.
            </p>
            <p className="text-xs font-mono text-corthex-text-disabled mt-2 uppercase tracking-widest">
              STATUS: {health?.status || 'UNREACHABLE'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-corthex-border bg-corthex-surface">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center">
            <Workflow className="w-3.5 h-3.5 text-corthex-accent" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
              n8n Workflow Editor
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-corthex-success" />
            <span className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
              {health?.responseTimeMs}ms
            </span>
          </div>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="flex items-center gap-1.5 text-xs font-mono text-corthex-text-disabled hover:text-corthex-accent transition-colors uppercase tracking-widest"
          >
            <RefreshCw className="h-3 w-3" />
            새로고침
          </button>
          <a
            href="/api/admin/n8n-editor/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-corthex-text-disabled hover:text-corthex-accent transition-colors uppercase tracking-widest"
          >
            <ExternalLink className="h-3 w-3" />
            새 탭
          </a>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 bg-corthex-bg overflow-hidden">
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
