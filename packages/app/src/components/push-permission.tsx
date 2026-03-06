import { useEffect, useRef } from 'react'
import { api } from '../lib/api'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray.buffer as ArrayBuffer
}

export function PushPermission() {
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    // Only request push for installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (!isStandalone) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') return
    if (Notification.permission === 'granted') {
      subscribePush()
      return
    }

    // Request permission on first relevant notification
    Notification.requestPermission().then((result) => {
      if (result === 'granted') subscribePush()
    })
  }, [])

  return null
}

async function subscribePush() {
  try {
    const res = await api.get<{ data: string }>('/workspace/push/vapid-key')
    const vapidKey = res.data
    if (!vapidKey) return

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
    }

    const subJson = subscription.toJSON()
    if (subJson.endpoint && subJson.keys) {
      await api.post('/workspace/push/subscribe', {
        endpoint: subJson.endpoint,
        keys: { p256dh: subJson.keys.p256dh, auth: subJson.keys.auth },
      })
    }
  } catch {
    // Push setup failed — not critical
  }
}
