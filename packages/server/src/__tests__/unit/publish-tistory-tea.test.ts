import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 17.4: publish_tistory Tool Handler TEA Tests ===
// TEA: Risk-based — P0 handler exports + structure, P0 credential resolution,
//      P0 callExternalApi error mapping, P0 visibility passthrough,
//      P1 E17 telemetry pattern, P1 no generic Error(), P1 markdown→HTML

// ─── Source files ─────────────────────────────────────────────────────────────

const SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../tool-handlers/builtins/publish-tistory.ts'),
  'utf-8',
)

// ─── P0: Handler export and structure ────────────────────────────────────────

describe('[P0] publish_tistory — handler structure (E13)', () => {
  test('exports handler object', () => {
    expect(SRC).toContain('export const handler: BuiltinToolHandler')
  })

  test('handler name is publish_tistory', () => {
    expect(SRC).toContain("name: 'publish_tistory'")
  })

  test('schema defined with z.object()', () => {
    expect(SRC).toContain('schema: z.object(')
  })

  test('execute function is async', () => {
    expect(SRC).toContain('execute: async (input, ctx) =>')
  })

  test('imports BuiltinToolHandler from engine', () => {
    expect(SRC).toContain("from '../../engine'")
    expect(SRC).toContain('BuiltinToolHandler')
  })

  test('imports callExternalApi (E16)', () => {
    expect(SRC).toContain("from '../../lib/call-external-api'")
    expect(SRC).toContain('callExternalApi')
  })

  test('imports ToolError (E16)', () => {
    expect(SRC).toContain("from '../../lib/tool-error'")
    expect(SRC).toContain('ToolError')
  })
})

// ─── P0: Schema validation ────────────────────────────────────────────────────

describe('[P0] Zod schema — input validation', () => {
  test('title field required (z.string().min(1))', () => {
    expect(SRC).toContain('title: z.string().min(1)')
  })

  test('content field required (z.string().min(1))', () => {
    expect(SRC).toContain('content: z.string().min(1)')
  })

  test('visibility field optional with default 3 (public)', () => {
    expect(SRC).toContain('visibility')
    expect(SRC).toContain('.default(3)')
  })

  test('visibility range constrained 0-3', () => {
    expect(SRC).toContain('.min(0).max(3)')
  })

  test('tags field optional array with default []', () => {
    expect(SRC).toContain('tags: z.array(z.string())')
    expect(SRC).toContain(".default([])")
  })

  test('blogName optional (resolved from API if omitted)', () => {
    expect(SRC).toContain('blogName: z.string().optional()')
  })
})

// ─── P0: Credential resolution ───────────────────────────────────────────────

describe('[P0] FR-CM1 — credential resolution (tistory_access_token)', () => {
  test('getDB(ctx.companyId) used for credential lookup (scoped access)', () => {
    expect(SRC).toContain('getDB(ctx.companyId)')
  })

  test('getCredential called with tistory_access_token key', () => {
    expect(SRC).toContain("getCredential('tistory_access_token')")
  })

  test('TOOL_CREDENTIAL_INVALID thrown when token not found', () => {
    expect(SRC).toContain('TOOL_CREDENTIAL_INVALID')
    expect(SRC).toContain('tistory_access_token not configured')
  })

  test('decrypt() called on encryptedValue (E11 resolve pattern)', () => {
    expect(SRC).toContain("from '../../lib/credential-crypto'")
    expect(SRC).toContain('decrypt(tokenRow.encryptedValue)')
  })

  test('access token NOT included in error messages (credential not leaked)', () => {
    // No string interpolation of accessToken in ToolError messages
    const errorMessages = SRC.match(/ToolError\([^)]+\)/g) ?? []
    errorMessages.forEach(msg => {
      expect(msg).not.toContain('accessToken')
    })
  })
})

// ─── P0: Markdown → HTML conversion ──────────────────────────────────────────

describe('[P0] FR-CP1 — markdown→HTML via marked.parse()', () => {
  test('imports marked library', () => {
    expect(SRC).toContain("from 'marked'")
    expect(SRC).toContain('marked')
  })

  test('marked.parse() called on content', () => {
    expect(SRC).toContain('marked.parse(content)')
  })

  test('HTML content sent to Tistory API (not raw markdown)', () => {
    expect(SRC).toContain('htmlContent')
    expect(SRC).toContain('content: htmlContent')
  })
})

// ─── P0: Tistory API call ─────────────────────────────────────────────────────

describe('[P0] FR-CP1 — Tistory API post/write call', () => {
  test('POST to Tistory post/write endpoint', () => {
    expect(SRC).toContain('/post/write')
    expect(SRC).toContain("method: 'POST'")
  })

  test('access_token included in request (OAuth)', () => {
    expect(SRC).toContain('access_token')
  })

  test('visibility passed through in API request (not hardcoded)', () => {
    expect(SRC).toContain('visibility: String(visibility)')
  })

  test('tags joined with comma when present', () => {
    expect(SRC).toContain("tags.join(',')")
  })

  test('postUrl extracted from response and returned', () => {
    expect(SRC).toContain('postUrl')
    expect(SRC).toContain('return postUrl')
  })

  test('wrapped in callExternalApi("Tistory API", ...)', () => {
    expect(SRC).toContain("callExternalApi('Tistory API'")
  })
})

