# Critic-A Review — Stage 0, Step 01: Init (v3 Product Brief)

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 1–22)
**Cross-checked:** `architecture.md`, `v3-corthex-v2-audit.md`, `project-context.yaml` (Glob verified), `epics.md` (existence check), `v3-vps-prompt.md`

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 8개 파일 경로 전부 명시. date/author 정확. Init 단계이므로 내용 부재는 정상. |
| D2 완전성 | 7/10 | 핵심 참조 문서 포함. `epics.md` (v2 21개 epic 구조) 미포함 — v3 scope 경계 설정 시 필요. |
| D3 정확성 | 9/10 | 8개 파일 전부 존재 확인 (Glob 검증). `project-context.yaml`은 root-relative — 다른 파일과 prefix 스타일 불일치이나 경로 자체는 정확. |
| D4 실행가능성 | 7/10 | Init 기대치 충족. Step 2~6 "Pending"만으로는 다음 단계 준비 힌트 없음. |
| D5 일관성 | 8/10 | v2 brief YAML frontmatter 형식 정합. stepsCompleted 배열 형식 동일. |
| D6 리스크 | 5/10 | VPS 제약 (v3-vps-prompt.md: 4코어 ARM64 24GB) 관련 acknowledgment 없음. Bob(SM)과 동일 우려. Init에서 "이 brief는 VPS 리소스 제약 내 구현 가능해야 한다"는 명시가 없으면 이후 steps에서 VPS constraint check가 누락될 수 있음. |

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

### 🟠 Issue 1 — [D6 리스크] VPS 제약 Acknowledgment 없음

**위치:** frontmatter 전체 — 제약 조건 명시 없음

**Winston:** "`v3-vps-prompt.md`가 input 목록에 포함됐지만 init 단계에서 이 문서가 왜 있는지 맥락이 없다. 4코어 ARM64 24GB VPS라는 제약은 v3 4대 기능 모두에 영향을 준다 — PixiJS 8 번들(~200KB gzip), n8n Docker(1~2GB RAM), pgvector HNSW 인덱스, WebSocket /ws/office 채널. Init에 `constraints: [VPS 4코어 24GB ARM64]` 같은 항목 하나만 있어도 이후 각 step 작성자가 VPS 기준을 인식하고 설계한다. 지금은 없다."

**Fix 필요:** frontmatter에 `constraints: ["Oracle VPS 4코어 ARM64 24GB — v3-vps-prompt.md 기준"]` 추가. Bob(SM)도 동일 지적.

---

### 🟡 Issue 2 — [D2 완전성] epics.md 미포함

**위치:** frontmatter `inputDocuments` (8개 파일 목록)

**Winston:** "v2는 21개 epic, 98개 story로 구성됐다. v3 scope 설정 시 '기존 epic에 추가되는 것인가 vs 신규 epic인가'를 구분해야 한다. `v3-corthex-v2-audit.md`가 있지만 audit은 숫자(485 API, 71 pages)를 주지 epic별 기능 경계를 주지 않는다. epics.md 없이 brief를 쓰면 v2 기능을 중복 정의하거나 범위를 잘못 잡을 수 있다."

**Fix 필요:** inputDocuments에 `_bmad-output/planning-artifacts/epics.md` 추가.

---

## Cross-talk 요약

- **Bob(SM)**: D6 VPS 우려 완전 동의. `v3-vps-prompt.md`가 input에 있는 이상 constraints 명시 없으면 의미 없음.
- **Sally(UX)**: Step 2~6에서 `/office` PixiJS UX 설계 시 VPS 번들 제약 기준 필요 — constraints 추가 후 설계 시작 권장.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **7.60/10 ✅ PASS** |
| **Priority Fix 🟠** | Issue 1: frontmatter에 VPS constraints 명시 |
| **Quick Fix 🟡** | Issue 2: epics.md inputDocuments 추가 |

Init 구조 건전. 2개 이슈 수정 후 Step 2 진행 권장.
