import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Input, toast } from '@corthex/ui'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { WatchlistItem } from './types'

type PriceData = {
  price: number
  change: number
  changeRate: number
}

interface StockSidebarProps {
  className?: string
}

function isMarketOpen(): boolean {
  const now = new Date()
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const day = kst.getDay()
  if (day === 0 || day === 6) return false
  const minutes = kst.getHours() * 60 + kst.getMinutes()
  return minutes >= 540 && minutes <= 930
}

function SortableStockItem({
  stock,
  isSelected,
  isCompareActive,
  isCompareChecked,
  priceData,
  onSelect,
  onRemove,
}: {
  stock: WatchlistItem
  isSelected: boolean
  isCompareActive: boolean
  isCompareChecked: boolean
  priceData?: PriceData
  onSelect: () => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const changeColor = priceData
    ? priceData.changeRate > 0 ? 'text-emerald-500' : priceData.changeRate < 0 ? 'text-red-500' : 'text-slate-400'
    : 'text-slate-400'

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`w-full flex flex-col gap-1 px-4 py-3 text-left text-sm transition-colors cursor-pointer border-l-2 ${
        isCompareActive && isCompareChecked
          ? 'bg-slate-800 border-cyan-400'
          : isSelected
            ? 'bg-slate-800 border-cyan-400'
            : 'border-transparent hover:bg-slate-800'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          {!isCompareActive && (
            <span
              {...attributes}
              {...listeners}
              className="shrink-0 cursor-grab text-slate-600 hover:text-slate-400 text-xs select-none"
              onClick={(e) => e.stopPropagation()}
            >
              ⠿
            </span>
          )}
          {isCompareActive && (
            <input
              type="checkbox"
              checked={isCompareChecked}
              readOnly
              className="accent-cyan-400 shrink-0"
            />
          )}
          <span className="font-bold text-sm text-slate-100 truncate">{stock.stockName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {priceData && (
            <span className="font-mono text-sm text-slate-100">
              {priceData.price.toLocaleString('ko-KR')}
            </span>
          )}
          {!isCompareActive && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="shrink-0 text-slate-500 hover:text-red-500 p-0.5 flex items-center justify-center transition-colors"
              title="삭제"
            >
              x
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">{stock.stockCode}</span>
        {priceData && (
          <span className={`font-mono ${changeColor}`}>
            {priceData.changeRate > 0 ? '+' : ''}{priceData.changeRate.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  )
}

export function StockSidebar({ className }: StockSidebarProps) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStock = searchParams.get('stock')
  const compareCodes = useMemo(() => {
    const raw = searchParams.get('compare')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])
  const compareActive = searchParams.has('compare')
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState<'all' | 'KR' | 'US'>('all')

  const { data } = useQuery({
    queryKey: ['strategy-watchlist'],
    queryFn: () => api.get<{ data: WatchlistItem[] }>('/workspace/strategy/watchlist'),
  })

  // Fetch prices for all watchlist items
  const items = data?.data ?? []
  const allCodes = useMemo(() => items.map((s) => s.stockCode).join(','), [items])

  const { data: pricesRes } = useQuery({
    queryKey: ['strategy-sidebar-prices', allCodes],
    queryFn: () => api.get<{ data: Record<string, PriceData> }>(`/workspace/strategy/prices?codes=${encodeURIComponent(allCodes)}`),
    enabled: allCodes.length > 0,
    refetchInterval: isMarketOpen() ? 30_000 : false,
    staleTime: 15_000,
  })

  const prices = pricesRes?.data ?? {}

  const removeStock = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/strategy/watchlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-watchlist'] })
      toast.success('종목이 삭제되었습니다')
    },
    onError: () => toast.error('종목 삭제에 실패했습니다'),
  })

  const reorderMutation = useMutation({
    mutationFn: (reorderItems: { id: string; sortOrder: number }[]) =>
      api.patch('/workspace/strategy/watchlist/reorder', { items: reorderItems }),
    onError: () => toast.error('순서 변경에 실패했습니다'),
  })

  const filtered = useMemo(() => {
    let list = items
    if (marketFilter !== 'all') {
      const isUS = marketFilter === 'US'
      list = list.filter((s) => {
        const m = s.market.toUpperCase()
        return isUS
          ? (m === 'NASDAQ' || m === 'NYSE' || m === 'AMEX' || m.startsWith('US'))
          : (m === 'KOSPI' || m === 'KOSDAQ' || m.startsWith('KR') || m === 'KRX')
      })
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) => s.stockName.toLowerCase().includes(q) || s.stockCode.includes(q),
      )
    }
    return list
  }, [items, search, marketFilter])

  const selectStock = (code: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('stock', code)
      next.delete('compare')
      return next
    })
  }

  const toggleCompare = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (compareActive) {
        next.delete('compare')
      } else {
        next.set('compare', '')
        next.delete('stock')
      }
      return next
    })
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    // Optimistic update
    queryClient.setQueryData(['strategy-watchlist'], { data: reordered })
    // Persist
    const reorderItems = reordered.map((item, idx) => ({ id: item.id, sortOrder: idx }))
    reorderMutation.mutate(reorderItems)
  }, [items, queryClient, reorderMutation])

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
        <div className="flex gap-1">
          {(['all', 'KR', 'US'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setMarketFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                marketFilter === f
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-100 dark:bg-zinc-800'
              }`}
            >
              {f === 'all' ? '전체' : f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {filtered.map((stock) => (
              <SortableStockItem
                key={stock.id}
                stock={stock}
                isSelected={selectedStock === stock.stockCode}
                isCompareActive={compareActive}
                isCompareChecked={compareCodes.includes(stock.stockCode)}
                priceData={prices[stock.stockCode]}
                onSelect={() => compareActive ? toggleStockCompare(stock.stockCode) : selectStock(stock.stockCode)}
                onRemove={() => removeStock.mutate(stock.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-xs text-zinc-400 text-center">
            {search ? '검색 결과가 없습니다' : '관심 종목이 없습니다'}
          </p>
        )}
      </div>
    </div>
  )
}
