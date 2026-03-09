import { cn } from '@corthex/ui'
import type { Deliverable } from './types'

type DeliverableViewerProps = {
  deliverable: Deliverable | null
  onClose: () => void
  className?: string
}

export function DeliverableViewer({ deliverable, onClose, className }: DeliverableViewerProps) {
  if (!deliverable) {
    return (
      <div className={cn('flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800', className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <p className="text-2xl mb-2">[File]</p>
            <p className="text-xs">산출물을 선택하면 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    )
  }

  const typeLabels: Record<Deliverable['type'], string> = {
    report: '보고서',
    file: '파일',
    link: '링크',
    code: '코드',
    data: '데이터',
  }

  return (
    <div className={cn('flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
              {typeLabels[deliverable.type]}
            </span>
            <span className="text-[10px] text-zinc-400">
              {new Date(deliverable.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <h3 className="font-medium text-sm truncate">{deliverable.title}</h3>
          {deliverable.summary && (
            <p className="text-xs text-zinc-500 mt-0.5">{deliverable.summary}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content preview */}
      <div className="flex-1 overflow-auto p-4">
        {deliverable.type === 'report' && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-300">
                PDF 문서 미리보기가 여기에 표시됩니다. 실제 구현에서는 PDF 뷰어를 통합하거나 마크다운 렌더링을 사용합니다.
              </p>
              <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-xs text-zinc-500">{deliverable.title}</p>
                {deliverable.summary && (
                  <p className="text-xs text-zinc-400 mt-1">{deliverable.summary}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {deliverable.type === 'data' && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-600">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">데이터 미리보기</p>
            </div>
            <div className="p-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-2 px-2 text-zinc-500">항목</th>
                    <th className="text-left py-2 px-2 text-zinc-500">값</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 px-2">샘플 데이터 1</td>
                    <td className="py-2 px-2">1,234</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 px-2">샘플 데이터 2</td>
                    <td className="py-2 px-2">5,678</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {deliverable.type === 'code' && (
          <div className="bg-zinc-900 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-mono">{deliverable.title}</p>
              <button className="text-[10px] text-indigo-400 hover:text-indigo-300">복사</button>
            </div>
            <pre className="p-4 text-xs text-zinc-300 overflow-x-auto">
              <code>{`// 코드 미리보기
function example() {
  return "Hello, World!";
}`}</code>
            </pre>
          </div>
        )}

        {deliverable.type === 'link' && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
            <a
              href={deliverable.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
            >
              {deliverable.url || '링크 열기'}
            </a>
          </div>
        )}

        {deliverable.type === 'file' && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1">{deliverable.title}</p>
            {deliverable.summary && (
              <p className="text-xs text-zinc-500 mb-4">{deliverable.summary}</p>
            )}
            <button className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              다운로드
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        <button className="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          다운로드
        </button>
        <button className="px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          공유
        </button>
      </div>
    </div>
  )
}
