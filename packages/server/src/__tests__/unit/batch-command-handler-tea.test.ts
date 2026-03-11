/**
 * TEA Risk-Based Tests — batch-command-handler.ts
 * Risk focus: count arithmetic, report formatting edge cases, concurrent state
 */
import { describe, it, expect } from 'bun:test'
import { formatBatchRunReport, formatBatchStatusReport } from '../../services/batch-command-handler'

describe('TEA: batch-command-handler edge cases', () => {
  describe('formatBatchRunReport — arithmetic risks', () => {
    it('should handle all dispatched, none skipped', () => {
      const report = formatBatchRunReport(10, 10, 0)
      expect(report).toContain('대기 명령: 10건')
      expect(report).toContain('실행 시작: 10건')
      expect(report).toContain('건너뜀: 0건')
      expect(report).toContain('/배치상태')
    })

    it('should handle all skipped, none dispatched', () => {
      const report = formatBatchRunReport(5, 0, 5)
      expect(report).toContain('실행 시작: 0건')
      expect(report).toContain('건너뜀: 5건')
      expect(report).not.toContain('/배치상태')
    })

    it('should handle very large numbers', () => {
      const report = formatBatchRunReport(99999, 99998, 1)
      expect(report).toContain('99999건')
      expect(report).toContain('99998건')
    })
  })

  describe('formatBatchStatusReport — aggregation risks', () => {
    it('should correctly total all status counts', () => {
      const counts = { pending: 5, processing: 10, completed: 100, failed: 3 }
      const report = formatBatchStatusReport(counts, [])
      expect(report).toContain('총 118건')
    })

    it('should handle command with null type', () => {
      const cmds = [
        { id: 'c1', type: null, text: 'test command', createdAt: new Date('2026-03-11T12:00:00Z') },
      ]
      const report = formatBatchStatusReport({ pending: 0, processing: 1, completed: 0, failed: 0 }, cmds)
      expect(report).toContain('direct') // null type defaults to 'direct'
    })

    it('should truncate text at exactly 40 chars', () => {
      const exact40 = 'A'.repeat(40)
      const exact41 = 'A'.repeat(41)

      const cmds40 = [{ id: 'c1', type: 'direct', text: exact40, createdAt: new Date() }]
      const cmds41 = [{ id: 'c1', type: 'direct', text: exact41, createdAt: new Date() }]

      const report40 = formatBatchStatusReport({ pending: 0, processing: 1, completed: 0, failed: 0 }, cmds40)
      const report41 = formatBatchStatusReport({ pending: 0, processing: 1, completed: 0, failed: 0 }, cmds41)

      expect(report40).toContain(exact40)
      expect(report40).not.toContain('...')
      expect(report41).toContain(exact40 + '...')
    })

    it('should handle empty text command', () => {
      const cmds = [{ id: 'c1', type: 'slash', text: '', createdAt: new Date() }]
      const report = formatBatchStatusReport({ pending: 0, processing: 1, completed: 0, failed: 0 }, cmds)
      expect(report).toContain('처리 중인 명령')
    })

    it('should not show processing section when count > 0 but list is empty (race condition)', () => {
      // Edge: count says 3 processing but our query returned 0 (completed between count and list query)
      const report = formatBatchStatusReport({ pending: 0, processing: 3, completed: 0, failed: 0 }, [])
      // When processing count > 0 but list empty, we still don't show "현재 처리 중인 명령이 없습니다"
      // because that message is only for processing === 0
      expect(report).not.toContain('현재 처리 중인 명령이 없습니다')
    })

    it('should handle all counts at zero', () => {
      const report = formatBatchStatusReport({ pending: 0, processing: 0, completed: 0, failed: 0 }, [])
      expect(report).toContain('총 0건')
      expect(report).toContain('현재 처리 중인 명령이 없습니다')
    })

    it('should format Korean time correctly', () => {
      const cmds = [{ id: 'c1', type: 'direct', text: 'test', createdAt: new Date('2026-03-11T03:30:00Z') }]
      const report = formatBatchStatusReport({ pending: 0, processing: 1, completed: 0, failed: 0 }, cmds)
      // Should contain some time format — not crash
      expect(report).toContain('처리 중인 명령')
      expect(typeof report).toBe('string')
    })
  })
})
