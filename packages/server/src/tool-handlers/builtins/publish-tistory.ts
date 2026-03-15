/**
 * publish_tistory — Tistory Blog Post Publisher (FR-CP1, E13, E16, E17)
 *
 * Converts markdown to HTML via marked.parse(), then publishes to Tistory API.
 * Credential: tistory_access_token (stored encrypted in DB, resolved via getCredential)
 * All external API errors typed via callExternalApi (E16).
 * Telemetry: E17 INSERT→try/catch→UPDATE pattern.
 * NFR-P1: p95 latency < 5s.
 */
import { z } from 'zod'
import { marked } from 'marked'
import type { BuiltinToolHandler } from '../../engine'
import { callExternalApi } from '../../lib/call-external-api'
import { ToolError } from '../../lib/tool-error'
import { getDB } from '../../db/scoped-query'
import { decrypt } from '../../lib/credential-crypto'

const TISTORY_API_BASE = 'https://www.tistory.com/apis'

export const handler: BuiltinToolHandler = {
  name: 'publish_tistory',

  schema: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    blogName: z.string().optional(),
    visibility: z.number().int().min(0).max(3).optional().default(3),
    tags: z.array(z.string()).optional().default([]),
  }),

  execute: async (input, ctx) => {
    const title = input.title as string
    const content = input.content as string
    const blogName = input.blogName as string | undefined
    const visibility = input.visibility as number
    const tags = input.tags as string[]
    const startTime = Date.now()

    // E17 Step 1: INSERT telemetry row at tool call start
    const db = getDB(ctx.companyId)
    const [{ id: eventId }] = await db.insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'publish_tistory',
      startedAt: new Date(),
    })

    try {
      // Resolve tistory_access_token from DB (E11 RESOLVE pattern)
      const [tokenRow] = await db.getCredential('tistory_access_token')
      if (!tokenRow) {
        throw new ToolError(
          'TOOL_CREDENTIAL_INVALID',
          'tistory_access_token not configured — register credential in Admin settings.',
        )
      }
      const accessToken = await decrypt(tokenRow.encryptedValue)

      // Convert markdown → HTML
      const htmlContent = await marked.parse(content)

      // Resolve blog name if not provided — fetch from info API
      let resolvedBlogName = blogName
      if (!resolvedBlogName) {
        const infoResp = await callExternalApi('Tistory API', () =>
          fetch(`${TISTORY_API_BASE}/blog/info?access_token=${encodeURIComponent(accessToken)}&output=json`)
            .then(async (r) => {
              if (!r.ok) return Promise.reject({ status: r.status })
              return r.json() as Promise<{ tistory: { item: { blogs: Array<{ name: string; defaultFlag: string }> } } }>
            })
        )
        const blogs = infoResp.tistory?.item?.blogs ?? []
        const defaultBlog = blogs.find(b => b.defaultFlag === 'Y') ?? blogs[0]
        if (!defaultBlog) {
          throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'Tistory API: no blog found for this token')
        }
        resolvedBlogName = defaultBlog.name
      }

      // POST /apis/post/write
      const params = new URLSearchParams({
        access_token: accessToken,
        output: 'json',
        blogName: resolvedBlogName,
        title,
        content: htmlContent,
        visibility: String(visibility),
        ...(tags.length > 0 ? { tag: tags.join(',') } : {}),
      })

      const postResp = await callExternalApi('Tistory API', () =>
        fetch(`${TISTORY_API_BASE}/post/write`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        }).then(async (r) => {
          if (!r.ok) return Promise.reject({ status: r.status })
          return r.json() as Promise<{ tistory: { postUrl: string; postId: string } }>
        })
      )

      const postUrl = postResp.tistory?.postUrl
      if (!postUrl) {
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'Tistory API: no postUrl in response')
      }

      // E17 Step 2: UPDATE on success
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      return postUrl

    } catch (err) {
      // E17 Step 3: UPDATE on failure (before re-throw)
      const errorCode = err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode,
        durationMs: Date.now() - startTime,
      })
      throw err
    }
  },
}
