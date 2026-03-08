import type { ToolHandler } from '../types'

// ─── 플랫폼별 최적 게시 시간대 (업계 연구 기반, KST) ───
const OPTIMAL_POSTING_TIMES: Record<string, Record<string, { times: string[]; score: number }>> = {
  instagram: {
    월: { times: ['07:00', '12:00', '19:00'], score: 80 },
    화: { times: ['07:00', '12:00', '19:00'], score: 85 },
    수: { times: ['07:00', '11:00', '19:00'], score: 90 },
    목: { times: ['07:00', '12:00', '19:00'], score: 85 },
    금: { times: ['07:00', '12:00', '17:00'], score: 88 },
    토: { times: ['09:00', '11:00', '14:00'], score: 75 },
    일: { times: ['09:00', '12:00', '17:00'], score: 70 },
  },
  youtube: {
    월: { times: ['14:00', '16:00'], score: 75 },
    화: { times: ['14:00', '16:00'], score: 80 },
    수: { times: ['14:00', '16:00'], score: 82 },
    목: { times: ['12:00', '15:00'], score: 90 },
    금: { times: ['12:00', '15:00'], score: 92 },
    토: { times: ['09:00', '11:00', '14:00'], score: 88 },
    일: { times: ['09:00', '11:00'], score: 78 },
  },
  tiktok: {
    월: { times: ['06:00', '10:00', '22:00'], score: 78 },
    화: { times: ['02:00', '04:00', '09:00'], score: 85 },
    수: { times: ['07:00', '08:00', '23:00'], score: 82 },
    목: { times: ['09:00', '12:00', '19:00'], score: 88 },
    금: { times: ['05:00', '13:00', '15:00'], score: 90 },
    토: { times: ['11:00', '19:00', '20:00'], score: 85 },
    일: { times: ['07:00', '08:00', '16:00'], score: 80 },
  },
  linkedin: {
    월: { times: ['07:30', '10:00', '12:00'], score: 82 },
    화: { times: ['07:30', '10:00', '12:00'], score: 90 },
    수: { times: ['07:30', '10:00', '12:00'], score: 92 },
    목: { times: ['07:30', '10:00', '12:00'], score: 88 },
    금: { times: ['07:30', '10:00'], score: 75 },
    토: { times: ['10:00'], score: 50 },
    일: { times: ['10:00'], score: 45 },
  },
}

// ─── 콘텐츠 유형별 권장 게시 빈도 (주당) ───
const CONTENT_TYPE_FREQUENCY: Record<string, { minPerWeek: number; maxPerWeek: number; description: string }> = {
  교육: { minPerWeek: 3, maxPerWeek: 5, description: '팁, 튜토리얼, How-to 콘텐츠' },
  홍보: { minPerWeek: 1, maxPerWeek: 2, description: '제품/서비스 소개, CTA 포함' },
  소통: { minPerWeek: 2, maxPerWeek: 4, description: '질문, 투표, 스토리, 일상 공유' },
  뉴스: { minPerWeek: 1, maxPerWeek: 3, description: '업계 뉴스, 트렌드 분석' },
  후기: { minPerWeek: 1, maxPerWeek: 2, description: '고객 후기, 사례 연구' },
}

// ─── 마케팅 특별일 ───
const MARKETING_EVENTS: Record<string, string> = {
  '01-01': '새해', '02-14': '밸런타인데이', '03-08': '여성의날',
  '03-14': '화이트데이', '04-22': '지구의날', '05-05': '어린이날',
  '05-08': '어버이날', '06-05': '환경의날', '07-17': '제헌절',
  '08-15': '광복절', '09-01': '추석시즌', '10-09': '한글날',
  '10-31': '할로윈', '11-11': '빼빼로데이', '11-24': '블랙프라이데이',
  '12-25': '크리스마스', '12-31': '연말',
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr)
  return DAYS[d.getDay()]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function optimalTimes(input: Record<string, unknown>) {
  const platform = String(input.platform || 'instagram')
  const times = OPTIMAL_POSTING_TIMES[platform]

  if (!times) {
    return JSON.stringify({
      success: false,
      message: `지원하지 않는 플랫폼: ${platform}. instagram, youtube, tiktok, linkedin을 사용하세요.`,
    })
  }

  const ranked = Object.entries(times)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([day, data]) => ({ day, ...data }))

  return JSON.stringify({
    success: true,
    platform,
    schedule: times,
    bestDays: ranked.slice(0, 3).map((d) => d.day),
    recommendation: `${platform}에서 가장 효과적인 요일: ${ranked.slice(0, 3).map((d) => `${d.day}요일(${d.times[0]})`).join(', ')}`,
  })
}

