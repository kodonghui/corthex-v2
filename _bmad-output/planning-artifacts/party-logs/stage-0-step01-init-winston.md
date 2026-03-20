# Critic-A Review — Stage 0, Step 01: Init

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 1–22)
**Cross-checked:** `architecture.md`, `v3-corthex-v2-audit.md`, `project-context.yaml`, `prd.md` (frontmatter), `epics.md` (existence check)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 8개 파일 경로 전부 명시. date/author 정확. Init 단계이므로 내용 부재는 정상. |
| D2 완전성 | 7/10 | 핵심 참조 문서 포함. `epics.md` (v2 21개 epic 구조) 미포함 — v3 scope 설정 시 v2 기능 경계 파악에 필요. |
| D3 정확성 | 9/10 | 8개 파일 전부 존재 확인 (Glob 검증). `project-context.yaml`은 root-relative 경로 — 다른 파일과 prefix 스타일 불일치이나 실제 경로는 정확. |
| D4 실행가능성 | 7/10 | Init 단계 기대치 충족. Step 2~6에 예상 내용 힌트 없음 — "Vision: Pending" 만으로는 analyst가 다음 단계 준비 불가. |
| D5 일관성 | 8/10 | v2 brief (product-brief-corthex-v2-2026-03-06.md) YAML frontmatter 형식 정합. stepsCompleted 배열 형식 동일. |
| D6 리스크 | 5/10 | `prd.md`가 stage-0 FAIL(4.8/10) 상태로 input 포함. 7개 이슈 수정 완료 여부 미확인. 미수정 PRD를 참조하면 brief가 동일 오류(agent-loop.ts 모순, NFR-SC7 4GB 오류)를 계승할 리스크. |

### 가중 평균: **7.60/10 ✅ PASS**

- D1: 8 × 0.15 = 1.20
- D2: 7 × 0.15 = 1.05
- D3: 9 × 0.25 = 2.25
- D4: 7 × 0.20 = 1.40
- D5: 8 × 0.15 = 1.20
- D6: 5 × 0.10 = 0.50
- **합계: 7.60/10**

---

## 이슈 목록

### 🟠 Issue 1 — [D6 리스크] prd.md FAIL 상태 input 참조

**위치:** frontmatter `inputDocuments` → `_bmad-output/planning-artifacts/prd.md`

**Winston:** "이 init이 참조하는 prd.md는 내가 stage-0에서 4.8/10 FAIL 판정을 내렸다. agent-loop.ts 아키텍처 모순(FR-MEM6/FR-PERS3)과 NFR-SC7 4GB 오류, n8n 보안 누락 등 7개 이슈를 발견했다. 이 수정이 prd.md에 반영됐는지 확인하지 않고 product brief를 작성하면, analyst가 잘못된 PRD를 읽으면서 같은 오류를 brief에 옮길 수 있다. init 전에 '[Fixes Applied] from stage-0' 확인 절차가 있어야 한다."

**Fix 필요:** Analyst에게: stage-0 7개 이슈가 prd.md에 반영됐는지 확인 후 brief 작성 시작. 미반영 시 prd.md를 input에서 제외하거나 `prd.md (stage-0 fixes pending)` 주석 추가.

---

### 🟡 Issue 2 — [D2 완전성] epics.md 미포함

**위치:** frontmatter `inputDocuments` (8개 파일 목록)

**Winston:** "v2는 21개 epic, 98개 story, 10,154 테스트로 구성됐다. v3 OpenClaw scope를 잡으려면 v2가 어디서 끝나고 v3가 어디서 시작하는지 경계가 명확해야 한다. `epics.md`가 input에 없으면 analyst가 v2 epic 범위를 v3-corthex-v2-audit.md로만 판단하게 된다 — audit은 숫자(485 API, 71 pages)는 있지만 epic별 기능 목록은 없다. v3 'what's new vs what's carried over' 구분이 흐려진다."

**Fix 필요:** inputDocuments에 `_bmad-output/planning-artifacts/epics.md` 추가.

---

## Cross-talk 요약 (Sally에게)

- **Issue 1 (prd.md FAIL 참조)**: UX 설계 시 FR-PERS3(personality), FR-OC7(office realtime) 등 모순된 요구사항이 그대로 들어올 수 있음. Sally가 Vision/Users 단계에서 personality 기능 UX를 설계하기 전에 prd.md fix 여부 확인 필요.
- **Issue 2 (epics.md 누락)**: v2 Hub/Library/Trading 등 페이지별 UX가 epics에 정의됨. v3 신규 /office 페이지와 기존 페이지 간 UX 연속성 파악에 epics.md 필요.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **7.60/10 ✅ PASS** |
| **Priority Fix 🟠** | Issue 1: prd.md stage-0 fixes 반영 여부 확인 |
| **Quick Fix 🟡** | Issue 2: epics.md input 추가 |

Init 구조 자체는 건전하다. 2개 이슈 수정 후 Step 2 진행 권장.
