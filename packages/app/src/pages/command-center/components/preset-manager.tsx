import { useState, useCallback, useRef, useEffect } from 'react'
import type { Preset } from '../../../hooks/use-presets'

type Props = {
  presets: Preset[]
  onClose: () => void
  onCreate: (input: { name: string; command: string; description?: string | null; category?: string | null }) => Promise<unknown>
  onUpdate: (input: { id: string; name?: string; command?: string; description?: string | null; category?: string | null }) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  onExecute: (id: string) => Promise<unknown>
  isCreating: boolean
  isExecuting: boolean
}

const CATEGORIES = ['일반', '분석', '보고', '전략', '마케팅', '기술']

export function PresetManager({
  presets, onClose, onCreate, onUpdate, onDelete, onExecute, isCreating, isExecuting,
}: Props) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const resetForm = useCallback(() => {
    setName(''); setCommand(''); setDescription(''); setCategory(''); setEditId(null); setMode('list')
  }, [])

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !command.trim()) return
    try {
      await onCreate({ name: name.trim(), command: command.trim(), description: description.trim() || null, category: category || null })
      resetForm()
    } catch { /* toast handles errors */ }
  }, [name, command, description, category, onCreate, resetForm])

  const handleUpdate = useCallback(async () => {
    if (!editId || !name.trim() || !command.trim()) return
    try {
      await onUpdate({ id: editId, name: name.trim(), command: command.trim(), description: description.trim() || null, category: category || null })
      resetForm()
    } catch { /* toast handles errors */ }
  }, [editId, name, command, description, category, onUpdate, resetForm])

  const startEdit = useCallback((preset: Preset) => {
    setEditId(preset.id); setName(preset.name); setCommand(preset.command)
    setDescription(preset.description || ''); setCategory(preset.category || ''); setMode('edit')
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try { await onDelete(id); setDeleteConfirmId(null) } catch { /* toast */ }
  }, [onDelete])

  // Focus trap: cycle focus within the modal
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    modal.addEventListener('keydown', handleKeyDown)
    return () => modal.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      data-testid="preset-manager-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && mode === 'list' && onClose()}
    >
      <div ref={modalRef} className="bg-stone-100 border border-stone-200 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <h3 id="preset-modal-title" className="text-lg font-semibold text-corthex-text-primary">
            {mode === 'create' ? '새 프리셋 만들기' : mode === 'edit' ? '프리셋 수정' : '명령 프리셋'}
          </h3>
          <button
            onClick={mode === 'list' ? onClose : resetForm}
            aria-label="닫기"
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-200 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'list' && (
            <>
              {/* Create new button */}
              <button
                data-testid="preset-create-btn"
                onClick={() => setMode('create')}
                className="w-full flex items-center gap-2 px-5 py-3 text-sm text-blue-400 hover:bg-stone-200/50 transition-colors border-b border-stone-200/50"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                새 프리셋 만들기
              </button>

              {/* Preset list */}
              {presets.length === 0 ? (
                <div className="text-center py-10 px-5">
                  <p className="text-sm text-stone-400">저장된 프리셋이 없습니다</p>
                  <p className="text-xs text-slate-600 mt-1">자주 사용하는 명령을 프리셋으로 저장하세요</p>
                </div>
              ) : (
                presets.map((preset) => (
                  <div key={preset.id}>
                    <div
                      data-testid={`preset-item-${preset.id}`}
                      className="px-5 py-3 border-b border-stone-200/50 hover:bg-stone-200/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-200">{preset.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Run */}
                          <button
                            onClick={() => onExecute(preset.id)}
                            disabled={isExecuting}
                            title="실행"
                            aria-label="실행"
                            className="p-1 rounded text-emerald-400 hover:bg-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M4 2l8 5-8 5V2z" fill="currentColor" />
                            </svg>
                          </button>
                          {!preset.isGlobal && (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(preset)}
                                title="수정"
                                aria-label="수정"
                                className="p-1 rounded text-stone-500 hover:bg-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M3 10.5l1-1 5-5 1 1-5 5-1 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                  <path d="M9 3.5l1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirmId(preset.id)}
                                title="삭제"
                                aria-label="삭제"
                                className="p-1 rounded text-red-400 hover:bg-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M3 4h8M5 4V3h4v1M5.5 6.5v3M8.5 6.5v3M4 4l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 truncate">{preset.command}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {preset.category && (
                          <span className="inline-flex text-xs px-1.5 py-0.5 rounded bg-stone-200 text-stone-500">{preset.category}</span>
                        )}
                        {preset.isGlobal && (
                          <span className="inline-flex text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 ml-1">공유</span>
                        )}
                      </div>
                    </div>

                    {/* Delete confirmation */}
                    {deleteConfirmId === preset.id && (
                      <div className="flex items-center justify-between px-5 py-2 bg-red-950/30 border-y border-red-900/30">
                        <span className="text-xs text-red-300">이 프리셋을 삭제할까요?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(preset.id)}
                            className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
                          >
                            삭제
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs px-2 py-1 rounded bg-stone-200 text-stone-600"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="px-5 py-4 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="프리셋 이름"
                className="w-full bg-stone-200 border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-sm text-white outline-none"
                maxLength={100}
              />
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="명령어 내용"
                rows={3}
                className="w-full bg-stone-200 border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-sm text-white outline-none resize-none h-24"
                maxLength={10000}
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명 (선택사항)"
                className="w-full bg-stone-200 border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-sm text-white outline-none"
                maxLength={500}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-stone-200 border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">카테고리 선택</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm rounded-lg text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={mode === 'create' ? handleCreate : handleUpdate}
                  disabled={!name.trim() || !command.trim() || isCreating}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreating ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
