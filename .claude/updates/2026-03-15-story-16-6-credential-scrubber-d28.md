# Story 16.6 — Credential-Scrubber D28 Extension

## What Changed
- Extended `credential-scrubber.ts` with D28 session-start credential loading
- Added `init(ctx)`, `release(sessionId)`, `_testSetSession()` exports
- Added Step 3 session-credential scanning in `credentialScrubber()` (split/join, audit log)
- Added minimum-length guard (≥4 chars) from Code Review to prevent short-credential output corruption
- Rewrote `credential-scrubber.test.ts`: 37 tests total (29 dev + 5 TEA + 3 from 21.1), all passing

## Why
D28 architecture decision: scrubber must cover registered company credentials (not just static regex patterns). AC1-AC5 all satisfied.

## Files Affected
- `packages/server/src/engine/hooks/credential-scrubber.ts` — D28 extension
- `packages/server/src/__tests__/unit/credential-scrubber.test.ts` — full rewrite + TEA additions

## Result
- 37 tests, 0 fail
- tsc: 0 errors
- Commit: `210f3fb` pushed to main
- GitHub Actions: queued (self-hosted runner queue backed up due to swarm parallelism)
