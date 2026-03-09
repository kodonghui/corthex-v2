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
  onOpenPresets?: () => void
}

export function CommandInput({ onSubmit, isSubmitting, managers, deptMap, presets = [], onOpenPresets }: Props) {
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

  // Group managers by department for the agents section
  const agentsByDept = new Map<string, Agent[]>()
  managers.forEach((agent) => {
    const deptName = deptMap.get(agent.departmentId) || 'Other'
    if (!agentsByDept.has(deptName)) agentsByDept.set(deptName, [])
    agentsByDept.get(deptName)!.push(agent)
  })

  return (
    <div className="relative border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      {/* Slash/Mention Popup */}
      {showSlash && (
        <div className="absolute bottom-full left-4 right-4 mb-2">
          <SlashPopup
            query={slashQuery}
            selectedIndex={slashIdx}
            onSelect={handleSlashSelect}
            onSelectPreset={handlePresetSelect}
            onClose={() => setShowSlash(false)}
            presets={presets}
          />
        </div>
      )}
      {showMention && (
        <div className="absolute bottom-full left-4 mb-2">
          <MentionPopup
            query={mentionQuery}
            selectedIndex={mentionIdx}
            agents={managers}
            deptMap={deptMap}
            onSelect={handleMentionSelect}
            onClose={() => setShowMention(false)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
          <textarea
            data-testid="command-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Give instructions to your AI team (e.g., "Analyze our Q3 sales data and create a presentation")...'
            aria-label="Command input. Use @ to mention agents, / for commands"
            rows={2}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            style={{ minHeight: '60px', maxHeight: '160px' }}
          />
          
          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleChange(text + '/')}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm"
                title="Commands"
              >
                /
              </button>
              <button
                onClick={() => handleChange(text + '@')}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm"
                title="Mention agent"
              >
                @
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {targetAgentId && (
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  <span>@{managers.find((m) => m.id === targetAgentId)?.name}</span>
                  <button
                    onClick={() => setTargetAgentId(undefined)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}
              
              <button
                onClick={onOpenPresets}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3 5h6M3 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Saved templates
              </button>
              
              <Button
                data-testid="command-submit"
                onClick={handleSubmit}
                disabled={!text.trim() || isSubmitting}
                className="h-8 px-4 text-sm font-medium"
                aria-label="Send command"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
