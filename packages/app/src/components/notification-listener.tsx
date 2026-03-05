import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useWsStore } from '../stores/ws-store'
import { toast } from '@corthex/ui'

/**
 * 전역 알림 WS 리스너 — Layout에 마운트
 * /notifications 이외 페이지에서 새 알림 수신 시 Toast 표시
 */
export function NotificationListener() {
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const queryClient = useQueryClient()
  const location = useLocation()

  useEffect(() => {
    if (!isConnected) return

    subscribe('notifications', {})

    const userId = localStorage.getItem('corthex_user')
      ? JSON.parse(localStorage.getItem('corthex_user')!).id
      : null
    if (!userId) return

    const channelKey = `notifications::${userId}`

    const handler = (data: unknown) => {
      const event = data as { type: string; notification?: { title: string } }
      if (event.type === 'new-notification') {
        // React Query 갱신 (사이드바 뱃지 + 알림 목록)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notifications-count'] })

        // /notifications 이외 페이지에서만 Toast
        if (!location.pathname.startsWith('/notifications')) {
          toast.info(event.notification?.title || '새 알림이 도착했습니다')
        }
      }
    }

    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [isConnected, subscribe, addListener, removeListener, queryClient, location.pathname])

  return null
}
