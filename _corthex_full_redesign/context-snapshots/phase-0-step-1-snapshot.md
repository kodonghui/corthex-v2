# Context Snapshot — Phase 0, Step 1: CORTHEX Technical Spec

**Date**: 2026-03-12
**Score**: 9.5/10 (Critic-A: 10/10, Critic-B: 9/10) — PASS
**Output file**: `_corthex_full_redesign/phase-0-foundation/spec/corthex-technical-spec.md` (1,024 lines)

---

## Key Decisions & Facts Established

### Architecture
- **Monorepo**: Turborepo — server (Hono+Bun), app (React+Vite), admin (React+Vite), ui, shared
- **Single engine entry point**: `engine/agent-loop.ts` — all calls (Hub, ARGOS, AGORA, trading, telegram, SketchVibe) route through here
- **3-Layer Caching**: Semantic (engine/, pgvector, cosine≥0.95) → Prompt (cache_control:ephemeral) → Tool (lib/tool-cache.ts, withCache())
- **Multi-tenancy**: `getDB(companyId)` mandatory for all business logic DB access

### RBAC (critical — confusing if missed)
- UX "CEO/employee" → DB `users.role: 'user'` (user_role enum: admin|user)
- UX "Company Admin" → DB `admin_users.role: 'admin'` (admin_role enum: superadmin|admin)
- UX "Super Admin" → DB `admin_users.role: 'superadmin'`, companyId: null
- NO `ceo` or `employee` enum at DB level

### AGORA Interaction Model (NOT streaming — must not confuse)
- `POST /api/workspace/debates` → create
- `POST /api/workspace/debates/:id/start` → async start (returns immediately)
- Poll `GET /:id` every 2s until `status: 'completed'`
- `GET /:id/timeline` → full speech array (render all at once, client-side animation optional)
- **Zero SSE endpoints in debates.ts**

### Hub Layout (3-column — critical for all Hub design)
- `[SessionPanel (left)] [ChatArea (flex-1 center)] [TrackerPanel (right w-80 = 320px)]`
- TrackerPanel: persistent, collapses to icon-strip (w-12) when no active handoffs
- Auto-expands on first `handoff` SSE event

### Navigation (from actual sidebar.tsx code)
**App Sidebar** (w-60, bg-zinc-50): 4 groups — (ungrouped top 3: 홈/허브/사령관실) + 업무 (6 items) + 운영 (16 items) + 시스템 (2 items)
**Admin Sidebar** (w-60, bg-white): Flat list 18 items + settings footer. Company dropdown at top.

### Design Constraints
- Desktop-only (min-width 1280px), no responsive layouts for app or admin
- Onboarding (app /onboarding, admin /onboarding) — DEFERRED, not in scope
- /admin/audit-logs exists in backend but NOT in admin sidebar nav yet (designer should add)

### Terminology (canonical v2)
- 허브(Hub) not 사령관실 for main command screen label
- 정보국(Library) for knowledge base nav label
- 티어(Tier) not 계급 for agent hierarchy

### Pages Count
- App: 29 pages (2 deferred)
- Admin: 22 pages (1 deferred, 1 needs sidebar addition: audit-logs)

---

## Issues Fixed in This Step
- Removed 2 fabricated endpoints (AGORA SSE, /workspace/costs)
- Added complete navigation sidebar structure (Section 9) from actual sidebar.tsx code
- Added Tracker Panel spec with 3-column layout constraint
- Added RBAC mapping table
- Added 5 missing DB tables (admin_sessions, invitations, employee_departments, notification_preferences, audit_logs)
- Added /admin/audit-logs page (Section 3.22)
- Added desktop-only constraint, terminology map, UI states catalogue
- Marked onboarding as DEFERRED
- Fixed WebSocket envelope format { channel, type, payload }

---

## Next Step
Phase 0-2: CORTHEX Vision & Identity (waiting for Orchestrator instruction)
