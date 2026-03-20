/**
 * Admin Settings Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET    /admin/companies/:id
 *   PATCH  /admin/companies/:id
 *   GET    /admin/api-keys
 *   GET    /admin/api-keys/providers
 *   POST   /admin/api-keys
 *   PUT    /admin/api-keys/:id
 *   DELETE /admin/api-keys/:id
 *   GET    /admin/company-settings/handoff-depth
 *   PUT    /admin/company-settings/handoff-depth
 */
import { useState, useEffect } from 'react'
import { Building2, Key, ArrowLeftRight, SlidersHorizontal } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Skeleton, ConfirmDialog } from '@corthex/ui'
import { olive, oliveBg, terracotta, cream, sand, warmBrown, muted, lightMuted } from '../lib/colors'

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
  smtp: 'SMTP Mail',
  email: 'Email',
  telegram: 'Telegram',
  instagram: 'Instagram',
  serper: 'Serper (Search)',
  notion: 'Notion',
  google_calendar: 'Google Calendar',
  tts: 'TTS (Voice)',
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
    <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: sand }} data-testid="settings-company-info">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
          <Building2 className="w-5 h-5" style={{ color: olive }} />
        </div>
        <h2 className="text-lg font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Company Info</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Company Name</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2.5 border rounded-lg bg-white text-sm focus:outline-none focus:ring-1"
            style={{ borderColor: sand, color: warmBrown, outlineColor: olive }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Slug</label>
          <input
            value={company.slug}
            disabled
            className="w-full px-3 py-2.5 border rounded-lg text-sm cursor-not-allowed"
            style={{ borderColor: sand, backgroundColor: `${cream}80`, color: lightMuted }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Created</label>
          <p className="text-sm py-2" style={{ color: warmBrown }}>{formatDate(company.createdAt)}</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Status</label>
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold"
            style={{
              backgroundColor: company.isActive ? oliveBg : 'rgba(239,68,68,0.1)',
              color: company.isActive ? olive : '#ef4444',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: company.isActive ? olive : '#ef4444' }} />
            {company.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end gap-3 mt-5 pt-5 border-t" style={{ borderColor: sand }}>
          <button
            onClick={() => { setName(company.name); setDirty(false) }}
            className="px-5 py-2 text-sm font-medium transition-colors"
            style={{ color: muted }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name })}
            className="px-5 py-2 text-white text-sm font-bold rounded-xl transition-all"
            style={{ backgroundColor: olive }}
          >
            Save
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
      addToast({ type: 'success', message: 'API key registered' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/api-keys/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-api-keys'] })
      setDeleteTarget(null)
      addToast({ type: 'success', message: 'API key deleted' })
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
      addToast({ type: 'success', message: 'API key rotated' })
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

  const inputStyle = { borderColor: sand, color: warmBrown, backgroundColor: '#fbfaf8' }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: sand }} data-testid="settings-api-keys">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
            <Key className="w-5 h-5" style={{ color: olive }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>API Key Management</h2>
            <p className="text-xs mt-0.5" style={{ color: lightMuted }}>External service API keys (AES-256-GCM encrypted)</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          style={{ backgroundColor: terracotta }}
          data-testid="api-key-add-btn"
        >
          + Add API Key
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleSubmitAdd} className="mb-5 p-5 rounded-xl space-y-3 border" style={{ backgroundColor: `${cream}80`, borderColor: sand }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Provider</label>
              <select
                value={addForm.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm"
                style={inputStyle}
                required
              >
                <option value="">Select...</option>
                {providerList.map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Label (optional)</label>
              <input
                value={addForm.label}
                onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg text-sm"
                style={inputStyle}
                placeholder="e.g. Production Key"
              />
            </div>
          </div>
          {selectedProviderFields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: lightMuted }}>Required fields:</p>
              {selectedProviderFields.map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1" style={{ color: muted }}>{field}</label>
                  <input
                    type="password"
                    value={addForm.fields[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono"
                    style={inputStyle}
                    required
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { setShowAdd(false); setAddForm({ provider: '', label: '', fields: {} }) }}
              className="px-4 py-2 text-sm" style={{ color: muted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || !addForm.provider}
              className="px-4 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
              style={{ backgroundColor: olive }}
            >
              {addMutation.isPending ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      )}

      {/* Rotate form */}
      {rotateTarget && (
        <div className="mb-5 p-5 rounded-xl space-y-3 border" style={{ backgroundColor: 'rgba(196,98,45,0.05)', borderColor: terracotta }}>
          <h3 className="text-sm font-bold" style={{ color: terracotta }}>
            Rotate Key: {PROVIDER_LABELS[rotateTarget.provider] || rotateTarget.provider}
            {rotateTarget.label && ` -- ${rotateTarget.label}`}
          </h3>
          <p className="text-xs" style={{ color: lightMuted }}>Enter new key values to replace the existing key</p>
          {(providerSchemas[rotateTarget.provider] || []).map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium mb-1" style={{ color: muted }}>{field}</label>
              <input
                type="password"
                value={rotateFields[field] || ''}
                onChange={(e) => setRotateFields({ ...rotateFields, [field]: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono"
                style={inputStyle}
                placeholder="Enter new value..."
                required
              />
            </div>
          ))}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { setRotateTarget(null); setRotateFields({}) }}
              className="px-4 py-2 text-sm" style={{ color: muted }}
            >
              Cancel
            </button>
            <button
              onClick={() => rotateMutation.mutate({ id: rotateTarget.id, credentials: rotateFields })}
              disabled={rotateMutation.isPending}
              className="px-4 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
              style={{ backgroundColor: terracotta }}
            >
              {rotateMutation.isPending ? 'Rotating...' : 'Rotate'}
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
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: lightMuted }}>No API keys registered</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
              style={{ backgroundColor: `${cream}80`, borderColor: sand }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase" style={{ backgroundColor: oliveBg, color: olive }}>
                    {k.provider}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sand}80`, color: muted }}>
                    {k.scope === 'company' ? 'Company' : 'Personal'}
                  </span>
                  <p className="text-sm font-bold" style={{ color: warmBrown }}>
                    {k.label || '(No label)'}
                  </p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: lightMuted }}>
                  Registered: {formatDate(k.createdAt)}
                  {k.updatedAt !== k.createdAt && ` | Updated: ${formatDate(k.updatedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setRotateTarget(k); setRotateFields({}) }}
                  className="text-xs font-medium transition-colors"
                  style={{ color: terracotta }}
                >
                  Rotate
                </button>
                <button
                  onClick={() => setDeleteTarget(k)}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#ef4444' }}
                >
                  Delete
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
        title="Delete API Key"
        description={`Delete the ${PROVIDER_LABELS[deleteTarget?.provider || ''] || deleteTarget?.provider} key? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

// === Handoff Depth Section ===

function HandoffDepthSection({ companyId }: { companyId: string }) {
  const qc = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  const { data, isLoading } = useQuery({
    queryKey: ['handoff-depth', companyId],
    queryFn: () => api.get<{ data: { maxHandoffDepth: number } }>('/admin/company-settings/handoff-depth'),
    enabled: !!companyId,
  })

  const currentDepth = data?.data?.maxHandoffDepth ?? 5
  const [depth, setDepth] = useState(currentDepth)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setDepth(data.data.maxHandoffDepth)
      setDirty(false)
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (maxHandoffDepth: number) =>
      api.put('/admin/company-settings/handoff-depth', { maxHandoffDepth }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['handoff-depth', companyId] })
      setDirty(false)
      addToast({ type: 'success', message: `Handoff depth set to ${depth}` })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleChange = (v: number) => {
    setDepth(v)
    setDirty(v !== currentDepth)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: sand }}>
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: sand }} data-testid="settings-handoff-depth">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
          <ArrowLeftRight className="w-5 h-5" style={{ color: olive }} />
        </div>
        <h2 className="text-lg font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Handoff Depth</h2>
      </div>
      <p className="text-xs mb-5" style={{ color: lightMuted }}>Maximum handoff depth between AI agents. Higher values allow deeper agent chains.</p>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={10}
          value={depth}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: olive, backgroundColor: sand }}
        />
        <span className="text-3xl font-black w-12 text-center tabular-nums" style={{ color: olive, fontFamily: "'Noto Serif KR', serif" }}>{depth}</span>
      </div>

      <div className="flex justify-between text-[10px] mt-1 px-0.5" style={{ color: lightMuted }}>
        <span>1 (Simple)</span>
        <span>10 (Complex)</span>
      </div>

      {dirty && (
        <div className="flex justify-end gap-3 mt-5 pt-5 border-t" style={{ borderColor: sand }}>
          <button
            onClick={() => { setDepth(currentDepth); setDirty(false) }}
            className="px-5 py-2 text-sm" style={{ color: muted }}
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(depth)}
            disabled={mutation.isPending}
            className="px-5 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
            style={{ backgroundColor: olive }}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
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
  const [defaultModel, setDefaultModel] = useState((currentSettings.defaultModel as string) || 'claude-sonnet-4-6-20250520')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const s = company.settings || {}
    setTimezone((s.timezone as string) || 'Asia/Seoul')
    setDefaultModel((s.defaultModel as string) || 'claude-sonnet-4-6-20250520')
    setDirty(false)
  }, [company])

  const handleSave = () => {
    onSave({ ...currentSettings, timezone, defaultModel })
  }

  const handleCancel = () => {
    const s = company.settings || {}
    setTimezone((s.timezone as string) || 'Asia/Seoul')
    setDefaultModel((s.defaultModel as string) || 'claude-sonnet-4-6-20250520')
    setDirty(false)
  }

  const selectStyle = { borderColor: sand, color: warmBrown, backgroundColor: '#fbfaf8' }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6" style={{ borderColor: sand }} data-testid="settings-defaults">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: oliveBg }}>
          <SlidersHorizontal className="w-5 h-5" style={{ color: olive }} />
        </div>
        <h2 className="text-lg font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>Default Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Timezone</label>
          <select
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setDirty(true) }}
            className="w-full px-3 py-2.5 border rounded-lg text-sm"
            style={selectStyle}
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
          <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Default LLM Model</label>
          <select
            value={defaultModel}
            onChange={(e) => { setDefaultModel(e.target.value); setDirty(true) }}
            className="w-full px-3 py-2.5 border rounded-lg text-sm"
            style={selectStyle}
          >
            <option value="claude-sonnet-4-6-20250520">Claude Sonnet 4.6</option>
            <option value="claude-opus-4-6-20250520">Claude Opus 4.6</option>
          </select>
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end gap-3 mt-5 pt-5 border-t" style={{ borderColor: sand }}>
          <button
            onClick={handleCancel}
            className="px-5 py-2 text-sm" style={{ color: muted }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-white text-sm font-bold rounded-xl transition-colors"
            style={{ backgroundColor: olive }}
          >
            Save
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
      addToast({ type: 'success', message: 'Settings saved' })
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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <p className="text-sm" style={{ color: lightMuted }} data-testid="settings-no-company">회사를 선택하세요</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <p className="text-sm" style={{ color: lightMuted }}>Unable to load company data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
      <div className="p-8 max-w-4xl mx-auto" data-testid="settings-page">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: muted }}>Manage company info, API keys, and default settings</p>
        </div>

        <div className="space-y-6">
          <CompanyInfoSection company={company} onSave={handleSaveInfo} />
          <ApiKeySection companyId={selectedCompanyId} />
          <HandoffDepthSection companyId={selectedCompanyId} />
          <DefaultSettingsSection company={company} onSave={handleSaveSettings} />
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center text-xs" style={{ color: lightMuted }}>
          <p>&copy; 2024 CORTHEX Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <span>System Status: <span style={{ color: olive }}>Healthy</span></span>
            <span>API v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
