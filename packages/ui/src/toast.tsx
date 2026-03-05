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
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  _addToast = addToast

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
              'transition-all duration-200',
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
