import { describe, it, expect } from 'bun:test'
import { formatBatchRunReport, formatBatchStatusReport } from '../../services/batch-command-handler'

describe('batch-command-handler', () => {
  describe('formatBatchRunReport', () => {
    it('should format zero pending commands', () => {
      const report = formatBatchRunReport(0, 0, 0)

      expect(report).toContain('배치 실행 결과')
      expect(report).toContain('대기 명령: 0건')
      expect(report).toContain('실행 시작: 0건')
    })

    it('should format dispatched commands', () => {
      const report = formatBatchRunReport(5, 4, 1)

      expect(report).toContain('대기 명령: 5건')
      expect(report).toContain('실행 시작: 4건')
      expect(report).toContain('건너뜀: 1건')
      expect(report).toContain('/배치상태')
    })

    it('should not show status check hint when nothing dispatched', () => {
      const report = formatBatchRunReport(0, 0, 0)

      expect(report).not.toContain('/배치상태')
    })
  })

  describe('formatBatchStatusReport', () => {
    it('should format status counts', () => {
      const counts = { pending: 2, processing: 3, completed: 10, failed: 1 }
      const report = formatBatchStatusReport(counts, [])

      expect(report).toContain('배치 상태 현황')
      expect(report).toContain('총 16건')
      expect(report).toContain('⏳ 대기 | 2')
      expect(report).toContain('🔄 처리 중 | 3')
      expect(report).toContain('✅ 완료 | 10')
      expect(report).toContain('❌ 실패 | 1')
    })

    it('should format processing commands list', () => {
      const processingCmds = [
        { id: 'cmd1', type: 'direct', text: '투자 분석 보고서를 작성해줘', createdAt: new Date('2026-03-11T10:00:00Z') },
        { id: 'cmd2', type: 'all', text: '/전체 오늘의 업무 보고', createdAt: new Date('2026-03-11T10:05:00Z') },
      ]
      const counts = { pending: 0, processing: 2, completed: 0, failed: 0 }
      const report = formatBatchStatusReport(counts, processingCmds)

      expect(report).toContain('처리 중인 명령')
      expect(report).toContain('투자 분석 보고서를 작성해줘')
      expect(report).toContain('direct')
      expect(report).toContain('all')
    })

    it('should truncate long command text', () => {
      const longText = 'A'.repeat(100)
      const processingCmds = [
        { id: 'cmd1', type: 'direct', text: longText, createdAt: new Date() },
      ]
      const counts = { pending: 0, processing: 1, completed: 0, failed: 0 }
      const report = formatBatchStatusReport(counts, processingCmds)

      expect(report).toContain('A'.repeat(40) + '...')
    })

    it('should show no-processing message when empty', () => {
      const counts = { pending: 0, processing: 0, completed: 5, failed: 0 }
      const report = formatBatchStatusReport(counts, [])

      expect(report).toContain('현재 처리 중인 명령이 없습니다')
    })

    it('should handle all zeros', () => {
      const counts = { pending: 0, processing: 0, completed: 0, failed: 0 }
      const report = formatBatchStatusReport(counts, [])

      expect(report).toContain('총 0건')
    })
  })
})
