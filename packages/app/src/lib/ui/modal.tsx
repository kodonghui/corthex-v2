import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 transition-all duration-200"
        onClick={onClose}
      />
      <div className={cn(
        'relative z-10 bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4',
        'transition-all duration-200',
        className,
      )}>
        {title && (
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
