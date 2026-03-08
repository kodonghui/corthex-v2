import type { ToolHandler } from '../types'

// ─── 플랫폼별 업계 평균 참여율 벤치마크 (%) ───
const BENCHMARKS: Record<string, { top10: number; top25: number; average: number; below: number }> = {
  instagram: { top10: 6.0, top25: 3.5, average: 1.5, below: 0.5 },
  youtube: { top10: 8.0, top25: 5.0, average: 2.0, below: 0.8 },
  tiktok: { top10: 12.0, top25: 7.0, average: 4.0, below: 1.5 },
  linkedin: { top10: 5.0, top25: 3.0, average: 1.0, below: 0.3 },
  twitter: { top10: 3.0, top25: 1.5, average: 0.5, below: 0.1 },
}

type Metrics = {
  likes: number
  shares: number
  comments: number
  reach: number
  clicks: number
  followers: number
}

function parseMetrics(input: Record<string, unknown>): Metrics {
  return {
    likes: Number(input.likes) || 0,
    shares: Number(input.shares) || 0,
    comments: Number(input.comments) || 0,
    reach: Number(input.reach) || 0,
    clicks: Number(input.clicks) || 0,
    followers: Number(input.followers) || 0,
  }
}

function calcEngagementRate(m: Metrics): number {
  if (m.reach <= 0) return 0
  return ((m.likes + m.comments + m.shares) / m.reach) * 100
}

function calcViralCoefficient(m: Metrics): number {
  const denominator = m.likes + m.comments
  if (denominator <= 0) return 0
  return m.shares / denominator
}

function calcClickRate(m: Metrics): number {
  if (m.reach <= 0) return 0
  return (m.clicks / m.reach) * 100
}

