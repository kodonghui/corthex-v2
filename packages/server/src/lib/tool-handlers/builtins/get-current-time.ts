import type { ToolHandler } from '../types'

export const getCurrentTime: ToolHandler = () => {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return JSON.stringify({
    utc: now.toISOString(),
    kst: kst.toISOString().replace('T', ' ').slice(0, 19) + ' KST',
    date: kst.toISOString().slice(0, 10),
    dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][kst.getUTCDay()] + '요일',
  })
}
