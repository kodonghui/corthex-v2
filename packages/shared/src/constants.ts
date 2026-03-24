// === 에러 코드 표준 ===
export const ERROR_CODES = {
  // 인증
  AUTH_001: '로그인 실패',
  AUTH_002: '토큰 만료',
  AUTH_003: '권한 없음',
  // 테넌트
  TENANT_001: '격리 위반 시도',
  TENANT_002: '다른 회사 데이터 접근 차단',
  // 에이전트
  AGENT_001: 'CLI 연결 끊김',
  AGENT_002: '에이전트 실행 실패',
  AGENT_003: '에이전트 메모리 로드 실패',
  // 작업 큐
  QUEUE_001: '야간 작업 실패',
  QUEUE_002: '재시도 한도 초과',
  // SNS
  SNS_001: 'SNS 콘텐츠를 찾을 수 없습니다',
  SNS_002: '초안/반려 상태에서만 수정할 수 있습니다',
  SNS_003: '승인 요청 상태에서만 승인/반려할 수 있습니다',
  SNS_004: '승인된 콘텐츠만 발행할 수 있습니다',
  // 대시보드
  DASH_001: '비용 데이터 조회 실패',
  // 텔레그램
  TELEGRAM_001: '텔레그램 설정을 찾을 수 없습니다',
  TELEGRAM_002: '봇 토큰이 유효하지 않습니다',
  // 메신저
  MSG_001: '채널을 찾을 수 없습니다',
  MSG_002: '채널 멤버가 아닙니다',
  // NEXUS
  NEXUS_001: '레이아웃을 찾을 수 없습니다',
  NEXUS_002: '조직도 데이터 조회 실패',
  // 자동매매
  TRADE_001: '자동매매 한도 초과',
  TRADE_002: '모의/실투자 모드 불일치',
  // 도구
  TOOL_001: 'API key 없음 또는 조회 실패',
  TOOL_002: '도구 실행 타임아웃',
  // Rate Limiting
  AUTH_004: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  RATE_001: 'API 요청 한도 초과',
} as const

export type ErrorCode = keyof typeof ERROR_CODES

// === Story 24.4: Personality Presets (AR30, FR-PERS6) ===
// Hardcoded Big Five OCEAN presets — values 0-100
import type { PersonalityPreset } from './types'

export const PERSONALITY_PRESETS: readonly PersonalityPreset[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    nameKo: '균형',
    description: 'Neutral and adaptable — equal weight across all traits',
    traits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
  },
  {
    id: 'creative',
    name: 'Creative',
    nameKo: '창의적',
    description: 'Open-minded, spontaneous, sociable — strong imagination and curiosity',
    traits: { openness: 80, conscientiousness: 30, extraversion: 70, agreeableness: 60, neuroticism: 40 },
  },
  {
    id: 'analytical',
    name: 'Analytical',
    nameKo: '분석적',
    description: 'Methodical, focused, reserved — precision and logical rigor',
    traits: { openness: 40, conscientiousness: 90, extraversion: 20, agreeableness: 40, neuroticism: 30 },
  },
] as const
