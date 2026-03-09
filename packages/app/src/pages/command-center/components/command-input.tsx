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

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isSubmitting, onSubmit, targetAgentId])

  const handleChange = useCallback((value: string) => {
    setText(value)

    const slashMatch = value.match(/(?:^|\s)\/(\S*)$/)
    if (slashMatch) {
      setSlashQuery(slashMatch[1])
      setSlashIdx(0)
      setShowSlash(true)
      setShowMention(false)
      return
    }
    setShowSlash(false)

    const mentionMatch = value.match(/(?:^|\s)@(\S*)$/)
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setMentionIdx(0)
      setShowMention(true)
      setShowSlash(false)
      return
    }
    setShowMention(false)
  }, [])

  const handleSlashSelect = useCallback(
    (cmd: string) => {
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSlash) {
        const totalFiltered = getFilteredCount(slashQuery, presets)
        if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIdx((i) => Math.min(i + 1, totalFiltered - 1)); return }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIdx((i) => Math.max(i - 1, 0)); return }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          const filteredCmds = SLASH_COMMANDS.filter((c) => c.cmd.toLowerCase().includes(slashQuery.toLowerCase()))
          if (slashIdx < filteredCmds.length) {
            handleSlashSelect(filteredCmds[slashIdx].cmd)
          } else {
            const q = slashQuery.toLowerCase()
            const filteredPresets = presets.filter((p) =>
              p.name.toLowerCase().includes(q) || p.command.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)),
            )
            const presetIdx = slashIdx - filteredCmds.length
            if (filteredPresets[presetIdx]) handlePresetSelect(filteredPresets[presetIdx])
          }
          return
        }
        if (e.key === 'Escape') { e.preventDefault(); setShowSlash(false); return }
      }

      if (showMention) {
        const filtered = managers.filter((a) => !mentionQuery || a.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx((i) => Math.min(i + 1, filtered.length - 1)); return }
        if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx((i) => Math.max(i - 1, 0)); return }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault()
          if (filtered[mentionIdx]) handleMentionSelect(filtered[mentionIdx])
          return
        }
        if (e.key === 'Escape') { e.preventDefault(); setShowMention(false); return }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [showSlash, showMention, slashQuery, slashIdx, mentionQuery, mentionIdx, managers, presets, handleSubmit, handleSlashSelect, handlePresetSelect, handleMentionSelect],
  )

  const isEmpty = !text.trim()

  return (
    <div className="relative border-t border-zinc-800 bg-zinc-950">
      {/* Popups */}
      {showSlash && (
        <div className="absolute bottom-full left-3 right-3 mb-1">
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
        <div className="absolute bottom-full left-3 mb-1">
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

      {/* Input wrapper */}
      <div className="px-3 py-3">
        <div className={`rounded-xl border transition-colors overflow-hidden ${
          text ? 'border-zinc-600 bg-zinc-900' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
        }`}>
          {/* Target agent chip */}
          {targetAgentId && (
            <div className="flex items-center gap-2 px-4 pt-2.5">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-corthex-accent/10 border border-corthex-accent/30 text-corthex-accent-dark text-xs font-medium">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-70">
                  <circle cx="5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 9c0-2 1.8-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                @{managers.find((m) => m.id === targetAgentId)?.name}
                <button
                  onClick={() => setTargetAgentId(undefined)}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M2 2l4 4M6 2L2 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            data-testid="command-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Give instructions to your AI team... (/ for commands, @ to mention)"
            aria-label="Command input. Use @ to mention agents, / for commands"
            rows={2}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
            style={{ minHeight: '56px', maxHeight: '160px' }}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-0">
            {/* Left: trigger shortcuts */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleChange(text + '/')}
                title="Commands (/)"
                className="h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-mono"
              >
                /
              </button>
              <button
                type="button"
                onClick={() => handleChange(text + '@')}
                title="Mention agent (@)"
                className="h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-mono"
              >
                @
              </button>

              {/* Divider */}
              <div className="w-px h-3 bg-zinc-800 mx-0.5" />

              {/* Templates button */}
              <button
                type="button"
                data-testid="preset-manager-btn"
                onClick={onOpenPresets}
                className="flex items-center gap-1.5 h-6 px-2 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-xs"
                title="Saved templates"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <rect x="1" y="1.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M2.5 4.5h6M2.5 6.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                Templates
              </button>
            </div>

            {/* Right: send button */}
            <button
              data-testid="command-submit"
              type="button"
              onClick={handleSubmit}
              disabled={isEmpty || isSubmitting}
              aria-label="Send command"
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold transition-all ${
                isEmpty || isSubmitting
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-corthex-accent text-white hover:opacity-90 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  Send
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-80">
                    <path d="M1.5 5h7M5 1.5L8.5 5 5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-[10px] text-zinc-700 mt-1.5 pl-1">
          Enter to send &middot; Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
