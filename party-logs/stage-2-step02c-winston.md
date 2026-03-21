# Critic-A (Architecture + API) Review — Step 02c Executive Summary

**Reviewer**: Winston (Architect)
**Target**: `_bmad-output/planning-artifacts/prd.md` L320~L448
**Date**: 2026-03-20

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | 페르소나 이름·나이·역할 구체적. 기술 지표: 363줄, 200KB=204,800 bytes, ≤2초, 90%+. Go/No-Go 검증 방법 구체적. Minor: "A/B 테스트 통과" 기준 미정의 |
| D2 완전성 | 15% | 7/10 | 4개 섹션(사용자/기대효과/리스크/로드맵) 전부 포함. R1-R9 중 미해결 7건 반영. **Go/No-Go #1 Zero Regression 누락** — Brief §4 가장 중요한 게이트 |
| D3 정확성 | 25% | 6/10 | **Go/No-Go 테이블이 Brief §4와 3건 불일치**: (1) #1 Zero Regression 누락, (2) Brief #2를 PRD #1/#2로 분할, (3) Brief #3 보안 모델 → PRD #3 healthcheck로 축소. 0-100 정수, 4-layer 등 기존 수정사항은 정확 |
| D4 실행가능성 | 20% | 8/10 | Sprint별 검증 방법 명시. 리스크 완화 전략 구체적. Go/No-Go 각 게이트 검증 방법 명확 |
| D5 일관성 | 15% | 6/10 | Go/No-Go 번호 체계가 Brief §4, Tech Research §6.2, Stage 0 snapshot과 전부 불일치. 나머지(Sprint 순서, 레이어 매핑, 용어)는 일관 |
| D6 리스크 | 10% | 9/10 | R1-R9 severity 내림차순, 완화+잔여 리스크 매트릭스. 추가 2건(CLI Max, Solo dev). Cross-cutting 리스크 인식 우수 |

### 가중 평균: 7.15/10 ✅ PASS

계산: (8×0.15) + (7×0.15) + (6×0.25) + (8×0.20) + (6×0.15) + (9×0.10) = 1.20 + 1.05 + 1.50 + 1.60 + 0.90 + 0.90 = **7.15**

---

## 이슈 목록

### 🔴 Critical (D3 정확성 + D5 일관성)

**1. Go/No-Go #1 Zero Regression 누락**

- **위치**: L437-L447 Go/No-Go 테이블
- **Brief §4 원본** (L443): `"1. Zero Regression: 기존 485 API 전부 smoke-test 200 OK"`
- **Tech Research §6.2** (L1968): `"1 | Zero Regression | §7 | ✅ READY | bun test — all 10,154 tests pass after migrations 0061-0065"`
- **PRD 현재**: #1이 `personality-injector.ts 단위 테스트`로 대체됨 — Brief §4 #1과 완전히 다른 내용
- **영향**: Zero Regression은 v3 전체의 최상위 안전장치. 이 게이트가 누락되면 Sprint 실행 시 "기존 485 API + 10,154 테스트 전부 통과" 검증이 명시적으로 요구되지 않음
- **수정안**:
  - PRD #1 → `Zero Regression: bun test 전체 통과 (10,154 tests) + 485 API smoke-test 200 OK`
  - 현재 PRD #1 personality-injector → Brief #2 Big Five 주입에 병합 (원래 같은 게이트)
  - 총 게이트 수 8개 유지

### 🟠 Major (D3 정확성)

**2. Go/No-Go #3 보안 범위 축소**

- **위치**: L442
- **Brief §4** (L445): `"n8n 보안: 포트 5678 외부 차단 확인 + Hono 프록시 인증 통과"`
- **Tech Research §6.2** (L1970): `"6-layer model: Docker network isolation → Hono reverse proxy → API key header injection → tag-based tenant filter → webhook HMAC → rate limiting"`
- **PRD 현재**: `"n8n Docker healthcheck 통과 | /api/v1/workflows 200 OK"`
- **문제**: healthcheck는 가용성 검증일 뿐 보안 검증이 아님. Brief §4의 핵심은 "5678 외부 차단 + 인증"
- **수정안**: `"n8n 보안: (1) 포트 5678 외부 접근 불가, (2) Hono 프록시 JWT 인증, (3) tag 격리 cross-company 차단"` — healthcheck는 부가 항목

**3. Go/No-Go #7 내용 변경 미주석**

- **위치**: L446
- **Brief §4** (L449): `"Reflection 비용 한도: Tier별 한도 PRD 확정 후 구현 (미확정 시 Sprint 3 블로커)"`
- **PRD 현재**: `"Reflection 크론 1일 실행 성공"` — 비용 한도 → 기능 테스트로 변경
- **판정**: GATE 결정(costs 제거)에 따른 합리적 변경. **주석 추가만 필요**: `<!-- Brief §4 #7 원본: Tier 비용 한도. GATE 결정(costs 제거)으로 기능 검증으로 대체 -->`

### 🟡 Minor (1건)

**4. agent-loop.ts 줄 수 검증**

- **위치**: L357 `"agent-loop.ts 1개 파일 (363줄)"`
- **v2 기술 지표에서 "약 50줄"에서 "363줄"로 수정** — v2 PRD 작성 시 예상(50줄)과 실제 구현(363줄) 차이. 수정 자체는 정확하나, "약 50줄"이 아직 L294 핵심 전략 #3에 남아있음
- **수정안**: L294 `"약 50줄"` → `"363줄"` 정합성 확보, 또는 `"1개 파일"` 줄 수 제거

---

## Cross-talk

- **Quinn**: Go/No-Go #3 보안 범위 — healthcheck만으로 n8n 보안 게이트 충분한가? QA 관점 확인 요청
- **Bob**: Go/No-Go #1 Zero Regression 누락 — Product 관점에서 이 게이트가 빠지면 Sprint 실행 리스크 어떻게 보나?

---

## 아키텍처 관점 소견

**잘된 부분:**
- 리스크 레지스트리 R1-R9가 Tech Research §6.3과 정확히 매핑 (severity 순서, 완화 전략)
- v3 기술 지표가 Sprint-specific하고 측정 가능
- 페르소나 재구성이 Admin-first 온보딩 교훈을 반영

**핵심 우려:**
Go/No-Go 테이블은 Sprint 실행의 관문. Brief §4에서 정의한 8개 게이트가 PRD에서 변형되면, 구현자가 어느 기준을 따를지 혼란. 특히 #1 Zero Regression은 **모든 Sprint의 전제 조건** — 이것만큼은 반드시 복원해야 함.
