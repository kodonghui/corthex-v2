/**
 * ARIA pattern helpers for common accessibility patterns.
 */

/** Create props for a live region that announces dynamic content changes */
export function liveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  return {
    'aria-live': politeness,
    'aria-atomic': true as const,
    role: 'status' as const,
  }
}

/** Create props for an element described by another element */
export function describedBy(id: string) {
  return { 'aria-describedby': id }
}

/** Create props for an element labelled by another element */
export function labelledBy(id: string) {
  return { 'aria-labelledby': id }
}

/** Create props for a visually hidden element that provides accessible text */
export function visuallyHidden() {
  return {
    className: 'sr-only',
    'aria-hidden': false as const,
  }
}

/** Create props for an element that controls another */
export function controls(id: string) {
  return { 'aria-controls': id }
}

/** Create props for an expanded/collapsed toggle */
export function expandable(expanded: boolean, controlsId: string) {
  return {
    'aria-expanded': expanded,
    'aria-controls': controlsId,
  }
}

/** Create props for a loading state indicator */
export function busy(isBusy: boolean) {
  return {
    'aria-busy': isBusy,
  }
}

/** Create an ID from a prefix and a unique key */
export function ariaId(prefix: string, key: string | number) {
  return `${prefix}-${key}`
}

/** Announce a message to screen readers via a live region */
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const el = document.createElement('div')
  Object.assign(el.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  })
  el.setAttribute('aria-live', politeness)
  el.setAttribute('aria-atomic', 'true')
  el.setAttribute('role', 'status')
  document.body.appendChild(el)

  // Need a small delay for screen readers to pick up the region
  requestAnimationFrame(() => {
    el.textContent = message
    setTimeout(() => el.remove(), 3000)
  })
}
