// Service Worker — P2에서 Web Push 알림 확장 예정
// 현재: 설치/활성화만, fetch 이벤트는 그대로 통과
const CACHE_NAME = 'corthex-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// P2에서 push 이벤트 추가 예정
// self.addEventListener('push', (event) => { ... })
