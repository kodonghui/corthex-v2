/**
 * Story 23.11 — Forms, Modals, Toasts & Interactive Patterns Tests
 */
import { describe, test, expect } from 'bun:test'
import {
  Modal,
  ConfirmDialog,
  toast,
  ToastProvider,
  useToast,
  useConfirm,
  FormField,
  RadixSelect,
  RadixSwitch,
  Select,
  Toggle,
  Textarea,
  Input,
} from '@corthex/ui'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── Form Components ────────────────────────────────
describe('Forms: FormField', () => {
  test('FormField is exported', () => {
    expect(typeof FormField).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/FormField.tsx'), 'utf-8')

  test('has label support', () => {
    expect(src).toContain('<label')
    expect(src).toContain('htmlFor')
  })

  test('has error state', () => {
    expect(src).toContain('role="alert"')
    expect(src).toContain('error')
  })

  test('has helper text', () => {
    expect(src).toContain('helperText')
  })

  test('has required indicator', () => {
    expect(src).toContain('required')
    expect(src).toContain('*')
  })
})

describe('Forms: RadixSelect', () => {
  test('RadixSelect is exported', () => {
    expect(typeof RadixSelect).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/RadixSelect.tsx'), 'utf-8')

  test('uses Radix Select primitive', () => {
    expect(src).toContain('@radix-ui/react-select')
    expect(src).toContain('SelectPrimitive.Root')
    expect(src).toContain('SelectPrimitive.Trigger')
  })

  test('has error styling', () => {
    expect(src).toContain("error")
    expect(src).toContain("border-[#c4622d]")
  })

  test('supports disabled state', () => {
    expect(src).toContain('disabled')
  })
})

describe('Forms: RadixSwitch', () => {
  test('RadixSwitch is exported', () => {
    expect(typeof RadixSwitch).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/components/RadixSwitch.tsx'), 'utf-8')

  test('uses Radix Switch primitive', () => {
    expect(src).toContain('@radix-ui/react-switch')
    expect(src).toContain('SwitchPrimitive.Root')
    expect(src).toContain('SwitchPrimitive.Thumb')
  })

  test('has label support', () => {
    expect(src).toContain('label')
  })

  test('uses olive accent for checked state', () => {
    expect(src).toContain('#606C38')
  })
})

describe('Forms: Existing Components', () => {
  test('Select (native) is exported', () => {
    expect(typeof Select).toBe('function')
  })

  test('Toggle is exported', () => {
    expect(typeof Toggle).toBe('function')
  })

  test('Textarea is exported', () => {
    expect(typeof Textarea).toBe('function')
  })

  test('Input is exported', () => {
    expect(typeof Input).toBe('function')
  })
})

// ── Modal ──────────────────────────────────────────
describe('Forms: Modal', () => {
  test('Modal is exported', () => {
    expect(typeof Modal).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/modal.tsx'), 'utf-8')

  test('uses Radix Dialog', () => {
    expect(src).toContain('@radix-ui/react-dialog')
    expect(src).toContain('Dialog.Root')
    expect(src).toContain('Dialog.Portal')
  })

  test('supports sizes (sm, md, lg, xl)', () => {
    expect(src).toContain("'sm'")
    expect(src).toContain("'md'")
    expect(src).toContain("'lg'")
    expect(src).toContain("'xl'")
    expect(src).toContain('max-w-sm')
    expect(src).toContain('max-w-lg')
    expect(src).toContain('max-w-2xl')
    expect(src).toContain('max-w-4xl')
  })

  test('has header with title', () => {
    expect(src).toContain('Dialog.Title')
  })

  test('has footer slot', () => {
    expect(src).toContain('footer')
  })

  test('has close button', () => {
    expect(src).toContain('Dialog.Close')
    expect(src).toContain('Close')
  })

  test('supports Escape key via Radix', () => {
    // Radix Dialog handles Escape natively
    expect(src).toContain('Dialog.Root')
  })
})

// ── Toast ──────────────────────────────────────────
describe('Forms: Toast', () => {
  test('toast imperative API is exported', () => {
    expect(typeof toast.success).toBe('function')
    expect(typeof toast.error).toBe('function')
    expect(typeof toast.warning).toBe('function')
    expect(typeof toast.info).toBe('function')
  })

  test('ToastProvider is exported', () => {
    expect(typeof ToastProvider).toBe('function')
  })

  test('useToast hook is exported', () => {
    expect(typeof useToast).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/toast.tsx'), 'utf-8')

  test('uses Radix Toast', () => {
    expect(src).toContain('@radix-ui/react-toast')
    expect(src).toContain('ToastPrimitive.Provider')
    expect(src).toContain('ToastPrimitive.Root')
    expect(src).toContain('ToastPrimitive.Viewport')
  })

  test('has all 4 variants', () => {
    expect(src).toContain("success:")
    expect(src).toContain("error:")
    expect(src).toContain("info:")
    expect(src).toContain("warning:")
  })

  test('auto-dismiss (5s default)', () => {
    expect(src).toContain('5000')
  })
})

// ── ConfirmDialog ──────────────────────────────────
describe('Forms: ConfirmDialog', () => {
  test('ConfirmDialog is exported', () => {
    expect(typeof ConfirmDialog).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/confirm-dialog.tsx'), 'utf-8')

  test('uses Modal internally', () => {
    expect(src).toContain("import { Modal }")
    expect(src).toContain('<Modal')
  })

  test('has danger variant', () => {
    expect(src).toContain("variant === 'danger'")
    expect(src).toContain('#c4622d')
  })
})

// ── useConfirm Hook ────────────────────────────────
describe('Forms: useConfirm', () => {
  test('useConfirm is exported', () => {
    expect(typeof useConfirm).toBe('function')
  })

  const src = readFileSync(resolve(__dirname, '../../../ui/src/hooks/use-confirm.ts'), 'utf-8')

  test('returns confirm function and dialogProps', () => {
    expect(src).toContain('confirm:')
    expect(src).toContain('dialogProps:')
  })

  test('uses Promise for async result', () => {
    expect(src).toContain('Promise<boolean>')
  })

  test('supports danger variant', () => {
    expect(src).toContain("'danger'")
  })
})
