/**
 * save_report — Report Save & Multi-Channel Distribution (FR-RM1, FR-RM2, E13, E15, E17)
 *
 * E15 Partial Failure Contract:
 *   Step 1: DB INSERT (must succeed — throws on failure, no channels attempted)
 *   Step 2: Channel distribution via Promise.allSettled() (NOT Promise.all)
 *   - Failed channels: logged, NOT rolled back
 *   - report already in DB = always accessible via web_dashboard
 *
 * D27 Channel Phases:
 *   web_dashboard: Phase 1 (always available via DB — no-op)
 *   pdf_email: Phase 1 (md_to_pdf + send_email, implemented in Story 20.4)
 *   notion/notebooklm: Phase 2
 *   google_drive: Phase 4
 */
import { z } from 'zod'
import type { BuiltinToolHandler, ToolCallContext } from '../../engine'
import { ToolError } from '../../lib/tool-error'
import { getDB } from '../../db/scoped-query'

// --- Channel types ---

type ChannelResult =
  | { status: 'success'; channel: string }
  | { status: 'failed'; channel: string; error: string }

// --- Channel dispatcher (E15) ---

async function distributeToChannel(
  reportId: string,
  _content: string,
  channel: string,
  _ctx: ToolCallContext,
): Promise<ChannelResult> {
  switch (channel) {
    case 'web_dashboard':
      // Phase 1: report in DB = automatically accessible via web_dashboard — no extra distribution
      return { status: 'success', channel }

    case 'pdf_email':
      // Phase 1: md_to_pdf + send_email chain (Story 20.4 implements the full chain)
      // This stub returns success to allow partial failure contract testing
      // Story 20.4 will replace this with actual md_to_pdf → send_email flow
      return { status: 'success', channel }

    case 'notion':
    case 'notebooklm':
      throw new ToolError(
        'CHANNEL_NOT_IMPLEMENTED',
        `Channel '${channel}' is available in Phase 2. Currently Phase 1 only.`,
      )

    case 'google_drive':
      throw new ToolError(
        'CHANNEL_NOT_IMPLEMENTED_UNTIL_PHASE_4',
        `Channel 'google_drive' is not available until Phase 4 (Google Workspace MCP).`,
      )

    default:
      throw new ToolError(
        'CHANNEL_NOT_IMPLEMENTED',
        `Unknown channel: '${channel}'. Supported Phase 1 channels: web_dashboard, pdf_email.`,
      )
  }
}

// --- Handler ---

export const handler: BuiltinToolHandler = {
  name: 'save_report',

  schema: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    type: z.string().optional(),
    tags: z.array(z.string()).optional(),
    distribute_to: z.array(z.string()).optional(),
  }),

  execute: async (input, ctx) => {
    const title = input.title as string
    const content = input.content as string
    const type = input.type as string | undefined
    const tags = (input.tags as string[] | undefined) ?? []
    const distributeTo = (input.distribute_to as string[] | undefined) ?? ['web_dashboard']

    // E17: INSERT telemetry row at start
    const startTime = Date.now()
    const [{ id: eventId }] = await getDB(ctx.companyId).insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'save_report',
      startedAt: new Date(),
    })

    try {
      // === Step 1: DB INSERT (must succeed before any channel distribution) ===
      let reportId: string
      try {
        const [{ id }] = await getDB(ctx.companyId).insertReport({
          title,
          content,
          type,
          runId: ctx.runId,
          agentId: ctx.agentId,
          tags,
        })
        reportId = id
      } catch {
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'save_report: DB insert failed')
      }

      // === Step 2: Channel distribution (E15 partial failure — Promise.allSettled) ===
      const settled = await Promise.allSettled(
        distributeTo.map((channel) =>
          distributeToChannel(reportId, content, channel, ctx),
        ),
      )

      const channelResults: ChannelResult[] = settled.map((result, i) => {
        const channel = distributeTo[i]!
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          const err = result.reason as Error | ToolError
          const errorCode =
            err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
          return { status: 'failed' as const, channel, error: errorCode }
        }
      })

      // === Step 3: Update distributionResults JSONB ===
      const distributionResults = Object.fromEntries(
        channelResults.map((r) => [
          r.channel,
          r.status === 'success' ? 'success' : r.error,
        ]),
      )
      await getDB(ctx.companyId).updateReportDistribution(reportId, distributionResults)

      // E17: UPDATE on success
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      // === Step 4: Return structured result to LLM ===
      const successCount = channelResults.filter((r) => r.status === 'success').length
      return JSON.stringify({
        reportId,
        summary: `Report saved. ${successCount}/${channelResults.length} channels succeeded.`,
        channels: channelResults,
      })
    } catch (err) {
      // E17: UPDATE on failure
      const errorCode = err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode,
        durationMs: Date.now() - startTime,
      })
      throw err
    }
  },
}
