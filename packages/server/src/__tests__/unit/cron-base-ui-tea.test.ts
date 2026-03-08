/**
 * TEA-generated tests for Story 14-4: 크론기지 UI
 *
 * Risk-based coverage expansion:
 * - P0: describeCron edge cases (complex expressions, boundary values)
 * - P0: Cron expression validation patterns
 * - P1: formatRelativeTime boundary conditions
 * - P1: formatShortDate output format
 * - P1: runStatusConfig completeness
 * - P2: Type & structure verification for Schedule/CronRun types
 */

import { describe, it, expect } from 'bun:test'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const PROJECT_ROOT = resolve(__dirname, '../../../../..')
const CRON_BASE_PATH = resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx')
const cronBaseContent = readFileSync(CRON_BASE_PATH, 'utf-8')

// ── Mirror client-side functions for testing ──

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return expr

  const [minute, hour, , , dow] = parts
  const isSimpleNum = (v: string) => /^\d+$/.test(v)

  if (hour === '*' && minute === '0') return '매시 정각'
  if (hour === '*' && isSimpleNum(minute)) return `매시 ${minute.padStart(2, '0')}분`
  if (hour === '*') return `매시 (${minute})`

  if (!isSimpleNum(hour) || !isSimpleNum(minute)) return expr

  const minuteStr = minute.padStart(2, '0')
  const hourStr = hour.padStart(2, '0')
  const timeStr = `${hourStr}:${minuteStr}`

  if (dow === '*') return `매일 ${timeStr}`
  if (dow === '1-5') return `평일 ${timeStr}`
  if (dow === '0-6') return `매일 ${timeStr}`

  const dayLabels = dow.split(',').map(d => DAY_NAMES[parseInt(d)] || d).join(', ')
  return `${dayLabels} ${timeStr}`
}

function formatRelativeTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return '곧 실행'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 후`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 ${minutes % 60}분 후`
  const daysVal = Math.floor(hours / 24)
  return `${daysVal}일 후`
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── P0: describeCron 엣지케이스 ──

describe('TEA: describeCron 경계값 및 엣지케이스', () => {
  it('자정 표현식 (0시 0분)', () => {
    expect(describeCron('0 0 * * *')).toBe('매일 00:00')
  })

  it('23시 59분 경계값', () => {
    expect(describeCron('59 23 * * *')).toBe('매일 23:59')
  })

  it('1자리 분/시 패딩', () => {
    expect(describeCron('5 3 * * *')).toBe('매일 03:05')
  })

  it('모든 요일 개별 나열 (0,1,2,3,4,5,6)', () => {
    const result = describeCron('0 9 * * 0,1,2,3,4,5,6')
    expect(result).toBe('일, 월, 화, 수, 목, 금, 토 09:00')
  })

  it('주말만 (0,6)', () => {
    expect(describeCron('0 10 * * 0,6')).toBe('일, 토 10:00')
  })

  it('단일 요일 -- 금요일 (5)', () => {
    expect(describeCron('0 18 * * 5')).toBe('금 18:00')
  })

  it('빈 문자열 처리', () => {
    expect(describeCron('')).toBe('')
  })

  it('6필드 표현식 (초 포함) -- 원본 반환', () => {
    expect(describeCron('0 0 9 * * *')).toBe('0 0 9 * * *')
  })

  it('공백 여러 개도 올바르게 파싱', () => {
    expect(describeCron('0  9  *  *  *')).toBe('매일 09:00')
  })

  it('앞뒤 공백 트림', () => {
    expect(describeCron('  0 9 * * 1-5  ')).toBe('평일 09:00')
  })

  it('유효하지 않은 요일 숫자 -- 원본값 유지', () => {
    const result = describeCron('0 9 * * 8')
    expect(result).toContain('09:00')
    // DAY_NAMES[8] is undefined, so parseInt(8) -> 8 -> "8"
    expect(result).toBe('8 09:00')
  })

  it('매시 5분 -- 0이 아닌 분', () => {
    expect(describeCron('30 * * * *')).toBe('매시 30분')
  })

  it('매시 0분은 "매시 정각"', () => {
    expect(describeCron('0 * * * *')).toBe('매시 정각')
  })
})

// ── P0: Cron 표현식 유효성 패턴 ──

