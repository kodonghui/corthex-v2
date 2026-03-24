/**
 * CommandPalette — Ctrl+K / Cmd+K triggered command palette.
 * Radix Dialog-based with fuzzy search and keyboard navigation.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, ArrowRight, Clock, Command } from 'lucide-react'

// ── Types ──────────────────────────────────────────
interface CommandItem {
  id: string
  label: string
  category: 'navigate' | 'search' | 'action'
  icon?: React.ReactNode
  path?: string
  action?: () => void
  keywords?: string[]
}

// ── Navigation commands ────────────────────────────
const NAV_COMMANDS: CommandItem[] = [
  { id: 'hub', label: 'Hub', category: 'navigate', path: '/hub', keywords: ['home', 'dashboard', '허브'] },
  { id: 'dashboard', label: 'Dashboard', category: 'navigate', path: '/dashboard', keywords: ['대시보드', 'stats'] },
  { id: 'chat', label: 'Chat', category: 'navigate', path: '/chat', keywords: ['채팅', 'message'] },
  { id: 'agents', label: 'Agents', category: 'navigate', path: '/agents', keywords: ['에이전트', 'ai'] },
  { id: 'departments', label: 'Departments', category: 'navigate', path: '/departments', keywords: ['부서', 'org'] },
  { id: 'tiers', label: 'Tiers', category: 'navigate', path: '/tiers', keywords: ['계급', 'level'] },
  { id: 'nexus', label: 'NEXUS', category: 'navigate', path: '/nexus', keywords: ['조직도', 'org chart'] },
  { id: 'knowledge', label: 'Knowledge', category: 'navigate', path: '/knowledge', keywords: ['지식', 'library'] },
  { id: 'files', label: 'Files', category: 'navigate', path: '/files', keywords: ['파일'] },
  { id: 'jobs', label: 'Jobs', category: 'navigate', path: '/jobs', keywords: ['작업', 'argos'] },
  { id: 'n8n', label: 'n8n Workflows', category: 'navigate', path: '/n8n-workflows', keywords: ['워크플로우', 'automation'] },
  { id: 'activity', label: 'Activity Log', category: 'navigate', path: '/activity-log', keywords: ['활동', 'log'] },
  { id: 'notifications', label: 'Notifications', category: 'navigate', path: '/notifications', keywords: ['알림'] },
  { id: 'costs', label: 'Costs', category: 'navigate', path: '/costs', keywords: ['비용', 'billing'] },
  { id: 'settings', label: 'Settings', category: 'navigate', path: '/settings', keywords: ['설정', 'config'] },
]

// ── Fuzzy match ────────────────────────────────────
function fuzzyMatch(query: string, item: CommandItem): boolean {
  const q = query.toLowerCase()
  if (item.label.toLowerCase().includes(q)) return true
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true
  return false
}

// ── Recent items ───────────────────────────────────
const RECENT_KEY = 'corthex_cmd_recent'
const MAX_RECENT = 5

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

function addRecent(id: string): void {
  const recent = getRecent().filter((r) => r !== id)
  recent.unshift(id)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

// ── Component ──────────────────────────────────────
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Global keybinding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter commands
  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show recent + all nav
      const recent = getRecent()
      const recentItems = recent
        .map((id) => NAV_COMMANDS.find((c) => c.id === id))
        .filter(Boolean) as CommandItem[]
      return { recent: recentItems, results: NAV_COMMANDS }
    }
    return { recent: [], results: NAV_COMMANDS.filter((item) => fuzzyMatch(query, item)) }
  }, [query])

  const allItems = filtered.recent.length > 0
    ? [...filtered.recent, ...filtered.results.filter((r) => !filtered.recent.some((rec) => rec.id === r.id))]
    : filtered.results

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault()
      executeItem(allItems[selectedIndex])
    }
  }, [allItems, selectedIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const executeItem = useCallback((item: CommandItem) => {
    addRecent(item.id)
    setOpen(false)
    if (item.path) navigate(item.path)
    else if (item.action) item.action()
  }, [navigate])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl bg-white border border-[#e5e1d3] shadow-xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e1d3]">
            <Search className="w-4 h-4 text-[#a3a08e] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-[#a3a08e] bg-[#f5f0e8] rounded px-1.5 py-0.5 border border-[#e5e1d3]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto py-2" role="listbox">
            {filtered.recent.length > 0 && !query.trim() && (
              <div className="px-3 py-1.5">
                <span className="text-[10px] font-semibold text-[#a3a08e] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Recent
                </span>
              </div>
            )}

            {allItems.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[#a3a08e]">
                No results found
              </div>
            )}

            {allItems.map((item, i) => {
              const isRecent = filtered.recent.some((r) => r.id === item.id) && i < filtered.recent.length
              const showDivider = filtered.recent.length > 0 && i === filtered.recent.length && !query.trim()

              return (
                <div key={`${item.id}-${isRecent ? 'recent' : 'nav'}`}>
                  {showDivider && (
                    <div className="px-3 py-1.5 mt-1">
                      <span className="text-[10px] font-semibold text-[#a3a08e] uppercase tracking-wider flex items-center gap-1">
                        <Command className="w-3 h-3" /> All Pages
                      </span>
                    </div>
                  )}
                  <button
                    role="option"
                    aria-selected={i === selectedIndex}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                      i === selectedIndex
                        ? 'bg-[#f5f0e8] text-[#283618]'
                        : 'text-[#1a1a1a] hover:bg-[#faf8f5]'
                    }`}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#a3a08e]" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.path && <span className="text-[10px] text-[#a3a08e]">{item.path}</span>}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#e5e1d3] bg-[#faf8f5]">
            <span className="text-[10px] text-[#a3a08e]">
              <kbd className="bg-[#f5f0e8] rounded px-1 border border-[#e5e1d3]">↑↓</kbd> navigate
              <kbd className="bg-[#f5f0e8] rounded px-1 ml-2 border border-[#e5e1d3]">↵</kbd> select
            </span>
            <span className="text-[10px] text-[#a3a08e]">
              <kbd className="bg-[#f5f0e8] rounded px-1 border border-[#e5e1d3]">⌘K</kbd> toggle
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
