import { useState } from 'react'
import { Button, Modal, toast } from '@corthex/ui'

type ExportType = 'watchlist' | 'notes' | 'chart'
type ExportFormat = 'csv' | 'md'

const TYPE_OPTIONS: { value: ExportType; label: string; formats: ExportFormat[] }[] = [
  { value: 'watchlist', label: '관심종목 목록', formats: ['csv'] },
  { value: 'notes', label: '메모', formats: ['md', 'csv'] },
  { value: 'chart', label: '차트 데이터', formats: ['csv'] },
]

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  md: 'Markdown',
}

type Props = {
  isOpen: boolean
  onClose: () => void
  stockCode: string | null
}

export function ExportDialog({ isOpen, onClose, stockCode }: Props) {
  const [exportType, setExportType] = useState<ExportType>('watchlist')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [isPending, setIsPending] = useState(false)

  const selectedOption = TYPE_OPTIONS.find((o) => o.value === exportType)!
  const needsStock = exportType === 'notes' || exportType === 'chart'

  const handleTypeChange = (type: ExportType) => {
    setExportType(type)
    const option = TYPE_OPTIONS.find((o) => o.value === type)!
    if (!option.formats.includes(format)) {
      setFormat(option.formats[0])
    }
  }

  const handleExport = async () => {
    if (needsStock && !stockCode) {
      toast.error('종목을 먼저 선택해주세요')
      return
    }

    setIsPending(true)
    try {
      const params = new URLSearchParams({ type: exportType, format })
      if (stockCode && needsStock) params.set('stockCode', stockCode)
      if (exportType === 'chart') params.set('count', '60')

      const res = await fetch(`/api/workspace/strategy/export?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('corthex_token')}` },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: '내보내기 실패' } }))
        throw new Error(err.error?.message || '내보내기 실패')
      }

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename\*=UTF-8''(.+)/)
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `export.${format}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast.success('내보내기 완료')
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '내보내기에 실패했습니다')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">
        전략 데이터 내보내기
      </h3>

      <div className="space-y-4">
        {/* 내보내기 유형 */}
        <div>
          <p className="text-xs text-zinc-500 mb-2">내보내기 유형</p>
          <div className="flex flex-col gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === opt.value}
                  onChange={() => handleTypeChange(opt.value)}
                  className="accent-indigo-600"
                />
                <span className="text-sm text-zinc-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 포맷 선택 */}
        {selectedOption.formats.length > 1 && (
          <div>
            <p className="text-xs text-zinc-500 mb-2">파일 형식</p>
            <div className="flex gap-2">
              {selectedOption.formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    format === f
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 종목 필요 안내 */}
        {needsStock && !stockCode && (
          <p className="text-xs text-amber-500">종목을 선택한 후 내보내기할 수 있습니다</p>
        )}
      </div>

      <div className="flex gap-2 justify-end mt-5">
        <Button size="sm" variant="ghost" onClick={onClose}>취소</Button>
        <Button
          size="sm"
          onClick={handleExport}
          disabled={isPending || (needsStock && !stockCode)}
        >
          {isPending ? '내보내는 중...' : '내보내기'}
        </Button>
      </div>
    </Modal>
  )
}
