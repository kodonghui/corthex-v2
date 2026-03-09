import { useState, useCallback } from 'react'
import { cn } from './utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'
type ToastItem = { id: string; message: string; variant: ToastVariant }

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-indigo-600 text-white',
  warning: 'bg-amber-500 text-white',
}

const MAX_TOASTS = 3

let _addToast: ((message: string, variant: ToastVariant) => void) | null = null

export const toast = {
  success: (msg: string) => _addToast?.(msg, 'success'),
  error: (msg: string) => _addToast?.(msg, 'error'),
  info: (msg: string) => _addToast?.(msg, 'info'),
  warning: (msg: string) => _addToast?.(msg, 'warning'),
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID()
    setToasts((prev) => {
      const next = [...prev, { id, message, variant }]
      // FIFO: keep max 3
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }, [])

  _addToast = addToast

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto',
              'animate-[slideInRight_0.2s_ease-out]',
              variantStyles[t.variant],
            )}
          >
            {t.message}
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
