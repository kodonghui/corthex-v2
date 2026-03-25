import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Toggle } from '@corthex/ui'

type PrefsData = {
  inApp: boolean
  email: boolean
  settings: Record<string, { inApp: boolean; email: boolean }> | null
}

const EVENT_CATEGORIES = [
  {
    label: '채팅',
    events: [
      { key: 'chat_complete', label: '에이전트 응답 완료', icon: '🔔' },
      { key: 'tool_error', label: '도구 호출 실패', icon: '⚠️' },
      { key: 'delegation_complete', label: '위임 완료', icon: '🤖' },
    ],
  },
  {
    label: '작업',
    events: [
      { key: 'job_complete', label: '야간작업 완료', icon: '✅' },
      { key: 'job_error', label: '야간작업 실패', icon: '❌' },
    ],
  },
  {
    label: '시스템',
    events: [
      { key: 'system', label: '시스템 알림', icon: '⚙️' },
    ],
  },
]

const DEFAULT_SETTINGS: Record<string, { inApp: boolean; email: boolean }> = {
  chat_complete: { inApp: true, email: false },
  tool_error: { inApp: true, email: false },
  delegation_complete: { inApp: true, email: false },
  job_complete: { inApp: true, email: true },
  job_error: { inApp: true, email: true },
  system: { inApp: true, email: false },
}

export function NotificationSettings() {
  const queryClient = useQueryClient()

  const { data: prefsData } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: () => api.get<{ data: PrefsData }>('/workspace/notification-prefs'),
  })

  const { data: emailConfigData } = useQuery({
    queryKey: ['email-configured'],
    queryFn: () => api.get<{ data: { configured: boolean } }>('/workspace/notifications/email-configured'),
  })

  const updatePrefs = useMutation({
    mutationFn: (body: Partial<PrefsData>) =>
      api.put('/workspace/notification-prefs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-prefs'] })
    },
  })

  const prefs = prefsData?.data
  const emailConfigured = emailConfigData?.data?.configured ?? false
  const settings = prefs?.settings ?? DEFAULT_SETTINGS

  const getEventPref = (key: string) => {
    const s = (settings as Record<string, { inApp: boolean; email: boolean }>)[key]
    return s ?? DEFAULT_SETTINGS[key] ?? { inApp: true, email: false }
  }

  const toggleGlobal = (field: 'inApp' | 'email', value: boolean) => {
    updatePrefs.mutate({ [field]: value })
  }

  const toggleEvent = (eventKey: string, field: 'inApp' | 'email', value: boolean) => {
    const current = { ...DEFAULT_SETTINGS, ...settings }
    current[eventKey] = { ...current[eventKey], [field]: value }
    updatePrefs.mutate({ settings: current })
  }

  return (
    <div className="space-y-4" data-testid="notification-settings">
      {/* SMTP 미설정 배너 */}
      {!emailConfigured && (
        <div className="px-4 py-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-sm text-amber-300">
          이메일 알림을 사용하려면 관리자에게 SMTP 설정을 요청하세요
        </div>
      )}

      {/* 전체 설정 */}
      <div className="bg-stone-100/50 border border-stone-200 rounded-xl">
        <div className="px-4 py-3 border-b border-stone-200">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">전체 설정</p>
        </div>
        <div className="divide-y divide-corthex-border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-600">앱 알림</span>
            <Toggle
              checked={prefs?.inApp ?? true}
              onChange={(v) => toggleGlobal('inApp', v)}
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-stone-600">이메일 알림</span>
            <Toggle
              checked={prefs?.email ?? false}
              onChange={(v) => toggleGlobal('email', v)}
              disabled={!emailConfigured}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* 이벤트별 설정 */}
      {EVENT_CATEGORIES.map((cat) => (
        <div key={cat.label} className="bg-stone-100/50 border border-stone-200 rounded-xl">
          <div className="px-4 py-3 border-b border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{cat.label}</p>
          </div>
          <div className="divide-y divide-corthex-border">
            {/* 헤더 */}
            <div className="flex items-center px-4 py-2 text-[11px] text-stone-400">
              <span className="flex-1" />
              <span className="w-14 text-center">앱</span>
              <span className="w-14 text-center">이메일</span>
            </div>
            {cat.events.map((ev) => {
              const pref = getEventPref(ev.key)
              return (
                <div key={ev.key} className="flex items-center px-4 py-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm">{ev.icon}</span>
                    <span className="text-sm text-stone-600">{ev.label}</span>
                  </div>
                  <div className="w-14 flex justify-center">
                    <Toggle
                      checked={pref.inApp}
                      onChange={(v) => toggleEvent(ev.key, 'inApp', v)}
                      disabled={!(prefs?.inApp ?? true)}
                      size="sm"
                    />
                  </div>
                  <div className="w-14 flex justify-center">
                    <Toggle
                      checked={pref.email}
                      onChange={(v) => toggleEvent(ev.key, 'email', v)}
                      disabled={!emailConfigured || !(prefs?.email ?? false)}
                      size="sm"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* 30일 보관 안내 */}
      <p className="text-xs text-stone-400 text-center py-2">
        알림은 30일간 보관됩니다
      </p>
    </div>
  )
}
