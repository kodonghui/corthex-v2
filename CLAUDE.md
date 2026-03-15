# CLAUDE.md -- CORTHEX v2

## User
- Non-developer. No jargon. Explain simply
- Always use 존댓말 (formal Korean)
- Talk to user in Korean, but code/commits/docs output can be in English
- Auto commit + push on completion (don't ask)

## Deploy
- main push -> GitHub Actions -> Cloudflare cache purge
- **After push**: wait for deploy (`gh run list -L 1`), report: build #N + changes + where to check
- Common type errors: wrong union values (shared/types.ts), wrong c.set() keys (server/types.ts), case-sensitive imports (`git ls-files`)

## v1 Feature Spec (top priority reference)
- Path: `_bmad-output/planning-artifacts/v1-feature-spec.md`
- "if it worked in v1, it must work in v2". No stub/mock.

## v2 Direction
- Not 29 fixed agents — admin freely creates/edits/deletes departments, staff, AI agents

## BMAD Workflow (absolute rules)
- Planning: `/kdh-full-auto-pipeline planning`. Party mode required. Fresh every time.
- Story Dev: 5 skills mandatory → create-story → dev-story → TEA → QA → code-review
- Orchestrator only assigns + commits. Workers do everything else.
- Prohibited: skipping skills, stub/mock as "done", orchestrator running party mode

## Output Quality
- Specific and detailed only. "Vague" = instant FAIL.

## Engine Patterns
- All execution → `engine/agent-loop.ts`. DB → `getDB(ctx.companyId)` only.
- engine/ public API: `agent-loop.ts` + `types.ts` only
- SDK pin version (no ^). Architecture: `_bmad-output/planning-artifacts/architecture.md`

## Coding Conventions
- Files: kebab-case. Components: PascalCase. Imports: match `git ls-files` casing.
- API: `{ success, data }` / `{ success, error: { code, message } }`. Tests: bun:test

## Context Memory
- Auto-save to `.claude/memory/working-state.md` on key decisions
- **"컴팩대비"** = update working-state + MEMORY.md + git commit+push all
- New session: read working-state.md first

## Hooks (자동 강제 — `.claude/hooks.json`)
다음 규칙들은 hooks로 자동 실행됨. CLAUDE.md에 적을 필요 없음:
- **tsc 검증**: 커밋 전 자동 타입체크, 실패 시 커밋 차단
- **시체 청소**: 세션 시작/종료 시 stale tmux, worktree, team dir 자동 제거
- **컴팩대비 자동저장**: 컨텍스트 압축 전 working-state + uncommitted changes 자동 커밋
- **업데이트 로그 리마인더**: 세션 종료 시 오늘 로그 없으면 경고
