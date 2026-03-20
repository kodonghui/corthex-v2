# Sally (UX Designer) Review — Step 01: Init

**Reviewer:** Sally | UX Designer
**Step:** 01 — Document Initialization
**File:** `_bmad-output/planning-artifacts/product-brief-corthex-v3-2026-03-20.md` (lines 1–22)
**Date:** 2026-03-20

---

## In Character Review

*Imagine you're an architect handed a blueprint with only the title page filled in. The structure looks tidy — right project name, right date, the right names on the cover. But flip past the cover and you find only four placeholder comments where the rooms should be. That's this init. Structurally sound for what it is, but with two quiet omissions that will haunt us later.*

*As someone who spends her days thinking about the humans who will use CORTHEX v3 — the frustrated team lead who wants to assign a task to an AI agent that "just gets it", the curious new hire stepping into an OpenClaw virtual office for the first time — I need the input materials to paint that picture. And right now, the ingredient list is missing a key flavor: our hard-won UX redesign lessons.*

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 8개 파일 경로 전부 명시, 날짜·작성자 정확. 그러나 step 목록이 4개만 노출 — 전체 파이프라인 범위 불명확. |
| D2 완전성 | 6/10 | 핵심 input 누락: `_corthex_full_redesign/phase-6-generated/web/` (CLAUDE.md: "Stitch HTML = 디자인 기준"). v3 UX 재설계에 이 artifacts가 없으면 브리프가 맹목적으로 작성됨. |
| D3 정확성 | 8/10 | 참조된 파일들 (prd.md, architecture.md, v1-feature-spec.md, critic-rubric.md)은 실존 확인. v3-vps-prompt.md, v3-corthex-v2-audit.md 검증 필요하나 plausible. |
| D4 실행가능성 | 7/10 | Init 단계로서 구조는 충분. Step 1~4 comments가 scaffold 역할. 그러나 전체 step 수가 4개로 끝나는지 불명확 — 브리프 완성 범위가 모호. |
| D5 일관성 | 8/10 | BMAD 컨벤션 준수. author "CEO (사장님) + Mary (Analyst)" 형식 일치. date 2026-03-20 정확. |
| D6 리스크 인식 | 5/10 | Init이라도 known risk placeholder 0개. PixiJS 학습 곡선, n8n 통합 복잡도, 428-color-mix 재발 위험 — 이미 알고 있는 리스크들이 input 문서에조차 미반영. |

### 가중 평균 계산 (Sally 가중치: D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 7 | 15% | 1.05 |
| D2 | 6 | 20% | 1.20 |
| D3 | 8 | 15% | 1.20 |
| D4 | 7 | 15% | 1.05 |
| D5 | 8 | 15% | 1.20 |
| D6 | 5 | 20% | 1.00 |

### **가중 평균: 6.7/10 ❌ FAIL (7.0 미만)**

---

## 이슈 목록

### Issue 1 — [D2 완전성] UX 재설계 artifacts가 inputDocuments에 없음 ⚠️ **HIGH**

CLAUDE.md는 명시적으로 선언한다: *"Stitch MCP가 생성한 HTML = 디자인 기준 (`_corthex_full_redesign/phase-6-generated/web/`)"*. v3는 완전한 테마 재설계를 포함하는데, 이 기준 자료가 inputDocuments에 없으면 브리프 작성자가 현재 디자인 방향을 모른 채 UX 섹션을 쓰게 된다.

**필요한 추가 항목:**
```yaml
  - _corthex_full_redesign/phase-6-generated/web/  # Stitch HTML = 디자인 기준
  - _corthex_full_redesign/phase-6-prompts/        # Natural Organic + Minimal Warm 테마 맥락
```

### Issue 2 — [D6 리스크] Known risk들이 init에서 완전 무시됨 ⚠️ **MEDIUM**

