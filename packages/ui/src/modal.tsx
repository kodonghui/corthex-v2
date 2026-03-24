/**
 * Modal — Radix Dialog wrapper with Natural Organic styling.
 * Sizes: sm, md, lg, xl. Header, body, footer slots.
 */
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from './utils'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  size?: ModalSize
  className?: string
  /** Footer slot */
  footer?: React.ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', footer, className }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-[fadeIn_200ms_ease-out]" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)] rounded-xl bg-white shadow-xl',
            'data-[state=open]:animate-[scaleIn_150ms_ease-out]',
            'focus:outline-none',
            sizeClasses[size],
            className,
          )}
        >
          {/* Header */}
          {(title || true) && (
            <div className="flex items-start justify-between px-6 pt-6 pb-0">
              <div>
                {title && <Dialog.Title className="text-base font-semibold text-[#1a1a1a]">{title}</Dialog.Title>}
                {description && <Dialog.Description className="text-sm text-[#6b705c] mt-1">{description}</Dialog.Description>}
                {!title && <Dialog.Title className="sr-only">Dialog</Dialog.Title>}
              </div>
              <Dialog.Close className="rounded-md p-1 text-[#a3a08e] hover:text-[#1a1a1a] hover:bg-[#f5f0e8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#606C38]/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
