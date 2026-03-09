import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@corthex/ui'
import type { Agent, CommandPreset } from './types'

type SlashCommandOption = {
  command: string
  label: string
  description: string
}

const slashCommands: SlashCommandOption[] = [
  { command: '/report', label: '보고서', description: '보고서를 작성합니다' },
  { command: '/analyze', label: '분석', description: '데이터를 분석합니다' },
  { command: '/research', label: '조사', description: '시장/경쟁사를 조사합니다' },
  { command: '/summarize', label: '요약', description: '내용을 요약합니다' },
  { command: '/plan', label: '계획', description: '실행 계획을 수립합니다' },
  { command: '/preset', label: '프리셋', description: '저장된 프리셋을 사용합니다' },
]

type CommandInputProps = {
  agents: Agent[]
  presets: CommandPreset[]
  onSubmit: (content: string, targetAgentId?: string) => void
  onOpenPresetManager: () => void
  disabled?: boolean
  className?: string
}

export function CommandInput({
  agents,
  presets,
  onSubmit,
  onOpenPresetManager,
  disabled = false,
  className,
}: CommandInputProps) {
  const [value, setValue] = useState('')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [showPresetMenu, setShowPresetMenu] = useState(false)
  const [slashFilter, setSlashFilter] = useState('')
  const [mentionFilter, setMentionFilter] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filtered options
  const filteredSlashCommands = slashCommands.filter(
    cmd => cmd.command.toLowerCase().includes(slashFilter.toLowerCase()) ||
           cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
  )

  const filteredAgents = agents.filter(
    agent => agent.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
             agent.role.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  const filteredPresets = presets.filter(
    preset => preset.name.toLowerCase().includes(slashFilter.toLowerCase())
  )

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [slashFilter, mentionFilter])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // Check for slash command trigger
    const lastSlash = newValue.lastIndexOf('/')
    if (lastSlash !== -1 && (lastSlash === 0 || newValue[lastSlash - 1] === ' ' || newValue[lastSlash - 1] === '\n')) {
      const afterSlash = newValue.slice(lastSlash + 1)
      if (!afterSlash.includes(' ') && !afterSlash.includes('\n')) {
        if (afterSlash.toLowerCase().startsWith('preset')) {
          setShowPresetMenu(true)
          setShowSlashMenu(false)
        } else {
          setSlashFilter(afterSlash)
          setShowSlashMenu(true)
          setShowPresetMenu(false)
        }
        setShowMentionMenu(false)
        return
      }
    }

    // Check for mention trigger
    const lastAt = newValue.lastIndexOf('@')
    if (lastAt !== -1 && (lastAt === 0 || newValue[lastAt - 1] === ' ' || newValue[lastAt - 1] === '\n')) {
      const afterAt = newValue.slice(lastAt + 1)
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionFilter(afterAt)
        setShowMentionMenu(true)
        setShowSlashMenu(false)
        setShowPresetMenu(false)
        return
      }
    }

    setShowSlashMenu(false)
    setShowMentionMenu(false)
    setShowPresetMenu(false)
  }

  const insertSlashCommand = useCallback((command: string) => {
    const lastSlash = value.lastIndexOf('/')
    const newValue = value.slice(0, lastSlash) + command + ' '
    setValue(newValue)
    setShowSlashMenu(false)
    setShowPresetMenu(false)
    textareaRef.current?.focus()
  }, [value])

  const insertMention = useCallback((agent: Agent) => {
    const lastAt = value.lastIndexOf('@')
    const newValue = value.slice(0, lastAt) + `@${agent.name} `
    setValue(newValue)
    setShowMentionMenu(false)
    textareaRef.current?.focus()
  }, [value])

  const insertPreset = useCallback((preset: CommandPreset) => {
    setValue(preset.prompt)
    setShowPresetMenu(false)
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashMenu || showMentionMenu || showPresetMenu) {
      const items = showSlashMenu ? filteredSlashCommands : 
                   showMentionMenu ? filteredAgents : 
                   filteredPresets

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (showSlashMenu && filteredSlashCommands[selectedIndex]) {
          insertSlashCommand(filteredSlashCommands[selectedIndex].command)
        } else if (showMentionMenu && filteredAgents[selectedIndex]) {
          insertMention(filteredAgents[selectedIndex])
        } else if (showPresetMenu && filteredPresets[selectedIndex]) {
          insertPreset(filteredPresets[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false)
        setShowMentionMenu(false)
        setShowPresetMenu(false)
      }
      return
    }

    // Submit on Cmd/Ctrl + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!value.trim() || disabled) return

    // Extract mentioned agent
    const mentionMatch = value.match(/@(\S+)/)
    let targetAgentId: string | undefined
    if (mentionMatch) {
      const mentionedAgent = agents.find(a => a.name === mentionMatch[1])
      targetAgentId = mentionedAgent?.id
    }

    onSubmit(value.trim(), targetAgentId)
    setValue('')
  }

  return (
    <div className={cn('relative', className)}>
      {/* Slash command menu */}
      {showSlashMenu && filteredSlashCommands.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 max-h-64 overflow-y-auto z-20">
          {filteredSlashCommands.map((cmd, index) => (
            <button
              key={cmd.command}
              onClick={() => insertSlashCommand(cmd.command)}
              className={cn(
                'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors',
                index === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{cmd.command}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cmd.label}</p>
                <p className="text-xs text-zinc-500 truncate">{cmd.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mention menu */}
      {showMentionMenu && filteredAgents.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 max-h-64 overflow-y-auto z-20">
          {filteredAgents.map((agent, index) => (
            <button
              key={agent.id}
              onClick={() => insertMention(agent)}
              className={cn(
                'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors',
                index === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                agent.status === 'online' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' :
                agent.status === 'working' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
                'bg-zinc-100 dark:bg-zinc-700 text-zinc-500'
              )}>
                {agent.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <p className="text-xs text-zinc-500 truncate">{agent.role}</p>
              </div>
              {agent.isSecretary && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                  비서
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Preset menu */}
      {showPresetMenu && filteredPresets.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 max-h-64 overflow-y-auto z-20">
          <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">저장된 프리셋</span>
            <button
              onClick={onOpenPresetManager}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              관리
            </button>
          </div>
          {filteredPresets.map((preset, index) => (
            <button
              key={preset.id}
              onClick={() => insertPreset(preset)}
              className={cn(
                'w-full text-left px-3 py-2 transition-colors',
                index === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              <p className="text-sm font-medium truncate">{preset.name}</p>
              <p className="text-xs text-zinc-500 truncate">{preset.prompt}</p>
              {preset.tags && preset.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {preset.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="지시를 입력하세요... (/ 슬래시 명령어, @ 에이전트 멘션)"
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 text-sm bg-transparent resize-none focus:outline-none placeholder:text-zinc-400 disabled:opacity-50"
        />

        {/* Footer with hints and submit */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
            <span>/ 명령어</span>
            <span>@ 멘션</span>
            <button
              onClick={onOpenPresetManager}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              프리셋 관리
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400">Cmd + Enter</span>
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className="px-4 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
