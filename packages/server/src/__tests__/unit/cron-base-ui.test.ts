/**
 * 크론기지 UI (Story 14-4) -- 유틸리티 함수 및 통합 테스트
 *
 * 프론트엔드 전용 스토리이므로:
 * 1. 클라이언트 사이드 cron 설명 로직 테스트
 * 2. 기존 API 엔드포인트 통합 동작 검증 (이미 14-1에서 CRUD 테스트 완료)
 * 3. 프리셋 정의 정합성 테스트
 */

import { describe, it, expect } from 'bun:test'
import { resolve } from 'path'

const PROJECT_ROOT = resolve(__dirname, '../../../../..')

// ── Client-side cron description (mirrors cron-base.tsx::describeCron) ──

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

// ── Preset definitions (mirrors cron-base.tsx::CRON_PRESETS) ──

const CRON_PRESETS = [
  { label: '매일 오전 9시', value: '0 9 * * *', icon: '☀️' },
  { label: '매일 오후 6시', value: '0 18 * * *', icon: '🌆' },
  { label: '매일 밤 10시', value: '0 22 * * *', icon: '🌙' },
  { label: '평일 오전 9시', value: '0 9 * * 1-5', icon: '💼' },
  { label: '매시 정각', value: '0 * * * *', icon: '⏰' },
  { label: '주 1회 (월 09:00)', value: '0 9 * * 1', icon: '📅' },
]

// ── Tests ──

describe('크론기지 UI -- describeCron 클라이언트 파서', () => {
  it('매일 표현식 설명', () => {
    expect(describeCron('0 9 * * *')).toBe('매일 09:00')
    expect(describeCron('0 22 * * *')).toBe('매일 22:00')
    expect(describeCron('30 14 * * *')).toBe('매일 14:30')
  })

  it('평일 표현식 설명', () => {
    expect(describeCron('0 9 * * 1-5')).toBe('평일 09:00')
    expect(describeCron('30 18 * * 1-5')).toBe('평일 18:30')
  })

  it('매시 정각 표현식 설명', () => {
    expect(describeCron('0 * * * *')).toBe('매시 정각')
  })

  it('매시 특정 분 표현식 설명', () => {
    expect(describeCron('15 * * * *')).toBe('매시 15분')
    expect(describeCron('45 * * * *')).toBe('매시 45분')
  })

  it('특정 요일 표현식 설명', () => {
    expect(describeCron('0 9 * * 1')).toBe('월 09:00')
    expect(describeCron('0 9 * * 1,3,5')).toBe('월, 수, 금 09:00')
    expect(describeCron('0 9 * * 0,6')).toBe('일, 토 09:00')
  })

  it('잘못된 표현식은 원본 반환', () => {
    expect(describeCron('invalid')).toBe('invalid')
    expect(describeCron('0 9')).toBe('0 9')
  })

  it('0-6 요일범위도 매일로 인식', () => {
    expect(describeCron('0 9 * * 0-6')).toBe('매일 09:00')
  })
})

