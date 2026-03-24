/**
 * FormField — Wrapper with label, error message, and helper text.
 */
import { cn } from '../utils'

export interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  helperText,
  required,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-[#1a1a1a]"
        >
          {label}
          {required && <span className="text-[#c4622d] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-[#c4622d]" role="alert">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-[#6b705c]">{helperText}</p>
      )}
    </div>
  )
}
