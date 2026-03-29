/**
 * Admin Settings Page — Stitch Terminal Theme
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
import { Building2, Key, ArrowLeftRight, SlidersHorizontal, Info, Terminal, Database, Shield } from 'lucide-react'
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
  smtp: 'SMTP Mail',
  email: 'Email',
  telegram: 'Telegram',
  instagram: 'Instagram',
  voyage_ai: 'Voyage AI (Embeddings)',
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
    setDirty(v.trim() !== company.name && v.trim().length > 0)
  }

  return (
    <div className="bg-corthex-bg border border-corthex-border/10 p-4 sm:p-6" data-testid="settings-company-info">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-corthex-accent-muted">
          <Building2 className="w-4 h-4 text-corthex-accent" />
        </div>
        <h3 className="font-mono font-bold text-sm text-corthex-text-primary uppercase tracking-widest">Company Info</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
          <div className="md:col-span-4">
            <label className="font-mono font-bold text-xs text-corthex-text-primary uppercase tracking-widest block mb-1">Company Name</label>
            <p className="text-xs text-corthex-text-disabled font-mono">Global identifier for this terminal instance.</p>
          </div>
          <div className="md:col-span-8">
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-corthex-elevated/50 border border-corthex-border/20 px-4 py-3 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent focus:border-corthex-accent outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
          <div className="md:col-span-4">
            <label className="font-mono font-bold text-xs text-corthex-text-primary uppercase tracking-widest block mb-1">Slug</label>
            <p className="text-xs text-corthex-text-disabled font-mono">Read-only system identifier.</p>
          </div>
          <div className="md:col-span-8">
            <input
              value={company.slug}
              disabled
              className="w-full bg-corthex-bg border border-corthex-border/10 px-4 py-3 text-corthex-text-disabled cursor-not-allowed font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start md:items-center">
          <div className="md:col-span-4">
            <label className="font-mono font-bold text-xs text-corthex-text-primary uppercase tracking-widest block mb-1">Status</label>
            <p className="text-xs text-corthex-text-disabled font-mono">Company active state.</p>
          </div>
          <div className="md:col-span-8 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 font-mono font-bold uppercase tracking-widest ${
                company.isActive
                  ? 'bg-corthex-success/10 text-corthex-success'
                  : 'bg-corthex-error/10 text-corthex-error'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${company.isActive ? 'bg-corthex-success' : 'bg-corthex-error'}`} />
              {company.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <span className="text-xs text-corthex-text-disabled font-mono">Since {formatDate(company.createdAt)}</span>
          </div>
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-corthex-border/10">
          <button
            onClick={() => { setName(company.name); setDirty(false) }}
            className="px-6 py-2 border border-corthex-border/20 text-corthex-text-secondary font-mono font-bold text-xs uppercase tracking-widest hover:bg-corthex-elevated transition-all"
          >
            Discard
          </button>
          <button
            onClick={() => onSave({ name: name.trim() })}
            disabled={!name.trim()}
            className="px-10 py-2 bg-gradient-to-br from-corthex-accent to-corthex-accent-deep text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(202,138,4,0.3)] hover:shadow-[0_4px_20px_rgba(202,138,4,0.5)] active:scale-95 transition-all disabled:opacity-50"
          >
            Save Settings
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

  return (
    <div className="bg-corthex-bg border border-corthex-border/10 p-4 sm:p-6" data-testid="settings-api-keys">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-corthex-accent-muted">
            <Key className="w-4 h-4 text-corthex-accent" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-corthex-text-primary uppercase tracking-widest">API Key Management</h3>
            <p className="text-xs mt-0.5 text-corthex-text-disabled font-mono">External service keys (AES-256-GCM encrypted)</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-corthex-accent text-corthex-text-on-accent text-xs font-mono font-bold uppercase tracking-widest hover:bg-corthex-accent-hover active:scale-95 transition-all"
          data-testid="api-key-add-btn"
        >
          + Add Key
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleSubmitAdd} className="mb-5 p-4 sm:p-5 space-y-3 border border-corthex-accent/20 bg-corthex-elevated/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-xs text-corthex-text-secondary uppercase tracking-widest mb-1.5">Provider</label>
              <select
                value={addForm.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full bg-corthex-elevated border border-corthex-border/20 px-3 py-2.5 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent outline-none"
                required
              >
                <option value="">Select...</option>
                {providerList.map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-xs text-corthex-text-secondary uppercase tracking-widest mb-1.5">Label (optional)</label>
              <input
                value={addForm.label}
                onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                className="w-full bg-corthex-elevated border border-corthex-border/20 px-3 py-2.5 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent outline-none"
                placeholder="e.g. Production Key"
              />
            </div>
          </div>
          {selectedProviderFields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-corthex-text-disabled font-mono">Required fields:</p>
              {selectedProviderFields.map((field) => (
                <div key={field}>
                  <label className="block font-mono font-bold text-xs text-corthex-text-secondary uppercase tracking-widest mb-1">{field}</label>
                  <input
                    type="password"
                    value={addForm.fields[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-full bg-corthex-elevated border border-corthex-border/20 px-3 py-2.5 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent outline-none"
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
              className="px-4 py-2 text-xs font-mono text-corthex-text-secondary hover:text-corthex-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending || !addForm.provider}
              className="px-6 py-2 bg-corthex-accent text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-colors"
            >
              {addMutation.isPending ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      )}

      {/* Rotate form */}
      {rotateTarget && (
        <div className="mb-5 p-5 space-y-3 border border-corthex-warning/30 bg-corthex-warning/5">
          <h3 className="font-mono font-bold text-sm text-corthex-warning uppercase tracking-widest">
            Rotate: {PROVIDER_LABELS[rotateTarget.provider] || rotateTarget.provider}
            {rotateTarget.label && ` — ${rotateTarget.label}`}
          </h3>
          <p className="text-xs text-corthex-text-disabled font-mono">Enter new key values to replace the existing key</p>
          {(providerSchemas[rotateTarget.provider] || []).map((field) => (
            <div key={field}>
              <label className="block font-mono font-bold text-xs text-corthex-text-secondary uppercase tracking-widest mb-1">{field}</label>
              <input
                type="password"
                value={rotateFields[field] || ''}
                onChange={(e) => setRotateFields({ ...rotateFields, [field]: e.target.value })}
                className="w-full bg-corthex-elevated border border-corthex-border/20 px-3 py-2.5 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent outline-none"
                placeholder="Enter new value..."
                required
              />
            </div>
          ))}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { setRotateTarget(null); setRotateFields({}) }}
              className="px-4 py-2 text-xs font-mono text-corthex-text-secondary hover:text-corthex-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => rotateMutation.mutate({ id: rotateTarget.id, credentials: rotateFields })}
              disabled={rotateMutation.isPending}
              className="px-6 py-2 bg-corthex-warning text-corthex-bg font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-colors"
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
          <p className="text-sm text-corthex-text-disabled font-mono">No API keys registered</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((k) => (
            <div
              key={k.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border border-corthex-border/10 bg-corthex-elevated/20 hover:bg-corthex-elevated/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 font-mono font-bold uppercase tracking-widest bg-corthex-accent-muted text-corthex-accent">
                    {k.provider}
                  </span>
                  <span className="text-xs px-2 py-0.5 font-mono bg-corthex-elevated text-corthex-text-secondary">
                    {k.scope === 'company' ? 'Company' : 'Personal'}
                  </span>
                  <p className="text-sm font-mono text-corthex-text-primary">
                    {k.label || '(No label)'}
                  </p>
                </div>
                <p className="text-xs mt-0.5 text-corthex-text-disabled font-mono">
                  Registered: {formatDate(k.createdAt)}
                  {k.updatedAt !== k.createdAt && ` | Updated: ${formatDate(k.updatedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setRotateTarget(k); setRotateFields({}) }}
                  className="text-xs font-mono font-bold text-corthex-warning hover:text-corthex-warning/80 transition-colors"
                >
                  Rotate
                </button>
                <button
                  onClick={() => setDeleteTarget(k)}
                  className="text-xs font-mono font-bold text-corthex-error hover:text-corthex-error/80 transition-colors"
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
      <div className="bg-corthex-bg border border-corthex-border/10 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="bg-corthex-bg border border-corthex-border/10 p-4 sm:p-6" data-testid="settings-handoff-depth">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 flex items-center justify-center bg-corthex-accent-muted">
          <ArrowLeftRight className="w-4 h-4 text-corthex-accent" />
        </div>
        <h3 className="font-mono font-bold text-sm text-corthex-text-primary uppercase tracking-widest">Handoff Depth</h3>
      </div>
      <p className="text-xs mb-6 text-corthex-text-disabled font-mono">Maximum handoff depth between AI agents. Higher values allow deeper agent chains.</p>

      <div className="flex items-center gap-6">
        <input
          type="range"
          min={1}
          max={10}
          value={depth}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none cursor-pointer bg-corthex-elevated accent-corthex-accent"
        />
        <span className="text-3xl font-mono font-black w-12 text-center tabular-nums text-corthex-accent">{depth}</span>
      </div>

      <div className="flex justify-between text-[10px] mt-2 font-mono text-corthex-text-disabled">
        <span>1 (Simple)</span>
        <span>10 (Complex)</span>
      </div>

      {dirty && (
        <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-corthex-border/10">
          <button
            onClick={() => { setDepth(currentDepth); setDirty(false) }}
            className="px-6 py-2 border border-corthex-border/20 text-corthex-text-secondary font-mono font-bold text-xs uppercase tracking-widest hover:bg-corthex-elevated transition-all"
          >
            Discard
          </button>
          <button
            onClick={() => mutation.mutate(depth)}
            disabled={mutation.isPending}
            className="px-10 py-2 bg-gradient-to-br from-corthex-accent to-corthex-accent-deep text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all"
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

  return (
    <div className="bg-corthex-bg border border-corthex-border/10 p-4 sm:p-6" data-testid="settings-defaults">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-corthex-accent-muted">
          <SlidersHorizontal className="w-4 h-4 text-corthex-accent" />
        </div>
        <h3 className="font-mono font-bold text-sm text-corthex-text-primary uppercase tracking-widest">Default Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-mono font-bold text-xs text-corthex-text-primary uppercase tracking-widest mb-2">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setDirty(true) }}
            className="w-full bg-corthex-elevated/50 border border-corthex-border/20 px-4 py-3 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent focus:border-corthex-accent outline-none appearance-none cursor-pointer"
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
          <label className="block font-mono font-bold text-xs text-corthex-text-primary uppercase tracking-widest mb-2">Default LLM Model</label>
          <select
            value={defaultModel}
            onChange={(e) => { setDefaultModel(e.target.value); setDirty(true) }}
            className="w-full bg-corthex-elevated/50 border border-corthex-border/20 px-4 py-3 text-corthex-text-primary font-mono text-sm focus:ring-1 focus:ring-corthex-accent focus:border-corthex-accent outline-none appearance-none cursor-pointer"
          >
            <option value="claude-sonnet-4-6-20250520">Claude Sonnet 4.6</option>
            <option value="claude-opus-4-6-20250520">Claude Opus 4.6</option>
          </select>
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-corthex-border/10">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-corthex-border/20 text-corthex-text-secondary font-mono font-bold text-xs uppercase tracking-widest hover:bg-corthex-elevated transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-10 py-2 bg-gradient-to-br from-corthex-accent to-corthex-accent-deep text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}

// === Main Settings Page ===

const SETTINGS_TABS = [
  { value: 'general', label: 'General' },
  { value: 'apikeys', label: 'API Keys' },
  { value: 'agent', label: 'Agent Settings' },
]

export function SettingsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [activeTab, setActiveTab] = useState('general')

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
      <div className="min-h-screen bg-corthex-bg flex items-center justify-center">
        <p className="text-sm text-corthex-text-disabled font-mono" data-testid="settings-no-company">회사를 선택하세요</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-corthex-bg">
        <div className="p-12 max-w-6xl space-y-6">
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
      <div className="min-h-screen bg-corthex-bg flex items-center justify-center">
        <p className="text-sm text-corthex-text-disabled font-mono">Unable to load company data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-corthex-bg">
      <div className="p-4 sm:p-6 lg:p-12 max-w-6xl" data-testid="settings-page">

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-corthex-accent shadow-[0_0_8px_rgba(202,138,4,0.5)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent/80">System Configuration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-corthex-text-primary tracking-tight mb-4">Admin Settings</h2>
          <p className="text-corthex-text-secondary max-w-2xl leading-relaxed font-mono text-sm">
            Configure global parameters for the CORTHEX core environment. High-precision adjustments made here affect all operational sub-systems.
          </p>
        </div>

        {/* Settings Terminal Container */}
        <div className="bg-corthex-surface shadow-2xl border border-corthex-border/10 overflow-hidden">

          {/* Tab Navigation */}
          <div className="flex border-b border-corthex-border/10 bg-corthex-bg/50 overflow-x-auto">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 sm:px-8 py-4 sm:py-5 font-mono font-bold text-sm tracking-wide transition-colors whitespace-nowrap min-h-[44px] ${
                  activeTab === tab.value
                    ? 'text-corthex-accent border-b-2 border-corthex-accent bg-corthex-surface'
                    : 'text-corthex-text-disabled hover:text-corthex-text-secondary hover:bg-corthex-elevated'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-10 space-y-6">
            {activeTab === 'general' && (
              <>
                <CompanyInfoSection company={company} onSave={handleSaveInfo} />
                <DefaultSettingsSection company={company} onSave={handleSaveSettings} />
              </>
            )}
            {activeTab === 'apikeys' && (
              <ApiKeySection companyId={selectedCompanyId} />
            )}
            {activeTab === 'agent' && (
              <HandoffDepthSection companyId={selectedCompanyId} />
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="bg-corthex-bg/80 border-t border-corthex-border/10 px-4 sm:px-10 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-4">
              <Info className="w-4 h-4 text-corthex-text-disabled" />
              <p className="text-[10px] font-mono text-corthex-text-disabled tracking-widest uppercase">
                Last synchronized: {new Date(company.updatedAt).toISOString().replace('T', ' ').slice(0, 19)} UTC
              </p>
            </div>
          </div>
        </div>

        {/* Auxiliary Info Cards */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-corthex-surface p-6 border border-corthex-border/5">
            <div className="flex items-center justify-between mb-4">
              <Terminal className="w-5 h-5 text-corthex-accent" />
              <span className="text-[10px] font-mono text-corthex-text-disabled tracking-widest uppercase">System Load</span>
            </div>
            <div className="text-2xl font-mono font-bold text-corthex-text-primary">14.2%</div>
            <div className="w-full bg-corthex-elevated h-px mt-4">
              <div className="bg-corthex-accent h-full" style={{ width: '14%' }} />
            </div>
          </div>
          <div className="bg-corthex-surface p-6 border border-corthex-border/5">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-5 h-5 text-corthex-info" />
              <span className="text-[10px] font-mono text-corthex-text-disabled tracking-widest uppercase">DB Latency</span>
            </div>
            <div className="text-2xl font-mono font-bold text-corthex-text-primary">24ms</div>
            <div className="w-full bg-corthex-elevated h-px mt-4">
              <div className="bg-corthex-info h-full" style={{ width: '35%' }} />
            </div>
          </div>
          <div className="bg-corthex-surface p-6 border border-corthex-border/5">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-5 h-5 text-corthex-success" />
              <span className="text-[10px] font-mono text-corthex-text-disabled tracking-widest uppercase">Auth Status</span>
            </div>
            <div className="text-2xl font-mono font-bold text-corthex-text-primary">ENCRYPTED</div>
            <div className="w-full bg-corthex-elevated h-px mt-4">
              <div className="bg-corthex-success h-full w-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
