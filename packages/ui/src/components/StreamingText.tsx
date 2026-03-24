/**
 * StreamingText — Displays text that streams in character by character.
 * Used for SSE agent responses with cursor blink animation.
 */
import { useState, useEffect, useRef } from 'react'
import { cn } from '../utils'

export interface StreamingTextProps {
  /** The full text to display (updates as new chunks arrive) */
  text: string
  /** Whether streaming is still in progress */
  isStreaming?: boolean
  /** Speed in ms per character (default 0 = instant, relies on SSE chunks) */
  speed?: number
  /** Show blinking cursor */
  showCursor?: boolean
  /** Render as markdown (pass true to wrap in prose classes) */
  markdown?: boolean
  /** Additional class names */
  className?: string
}

export function StreamingText({
  text,
  isStreaming = false,
  speed = 0,
  showCursor = true,
  markdown = false,
  className,
}: StreamingTextProps) {
  const [displayText, setDisplayText] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (speed === 0) {
      // Instant mode — show all text as it arrives from SSE
      setDisplayText(text)
      indexRef.current = text.length
      return
    }

    // Character-by-character mode
    const animate = () => {
      if (indexRef.current < text.length) {
        indexRef.current++
        setDisplayText(text.slice(0, indexRef.current))
        timerRef.current = setTimeout(animate, speed)
      }
    }

    if (indexRef.current < text.length) {
      animate()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, speed])

  return (
    <div
      className={cn(
        'relative',
        markdown && 'prose prose-sm max-w-none',
        className,
      )}
    >
      <span className="whitespace-pre-wrap break-words">{displayText}</span>
      {showCursor && isStreaming && (
        <span
          className="inline-block w-[2px] h-[1.1em] bg-[#283618] ml-0.5 align-text-bottom animate-[cursor-blink_1s_step-end_infinite]"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