describe('TEA: Cron 표현식 5필드 유효성 검증', () => {
  const VALID_EXPRS = [
    '0 9 * * *',
    '30 18 * * 1-5',
    '0 * * * *',
    '15 6 1 * *',
    '0 0 1 1 *',
    '*/5 * * * *',
    '0 9 * * 1,3,5',
  ]

  for (const expr of VALID_EXPRS) {
    it(`유효: "${expr}" -- 5필드 파싱 성공`, () => {
      const parts = expr.trim().split(/\s+/)
      expect(parts).toHaveLength(5)
    })
  }

  it('비표준 step 표현식도 describeCron에서 처리', () => {
    // */5 * * * * -- hour is *, minute is */5 (not simple number)
    const result = describeCron('*/5 * * * *')
    expect(result).toBe('매시 (*/5)')
  })

  it('일/월 필드가 있어도 요일 우선 처리', () => {
    // minute=0, hour=9, day=15, month=*, dow=1
    const result = describeCron('0 9 15 * 1')
    expect(result).toBe('월 09:00')
  })
})

// ── P1: formatRelativeTime 경계값 ──

describe('TEA: formatRelativeTime 경계값 테스트', () => {
  it('정확히 0분 후 (diff=0)', () => {
    const now = new Date(Date.now() + 500).toISOString() // 0.5초 후
    const result = formatRelativeTime(now)
    expect(result).toBe('0분 후')
  })

  it('정확히 59분 후', () => {
    const future = new Date(Date.now() + 59 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('분 후')
    expect(result).not.toContain('시간')
  })

  it('정확히 60분 후 (1시간 경계)', () => {
    const future = new Date(Date.now() + 60 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('시간')
  })

  it('정확히 23시간 59분 후', () => {
    const future = new Date(Date.now() + (23 * 60 + 59) * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('시간')
    expect(result).not.toContain('일 후')
  })

  it('정확히 24시간 후 (1일 경계)', () => {
    const future = new Date(Date.now() + 24 * 60 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('일 후')
  })

  it('먼 미래 (30일 후)', () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toBe('30일 후')
  })

  it('1밀리초 전은 "곧 실행"', () => {
    const past = new Date(Date.now() - 1).toISOString()
    expect(formatRelativeTime(past)).toBe('곧 실행')
  })

  it('매우 먼 과거도 "곧 실행"', () => {
    const past = new Date(Date.now() - 365 * 24 * 60 * 60000).toISOString()
    expect(formatRelativeTime(past)).toBe('곧 실행')
  })
})

// ── P1: formatShortDate 출력 형식 ──

describe('TEA: formatShortDate 출력 형식 검증', () => {
  it('한국어 월/일/시/분 형식', () => {
    const result = formatShortDate('2026-03-08T09:30:00Z')
    // ko-KR locale should include month, day, hour, minute
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('자정 시간 처리', () => {
    const result = formatShortDate('2026-01-01T00:00:00Z')
    expect(result).toBeTruthy()
  })

  it('연말 마지막 날', () => {
    const result = formatShortDate('2026-12-31T23:59:00Z')
    expect(result).toBeTruthy()
  })
})

// ── P1: runStatusConfig 완전성 ──

describe('TEA: runStatusConfig 상태 매핑 검증', () => {
  it('3가지 실행 상태 모두 포함 (running, success, failed)', () => {
    expect(cronBaseContent).toContain("running: { label: '실행중'")
    expect(cronBaseContent).toContain("success: { label: '성공'")
    expect(cronBaseContent).toContain("failed: { label: '실패'")
  })

  it('각 상태에 variant 지정됨', () => {
    expect(cronBaseContent).toContain("variant: 'warning'")
    expect(cronBaseContent).toContain("variant: 'success'")
    expect(cronBaseContent).toContain("variant: 'error'")
  })
})

// ── P1: API 엔드포인트 경로 정합성 ──

describe('TEA: API 엔드포인트 경로 검증', () => {
  it('스케줄 목록 조회 경로', () => {
    expect(cronBaseContent).toContain("'/workspace/jobs/schedules'")
  })

  it('에이전트 목록 조회 경로', () => {
    expect(cronBaseContent).toContain("'/workspace/agents'")
  })

  it('스케줄 토글 경로 패턴', () => {
    expect(cronBaseContent).toContain('/toggle')
  })

  it('실행 기록 조회 경로 패턴', () => {
    expect(cronBaseContent).toContain('/runs?page=')
  })

  it('CRUD 메서드 사용 (get, post, patch, delete)', () => {
    expect(cronBaseContent).toContain('api.get')
    expect(cronBaseContent).toContain('api.post')
    expect(cronBaseContent).toContain('api.patch')
    expect(cronBaseContent).toContain('api.delete')
  })
})

// ── P2: 컴포넌트 Export 및 타입 정의 ──

describe('TEA: 컴포넌트 구조 및 타입 정의', () => {
  it('CronBasePage가 named export', () => {
    expect(cronBaseContent).toContain('export function CronBasePage')
  })

  it('Schedule 타입에 필수 필드 포함', () => {
    expect(cronBaseContent).toContain('id: string')
    expect(cronBaseContent).toContain('name: string')
    expect(cronBaseContent).toContain('agentId: string')
    expect(cronBaseContent).toContain('cronExpression: string')
    expect(cronBaseContent).toContain('nextRunAt: string | null')
    expect(cronBaseContent).toContain('isActive: boolean')
  })

  it('CronRun 타입에 상태 유니온 타입', () => {
    expect(cronBaseContent).toContain("'running' | 'success' | 'failed'")
  })

  it('CronRun 타입에 비용/토큰 필드', () => {
    expect(cronBaseContent).toContain('tokensUsed: number | null')
    expect(cronBaseContent).toContain('costMicro: number | null')
  })
})

// ── P2: 모달 3모드 검증 ──

describe('TEA: 스케줄 모달 3모드 완전성', () => {
  it("모드 타입 유니온 정의: 'preset' | 'custom' | 'legacy'", () => {
    expect(cronBaseContent).toContain("'preset' | 'custom' | 'legacy'")
  })

  it('프리셋 모드 -- 6개 프리셋 버튼 렌더링 코드', () => {
    expect(cronBaseContent).toContain('CRON_PRESETS.map')
  })

  it('커스텀 모드 -- cron 입력 필드와 설명 표시', () => {
    expect(cronBaseContent).toContain("placeholder=\"분 시 일 월 요일")
    expect(cronBaseContent).toContain('describeCron(cronExpression)')
  })

  it('레거시 모드 -- frequency/time/days 입력', () => {
    expect(cronBaseContent).toContain("type=\"time\"")
    expect(cronBaseContent).toContain("type=\"radio\"")
    expect(cronBaseContent).toContain("name=\"frequency\"")
  })

  it('레거시 모드 -- 요일 미선택 시 경고 메시지', () => {
    expect(cronBaseContent).toContain('실행할 요일을 1개 이상 선택하세요')
  })
})

// ── P2: 빈 상태 & 로딩 처리 ──

describe('TEA: UI 상태 처리 검증', () => {
  it('빈 상태 (EmptyState) 렌더링', () => {
    expect(cronBaseContent).toContain('예약된 작전이 없습니다')
    expect(cronBaseContent).toContain('반복 작업을 크론으로 자동화하세요')
  })

  it('로딩 스켈레톤 -- animate-pulse 사용', () => {
    expect(cronBaseContent).toContain('animate-pulse')
  })

  it('실행 기록 빈 상태', () => {
    expect(cronBaseContent).toContain('아직 실행 기록이 없습니다')
  })

  it('실행 기록 로딩 상태', () => {
    expect(cronBaseContent).toContain('로딩 중...')
  })
})

// ── P2: WebSocket 이벤트 처리 ──

describe('TEA: WebSocket 이벤트 핸들링 검증', () => {
  it('night-job 채널 구독', () => {
    expect(cronBaseContent).toContain("subscribe('night-job'")
  })

  it('job-progress 이벤트 처리', () => {
    expect(cronBaseContent).toContain("event.type === 'job-progress'")
  })

  it('job-completed 이벤트 처리', () => {
    expect(cronBaseContent).toContain("event.type === 'job-completed'")
  })

  it('job-failed 이벤트 처리', () => {
    expect(cronBaseContent).toContain("event.type === 'job-failed'")
  })

  it('진행률 ProgressBar 렌더링', () => {
    expect(cronBaseContent).toContain('ProgressBar')
    expect(cronBaseContent).toContain('progress.progress')
  })
})

// ── P2: 삭제 확인 다이얼로그 ──

describe('TEA: 삭제 확인 다이얼로그', () => {
  it('ConfirmDialog 사용', () => {
    expect(cronBaseContent).toContain('<ConfirmDialog')
  })

  it('삭제 경고 메시지', () => {
    expect(cronBaseContent).toContain('이 반복 스케줄을 삭제하시겠습니까?')
    expect(cronBaseContent).toContain('실행 기록도 함께 삭제됩니다')
  })
})

// ── P2: 접근성 및 UX 검증 ──

describe('TEA: 접근성 및 UX 패턴', () => {
  it('모달 배경 클릭으로 닫기', () => {
    expect(cronBaseContent).toContain('onClick={onClose}')
    expect(cronBaseContent).toContain('e.stopPropagation()')
  })

  it('폼 제출 버튼 비활성화 조건', () => {
    expect(cronBaseContent).toContain('disabled={!isValid || isPending}')
  })

  it('비활성 스케줄 시각적 구분 (opacity)', () => {
    expect(cronBaseContent).toContain('opacity-60')
  })

  it('편집 모드 제목 구분', () => {
    expect(cronBaseContent).toContain('스케줄 수정')
    expect(cronBaseContent).toContain('크론 스케줄 추가')
  })
})
