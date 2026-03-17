import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { SnsAccount } from './sns-types'
import { PLATFORM_LABELS, PLATFORM_OPTIONS } from './sns-types'

interface AccountsTabProps {
  accounts: SnsAccount[]
}

export function AccountsTab({ accounts }: AccountsTabProps) {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SnsAccount | null>(null)
  const [form, setForm] = useState({ platform: 'instagram', accountName: '', accountId: '', credentials: '' })

  const createAccount = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/workspace/sns-accounts', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns-accounts'] }); closeModal() },
  })

  const updateAccount = useMutation({
    mutationFn: ({ id, ...data }: { id: string; accountName?: string; accountId?: string; credentials?: Record<string, string> }) =>
      api.put(`/workspace/sns-accounts/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sns-accounts'] }); closeModal() },
  })

  const deleteAccount = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/sns-accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sns-accounts'] }),
  })

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm({ platform: 'instagram', accountName: '', accountId: '', credentials: '' })
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ platform: 'instagram', accountName: '', accountId: '', credentials: '' })
    setShowModal(true)
  }

  const openEdit = (acct: SnsAccount) => {
    setEditing(acct)
    setForm({ platform: acct.platform, accountName: acct.accountName, accountId: acct.accountId, credentials: '' })
    setShowModal(true)
  }

  const handleSave = () => {
    let creds: Record<string, string> | undefined
    if (form.credentials) {
      try { creds = JSON.parse(form.credentials) } catch { alert('인증 정보 JSON 형식이 올바르지 않습니다'); return }
    }
    if (editing) {
      updateAccount.mutate({ id: editing.id, accountName: form.accountName, accountId: form.accountId, ...(creds ? { credentials: creds } : {}) })
    } else {
      createAccount.mutate({ platform: form.platform, accountName: form.accountName, accountId: form.accountId, ...(creds ? { credentials: creds } : {}) })
    }
  }

  return (
    <div data-testid="sns-accounts-tab" className="max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-50">SNS 계정 관리</h3>
        <button data-testid="sns-add-account-btn" onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium">+ 계정 추가</button>
      </div>

      {accounts.length === 0 && (
        <div data-testid="sns-accounts-empty" className="text-center py-16">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-sm text-stone-500">등록된 SNS 계정이 없습니다</p>
          <p className="text-xs text-stone-400">계정을 추가해보세요.</p>
        </div>
      )}

      {accounts.map((acct) => (
        <div key={acct.id} data-testid={`sns-account-${acct.id}`}
          className="bg-stone-100/50 border border-stone-200 rounded-xl p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{PLATFORM_LABELS[acct.platform] || acct.platform}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${acct.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-200 text-stone-500'}`}>
                {acct.isActive ? '활성' : '비활성'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 mt-1">{acct.accountName}</p>
            <p className="text-xs text-stone-400">{acct.accountId}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEdit(acct)}
              className="border border-stone-300 text-stone-500 text-xs px-3 py-1.5 rounded-lg hover:bg-stone-200">수정</button>
            <button onClick={() => { if (confirm('이 계정을 삭제하시겠습니까?')) deleteAccount.mutate(acct.id) }}
              className="border border-red-500/50 text-red-400 text-xs px-3 py-1.5 rounded-lg">삭제</button>
          </div>
        </div>
      ))}

      {/* Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-stone-100 border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-base font-semibold text-slate-50">{editing ? '계정 수정' : '계정 추가'}</h4>
            {!editing && (
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600">
                {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="계정 이름 (예: 회사 공식)"
              className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600" />
            <input value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} placeholder="계정 ID (예: @company_official)"
              className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600" />
            <div>
              <label className="block text-xs text-stone-500 mb-1">인증 정보 (JSON, 선택)</label>
              <input type="password" value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                placeholder='{"apiKey": "...", "accessToken": "..."}'
                className="w-full bg-stone-100 border border-stone-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-stone-600 font-mono" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="text-stone-500 text-sm px-3 py-1.5 hover:text-slate-200">취소</button>
              <button onClick={handleSave}
                disabled={!form.accountName || !form.accountId || createAccount.isPending || updateAccount.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
                {createAccount.isPending || updateAccount.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
