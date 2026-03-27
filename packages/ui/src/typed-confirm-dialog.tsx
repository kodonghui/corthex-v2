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
            className="px-3 py-1.5 text-sm rounded-lg border border-[#e5e1d3] text-[#1a1a1a] hover:bg-[#f5f0e8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606C38]/40"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !isMatch}
            className="px-3 py-1.5 text-sm rounded-lg text-white bg-[#c4622d] hover:bg-[#b5571f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4622d]/40 focus-visible:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : confirmText}
          </button>
        </>
      }
    >
      <div className="mt-3">
        <label className="block text-xs font-medium text-[#666] mb-1.5">
          {inputLabel}: <span className="font-bold text-[#1a1a1a]">{requiredText}</span>
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={requiredText}
          className="w-full px-3 py-2 text-sm border border-[#e5e1d3] rounded-lg bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#c4622d]/40 focus:border-[#c4622d] placeholder:text-[#ccc]"
          autoFocus
        />
      </div>
    </Modal>
  )
}
