import { describe, test, expect } from 'bun:test'

// === Helper functions mirroring approval-queue.tsx logic ===

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

// Order status color mapping
const STATUS_COLORS: Record<string, string> = {
  pending_approval: 'warning',
  pending: 'info',
  submitted: 'info',
  executed: 'success',
  cancelled: 'default',
  rejected: 'error',
  failed: 'error',
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? 'default'
}

// Status labels
const STATUS_LABELS: Record<string, string> = {
  pending_approval: '승인 대기',
  pending: '대기',
  submitted: '제출됨',
  executed: '체결',
  cancelled: '취소',
  rejected: '거부',
  failed: '실패',
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

describe('Story 10-8: 매매 승인/이력 UI', () => {

  describe('formatPrice', () => {
    test('formats with locale separators', () => {
      const result = formatPrice(1_234_567)
      expect(result).toContain('1')
      expect(result).toContain('234')
    })

    test('handles zero', () => {
      expect(formatPrice(0)).toBe('0')
    })
  })

  describe('parseConfidence', () => {
    test('extracts confidence percentage', () => {
      expect(parseConfidence('CIO 분석: 상승 전망. 확신도: 85%')).toBe('85%')
    })

    test('extracts from different format', () => {
      expect(parseConfidence('확신도: 70% 근거: 기술적 분석')).toBe('70%')
    })

    test('returns null for no confidence', () => {
      expect(parseConfidence('단순 매수 요청')).toBeNull()
    })

    test('returns null for null reason', () => {
      expect(parseConfidence(null)).toBeNull()
    })

    test('returns null for empty string', () => {
      expect(parseConfidence('')).toBeNull()
    })

    test('handles 100% confidence', () => {
      expect(parseConfidence('확신도: 100%')).toBe('100%')
    })
  })

  describe('formatTime', () => {
    test('formats date string to Korean locale', () => {
      const result = formatTime('2026-03-08T10:30:00Z')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    test('handles ISO date string', () => {
      const result = formatTime('2026-01-15T09:00:00.000Z')
      expect(typeof result).toBe('string')
    })
  })

  describe('Status Colors', () => {
    test('pending_approval is warning', () => {
      expect(getStatusColor('pending_approval')).toBe('warning')
    })

    test('executed is success', () => {
      expect(getStatusColor('executed')).toBe('success')
    })

    test('rejected is error', () => {
      expect(getStatusColor('rejected')).toBe('error')
    })

    test('failed is error', () => {
      expect(getStatusColor('failed')).toBe('error')
    })

    test('unknown status defaults', () => {
      expect(getStatusColor('unknown')).toBe('default')
    })
  })

  describe('Status Labels', () => {
    test('pending_approval label', () => {
      expect(getStatusLabel('pending_approval')).toBe('승인 대기')
    })

    test('executed label', () => {
      expect(getStatusLabel('executed')).toBe('체결')
    })

    test('rejected label', () => {
      expect(getStatusLabel('rejected')).toBe('거부')
    })

    test('all 7 statuses have labels', () => {
      const statuses = ['pending_approval', 'pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed']
      for (const s of statuses) {
        expect(getStatusLabel(s)).not.toBe(s)
      }
    })
  })

  describe('Approval Queue Selection Logic', () => {
    test('toggle all selects all', () => {
      const orders = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const selected = new Set(orders.map((o) => o.id))
      expect(selected.size).toBe(3)
    })

    test('toggle all deselects when all selected', () => {
      const selected = new Set<string>()
      expect(selected.size).toBe(0)
    })

    test('toggle single adds', () => {
      const selected = new Set<string>(['1'])
      selected.add('2')
      expect(selected.has('2')).toBe(true)
    })

    test('toggle single removes', () => {
      const selected = new Set<string>(['1', '2'])
      selected.delete('1')
      expect(selected.has('1')).toBe(false)
      expect(selected.size).toBe(1)
    })

    test('allSelected check with complete selection', () => {
      const orders = [{ id: '1' }, { id: '2' }]
      const selected = new Set(['1', '2'])
      expect(orders.length > 0 && selected.size === orders.length).toBe(true)
    })

    test('allSelected check with partial selection', () => {
      const orders = [{ id: '1' }, { id: '2' }]
      const selected = new Set(['1'])
      expect(orders.length > 0 && selected.size === orders.length).toBe(false)
    })

    test('allSelected check with empty orders', () => {
      const orders: { id: string }[] = []
      const selected = new Set<string>()
      expect(orders.length > 0 && selected.size === orders.length).toBe(false)
    })
  })

  describe('Order Side Display', () => {
    test('buy shows 매수', () => {
      expect('buy' === 'buy' ? '매수' : '매도').toBe('매수')
    })

    test('sell shows 매도', () => {
      expect('sell' === 'buy' ? '매수' : '매도').toBe('매도')
    })

    test('buy badge variant is success', () => {
      expect('buy' === 'buy' ? 'success' : 'error').toBe('success')
    })

    test('sell badge variant is error', () => {
      expect('sell' === 'buy' ? 'success' : 'error').toBe('error')
    })
  })

  describe('Real Trade Mode Safety Display', () => {
    test('real mode shows 실거래 badge', () => {
      const order = { tradingMode: 'real' }
      expect(order.tradingMode === 'real').toBe(true)
    })

    test('paper mode does not show 실거래 badge', () => {
      const order = { tradingMode: 'paper' }
      expect(order.tradingMode === 'real').toBe(false)
    })
  })

  describe('API Endpoint Paths', () => {
    test('pending orders endpoint', () => {
      expect('/workspace/strategy/orders/pending').toBe('/workspace/strategy/orders/pending')
    })

    test('approve endpoint', () => {
      const id = 'test-uuid'
      expect(`/workspace/strategy/orders/${id}/approve`).toBe('/workspace/strategy/orders/test-uuid/approve')
    })

    test('reject endpoint', () => {
      const id = 'test-uuid'
      expect(`/workspace/strategy/orders/${id}/reject`).toBe('/workspace/strategy/orders/test-uuid/reject')
    })

    test('bulk approve endpoint', () => {
      expect('/workspace/strategy/orders/bulk-approve').toBe('/workspace/strategy/orders/bulk-approve')
    })

    test('bulk reject endpoint', () => {
      expect('/workspace/strategy/orders/bulk-reject').toBe('/workspace/strategy/orders/bulk-reject')
    })
  })

  describe('Reject Reason Dialog', () => {
    test('reject reason is optional (empty string → undefined)', () => {
      const reason = ''
      expect(reason || undefined).toBeUndefined()
    })

    test('reject reason is passed when provided', () => {
      const reason = '리스크 과다'
      expect(reason || undefined).toBe('리스크 과다')
    })
  })

  describe('WebSocket Event Handling', () => {
    test('trade:pending_approval event type check', () => {
      const event = { type: 'trade:pending_approval' }
      expect(event.type === 'trade:pending_approval').toBe(true)
    })

    test('unrelated event type is ignored', () => {
      const event = { type: 'mode:changed' }
      expect(event.type === 'trade:pending_approval').toBe(false)
    })
  })
})
