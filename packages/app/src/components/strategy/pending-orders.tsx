import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Card, Button, Badge, toast } from '@corthex/ui'
import { useWsStore } from '../../stores/ws-store'

type PendingOrder = {
  id: string
  ticker: string
  tickerName: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  totalAmount: number
  tradingMode: 'real' | 'paper'
  reason: string | null
  createdAt: string
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

export function PendingOrders() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data: pendingRes, isLoading } = useQuery({
    queryKey: ['strategy-pending-orders'],
    queryFn: () => api.get<{ data: PendingOrder[] }>('/workspace/strategy/orders/pending'),
    refetchInterval: 30_000,
  })

  const orders = pendingRes?.data ?? []

  // WebSocket real-time updates
  const { addListener, removeListener, subscribe, isConnected } = useWsStore()

  const handleWsEvent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['strategy-pending-orders'] })
    queryClient.invalidateQueries({ queryKey: ['strategy-portfolios'] })
  }, [queryClient])

  useEffect(() => {
    if (isConnected) {
      subscribe('strategy')
    }
  }, [isConnected, subscribe])

  useEffect(() => {
    addListener('strategy', handleWsEvent)
    return () => removeListener('strategy', handleWsEvent)
  }, [addListener, removeListener, handleWsEvent])

  const approveOne = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/strategy/orders/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending-orders'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-portfolios'] })
      toast.success('주문이 승인되었습니다')
    },
    onError: () => toast.error('승인에 실패했습니다'),
  })

  const rejectOne = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/strategy/orders/${id}/reject`, { reason: '사용자 거부' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending-orders'] })
      toast.success('주문이 거부되었습니다')
    },
    onError: () => toast.error('거부에 실패했습니다'),
  })

  const bulkApprove = useMutation({
    mutationFn: (ids: string[]) => api.post('/workspace/strategy/orders/bulk-approve', { orderIds: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending-orders'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-portfolios'] })
      setSelected(new Set())
      toast.success('선택한 주문이 승인되었습니다')
    },
    onError: () => toast.error('일괄 승인에 실패했습니다'),
  })

  const bulkReject = useMutation({
    mutationFn: (ids: string[]) => api.post('/workspace/strategy/orders/bulk-reject', { orderIds: ids, reason: '사용자 일괄 거부' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending-orders'] })
      setSelected(new Set())
      toast.success('선택한 주문이 거부되었습니다')
    },
    onError: () => toast.error('일괄 거부에 실패했습니다'),
  })

  if (isLoading || orders.length === 0) return null

  const allSelected = orders.length > 0 && selected.size === orders.length
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map((o) => o.id)))
    }
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card variant="bordered">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-corthex-text-primary">승인 대기 주문</h3>
            <Badge variant="warning">{orders.length}건</Badge>
          </div>
          {orders.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-corthex-text-disabled cursor-pointer">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-indigo-600" />
                전체 선택
              </label>
              {selected.size > 0 && (
                <>
                  <Button
                    size="sm"
                    onClick={() => bulkApprove.mutate(Array.from(selected))}
                    disabled={bulkApprove.isPending}
                  >
                    일괄 승인 ({selected.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => bulkReject.mutate(Array.from(selected))}
                    disabled={bulkReject.isPending}
                  >
                    일괄 거부
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-corthex-bg"
            >
              {orders.length > 1 && (
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={() => toggleOne(order.id)}
                  className="accent-indigo-600 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={order.side === 'buy' ? 'success' : 'error'}>
                    {order.side === 'buy' ? '매수' : '매도'}
                  </Badge>
                  <span className="text-sm font-medium text-corthex-text-primary truncate">{order.tickerName}</span>
                  <span className="text-xs text-corthex-text-disabled">{order.ticker}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-corthex-text-disabled">
                  <span>{order.quantity}주</span>
                  <span>@{formatPrice(order.price)}원</span>
                  <span>총 {formatPrice(order.totalAmount)}원</span>
                </div>
                {order.reason && (
                  <p className="mt-1 text-xs text-corthex-text-secondary line-clamp-2">{order.reason}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  onClick={() => approveOne.mutate(order.id)}
                  disabled={approveOne.isPending}
                >
                  승인
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => rejectOne.mutate(order.id)}
                  disabled={rejectOne.isPending}
                >
                  거부
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
