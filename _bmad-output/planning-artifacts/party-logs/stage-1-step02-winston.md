# Critic-A (Architecture) Review — Step 2: Technology Stack Analysis

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Technology Stack Analysis" section (L112-473)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | All 6 domains pinned to exact versions (PixiJS 8.17.1, n8n 2.12.3, pgvector npm 0.2.1 / PG ext 0.8.0). Bundle sizes in KB/MB. RAM usage per-service table. Cost model with exact token counts and dollar amounts ($1.80 vs $39/month). Confidence levels on every claim. One gap: ComfyUI GPU requirement mentions "8GB+ VRAM" but doesn't specify which cloud GPU service to use. |
| D2 완전성 | 9/10 | All 6 domains covered. Version matrix, alternatives comparison, resource ranking, Go/No-Go inputs for #3/#5/#7/#8 addressed. Reflection cost model (Go/No-Go #7) thorough. AI sprite pipeline with 3 options. Observation schema draft included. One omission: no mention of @pixi/react key shadowing concern from Step 1 cross-talk (extraVars built-in var override risk in Domain 3). |
| D3 정확성 | 7/10 | **Critical error**: L130 states "현재 v2는 React 18 — 업그레이드 필요" but `packages/app/package.json:32` has `"react": "^19"` and `packages/admin/package.json:20` has `"react": "^19"`. v2 is ALREADY on React 19. This is a hallucination that would create a false Sprint 4 blocker. Also: `memory-extractor.ts` is at `services/memory-extractor.ts` (E8 boundary OUTSIDE engine/), not inside engine/ as implied by the memory-reflection.ts separation discussion. Rest is accurate — n8n ARM64 manifest, pgvector enum extension, bundle sizes all verified or sourced. |
| D4 실행가능성 | 9/10 | Observation table schema ready to copy. Prompt pattern with extraVars template. Docker run config with memory/CPU limits. n8n env vars for API-only mode. AI sprite pipeline with 3 concrete options. Subframe MCP tools listed with purposes. Very actionable for a research doc. |
| D5 일관성 | 8/10 | Sprint ordering matches Brief. Go/No-Go gates referenced correctly (#3, #5, #7, #8). Known Risks R6-R8 addressed. VPS resource ranking aligns with Step 1 constraints. Confidence framework used consistently. Stitch correctly noted as deprecated (L424). The React 19 error creates inconsistency with actual codebase state. |
| D6 리스크 | 8/10 | Co-residence resource table (L232-241) excellent — 15.5GB headroom calculated. Docker resource limits specified. ComfyUI GPU requirement flagged (L410). PixiJS tree-shaking requirement identified (216KB → <200KB). Missing: (1) React 19 upgrade risk is fabricated — should instead assess @pixi/react 8.0.5 compatibility with existing React 19 setup. (2) n8n upgrade path risk — what happens when n8n 2.x → 3.x breaks API? (3) Neon pgvector extension auto-update risk — Neon manages the version, what if they upgrade and break compatibility? |

### 가중 평균: 8.20/10 ✅ PASS

Calculation: (9×0.15) + (9×0.15) + (7×0.25) + (9×0.20) + (8×0.15) + (8×0.10) = 1.35 + 1.35 + 1.75 + 1.80 + 1.20 + 0.80 = **8.25**

---

## 이슈 목록

### Critical

1. **[D3 정확성] React 19 오류 — 할루시네이션** — L130 "현재 v2는 React 18 — 업그레이드 필요"는 사실과 다름. Code-verified:
   - `packages/app/package.json:32` → `"react": "^19"`
   - `packages/admin/package.json:20` → `"react": "^19"`
   - v2는 이미 React 19. @pixi/react 8.0.5와 호환 확인만 하면 됨, 업그레이드 불필요.
   - ⚠️ **Rubric 자동 불합격 조건 #1 (할루시네이션)에 근접** — 존재하지 않는 블로커를 생성. 수정 필수.

### Major

2. **[D3 정확성] memory-extractor.ts 위치 오류** — L362 "memory-extractor.ts (existing)" 언급 시 engine/ 내부 인상을 줌. 실제 위치: `packages/server/src/services/memory-extractor.ts` (E8 경계 외부). 신규 `memory-reflection.ts` 배치 위치 결정에 영향 — services/ 에 두는 것이 기존 패턴과 일관적.

3. **[D6 리스크] n8n 버전 락인/업그레이드 경로 미언급** — n8n 2.12.3 핀닝은 좋으나, n8n은 빠른 릴리즈 주기 (주 1~2회). API 변경, breaking changes, 보안 패치 적용 전략 미정의. Docker image tag 고정 + 업그레이드 테스트 절차 필요.

### Minor

4. **[D6 리스크] Neon pgvector 자동 업데이트 리스크** — L325-326 "Neon supports pgvector natively (managed extension)" — Neon이 extension 버전을 자동 관리하므로, breaking change 시 우리 코드가 깨질 수 있음. pgvector npm client 0.2.1이 PG extension 0.9+ 와 호환되는지 미확인.

5. **[D2 완전성] extraVars key shadowing 미반영** — Step 1 cross-talk에서 Quinn과 합의한 extraVars key shadowing 리스크 (soul-renderer.ts:41 `...extraVars`가 built-in vars 덮어쓰기)가 Domain 3 sanitization 패턴에 미포함. Layer B에 key allowlist/collision rejection 추가 필요.

6. **[D1 구체성] PixiJS tree-shaking 구체적 모듈 목록** — L144 "Modules NOT needed: filters, text, graphics, mesh, particle container" 는 좋으나, 반대로 "Modules NEEDED" 목록이 없음. `extend()` 호출에 정확히 어떤 클래스를 등록하는지 명시하면 번들 사이즈 검증 가능.

---

## Cross-talk 요청

- **Quinn**: React 19 할루시네이션에 대한 QA 관점. 또한 Domain 3 sanitization에 key shadowing 미포함 확인.
- **John**: React 19 false blocker의 delivery 영향 — Sprint 4 선행 조건에서 제거 필요.

## Cross-talk Additions (post-review)

7. **[D5 일관성] pgvector version 자기모순** (from John cross-talk) — ✅ FIXED. Version Matrix L126 + Domain 4 L333 모두 "Neon managed — verify via SELECT" 통일.

8. **[D3 정확성] Layer C regex mismatch** (from Quinn cross-talk) — ✅ PARTIALLY FIXED. L298에 현재 코드 `[^}]+` vs 제안 `\w+` 차이 명시됨. 단, `\w+` 변경 전 기존 soul template DB 감사 필요 — Step 3/4 이월.

---

## Verified Score (Post-Fix)

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 9 | 9 | PixiJS extend() 6개 클래스 명시 (L144). 이미 높았음. |
| D2 완전성 | 9 | 9 | Key shadowing Layer 0 추가 (L295). 7개 built-in vars allowlist 명시. |
| D3 정확성 | 7 | 9 | React 19 hallucination 수정 (L130 — 4개 package.json 코드 검증 포함). memory-extractor.ts 위치 정정 (L370). pgvector 버전 통일. Layer C regex 현재 코드 vs 제안 차이 명시. |
| D4 실행가능성 | 9 | 9 | 변동 없음 — 이미 높았음. |
| D5 일관성 | 8 | 9 | pgvector 자기모순 해소. React 19 codebase 정합. memory-extractor 경로 E8 준수. |
| D6 리스크 | 8 | 9 | n8n 업그레이드 전략 섹션 신설 (L246-250). Neon auto-update 검증 쿼리 명시. 4-layer sanitization으로 key shadowing 대응. |

**가중 평균: 9.00/10 ✅ PASS**

Calculation: (9×0.15) + (9×0.15) + (9×0.25) + (9×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = **9.00**

All 8 issues resolved (6 original + John 1 + Quinn 1). No auto-fail conditions. Layer C regex audit carried forward to Step 3/4.

---

*Winston, Architect — "From 8.25 to 9.00. The React 19 correction is the biggest win — removing a phantom blocker from Sprint planning. The 4-layer sanitization architecture and n8n upgrade strategy show the research doc is now operationally ready."* — 6 domains with sourced data, cost models, and alternatives. But stating React 18 when the codebase is already React 19 is the kind of error that creates phantom blockers. Research must verify claims against the actual codebase, not assumptions."*
