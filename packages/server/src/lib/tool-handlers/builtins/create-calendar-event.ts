import type { ToolHandler } from '../types'

type CalendarEventResponse = {
  id?: string
  htmlLink?: string
  summary?: string
  start?: { dateTime?: string }
  end?: { dateTime?: string }
}

export const createCalendarEvent: ToolHandler = async (input, ctx) => {
  const title = String(input.title || '')
  const startTime = String(input.startTime || '')
  const endTime = String(input.endTime || '')

  if (!title || !startTime || !endTime) {
    return JSON.stringify({ success: false, message: '제목(title), 시작 시간(startTime), 종료 시간(endTime)은 필수입니다.' })
  }

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('google_calendar')
  } catch {
    return JSON.stringify({
      success: false,
      message: 'Google Calendar API 키가 등록되지 않았습니다. 설정에서 등록하세요.',
    })
  }

  const calendarId = (ctx.config?.calendarId as string) || 'primary'
  const description = input.description ? String(input.description) : undefined
  const location = input.location ? String(input.location) : undefined

  const event = {
    summary: title,
    start: { dateTime: startTime, timeZone: 'Asia/Seoul' },
    end: { dateTime: endTime, timeZone: 'Asia/Seoul' },
    ...(description && { description }),
    ...(location && { location }),
  }

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${creds.api_key}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })

    if (!res.ok) {
      const errText = await res.text()
      return JSON.stringify({ success: false, message: `Calendar API 오류: ${res.status} ${errText.slice(0, 200)}` })
    }

    const data = (await res.json()) as CalendarEventResponse

    return JSON.stringify({
      success: true,
      message: `일정이 생성되었습니다: ${data.summary}`,
      eventId: data.id,
      link: data.htmlLink,
    })
  } catch (err) {
    return JSON.stringify({
      success: false,
      message: `일정 생성 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
