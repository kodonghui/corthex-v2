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

export function PresetManager({ presets, onClose, onCreate, onUpdate, onDelete, onExecute, isCreating, isExecuting }: Props) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const resetForm = useCallback(() => {
    setName('')
    setCommand('')
    setDescription('')
    setCategory('')
    setEditId(null)
    setMode('list')
  }, [])

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !command.trim()) return
    try {
      await onCreate({
        name: name.trim(),
        command: command.trim(),
        description: description.trim() || null,
        category: category || null,
      })
      resetForm()
    } catch {
      // error is shown by toast in parent
    }
  }, [name, command, description, category, onCreate, resetForm])

  const handleUpdate = useCallback(async () => {
    if (!editId || !name.trim() || !command.trim()) return
    try {
      await onUpdate({
        id: editId,
        name: name.trim(),
        command: command.trim(),
        description: description.trim() || null,
        category: category || null,
      })
      resetForm()
    } catch {
      // error shown by toast
    }
  }, [editId, name, command, description, category, onUpdate, resetForm])

  const startEdit = useCallback((preset: Preset) => {
    setEditId(preset.id)
    setName(preset.name)
    setCommand(preset.command)
    setDescription(preset.description || '')
    setCategory(preset.category || '')
    setMode('edit')
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await onDelete(id)
      setDeleteConfirmId(null)
    } catch {
      // error shown by toast
    }
  }, [onDelete])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {mode === 'create' ? '새 프리셋' : mode === 'edit' ? '프리셋 수정' : '프리셋 관리'}
          </h2>
          <button
            onClick={mode === 'list' ? onClose : resetForm}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xl"
          >
            {mode === 'list' ? '✕' : '←'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'list' && (
            <>
              {/* Create button */}
              <button
                onClick={() => setMode('create')}
                className="w-full flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors mb-3"
              >
                <span className="text-lg">+</span>
                <span className="text-sm">새 프리셋 만들기</span>
              </button>

              {/* Preset list */}
              {presets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-400">저장된 프리셋이 없습니다.</p>
                  <p className="text-xs text-zinc-400 mt-1">자주 쓰는 명령을 프리셋으로 저장해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {preset.name}
                            </span>
                            {preset.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                                {preset.category}
                              </span>
                            )}
                            {preset.isGlobal && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                                공용
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            {preset.command}
                          </p>
                          {preset.description && (
                            <p className="text-xs text-zinc-400 mt-0.5 truncate">
                              {preset.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            onClick={() => onExecute(preset.id)}
                            disabled={isExecuting}
                            className="h-7 px-2 text-xs"
                            title="실행"
                          >
                            ▶
                          </Button>
                          {!preset.isGlobal && (
                            <>
                              <button
                                onClick={() => startEdit(preset)}
                                className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                title="수정"
                              >
                                ✏️
                              </button>
                              {deleteConfirmId === preset.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(preset.id)}
                                    className="h-7 px-2 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="h-7 px-2 text-xs text-zinc-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(preset.id)}
                                  className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-red-500 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                  title="삭제"
                                >
                                  🗑
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
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 삼성전자 주간 보고서"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  명령어 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="예: 삼성전자 최근 실적 분석하고 투자 의견 작성해줘"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  maxLength={10000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  설명 (선택)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="이 프리셋에 대한 설명"
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  카테고리 (선택)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">카테고리 없음</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2">
            <Button
              onClick={resetForm}
              className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              취소
            </Button>
            <Button
              onClick={mode === 'create' ? handleCreate : handleUpdate}
              disabled={!name.trim() || !command.trim() || isCreating}
              className="px-4 py-2 text-sm"
            >
              {isCreating ? '저장 중...' : mode === 'create' ? '생성' : '저장'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
