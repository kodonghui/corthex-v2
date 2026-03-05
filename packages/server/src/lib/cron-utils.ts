// cron 파서 유틸 — croner 기반
import { Cron } from 'croner'

/**
 * cron 식 유효성 검증
 * 5필드 (분 시 일 월 요일) + 프리셋 (@daily, @weekly, @hourly) 지원
 */
export function parseCron(expression: string): boolean {
  try {
    new Cron(expression)
    return true
  } catch {
    return false
  }
}

/**
 * 다음 실행 시간 계산
 * @returns 다음 실행 Date, 유효하지 않은 cron이면 null
 */
export function getNextRunAt(expression: string, from?: Date): Date | null {
  try {
    const job = new Cron(expression)
    const next = job.nextRun(from)
    return next
  } catch {
    return null
  }
}
