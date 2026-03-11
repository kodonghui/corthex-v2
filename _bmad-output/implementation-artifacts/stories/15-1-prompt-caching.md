# Story 15.1: Prompt Caching (Claude API cache_control)
Status: backlog

## Story
As a platform operator,
I want system prompts (Soul + tool definitions) to be cached via Claude API's cache_control,
so that repeated agent calls save ~85% on input token costs and respond ~85% faster (TTFT).

## Context (from _research/tool-reports/05-caching-strategy.md)
- Every agent call sends identical Soul (~2,000~8,000 tokens) + tool definitions (~1,000~3,000 tokens)
- Claude API supports `cache_control: { type: 'ephemeral' }` on system prompt blocks
- First call: 1.25x cost (cache write). Subsequent calls within 5min TTL: 0.1x cost (90% off)
- Monthly savings estimate: ~$22.95 for 100 calls/day on Sonnet

## Acceptance Criteria
1. **Given** agent-loop.ts calls the SDK, **When** systemPrompt is sent, **Then** it includes `cache_control: { type: 'ephemeral' }` on the system message block
2. **Given** the same agent is called twice within 5 minutes, **When** checking API response, **Then** `cache_read_input_tokens` is > 0 on the second call
3. **Given** an agent's Soul is updated, **When** the next call is made, **Then** the cache is invalidated (new Soul = cache miss, which is automatic)
4. **Given** cache_control is applied, **When** checking token costs, **Then** cached tokens are billed at 0.1x rate
5. **Given** all changes, **When** `npx tsc --noEmit` runs, **Then** no type errors
6. **Given** all changes, **When** existing tests run, **Then** all pass

## Tasks / Subtasks
- [ ] Task 1: Modify SDK query call to include cache_control (AC: #1)
  - [ ] Read current agent-loop.ts to understand how systemPrompt is passed to SDK
  - [ ] Check SDK API: does `query()` accept structured system messages with cache_control?
  - [ ] If SDK supports it: add cache_control to system message
  - [ ] If SDK doesn't: use raw `anthropic.messages.create()` with cache_control
  - [ ] Ensure cacheable content (Soul) is placed BEFORE variable content (messages)
- [ ] Task 2: Optimize prompt ordering for cache hits (AC: #1)
  - [ ] Soul template (static per agent) → first in system prompt
  - [ ] Tool definitions (static per agent) → second
  - [ ] Dynamic content (time, date) → outside system prompt or at the end
- [ ] Task 3: Add cache usage logging (AC: #2, #4)
  - [ ] Extract cache_read_input_tokens and cache_creation_input_tokens from API response
  - [ ] Log cache hit/miss ratio via structured logger
  - [ ] Include cache info in costTracker hook (if wired from 14.1)
- [ ] Task 4: Verify (AC: #5, #6)
  - [ ] npx tsc --noEmit
  - [ ] Run existing tests

## Dev Notes
- This is a ~1 line change for basic implementation, but proper logging + ordering optimization adds value
- SDK `query()` may already support cache_control — check @anthropic-ai/claude-agent-sdk docs
- DO NOT add semantic caching or tool caching here — those are separate stories
- After Epic 14.1 (hook wiring), agent-loop.ts may have changed — read the latest version first
