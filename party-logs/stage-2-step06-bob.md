# Critic-C Review — Step 06 Innovation & Novel Patterns v3

**Reviewer**: Bob (Scrum Master / Product + Delivery)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L1437–1672
**Rubric**: Critic-C weights (D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | PixiJS 번들 200KB, tree-shaking 6클래스, HMAC per-company, rate limit 100 req/min, $0.10/day, Go/No-Go #번호 전부 명시. 시장 비교 5개 컬럼씩 구체적. 매우 우수 |
| D2 완전성 | 8/10 | v2 4혁신 + v3 4혁신 + 사용자 체감(7건) + 기술(8건) + 타이밍 + 검증(11건) + 리스크(12건) 전부 커버. 누락 2건: (1) Go/No-Go #7(Reflection 비용 한도)이 검증 접근법 테이블에 별도 행 없음, (2) Brief 3대 문제(블랙박스/획일성/정체)↔v3 혁신 1:1 매핑이 도입부에 명시적이지 않음 |
| D3 정확성 | 9/10 | Option B 확정(Stage 0 GATE) ✅, 4-layer sanitization Layer 0 spread 역전(Stage 1 §2.3 R7) ✅, n8n 2.12.3 ARM64 native ✅, tree-shaking 6클래스 ✅, Go/No-Go 8개 Brief와 번호·내용 일치 ✅. 시장 비교 대체로 공정(AutoGen/CrewAI "1단계" 표현은 단순화이나 핵심 차별점인 Reflection 부재는 사실) |
| D4 실행가능성 | 8/10 | 혁신별 구현 패턴(soul-enricher.ts, memory-reflection.ts, Hono proxy, PixiJS extend()) 구체적. 시장 비교로 "왜 이 접근인지" 의사결정 근거 충분. 검증 기준 정량적 (8/10회, 90%+, ≤50%) |
| D5 일관성 | 8/10 | Step 03 carry-forward 반영: iframe→API-only(L1577 Hono proxy), OCEAN 50 integer(L1521), soul-enricher.ts 통합(L1533). Step 05 N8N-SEC/PER/MEM 코드 참조 일관. Brief Sprint 순서(1→2→3→4)와 혁신 순서 정합. 미반영: Brief §2에서 n8n을 "비즈니스 자동화 확장"으로 정의하는데, 혁신 8 도입부에 Brief 연결 미명시 |
| D6 리스크 | 8/10 | v2 5건 + v3 7건 = 12건 리스크, 전부 폴백 전략 + Sprint + Go/No-Go 매핑. restart: unless-stopped + healthcheck 포함. R7 4-layer 순서 명시. 다만 Go/No-Go #1(Zero Regression)이 v3 혁신 리스크에서 cross-cutting으로 다뤄지지 않음 (검증 테이블에는 Phase 1 완료로 있으나, v3 리스크로서 "v3 추가로 인한 기존 485 API 회귀" 관점 미명시) |

---

## 가중 평균: 8.35/10 ✅ PASS (Grade B)

계산: (9×0.20) + (8×0.20) + (9×0.15) + (8×0.15) + (8×0.10) + (8×0.20) = 1.80 + 1.60 + 1.35 + 1.20 + 0.80 + 1.60 = **8.35**

---

## 이슈 목록

### 1. **[D2 완전성] Go/No-Go #7 검증 접근법 누락** — MEDIUM
- L1625-1633 v3 검증 테이블에 Go/No-Go #7 (Reflection 비용 한도: Tier별 한도 PRD 확정 후 구현)이 별도 행 없음
- L1631 메모리 행의 Go/No-Go가 #4만 매핑, #7 누락
- L1655 리스크 테이블에는 "Reflection 크론 LLM 비용 폭주 → #7"로 존재하므로 검증 테이블과 불일치
- **요청**: L1631 메모리 행에 #7 추가하거나, #7 전용 검증 행 추가 (예: "| Reflection 비용 | Tier 3-4 Haiku 비용 $0.10/day 이하 확인 | Sprint 3 | 일일 비용 ≤ $0.10 | #7: PRD Tier별 비용 확정 |")

### 2. **[D2 완전성] Brief 3대 문제 ↔ v3 혁신 1:1 매핑 미명시** — MEDIUM
- Brief §2 Core Vision: 블랙박스 → OpenClaw, 획일성 → Big Five, 정체 → Memory
- L1439-1452 도입부의 혁신 계층 테이블은 "실행/조직/과금/학습" 계층이지 "문제→해결" 매핑이 아님
- **요청**: 도입부(L1439 또는 L1441 이후)에 1줄 추가: "Brief §2 3대 문제 매핑: **블랙박스** → 혁신 5(OpenClaw), **획일성** → 혁신 6(Big Five), **정체** → 혁신 7(Memory). 혁신 8(n8n)은 자동화 확장(Brief §4 Layer 2)."

### 3. **[D6 리스크] v3 추가에 따른 기존 API 회귀 리스크 미명시** — LOW
- Go/No-Go #1(Zero Regression: 485 API smoke-test)은 v2 검증 테이블(L1614)에 없고, v3 검증 테이블(L1633)에 UXUI Layer 0으로만 반영
- v3 4개 혁신이 기존 engine/, Soul, agent_memories에 변경을 가하므로 "v3 추가로 인한 기존 API 회귀"가 cross-cutting 리스크
- **요청**: v3 리스크 테이블(L1647-1657)에 1행 추가: "| v3 변경에 의한 v2 API 회귀 | 전 Sprint smoke-test 485 API 200 OK (Go/No-Go #1). 실패 시 해당 Sprint 롤백 | 전 Sprint | #1 |"

### 4. **[D5 일관성] 혁신 8 n8n의 Brief 연결 미명시** — LOW
- Brief §4 Layer 2에서 n8n을 "비즈니스 자동화 확장 — 코드 없이 마케팅·SNS 파이프라인"으로 정의
- 혁신 8 도입부(L1563-1565)에 Brief 참조 없음
- 혁신 5-7은 각각 Brief 3대 문제와 implicit 연결이 있으나, 혁신 8만 Brief 연결이 약함
- **요청**: L1563 또는 L1565에 "(Brief §4 Layer 2)" 참조 1개 추가

---

## Cross-talk 요청

- **Sally (UX)**: CEO 체감 혁신 7건(L1587-1594) 중 #4 "사무실이 살아있다"가 Sprint 4(마지막)인데, CEO 김도현 첫인상에서 가장 임팩트가 큰 항목. Sprint 4까지 CEO 리텐션을 유지할 UX 전략이 검증 접근법에 필요한지? 아니면 Sprint 1 Big Five가 충분한 초기 WOW factor인지?

---

---

## Re-Verification (Fixes Applied)

### 검증 결과 (5건 — 내 이슈 4 + Sally cross-talk 1)

| # | 이슈 | 상태 | 검증 위치 |
|---|------|------|---------|
| 1 | Go/No-Go #7 검증 테이블 누락 | ✅ 해결 | L1648: "v3 품질 게이트" 테이블에 #7 행 — Haiku ≤ $0.10/day, 크론 일시 중지 |
| 2 | Brief 3대 문제 ↔ v3 혁신 매핑 | ✅ 해결 | L1443-1447: 블랙박스→OpenClaw, 획일성→Big Five, 학습 단절→Memory, 자동화 부재→n8n |
| 3 | v3 API 회귀 cross-cutting 리스크 | ✅ 해결 | L1646: "485 API smoke-test + 10,154 기존 테스트" Go/No-Go #1, 전 Sprint 공통 |
| 4 | 혁신 8 Brief §4 Layer 2 참조 | ✅ 해결 | L1571: "(Sprint 2, Brief §4 Layer 2)" |
| 5 | Go/No-Go #8 검증 테이블 누락 (Sally) | ✅ 해결 | L1649: "에셋 품질 PM 승인" Go/No-Go #8, Sprint 4 착수 선행 |

### 타 Critic 수정사항 교차 확인

| 수정 | 상태 | 검증 |
|------|------|------|
| n8n 혁신 계층 "과금"→"자동화" 분리 (Winston) | ✅ | L1456 "자동화" 계층 신설, 과금은 "유지"로 |
| v2 학습 "없음"→"기초" (Quinn+Winston) | ✅ | L1457 "memory-extractor 1단계 (키워드 추출·벡터 저장)" |
| AutoGen/CrewAI Memory 비교 정확화 (Quinn+Winston) | ✅ | L1552-1558: Teachability+Mem0 하이브리드, 4-type. Reflection+성장 측정은 CORTHEX 유일 |
| Reflection advisory lock + rate limit (Quinn) | ✅ | L1671 "advisory lock으로 동시 실행 방지, rate limit 준수" |
| 6개월 선점 수치 근거 (Sally) | ✅ | L1618 "v2 6개월 + v3 4개월 = 경쟁자 10개월, 6개월 차이" |
| WebGL 2 지원률 97%+ (Quinn) | ✅ | L1522 "caniuse.com 2026-03 기준" |
| 혁신 1 v3 강화 예시 (Quinn) | ✅ | L1477 "성실성 90 vs 20" 구체적 행동 차이 |
| activity_logs LISTEN/NOTIFY (Winston) | ✅ | L1517 "LISTEN/NOTIFY + 폴링 하이브리드" |

### Re-Score

| 차원 | 초기 | 수정 후 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 9 | 9 | 유지. WebGL 97%+, 6개월 수치 근거 추가로 강화 |
| D2 완전성 | 8 | 9 | Go/No-Go #7, #8 검증 행 추가 + Brief 매핑 추가 + #1 회귀 행 추가. 8개 게이트 전부 검증 테이블 커버 |
| D3 정확성 | 9 | 10 | AutoGen/CrewAI Memory 비교 WebSearch 검증 후 정확화. Teachability+Mem0, 4-type 반영. 할루시네이션 0 |
| D4 실행가능성 | 8 | 9 | advisory lock, LISTEN/NOTIFY, 혁신 1 예시(성실성 90 vs 20) 추가 |
| D5 일관성 | 8 | 9 | Brief 연결 명시 (3대 문제 + §4 Layer 2), 혁신 계층 "자동화" 분리로 n8n 위치 정확 |
| D6 리스크 | 8 | 9 | advisory lock + rate limit, #1 cross-cutting 회귀 리스크, 에셋 #8 Sprint 4 선행 |

### 가중 평균: 9.15/10 ✅ PASS (Grade A)

계산: (9×0.20) + (9×0.20) + (10×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.50 + 1.35 + 0.90 + 1.80 = **9.15**

---

## 총평

v2→v3 혁신 확장이 매우 체계적. 혁신별 "뒤집는 가정 → 시장 비교 → 구현 패턴 → 리스크 → 검증" 5단 구조가 일관적이고, Stage 1 Research 결정사항과의 정합성 우수. v2 혁신 4건이 v3 추가로 왜곡되지 않고 "기반→확장" 관계가 명확.

주요 개선 포인트: Go/No-Go #7 검증 행 추가(1행), Brief 3대 문제 매핑 명시(1줄). 둘 다 미니 수정.
