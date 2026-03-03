import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

type ApiKey = {
  id: string
  provider: string
  label: string | null
  createdAt: string
}

const providerLabels: Record<string, string> = {
  kis: 'KIS 증권',
  notion: '노션',
  email: '이메일',
  telegram: '텔레그램',
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formProvider, setFormProvider] = useState('kis')
  const [formLabel, setFormLabel] = useState('')
  const [formKey, setFormKey] = useState('')

  const { data: keysData } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get<{ data: ApiKey[] }>('/workspace/profile/api-keys'),
  })

  const registerKey = useMutation({
    mutationFn: (body: { provider: string; label?: string; key: string }) =>
      api.post('/workspace/profile/api-keys', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setShowForm(false)
      setFormLabel('')
      setFormKey('')
    },
  })

  const deleteKey = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/profile/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  })

  const keys = keysData?.data || []

  const handleRegister = () => {
    if (!formKey.trim()) return
    registerKey.mutate({
      provider: formProvider,
      ...(formLabel.trim() ? { label: formLabel.trim() } : {}),
      key: formKey.trim(),
    })
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">설정</h2>

      <div className="max-w-lg space-y-6">
        {/* API Key 관리 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">개인 API Key</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showForm ? '취소' : '+ 새 키 등록'}
            </button>
          </div>

          {/* 등록 폼 */}
          {showForm && (
            <div className="mb-4 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">서비스</label>
                <select
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                >
                  <option value="kis">KIS 증권</option>
                  <option value="notion">노션</option>
                  <option value="email">이메일</option>
                  <option value="telegram">텔레그램</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">라벨 (선택)</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="예: 내 KIS 계정"
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">API Key</label>
                <input
                  type="password"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="API key 입력"
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={!formKey.trim() || registerKey.isPending}
                className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {registerKey.isPending ? '등록 중...' : '등록 (AES-256 암호화 저장)'}
              </button>
            </div>
          )}

          {/* 등록된 키 목록 */}
          <div className="space-y-2">
            {keys.length === 0 ? (
              <div className="text-center py-6 text-sm text-zinc-400">
                등록된 API key가 없습니다
              </div>
            ) : (
              keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 rounded-md border border-zinc-200 dark:border-zinc-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {providerLabels[key.provider] || key.provider}
                      </span>
                      <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                        연동됨
                      </span>
                    </div>
                    {key.label && (
                      <p className="text-xs text-zinc-400 mt-0.5">{key.label}</p>
                    )}
                    <p className="text-[10px] text-zinc-400">
                      {new Date(key.createdAt).toLocaleDateString('ko-KR')} 등록
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('이 API key를 삭제하시겠습니까?')) {
                        deleteKey.mutate(key.id)
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 연동 상태 안내 */}
        <section>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">서비스 연동 안내</h3>
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800">
              <span className="font-medium">KIS 증권</span> — 한국투자증권 API key를 등록하면 에이전트가 매매 현황을 조회할 수 있습니다.
            </div>
            <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800">
              <span className="font-medium">노션</span> — 노션 API key를 등록하면 노션 연동 도구를 사용할 수 있습니다.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
