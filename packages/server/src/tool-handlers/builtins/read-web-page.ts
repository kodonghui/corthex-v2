import { z } from 'zod'
import type { BuiltinToolHandler } from '../../engine'
import { callExternalApi } from '../../lib/call-external-api'
import { ToolError } from '../../lib/tool-error'
import { getDB } from '../../db/scoped-query'

/**
 * read_web_page — Jina Reader HTTP wrapper (FR-WD1, E13, E16, E17)
 *
 * Fetches any web page as clean markdown via r.jina.ai/{url}.
 * No API key required. URL validation via Zod .url().
 * All errors typed via callExternalApi (E16).
 * Telemetry recorded via E17 INSERT→try/catch→UPDATE pattern.
 */
export const handler: BuiltinToolHandler = {
  name: 'read_web_page',

  schema: z.object({
    url: z.string().url(),
  }),

  execute: async (input, ctx) => {
    const url = input.url as string
    const startTime = Date.now()

    // E17 Step 1: INSERT telemetry row at tool call start
    const [{ id: eventId }] = await getDB(ctx.companyId).insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'read_web_page',
      startedAt: new Date(),
    })

    try {
      // E16: wrap fetch in callExternalApi — converts HTTP status → typed ToolError
      const content = await callExternalApi('Jina Reader', () =>
        fetch(`https://r.jina.ai/${url}`).then((r) => {
          if (!r.ok) {
            const err = Object.assign(new Error(`HTTP ${r.status}`), { status: r.status })
            return Promise.reject(err)
          }
          return r.text()
        }),
      )

      // E17 Step 2: UPDATE on success
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      return content

    } catch (err) {
      // E17 Step 3: UPDATE on failure (before re-throw)
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
