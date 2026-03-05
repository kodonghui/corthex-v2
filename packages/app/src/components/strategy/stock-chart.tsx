import { useEffect, useRef } from 'react'
import { createChart, createSeriesMarkers, type IChartApi, type CandlestickData, ColorType, CandlestickSeries } from 'lightweight-charts'

type Candle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type MarkerData = {
  time: string
  type: 'buy' | 'sell'
}

type Props = {
  candles: Candle[]
  markers?: MarkerData[]
  className?: string
}

export function StockChart({ candles, markers, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const isDark = document.documentElement.classList.contains('dark')

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#a1a1aa' : '#71717a',
      },
      grid: {
        vertLines: { color: isDark ? '#27272a' : '#e4e4e7' },
        horzLines: { color: isDark ? '#27272a' : '#e4e4e7' },
      },
      width: container.clientWidth,
      height: container.clientHeight,
      rightPriceScale: { borderColor: isDark ? '#3f3f46' : '#d4d4d8' },
      timeScale: { borderColor: isDark ? '#3f3f46' : '#d4d4d8' },
      crosshair: {
        vertLine: { labelBackgroundColor: isDark ? '#3f3f46' : '#e4e4e7' },
        horzLine: { labelBackgroundColor: isDark ? '#3f3f46' : '#e4e4e7' },
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    })

    series.setData(candles as CandlestickData[])

    if (markers && markers.length > 0) {
      createSeriesMarkers(series,
        markers.map((m) => ({
          time: m.time,
          position: m.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
          color: m.type === 'buy' ? '#10b981' : '#ef4444',
          shape: m.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
          text: m.type === 'buy' ? 'B' : 'S',
        })),
      )
    }

    chart.timeScale().fitContent()
    chartRef.current = chart

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      chart.applyOptions({ width, height })
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [candles, markers])

  return <div ref={containerRef} className={className} />
}
