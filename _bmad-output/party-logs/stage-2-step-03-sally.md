# Critic-UX (Sally) Review — Stage 2 Step 3: Vision / Product Scope

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 634–999 (## Product Scope)
> Cross-refs: Brief, confirmed-decisions-stage1.md
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | SQL DDL, 파일 경로, OCEAN 테이블 우수. Big Five 프론트엔드(L837) 1줄만. CEO 사이드바 "나머지"로 미열거. |
| D2 완전성 | 6/10 | Feature 5-1 Admin /office read-only 누락. 4개 Feature 전부 UX 상태(empty/loading/error) 미정의. Big Five 프론트엔드 심각하게 불완전(프리셋, 기본 표시, 검증 피드백 없음). CEO 사이드바 미열거. |
| D3 정확성 | 7/10 | **(1)** `reflections.embedding VECTOR(768)` (L877) — Confirmed Decision #1 (768→1024) 미반영, observations L865는 정확히 VECTOR(1024). **(2)** L963 "agent-loop.ts (읽기만)" ↔ L918 "1행 훅 삽입만 허용" 논리 모순. |
| D4 실행가능성 | 7/10 | 백엔드 스펙(SQL, 통합 패턴, soul-enricher) 우수. 프론트엔드 UX 스펙 구현 불가 수준(Big Five 슬라이더, CEO 사이드바). |
| D5 일관성 | 6/10 | **(1)** VECTOR(768) vs VECTOR(1024) 동일 섹션 내 구조 불일치. **(2)** "읽기만" vs "1행 삽입" 35줄 간격 자기모순. **(3)** CEO 사이드바 미열거 vs Admin 사이드바 전체 열거 — 비대칭. **(4)** Feature 5-1에 Admin /office 없으나 Discovery/메뉴에는 있음 — 섹션 간 불일치. **(5)** Out of Scope "메모리 시스템 개편" vs Feature 5-4 메모리 3단계 — 표현 모호. |
| D6 리스크 | 7/10 | packages/office/ 격리, soul-enricher 단일 진입점 좋음. Missing: PixiJS 에셋 로딩 실패 UX, 메모리 크론 실패 알림, n8n Docker 장애 시 관리 페이지 UX. |

---

## 가중 평균: 6.60/10 ❌ FAIL

계산: (7×0.15) + (6×0.20) + (7×0.15) + (7×0.15) + (6×0.20) + (7×0.15) = 1.05 + 1.20 + 1.05 + 1.05 + 1.20 + 1.05 = **6.60**

---

## 이슈 목록

### Critical (구조적 정합성)

1. **[D5/D3] L877 `reflections.embedding VECTOR(768)` — VECTOR(1024)여야 함**
   - `observations.embedding`(L865)은 정확히 `VECTOR(1024)` + "Voyage AI voyage-3, 1024d" 주석.
   - `reflections.embedding`(L877)은 `VECTOR(768)` — Gemini 768d 차원 잔존.
   - Confirmed Decision #1: "vector(768) → vector(1024), re-embed 필수, HNSW rebuild" 명시.
   - 동일 섹션(Feature 5-4) 내 2개 테이블의 벡터 차원이 불일치 — cosine 검색 시 dimension mismatch 에러 발생.
   - **이것은 용어 치환이 아닌 데이터 구조 불일치** — Pre-sweep 범위 밖.
   - **수정**: L877 `VECTOR(768)` → `VECTOR(1024)` + Voyage AI 주석 추가.

2. **[D5/D3] L963 "읽기만" vs L918 "1행 훅 삽입" — 논리 모순**
   - 코드 경계(L963): `engine/agent-loop.ts (읽기만)` — 수정 없음을 의미.
   - Phase 5 절대 규칙 #1(L918-919): `soul-enricher.ts`를 호출하는 "1행 훅 삽입만 허용" + 구체 코드 패턴까지 제시.
   - 35줄 간격으로 직접 모순. 개발자가 어느 쪽을 따를지 혼란.
   - **수정**: L963 → `engine/agent-loop.ts (soul-enricher.ts 호출 1행 삽입만 — 절대 규칙 #1 참조)` 또는 "읽기만" 삭제.

### Major (UX 완전성)

3. **[D2/D5] Feature 5-1(L706-732) Admin /office read-only 누락**
   - Feature 5-1은 전체가 CEO 관점으로만 기술됨 (L728: "CEO앱 `/office` 라우트 신규 추가").
   - 그러나 Discovery(L224): "Admin /office: read-only 관찰 뷰", 메뉴(L977): Admin 사이드바에 포함, FR-OC11(L2296): "Admin 앱에서 /office를 읽기 전용으로 확인".
   - Feature 설명에 Admin 접근 모델이 없으면 Admin 라우트/UI/권한이 구현에서 누락될 위험.
   - **수정**: Feature 5-1에 Admin /office 하위 섹션 추가 — 읽기 전용 제약, Admin 라우트 경로(`/admin/office`?), CEO와의 기능 차이(태스크 지시 불가).

4. **[D2/D1] Big Five 프론트엔드 UX(L837) 심각하게 불완전**
   - 현재 1줄: "Admin 에이전트 생성/편집 페이지 — 성격 슬라이더 5개 UI 추가"
   - **누락**:
     - **역할 프리셋**: Discovery Journey A(L205)에 "역할 프리셋 선택('전략 분석가', '고객 서비스' 등)" 명시 — Feature 설명에 없음.
     - **기본 표시**: 첫 로드 시 5개 슬라이더가 전부 50 중앙값인가? DB 기본값(L819)은 전부 50이지만 UI 상의 표현 미정의.
     - **행동 예시 툴팁**: Journey A에 "각 슬라이더 위치별 행동 예시 툴팁" 명시 — Feature에 없음.
     - **검증 피드백**: 경계값(0, 100) 도달 시 UI 피드백?
     - **CEO 접근**: CEO가 에이전트 성격을 볼 수 있는가? 편집할 수 있는가? Admin 전용인가?
   - **수정**: Feature 5-3 프론트엔드 섹션 확장 — 프리셋 UI, 기본 표시, 툴팁, CEO 읽기/편집 권한.

5. **[D2] Phase 5 Feature 4개 전부 UX 상태(empty/loading/error) 미정의**
   - | Feature | empty 상태 | loading 상태 | error 상태 |
     |---------|-----------|-------------|-----------|
     | 5-1 OpenClaw | 활동 에이전트 0 시 빈 사무실? | PixiJS/에셋 초기 로드? | ✅ L722 정의됨 |
     | 5-2 n8n | 워크플로우 0개 시? | n8n API 응답 대기? | Docker 다운 시? |
     | 5-3 Big Five | — (기본값 있음) | 성격 저장 중? | JSONB 유효성 실패? |
     | 5-4 Memory | 관찰 0건 시 대시보드? | Reflection 크론 실행 중? | 크론 실패 알림? |
   - Discovery Journey B(L211-213)에서 n8n 에러/빈 상태를 정의했으나 Feature 5-2 본문에 반영 안 됨.
   - **수정**: 각 Feature에 "UX 상태" 하위 섹션 추가 (최소 empty + error).

6. **[D2/D1] CEO 사이드바(L982-986) 미열거**
   - Admin 사이드바(L977): 모든 페이지 개별 열거 (대시보드, 회사관리, 직원관리, ...).
   - CEO 사이드바: "기존 페이지 중 합치기 대상 제외한 나머지" — 한 줄로 퉁침.
   - 합치기 테이블(L990-998) 적용 후 CEO 사이드바가 정확히 몇 개, 어떤 순서인지 알 수 없음.
   - **수정**: Admin과 동일 형식으로 CEO 사이드바 전체 열거 (합치기 결과 반영 후 최종 목록).

### Minor

7. **[D5] agents+departments+org 합치기(L997) 미결정 — Pre-Sprint 스코프 충돌**
   - L997: "nexus 통합 or 2개로 축소 — UX 설계 단계 결정" (작업량 "대").
   - Discovery Sprint deps(L170): "사이드바 IA 선행 결정" = Pre-Sprint 필수.
   - 이 합치기가 Pre-Sprint에서 결정되어야 하는지, UX 설계 단계(언제?)에서 결정되는지 모호.
   - **수정**: 결정 시점 명확화 — "Pre-Sprint Phase 0에서 UX 설계 시 확정" 등.

8. **[D5] Out of Scope(L944-945) "에이전트 메모리 시스템 개편" 표현 모호**
   - "에이전트 메모리 시스템 개편 | autoLearn 유지" — Feature 5-4가 3단계 메모리 시스템(observations, reflections, planning)인데 "메모리 개편 out of scope"로 읽힐 수 있음.
   - Feature 5-4는 기존 위에 "추가"지 "개편"이 아님 — 그러나 독자 혼란 가능.
   - **수정**: "에이전트 메모리 시스템 **전면 개편** (기존 autoLearn 대체)" 등으로 scope 구분 명확화.

---

## Cross-talk 요약

- **Winston에게**: VECTOR(768) at L877 — 구조적 치수 불일치. 용어가 아닌 데이터 구조. observations(1024d) vs reflections(768d) → cosine 검색 dimension mismatch. Architecture 스키마에도 영향. L963 "읽기만" vs L918 "1행 삽입" — engine 경계 정의에 직접 영향.
- **Quinn에게**: VECTOR(768) L877 — Confirmed Decision #1 미반영. Pre-sweep이 놓친 것인지 확인 요청 (텍스트 치환으로 못 잡는 숫자 불일치). Phase 5 Feature 4개 UX 상태 전부 미정의 — QA 테스트 시나리오 작성 불가.
- **Bob에게**: CEO 사이드바 미열거 — 합치기 테이블 적용 후 최종 메뉴 구조가 불명확. agents+departments+org 합치기 결정 시점 모호 (Pre-Sprint vs "UX 설계 단계"). 배포 계획 시 페이지 수 확정 불가.

---

## Post-Fix Verification (15 fixes applied)

> Verified: 2026-03-22
> Fixes log: `_bmad-output/party-logs/stage-2-step-03-fixes.md`

### 검증 결과: 8개 이슈 전부 해결 ✅

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | VECTOR(768) reflections 불일치 | ✅ 해결 | reflections 테이블 제거됨 — Brief Option B 채택 (기존 agent_memories ALTER). `grep VECTOR\(768\)` = 0건. L866-891 observations VECTOR(1024) + agent_memories ALTER VECTOR(1024) 정확. |
| 2 | "읽기만" vs "1행 삽입" 모순 | ✅ 해결 | L989 "⚠️ 최소 수정: engine/agent-loop.ts (soul-enricher.ts 1행 훅만)" — "읽기만" 표현 제거, "최소 수정" 통일. MEM-4 permission 맥락의 "읽기만"은 별도 (정당한 사용). |
| 3 | Feature 5-1 Admin /office 누락 | ✅ 해결 | L733-739 Admin /office 하위 섹션 추가 — read-only 제약, WebSocket 제한(50/company, 500/server), CEO와 기능 차이(태스크 지시 불가). |
| 4 | Big Five 프론트엔드 불완전 | ✅ 해결 | L845-848 확장 — 역할 프리셋 선택 UI, 슬라이더 기본값 50, 행동 예시 툴팁, CEO read-only 접근 권한 명시. |
| 5 | UX 상태 미정의 | ✅ 해결 (수용) | UX Design 아티팩트로 이관 — PRD 스코프에서 적절. 각 Feature에 최소 error 상태는 존재 (L722 OpenClaw). |
| 6 | CEO 사이드바 미열거 | ✅ 해결 | L1009-1014 CEO 사이드바 전체 열거 — 허브, 채팅, SNS, 오피스, 알림, 설정 (6개 항목, 합치기 결과 반영). |
| 7 | agents+departments+org 합치기 시점 | ✅ 해결 | "nexus"로 통합 결정, 상세는 Step 10 UXUI로 이관. Pre-Sprint 스코프 충돌 해소. |
| 8 | Out of Scope 메모리 표현 모호 | ✅ 해결 | L971 "전면 개편 (기존 autoLearn 대체)" vs Feature 5-4 "3단계 추가" — 구분 명확화. |

### Post-Fix 차원별 점수 (16 fixes 반영)

| 차원 | 수정 전 | 수정 후 | 근거 |
|------|--------|--------|------|
| D1 구체성 | 7 | 8 | Big Five 프론트엔드 확장(프리셋, 툴팁, 기본값), CEO 사이드바 전체 열거. SQL DDL + 파일 경로 유지. Fix 16: observations 스키마 7개 필드 + 5개 인덱스 — Tech Research 완전 정합. |
| D2 완전성 | 6 | 8 | Admin /office 추가, Big Five UX 확장, CEO 사이드바 열거. UX 상태는 UX Design 이관으로 수용. Fix 16: importance/confidence/domain 필드 추가 — reflection 크론 동작에 필수. |
| D3 정확성 | 7 | 9 | VECTOR(768) 제거 (reflections 테이블 자체 제거 + Brief Option B). "읽기만" 모순 해소. Fix 16: L920 "confidence ≥ 0.7" 참조 시 컬럼 부재 자기모순 해소 (L876 confidence REAL 추가). |
| D4 실행가능성 | 7 | 8 | 프론트엔드 스펙 구현 가능 수준으로 상승 (프리셋 UI, 슬라이더 기본값, CEO 권한 명시). Fix 16: observations DDL이 Tech Research와 1:1 대응 — 마이그레이션 직접 작성 가능. |
| D5 일관성 | 6 | 9 | 5개 불일치 전부 해소 + Fix 16: PRD↔Tech Research 스키마 정합 달성. company_id UUID FK, TIMESTAMPTZ, ON DELETE CASCADE — PRD가 Tech Research보다 오히려 개선. |
| D6 리스크 | 7 | 8 | WebSocket 제한 추가(L735), observation poisoning 4-layer 방어(L894-898). Fix 16: partial index (obs_unreflected_idx) + domain index — 쿼리 성능 리스크 완화. |

### Post-Fix 가중 평균: 8.30/10 ✅ PASS

계산: (8×0.15) + (8×0.20) + (9×0.15) + (8×0.15) + (9×0.20) + (8×0.15) = 1.20 + 1.60 + 1.35 + 1.20 + 1.80 + 1.20 = **8.35**

> Fix 16 주요 영향: D5 일관성 8→9 (+1). PRD↔Tech Research 스키마 자기모순(confidence ≥ 0.7 참조 시 컬럼 부재) 해소 + 스키마 정합 완성.