function plan(input: Record<string, unknown>) {
  const topic = String(input.topic || '')
  if (!topic) return JSON.stringify({ success: false, message: 'topic 파라미터를 입력하세요. 예: topic="AI 마케팅 전략"' })

  const platform = String(input.platform || 'instagram')
  const period = String(input.period || 'week')
  const postsPerWeek = Number(input.postsPerWeek) || 5
  const startDate = String(input.startDate || new Date().toISOString().slice(0, 10))

  const times = OPTIMAL_POSTING_TIMES[platform] || OPTIMAL_POSTING_TIMES.instagram
  const totalDays = period === 'month' ? 30 : 7

  // 가장 점수 높은 요일+시간을 postsPerWeek 개 선택
  const ranked = Object.entries(times)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, Math.min(postsPerWeek, 7))

  const contentTypes = Object.keys(CONTENT_TYPE_FREQUENCY)
  const schedule: Array<{ date: string; day: string; time: string; contentType: string; topic: string }> = []

  let contentIdx = 0
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i)
    const day = getDayOfWeek(date)
    const dayData = ranked.find(([d]) => d === day)

    if (dayData) {
      const [, data] = dayData
      const time = data.times[0]
      const contentType = contentTypes[contentIdx % contentTypes.length]
      schedule.push({ date, day: `${day}요일`, time, contentType, topic: `${topic} - ${contentType}` })
      contentIdx++
    }
  }

  return JSON.stringify({
    success: true,
    topic,
    platform,
    period,
    postsPerWeek,
    startDate,
    totalSlots: schedule.length,
    schedule,
    contentTypeGuide: CONTENT_TYPE_FREQUENCY,
  })
}

function weekly(input: Record<string, unknown>) {
  const startDate = String(input.startDate || new Date().toISOString().slice(0, 10))
  const platformsRaw = input.platforms
  const platforms = Array.isArray(platformsRaw) ? platformsRaw.map(String) : [String(platformsRaw || 'instagram')]
  const topicsRaw = input.topics
  const topics = Array.isArray(topicsRaw) ? topicsRaw.map(String) : [String(topicsRaw || '일반')]

  const calendar: Array<{ date: string; day: string; posts: Array<{ platform: string; time: string; topic: string }> }> = []

  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i)
    const day = getDayOfWeek(date)
    const posts: Array<{ platform: string; time: string; topic: string }> = []

    for (const platform of platforms) {
      const times = OPTIMAL_POSTING_TIMES[platform]
      if (!times || !times[day]) continue
      const bestTime = times[day].times[0]
      const topic = topics[i % topics.length]
      posts.push({ platform, time: bestTime, topic })
    }

    const mmdd = date.slice(5)
    const event = MARKETING_EVENTS[mmdd]

    calendar.push({
      date,
      day: `${day}요일${event ? ` (${event})` : ''}`,
      posts,
    })
  }

  return JSON.stringify({
    success: true,
    startDate,
    endDate: addDays(startDate, 6),
    platforms,
    totalPosts: calendar.reduce((sum, d) => sum + d.posts.length, 0),
    calendar,
  })
}

function monthly(input: Record<string, unknown>) {
  const month = String(input.month || new Date().toISOString().slice(0, 7))
  const platformsRaw = input.platforms
  const platforms = Array.isArray(platformsRaw) ? platformsRaw.map(String) : [String(platformsRaw || 'instagram')]

  const year = parseInt(month.slice(0, 4))
  const mon = parseInt(month.slice(5, 7))
  const daysInMonth = new Date(year, mon, 0).getDate()
  const startDate = `${month}-01`

  const weeks: Array<{ week: number; startDate: string; endDate: string; posts: number; events: string[] }> = []

  let currentWeekPosts = 0
  let weekStart = startDate
  let weekEvents: string[] = []
  let weekNum = 1

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${month}-${String(d).padStart(2, '0')}`
    const day = getDayOfWeek(date)
    const mmdd = date.slice(5)
    const event = MARKETING_EVENTS[mmdd]

    if (event) weekEvents.push(event)

    for (const platform of platforms) {
      const times = OPTIMAL_POSTING_TIMES[platform]
      if (times && times[day] && times[day].score >= 80) {
        currentWeekPosts++
      }
    }

    if (day === '토' || d === daysInMonth) {
      weeks.push({
        week: weekNum,
        startDate: weekStart,
        endDate: date,
        posts: currentWeekPosts,
        events: weekEvents,
      })
      weekNum++
      weekStart = addDays(date, 1)
      currentWeekPosts = 0
      weekEvents = []
    }
  }

  const totalPosts = weeks.reduce((sum, w) => sum + w.posts, 0)

  return JSON.stringify({
    success: true,
    month,
    platforms,
    totalWeeks: weeks.length,
    totalPosts,
    weeks,
    marketingEvents: Object.entries(MARKETING_EVENTS)
      .filter(([mmdd]) => mmdd.startsWith(month.slice(5)))
      .map(([mmdd, name]) => ({ date: `${month.slice(0, 5)}${mmdd}`, event: name })),
  })
}

export const contentCalendar: ToolHandler = (input) => {
  const action = String(input.action || 'plan')

  if (action === 'plan') return plan(input)
  if (action === 'optimal_times') return optimalTimes(input)
  if (action === 'weekly') return weekly(input)
  if (action === 'monthly') return monthly(input)

  return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. plan, optimal_times, weekly, monthly를 사용하세요.` })
}
