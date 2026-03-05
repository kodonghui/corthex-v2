import { create } from 'zustand'

export type Notification = {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  createdAt: Date
  read: boolean
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((s) => {
      const notification: Notification = {
        ...n,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        read: false,
      }
      return {
        notifications: [notification, ...s.notifications].slice(0, 50),
        unreadCount: s.unreadCount + 1,
      }
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))
