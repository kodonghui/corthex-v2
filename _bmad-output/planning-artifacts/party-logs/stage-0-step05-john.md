# Critic-C Review — Step 05: MVP Scope

**Reviewer:** John (PM) — Critic-C (Product + Delivery)
**Date:** 2026-03-20
**File reviewed:** `product-brief-corthex-v3-2026-03-20.md` lines 368–450
**Grade:** A (엄격 검토)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Sprint 순서 표, Layer별 파일명/컬럼명/라우트 전부 명시. Layer 4 Option B 상세(memoryTypeEnum, observations 신규, memory-extractor.ts 크론 확장) ✓. Go/No-Go 7게이트 구체적. 단, Layer 1 에셋 생성 도구 미확정("Stage 1 Technical Research에서 조사") + observations 테이블 스키마 없음. |
| D2 완전성 | 7/10 | Layer 0~4 In Scope + Out of Scope 9항목 + 7 Go/No-Go 게이트 + Future Vision 4-tier 구조 완비. 단, **Sprint 4 에셋 선행 필수 gate 없음** (의존성만 명시, 검증 조건 없음) + Layer 0 중간 완료 기준 없음 (Sprint 2 완료 시점 체크 없음). |
| D3 정확성 | 8/10 | `soul-renderer.ts` extraVars ✓. `services/argos-service.ts` ARGOS 유지 ✓. `agent_memories` Option B ✓. `memory-extractor.ts` ✓. E8 경계 ✓. `/ws/office` 14→15 ✓. Tiled JSON — PixiJS 타일맵 표준, 정확. `agents.personality_traits JSONB` — v3 신규 컬럼으로 명시, Step 02와 일치 ✓. |
| D4 실행가능성 | 7/10 | Layer 0~3 전부 구현 경로 명확. Layer 4 Option B 패턴 명확, 블로커 솔직하게 명시 ✓. 단, **Layer 1 에셋 품질 보장 경로 없음** — Technical Research 결과가 불량이면 Sprint 4 unblock 방법 없음. 에셋 fallback 전략 미존재. |
| D5 일관성 | 9/10 | Layer 3→2→4→1 순서 ↔ Step 02 ✓. Option B ↔ Step 02 수정안 ✓. soul-renderer.ts 정확 ✓. Zero Regression 용어 일관 ✓. `/ws/office` 14→15 ↔ Step 02 "14채널" ✓. Out of Scope "agent_memories 대체 신규 테이블" ↔ Option B ✓. ARGOS 유지 ↔ Step 04 KPI ✓. |
| D6 리스크 | 6/10 | Reflection 비용 블로커 명시 ✓. n8n 포트 보안 Out of Scope 절대 금지 ✓. Zero Regression 절대 규칙 ✓. **3개 리스크 미언급**: (1) Layer 1 에셋 AI 생성 품질 불량 시 Sprint 4 블로커 — Go/No-Go 게이트 없음. (2) Layer 0 병행 중 뒤처질 경우 Sprint 1~3 진행 중 캐치 기준 없음. (3) observations 신규 테이블 마이그레이션이 무중단 배포 요건 충족하는지 미검토. |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 8 | 20% | 1.60 |
| D2 완전성 | 7 | 20% | 1.40 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 7 | 15% | 1.05 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 6 | 20% | 1.20 |

### **가중 평균: 7.35/10 ✅ PASS**

---

## 이슈 목록

### Issue #1 [D6 리스크 + D4 실행가능성] — Layer 1 에셋 AI 생성 불확실성 — Go/No-Go 게이트 없음 ⚠️ HIGH

line 414: `"AI 직접 생성 (Midjourney/DALL-E 또는 최신 AI 스프라이트 도구 — Stage 1 Technical Research에서 조사)"`

이것이 Sprint 4의 선행 조건인데, Go/No-Go 게이트 7개 중 에셋 품질 검증 항목이 없다. Stage 1 Technical Research에서 "AI 스프라이트 생성 불가" 결론이 나오면:
- Sprint 4 착수 불가
- LPC Sprite Sheet 오픈소스 폴백이 있지만 이것도 스프라이트 커스터마이징이 필요
- 대안: 오픈소스 직접 사용 or 외부 구매(현재 Out of Scope)

Go/No-Go에 이 게이트가 없으면 출시 직전에 "에셋 없음"을 발견할 수 있다.

