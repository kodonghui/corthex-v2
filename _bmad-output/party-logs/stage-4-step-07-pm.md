# Stage 4 Step 7 — PM (Critic-C, Product + Delivery) Review

**Reviewer:** PM (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` L2732-2961 — v3 Architecture Validation Results
**Focus:** Coherence accuracy, Requirements Coverage (53 FR + NFR + 14 Go/No-Go), Gap Analysis completeness, Readiness Assessment

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 20% | Coherence matrix 9행 = 결정 쌍별 호환 근거 명시 ("observations는 engine/ 외부에서 생성", "n8n SQLite 내부 DB 사용. CORTHEX PG 접근 금지"). Pattern consistency 6행도 구체적. Go/No-Go 14행에 검증 방법(테스트 파일명) 명시. Process statistics R2 avg 포함. Implementation handoff 5-Sprint 순서 + engine 수정 2건 한정. **BUT**: NFR-P14/P16/P17 설명이 PRD NFR ID와 불일치(하단 이슈). Go/No-Go #13 "NFR-O11" 참조 — NFR-O11은 PRD에 없음. |
| D2 완전성 | 8/10 | 20% | Decision compatibility 9쌍 ✅. Pattern consistency 6쌍 ✅. 53/53 FR 커버리지 테이블 ✅. NFR 18행 매핑 ✅. Go/No-Go 14/14 ✅. Gap analysis 0 critical + 2 important + 3 nice-to-have ✅. Completeness checklist Steps 2-7 ✅. Readiness assessment + handoff ✅. **잔여 gap**: E20 rate limit 60 vs PRD L1779 100req/min 불일치가 Gap Analysis에서 누락(PRD 내부 모순이나, 검증 문서에서 언급 필요). PRD NFR-P14 "/ws/office 상태동기화 ≤2초"가 NFR 테이블에 미매핑(E16이 암묵적으로 커버하나 명시 없음). |
| D3 정확성 | 7/10 | 15% | Coherence matrix 전부 정확 ✅. Pattern consistency 전부 정확 ✅. 53/53 FR 커버리지 정확 ✅. **NFR 번호-설명 불일치 3건** (상세 아래): (1) NFR-P14=Reflection이라 기재했으나 PRD NFR-P14=/ws/office 상태동기화 ≤2초, (2) NFR-P16=MKT 이미지≤2분이라 기재했으나 PRD NFR-P16=Reflection 크론 ≤30초, (3) NFR-P17=MKT 영상≤10분이라 기재했으나 PRD NFR-P17=MKT 워크플로우 E2E(이미지+영상+게시). **Go/No-Go #2**: "PER-1 adversarial"이라 기재했으나 PRD #2="renderSoul() extraVars 주입 검증"(기능 검증). **Go/No-Go #6**: PRD="ESLint + Playwright dead button 0"이나 아키텍처="ESLint 규칙"만(Playwright 누락). 반면: Go/No-Go 나머지 12개 정확 ✅, NFR 나머지 15개 정확 ✅. |
| D4 실행가능성 | 8/10 | 15% | Implementation handoff = Sprint 순서 + engine 수정 범위(E15, E16만) 즉시 활용 가능. Completeness checklist = Steps 2-7 체크리스트로 누락 확인 용이. Gap analysis = 해소 시점(Sprint 착수, Story 작성) 명시. "Areas for Future Enhancement" = Phase 4+ 로드맵 제공. AI Agent Guidelines = v2 결정 수정 금지 규칙 명확. |
| D5 일관성 | 7/10 | 10% | Step 5/6 R2 피드백 전부 반영 ✅. E22 6그룹 PRD 차이 = G1으로 일관되게 carry-forward ✅. confirmed-decisions-stage1.md 12항목 반영 확인 ✅. **불일치 2건**: (1) NFR-P14/P16/P17 번호가 PRD와 교차(Step 6 FR-PERS/FR-N8N 매핑 이슈와 동일 패턴), (2) Go/No-Go #2 설명이 PRD 원문과 상이. |
| D6 리스크 | 7/10 | 20% | Gap analysis 구조 우수: critical 0 + important 2 + nice-to-have 3. G1(E22) + G2(E15 label) 적절히 식별 ✅. "Areas for Future Enhancement" Redis/cross-provider/n8n HA 식별 ✅. **미식별 리스크 2건**: (1) E20 rate limit PRD 내부 모순(L1779=100 vs NFR-S9=60) — 구현 시 어떤 기준을 따를지 혼선 가능. Gap Analysis에 기재 필요. (2) NFR-P14 "/ws/office ≤2초" 미매핑 = Sprint 4 성능 검증 기준 누락 가능. |

## 가중 평균: 7.55/10 ✅ PASS

**계산:** (8×0.20) + (8×0.20) + (7×0.15) + (8×0.15) + (7×0.10) + (7×0.20) = 1.60 + 1.60 + 1.05 + 1.20 + 0.70 + 1.40 = **7.55**

---

## 이슈 목록

### 🟡 Must Fix (1건)

#### 1. [D3] NFR-P14/P16/P17 번호-설명 교차 (Step 6 FR 매핑과 동일 패턴)

**위치:** L2800-2804 (NFR 테이블)

**현재 매핑 vs PRD 실제 정의:**

| 아키텍처 기재 | PRD 실제 정의 | 판정 |
|-------------|-------------|------|
| NFR-P14 Reflection ≤30초/에이전트 → E14 | **NFR-P14 = /ws/office 상태동기화 ≤2초** (L2520) | ❌ PRD NFR-P16 내용 |
| NFR-P15 WS heartbeat 5초 → E16 | NFR-P15 = /ws/office heartbeat | ✅ |
| NFR-P16 MKT 이미지≤2분 → E20b | **NFR-P16 = Reflection 크론 ≤30초** (L2522) | ❌ PRD NFR-P17 내용 |
| NFR-P17 MKT 영상≤10분 → E20b | **NFR-P17 = MKT 워크플로우 E2E** (이미지≤2분 + 영상≤10분 + 게시≤30초) (L2523) | ⚠️ 부분만 — 게시≤30초 누락 |

**문제:** NFR-P14의 실제 요구사항("/ws/office 상태동기화 ≤2초")이 NFR 매핑에서 완전 누락. E16 adaptive polling이 암묵적으로 커버하나 명시적 매핑 없음.

**권고 수정:**

```
| Performance | NFR-P14 /ws/office 상태동기화 ≤2초  | E16 adaptive polling + /ws/office 이벤트 브로드캐스트 |
| Performance | NFR-P15 WS heartbeat                | E16 adaptive polling 500ms + heartbeat |
| Performance | NFR-P16 Reflection ≤30초/에이전트    | E14 크론 03:00 + company hash stagger + Haiku API |
| Performance | NFR-P17 MKT E2E (이미지≤2분, 영상≤10분, 게시≤30초) | E20b 타임아웃 정책 + fallback |
```

---

### 🟡 Should Fix (2건)

#### 2. [D6] E20 rate limit PRD 내부 모순 — Gap Analysis 미기재

**위치:** Gap Analysis (L2860-2877)

PRD 내부 모순 존재:
- **L1779**: "Hono proxy rate limit **100** req/min"
- **NFR-S9** (L2537): "API rate limit **60**/min(SEC-8)"

아키텍처 E20은 NFR-S9 기준 60req/min을 따름 — 이 자체는 합리적. 그러나 Gap Analysis에서 이 PRD 내부 불일치를 기재하지 않음.

**권고:** Gap Analysis Important 또는 Nice-to-Have에 추가:
```
| G3 | PRD rate limit 불일치 (L1779=100 vs NFR-S9=60) | 구현 시 혼선 방지 위해 PRD 통일 필요 | Story 작성 시 |
```

#### 3. [D3/D5] Go/No-Go #2 — PRD 원문과 설명 상이

**위치:** L2826

| 아키텍처 기재 | PRD 실제 정의 (L457) |
|-------------|-------------------|
| PER-1 adversarial, E12 4-layer, per-1-adversarial.test.ts | renderSoul() extraVars 주입 검증 — 빈 문자열 = FAIL |

PRD #2는 **기능 검증**(extraVars가 Soul에 주입되는지)이 핵심. PER-1 adversarial은 보안 측면만 커버.

**권고:** "PER-1 adversarial + renderSoul extraVars 주입 검증" 병기. 테스트도 "extraVars-injection.test.ts + per-1-adversarial.test.ts" 2종 명시.

---

### 🟢 Nice to Have (3건)

#### 4. Go/No-Go #6 — Playwright dead button 누락

L2830: "E21 ESLint → ESLint 규칙"
PRD L461: "ESLint 하드코딩 색상 0 + **Playwright dead button 0**"

Playwright E2E 검증이 아키텍처 지원에서 빠짐. 실질적으로 Layer 0 UXUI 테스트에서 자연스럽게 포함되므로 심각도 낮음.

#### 5. Go/No-Go #13 — NFR-O11 참조 오류

L2837: "NFR-O11"
PRD에 NFR-O11은 없음 (NFR-O8까지 v2, NFR-O9~O10이 v3). "사용성 테스트" 자체는 정확하나 NFR 참조가 잘못됨.

#### 6. NFR-P17 "게시≤30초" 누락

아키텍처 NFR-P17에서 MKT 영상≤10분만 기재. PRD NFR-P17은 "이미지≤2분 + 영상≤10분 + **게시≤30초**" 3요소.

---

## 긍정적 평가

1. **Coherence Matrix 9행** — D22~D34 + D1~D21 교차 검증이 체계적. 각 행에 호환 근거가 구체적이며, "충돌 0건" 결론이 신뢰할 수 있음
2. **53/53 FR 검증 상세** — 7개 Area별 아키텍처 참조(Decision + Pattern + 파일)가 명확. R2 수정 이력(FR-PERS, FR-N8N, FR-MKT) 언급으로 추적 가능
3. **Pattern Consistency 6행** — E11~E22와 E1~E10 교차 검증이 핵심 충돌 가능 지점(soul-enricher↔soul-renderer, tool-sanitizer↔Hook, ws/office↔SSE)을 정확히 짚음
4. **Implementation Handoff** — AI Agent Guidelines 4조항이 구현 에이전트가 v2 결정을 실수로 수정하는 것을 방지. Sprint 순서 5단계 + Layer 0 병행 전략이 명확
5. **Completeness Checklist** — Steps 2-7 체크박스로 "무엇이 완료되었는지" 일목요연. 프로세스 통계(34 결정, 23 패턴, 14 게이트)가 전체 아키텍처 규모를 한눈에 파악 가능
6. **Gap Analysis 구조** — Critical/Important/Nice-to-Have 3단계 분류가 우선순위 판단 용이. G1(E22) deferred 취지와 G2(E15) 구현 무영향 판단이 합리적

---

## Cross-talk 참조

- Step 5 E22 6그룹 PRD 차이 → G1으로 carry-forward ✅
- Step 5 E20 rate limit 60 vs 100 → Gap Analysis에서 **미기재** (이슈 #2)
- Step 5 NFR-P14 label → NFR 매핑에서 번호 교차 발생 (이슈 #1)
- Step 6 FR-PERS/FR-N8N 매핑 R2 수정 → FR 검증 상세에서 "R2 수정 완료" 확인 ✅
- Step 6 observations.ts 트리 누락 → Structure Alignment에서 "R2에서 해소" 확인 ✅

---

## 요약

Step 7 Validation Results는 v3 아키텍처의 종합 검증으로서 우수한 구조를 갖추고 있습니다. Coherence matrix 9행, 53/53 FR 커버리지, 14/14 Go/No-Go 매핑, Gap Analysis 3단계 분류가 체계적입니다.

**주요 이슈**: NFR-P14/P16/P17 번호-설명 교차는 Step 6의 FR 매핑 이슈와 동일한 패턴입니다. NFR 번호가 PRD와 다르면 Sprint별 성능 검증 시 잘못된 기준을 적용할 위험이 있습니다. 특히 NFR-P14 "/ws/office 상태동기화 ≤2초"가 완전 누락되어 Sprint 4 성능 게이트에서 이 기준이 빠질 수 있습니다.

E20 rate limit PRD 내부 모순(L1779=100 vs NFR-S9=60)이 Gap Analysis에서 언급되지 않은 점도 구현 시 혼선 가능성이 있으므로 기재 권장합니다.

**7.55/10 ✅ PASS** — 🟡 #1 교정 권고.
