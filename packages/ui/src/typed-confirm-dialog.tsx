/**
 * TypedConfirmDialog — Requires user to type a matching string before confirming.
 * Used for dangerous operations like permanent company deletion.
 */
import { useState } from 'react'
import { Modal } from './modal'

type TypedConfirmDialogProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  requiredText: string
  inputLabel?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function TypedConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  requiredText,
  inputLabel = '이름을 정확히 입력하세요',
  confirmText = '영구 삭제',
  cancelText = '취소',
  loading = false,
}: TypedConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('')
  const isMatch = inputValue === requiredText

  const handleClose = () => {
    setInputValue('')
    onCancel()
  }

  const handleConfirm = () => {
    if (!isMatch) return
    setInputValue('')
    onConfirm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg border border-corthex-border text-corthex-text-primary hover:bg-corthex-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corthex-accent/40"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !isMatch}
            className="px-3 py-1.5 text-sm rounded-lg text-white bg-corthex-error hover:bg-corthex-error/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corthex-error/40 focus-visible:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : confirmText}
          </button>
        </>
      }
    >
      <div className="mt-3">
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">
          {inputLabel}: <span className="font-bold text-corthex-text-primary">{requiredText}</span>
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={requiredText}
          className="w-full px-3 py-2 text-sm border border-corthex-border rounded-lg bg-corthex-bg text-corthex-text-primary focus:outline-none focus:ring-2 focus:ring-corthex-error/40 focus:border-corthex-error placeholder:text-corthex-text-disabled"
          autoFocus
        />
      </div>
    </Modal>
  )
}
