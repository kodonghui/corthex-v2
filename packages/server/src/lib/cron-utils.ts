/**
 * cron 표현식 파싱 + 다음 실행 시간 계산 (UTC 기반)
 * 표준 5-필드: 분 시 일 월 요일
 * 지원: *, N, N-M (범위), N,M,O (목록), * /N (스텝), N-M/S (범위+스텝)
 */

export function parseField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    const result: number[] = []
    for (let i = min; i <= max; i++) result.push(i)
    return result
  }

  const values = new Set<number>()

  for (const part of field.split(',')) {
    // Step support: */N or N-M/S
    if (part.includes('/')) {
      const [rangeStr, stepStr] = part.split('/')
      const step = parseInt(stepStr, 10)
      if (isNaN(step) || step <= 0) throw new Error(`Invalid cron step value: ${part}`)

      let start = min
      let end = max
      if (rangeStr === '*') {
        // */N: start from min, step by N
      } else if (rangeStr.includes('-')) {
        const [s, e] = rangeStr.split('-')
        start = parseInt(s, 10)
        end = parseInt(e, 10)
        if (isNaN(start) || isNaN(end)) throw new Error(`Invalid cron field value: ${part}`)
        if (start > end) throw new Error(`Invalid cron range (start > end): ${part}`)
      } else {
        start = parseInt(rangeStr, 10)
        if (isNaN(start)) throw new Error(`Invalid cron field value: ${part}`)
        end = max
      }

      for (let i = Math.max(start, min); i <= Math.min(end, max); i += step) {
        values.add(i)
      }
    } else if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      if (isNaN(start) || isNaN(end)) throw new Error(`Invalid cron field value: ${part}`)
      if (start > end) throw new Error(`Invalid cron range (start > end): ${part}`)
      for (let i = Math.max(start, min); i <= Math.min(end, max); i++) values.add(i)
    } else {
      const val = parseInt(part, 10)
      if (isNaN(val)) throw new Error(`Invalid cron field value: ${part}`)
      if (val >= min && val <= max) values.add(val)
    }
  }

  const result = Array.from(values).sort((a, b) => a - b)
  if (result.length === 0) throw new Error(`Cron field produced no valid values: ${field}`)
  return result
}

/**
 * cron 표현식에서 다음 실행 시간을 계산합니다 (UTC 기준).
 * @param cronExpression - 5-필드 cron (분 시 일 월 요일)
 * @param after - 이 시간 이후의 다음 실행 시간 (기본값: 현재)
 * @returns 다음 실행 시간 (Date, UTC)
 */
export function getNextCronDate(cronExpression: string, after?: Date): Date {
  const parts = cronExpression.trim().split(/\s+/)
  if (parts.length !== 5) throw new Error(`Invalid cron expression: ${cronExpression}`)

  const minutes = parseField(parts[0], 0, 59)
  const hours = parseField(parts[1], 0, 23)
  const daysOfMonth = parseField(parts[2], 1, 31)
  const months = parseField(parts[3], 1, 12)
  const daysOfWeek = parseField(parts[4], 0, 6) // 0=일, 1=월, ..., 6=토

  const hasDayOfMonthConstraint = parts[2] !== '*'
  const hasDayOfWeekConstraint = parts[4] !== '*'

  // after 시점 + 1분부터 탐색 시작
  const start = after ? new Date(after.getTime()) : new Date()
  // 초/밀리초 제거하고 1분 추가
  start.setUTCSeconds(0, 0)
  start.setUTCMinutes(start.getUTCMinutes() + 1)

  const candidate = new Date(start)

  // 최대 366일 탐색
  const maxIterations = 366 * 24 * 60
  let iterations = 0

  while (iterations < maxIterations) {
    iterations++

    // 월 체크
    const month = candidate.getUTCMonth() + 1 // 1-indexed
    if (!months.includes(month)) {
      const nextMonth = months.find(m => m > month) || months[0]
      if (nextMonth <= month) {
        candidate.setUTCFullYear(candidate.getUTCFullYear() + 1)
      }
      candidate.setUTCMonth(nextMonth - 1, 1)
      candidate.setUTCHours(hours[0], minutes[0], 0, 0)
      continue
    }

    // 일 체크
    const dayOfMonth = candidate.getUTCDate()
    const dayOfWeek = candidate.getUTCDay()

    let dayMatch = true
    if (hasDayOfMonthConstraint && hasDayOfWeekConstraint) {
      dayMatch = daysOfMonth.includes(dayOfMonth) || daysOfWeek.includes(dayOfWeek)
    } else if (hasDayOfMonthConstraint) {
      dayMatch = daysOfMonth.includes(dayOfMonth)
    } else if (hasDayOfWeekConstraint) {
      dayMatch = daysOfWeek.includes(dayOfWeek)
    }

    if (!dayMatch) {
      candidate.setUTCDate(candidate.getUTCDate() + 1)
      candidate.setUTCHours(hours[0], minutes[0], 0, 0)
      continue
    }

    // 시 체크
    const hour = candidate.getUTCHours()
    if (!hours.includes(hour)) {
      const nextHour = hours.find(h => h > hour)
      if (nextHour !== undefined) {
        candidate.setUTCHours(nextHour, minutes[0], 0, 0)
      } else {
        candidate.setUTCDate(candidate.getUTCDate() + 1)
        candidate.setUTCHours(hours[0], minutes[0], 0, 0)
      }
      continue
    }

    // 분 체크
    const minute = candidate.getUTCMinutes()
    if (!minutes.includes(minute)) {
      const nextMinute = minutes.find(m => m > minute)
      if (nextMinute !== undefined) {
        candidate.setUTCMinutes(nextMinute, 0, 0)
      } else {
        const nextHour = hours.find(h => h > hour)
        if (nextHour !== undefined) {
          candidate.setUTCHours(nextHour, minutes[0], 0, 0)
        } else {
          candidate.setUTCDate(candidate.getUTCDate() + 1)
          candidate.setUTCHours(hours[0], minutes[0], 0, 0)
        }
      }
      continue
    }

    // 모든 조건 통과
    return candidate
  }

  throw new Error(`No matching date found within 1 year for cron: ${cronExpression}`)
}

