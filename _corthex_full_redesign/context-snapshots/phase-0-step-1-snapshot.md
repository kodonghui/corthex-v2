# Phase 0-1 Context Snapshot — Technical Spec

**Date:** 2026-03-15
**Status:** PASS (avg 8.83/10)
**Output:** `_corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md` (1649 lines)

## Key Facts for Subsequent Phases

### Tech Stack
- Monorepo: server (Hono+Bun), app (React 19+Vite 6), admin (React 19+Vite 6), ui (CVA), shared (types)
- DB: PostgreSQL + pgvector on Neon, Drizzle ORM
- State: Zustand (UI) + TanStack Query (server cache)
- Real-time: SSE (6 event types, POST-based fetch) + WebSocket (7 channels) + polling
- Styling: Tailwind CSS 4, dark-mode class strategy
- Agent SDK: @anthropic-ai/claude-agent-sdk 0.2.x (pinned)

### Page Count
- App: 30 routes (login, onboarding, home, hub, command-center, chat, jobs, reports, sns, messenger, dashboard, ops-log, nexus, trading, files, org, notifications, activity-log, costs, cron, argos, agora, classified, knowledge, performance, departments, agents, tiers, settings)
- Admin: 24 routes

### Critical Design Constraints
- v1 must-haves: 12 features (command center, soul editor, autoLearn, conversation history, file attachments, tool call cards, markdown rendering, delegation chain, NEXUS canvas, AGORA debate, trading, budget alert)
- NFR: 20 concurrent sessions, 60fps NEXUS, 120s hard timeout, P95 200ms API
- Login page uses different colors: bg-white/zinc-950, button bg-indigo-600 (not slate dark theme)
- Department scoping: employees see only their dept's agents

### Existing Color System (from actual code)
- Backgrounds: slate-900/950 (page), slate-800/40-80 (cards)
- Text: white (primary), slate-400/500 (secondary)
- Accents: cyan-400 (active), violet-400 (jobs), emerald-400 (success), amber-400 (secretary), red-400 (error), blue-400 (working)
- Card pattern: rounded-2xl + gradient from-{color}-600/15 via-slate-800/80 to-slate-800/80

### Data Model
- 35+ tables, 25 enums
- Multi-tenancy: companyId in every query via getDB()
- Key tables: agents (with soul/adminSoul/tierLevel/allowedTools), chat_sessions+messages, delegations, cost_records

### Engine
- Single entry: engine/agent-loop.ts → runAgent()
- E8 boundary: only agent-loop.ts + types.ts are public API
- Hook pipeline: PreToolUse (permission) → PostToolUse (scrub→redact→track) → Stop (cost)
- 3-layer cache: Prompt (D17), Tool (D18), Semantic (D19)

## Libre Tools Applied
None (Phase 0-1 is technical analysis only)

## Connections to Next Steps
- Phase 0-2 needs: vision + identity based on this tech foundation
- Phase 1 needs: page list + API map for research targeting
- Phase 2 needs: NFR budgets + color system for scoring criteria
- Phase 3 needs: existing Tailwind classes as baseline for token design