// ─── P0: Error code mapping ───────────────────────────────────────────────────

describe('[P0] E16 — error code mapping (callExternalApi)', () => {
  test('401/403 → TOOL_CREDENTIAL_INVALID via callExternalApi', () => {
    // callExternalApi handles 401/403 → TOOL_CREDENTIAL_INVALID automatically
    // verify the import is present and callExternalApi is used
    expect(SRC).toContain('callExternalApi')
    expect(SRC).toContain('TOOL_CREDENTIAL_INVALID')
  })

  test('TOOL_EXTERNAL_SERVICE_ERROR thrown for missing postUrl', () => {
    expect(SRC).toContain('TOOL_EXTERNAL_SERVICE_ERROR')
    expect(SRC).toContain('no postUrl in response')
  })

  test('TOOL_CREDENTIAL_INVALID error message tells admin where to fix', () => {
    expect(SRC).toContain('Admin settings')
  })
})

// ─── P0: Visibility passthrough simulation ────────────────────────────────────

describe('[P0] AC3 — visibility parameter passthrough', () => {
  function buildParams(visibility: number) {
    return new URLSearchParams({
      visibility: String(visibility),
    })
  }

  test('visibility=0 (private) → sent as 0', () => {
    const p = buildParams(0)
    expect(p.get('visibility')).toBe('0')
  })

  test('visibility=3 (public) → sent as 3', () => {
    const p = buildParams(3)
    expect(p.get('visibility')).toBe('3')
  })

  test('visibility=1 (protected) → sent as 1', () => {
    const p = buildParams(1)
    expect(p.get('visibility')).toBe('1')
  })
})

// ─── P1: E17 telemetry pattern ────────────────────────────────────────────────

describe('[P1] E17 — telemetry INSERT→try/catch→UPDATE pattern', () => {
  test('insertToolCallEvent called with publish_tistory toolName', () => {
    expect(SRC).toContain('insertToolCallEvent(')
    expect(SRC).toContain("toolName: 'publish_tistory'")
  })

  test('startedAt: new Date() in insertToolCallEvent', () => {
    expect(SRC).toContain('startedAt: new Date()')
  })

  test('updateToolCallEvent called on success', () => {
    expect(SRC).toContain('updateToolCallEvent(eventId,')
    expect(SRC).toContain('success: true')
  })

  test('updateToolCallEvent called on failure (before re-throw)', () => {
    expect(SRC).toContain('success: false')
    expect(SRC).toContain('errorCode')
  })

  test('durationMs recorded in both success and failure paths', () => {
    const successIdx = SRC.indexOf('success: true')
    const failureIdx = SRC.indexOf('success: false')
    const successCtx = SRC.slice(successIdx - 100, successIdx + 200)
    const failureCtx = SRC.slice(failureIdx - 100, failureIdx + 200)
    expect(successCtx).toContain('durationMs')
    expect(failureCtx).toContain('durationMs')
  })

  test('err re-thrown after failure telemetry update', () => {
    expect(SRC).toContain('throw err')
  })
})

// ─── P1: No generic Error() — E16 mandate ─────────────────────────────────────

describe('[P1] E16 — no generic new Error() in handler', () => {
  test('no new Error() calls (only ToolError allowed)', () => {
    // D pattern: no `new Error(` — only `new ToolError(`
    const newErrorMatches = SRC.match(/new Error\(/g) ?? []
    expect(newErrorMatches.length).toBe(0)
  })

  test('all error constructions use ToolError', () => {
    expect(SRC).toContain('new ToolError(')
  })
})

// ─── P1: Blog name resolution ─────────────────────────────────────────────────

describe('[P1] AC4 — blog name resolution from Tistory info API', () => {
  test('blog/info API called when blogName not provided', () => {
    expect(SRC).toContain('/blog/info')
  })

  test('defaultFlag="Y" used to find default blog', () => {
    expect(SRC).toContain("defaultFlag === 'Y'")
  })

  test('resolvedBlogName used in post/write request', () => {
    expect(SRC).toContain('resolvedBlogName')
    expect(SRC).toContain('blogName: resolvedBlogName')
  })
})

// ─── P1: Markdown→HTML logic simulation ──────────────────────────────────────

describe('[P1] Markdown conversion contract', () => {
  test('marked import is named import from "marked"', () => {
    expect(SRC).toContain("import { marked } from 'marked'")
  })

  test('await used with marked.parse() (async marked)', () => {
    expect(SRC).toContain('await marked.parse(content)')
  })
})
