import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Select } from '@corthex/ui'
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
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">SNS 계정 관리</h3>
        <button onClick={openCreate} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">+ 계정 추가</button>
      </div>

      {accounts.length === 0 && <p className="text-sm text-zinc-500 py-8 text-center">등록된 SNS 계정이 없습니다. 계정을 추가해보세요.</p>}

      {accounts.map((acct) => (
        <div key={acct.id} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{PLATFORM_LABELS[acct.platform] || acct.platform}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${acct.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-zinc-100 text-zinc-500'}`}>
                {acct.isActive ? '활성' : '비활성'}
              </span>
            </div>
            <p className="font-medium text-sm mt-1">{acct.accountName}</p>
            <p className="text-xs text-zinc-500">{acct.accountId}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEdit(acct)} className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">수정</button>
            <button onClick={() => { if (confirm('이 계정을 삭제하시겠습니까?')) deleteAccount.mutate(acct.id) }}
              className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30">삭제</button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-base font-semibold">{editing ? '계정 수정' : '계정 추가'}</h4>
            {!editing && <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} options={PLATFORM_OPTIONS} />}
            <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="계정 이름 (예: 회사 공식)"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <input value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} placeholder="계정 ID (예: @company_official)"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
            <div>
              <label className="block text-xs text-zinc-500 mb-1">인증 정보 (JSON, 선택)</label>
              <input type="password" value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                placeholder='{"apiKey": "...", "accessToken": "..."}'
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm font-mono" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={closeModal} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700">취소</button>
              <button onClick={handleSave}
                disabled={!form.accountName || !form.accountId || createAccount.isPending || updateAccount.isPending}
                className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {createAccount.isPending || updateAccount.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
