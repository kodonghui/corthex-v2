import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Badge } from '@corthex/ui'

type TradingStatus = {
  tradingMode: 'real' | 'paper'
  kisAvailable: boolean
  account: string | null
  activeMode: string
}

export function TradingModeHeader() {
  const { data } = useQuery({
    queryKey: ['strategy-trading-status'],
    queryFn: () => api.get<{ data: TradingStatus }>('/workspace/strategy/trading-status'),
    staleTime: 30_000,
  })

  const status = data?.data
  if (!status) return null

  const isReal = status.tradingMode === 'real'

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg ${
        isReal
          ? 'bg-red-500 text-white'
          : 'bg-blue-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{isReal ? '🔴' : '🔵'}</span>
        <span>{isReal ? '실거래 모드' : '모의거래 모드'}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <Badge variant={status.kisAvailable ? 'success' : 'default'}>
          KIS {status.kisAvailable ? '연결됨' : '미연결'}
        </Badge>
        {status.account && (
          <span className="opacity-80">{status.account}</span>
        )}
      </div>
    </div>
  )
}
