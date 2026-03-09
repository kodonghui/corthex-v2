import { Modal } from './modal'

type ConfirmDialogProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
      {description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">{description}</p>
      )}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-3 py-1.5 text-xs rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            variant === 'danger'
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500/40'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/40'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