**수정안:**
- Go/No-Go 게이트에 "**에셋**: Stage 1 Technical Research 에셋 품질 승인 완료 (Sprint 4 착수 선행 조건)" 추가.
- Sprint 순서 표 Sprint 4 의존성 컬럼: `"에셋 선행 필수 + Stage 1 에셋 승인"` 으로 보강.

---

### Issue #2 [D2 완전성 + D6 리스크] — Layer 0 병행 진행 중간 완료 기준 없음 ⚠️ MEDIUM

Layer 0이 "전 Sprint 병행"으로 진행되는데 — Go/No-Go Gate #6(출시 조건)에는 있지만 Sprint 1~3 도중 Layer 0이 뒤처지고 있을 때 잡아낼 중간 게이트가 없다.

PM 관점: Sprint 3(Layer 4 Memory — 가장 복잡) 진행 중에 Layer 0 UXUI가 20% 완료 상태라면 Gate #6에서 실패해 전체 출시가 지연된다.

**수정안:** Layer 0 섹션 또는 Sprint 순서 표에:
`"Layer 0 중간 게이팅: Sprint 2 종료 시점까지 ≥ 60% (하드코딩 색상 전환 완료 기준). 미달 시 Sprint 3 시작 전 레드라인 검토."`

---

### Issue #3 [D6 리스크] — observations 신규 테이블 마이그레이션 무중단 배포 미검토 ⚠️ LOW

Layer 4 Option B: 신규 `observations` 테이블 추가. 기존 86테이블에 1개 추가 → Zero Regression 범주이나, Neon serverless 환경에서 마이그레이션이 롤링 배포 중에 실행되면 CEO 앱 down 없이 가능한지 미검토.

v3는 "기존 v2 사용자 이탈 없음"이 목표. 출시 시점 마이그레이션 downtime이 있으면 이 목표와 충돌.

**수정안:** Layer 4 섹션에 1줄: `"observations 테이블 마이그레이션: Neon serverless zero-downtime migration 확인 (schema push 사전 배포 패턴 적용)"`

---

## Cross-talk 요약 (수신 후 업데이트)

**Sally (UX) — Phase 0 테마 결정 타이밍 [HIGH]:**
- Sprint 표가 "Layer 0 병행"인데 Phase 0 디자인 토큰(테마) 결정이 Sprint 1 착수 전에 완료되어야 하는지 명시 없음.
- 테마 미확정 → Sprint 1~3에서 임시 색상 사용 → 테마 확정 후 전면 재작업.
- → John 동의: Issue #2(Layer 0 중간 기준)보다 앞선 문제. 시작 조건이 없으면 병행이 아니라 병목이 됨.

**신규 이슈 추가:**

### Issue #4 [D2 완전성 + D4 실행가능성] — Phase 0 테마 결정이 Sprint 1 착수 조건으로 미명시 ⚠️ HIGH (Sally 제기)

Sprint 순서 표:
- Layer 0: "전 Sprint 병행"
- Sprint 1 Layer 3: 의존성 "독립 · 낮음"

Layer 3(Big Five) 구현 시 Admin 앱 슬라이더 UI에 색상·컴포넌트 스타일이 필요하다. Phase 0 디자인 토큰이 미확정이면 임시 스타일로 개발 → Layer 0 테마 확정 후 재작업. 이 재작업 비용이 명시되지 않았고 Sprint 계획에 반영되지 않았다.

Layer 2(n8n 관리 페이지), Layer 4(Memory UI)도 동일.

**수정안:** Sprint 순서 표에 선행 행 추가:

| Pre-Sprint | **Phase 0 테마** | 디자인 토큰 확정 (Subframe 아키타입 선택) | **Sprint 1 착수 선행 조건** |

또는 Layer 0 섹션에: `"Phase 0 테마(디자인 토큰) 확정은 Sprint 1 착수 전 완료 필수. 미확정 시 전 Sprint 임시 색상 재작업 리스크."`

---

**나머지 예상 크로스톡:**
- Bob(SM)이 Issue #1(에셋 게이트) + Issue #4(테마 착수 조건)를 Sprint 백로그 관점에서 지적할 가능성 높음.
- Winston(Arch)이 observations 마이그레이션(Issue #3) + Layer 4 Option B 스키마 상세 지적 가능.
- **전반적 평가**: D5 일관성 9점 — Step 01~04 크로스체크가 잘 반영됨. Issue #1 + #4 수정 시 8점대 달성 가능.
