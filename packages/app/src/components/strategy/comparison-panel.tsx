import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Button, Card, EmptyState, toast } from '@corthex/ui'

type PriceData = {
  name: string
  price: number
  change: number
  changeRate: number
  open: number
  high: number
  low: number
  volume: number
  error?: boolean
}

function isMarketOpen(): boolean {
  const now = new Date()
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const day = kst.getDay()
  if (day === 0 || day === 6) return false
  const minutes = kst.getHours() * 60 + kst.getMinutes()
  return minutes >= 540 && minutes <= 930
}

function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function ComparisonPanel() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [marketOpen, setMarketOpen] = useState(isMarketOpen)

  const codes = useMemo(() => {
    const raw = searchParams.get('compare')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [searchParams])

  useEffect(() => {
    const id = setInterval(() => setMarketOpen(isMarketOpen()), 60_000)
    return () => clearInterval(id)
  }, [])

  const { data: priceRes } = useQuery({
    queryKey: ['strategy-prices', codes.join(',')],
    queryFn: () => api.get<{ data: Record<string, PriceData> }>(`/workspace/strategy/prices?codes=${encodeURIComponent(codes.join(','))}`),
    enabled: codes.length >= 2,
    refetchInterval: marketOpen ? 30_000 : false,
    refetchOnWindowFocus: true,
    retry: false,
  })

  const prices = priceRes?.data || {}

  const goToStock = (code: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('compare')
      next.set('stock', code)
      return next
    })
  }

  if (codes.length < 2) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          title="비교할 종목을 선택해주세요"
          description="왼쪽 목록에서 비교 모드를 켜고 2개 이상 종목을 선택하세요"
        />
      </div>
    )
  }

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-y-auto">
      <Card variant="bordered" className="shrink-0">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-corthex-text-primary">
              종목 비교 ({codes.length}개)
            </h2>
            <div className="flex items-center gap-2">
              {!marketOpen && <span className="text-xs text-corthex-text-secondary">장 마감</span>}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(
                    () => toast.success('공유 링크가 복사되었습니다'),
                    () => toast.error('클립보드 복사에 실패했습니다'),
                  )
                }}
              >
                공유
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="bordered" className="shrink-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">종목명</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">현재가</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">등락률</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">시가</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">고가</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">저가</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-corthex-text-secondary whitespace-nowrap">거래량</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const p = prices[code]
                const hasData = p && !p.error
                const changeColor = hasData
                  ? p.changeRate > 0 ? 'text-emerald-500' : p.changeRate < 0 ? 'text-red-500' : 'text-corthex-text-disabled'
                  : 'text-corthex-text-disabled'
                const sign = hasData && p.changeRate > 0 ? '+' : ''

                return (
                  <tr
                    key={code}
                    className="border-b border-zinc-100 last:border-0 hover:bg-corthex-bg cursor-pointer"
                    onClick={() => goToStock(code)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-corthex-text-primary">
                        {hasData ? p.name : code}
                      </div>
                      <div className="text-xs text-corthex-text-disabled">{code}</div>
                    </td>
                    {hasData ? (
                      <>
                        <td className="text-right px-4 py-3 font-mono font-semibold text-corthex-text-primary whitespace-nowrap">
                          {formatPrice(p.price)}
                        </td>
                        <td className={`text-right px-4 py-3 font-medium whitespace-nowrap ${changeColor}`}>
                          {sign}{p.changeRate.toFixed(2)}%
                        </td>
                        <td className="text-right px-4 py-3 text-corthex-text-secondary whitespace-nowrap">{formatPrice(p.open)}</td>
                        <td className="text-right px-4 py-3 text-emerald-500 whitespace-nowrap">{formatPrice(p.high)}</td>
                        <td className="text-right px-4 py-3 text-red-500 whitespace-nowrap">{formatPrice(p.low)}</td>
                        <td className="text-right px-4 py-3 text-corthex-text-secondary whitespace-nowrap">{formatVolume(p.volume)}</td>
                      </>
                    ) : (
                      <td colSpan={6} className="text-center px-4 py-3 text-corthex-text-disabled text-xs">
                        {p?.error ? '시세 정보를 불러올 수 없습니다' : '로딩 중...'}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
