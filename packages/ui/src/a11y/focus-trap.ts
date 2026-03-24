/**
 * Focus management utilities for accessibility.
 * Focus trap for modals/dialogs, skip-to-content, focus ring styles.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ')

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null
  returnFocusOnDeactivate?: boolean
}

export function createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}) {
  const { initialFocus, returnFocusOnDeactivate = true } = options
  let previouslyFocused: HTMLElement | null = null
  let active = false

  function getFocusableElements(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .filter((el) => el.offsetParent !== null)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !active) return

    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  function activate() {
    if (active) return
    active = true
    previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeyDown)

    const target = initialFocus || getFocusableElements()[0]
    if (target) {
      requestAnimationFrame(() => target.focus())
    }
  }

  function deactivate() {
    if (!active) return
    active = false
    document.removeEventListener('keydown', handleKeyDown)

    if (returnFocusOnDeactivate && previouslyFocused) {
      previouslyFocused.focus()
      previouslyFocused = null
    }
  }

  return { activate, deactivate, isActive: () => active }
}

/** CSS class names for focus ring visibility */
export const focusRingClasses = {
  visible: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#606C38]',
  hidden: 'focus:outline-none',
  keyboard: 'focus-visible:ring-2 focus-visible:ring-[#606C38] focus-visible:ring-offset-2',
} as const

/** Skip-to-content link configuration */
export const skipToContentId = 'main-content'

export function getSkipToContentProps() {
  return {
    link: {
      href: `#${skipToContentId}`,
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#283618] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium',
      children: 'Skip to main content',
    },
    target: {
      id: skipToContentId,
      tabIndex: -1,
    },
  }
}
