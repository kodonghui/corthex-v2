/**
 * Story 26.1: Marketing Settings & AI Engine Configuration
 * References: FR-MKT1, FR-MKT4, FR-MKT6, AR39, MKT-1, MKT-3
 *
 * Admin page for configuring marketing AI engines, API keys, and watermark.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Image, Video, Mic, Subtitles, Key, Shield, Save, Trash2, Eye, EyeOff, RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// === Types ===

type EngineCategory = 'image' | 'video' | 'narration' | 'subtitles'

interface EngineSelection {
  provider: string
  model: string
}

interface MarketingConfig {
  engines: Record<EngineCategory, EngineSelection>
  apiKeys: Record<string, boolean>
  watermark: boolean
  updatedAt: string
}

interface ProviderDef {
  id: string
  name: string
  models: string[]
}

type ProvidersMap = Record<EngineCategory, ProviderDef[]>

// === Category metadata ===

const CATEGORY_META: { key: EngineCategory; label: string; icon: LucideIcon; desc: string }[] = [
  { key: 'image', label: '이미지 생성', icon: Image, desc: '카드뉴스, 썸네일, SNS 이미지' },
  { key: 'video', label: '영상 생성', icon: Video, desc: '숏폼 영상, 릴스, 유튜브 숏츠' },
  { key: 'narration', label: '나레이션', icon: Mic, desc: '음성 합성, TTS' },
  { key: 'subtitles', label: '자막', icon: Subtitles, desc: '음성 인식, 자막 생성' },
]

// === Component ===

export function MarketingSettingsPage() {
  const queryClient = useQueryClient()
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({})
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})

  // Fetch marketing config
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['marketing-config'],
    queryFn: () => api.get<{ success: boolean; data: MarketingConfig }>('/admin/company-settings/marketing'),
  })

  // Fetch available providers
  const { data: providersData } = useQuery({
    queryKey: ['marketing-providers'],
    queryFn: () => api.get<{ success: boolean; data: ProvidersMap }>('/admin/company-settings/marketing/providers'),
  })

  const config = configData?.data
  const providers = providersData?.data

  // Mutations
  const updateEngine = useMutation({
    mutationFn: (data: { category: string; provider: string; model: string }) =>
      api.put('/admin/company-settings/marketing/engine', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-config'] }),
  })

  const storeKey = useMutation({
    mutationFn: (data: { provider: string; apiKey: string }) =>
      api.put('/admin/company-settings/marketing/api-key', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-config'] })
      setApiKeyInputs({})
    },
  })

  const deleteKey = useMutation({
    mutationFn: (provider: string) =>
      api.delete(`/admin/company-settings/marketing/api-key/${provider}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-config'] }),
  })

  const updateWatermark = useMutation({
    mutationFn: (enabled: boolean) =>
      api.put('/admin/company-settings/marketing/watermark', { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-config'] }),
  })

  if (configLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 w-48 bg-corthex-elevated animate-pulse" />
        <div className="h-48 w-full bg-corthex-surface border border-corthex-border animate-pulse" />
      </div>
    )
  }

  if (!config || !providers) {
    return (
      <div className="p-8">
        <p className="text-xs font-mono text-corthex-error uppercase tracking-widest">설정을 불러올 수 없습니다.</p>
      </div>
    )
  }

  const handleProviderChange = (category: EngineCategory, providerId: string) => {
    const providerDef = providers[category]?.find((p) => p.id === providerId)
    if (!providerDef) return
    updateEngine.mutate({
      category,
      provider: providerId,
      model: providerDef.models[0],
    })
  }

  const handleModelChange = (category: EngineCategory, model: string) => {
    const current = config.engines[category]
    updateEngine.mutate({ category, provider: current.provider, model })
  }

  const handleSaveApiKey = (provider: string) => {
    const key = apiKeyInputs[provider]
    if (!key?.trim()) return
    storeKey.mutate({ provider, apiKey: key.trim() })
  }

  // Collect unique providers from all selected engines
  const selectedProviders = new Set<string>()
  for (const cat of CATEGORY_META) {
    const sel = config.engines[cat.key]
    if (sel?.provider) selectedProviders.add(sel.provider)
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-corthex-border pb-6">
        <h1 className="text-lg font-bold uppercase tracking-widest text-corthex-text-primary">
          Marketing AI 엔진 설정
        </h1>
        <p className="text-xs font-mono text-corthex-text-secondary uppercase tracking-wider mt-1">
          Core system configuration for algorithmic distribution
        </p>
        {config.updatedAt && (
          <p className="text-xs font-mono text-corthex-text-disabled mt-2 uppercase tracking-widest">
            Last Revision: {new Date(config.updatedAt).toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      {/* Engine Selection by Category (FR-MKT1) */}
      <section className="bg-corthex-surface border border-corthex-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
            AI Engine Parameters
          </h2>
          <RefreshCw className="w-3.5 h-3.5 text-corthex-text-disabled ml-auto" />
        </div>

        <div className="grid gap-4">
          {CATEGORY_META.map(({ key, label, icon: Icon, desc }) => {
            const current = config.engines[key]
            const categoryProviders = providers[key] || []
            const selectedProvider = categoryProviders.find((p) => p.id === current?.provider)

            return (
              <div
                key={key}
                className="bg-corthex-elevated border border-corthex-border p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-corthex-accent-muted border border-corthex-border flex items-center justify-center">
                    <Icon className="w-4 h-4 text-corthex-accent" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{label}</h3>
                    <p className="text-xs text-corthex-text-disabled font-mono">{desc}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-corthex-text-disabled" />
                    {config.apiKeys[current?.provider] ? (
                      <span className="text-xs font-mono text-corthex-success uppercase tracking-widest">등록됨</span>
                    ) : (
                      <span className="text-xs font-mono text-corthex-warning uppercase tracking-widest">미등록</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">
                      Provider
                    </label>
                    <select
                      value={current?.provider || ''}
                      onChange={(e) => handleProviderChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-base font-mono border border-corthex-border bg-corthex-bg text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none appearance-none"
                    >
                      {categoryProviders.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">
                      Model
                    </label>
                    <select
                      value={current?.model || ''}
                      onChange={(e) => handleModelChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-base font-mono border border-corthex-border bg-corthex-bg text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none appearance-none"
                    >
                      {(selectedProvider?.models || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* API Keys Management (AR39, MKT-1, MKT-3) */}
      <section className="bg-corthex-surface border border-corthex-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-corthex-accent" />
            API 키 관리
          </h2>
        </div>
        <p className="text-xs font-mono text-corthex-text-disabled">
          각 제공자의 API 키를 입력하세요. 키는 AES-256으로 암호화되어 저장됩니다.
        </p>

        <div className="space-y-3">
          {Array.from(selectedProviders).map((providerId) => {
            const providerDef = Object.values(providers).flat().find((p) => p.id === providerId)
            const hasKey = config.apiKeys[providerId]
            const isShowingKey = showApiKey[providerId]

            return (
              <div
                key={providerId}
                className="bg-corthex-elevated border border-corthex-border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">
                      {providerDef?.name || providerId}
                    </span>
                    {hasKey && (
                      <span className="px-1.5 py-0.5 text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        등록됨
                      </span>
                    )}
                  </div>
                  {hasKey && (
                    <button
                      onClick={() => deleteKey.mutate(providerId)}
                      className="text-xs text-corthex-error hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isShowingKey ? 'text' : 'password'}
                      placeholder={hasKey ? '새 키로 교체하려면 입력' : 'API 키 입력'}
                      value={apiKeyInputs[providerId] || ''}
                      onChange={(e) =>
                        setApiKeyInputs((prev) => ({ ...prev, [providerId]: e.target.value }))
                      }
                      className="w-full px-3 py-2 pr-8 text-base font-mono border border-corthex-border bg-corthex-bg text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        setShowApiKey((prev) => ({ ...prev, [providerId]: !prev[providerId] }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors"
                    >
                      {isShowingKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveApiKey(providerId)}
                    disabled={!apiKeyInputs[providerId]?.trim() || storeKey.isPending}
                    className="px-4 py-3 min-h-[44px] text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    저장
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Watermark Toggle (FR-MKT6) */}
      <section className="bg-corthex-surface border border-corthex-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-4 bg-corthex-accent flex-shrink-0"></span>
          <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">
            저작권 워터마크
          </h2>
        </div>
        <div className="bg-corthex-elevated border border-corthex-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">생성 콘텐츠 워터마크</p>
            <p className="text-xs font-mono text-corthex-text-disabled mt-0.5">
              AI 생성 콘텐츠에 회사 워터마크를 자동으로 추가합니다.
            </p>
          </div>
          <button
            onClick={() => updateWatermark.mutate(!config.watermark)}
            className={`relative inline-flex h-6 w-11 items-center transition-colors ${
              config.watermark ? 'bg-corthex-accent' : 'bg-corthex-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 bg-corthex-bg transition-transform ${
                config.watermark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  )
}
