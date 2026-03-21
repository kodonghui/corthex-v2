# Stage 0 Brief Review — Fixes Applied (Cycle 1 + Cycle 2 DA)

> Date: 2026-03-21
> Document: `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md`
> Analyst: Mary
> Cycle 1 scores: Bob 5.95, John 6.15, Sally 6.10, Winston 6.40 → **avg 6.15/10 FAIL**
> Score stdev: 0.16 (< 0.5 — tight consensus due to same fundamental gaps found by all critics)

---

## Fixes Applied

### CRITICAL Fixes

| # | Issue | Source | Fix Applied |
|---|-------|--------|-------------|
| C1 | 15x "OpenClaw" codename → CEO dropped | CEO decision + all critics | Replaced all 15 occurrences: title → "CORTHEX v3", feature → "Virtual Office (가상 사무실)" |
| C2 | 6x "Subframe" → "Stitch 2" | All 4 critics | Replaced all 6 occurrences (lines 88, 187, 355, 378, 388, 391) |
| C3 | WebSocket 14→16 | Winston (code-verified), analyst, bob | Fixed 3 locations (lines 125, 173, 420): "14채널" → "16채널", "+1=15" → "+1=17" |
| C4 | Missing Risks section | Bob, John, Sally, Winston | **NEW SECTION**: 10 risks with probability/impact/mitigation table |
| C5 | Missing agent security (ECC 2.1) | John, Bob, Winston | Added Go/No-Go #9: Tool response sanitization + R5 in Risks table |
| C6 | Embedding provider unspecified | John, Winston, analyst | Added: "Voyage AI `voyage-3` (1024d)" in Layer 4 + Technical Constraints table |

### IMPORTANT Fixes

| # | Issue | Source | Fix Applied |
|---|-------|--------|-------------|
| I1 | Page count 73→74 | All critics | Admin "+1" → "+2", total "73" → "74" |
| I2 | Sprint duration missing | Bob, John | Added duration column to sprint table: Pre(1w), S1(2w), S2(3w), S3(4w), S4(3w), total ~14w |
| I3 | Layer 0 "60%" gating undefined | Bob, Winston, John, Sally | Defined: "74페이지 중 ≥60% Stitch 2 스펙 매칭(≥95% fidelity) + 하드코딩 색상 0 + dead button 0" |
| I4 | Layer 0 circular dependency | Winston-Bob cross-talk | Split Layer 0 into L0-A(blocking token), L0-B(parallel cleanup), L0-C(embedded new-page) |
| I5 | n8n integration pattern absent | Winston | Added: webhook → `/api/v1/tasks` POST + service account API key auth + callback URL + error propagation |
| I6 | VPS constraints in HTML only | Winston | **NEW SECTION**: "## Technical Constraints" table with all VPS limits visible |
| I7 | Observations schema gap (ECC 2.3) | John, analyst | Added: `confidence` (0.3~0.9), `domain` fields, 30-day retention policy |
| I8 | Go/No-Go gates 100% technical | John, Sally (cross-talk) | Added Go/No-Go #10: v1 feature parity checklist, #11: usability validation (CEO 5-min workflow test) |
| I9 | Zero accessibility mention | Sally | Added: keyboard nav + ARIA baseline in Layer 0, Canvas text alternative in Layer 1, R9 accessibility risk |
| I10 | Virtual Office cognitive load at scale | Sally | Added: department rooms, status filters, zoom/pan, minimap in Layer 1 + R10 risk |
| I11 | Asset quality Go/No-Go #8 no criteria | Bob | Added: minimum criteria (5 state animations, 32×32+, style consistency) |
| I12 | Sprint 3 blocker self-referential | Bob | Added mitigation: "$0.10~$0.50/agent/day Haiku" cost range for downstream planning |
| I13 | n8n Docker resource budget | Winston | Added: `--memory=2g --restart unless-stopped` in Layer 2 + Technical Constraints |
| I14 | Missing v2 failure lesson | John | Added explicit v2 lesson in Go/No-Go #11 + R7 risk: "10,154 tests → 실사용 0 → 폐기" |
| I15 | Visual coherence principle | Sally-John cross-talk | Added: "Phase 0 테마 선택 시 Virtual Office 픽셀 아트 호환성 평가 기준 포함" in Layer 0 + Key Differentiators |

### MINOR Fixes

| # | Issue | Source | Fix Applied |
|---|-------|--------|-------------|
| M1 | Line 90: Step 4 leftover | Analyst, Bob, John | Removed "(정량 지표는 Step 4에서 정의)" |
| M2 | "외부 구매" → "유료 에셋 구매" | Analyst, John | Changed in Out of Scope table |
| M3 | n8n Go/No-Go #3 enhanced | Winston | Added "서비스 계정 API 키 인증 검증" |
| M4 | WCAG in Future Vision | Sally | Added "WCAG AA 완전 준수" to v4+ items |

---

## Not Applied (Deferred to PRD/Architecture)

| Issue | Source | Reason |
|-------|--------|--------|
| personality_traits render format (JSON vs NL) | Winston M2 | Design decision → Architecture stage |
| Admin AHA feedback loop (in-app preview) | Sally I6 | UX design decision → UX Design stage |
| Empty states design | Sally I8 | UX design decision → UX Design stage |
| CEO "Setup Required" screen design | Sally I9 | UX design decision → UX Design stage |
| Device/responsive strategy | Sally I13 | UX design decision → UX Design stage |
| Big Five slider descriptive labels | Sally I12 | UX design decision → UX Design stage |
| Success metrics baseline measurement | John M13 | PRD-level detail |
| ECC 2.4 Capability Eval metric | John M14, analyst | PRD-level metric design |
| n8n operations responsibility | John I10 | Architecture/Operations stage |
| pgvector dimension migration (1536→1024) | Winston I3 | Architecture stage investigation |

