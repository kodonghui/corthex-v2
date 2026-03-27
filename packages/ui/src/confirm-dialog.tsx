/**
 * ConfirmDialog — Modal with confirm/cancel buttons.
 * Danger variant for destructive actions.
 */
import { Modal } from './modal'
import { cn } from './utils'

type ConfirmDialogProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  loading?: boolean
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
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg border border-corthex-border text-corthex-text-primary hover:bg-corthex-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corthex-accent/40"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              variant === 'danger'
                ? 'bg-corthex-error hover:bg-corthex-error/80 focus-visible:ring-corthex-error/40'
                : 'bg-corthex-accent hover:bg-corthex-accent-hover focus-visible:ring-corthex-accent/40',
              loading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {loading ? '처리 중...' : confirmText}
          </button>
        </>
      }
    />
  )
}
