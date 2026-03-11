/**
 * Batch Command Handler — /배치실행 + /배치상태 슬래시 명령 처리
 * pending 명령 일괄 실행 + 진행 상태 조회
 */
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db'
import { commands } from '../db/schema'
import { delegationTracker } from './delegation-tracker'

// === Types ===

export type BatchRunOptions = {
  commandId: string
  companyId: string
  userId: string
}

export type BatchStatusOptions = {
  commandId: string
  companyId: string
  userId: string
}

type StatusCounts = {
  pending: number
  processing: number
  completed: number
  failed: number
}

// === /배치실행 — Dispatch pending commands ===

export async function processBatchRun(options: BatchRunOptions): Promise<void> {
  const { commandId, companyId } = options

  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  delegationTracker.startCommand(companyId, commandId)

  try {
    // Find all pending commands (exclude this batch command itself)
    const pendingCommands = await db
      .select({
        id: commands.id,
        type: commands.type,
        text: commands.text,
        targetAgentId: commands.targetAgentId,
        metadata: commands.metadata,
      })
      .from(commands)
      .where(and(
        eq(commands.companyId, companyId),
        eq(commands.status, 'pending'),
        sql`${commands.id} != ${commandId}`,
      ))

    if (pendingCommands.length === 0) {
      delegationTracker.completed(companyId, commandId)
      await db.update(commands)
        .set({
          status: 'completed',
          result: '## 📦 배치 실행 결과\n\n대기 중인 명령이 없습니다.',
          completedAt: new Date(),
        })
        .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
      return
    }

    // Mark each pending command as processing (they will be picked up by their respective handlers)
    let dispatchedCount = 0
    let skippedCount = 0

    for (const cmd of pendingCommands) {
      try {
        await db.update(commands)
          .set({ status: 'processing' })
          .where(and(eq(commands.id, cmd.id), eq(commands.companyId, companyId), eq(commands.status, 'pending')))
        dispatchedCount++
      } catch {
        skippedCount++
      }
    }

    // Build result report
    const report = formatBatchRunReport(pendingCommands.length, dispatchedCount, skippedCount)

    delegationTracker.completed(companyId, commandId)
    await db.update(commands)
      .set({
        status: 'completed',
        result: report,
        metadata: { type: 'batch_run', dispatched: dispatchedCount, skipped: skippedCount },
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    delegationTracker.failed(companyId, commandId, errorMsg)
    await db.update(commands)
      .set({
        status: 'failed',
        result: `배치 실행 실패: ${errorMsg}`,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}

// === /배치상태 — Check batch status ===

export async function processBatchStatus(options: BatchStatusOptions): Promise<void> {
  const { commandId, companyId } = options

  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  delegationTracker.startCommand(companyId, commandId)

  try {
    // Get status counts (exclude this status check command itself)
    const statusRows = await db
      .select({
        status: commands.status,
        count: sql<number>`count(*)::int`,
      })
      .from(commands)
      .where(and(
        eq(commands.companyId, companyId),
        sql`${commands.id} != ${commandId}`,
      ))
      .groupBy(commands.status)

    const counts: StatusCounts = { pending: 0, processing: 0, completed: 0, failed: 0 }
    for (const row of statusRows) {
      if (row.status in counts) {
        counts[row.status as keyof StatusCounts] = row.count
      }
    }

    // Get recent processing commands (top 10)
    const processingCommands = await db
      .select({
        id: commands.id,
        type: commands.type,
        text: commands.text,
        createdAt: commands.createdAt,
      })
      .from(commands)
      .where(and(
        eq(commands.companyId, companyId),
        eq(commands.status, 'processing'),
        sql`${commands.id} != ${commandId}`,
      ))
      .limit(10)

    const report = formatBatchStatusReport(counts, processingCommands)

    delegationTracker.completed(companyId, commandId)
    await db.update(commands)
      .set({
        status: 'completed',
        result: report,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    delegationTracker.failed(companyId, commandId, errorMsg)
    await db.update(commands)
      .set({
        status: 'failed',
        result: `배치 상태 조회 실패: ${errorMsg}`,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}

// === Report Formatting ===

export function formatBatchRunReport(
  totalPending: number,
  dispatched: number,
  skipped: number,
): string {
  const lines: string[] = []

  lines.push('## 📦 배치 실행 결과')
  lines.push('')
  lines.push(`- 대기 명령: ${totalPending}건`)
  lines.push(`- 실행 시작: ${dispatched}건`)
  lines.push(`- 건너뜀: ${skipped}건`)
  lines.push('')

  if (dispatched > 0) {
    lines.push('각 명령의 진행 상황은 `/배치상태`로 확인하세요.')
  }

  return lines.join('\n')
}

export function formatBatchStatusReport(
  counts: StatusCounts,
  processingCommands: { id: string; type: string | null; text: string; createdAt: Date }[],
): string {
  const lines: string[] = []
  const total = counts.pending + counts.processing + counts.completed + counts.failed

  lines.push('## 📊 배치 상태 현황')
  lines.push('')
  lines.push(`### 전체 현황 (총 ${total}건)`)
  lines.push('')
  lines.push('| 상태 | 건수 |')
  lines.push('|------|------|')
  lines.push(`| ⏳ 대기 | ${counts.pending} |`)
  lines.push(`| 🔄 처리 중 | ${counts.processing} |`)
  lines.push(`| ✅ 완료 | ${counts.completed} |`)
  lines.push(`| ❌ 실패 | ${counts.failed} |`)
  lines.push('')

  if (processingCommands.length > 0) {
    lines.push('### 처리 중인 명령')
    lines.push('')
    lines.push('| 유형 | 명령 내용 | 시작 시각 |')
    lines.push('|------|---------|----------|')
    for (const cmd of processingCommands) {
      const truncatedText = cmd.text.length > 40 ? cmd.text.slice(0, 40) + '...' : cmd.text
      const timeStr = cmd.createdAt.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
      lines.push(`| ${cmd.type || 'direct'} | ${truncatedText} | ${timeStr} |`)
    }
  } else if (counts.processing === 0) {
    lines.push('현재 처리 중인 명령이 없습니다.')
  }

  return lines.join('\n')
}
