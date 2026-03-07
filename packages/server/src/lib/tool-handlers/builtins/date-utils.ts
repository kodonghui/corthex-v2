import type { ToolHandler } from '../types'

const TZ_OFFSETS: Record<string, number> = {
  'UTC': 0, 'KST': 9, 'JST': 9, 'CST': 8, 'EST': -5, 'EDT': -4,
  'PST': -8, 'PDT': -7, 'CET': 1, 'CEST': 2, 'IST': 5.5, 'GMT': 0,
}

function toTimezone(date: Date, tz: string): Date {
  const offset = TZ_OFFSETS[tz.toUpperCase()] ?? 0
  return new Date(date.getTime() + offset * 60 * 60 * 1000)
}

function formatDate(date: Date, fmt: string): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const h = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dow = dayNames[date.getUTCDay()]

  return fmt
    .replace('YYYY', String(y))
    .replace('MM', m)
    .replace('DD', d)
    .replace('HH', h)
    .replace('mm', min)
    .replace('ss', s)
    .replace('ddd', dow + '요일')
}

export const dateUtils: ToolHandler = (input) => {
  const action = String(input.action || 'now')

  switch (action) {
    case 'now': {
      const tz = String(input.timezone || 'KST')
      const now = new Date()
      const local = toTimezone(now, tz)
      return JSON.stringify({
        utc: now.toISOString(),
        local: formatDate(local, 'YYYY-MM-DD HH:mm:ss'),
        timezone: tz,
        dayOfWeek: formatDate(local, 'ddd'),
        timestamp: now.getTime(),
      })
    }

    case 'format': {
      const dateStr = String(input.date || '')
      const fmt = String(input.format || 'YYYY-MM-DD HH:mm:ss')
      const tz = String(input.timezone || 'UTC')
      if (!dateStr) return '날짜(date)를 입력하세요.'
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) return `날짜를 파싱할 수 없습니다: ${dateStr}`
      const local = toTimezone(parsed, tz)
      return JSON.stringify({ original: dateStr, formatted: formatDate(local, fmt), timezone: tz })
    }

    case 'diff': {
      const from = String(input.from || '')
      const to = String(input.to || '')
      if (!from || !to) return 'from과 to 날짜를 모두 입력하세요.'
      const d1 = new Date(from), d2 = new Date(to)
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '날짜 형식이 올바르지 않습니다.'
      const diffMs = d2.getTime() - d1.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      const diffHours = diffMs / (1000 * 60 * 60)
      const diffMinutes = diffMs / (1000 * 60)
      return JSON.stringify({
        from, to,
        days: Math.round(diffDays * 100) / 100,
        hours: Math.round(diffHours * 100) / 100,
        minutes: Math.round(diffMinutes),
        milliseconds: diffMs,
      })
    }

    case 'add': {
      const dateStr = String(input.date || new Date().toISOString())
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) return `날짜를 파싱할 수 없습니다: ${dateStr}`
      const days = Number(input.days || 0)
      const months = Number(input.months || 0)
      const years = Number(input.years || 0)
      const hours = Number(input.hours || 0)
      const result = new Date(parsed)
      result.setFullYear(result.getFullYear() + years)
      result.setMonth(result.getMonth() + months)
      result.setDate(result.getDate() + days)
      result.setHours(result.getHours() + hours)
      return JSON.stringify({
        original: dateStr,
        result: result.toISOString(),
        added: { years, months, days, hours },
      })
    }

    case 'parse': {
      const text = String(input.text || '')
      if (!text) return '파싱할 텍스트(text)를 입력하세요.'
      const parsed = new Date(text)
      if (isNaN(parsed.getTime())) return `날짜를 파싱할 수 없습니다: ${text}`
      return JSON.stringify({
        input: text,
        iso: parsed.toISOString(),
        date: parsed.toISOString().slice(0, 10),
        time: parsed.toISOString().slice(11, 19),
        timestamp: parsed.getTime(),
        dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][parsed.getUTCDay()] + '요일',
      })
    }

    default:
      return '지원하지 않는 action입니다. (now, format, diff, add, parse)'
  }
}
