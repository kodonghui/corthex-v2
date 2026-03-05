import type { ToolHandler } from '../types'

const GRAPH_API = 'https://graph.facebook.com/v18.0'

type InsightValue = { value: number; end_time?: string }
type InsightData = { name: string; values: InsightValue[] }
type InsightsResponse = {
  data?: InsightData[]
  error?: { message?: string }
}
type AccountResponse = {
  followers_count?: number
  media_count?: number
  error?: { message?: string }
}

export const getInstagramInsights: ToolHandler = async (input, ctx) => {
  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('instagram')
  } catch {
    return JSON.stringify({ success: false, message: '인스타그램 자격증명이 등록되지 않았습니다. 설정에서 등록하세요.' })
  }

  const pageId = creds.page_id
  const accessToken = creds.access_token

  try {
    // Account basic info
    const accountRes = await fetch(
      `${GRAPH_API}/${pageId}?fields=followers_count,media_count`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }, signal: AbortSignal.timeout(30_000) },
    )

    if (!accountRes.ok) {
      const err = (await accountRes.json()) as AccountResponse
      return JSON.stringify({ success: false, message: `계정 조회 오류: ${err.error?.message || accountRes.status}` })
    }

    const account = (await accountRes.json()) as AccountResponse

    // Insights (impressions, reach)
    const insightsRes = await fetch(
      `${GRAPH_API}/${pageId}/insights?metric=impressions,reach&period=day`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }, signal: AbortSignal.timeout(30_000) },
    )

    let impressions = 0
    let reach = 0

    if (insightsRes.ok) {
      const insights = (await insightsRes.json()) as InsightsResponse
      for (const metric of insights.data || []) {
        const latestValue = metric.values?.[metric.values.length - 1]?.value || 0
        if (metric.name === 'impressions') impressions = latestValue
        if (metric.name === 'reach') reach = latestValue
      }
    }

    return JSON.stringify({
      success: true,
      followers: account.followers_count || 0,
      mediaCount: account.media_count || 0,
      impressions,
      reach,
      message: `팔로워 ${account.followers_count || 0}명, 오늘 노출 ${impressions}회, 도달 ${reach}회`,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `인사이트 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
