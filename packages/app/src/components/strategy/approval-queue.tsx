import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Card, Button, Badge, ConfirmDialog, toast } from '@corthex/ui'
import { useWsStore } from '../../stores/ws-store'

type PendingOrder = {
  id: string
  ticker: string
  tickerName: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  totalAmount: number
  orderType: string
  tradingMode: 'real' | 'paper'
  reason: string | null
  createdAt: string
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function parseConfidence(reason: string | null): string | null {
  if (!reason) return null
  const match = reason.match(/확신도:\s*(\d+)%/)
  return match ? `${match[1]}%` : null
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ApprovalQueue() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)

  const { data: pendingRes, isLoading } = useQuery({
    queryKey: ['strategy-pending'],
    queryFn: () => api.get<{ data: PendingOrder[] }>('/workspace/strategy/orders/pending'),
    refetchInterval: 30_000,
  })

  const orders = pendingRes?.data ?? []

  // WebSocket real-time updates
  const { addListener, removeListener, subscribe, isConnected } = useWsStore()

  const handleWsEvent = useCallback((data: unknown) => {
    const event = data as { type?: string }
    if (event?.type === 'trade:pending_approval') {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders-summary'] })
    }
  }, [queryClient])

  useEffect(() => {
    if (isConnected) subscribe('strategy')
  }, [isConnected, subscribe])

  useEffect(() => {
    addListener('strategy', handleWsEvent)
    return () => removeListener('strategy', handleWsEvent)
  }, [addListener, removeListener, handleWsEvent])

  const approveOne = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/strategy/orders/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders-summary'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-portfolios'] })
      toast.success('주문이 승인되었습니다')
    },
    onError: (err: Error) => toast.error(err.message || '승인에 실패했습니다'),
  })

  const rejectOne = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post(`/workspace/strategy/orders/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders-summary'] })
      setRejectTarget(null)
      setRejectReason('')
      toast.success('주문이 거부되었습니다')
    },
    onError: () => toast.error('거부에 실패했습니다'),
  })

  const bulkApproveMut = useMutation({
    mutationFn: (ids: string[]) => api.post('/workspace/strategy/orders/bulk-approve', { orderIds: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders-summary'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-portfolios'] })
      setSelected(new Set())
      toast.success('선택한 주문이 승인되었습니다')
    },
    onError: () => toast.error('일괄 승인에 실패했습니다'),
  })

  const bulkRejectMut = useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason?: string }) =>
      api.post('/workspace/strategy/orders/bulk-reject', { orderIds: ids, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-pending'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-orders-summary'] })
      setSelected(new Set())
      setBulkRejectOpen(false)
      setRejectReason('')
      toast.success('선택한 주문이 거부되었습니다')
    },
    onError: () => toast.error('일괄 거부에 실패했습니다'),
  })

  if (isLoading) {
    return (
      <div className="p-4 text-xs text-corthex-text-disabled text-center">승인 대기 주문을 불러오는 중...</div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-2xl mb-2">✅</div>
        <p className="text-sm text-corthex-text-secondary">승인 대기 주문이 없습니다</p>
      </div>
    )
  }

  const allSelected = orders.length > 0 && selected.size === orders.length
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)))
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
    <div className="space-y-3">
      {/* Header + Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-corthex-text-primary">승인 대기</h3>
          <Badge variant="warning">{orders.length}건</Badge>
        </div>
        {orders.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-corthex-text-disabled cursor-pointer">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-indigo-600" />
              전체
            </label>
            {selected.size > 0 && (
              <>
                <Button size="sm" onClick={() => bulkApproveMut.mutate(Array.from(selected))} disabled={bulkApproveMut.isPending}>
                  일괄 승인 ({selected.size})
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setBulkRejectOpen(true)} disabled={bulkRejectMut.isPending}>
                  일괄 거부
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Order list */}
      <div className="space-y-2">
        {orders.map((order) => {
          const confidence = parseConfidence(order.reason)
          return (
            <Card key={order.id} variant="bordered" className="p-3">
              <div className="flex items-start gap-3">
                {orders.length > 1 && (
                  <input
                    type="checkbox"
                    checked={selected.has(order.id)}
                    onChange={() => toggleOne(order.id)}
                    className="accent-indigo-600 mt-1 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={order.side === 'buy' ? 'success' : 'error'}>
                      {order.side === 'buy' ? '매수' : '매도'}
                    </Badge>
                    <span className="text-sm font-medium text-corthex-text-primary truncate">{order.tickerName}</span>
                    <span className="text-xs text-corthex-text-disabled">{order.ticker}</span>
                    {order.tradingMode === 'real' && <Badge variant="error">실거래</Badge>}
                    {confidence && <Badge variant="info">확신도 {confidence}</Badge>}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-corthex-text-disabled">
                    <span>{order.quantity}주</span>
                    <span>@{formatPrice(order.price)}원</span>
                    <span>총 {formatPrice(order.totalAmount)}원</span>
                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                  {order.reason && (
                    <p className="mt-1.5 text-xs text-corthex-text-secondary line-clamp-2">{order.reason}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" onClick={() => approveOne.mutate(order.id)} disabled={approveOne.isPending}>
                    승인
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRejectTarget(order.id)} disabled={rejectOne.isPending}>
                    거부
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Reject reason dialog (single) */}
      <ConfirmDialog
        isOpen={!!rejectTarget}
        onConfirm={() => {
          if (rejectTarget) rejectOne.mutate({ id: rejectTarget, reason: rejectReason || undefined })
        }}
        onCancel={() => { setRejectTarget(null); setRejectReason('') }}
        title="주문 거부"
        description="거부 사유를 입력해주세요 (선택사항)"
        confirmText="거부"
        cancelText="취소"
        variant="danger"
      />

      {/* Reject reason dialog (bulk) */}
      <ConfirmDialog
        isOpen={bulkRejectOpen}
        onConfirm={() => bulkRejectMut.mutate({ ids: Array.from(selected), reason: rejectReason || undefined })}
        onCancel={() => { setBulkRejectOpen(false); setRejectReason('') }}
        title={`${selected.size}건 일괄 거부`}
        description="거부 사유를 입력해주세요 (선택사항)"
        confirmText="일괄 거부"
        cancelText="취소"
        variant="danger"
      />
    </div>
  )
}
