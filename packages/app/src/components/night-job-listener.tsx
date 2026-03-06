import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useWsStore } from '../stores/ws-store'
import { useAuthStore } from '../stores/auth-store'
import { toast } from '@corthex/ui'

/**
 * 글로벌 야간작업 WS 리스너 — Layout에 마운트
 * /jobs 이외 페이지에서 작업 완료/실패 시 Toast 표시
 */
export function NightJobListener() {
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  useEffect(() => {
    if (!isConnected || !user) return

    subscribe('night-job', {})
    const channelKey = `night-job::${user.companyId}`

    const handler = (data: unknown) => {
      const event = data as { type: string; jobId?: string; instruction?: string }

      // /jobs 페이지에서는 토스트 비활성화 (카드에서 직접 확인 가능)
      if (location.pathname.startsWith('/jobs')) return

      const label = event.instruction ? event.instruction.slice(0, 30) : ''

      if (event.type === 'job-completed') {
        toast.success(label ? `야간 작업 완료: ${label}` : '야간 작업이 완료되었습니다')
      } else if (event.type === 'job-failed') {
        toast.error(label ? `야간 작업 실패: ${label}` : '야간 작업이 실패했습니다')
      }
    }

    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [isConnected, user, subscribe, addListener, removeListener, location.pathname])

  return null
}
