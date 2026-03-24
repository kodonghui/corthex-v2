/**
 * Toast system — Radix Toast with variants and auto-dismiss.
 * Includes useToast() hook for imperative usage.
 */
import { useState, useCallback, createContext, useContext } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from './utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'
type ToastItem = { id: string; message: string; variant: ToastVariant; duration: number }

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-[#c4622d] text-white',
  info: 'bg-[#60A5FA] text-white',
  warning: 'bg-amber-500 text-white',
}

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

// ── Context for imperative usage ───────────────────
type ToastContextType = {
  success: (msg: string, duration?: number) => void
  error: (msg: string, duration?: number) => void
  info: (msg: string, duration?: number) => void
  warning: (msg: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback for outside provider — use module-level toast
    return toast
  }
  return ctx
}

// ── Module-level imperative API ────────────────────
let _addToast: ((message: string, variant: ToastVariant, duration?: number) => void) | null = null

export const toast = {
  success: (msg: string, duration?: number) => _addToast?.(msg, 'success', duration),
  error: (msg: string, duration?: number) => _addToast?.(msg, 'error', duration),
  info: (msg: string, duration?: number) => _addToast?.(msg, 'info', duration),
  warning: (msg: string, duration?: number) => _addToast?.(msg, 'warning', duration),
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 5000

// ── Provider ───────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant, duration?: number) => {
    const id = crypto.randomUUID()
    const dur = duration ?? DEFAULT_DURATION
    setToasts((prev) => {
      const next = [...prev, { id, message, variant, duration: dur }]
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })
  }, [])

  _addToast = addToast

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const contextValue: ToastContextType = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id)
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
              'data-[state=open]:animate-[slideInRight_200ms_ease-out]',
              'data-[state=closed]:animate-[fadeOut_150ms_ease-in]',
              variantStyles[t.variant],
            )}
          >
            <span className="text-xs font-bold shrink-0">{variantIcons[t.variant]}</span>
            <ToastPrimitive.Description className="flex-1">{t.message}</ToastPrimitive.Description>
            <ToastPrimitive.Close className="ml-2 opacity-70 hover:opacity-100 shrink-0">
              ×
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
