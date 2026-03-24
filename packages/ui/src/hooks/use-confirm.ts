/**
 * useConfirm — Imperative hook for confirmation dialogs.
 * Returns a confirm function that resolves with boolean.
 */
import { useState, useCallback } from 'react'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export interface UseConfirmResult {
  /** Show confirm dialog and wait for user response */
  confirm: (options: ConfirmOptions) => Promise<boolean>
  /** Current dialog state (for rendering ConfirmDialog) */
  dialogProps: {
    isOpen: boolean
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'danger'
    onConfirm: () => void
    onCancel: () => void
  }
}

export function useConfirm(): UseConfirmResult {
  const [state, setState] = useState<{
    isOpen: boolean
    options: ConfirmOptions
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: { title: '' },
    resolve: null,
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ isOpen: true, options, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ isOpen: false, options: { title: '' }, resolve: null })
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState({ isOpen: false, options: { title: '' }, resolve: null })
  }, [state.resolve])

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      title: state.options.title,
      description: state.options.description,
      confirmText: state.options.confirmText,
      cancelText: state.options.cancelText,
      variant: state.options.variant,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  }
}
