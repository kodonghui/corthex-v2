import { useState } from 'react'
import { Modal, Input, cn } from '@corthex/ui'
import type { CommandPreset, Agent } from './types'

type PresetManagerProps = {
  isOpen: boolean
  onClose: () => void
  presets: CommandPreset[]
  agents: Agent[]
  onCreatePreset: (preset: Omit<CommandPreset, 'id' | 'createdAt'>) => void
  onDeletePreset: (id: string) => void
  onSelectPreset: (preset: CommandPreset) => void
}

export function PresetManager({
  isOpen,
  onClose,
  presets,
  agents,
  onCreatePreset,
  onDeletePreset,
  onSelectPreset,
}: PresetManagerProps) {
  const [view, setView] = useState<'list' | 'create'>('list')
  const [newName, setNewName] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [newTargetAgent, setNewTargetAgent] = useState('')
  const [newTags, setNewTags] = useState('')

  const handleCreate = () => {
    if (!newName.trim() || !newPrompt.trim()) return

    onCreatePreset({
      name: newName.trim(),
      prompt: newPrompt.trim(),
      targetAgentId: newTargetAgent || undefined,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    })

    setNewName('')
    setNewPrompt('')
    setNewTargetAgent('')
    setNewTags('')
    setView('list')
  }

  const handleUsePreset = (preset: CommandPreset) => {
    onSelectPreset(preset)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="프리셋 관리">
      <div className="min-h-[400px]">
        {/* Tab buttons */}
        <div className="flex gap-2 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-3">
          <button
            onClick={() => setView('list')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              view === 'list'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            목록
          </button>
          <button
            onClick={() => setView('create')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              view === 'create'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            + 새 프리셋
          </button>
        </div>

        {/* List view */}
        {view === 'list' && (
          <div className="space-y-2">
            {presets.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-2xl mb-2">[Presets]</p>
                <p className="text-sm">저장된 프리셋이 없습니다</p>
                <button
                  onClick={() => setView('create')}
                  className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  첫 프리셋 만들기
                </button>
              </div>
            ) : (
              presets.map(preset => (
                <div
                  key={preset.id}
                  className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{preset.name}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-2">{preset.prompt}</p>
                      {preset.tags && preset.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {preset.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUsePreset(preset)}
                        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        사용
                      </button>
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create view */}
        {view === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                프리셋 이름 *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 일일 시장 브리핑"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                프롬프트 내용 *
              </label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="지시 내용을 입력하세요..."
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                담당 에이전트 (선택)
              </label>
              <select
                value={newTargetAgent}
                onChange={(e) => setNewTargetAgent(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">자동 배정</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} - {agent.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                태그 (쉼표로 구분)
              </label>
              <Input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="예: 매일, 시장, 분석"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || !newPrompt.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
