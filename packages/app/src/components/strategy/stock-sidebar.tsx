import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Input, toast } from '@corthex/ui'

type WatchlistItem = {
  id: string
  stockCode: string
  stockName: string
  market: string
}

interface StockSidebarProps {
  className?: string
}

export function StockSidebar({ className }: StockSidebarProps) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStock = searchParams.get('stock')
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
      return next
    })
  }

  return (
    <div className={className}>
      <div className="p-3">
        <Input
          placeholder="종목 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((stock) => (
          <button
            key={stock.id}
            onClick={() => selectStock(stock.stockCode)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors min-h-[44px] ${
              selectedStock === stock.stockCode
                ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{stock.stockName}</div>
              <div className="text-xs text-zinc-400">{stock.stockCode}</div>
            </div>
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
          </button>
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
