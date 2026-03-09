import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@corthex/ui'
import { SlashPopup, SLASH_COMMANDS, getFilteredCount } from './slash-popup'
import type { PresetItem } from './slash-popup'
import { MentionPopup } from './mention-popup'

type Agent = {
  id: string
  name: string
  tier: string
  departmentId: string
  status: string
}

type Props = {
  onSubmit: (text: string, targetAgentId?: string) => void
  isSubmitting: boolean
  managers: Agent[]
  deptMap: Map<string, string>
  presets?: PresetItem[]
}

export function CommandInput({ onSubmit, isSubmitting, managers, deptMap, presets = [] }: Props) {
  const [text, setText] = useState('')
  const [showSlash, setShowSlash] = useState(false)
  const [showMention, setShowMention] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [mentionQuery, setMentionQuery] = useState('')
  const [slashIdx, setSlashIdx] = useState(0)
  const [mentionIdx, setMentionIdx] = useState(0)
  const [targetAgentId, setTargetAgentId] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isSubmitting) return
    onSubmit(trimmed, targetAgentId)
    setText('')
    setTargetAgentId(undefined)
    setShowSlash(false)
    setShowMention(false)
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isSubmitting, onSubmit, targetAgentId])

  const handleChange = useCallback(
    (value: string) => {
      setText(value)

      // Slash detection: "/" at start or after whitespace
      const slashMatch = value.match(/(?:^|\s)\/(\S*)$/)
      if (slashMatch) {
        setSlashQuery(slashMatch[1])
        setSlashIdx(0)
        setShowSlash(true)
        setShowMention(false)
        return
      }
      setShowSlash(false)

      // Mention detection: "@" after start or whitespace
      const mentionMatch = value.match(/(?:^|\s)@(\S*)$/)
      if (mentionMatch) {
        setMentionQuery(mentionMatch[1])
        setMentionIdx(0)
        setShowMention(true)
        setShowSlash(false)
        return
      }
      setShowMention(false)
    },
    [],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle popups
      if (showSlash) {
        const totalFiltered = getFilteredCount(slashQuery, presets)
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSlashIdx((i) => Math.min(i + 1, totalFiltered - 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSlashIdx((i) => Math.max(i - 1, 0))
          return
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          // Determine if selected item is a command or preset
          const filteredCmds = SLASH_COMMANDS.filter((c) =>
            c.cmd.toLowerCase().includes(slashQuery.toLowerCase()),
          )
          if (slashIdx < filteredCmds.length) {
            handleSlashSelect(filteredCmds[slashIdx].cmd)
          } else {
            const q = slashQuery.toLowerCase()
            const filteredPresets = presets.filter((p) =>
              p.name.toLowerCase().includes(q) ||
              p.command.toLowerCase().includes(q) ||
              (p.category && p.category.toLowerCase().includes(q)),
            )
            const presetIdx = slashIdx - filteredCmds.length
            if (filteredPresets[presetIdx]) {
              handlePresetSelect(filteredPresets[presetIdx])
            }
          }
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowSlash(false)
          return
        }
      }

      if (showMention) {
        const filtered = managers.filter(
          (a) =>
            !mentionQuery ||
            a.name.toLowerCase().includes(mentionQuery.toLowerCase()),
        )
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setMentionIdx((i) => Math.min(i + 1, filtered.length - 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setMentionIdx((i) => Math.max(i - 1, 0))
          return
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          if (filtered[mentionIdx]) {
            handleMentionSelect(filtered[mentionIdx])
          }
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          setShowMention(false)
          return
        }
      }

      // Enter = submit (Shift+Enter = newline)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [showSlash, showMention, slashQuery, slashIdx, mentionQuery, mentionIdx, managers, presets, handleSubmit],
  )

  const handleSlashSelect = useCallback(
    (cmd: string) => {
      // Replace the /query with the selected command
      const newText = text.replace(/(?:^|\s)\/\S*$/, (match) => {
        const prefix = match.startsWith(' ') ? ' ' : ''
        return `${prefix}${cmd} `
      })
      setText(newText)
      setShowSlash(false)
      textareaRef.current?.focus()
    },
    [text],
  )

  const handlePresetSelect = useCallback(
    (preset: PresetItem) => {
      // Insert preset command text, replacing the /query
      const newText = text.replace(/(?:^|\s)\/\S*$/, (match) => {
        const prefix = match.startsWith(' ') ? ' ' : ''
        return `${prefix}${preset.command}`
      })
      setText(newText)
      setShowSlash(false)
      textareaRef.current?.focus()
    },
    [text],
  )

  const handleMentionSelect = useCallback(
    (agent: Agent) => {
      // Replace @query with @agentName
      const newText = text.replace(/(?:^|\s)@\S*$/, (match) => {
        const prefix = match.startsWith(' ') ? ' ' : ''
        return `${prefix}@${agent.name} `
      })
      setText(newText)
      setTargetAgentId(agent.id)
      setShowMention(false)
      textareaRef.current?.focus()
    },
    [text],
  )

  return (
    <div className="relative border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3">
      {showSlash && (
        <SlashPopup
          query={slashQuery}
          selectedIndex={slashIdx}
          onSelect={handleSlashSelect}
          onSelectPreset={handlePresetSelect}
          onClose={() => setShowSlash(false)}
          presets={presets}
        />
      )}
      {showMention && (
        <MentionPopup
          query={mentionQuery}
          selectedIndex={mentionIdx}
          agents={managers}
          deptMap={deptMap}
          onSelect={handleMentionSelect}
          onClose={() => setShowMention(false)}
        />
      )}

      <div className="flex items-end gap-2">
        <textarea
          data-testid="command-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="명령을 입력하세요 (@에이전트 지정, /명령어 사용)"
          aria-label="명령 입력. @로 에이전트 지정, /로 명령어 사용"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          style={{ minHeight: '40px', maxHeight: '160px' }}
        />
        <Button
          data-testid="command-submit"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="h-10 w-10 flex-shrink-0 rounded-lg"
          aria-label="명령 전송"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mx-auto">
              <path d="M3 13L13 8L3 3V7L9 8L3 9V13Z" fill="currentColor" />
            </svg>
          )}
        </Button>
      </div>

      {targetAgentId && (
        <div className="mt-1 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
          <span>대상:</span>
          <span className="font-medium">{managers.find((m) => m.id === targetAgentId)?.name}</span>
          <button
            onClick={() => setTargetAgentId(undefined)}
            className="ml-1 text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
