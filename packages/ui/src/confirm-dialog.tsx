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
            className="px-3 py-1.5 text-sm rounded-lg border border-[#e5e1d3] text-[#1a1a1a] hover:bg-[#f5f0e8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606C38]/40"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              variant === 'danger'
                ? 'bg-[#c4622d] hover:bg-[#b5571f] focus-visible:ring-[#c4622d]/40'
                : 'bg-[#606C38] hover:bg-[#7a8f5a] focus-visible:ring-[#606C38]/40',
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
