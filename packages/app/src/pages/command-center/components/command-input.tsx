import { useState, useRef, useCallback, useEffect } from 'react'
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
    <div className="relative shrink-0 border-t border-slate-700 bg-slate-900 p-3">
      {/* Popups */}
      {showSlash && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
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
        <div className="absolute bottom-full left-0 mb-2 z-50">
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

      {/* Target agent chip */}
      {targetAgentId && (
        <span
          data-testid="target-chip"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 mb-2"
        >
          <span>@{managers.find((m) => m.id === targetAgentId)?.name}</span>
          <button
            onClick={() => setTargetAgentId(undefined)}
            className="hover:text-blue-100 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Action buttons */}
        <div className="flex items-center gap-1 pb-1">
          <button
            type="button"
            onClick={() => handleChange(text + '/')}
            title="슬래시 명령"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-mono">/</span>
          </button>
          <button
            type="button"
            onClick={() => handleChange(text + '@')}
            title="에이전트 멘션"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm">@</span>
          </button>
          <button
            type="button"
            data-testid="preset-manager-btn"
            onClick={onOpenPresets}
            title="템플릿"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2l5 3-5 3V2z" fill="currentColor" opacity="0.3" />
              <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          data-testid="command-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="명령을 입력하세요... (Enter 전송 · Shift+Enter 줄바꿈)"
          aria-label="명령 입력"
          rows={1}
          className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none transition-colors"
          style={{ minHeight: '44px', maxHeight: '160px' }}
        />

        {/* Send button */}
        <button
          data-testid="send-button"
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || isSubmitting}
          aria-label="명령 전송"
          className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
