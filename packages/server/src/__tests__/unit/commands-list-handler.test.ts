import { describe, it, expect } from 'bun:test'
import { formatCommandsListReport } from '../../services/commands-list-handler'

const BUILTIN_COMMANDS = [
  { command: '/전체', description: '모든 부서에 동시 지시', usage: '/전체 [명령]', category: '지시' },
  { command: '/순차', description: '부서 순차 협업', usage: '/순차 [명령]', category: '지시' },
  { command: '/토론', description: 'AGORA 토론', usage: '/토론 [주제]', category: '토론' },
  { command: '/심층토론', description: 'AGORA 심층 토론', usage: '/심층토론 [주제]', category: '토론' },
  { command: '/도구점검', description: '도구 상태 확인', usage: '/도구점검', category: '관리' },
  { command: '/배치실행', description: '대기 명령 일괄 실행', usage: '/배치실행', category: '관리' },
  { command: '/배치상태', description: '배치 상태 조회', usage: '/배치상태', category: '관리' },
  { command: '/스케치', description: 'AI 다이어그램', usage: '/스케치 [설명]', category: '도구' },
  { command: '/명령어', description: '명령어 목록', usage: '/명령어', category: '도움' },
]

describe('commands-list-handler', () => {
  describe('formatCommandsListReport', () => {
    it('should include all builtin commands', () => {
      const report = formatCommandsListReport(BUILTIN_COMMANDS, [])

      expect(report).toContain('사용 가능한 명령어')
      expect(report).toContain('/전체')
      expect(report).toContain('/순차')
      expect(report).toContain('/토론')
      expect(report).toContain('/심층토론')
      expect(report).toContain('/도구점검')
      expect(report).toContain('/배치실행')
      expect(report).toContain('/배치상태')
      expect(report).toContain('/스케치')
      expect(report).toContain('/명령어')
    })

    it('should include @mention section', () => {
      const report = formatCommandsListReport(BUILTIN_COMMANDS, [])

      expect(report).toContain('@멘션')
      expect(report).toContain('@에이전트이름')
    })

    it('should show empty presets message when no presets', () => {
      const report = formatCommandsListReport(BUILTIN_COMMANDS, [])

      expect(report).toContain('등록된 프리셋이 없습니다')
    })

    it('should list user presets', () => {
      const presets = [
        { name: '일일보고', command: '/전체 오늘의 핵심 업무 보고', description: null, category: '보고' },
        { name: '투자분석', command: '@투자분석팀장 시장 동향 분석해줘', description: null, category: '분석' },
      ]
      const report = formatCommandsListReport(BUILTIN_COMMANDS, presets)

      expect(report).toContain('내 프리셋 (2개)')
      expect(report).toContain('일일보고')
      expect(report).toContain('보고')
      expect(report).toContain('투자분석')
      expect(report).toContain('분석')
    })

    it('should default category to 일반 for presets without category', () => {
      const presets = [
        { name: '테스트', command: '테스트 명령', description: null, category: null },
      ]
      const report = formatCommandsListReport(BUILTIN_COMMANDS, presets)

      expect(report).toContain('일반')
    })

    it('should truncate long preset commands', () => {
      const presets = [
        { name: '긴명령', command: 'A'.repeat(100), description: null, category: null },
      ]
      const report = formatCommandsListReport(BUILTIN_COMMANDS, presets)

      expect(report).toContain('A'.repeat(50) + '...')
    })

    it('should include footer about natural language routing', () => {
      const report = formatCommandsListReport(BUILTIN_COMMANDS, [])

      expect(report).toContain('비서실장이 자동으로 적합한 부서에 라우팅')
    })

    it('should include usage format for builtin commands', () => {
      const report = formatCommandsListReport(BUILTIN_COMMANDS, [])

      expect(report).toContain('`/전체 [명령]`')
      expect(report).toContain('`/토론 [주제]`')
      expect(report).toContain('`/명령어`')
    })
  })
})
