import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Skeleton, ConfirmDialog } from '@corthex/ui'

// === Types ===

type Company = {
  id: string
  name: string
  slug: string
  isActive: boolean
  settings: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

type ApiKey = {
  id: string
  companyId: string
  userId: string | null
  provider: string
  label: string | null
  scope: string
  createdAt: string
  updatedAt: string
}

type ProviderSchemas = Record<string, string[]>

// === Helpers ===

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('ko', { year: 'numeric', month: 'long', day: 'numeric' })
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI (GPT)',
  google_ai: 'Google AI (Gemini)',
  kis: 'KIS (한국투자증권)',
  smtp: 'SMTP 메일',
  email: 'Email',
  telegram: 'Telegram',
  instagram: 'Instagram',
  serper: 'Serper (검색)',
  notion: 'Notion',
  google_calendar: 'Google Calendar',
  tts: 'TTS (음성합성)',
}

// === Company Info Section ===

function CompanyInfoSection({ company, onSave }: { company: Company; onSave: (data: Partial<Company>) => void }) {
  const [name, setName] = useState(company.name)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setName(company.name)
    setDirty(false)
  }, [company])

  const handleNameChange = (v: string) => {
    setName(v)
    setDirty(v !== company.name)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5" data-testid="settings-company-info">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">회사 기본 정보</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">회사명</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Slug</label>
          <input
            value={company.slug}
            disabled
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-sm text-zinc-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">생성일</label>
          <p className="text-sm text-zinc-900 dark:text-zinc-100 py-2">{formatDate(company.createdAt)}</p>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">상태</label>
          <span className={`inline-block text-xs px-2.5 py-1 rounded-full ${
            company.isActive
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {company.isActive ? '활성' : '비활성'}
          </span>
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => { setName(company.name); setDirty(false) }}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave({ name })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            저장
          </button>
        </div>
      )}
    </div>
  )
}

// === API Key Section ===

function ApiKeySection({ companyId }: { companyId: string }) {
  const qc = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null)
  const [rotateTarget, setRotateTarget] = useState<ApiKey | null>(null)
  const [rotateFields, setRotateFields] = useState<Record<string, string>>({})
  const [addForm, setAddForm] = useState({
    provider: '',
    label: '',
    fields: {} as Record<string, string>,
  })

  const { data: apiKeyData, isLoading: keysLoading } = useQuery({
    queryKey: ['company-api-keys', companyId],
    queryFn: () => api.get<{ data: ApiKey[] }>('/admin/api-keys'),
    enabled: !!companyId,
  })

  const { data: providerData } = useQuery({
    queryKey: ['api-key-providers'],
    queryFn: () => api.get<{ data: ProviderSchemas }>('/admin/api-keys/providers'),
  })

  const apiKeys = apiKeyData?.data || []
  const providerSchemas = providerData?.data || {}
  const providerList = Object.keys(providerSchemas)

  const selectedProviderFields = addForm.provider ? (providerSchemas[addForm.provider] || []) : []

  const addMutation = useMutation({
    mutationFn: (body: { companyId: string; provider: string; label?: string; credentials: Record<string, string>; scope: 'company' }) =>
      api.post('/admin/api-keys', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-api-keys'] })
      setShowAdd(false)
      setAddForm({ provider: '', label: '', fields: {} })
      addToast({ type: 'success', message: 'API 키가 등록되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/api-keys/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-api-keys'] })
      setDeleteTarget(null)
      addToast({ type: 'success', message: 'API 키가 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const rotateMutation = useMutation({
    mutationFn: ({ id, credentials }: { id: string; credentials: Record<string, string> }) =>
      api.put(`/admin/api-keys/${id}`, { credentials }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-api-keys'] })
      setRotateTarget(null)
      setRotateFields({})
      addToast({ type: 'success', message: 'API 키가 갱신되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleProviderChange = (provider: string) => {
    setAddForm({ ...addForm, provider, fields: {} })
  }

  const handleFieldChange = (field: string, value: string) => {
    setAddForm({ ...addForm, fields: { ...addForm.fields, [field]: value } })
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate({
      companyId,
      provider: addForm.provider,
      ...(addForm.label ? { label: addForm.label } : {}),
      credentials: addForm.fields,
      scope: 'company',
    })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5" data-testid="settings-api-keys">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">API 키 관리</h2>
          <p className="text-xs text-zinc-500 mt-0.5">외부 서비스 연동을 위한 API 키를 관리합니다 (AES-256-GCM 암호화 저장)</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
          data-testid="api-key-add-btn"
        >
          + API 키 등록
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleSubmitAdd} className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">서비스 제공자</label>
              <select
                value={addForm.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                required
              >
                <option value="">선택...</option>
                {providerList.map((p) => (
                  <option key={p} value={p}>
                    {PROVIDER_LABELS[p] || p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">라벨 (선택)</label>
              <input
                value={addForm.label}
                onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                placeholder="예: 프로덕션 키"
              />
            </div>
          </div>

          {selectedProviderFields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">필수 필드:</p>
              {selectedProviderFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">{field}</label>
                  <input
                    type="password"
                    value={addForm.fields[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowAdd(false); setAddForm({ provider: '', label: '', fields: {} }) }}
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || !addForm.provider}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {addMutation.isPending ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      )}

      {/* Rotate form */}
      {rotateTarget && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            키 갱신: {PROVIDER_LABELS[rotateTarget.provider] || rotateTarget.provider}
            {rotateTarget.label && ` — ${rotateTarget.label}`}
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-500">새 키 값을 입력하면 기존 키가 교체됩니다</p>
          {(providerSchemas[rotateTarget.provider] || []).map((field) => (
            <div key={field}>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">{field}</label>
              <input
                type="password"
                value={rotateFields[field] || ''}
                onChange={(e) => setRotateFields({ ...rotateFields, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                placeholder="새 값 입력..."
                required
              />
            </div>
          ))}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setRotateTarget(null); setRotateFields({}) }}
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400"
            >
              취소
            </button>
            <button
              onClick={() => rotateMutation.mutate({ id: rotateTarget.id, credentials: rotateFields })}
              disabled={rotateMutation.isPending}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {rotateMutation.isPending ? '갱신 중...' : '갱신'}
            </button>
          </div>
        </div>
      )}

      {/* Key list */}
      {keysLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : apiKeys.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">등록된 API 키가 없습니다</p>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase font-medium">
                    {k.provider}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {k.scope === 'company' ? '회사 공용' : '개인용'}
                  </span>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {k.label || '(라벨 없음)'}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  등록: {formatDate(k.createdAt)}
                  {k.updatedAt !== k.createdAt && ` | 갱신: ${formatDate(k.updatedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setRotateTarget(k); setRotateFields({}) }}
                  className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  갱신
                </button>
                <button
                  onClick={() => setDeleteTarget(k)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="API 키 삭제"
        description={`${PROVIDER_LABELS[deleteTarget?.provider || ''] || deleteTarget?.provider} 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        variant="danger"
      />
    </div>
  )
}

// === Default Settings Section ===

function DefaultSettingsSection({
  company,
  onSave,
}: {
  company: Company
  onSave: (settings: Record<string, unknown>) => void
}) {
  const currentSettings = company.settings || {}
  const [timezone, setTimezone] = useState((currentSettings.timezone as string) || 'Asia/Seoul')
  const [defaultModel, setDefaultModel] = useState((currentSettings.defaultModel as string) || 'claude-sonnet-4-20250514')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const s = company.settings || {}
    setTimezone((s.timezone as string) || 'Asia/Seoul')
    setDefaultModel((s.defaultModel as string) || 'claude-sonnet-4-20250514')
    setDirty(false)
  }, [company])

  const handleSave = () => {
    onSave({
      ...currentSettings,
      timezone,
      defaultModel,
    })
  }

  const handleCancel = () => {
    const s = company.settings || {}
    setTimezone((s.timezone as string) || 'Asia/Seoul')
    setDefaultModel((s.defaultModel as string) || 'claude-sonnet-4-20250514')
    setDirty(false)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5" data-testid="settings-defaults">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">기본 설정</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">타임존</label>
          <select
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setDirty(true) }}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
          >
            <option value="Asia/Seoul">Asia/Seoul (KST, UTC+9)</option>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">기본 LLM 모델</label>
          <select
            value={defaultModel}
            onChange={(e) => { setDefaultModel(e.target.value); setDirty(true) }}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
          >
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-opus-4-20250514">Claude Opus 4</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            저장
          </button>
        </div>
      )}
    </div>
  )
}

// === Main Settings Page ===

export function SettingsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company-detail', selectedCompanyId],
    queryFn: () => api.get<{ data: Company }>(`/admin/companies/${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const company = companyData?.data

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Company>) =>
      api.patch<{ data: Company }>(`/admin/companies/${selectedCompanyId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-detail', selectedCompanyId] })
      qc.invalidateQueries({ queryKey: ['companies'] })
      addToast({ type: 'success', message: '설정이 저장되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleSaveInfo = (data: Partial<Company>) => {
    updateMutation.mutate(data)
  }

  const handleSaveSettings = (settings: Record<string, unknown>) => {
    updateMutation.mutate({ settings } as Partial<Company>)
  }

  if (!selectedCompanyId) {
    return <div className="p-8 text-center text-zinc-500" data-testid="settings-no-company">회사를 선택하세요</div>
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!company) {
    return <div className="p-8 text-center text-zinc-500">회사 정보를 불러올 수 없습니다</div>
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">회사 설정</h1>
        <p className="text-sm text-zinc-500 mt-1">회사 기본 정보, API 키, 기본 설정을 관리합니다</p>
      </div>

      <CompanyInfoSection company={company} onSave={handleSaveInfo} />
      <ApiKeySection companyId={selectedCompanyId} />
      <DefaultSettingsSection company={company} onSave={handleSaveSettings} />
    </div>
  )
}
