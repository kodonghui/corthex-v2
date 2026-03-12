# Story 15-1: Prompt Caching — Session Update

**Date**: 2026-03-12
**Story**: 15-1 Prompt Caching (Claude API cache_control)

## What Changed

### Path Decision
- **PoC Result**: Path A FAILS — claude-agent-sdk@0.2.72 only accepts `string` for systemPrompt.
  SDK source confirms: `if (typeof Y === 'string') H = Y` — ContentBlock[] → empty string.
- **Selected**: Path B — `anthropic.messages.create()` directly with `cache_control: { type: 'ephemeral' }`

### Files Modified

1. **`packages/server/src/engine/agent-loop.ts`** — Complete rewrite
   - Replaced `query()` from claude-agent-sdk with `Anthropic.messages.create()`
   - System prompt: `[{ type: 'text', text: soul, cache_control: { type: 'ephemeral' } }]`
   - Multi-turn tool loop (max 10 turns)
   - PreToolUse/PostToolUse hooks reimplemented manually
   - call_agent handled: emits handoff SSE event, returns success result
   - Cache token accumulation: `cache_read_input_tokens` + `cache_creation_input_tokens`
   - Model resolved from agent tier via `selectModel()` + DB lookup

2. **`packages/server/src/engine/hooks/cost-tracker.ts`** — Cache logging added
   - `UsageInfo` extended with `cacheReadInputTokens?` + `cacheCreationInputTokens?`
   - `log.info({ event: 'prompt_cache_usage', ... })` when cache tokens > 0
   - Costs: read × $0.30/MTok, creation × $3.75/MTok

3. **`packages/server/src/db/scoped-query.ts`** — New query
   - `agentToolsWithSchema()` — includes `inputSchema` for API tool definitions

4. **`packages/server/src/engine/__tests__/agent-loop-hooks.test.ts`** — Rewritten
   - Mocks `@anthropic-ai/sdk` instead of `@anthropic-ai/claude-agent-sdk`
   - 17 tests covering: hook pipeline, cache token flow, cost calculations

5. **`packages/server/scripts/poc-prompt-cache.ts`** — PoC script (new file)
   - Documents Path A failure + Path B verification procedure

## Result
- tsc: ✅ 0 errors
- Tests: 26 pass, 0 fail (engine + cost-tracker tests)
- Cache_control added to all agent system prompts
- Cache metrics captured and logged via cost-tracker
