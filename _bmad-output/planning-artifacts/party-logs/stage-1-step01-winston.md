# Critic-A (Architecture) Review — Step 1: Technical Research Scope Confirmation

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/technical-research-2026-03-20.md`

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | VPS specs exact (24GB, 4-core Neoverse-N1), file paths named (soul-renderer.ts, memory-reflection.ts, agent-loop.ts), API/table counts cited (485/86). Version specs use "x" suffix (PixiJS 8.x, n8n 1.x, pgvector 0.7+) — acceptable for research init but should pin exact versions in Step 2. |
| D2 완전성 | 7/10 | All 6 domains covered. Sprint mapping correct. Steps 2-6 outline covers expected content. **Missing**: (1) Pre-Sprint Phase 0 not listed as a separate concern/domain — it's folded into Domain 6 (UXUI) but the Brief makes it a distinct blocker with its own gating. (2) Sprint 3 blocker condition (Tier cost limit) not mentioned in scope confirmation. (3) Go/No-Go #8 (asset quality) acknowledged only in Step 6 outline, not in scope constraints. |
| D3 정확성 | 8/10 | Sprint ordering (L3→L2→L4→L1) matches Brief §4 ✅. VPS constraints match Brief header comments ✅. inputDocuments all exist and roles are correct ✅. Brief section references (§4 Layer 1-4) correct ✅. **One issue**: Domain 6 is named "Subframe + Stitch UXUI" — **Stitch is deprecated** (Phase 6 Stitch 폐기, per MEMORY.md). The Brief §1 says "Subframe(메인) + `/kdh-uxui-redesign-full-auto-pipeline Phase 0`" with no mention of Stitch. This is a factual inaccuracy. |
| D4 실행가능성 | 7/10 | For Step 1 (init), the document provides clear structure for subsequent steps. Research methodology with confidence framework (HIGH/MEDIUM/LOW) is well-defined. Steps 2-6 outline shows logical progression. No code snippets expected at this stage. |
| D5 일관성 | 8/10 | Sprint order matches Brief and Stage 0 snapshot ✅. memory-reflection.ts separation referenced ✅. observations as raw INPUT mentioned ✅. E8 boundary compliance mentioned ✅. Go/No-Go 8 gates referenced in Step 6 ✅. **One inconsistency**: Stitch reference (see D3). |
| D6 리스크 인식 | 6/10 | VPS hard limits listed ✅. Bundle constraint noted ✅. Confidence framework defined ✅. **Missing**: (1) No mention of Sprint 3 blocker (Tier cost limit — from Stage 0 snapshot). (2) No mention of Pre-Sprint Phase 0 as blocker for Sprint 1 (theme decision must precede all UI work). (3) No explicit risk acknowledgment for ARM64 PixiJS/n8n compatibility — these are the key research questions. (4) Go/No-Go #2 (extraVars empty string validation) not flagged as a research concern despite Winston's own Stage 0 carry-forward note. |

### 가중 평균: 7.45/10 ✅ PASS

Calculation: (8×0.15) + (7×0.15) + (8×0.25) + (7×0.20) + (8×0.15) + (6×0.10) = 1.20 + 1.05 + 2.00 + 1.40 + 1.20 + 0.60 = **7.45**

---

## 이슈 목록

1. **[D3 정확성] Stitch 참조 오류** — Domain 6 "Subframe + Stitch UXUI"에서 Stitch 언급. Stitch는 Phase 6에서 폐기됨. Brief에도 Stitch 미언급. → "Subframe + UXUI Redesign Pipeline"으로 수정 필요.

2. **[D6 리스크] Sprint 3 블로커 누락** — Stage 0 Step 05에서 확정된 "PRD Tier 비용 한도 미확정 시 Sprint 3 착수 불가" 조건이 scope confirmation에 없음. Research scope에서 이 블로커를 인식하고 Layer 4 연구 시 비용 모델을 포함해야 함.

3. **[D6 리스크] Pre-Sprint Phase 0 블로커 누락** — Brief §4에서 "디자인 토큰 확정 = Sprint 1 착수 선행 조건. 미확정 시 전 Sprint UI 재작업 리스크"로 명시. Scope confirmation의 VPS Hard Limits에 이 의존성이 빠져 있음.

4. **[D2 완전성] Go/No-Go #2 carry-forward 미반영** — Stage 0 snapshot에서 Winston이 이월한 "extraVars 주입 여부 별도 검증 기준 추가 권장" 사항이 연구 범위에 포함되지 않음. soul-renderer.ts extraVars 아키텍처 연구 시 빈 문자열 fallback 검증 패턴도 다뤄야 함.

5. **[D1 구체성] 버전 핀닝 미흡** — "PixiJS 8.x", "n8n 1.x", "pgvector 0.7+"은 init 단계에서 수용 가능하나, Step 2에서 반드시 정확한 버전으로 핀닝할 것. 특히 PixiJS 8의 ARM64 WebGL 지원은 마이너 버전에 따라 다를 수 있음.

---

## Cross-talk 요청

- **Quinn**: Domain 6 Stitch 참조 오류에 대한 QA 관점 의견 요청. 또한 Go/No-Go #2 빈 문자열 검증이 연구 범위에 빠진 것에 대한 보안/QA 관점.
- **John**: Pre-Sprint Phase 0 블로커가 scope에 명시되지 않은 것의 delivery 리스크. Sprint 3 Tier 비용 한도 블로커 누락의 프로젝트 관리 관점.

---

## Cross-talk Additions (post-review)

6. **[D3 정확성] pgvector 버전 혼동** (from John cross-talk, Winston verified) — "pgvector 0.7+"는 PostgreSQL extension 버전을 의미하나, 실제 npm 패키지는 `pgvector ^0.2.1` (packages/server/package.json:37). Migration `0049_pgvector-extension.sql`은 `CREATE EXTENSION IF NOT EXISTS vector`로 버전 미지정. Step 2에서 npm 패키지 버전과 Neon PostgreSQL extension 버전을 분리 명시 필요.

7. **[D2 완전성] Go/No-Go → 연구 도메인 매핑 테이블 누락** (from John cross-talk) — Step 6에서 8개 Go/No-Go matrix를 산출한다고 하지만, Step 1에서 각 게이트가 어떤 도메인에서 데이터를 수집하는지 매핑이 없음. Steps 2-5에서 수집 누락이 발생할 수 있음. 매핑 제안:
   - #1 Zero Regression → N/A (existing)
   - #2 Big Five inject → Domain 3
   - #3 n8n security → Domain 2
   - #4 Memory zero regression → Domain 4
   - #5 PixiJS bundle → Domain 1
   - #6 UXUI Layer 0 → Domain 6
   - #7 Reflection cost → Domain 4
   - #8 Asset quality → Domain 5

8. **[D6 리스크] extraVars prompt injection 경로** (from Quinn cross-talk, Winston code-verified) — `soul-renderer.ts:41`에서 `...extraVars` 무검증 spread, `:45`에서 regex로 soul template에 직접 삽입. `personality_traits` JSONB에 문자열 주입 시 시스템 프롬프트 조작 가능. Domain 3 연구에서 3-layer sanitization 아키텍처 포함 필수: (1) API Zod `z.number().min(0).max(1)`, (2) renderSoul() extraVars 값 sanitize (newline strip, max length, non-printable reject), (3) template `{{`/`}}` 이스케이프. **Rubric 자동 불합격 조건 #2 (보안 구멍) 해당 가능성 — 구현 단계에서 미대응 시.**

9. **[D6 리스크] n8n Docker ARM64 호환성 미플래그** (from Quinn cross-talk) — n8n은 `linux/arm64` 멀티아치 이미지 제공하나, 24GB VPS에서 n8n 최소 2GB + Bun + PostgreSQL + CI runner 동시 운영 시 리소스 경합 리스크. 또한 community nodes의 x86-only native deps 가능성. Domain 2 연구 최우선 검증 항목.

### Verified Score (Post-Fix)

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 8 | 9 | pgvector npm ^0.2.1 / PG extension TBD 분리 명시. Step 2에 exact minor version pinning 명시. VPS co-residence 서비스 목록 추가. |
| D2 완전성 | 7 | 9 | Go/No-Go 8개 → 도메인 매핑 테이블 추가. Go/No-Go #2 carry-forward (빈 문자열 검증) 반영. Sprint Blockers 섹션 신설 (Phase 0, Sprint 3, Sprint 4). Research Goal #5 추가 (per-domain resource intensity). |
| D3 정확성 | 8 | 9 | Stitch → "UXUI Redesign Pipeline" 수정. pgvector 이중 버전 분리. Known Risks 9개 전부 출처 명확 (Brief/Stage 0/Code). |
| D4 실행가능성 | 7 | 8 | Step 4 outline에 extraVars sanitization + Reflection 비용 모델 + `|| ''` fallback 대응 구체 항목 추가. Step 5에 AI sprite reproducibility 패턴 추가. |
| D5 일관성 | 8 | 9 | Brief §4와 100% 정합. Stage 0 snapshot 결정사항 전부 반영. Domain 6 네이밍 Brief와 일치. |
| D6 리스크 | 6 | 9 | Known Risks R1-R9 테이블 + 검증 방법 명시. Sprint Blockers 3개 명시. extraVars prompt injection 경로 식별 (R7). n8n ARM64 호환성 (R6). AI sprite 재현 불가능성 (R8). soul-renderer fallback silent failure (R9). |

**가중 평균: 8.90/10 ✅ PASS**

Calculation: (9×0.15) + (9×0.15) + (9×0.25) + (8×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 1.60 + 1.35 + 0.90 = **8.80**

All 9 issues resolved. No auto-fail conditions. No remaining blockers for Step 2.

---

*Winston, Architect — "From 7.45 to 8.80. The scope now has teeth — 9 known risks with verification methods, 3 sprint blockers explicitly gated, and the Go/No-Go matrix pre-mapped to research domains. Step 2 can now collect evidence with purpose."*
