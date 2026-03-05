import type { ToolHandler } from '../types'

type CalendarEvent = {
  summary?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  location?: string
}

type CalendarListResponse = {
  items?: CalendarEvent[]
}

export const listCalendarEvents: ToolHandler = async (input, ctx) => {
  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('google_calendar')
  } catch {
    return JSON.stringify({
      events: [],
      message: 'Google Calendar API 키가 등록되지 않았습니다. 설정에서 등록하세요.',
    })
  }

  const calendarId = (ctx.config?.calendarId as string) || 'primary'
  const daysAhead = Number(input.days || 7)
  const now = new Date()
  const timeMin = now.toISOString()
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  const timeMax = future.toISOString()

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${creds.api_key}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=10`

    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })

    if (!res.ok) {
      const errText = await res.text()
      return JSON.stringify({ events: [], message: `Calendar API 오류: ${res.status} ${errText.slice(0, 200)}` })
    }

    const data = (await res.json()) as CalendarListResponse
    const events = (data.items || []).map((e) => ({
      title: e.summary || '(제목 없음)',
      start: e.start?.dateTime || e.start?.date || '',
      end: e.end?.dateTime || e.end?.date || '',
      location: e.location || null,
    }))

    return JSON.stringify({ events, count: events.length, period: `${daysAhead}일` })
  } catch (err) {
    return JSON.stringify({
      events: [],
      message: `캘린더 조회 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
