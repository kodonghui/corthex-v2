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
- Story Dev: create-story → dev-story → simplify → TEA → QA → code-review → **cross-check → smoke-test**
- cross-check: `.claude/hooks/cross-check.sh` (tenantMiddleware, colors, icons, migrations 일관성)
- smoke-test: `.claude/hooks/smoke-test.sh` (배포 후 전 API 엔드포인트 200 OK 확인)
- Orchestrator only assigns + commits. Workers do everything else.
- Prohibited: skipping skills, stub/mock as "done", orchestrator running party mode
- **파이프라인 에이전트 = 반드시 TeamCreate + Agent(team_name) 사용. 단독 Agent(서브에이전트) 금지.** 크리틱 간 cross-talk은 SendMessage로 직접 통신해야 하므로 팀 필수.
- **오케스트레이터 중계 필수**: Writer↔Critic 직접 통신에 의존 금지. 모든 단계 전환(리뷰 요청, fixes 완료, 다음 스텝)은 **오케스트레이터가 SendMessage로 직접 깨워서 지시**. idle 팀 에이전트는 자동 wake-up 안 됨.

## 파이프라인 절대 규칙 — 절대 어기지 마라
- **명령어 파이프라인(kdh-full-auto, kdh-uxui-redesign, kdh-code-review)의 Step/Phase를 빠르게 하려고 건너뛰지 마라.**
- **Party Mode가 명시된 Phase는 반드시 TeamCreate로 팀 생성 + 3-Critic 리뷰 실행.** 빠르게 하려고 Party Mode 스킵하면 결과물 품질이 떨어지고 나중에 다시 해야 함.
- **각 Step의 모든 요구사항을 충족한 후 다음 Step으로 넘어가라.** PARTIAL 상태로 다음 Phase 진행 금지.
- **Coverage Gate가 있으면 100% 달성 후 진행.** "대부분 했으니 다음으로" 금지.
- **사용자가 "빨리해"라고 해도 Step 스킵은 안 됨.** 속도는 병렬 실행으로 올려라, Step 제거로 올리지 마라.

## Output Quality
- Specific and detailed only. "Vague" = instant FAIL.
- 질문에 대답할 때는 반드시 **최신 정확한 정보**로 답변. 모르거나 확실하지 않으면 WebSearch로 찾아서 답변. 추측 금지.
- **기술 결정/라이브러리 선택/아키텍처 패턴 논의 시 반드시 WebSearch로 최신 정보 확인.** 파이프라인 에이전트(Writer/Critic 모두)도 동일. 2026년 기준 최신 버전, 호환성, 베스트 프랙티스를 검증 없이 추측하지 말 것.
- 프로젝트 상태를 언급할 때는 **반드시 코드를 직접 읽어서 확인**. 메모리만 보고 답하지 말 것.
- **기능/구조 질문 시 반드시 참고**: brief(`_bmad-output/product-brief.md`), PRD(`_bmad-output/prd.md`), architecture(`_bmad-output/planning-artifacts/architecture.md`), v1-feature-spec 읽고 답변. 추측으로 대답 금지.

## Engine Patterns
- All execution → `engine/agent-loop.ts`. DB → `getDB(ctx.companyId)` only.
- engine/ public API: `agent-loop.ts` + `types.ts` only
- SDK pin version (no ^). Architecture: `_bmad-output/planning-artifacts/architecture.md`

## Coding Conventions
- Files: kebab-case. Components: PascalCase. Imports: match `git ls-files` casing.
- API: `{ success, data }` / `{ success, error: { code, message } }`. Tests: bun:test

## UXUI Redesign (Phase 7)
- Stitch MCP가 생성한 HTML = 디자인 기준 (`_corthex_full_redesign/phase-6-generated/web/`)
- **App Shell** (layout.tsx + sidebar.tsx): `01-app-shell.html` 기준으로 리빌드 완료
- **페이지 콘텐츠**: 각 Stitch HTML에서 content area만 참고 (sidebar/topbar 무시)
- **Dark mode 전용**: Stitch HTML의 `dark:` 클래스가 우리 기준. light mode 차이는 무시
- **아이콘**: Lucide React 유지 (Material Symbols 대신 — 번들 크기)
- **디자인 토큰**: Sovereign Sage — slate-950 bg, cyan-400 accent, Inter + JetBrains Mono
- 비교 결과 (2026-03-16):
  - 잘 맞음: Hub(95%), Dashboard(90%), Chat(90%), SNS(85%), Notifications(85%)
  - 구조 차이: Trading(테이블/타임프레임), Agents(detail panel), Departments(상세섹션)
  - React이 더 나음: Jobs(복잡한 기능), Settings(10탭)

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