/**
 * cron 표현식을 사람이 읽을 수 있는 한국어 설명으로 변환합니다.
 */
export function describeCronExpression(cronExpression: string): string {
  const parts = cronExpression.trim().split(/\s+/)
  if (parts.length !== 5) return cronExpression

  const [minField, hourField, domField, monField, dowField] = parts
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  // Time description
  let timeDesc = ''
  if (hourField === '*' && minField === '*') {
    timeDesc = '매분'
  } else if (hourField === '*') {
    timeDesc = `매시 ${minField}분`
  } else if (minField === '*') {
    timeDesc = `${hourField}시 매분`
  } else {
    const h = hourField.padStart(2, '0')
    const m = minField.padStart(2, '0')
    timeDesc = `${h}:${m}`
  }

  // Step descriptions
  if (minField.startsWith('*/')) {
    const step = minField.split('/')[1]
    timeDesc = `${step}분마다`
  }
  if (hourField.startsWith('*/')) {
    const step = hourField.split('/')[1]
    timeDesc = `${step}시간마다`
  }

  // Day of week description
  if (dowField !== '*') {
    if (dowField === '1-5') return `평일 ${timeDesc}`
    if (dowField === '0,6') return `주말 ${timeDesc}`
    const days = dowField.split(',').map(d => {
      const n = parseInt(d, 10)
      return dayNames[n] || d
    }).join('·')
    return `${days} ${timeDesc}`
  }

  // Day of month + month description
  if (domField !== '*' && monField !== '*') {
    return `${monField}월 ${domField}일 ${timeDesc}`
  }

  if (domField !== '*') {
    return `매월 ${domField}일 ${timeDesc}`
  }

  // Month description
  if (monField !== '*') {
    return `${monField}월 ${timeDesc}`
  }

  // Daily
  if (hourField !== '*' && !hourField.includes('/')) {
    return `매일 ${timeDesc}`
  }

  return timeDesc
}

/**
 * cron 표현식의 유효성을 검사하고 설명 + 다음 실행 시간을 반환합니다.
 */
export function validateCronExpression(cronExpression: string): {
  valid: boolean
  error?: string
  description?: string
  nextRun?: Date
} {
  try {
    const parts = cronExpression.trim().split(/\s+/)
    if (parts.length !== 5) {
      return { valid: false, error: `5개 필드가 필요합니다 (분 시 일 월 요일). 현재 ${parts.length}개` }
    }

    // Validate each field by parsing
    const fieldNames = ['분(0-59)', '시(0-23)', '일(1-31)', '월(1-12)', '요일(0-6)']
    const ranges: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]]

    for (let i = 0; i < 5; i++) {
      try {
        parseField(parts[i], ranges[i][0], ranges[i][1])
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        return { valid: false, error: `${fieldNames[i]} 필드 오류: ${msg}` }
      }
    }

    const description = describeCronExpression(cronExpression)
    const nextRun = getNextCronDate(cronExpression)

    return { valid: true, description, nextRun }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { valid: false, error: msg }
  }
}
