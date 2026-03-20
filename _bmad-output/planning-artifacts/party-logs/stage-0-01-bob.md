## Critic-C Review (Bob, SM) — Step 01: Init

**Reviewed by:** Bob the Scrum Master
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 1–22)
**My weights:** D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%

---

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 8개 파일 경로 전부 명시됨. 그러나 각 문서의 역할/우선순위 미표기. 충돌 시 어느 문서가 authority인지 불명확. |
| D2 완전성 | 7/10 | 4개 init 요구사항 전부 충족 (stepsCompleted, inputDocuments, date, author, step comments). 단, Step 2~6 주석이 전부 동일한 형식의 placeholder — 각 스텝이 뭘 만들지 힌트 없음. |
| D3 정확성 | 9/10 | 8개 참조 파일 전부 실존 확인됨. Date 2026-03-20 정확. Author 올바름. |
| D4 실행가능성 | 7/10 | Init 단계로서 충분. 다음 스텝에 연결되는 주석 구조 명확. 구현 가이드 불필요한 단계. |
| D5 일관성 | 9/10 | 파일명 `product-brief-corthex-v3-2026-03-20.md` — v2 패턴 정확히 준수. YAML frontmatter 깔끔. |
| D6 리스크 | 5/10 | 리스크 언급 제로. v3는 PixiJS(번들 증가), n8n(Docker 메모리), Big Five(복잡한 상태), 에이전트 메모리(DB 스키마)를 추가하는데, VPS 제약(24GB/4-core)을 담은 v3-vps-prompt.md가 inputDocuments에 있음에도 어디서도 경고 없음. |

---

### 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 7 | 20% | 1.40 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 5 | 20% | 1.00 |
| **합계** | | **100%** | **7.10** |

### 최종 점수: **7.1/10 ✅ PASS (경계선)**

---

### 이슈 목록

**Issue 1 — [D6 리스크] VPS 제약 신호 없음 (Priority: HIGH)**
`v3-vps-prompt.md`가 inputDocuments에 포함되어 있지만, init 단계 어디에도 "이 파이프라인은 VPS 제약 내에서 범위를 설계해야 한다"는 신호가 없다. PixiJS 번들 크기, n8n Docker 메모리 footprint, 에이전트 메모리의 DB 부하 — 이 세 가지는 solo dev + AI가 v3를 설계할 때 **모든 Step에서** 인식해야 하는 제약이다. Init에 한 줄이라도 `<!-- CONSTRAINT: VPS 24GB/4-core — v3-vps-prompt.md 참고, 모든 Step은 리소스 영향을 명시할 것 -->`를 넣어야 했다.

**Issue 2 — [D1 구체성] 입력 문서 우선순위/역할 미표기 (Priority: MEDIUM)**
8개 inputDocuments가 나열되어 있지만 각 문서가 어떤 역할인지, 충돌 시 어떤 문서가 authority인지 알 수 없다. 예를 들어 `v3-openclaw-planning-brief.md`(새 기능 정의)와 `v1-feature-spec.md`(기존 기능 유지)가 충돌할 경우 어느 쪽이 우선인가? 이걸 init에서 명확히 해야 Step 2~5에서 analyst가 흔들리지 않는다. 최소한 각 파일 옆에 주석으로 `# scope authority`, `# constraint`, `# v1 baseline` 등의 역할 태그가 있었어야 한다.

---

### Bob's SM Comment

> "Barely passing, and I mean *barely*. D6 at 5/10 is my red flag — this is an init doc for a v3 that adds PixiJS, n8n Docker, and a full DB schema expansion, all on a 24GB VPS. If Step 2 (Vision) doesn't immediately acknowledge the resource envelope, we'll be scope-creeping into an undeliverable sprint by Step 5. The document checklist is technically complete, but it's not *smart complete*. Fix the constraint signal."

---

### Cross-talk 참고사항
- Sally (UX)의 관점에서 User 섹션 부재는 Step 1에서 예상된 것 — Step 3(Users)에서 다뤄질 예정.
- Winston (Architect)이 8개 파일의 기술 정합성을 별도 확인할 것으로 예상.
