import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ── useDebouncedValue ──

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

// ── useThrottledCallback ──

export function useThrottledCallback<T extends (...args: never[]) => void>(
  callback: T,
  delayMs: number,
): T {
  const lastRun = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const elapsed = now - lastRun.current

      if (elapsed >= delayMs) {
        lastRun.current = now
        callbackRef.current(...args)
      } else {
        // Schedule trailing call
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now()
          callbackRef.current(...args)
        }, delayMs - elapsed)
      }
    },
    [delayMs],
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return throttled
}

// ── useIntersectionObserver ──

export interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  root?: Element | null
  once?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0, rootMargin = '0px', root = null, once = false } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<Element | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: Element | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node) {
        elementRef.current = null
        return
      }

      elementRef.current = node

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting)
          if (entry.isIntersecting && once) {
            observerRef.current?.disconnect()
          }
        },
        { threshold, rootMargin, root },
      )

      observerRef.current.observe(node)
    },
    [threshold, rootMargin, root, once],
  )

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return [ref, isIntersecting]
}

// ── useVirtualList ──

export interface UseVirtualListOptions {
  itemCount: number
  itemHeight: number
  overscan?: number
  containerHeight: number
}

export interface VirtualItem {
  index: number
  offsetTop: number
}

export function useVirtualList({
  itemCount,
  itemHeight,
  overscan = 5,
  containerHeight,
}: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = itemCount * itemHeight

  const visibleItems: VirtualItem[] = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
    )

    const items: VirtualItem[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({ index: i, offsetTop: i * itemHeight })
    }
    return items
  }, [scrollTop, itemHeight, itemCount, overscan, containerHeight])

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    totalHeight,
    visibleItems,
    onScroll,
  }
}
