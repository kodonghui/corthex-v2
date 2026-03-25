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
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-corthex-accent-deep/20 rounded animate-pulse" />
        <div className="h-64 w-full bg-corthex-accent-deep/10 rounded animate-pulse" />
      </div>
    )
  }

  if (!config || !providers) {
    return (
      <div className="p-6">
        <p className="text-red-400">설정을 불러올 수 없습니다.</p>
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
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-corthex-accent-deep">마케팅 AI 엔진 설정</h1>
        <p className="text-sm text-corthex-accent mt-1">
          콘텐츠 자동 생성에 사용할 AI 엔진을 카테고리별로 선택하세요. 변경사항은 다음 워크플로우 실행부터 적용됩니다.
        </p>
      </div>

      {/* Engine Selection by Category (FR-MKT1) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-corthex-accent-deep flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-corthex-accent" />
          엔진 선택
        </h2>

        <div className="grid gap-4">
          {CATEGORY_META.map(({ key, label, icon: Icon, desc }) => {
            const current = config.engines[key]
            const categoryProviders = providers[key] || []
            const selectedProvider = categoryProviders.find((p) => p.id === current?.provider)

            return (
              <div
                key={key}
                className="border border-corthex-border rounded-xl p-4 bg-corthex-surface"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-corthex-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-corthex-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-corthex-accent-deep">{label}</h3>
                    <p className="text-xs text-corthex-accent">{desc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-corthex-accent mb-1 block">제공자</label>
                    <select
                      value={current?.provider || ''}
                      onChange={(e) => handleProviderChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-corthex-border rounded-lg bg-corthex-surface text-corthex-accent-deep focus:ring-2 focus:ring-corthex-accent/30 focus:outline-none"
                    >
                      {categoryProviders.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-corthex-accent mb-1 block">모델</label>
                    <select
                      value={current?.model || ''}
                      onChange={(e) => handleModelChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-corthex-border rounded-lg bg-corthex-surface text-corthex-accent-deep focus:ring-2 focus:ring-corthex-accent/30 focus:outline-none"
                    >
                      {(selectedProvider?.models || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* API key status badge */}
                <div className="mt-2 flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-corthex-accent" />
                  {config.apiKeys[current?.provider] ? (
                    <span className="text-xs text-green-600 font-medium">API 키 등록됨</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">API 키 미등록</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* API Keys Management (AR39, MKT-1, MKT-3) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-corthex-accent-deep flex items-center gap-2">
          <Shield className="w-5 h-5 text-corthex-accent" />
          API 키 관리
        </h2>
        <p className="text-xs text-corthex-accent">
          각 제공자의 API 키를 입력하세요. 키는 AES-256으로 암호화되어 저장됩니다.
          회사 API 키를 사용하여 비용이 직접 귀속됩니다.
        </p>

        <div className="space-y-3">
          {Array.from(selectedProviders).map((providerId) => {
            // Find the provider name
            const providerDef = Object.values(providers).flat().find((p) => p.id === providerId)
            const hasKey = config.apiKeys[providerId]
            const isShowingKey = showApiKey[providerId]

            return (
              <div
                key={providerId}
                className="border border-corthex-border rounded-xl p-4 bg-corthex-surface"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-corthex-accent-deep">
                      {providerDef?.name || providerId}
                    </span>
                    {hasKey && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                        등록됨
                      </span>
                    )}
                  </div>
                  {hasKey && (
                    <button
                      onClick={() => deleteKey.mutate(providerId)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isShowingKey ? 'text' : 'password'}
                      placeholder={hasKey ? '새 키로 교체하려면 입력' : 'API 키 입력'}
                      value={apiKeyInputs[providerId] || ''}
                      onChange={(e) =>
                        setApiKeyInputs((prev) => ({ ...prev, [providerId]: e.target.value }))
                      }
                      className="w-full px-3 py-2 pr-8 text-sm border border-corthex-border rounded-lg bg-corthex-surface text-corthex-accent-deep focus:ring-2 focus:ring-corthex-accent/30 focus:outline-none font-mono"
                    />
                    <button
                      onClick={() =>
                        setShowApiKey((prev) => ({ ...prev, [providerId]: !prev[providerId] }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-corthex-accent"
                    >
                      {isShowingKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleSaveApiKey(providerId)}
                    disabled={!apiKeyInputs[providerId]?.trim() || storeKey.isPending}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-corthex-accent text-white hover:bg-corthex-accent-deep disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Watermark Toggle (FR-MKT6) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-corthex-accent-deep">저작권 워터마크</h2>
        <div className="border border-corthex-border rounded-xl p-4 bg-corthex-surface flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-corthex-accent-deep">생성 콘텐츠 워터마크</p>
            <p className="text-xs text-corthex-accent mt-0.5">
              AI 생성 콘텐츠에 회사 워터마크를 자동으로 추가합니다.
            </p>
          </div>
          <button
            onClick={() => updateWatermark.mutate(!config.watermark)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.watermark ? 'bg-corthex-accent' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-corthex-surface transition-transform ${
                config.watermark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Last updated */}
      {config.updatedAt && (
        <p className="text-xs text-corthex-accent/60">
          마지막 수정: {new Date(config.updatedAt).toLocaleString('ko-KR')}
        </p>
      )}
    </div>
  )
}
