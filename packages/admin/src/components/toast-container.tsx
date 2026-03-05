import { useToastStore } from '../stores/toast-store'

const iconMap = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const colorMap = {
  success:
    'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  error:
    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg text-sm animate-in slide-in-from-right ${colorMap[t.type]}`}
        >
          <span className="font-bold">{iconMap[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