function getGrade(rate: number, platform: string): string {
  const bench = BENCHMARKS[platform] || BENCHMARKS.instagram
  if (rate >= bench.top10) return '상위 10% (최우수)'
  if (rate >= bench.top25) return '상위 25% (우수)'
  if (rate >= bench.average) return '평균 이상 (양호)'
  if (rate >= bench.below) return '평균 이하 (개선 필요)'
  return '하위 (대폭 개선 필요)'
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function analyzeSingle(input: Record<string, unknown>) {
  const m = parseMetrics(input)
  if (m.reach <= 0 && m.followers <= 0) {
    return JSON.stringify({ success: false, message: 'reach 또는 followers를 입력하세요.' })
  }

  const effectiveReach = m.reach > 0 ? m.reach : m.followers
  const metricsWithReach = { ...m, reach: effectiveReach }

  const engagementRate = calcEngagementRate(metricsWithReach)
  const viralCoefficient = calcViralCoefficient(m)
  const clickRate = calcClickRate(metricsWithReach)
  const platform = String(input.platform || 'instagram')

  const totalInteractions = m.likes + m.comments + m.shares + m.clicks

  return JSON.stringify({
    success: true,
    metrics: m,
    analysis: {
      engagementRate: round2(engagementRate),
      engagementRateLabel: `${round2(engagementRate)}%`,
      viralCoefficient: round2(viralCoefficient),
      isViral: viralCoefficient >= 1,
      clickRate: round2(clickRate),
      clickRateLabel: `${round2(clickRate)}%`,
      totalInteractions,
      reachToFollowerRatio: m.followers > 0 ? round2((effectiveReach / m.followers) * 100) : null,
    },
    grade: getGrade(engagementRate, platform),
    platform,
    recommendations: generateRecommendations(engagementRate, viralCoefficient, clickRate, platform),
  })
}

function generateRecommendations(engRate: number, viral: number, clickRate: number, platform: string): string[] {
  const recs: string[] = []
  const bench = BENCHMARKS[platform] || BENCHMARKS.instagram

  if (engRate < bench.average) {
    recs.push('참여율이 평균 이하입니다. 질문형 캡션이나 CTA를 추가해보세요.')
  }
  if (viral < 0.3) {
    recs.push('공유율이 낮습니다. 공유 가치가 높은 정보성/유머 콘텐츠를 시도하세요.')
  }
  if (clickRate < 1.0) {
    recs.push('클릭률이 낮습니다. 호기심을 유발하는 제목과 명확한 CTA를 사용하세요.')
  }
  if (engRate >= bench.top25) {
    recs.push('참여율이 우수합니다! 이 콘텐츠 유형을 더 자주 게시하세요.')
  }
  if (viral >= 1) {
    recs.push('바이럴 콘텐츠입니다! 유사한 포맷으로 시리즈를 만들어보세요.')
  }

  return recs.length > 0 ? recs : ['전반적으로 양호합니다. 현재 전략을 유지하세요.']
}

function compare(input: Record<string, unknown>) {
  const postsRaw = input.posts
  if (!Array.isArray(postsRaw) || postsRaw.length === 0) {
    return JSON.stringify({ success: false, message: 'posts 배열을 입력하세요. 예: posts=[{name:"Post1", likes:100, ...}, ...]' })
  }

  const platform = String(input.platform || 'instagram')

  const analyzed = postsRaw.map((post: unknown, idx: number) => {
    const p = post as Record<string, unknown>
    const name = String(p.name || `Post ${idx + 1}`)
    const m = parseMetrics(p)
    const effectiveReach = m.reach > 0 ? m.reach : m.followers > 0 ? m.followers : 1
    const metricsWithReach = { ...m, reach: effectiveReach }

    const engRate = calcEngagementRate(metricsWithReach)
    const viral = calcViralCoefficient(m)
    const total = m.likes + m.comments + m.shares + m.clicks

    return { name, engagementRate: round2(engRate), viralCoefficient: round2(viral), totalInteractions: total, metrics: m }
  })

  analyzed.sort((a, b) => b.engagementRate - a.engagementRate)

  const avgEngRate = analyzed.reduce((s, a) => s + a.engagementRate, 0) / analyzed.length
  const avgViral = analyzed.reduce((s, a) => s + a.viralCoefficient, 0) / analyzed.length

  return JSON.stringify({
    success: true,
    platform,
    postCount: analyzed.length,
    ranking: analyzed.map((a, i) => ({ rank: i + 1, ...a })),
    averages: {
      engagementRate: round2(avgEngRate),
      viralCoefficient: round2(avgViral),
    },
    winner: analyzed[0]?.name || null,
    insight: `최고 성과: ${analyzed[0]?.name} (참여율 ${analyzed[0]?.engagementRate}%). 평균 참여율: ${round2(avgEngRate)}%.`,
  })
}

function trend(input: Record<string, unknown>) {
  const dataRaw = input.data
  if (!Array.isArray(dataRaw) || dataRaw.length < 2) {
    return JSON.stringify({ success: false, message: 'data 배열을 2개 이상 입력하세요. 예: data=[{date:"2026-01-01", likes:100, ...}, ...]' })
  }

  const platform = String(input.platform || 'instagram')

  const points = dataRaw.map((d: unknown) => {
    const p = d as Record<string, unknown>
    const m = parseMetrics(p)
    const effectiveReach = m.reach > 0 ? m.reach : m.followers > 0 ? m.followers : 1
    const engRate = calcEngagementRate({ ...m, reach: effectiveReach })
    return {
      date: String(p.date || ''),
      engagementRate: round2(engRate),
      totalInteractions: m.likes + m.comments + m.shares + m.clicks,
      metrics: m,
    }
  })

  // 성장률 계산
  const firstRate = points[0].engagementRate
  const lastRate = points[points.length - 1].engagementRate
  const growthRate = firstRate > 0 ? round2(((lastRate - firstRate) / firstRate) * 100) : 0

  // 이상치 감지 (평균 ± 2σ)
  const rates = points.map((p) => p.engagementRate)
  const mean = rates.reduce((s, r) => s + r, 0) / rates.length
  const stdDev = Math.sqrt(rates.reduce((s, r) => s + (r - mean) ** 2, 0) / rates.length)
  const outliers = points.filter((p) => Math.abs(p.engagementRate - mean) > 2 * stdDev)

  // 추세 방향
  const trendDirection = growthRate > 5 ? '상승' : growthRate < -5 ? '하락' : '유지'

  return JSON.stringify({
    success: true,
    platform,
    dataPoints: points.length,
    trend: {
      direction: trendDirection,
      growthRate: `${growthRate}%`,
      firstRate: `${firstRate}%`,
      lastRate: `${lastRate}%`,
      averageRate: `${round2(mean)}%`,
    },
    outliers: outliers.map((o) => ({ date: o.date, rate: o.engagementRate, deviation: round2(Math.abs(o.engagementRate - mean) / stdDev) })),
    points,
    insight: `참여율 ${trendDirection} 추세 (${growthRate > 0 ? '+' : ''}${growthRate}%). 평균 ${round2(mean)}%, ${outliers.length}개 이상치 감지.`,
  })
}

function benchmark(input: Record<string, unknown>) {
  const m = parseMetrics(input)
  const platform = String(input.platform || 'instagram')
  const bench = BENCHMARKS[platform]

  if (!bench) {
    return JSON.stringify({
      success: false,
      message: `지원하지 않는 플랫폼: ${platform}. instagram, youtube, tiktok, linkedin, twitter를 사용하세요.`,
    })
  }

  if (m.reach <= 0 && m.followers <= 0) {
    return JSON.stringify({ success: false, message: 'reach 또는 followers를 입력하세요.' })
  }

  const effectiveReach = m.reach > 0 ? m.reach : m.followers
  const engRate = calcEngagementRate({ ...m, reach: effectiveReach })
  const grade = getGrade(engRate, platform)

  return JSON.stringify({
    success: true,
    platform,
    engagementRate: round2(engRate),
    grade,
    benchmark: {
      top10: `${bench.top10}%`,
      top25: `${bench.top25}%`,
      average: `${bench.average}%`,
      below: `${bench.below}%`,
    },
    gap: {
      toTop10: round2(bench.top10 - engRate),
      toTop25: round2(bench.top25 - engRate),
      toAverage: round2(bench.average - engRate),
    },
    insight: `${platform}에서 참여율 ${round2(engRate)}%는 ${grade}에 해당합니다. 업계 평균 ${bench.average}% 대비 ${engRate >= bench.average ? '상회' : '하회'}합니다.`,
  })
}

export const engagementAnalyzer: ToolHandler = (input) => {
  const action = String(input.action || 'analyze')

  if (action === 'analyze') return analyzeSingle(input)
  if (action === 'compare') return compare(input)
  if (action === 'trend') return trend(input)
  if (action === 'benchmark') return benchmark(input)

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. analyze, compare, trend, benchmark를 사용하세요.` })
}
