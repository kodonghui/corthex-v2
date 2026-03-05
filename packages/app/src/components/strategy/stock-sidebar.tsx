import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Input, toast } from '@corthex/ui'
import type { WatchlistItem } from './types'

interface StockSidebarProps {
  className?: string
}

export function StockSidebar({ className }: StockSidebarProps) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStock = searchParams.get('stock')
  const compareCodes = useMemo(() => {
    const raw = searchParams.get('compare')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])
  const isCompareMode = compareCodes.length > 0 || searchParams.has('compare')
  const [compareActive, setCompareActive] = useState(isCompareMode)
  const [search, setSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['strategy-watchlist'],
    queryFn: () => api.get<{ data: WatchlistItem[] }>('/workspace/strategy/watchlist'),
  })

  const removeStock = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/strategy/watchlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-watchlist'] })
      toast.success('종목이 삭제되었습니다')
    },
    onError: () => toast.error('종목 삭제에 실패했습니다'),
  })

  const items = data?.data ?? []
  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (s) => s.stockName.toLowerCase().includes(q) || s.stockCode.includes(q),
    )
  }, [items, search])

  const selectStock = (code: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('stock', code)
      next.delete('compare')
      return next
    })
    setCompareActive(false)
  }

  const toggleCompare = () => {
    if (compareActive) {
      // 비교 모드 해제
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('compare')
        return next
      })
      setCompareActive(false)
    } else {
      // 비교 모드 진입
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('compare', '')
        next.delete('stock')
        return next
      })
      setCompareActive(true)
    }
  }

  const toggleStockCompare = (code: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const current = (next.get('compare') || '').split(',').filter(Boolean)
      if (current.includes(code)) {
        const updated = current.filter((c) => c !== code)
        next.set('compare', updated.join(','))
      } else {
        if (current.length >= 5) {
          toast.error('최대 5개까지 비교할 수 있습니다')
          return next
        }
        next.set('compare', [...current, code].join(','))
      }
      next.delete('stock')
      return next
    })
  }

  return (
    <div className={className}>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500">관심종목 ({items.length})</span>
          <button
            onClick={toggleCompare}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              compareActive
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            비교 {compareActive ? '●' : '○'}
          </button>
        </div>
        <Input
          placeholder="종목 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((stock) => (
          <div
            key={stock.id}
            role="button"
            tabIndex={0}
            onClick={() => compareActive ? toggleStockCompare(stock.stockCode) : selectStock(stock.stockCode)}
            onKeyDown={(e) => e.key === 'Enter' && (compareActive ? toggleStockCompare(stock.stockCode) : selectStock(stock.stockCode))}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors min-h-[44px] cursor-pointer ${
              compareActive && compareCodes.includes(stock.stockCode)
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                : selectedStock === stock.stockCode
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {compareActive && (
                <input
                  type="checkbox"
                  checked={compareCodes.includes(stock.stockCode)}
                  readOnly
                  className="accent-indigo-600 shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{stock.stockName}</div>
                <div className="text-xs text-zinc-400">{stock.stockCode}</div>
              </div>
            </div>
            {!compareActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeStock.mutate(stock.id)
                }}
                className="ml-2 shrink-0 text-zinc-400 hover:text-red-500 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
                title="삭제"
              >
                x
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-xs text-zinc-400 text-center">
            {search ? '검색 결과가 없습니다' : '관심 종목이 없습니다'}
          </p>
        )}
      </div>
    </div>
  )
}