v3가 도입하는 기술들 (PixiJS 가상오피스, n8n 워크플로우, 에이전트 Big Five 성격, 에이전트 메모리)은 이미 알려진 복잡도를 가진다. UXUI 측면에서는 428-color-mix 사건 (다크모드 전용으로 전환한 이유)을 신규 팀원/AI가 브리프를 읽을 때 맥락으로 이해해야 한다. 이 맥락이 input doc에 없으면 UX 결정의 "왜"를 알 수 없다.

**필요한 추가 항목:**
```yaml
  - _bmad-output/planning-artifacts/v2-lessons-learned.md  # 428-color-mix 사건 등
```
*(또는 해당 맥락을 Step 1 comment에 inline으로 참조)*

### Issue 3 — [D1 구체성] Step 범위가 4개에서 잘려 있음 ⚠️ **LOW**

Step 2~4 (Vision, Users, Metrics) 이후의 steps이 보이지 않는다. 전체 브리프가 몇 개 steps으로 구성될지 init 단계에서 선언되어야 범위와 완성 기준이 명확해진다. 예: `<!-- Step 5 (Features): Pending -->` 등이 init에 포함되어야 한다.

---

## Cross-talk 요약 (업데이트)

### John (PM) 발견 → 동의
- `critic-rubric.md`가 inputDocuments에 포함 — 채점 메타도구를 기획 입력물로 오등록. LLM이 D1-D6 차원을 제품 요구사항으로 오독 가능. **내가 놓친 이슈. 유효함.**
- `stepsPlanned` 필드 없음 — 내 Issue 3 (Step 범위 미기재)와 동일선상.
- ux-design-specification.md 미포함은 Step 3 이후에 다루므로 init 단계 블로커 아님 — 동의.

### Winston (Architect) 발견 → D3 점수 하향
- **prd.md가 이전 stage-0에서 4.8/10 FAIL** 판정 — agent-loop.ts 모순(FR-MEM6/FR-PERS3), NFR-SC7 4GB 오류 등 7개 이슈 미수정 가능.
- 깨진 prd.md를 input으로 참조하면 이후 Vision/UX 단계에서 모순된 FR을 기준으로 설계하게 됨.
- **D3 점수 8→6으로 하향 조정** (가중 평균 6.7→약 6.4로 하락)
- epics.md 누락 — /office 신규 페이지와 기존 Hub/Library/Trading UX 연속성 필요. 동의.

### Bob (SM) 발견 → 보완
- VPS 제약 신호 없음 (D6) — 내 Issue 2와 동일.
- input 문서에 역할 주석 없음 (D1) — 충돌 시 우선순위 불명확. 유효한 추가 이슈.

---

## 최종 확정 점수 (Cross-talk 완료 후)

| 차원 | 점수 | 변경 이력 | 이유 |
|------|------|-----------|------|
| D1 구체성 | 7 | 유지 | 경로 명시적, 단 input 역할 주석 없음 |
| D2 완전성 | 6 | 유지 | `_corthex_full_redesign/` 누락 + `critic-rubric.md` 오등록 + `epics.md` 없음 |
| D3 정확성 | 8 | **6→8 복원** | Winston glob 검증: 8개 파일 전부 실재. prd.md 내용 신뢰도는 D6 영역 |
| D4 실행가능성 | 7 | 유지 | Init 범위 내 충분 |
| D5 일관성 | 8 | 유지 | BMAD 컨벤션 준수 |
| D6 리스크 | 5 | 유지 | prd.md FAIL 상태 참조 리스크 + PixiJS/n8n 위험 미기재 |

### **최종 가중 평균: 6.7/10 ❌ FAIL**

(D1: 7×0.15=1.05, D2: 6×0.20=1.20, D3: 8×0.15=1.20, D4: 7×0.15=1.05, D5: 8×0.15=1.20, D6: 5×0.20=1.00 → 합계 6.70)

### Issue 3 — Step 범위 [철회]

John 확인: 파일에 steps 1–6 전부 존재 (Sally가 lines 1-22만 읽어 4개만 목격). 해소된 이슈.
