/**
 * Hook for mount/unmount animations.
 * Returns whether the element should be rendered and a ref for animation state.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { prefersReducedMotion } from '../a11y/reduced-motion'

export type AnimatedMountState = 'entering' | 'entered' | 'exiting' | 'exited'

export interface UseAnimatedMountOptions {
  /** Whether the component should be visible */
  isOpen: boolean
  /** Duration of enter animation in ms (default 200) */
  enterDuration?: number
  /** Duration of exit animation in ms (default 150) */
  exitDuration?: number
}

export interface UseAnimatedMountResult {
  /** Whether to render the element in DOM */
  shouldRender: boolean
  /** Current animation state */
  state: AnimatedMountState
  /** CSS classes for the current state */
  className: string
  /** Callback for transitionEnd if using CSS transitions */
  onTransitionEnd: () => void
}

export function useAnimatedMount({
  isOpen,
  enterDuration = 200,
  exitDuration = 150,
}: UseAnimatedMountOptions): UseAnimatedMountResult {
  const [state, setState] = useState<AnimatedMountState>(isOpen ? 'entered' : 'exited')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isOpen) {
      setState('entering')
      if (reducedMotion) {
        setState('entered')
      } else {
        timerRef.current = setTimeout(() => setState('entered'), enterDuration)
      }
    } else {
      if (state === 'exited') return
      setState('exiting')
      if (reducedMotion) {
        setState('exited')
      } else {
        timerRef.current = setTimeout(() => setState('exited'), exitDuration)
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isOpen, enterDuration, exitDuration, reducedMotion]) // eslint-disable-line react-hooks/exhaustive-deps

  const onTransitionEnd = useCallback(() => {
    setState((prev) => {
      if (prev === 'entering') return 'entered'
      if (prev === 'exiting') return 'exited'
      return prev
    })
  }, [])

  const shouldRender = state !== 'exited'

  const classMap: Record<AnimatedMountState, string> = {
    entering: 'opacity-0 scale-95',
    entered: 'opacity-100 scale-100',
    exiting: 'opacity-0 scale-95',
    exited: 'opacity-0 scale-95',
  }

  return {
    shouldRender,
    state,
    className: classMap[state],
    onTransitionEnd,
  }
}
