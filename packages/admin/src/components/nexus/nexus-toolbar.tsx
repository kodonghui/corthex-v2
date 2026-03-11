import { memo } from 'react'

type NexusToolbarProps = {
  isEditMode: boolean
  isDirty: boolean
  isSaving: boolean
  onToggleEditMode: () => void
  onAutoLayout: () => void
  onSaveLayout: () => void
  onFitView: () => void
}

export const NexusToolbar = memo(function NexusToolbar({
  isEditMode,
  isDirty,
  isSaving,
  onToggleEditMode,
  onAutoLayout,
  onSaveLayout,
  onFitView,
}: NexusToolbarProps) {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 flex gap-2 shadow-lg"
      data-testid="nexus-toolbar"
    >
      {/* Edit mode toggle */}
      <button
        onClick={onToggleEditMode}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          isEditMode
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
        title={isEditMode ? '보기 모드로 전환' : '편집 모드로 전환'}
      >
        {isEditMode ? '편집 중' : '보기'}
      </button>

      <div className="w-px bg-slate-600" />

      {/* Auto layout */}
      <button
        onClick={onAutoLayout}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        title="자동 정렬 (ELK)"
      >
        자동 정렬
      </button>

      {/* Save layout */}
      <button
        onClick={onSaveLayout}
        disabled={!isDirty || isSaving}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          isDirty && !isSaving
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
        }`}
        title="레이아웃 저장 (Ctrl+S)"
      >
        {isSaving ? '저장 중...' : '저장'}
      </button>

      {/* Fit view */}
      <button
        onClick={onFitView}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        title="전체 보기"
      >
        전체 보기
      </button>
    </div>
  )
})
