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
    <div className="relative shrink-0 border-t border-slate-700/50 bg-gradient-to-t from-slate-900 to-slate-900/95 backdrop-blur-sm p-4">
      {/* Popups */}
      {showSlash && (
        <div className="absolute bottom-full left-4 mb-2 z-50">
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
        <div className="absolute bottom-full left-4 mb-2 z-50">
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
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-medium border border-blue-500/25 mb-3"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>@{managers.find((m) => m.id === targetAgentId)?.name}</span>
          <button
            onClick={() => setTargetAgentId(undefined)}
            aria-label="대상 에이전트 제거"
            className="hover:text-blue-100 transition-colors cursor-pointer ml-0.5 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      )}

      {/* Input row */}
      <div className="flex items-end gap-3">
        {/* Action buttons */}
        <div className="flex items-center gap-1 pb-1.5">
          <button
            type="button"
            onClick={() => handleChange(text + '/')}
            title="슬래시 명령"
            aria-label="슬래시 명령"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            <span className="text-sm font-mono font-bold">/</span>
          </button>
          <button
            type="button"
            onClick={() => handleChange(text + '@')}
            title="에이전트 멘션"
            aria-label="에이전트 멘션"
            className="p-2 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-slate-800/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            <span className="text-sm font-bold">@</span>
          </button>
          <button
            type="button"
            data-testid="preset-manager-btn"
            onClick={onOpenPresets}
            title="템플릿"
            aria-label="템플릿"
            className="p-2 rounded-xl text-slate-500 hover:text-amber-400 hover:bg-slate-800/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2l5 3-5 3V2z" fill="currentColor" opacity="0.3" />
              <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            data-testid="command-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="명령을 입력하세요... (Enter 전송 · Shift+Enter 줄바꿈)"
            aria-label="명령 입력"
            rows={1}
            className="w-full bg-slate-800/80 border border-slate-600/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none resize-none transition-all"
            style={{ minHeight: '48px', maxHeight: '160px' }}
          />
        </div>

        {/* Send button — prominent primary */}
        <button
          data-testid="send-button"
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty || isSubmitting}
          aria-label="명령 전송"
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span className="hidden sm:inline">전송</span>
        </button>
      </div>
    </div>
  )
}
