# Critic-UX (Sally) Review — Stage 2 Step 5: Success Criteria

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 471–644 (## Success Criteria)
> Cross-refs: Brief §4, confirmed-decisions-stage1.md, Step 4 Go/No-Go (14 gates), Steps 2-4 fixes
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | v2 베이스라인 10개 기준 모두 측정 지표+목표+딜라이트 모먼트 포함. v3 8개도 Sprint 정렬+구체적 수치. 실패 트리거에 판단 시점+대응 전략. |
| D2 완전성 | 6/10 | **(1)** v3 기술 기준 테이블(L581-594)에 14개 게이트 중 8개만 존재 — #9-#14 누락. **(2)** Go/No-Go #13(사용성 검증) User Success 테이블에 대응 행 없음. **(3)** Pre-Sprint 마일스톤(L522) Voyage AI 누락 (Step 4 Fix 반영 안 됨). **(4)** UX 레벨 실패 트리거 전무 — 온보딩 혼란, 네비게이션 발견 불가, 슬라이더 이해 실패 등. |
| D3 정확성 | 6/10 | **(1)** L585 게이트 #6 = "tokens.css 생성 + Stitch 2" — Step 4에서 Executive Summary를 "ESLint 0 + Playwright 0"으로 수정했으나 이 섹션 미반영. **(2)** L549 n8n OOM 대응 "4G→6G" — 확정 결정 #2 "2G cap" (Brief mandate) 직접 모순. 현재 한도가 2G인데 4G에서 6G로 올린다는 전제가 틀림. |
| D4 실행가능성 | 7/10 | v2 기준 측정 방법 구체적 (`wc -l`, `grep`, 타이머). v3 기준도 Go/No-Go 번호 연결. 하지만 6개 게이트가 기술 기준에 빠져 Sprint 완료 판정 시 누락 리스크. |
| D5 일관성 | 5/10 | **(1)** 게이트 #6: Executive Summary(Step 4 수정됨) = "ESLint 0 + Playwright 0", 이 섹션 L585 = "tokens.css 생성", Implementation L1693 = "ESLint 0 + Playwright 0" — 여전히 2/3 불일치. **(2)** Pre-Sprint: Executive Summary(L432) = 4항목(Voyage 포함), 이 섹션 L522 = 3항목(Voyage 없음). **(3)** P0/P1(L598-610)에 게이트 #9-#14 미반영 — #9 obs poisoning, #11 tool sanitization은 보안 Critical인데 P0에 없음. **(4)** Sprint 완료 기준(L623-626)이 해당 Sprint 게이트 일부만 참조 — Sprint 3에 #4(Memory Zero Regression), #9(obs poisoning) 미포함. **(5)** L549 "4G→6G" vs Brief/확정 결정 "2G cap". |
| D6 리스크 | 7/10 | v2+v3 실패 트리거 12개, 대응 전략 포함. Sprint 독립 실패 격리 전략 우수. 하지만 n8n OOM 대응이 확정 결정과 모순. UX 실패 시나리오 전무. |

---

## 가중 평균: 6.40/10 ❌ FAIL

계산: (8×0.15) + (6×0.20) + (6×0.15) + (7×0.15) + (5×0.20) + (7×0.15) = 1.20 + 1.20 + 0.90 + 1.05 + 1.00 + 1.05 = **6.40**

---

## 이슈 목록

### Critical (Step 4 수정 미전파)

1. **[D5/D3] L585 게이트 #6 — Step 4 수정 미전파**
   - Step 4 Fix 2에서 Executive Summary L461을 "ESLint 0 + Playwright dead button 0 (Brief §4 기준)"으로 수정함.
   - 그러나 Success Criteria L585: "디자인 토큰 추출 | tokens.css 생성 + Stitch 2 디자인 시스템 준수 | 1 | #6" — 여전히 구버전.
   - L623 Sprint 1 완료 기준에도 "디자인 토큰 추출" 잔존.
   - 개발자가 Success Criteria를 참조하면 "tokens.css만 생성하면 통과"로 오인 — Brief 기준(ESLint+Playwright)과 다른 기준으로 pass 판정 위험.
   - **수정**: L585 → "UXUI Layer 0 자동 검증 | ESLint 하드코딩 색상 0 + Playwright dead button 0 | 1 | #6". L623 동일 수정.

2. **[D2/D5] v3 기술 기준 테이블(L581-594) — 14개 게이트 중 6개 누락**
   - Step 4에서 Go/No-Go를 14개로 확장했으나, 이 섹션의 기술 기준 테이블에 반영 안 됨.
   - 누락: #9(Observation Poisoning), #10(Voyage Migration), #11(Tool Sanitization), #12(v1 Parity), #13(Usability), #14(Capability Evaluation).
   - 보안 게이트 #9/#11이 기술 기준에 없으면 Sprint 완료 시 보안 검증 누락.
   - **수정**: L594 이후에 #9-#14 행 6개 추가. 각각 검증 방법, Sprint, Go/No-Go # 포함.

### Major

3. **[D3/D5] L549 n8n OOM 대응 "4G→6G" — 확정 결정 #2 직접 모순**
   - 확정 결정 #2: "OLD: `--memory=4g` → NEW: `--memory=2g`" (Brief mandate).
   - L155(이 PRD): "Brief mandate `--memory=2g`... Brief 제약으로 OOM 리스크 상승".
   - L549: "Docker 메모리 한도 조정 (4G→6G)" — 현재 한도가 2G인데 4G 전제가 틀림, 6G 제안은 Brief 위반.
   - **수정**: "Docker 메모리 한도 2G 유지 (Brief mandate). OOM 3회+ 시: (1) n8n 워크플로우 동시 실행 수 제한, (2) NODE_OPTIONS heap 조정, (3) 극단 시 n8n 제거 + ARGOS 크론 유지."

4. **[D2] Pre-Sprint 마일스톤(L522) Voyage AI 누락**
   - Step 4 Fix 4에서 Executive Summary Pre-Sprint(L432)에 Voyage AI 추가됨.
   - 이 섹션 L522: "Neon Pro 업그레이드 + 디자인 토큰 확정 + 사이드바 IA 확정" — 3항목만.
   - Pre-Sprint Go/No-Go #10 = Voyage AI 완료인데, 마일스톤에 없으면 Sprint 완료 판정에서 누락.
   - **수정**: L522 → "+ Voyage AI 임베딩 마이그레이션 완료 (Go/No-Go #10)" 추가.

5. **[D2] Go/No-Go #13(사용성 검증) User Success 테이블에 대응 행 없음**
   - Go/No-Go #13: "Admin 온보딩 외부 도움 없이 완료 + CEO /office→Chat→태스크→확인 5분".
   - v3 User Success(L492-501)에 이 기준이 없음. v2 L488 "초기 설정 ≤ 15분"은 유사하나 CEO 태스크 플로우 부분 미포함.
   - **수정**: v3 User Success에 "#13 사용성" 행 추가 — "Admin 온보딩 외부 도움 없이 완료 + CEO 태스크 플로우 5분 이내 | Go/No-Go #13 (Brief #11)".

6. **[D2/D6] UX 레벨 실패 트리거 부재**
   - v3 실패 트리거(L546-553) 전부 기술적: OOM, 번들 크기, API 장애, 스코프 과부하.
   - UX 실패 시나리오 없음:
     - Admin 온보딩 중단율 > 50% → 위저드 단순화 or 가이드 투어 추가
     - Big Five 슬라이더 "OCEAN이 뭔지 모르겠다" → 행동 예시 툴팁 강화
     - /office 에이전트 식별 불가 (아바타 유사) → 이름 라벨 + 색상 구분
     - CEO 사이드바 합치기 후 "이전 메뉴 못 찾겠다" → redirect + 안내 배너
   - **수정**: v3 실패 트리거에 UX 레벨 2-3행 추가 (최소 온보딩 + 네비게이션).

### Minor

7. **[D5] P0/P1 리스트에 게이트 #9-#14 미포함**
   - P0(L598-608) 10개: #1-#5만 참조. P1(L610): 나열된 항목 중 #9-#14 없음.
   - 보안 게이트 #9(obs poisoning), #11(tool sanitization) → P0급.
   - v1 패리티 #12 → P0 ("매 Sprint 추적" 성격).
   - 사용성 #13 → P1.
   - **수정**: P0에 #9/#11/#12 추가. P1에 #13/#14 추가.

8. **[D5] Sprint 완료 기준(L623-626) — 해당 Sprint 게이트 불완전 참조**
   - Sprint 3(L625): "Reflection 크론 90%+ + 반복 오류 30%- + Haiku ≤ $0.10/일" — #4(Memory Zero Regression), #9(obs poisoning), #14(Capability Evaluation) 미참조.
   - Sprint 1(L623): "디자인 토큰 추출" — 게이트 #6 구버전.
   - **수정**: 각 Sprint 완료 기준에 해당 Sprint Go/No-Go 전부 열거.

---

## Cross-talk 요약

- **Winston에게**: L585 게이트 #6 여전히 "tokens.css" — Step 4 Fix가 Executive Summary만 수정하고 Success Criteria 미전파. Architecture 관점에서 기술 기준 테이블에 #9-#14 빠짐은 Sprint 완료 판정 시 Architecture 검증 갭.
- **Quinn에게**: 기술 기준 테이블에 보안 게이트 #9(obs poisoning), #11(tool sanitization) 없음 — QA가 이 섹션을 기준으로 테스트 계획 세우면 보안 테스트 누락. P0 리스트에도 보안 게이트 없음. L549 n8n OOM "4G→6G"는 확정 결정 #2 "2G cap"과 직접 모순.
- **Bob에게**: Pre-Sprint 마일스톤(L522) Voyage AI 여전히 누락 — 배포 계획에 2-3일 블로커 미반영. Sprint 완료 기준이 해당 Sprint 게이트를 불완전 참조 — Sprint 완료 판정 기준으로 사용 시 검증 갭.

---

## Post-Fix Verification (R2)

> Fix log: `stage-2-step-05-fixes.md` (10 fixes: 2 CRITICAL + 5 MAJOR + 3 MINOR)
> PRD re-read: lines 471–664

### Fix 검증

| # | 이슈 | Fix | 검증 | 결과 |
|---|------|-----|------|------|
| 1 | Gate #6 "tokens.css" (Critical) | Fix 3: L589 → "ESLint 0 + Playwright 0" | Exec Summary L461 = Technical L589 = Sprint 1 L637 = Declaration L657 — 4곳 통일 | ✅ |
| 2 | 6개 게이트 누락 (Critical) | Fix 2: L599-604에 #9-#14 추가 | 14행 완전. 각 행에 검증 방법 + Sprint + Go/No-Go # 포함 | ✅ |
| 3 | n8n OOM "4G→6G" (Major) | Fix 1: L549 → "2G 한도 유지 (Brief 필수)" | 확정 결정 #2 "2G" 정합. 대응: 워크플로우 분할 + max_concurrency=1 + restart 정책 | ✅ |
| 4 | Pre-Sprint Voyage AI 누락 (Major) | Fix 10: L522 추가 | Exec Summary L432 = Sprint milestone L522 = Technical L600 — 3곳 정합 | ✅ |
| 5 | #13 User Success 행 없음 (Major) | — | **미수정**. Technical L603 + Sprint milestone L527 + Declaration L662에 반영됨 — 3곳 커버. User Success 테이블에 전용 행은 없으나, v2 L488 "초기 설정 ≤ 15분"이 Admin 부분 커버. CEO 태스크 플로우는 간접 커버. **Minor 잔여** | ⚠️ |
| 6 | UX 실패 트리거 부재 (Major) | Fix 5: 4건 추가 | 추가된 4건(Voyage, Poisoning, Cost, Sanitization)은 전부 기술적. **순수 UX 트리거(온보딩 혼란, 네비게이션, 슬라이더)는 여전히 부재**. Gate #13 사용성 검증으로 간접 커버되나, "실패 시 대응"이 아닌 "합격 기준"임. **Minor 잔여** | ⚠️ |
| 7 | P0/P1 미반영 (Minor) | Fix 4 + Fix 9 | P0 14개: #9/#10/#11/#12 포함 ✅. P1: UXUI Layer 0 #6, 사용성 #13, Capability #14 포함 ✅. 보안 게이트 P0, 품질 게이트 P1 — 우선순위 구분 적절 | ✅ |
| 8 | Sprint completion 불완전 (Minor) | Fix 7 | Sprint 1: #2/#6 ✅, Sprint 2: #3/#11 ✅, Sprint 3: #7/#9/#4/#14 + advisory lock ✅, Sprint 4: #5/#8 ✅ | ✅ |
| — | Success declaration v3 (Fix 8) | 6항목 추가 | L657-663: #9-#14 전부 포함 ✅ | ✅ |
| — | Reflection Gate #7 강화 (Fix 6) | L594 상세화 | confidence ≥ 0.7 + 20개 트리거 + ECC 2.2 자동 차단 + advisory lock — Product Scope L910 + confirmed decision #9 정합 | ✅ |

### 잔여 관찰 (Non-blocking)

1. **[D2 Minor] User Success 테이블에 #13 전용 행 부재** — CEO 태스크 5분 플로우가 User Success에 명시적 행으로 없음. Technical + Sprint milestones + Declaration 3곳에서 커버되므로 실질적 검증 갭 없음. 개발자 참조 시 혼동 가능성 극히 낮음.

2. **[D6 Minor] 순수 UX 실패 트리거 부재** — 15건 실패 트리거 전부 기술/보안/비용. 온보딩 중단율, 슬라이더 이해도, 네비게이션 발견성 등 UX 실패 시나리오가 없음. Gate #13 사용성 검증이 "합격 조건"으로 기능하나, "실패 시 무엇을 할 것인가"에 대한 대응 전략이 빠짐. 다만 solo dev 프로젝트에서 UX 실패 트리거의 실질적 운용 가능성 고려 시 minor.

3. **[D5 Micro] #11 Sprint 배정 — Exec Summary "3" vs Technical "2, 3"** — Exec Summary(L466)는 Sprint 3만, Technical(L601)은 Sprint 2-3, Sprint 2 completion(L638)에 #11 포함. Exec Summary는 요약이므로 primary Sprint만 기재한 것으로 해석 가능. Success Criteria 내부 정합은 유지됨.

### Post-Fix 차원별 점수

| 차원 | Pre | Post | 변화 근거 |
|------|-----|------|----------|
| D1 구체성 | 8 | 9 | 14개 게이트 구체적 검증 방법+Sprint+실패 대응. Reflection confidence/trigger/lock 구체화. 실패 트리거 15건 |
| D2 완전성 | 6 | 8 | 14개 게이트 기술 기준 완전. Pre-Sprint Voyage AI. #13 사용성 3곳 반영. 잔여: User Success #13 전용 행 부재, UX 실패 트리거 부재 |
| D3 정확성 | 6 | 9 | Gate #6 Brief 정합 (ESLint+Playwright). n8n OOM 2G Brief 준수. Reflection criteria confirmed decision 정합 |
| D4 실행가능성 | 7 | 9 | 14개 게이트 Sprint 배정 + 검증 방법 + P0/P1 우선순위. Sprint completion 게이트 명시적 참조 |
| D5 일관성 | 5 | 9 | Gate #6 4곳 통일. Pre-Sprint 3곳 정합. n8n 2G 전 구간 일치. #11 Sprint micro gap만 잔여 |
| D6 리스크 | 7 | 8 | 15건 실패 트리거 (기존 7 + 기술 4 + 보안 4). Sprint 독립 실패 격리 우수. UX 트리거 부재 minor 잔여 |

### ~~가중 평균: 8.65/10 ✅ PASS~~ → R2b 아래 참조

계산: (9×0.15) + (8×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (8×0.15) = 1.35 + 1.60 + 1.35 + 1.35 + 1.80 + 1.20 = **8.65**

---

## Post-Fix Verification R2b (Supplementary Fixes 11-12)

> Fix 11: UX 실패 트리거 3건 추가 (L558-560)
> Fix 12: n8n OOM 3단계 에스컬레이션 강화 (L549)

### Fix 11 검증: UX 실패 트리거

| # | 트리거 | 판단 시점 | 대응 | Gate 연동 | 결과 |
|---|--------|----------|------|----------|------|
| 1 | Admin 온보딩 15분 초과/중단 | Sprint 1 이후 | UI 간소화 → 가이드 패널 | #13 ✅ | ✅ |
| 2 | CEO 내비게이션 혼란 (태스크 5분 초과) | Sprint 1 이후 | IA 재검토 + 퀵액션 → 바로가기 패널 | #13 ✅ | ✅ |
| 3 | Big Five 슬라이더 설정 3분+ | Sprint 1 | 프리셋 원클릭 + 라벨 직관화 → Low/Mid/High 3단계 | — | ✅ |

원본 Sally 제안 4건 중 3건 채택 (온보딩, 네비게이션, 슬라이더). `/office` 에이전트 식별 트리거 미채택 — Sprint 4 전용 + 낮은 우선순위, 수용.

v3 실패 트리거 총 14건: 기술 7 + 보안/비용 4 + **UX 3** — 4개 카테고리 균형.

### Fix 12 검증: n8n OOM 에스컬레이션

L549 확인:
- "2G 한도 유지 (Brief 필수, **4G=OOM 확정**)" — confirmed decision #2 명시적 참조 ✅
- 3단계: (1) 메모리 프로파일링 → (2) NODE_OPTIONS 1536 → (3) 워크플로우 분할 + max_concurrency=1 ✅
- "마지막 수단: VPS 전체 스케일업 (n8n 단독 증설 불가)" — Brief 2G 위반 없이 극단 대응 ✅
- NODE_OPTIONS 1536 = confirmed decision #2 수치 정합 ✅

### R2b 최종 차원별 점수

| 차원 | R1 | R2a | R2b | 변화 근거 |
|------|-----|-----|-----|----------|
| D1 구체성 | 8 | 9 | 9 | n8n 3단계 에스컬레이션 순서 명확. UX 트리거 대응 전략 2단계 (즉시+불가시). 유지 |
| D2 완전성 | 6 | 8 | **9** | UX 실패 트리거 3건 추가 → 기술+보안+UX 전 카테고리 커버. User Success #13 전용 행 없으나, v3 User Success에 "네비게이션 간결"(L501)+"슬라이더 직관"(L495) 개별 행 존재 + Gate #13은 umbrella 검증이므로 전용 행 불필요 판단 |
| D3 정확성 | 6 | 9 | 9 | 변동 없음 |
| D4 실행가능성 | 7 | 9 | 9 | n8n 3단계 에스컬레이션 실행 순서 명확 + UX 트리거 2단계 대응 |
| D5 일관성 | 5 | 9 | 9 | UX 트리거 #13 참조 = Gate #13 테이블 정합 ✅ |
| D6 리스크 | 7 | 8 | **9** | 14건 실패 트리거 4개 카테고리 (기술7+보안4+UX3). n8n 에스컬레이션 강화. /office 미채택만 잔여 — Sprint 4 특화, non-blocking |

### 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

### 잔여 관찰 (Carry-forward, non-blocking)

1. **User Success #13 전용 행**: 4곳 커버 (Technical, Sprint milestones, Declaration, Failure triggers). User Success 테이블 내 개별 행(L495 슬라이더, L501 네비게이션)이 구성 요소로 존재. 전용 행 추가 시 중복 발생 → 현상 유지 적절.
2. **#11 Sprint Exec vs Technical micro gap**: Exec "3" vs Technical "2, 3" — Summary 특성, 수용.
3. **n8n Admin dual touchpoint**: Feature Requirements 단계에서 Admin이 CORTHEX 관리 페이지 vs n8n 에디터 직접 접근 시 UX 구분 필요 (Winston carry-forward).