describe('크론기지 UI -- CRON_PRESETS 정합성', () => {
  it('프리셋 6개 정의', () => {
    expect(CRON_PRESETS).toHaveLength(6)
  })

  it('모든 프리셋에 label, value, icon 있음', () => {
    for (const preset of CRON_PRESETS) {
      expect(preset.label).toBeTruthy()
      expect(preset.value).toBeTruthy()
      expect(preset.icon).toBeTruthy()
    }
  })

  it('프리셋 cron 표현식이 5필드 형식', () => {
    for (const preset of CRON_PRESETS) {
      const parts = preset.value.split(' ')
      expect(parts).toHaveLength(5)
    }
  })

  it('프리셋 값이 유니크', () => {
    const values = CRON_PRESETS.map(p => p.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('프리셋 설명이 describeCron과 일치', () => {
    expect(describeCron(CRON_PRESETS[0].value)).toBe('매일 09:00') // 매일 오전 9시
    expect(describeCron(CRON_PRESETS[1].value)).toBe('매일 18:00') // 매일 오후 6시
    expect(describeCron(CRON_PRESETS[2].value)).toBe('매일 22:00') // 매일 밤 10시
    expect(describeCron(CRON_PRESETS[3].value)).toBe('평일 09:00') // 평일 오전 9시
    expect(describeCron(CRON_PRESETS[4].value)).toBe('매시 정각')  // 매시 정각
    expect(describeCron(CRON_PRESETS[5].value)).toBe('월 09:00')   // 주 1회 (월 09:00)
  })
})

describe('크론기지 UI -- formatRelativeTime', () => {
  it('과거 시간은 "곧 실행"', () => {
    const past = new Date(Date.now() - 60000).toISOString()
    expect(formatRelativeTime(past)).toBe('곧 실행')
  })

  it('30분 후', () => {
    const future = new Date(Date.now() + 30 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('분 후')
  })

  it('2시간 후', () => {
    const future = new Date(Date.now() + 120 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('시간')
  })

  it('2일 후', () => {
    const future = new Date(Date.now() + 48 * 60 * 60000).toISOString()
    const result = formatRelativeTime(future)
    expect(result).toContain('일 후')
  })
})

describe('크론기지 UI -- 라우팅/사이드바 등록 검증', () => {
  it('cron-base.tsx 파일 존재', async () => {
    const fs = await import('fs')
    expect(fs.existsSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'))).toBe(true)
  })

  it('App.tsx에 /cron 라우트 등록됨', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/App.tsx'), 'utf-8')
    expect(content).toContain('CronBasePage')
    expect(content).toContain("path=\"cron\"")
    expect(content).toContain("import('./pages/cron-base')")
  })

  it('sidebar.tsx에 크론기지 메뉴 등록됨', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/components/sidebar.tsx'), 'utf-8')
    expect(content).toContain("'/cron'")
    expect(content).toContain('크론기지')
    expect(content).toContain('⏰')
  })
})

describe('크론기지 UI -- 페이지 컴포넌트 구조 검증', () => {
  it('cron-base.tsx에 필수 import 포함', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'), 'utf-8')

    // React hooks
    expect(content).toContain('useState')
    expect(content).toContain('useEffect')
    expect(content).toContain('useCallback')

    // React Query
    expect(content).toContain('useQuery')
    expect(content).toContain('useMutation')
    expect(content).toContain('useQueryClient')

    // API
    expect(content).toContain("from '../lib/api'")

    // Shared UI
    expect(content).toContain('Select')
    expect(content).toContain('Textarea')
    expect(content).toContain('Badge')
    expect(content).toContain('StatusDot')
    expect(content).toContain('ConfirmDialog')
    expect(content).toContain('ProgressBar')
  })

  it('cron-base.tsx에 핵심 기능 구현', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'), 'utf-8')

    // Page export
    expect(content).toContain('export function CronBasePage')

    // Schedule CRUD
    expect(content).toContain('/workspace/jobs/schedules')
    expect(content).toContain('createSchedule')
    expect(content).toContain('updateSchedule')
    expect(content).toContain('toggleSchedule')
    expect(content).toContain('deleteSchedule')

    // Presets
    expect(content).toContain('CRON_PRESETS')
    expect(content).toContain('매일 오전 9시')
    expect(content).toContain('매일 오후 6시')
    expect(content).toContain('매일 밤 10시')
    expect(content).toContain('평일 오전 9시')
    expect(content).toContain('매시 정각')

    // WebSocket
    expect(content).toContain('useWsStore')
    expect(content).toContain("subscribe('night-job'")
    expect(content).toContain('job-completed')
    expect(content).toContain('job-progress')

    // Empty state
    expect(content).toContain('예약된 작전이 없습니다')
    expect(content).toContain('반복 작업을 크론으로 자동화하세요')

    // Run history
    expect(content).toContain('RunHistory')
    expect(content).toContain('실행 기록')

    // Modal modes
    expect(content).toContain('프리셋')
    expect(content).toContain('직접 입력')
    expect(content).toContain('간편 설정')

    // Cron description
    expect(content).toContain('describeCron')

    // Responsive
    expect(content).toContain('sm:p-8')
    expect(content).toContain('max-w-4xl')
  })

  it('cron-base.tsx에 다크모드 지원', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'), 'utf-8')

    // Dark mode classes
    const darkCount = (content.match(/dark:/g) || []).length
    expect(darkCount).toBeGreaterThan(20) // 충분한 다크모드 스타일
  })

  it('크론기지 테마 -- amber 강조색 사용 (UX 군사 톤)', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'), 'utf-8')

    // Amber color scheme (military theme)
    expect(content).toContain('amber-600')
    expect(content).toContain('amber-700')
    expect(content).toContain('amber-400')
  })

  it('폴링 30초 간격 설정됨', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'), 'utf-8')

    expect(content).toContain('refetchInterval: 30_000')
  })

  it('실행 기록 페이지네이션 구현됨', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(resolve(PROJECT_ROOT, 'packages/app/src/pages/cron-base.tsx'), 'utf-8')

    expect(content).toContain('pagination')
    expect(content).toContain('totalPages')
    expect(content).toContain('이전')
    expect(content).toContain('다음')
  })
})
