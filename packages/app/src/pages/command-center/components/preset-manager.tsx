import { useState, useCallback } from 'react'
import { Button } from '@corthex/ui'
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

  const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"

  return (
    <div
      data-testid="preset-manager-modal"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && mode === 'list' && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            {mode !== 'list' && (
              <button
                onClick={resetForm}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 6H2M5 3L2 6l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h2 className="text-sm font-semibold text-zinc-100">
              {mode === 'create' ? 'New Template' : mode === 'edit' ? 'Edit Template' : 'Saved Templates'}
            </h2>
          </div>
          <button
            onClick={mode === 'list' ? onClose : resetForm}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'list' && (
            <>
              {/* Create new */}
              <button
                data-testid="preset-create-btn"
                onClick={() => setMode('create')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all mb-4"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-zinc-400">
                    <path d="M5.5 2v7M2 5.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-sm">New template</span>
              </button>

              {/* List */}
              {presets.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-zinc-600">No templates saved yet</p>
                  <p className="text-xs text-zinc-700 mt-1">Save frequently used commands as templates for quick access</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      data-testid="preset-item"
                      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-zinc-200 truncate">{preset.name}</span>
                            {preset.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 flex-shrink-0">
                                {preset.category}
                              </span>
                            )}
                            {preset.isGlobal && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-corthex-accent/10 border border-corthex-accent/20 text-corthex-accent-dark flex-shrink-0">
                                Global
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 mt-0.5 truncate">{preset.command}</p>
                          {preset.description && (
                            <p className="text-xs text-zinc-700 mt-0.5 truncate">{preset.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Run */}
                          <button
                            data-testid="preset-execute-btn"
                            onClick={() => onExecute(preset.id)}
                            disabled={isExecuting}
                            title="Run"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-corthex-accent/10 border border-corthex-accent/30 text-corthex-accent-dark hover:bg-corthex-accent/20 transition-colors disabled:opacity-40"
                          >
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                              <path d="M2 1.5l5.5 3L2 7.5V1.5z" fill="currentColor" />
                            </svg>
                          </button>
                          {!preset.isGlobal && (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(preset)}
                                title="Edit"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
                              >
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                  <path d="M2 8.5l1-1 4-4 1 1-4 4-1 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                  <path d="M7 3.5l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                              </button>
                              {/* Delete */}
                              {deleteConfirmId === preset.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(preset.id)}
                                    className="h-7 px-2 text-xs rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900/60 transition-colors"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="h-7 px-2 text-xs rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(preset.id)}
                                  title="Delete"
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-700 transition-colors"
                                >
                                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M2 3h7M4 3V2h3v1M4.5 5.5V8M6.5 5.5V8M3 3l.5 6h4l.5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weekly Sales Report"
                  className={inputCls}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Command <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g. Analyze Q3 sales data and create a presentation"
                  rows={3}
                  className={`${inputCls} resize-none`}
                  maxLength={10000}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of what this template does"
                  className={inputCls}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Category <span className="text-zinc-600">(optional)</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="">No category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer for create/edit forms */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="px-5 py-4 border-t border-zinc-800 flex justify-end gap-2 flex-shrink-0">
            <button
              onClick={resetForm}
              className="h-8 px-4 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={mode === 'create' ? handleCreate : handleUpdate}
              disabled={!name.trim() || !command.trim() || isCreating}
              className="h-8 px-4 text-xs font-semibold rounded-lg bg-corthex-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