---

---

## Cycle 2 Devil's Advocate Fixes (Winston)

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| DA-1 | pgvector dimension is 768 (Gemini), not 1536 as Brief claimed | CRITICAL | Corrected: "기존 `vector(768)` Gemini → `vector(1024)` Voyage AI 마이그레이션 + re-embed 필수". Updated Layer 4 + Technical Constraints. |
| DA-2 | `agent_memories` has NO vector column — Brief assumed pgvector search exists | CRITICAL | Added: "현재 벡터 컬럼 없음 → `vector(1024)` 신규 추가 + 기존 memories backfill job 필요. Sprint 3 스코프에 포함 (단순 enum 확장이 아닌 스키마 변경)." |
| DA-3 | v1 parity Go/No-Go #10 contradicts Gemini ban | IMPORTANT | Added exclusion list: "의도적 제외: Gemini 모델 (key constraint 금지), GPT 모델 (CEO 결정 제거, commit e294213)" |
| DA-4 | Workflow API orphaning vs Zero Regression | IMPORTANT | Added deprecation strategy: "11 endpoints 200 OK 유지 + `{deprecated: true, migrateTo: 'n8n'}` 플래그. 완전 제거는 v4." |

---

---

## ECC Full Reflection Fixes (CEO Directive)

> 사장님 지시: ECC 분석 Part 2 전체 8가지를 Brief에 반영. Critics (Bob, Sally, John) 합의 기반 적용.

### Brief Body에 추가 (9건)

| # | ECC | Item | Fix Applied |
|---|-----|------|-------------|
| ECC-1 | 2.1 | Governance event logging | Layer 4 scope: "에이전트 민감 작업 감사 로그 (도구 실행, 외부 API, 비용 임계치)" |
| ECC-2 | 2.1 | CLI token auto-deactivation | R5 mitigation 확장: "CLI 토큰 유출 감지 시 자동 비활성화 메커니즘" |
| ECC-3 | 2.1 | MCP server health check | Technical Constraints 신규 행: "Stitch 2, Playwright MCP 무응답 시 자동 알림 크론" |
| ECC-4 | 2.2 | Cost-aware model routing | Layer 4 scope: "Tier별 태스크 복잡도 기반 Haiku/Sonnet 자동 선택" |
| ECC-5 | 2.2 | Budget exceed auto-block | Go/No-Go #7 확장: "Tier별 일일/월간 예산 한도 초과 시 자동 차단" |
| ECC-6 | 2.2 | Immutable cost tracking | Technical Constraints 신규 행: "cost-aggregation append-only 패턴" |
| ECC-7 | 2.3 | Reflection confidence priority | Layer 4 Reflection 설명: "confidence ≥ 0.7 관찰 우선 통합 (노이즈 필터링)" |
| ECC-8 | 2.4 | Capability Eval metric | Success Metrics Layer 4: "동일 태스크 3회 반복 시 3회차 재수정 ≤ 50%" |
| ECC-9 | 2.7 | Handoff response standardization | Layer 4 scope: "call_agent 응답 { status, summary, next_actions, artifacts }" |

### Future Vision에 추가 (3건)

| # | ECC | Item | Fix Applied |
|---|-----|------|-------------|
| ECC-10 | 2.3 | Cross-project global insight | "동일 패턴 2+ 회사 발견 시 글로벌 인사이트 승격" |
| ECC-11 | 2.8 | Chief-of-Staff message triage | "메시지 4단계 분류: skip/info_only/meeting_info/action_required" |
| ECC-12 | 2.8 | Per-agent user preference | "에이전트별 사용자 선호도 학습 — Layer 4 메모리 연동" |

### Executive Summary에 추가 (1건)

| # | Item | Fix Applied |
|---|------|-------------|
| ECC-13 | Vision 보완 | "안전한 에이전트 실행 환경(감사 로그 + 토큰 보호), Tier별 비용 인지 모델 라우팅" |

### Brief에 추가 불필요 (합의) (4건)

| ECC | Item | Reason |
|-----|------|--------|
| 2.5 | Blueprint (context brief) | 파이프라인 방법론, 제품 Brief 범위 아님 (Bob, Sally, John 합의) |
| 2.6 | Search-First | Stage 1 Technical Research에서 이미 수행 (전원 합의) |
| 2.7 | ReAct hybrid | E8 경계(agent-loop.ts 불변) 위반 (John PM 판단, 전원 동의) |
| 2.7 | Error recovery contract | Architecture 설계 단계 (Bob, John 합의) |

---

## Summary

- **Total fixes applied**: Cycle 1 (25) + Cycle 2 DA (4) + ECC Reflection (13) = **42 fixes**
- **Deferred to downstream**: 10 items (PRD/Architecture/UX Design) + 2 items (Architecture NFR)
- **All stale references eliminated**: 0 "OpenClaw", 0 "Subframe", 0 "14채널" remaining
- **2 new sections added**: Technical Constraints + Risks (10 risks)
- **3 new Go/No-Go gates**: #9 Agent Security, #10 v1 Feature Parity, #11 Usability
- **Sprint table enhanced**: Duration estimates + Layer 0 3-phase split
- **DA code-verified fixes**: pgvector 768→1024 migration, agent_memories vector column, workflow deprecation strategy
- **ECC full reflection**: 8/8 ECC ideas addressed — 9 Brief body + 3 Future Vision + 1 Executive Summary additions. 4 items excluded by critic consensus (methodology/E8 boundary).
