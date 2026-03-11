import { memo, useState, useRef, useEffect } from 'react'

type NexusToolbarProps = {
  isEditMode: boolean
  isDirty: boolean
  isSaving: boolean
  isExporting: boolean
  selectedCount: number
  canUndo: boolean
  canRedo: boolean
  undoLabel: string
  redoLabel: string
  onToggleEditMode: () => void
  onAutoLayout: () => void
  onSaveLayout: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  onExportPng: () => void
  onExportSvg: () => void
  onExportJson: () => void
  onPrint: () => void
}

export const NexusToolbar = memo(function NexusToolbar({
  isEditMode,
  isDirty,
  isSaving,
  isExporting,
  selectedCount,
  canUndo,
  canRedo,
  undoLabel,
  redoLabel,
  onToggleEditMode,
  onAutoLayout,
  onSaveLayout,
  onFitView,
  onUndo,
  onRedo,
  onExportPng,
  onExportSvg,
  onExportJson,
  onPrint,
}: NexusToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!exportOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setExportOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setExportOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [exportOpen])

  const menuItemClass = 'w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors'

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

      {/* Undo/Redo — edit mode only */}
      {isEditMode && (
        <>
          <div className="w-px bg-slate-600" />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
              canUndo ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
            title={undoLabel || '실행 취소 (Ctrl+Z)'}
          >
            ↩
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
              canRedo ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
            title={redoLabel || '다시 실행 (Ctrl+Shift+Z)'}
          >
            ↪
          </button>
        </>
      )}

      {/* Selection counter */}
      {selectedCount > 0 && (
        <span className="px-2 py-1.5 text-[10px] font-medium rounded-md bg-amber-800 text-amber-200">
          {selectedCount}개 선택
        </span>
      )}

      {/* Fit view */}
      <button
        onClick={onFitView}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        title="전체 보기"
      >
        전체 보기
      </button>

      <div className="w-px bg-slate-600" />

      {/* Export dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setExportOpen((v) => !v)}
          disabled={isExporting}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isExporting
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="내보내기"
          data-testid="nexus-export-btn"
        >
          {isExporting ? '내보내는 중...' : '내보내기'}
        </button>

        {exportOpen && (
          <div
            className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]"
            data-testid="nexus-export-menu"
          >
            <button className={menuItemClass} onClick={() => { setExportOpen(false); onExportPng() }}>
              PNG 이미지
            </button>
            <button className={menuItemClass} onClick={() => { setExportOpen(false); onExportSvg() }}>
              SVG 벡터
            </button>
            <button className={menuItemClass} onClick={() => { setExportOpen(false); onExportJson() }}>
              JSON 데이터
            </button>
            <div className="border-t border-slate-700" />
            <button className={menuItemClass} onClick={() => { setExportOpen(false); onPrint() }}>
              인쇄
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
