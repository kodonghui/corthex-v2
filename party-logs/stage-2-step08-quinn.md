# Critic-B Review — Step 08 Scoping & Phased Development

**Reviewer**: Quinn (QA + Security)
**Date**: 2026-03-21
**Weights**: D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Sprint 테이블: Go/No-Go 번호, 블로커 조건, 의존성 구체적. 리스크 테이블: 확률(높/중/낮) + 영향(이모지 4단계) + Sprint 번호 + 완화 전략. 오픈소스: 패키지명 + 버전(n8n 2.12.3, pixi.js 8.17.1, @pixi/react 8.0.5, @pixi/tilemap 5.0.2) + npm 링크. FR 매핑 21건 Sprint 번호 명시. 9주(낙관 7/비관 12) 일정 범위. |
| D2 완전성 | 8/10 | MVP 2단계 전략 + v3 Sprint 4개 + 순서 근거 + 실패 전략 + 리스크 14건(v2 9 + v3 7) + 오픈소스 Phase 1~4 + v3 Sprint 1~4 + FR 매핑 21건 + 여정 지원 매트릭스. 단, v3 Sprint 리스크 7건 중 6건이 Step 06 혁신 리스크와 내용 중복 (아래 이슈 #1). Sprint 2.5 분할 트리거 기준 미정의 (이슈 #3). |
| D3 정확성 | 8/10 | Go/No-Go 8개 게이트 Sprint 매핑 정확 ✅. FR 21건 Sprint 매핑: FR-OC1~8→Sprint 4, FR-N8N1~5→Sprint 2, FR-MEM1~8→Sprint 3, FR-PERS1~5→Sprint 1 전부 정확 ✅. Sprint 순서 근거가 Brief §4 Layer 순서와 정합 ✅. 단, **FR-OC2(L2277) "회사별 최대 50개 동시 연결"과 Step 07 통합 목록(L1794) "per-company 연결 상한 10" 불일치** — 5배 차이 (아래 이슈 #2). |
| D4 실행가능성 | 9/10 | Sprint 테이블의 블로커 조건이 구현자에게 명확한 Go/No-Go 체크리스트. FR 매핑이 Sprint별 작업 범위를 직접 정의. 오픈소스 테이블이 "대체 대상" 컬럼으로 마이그레이션 경로 명확. 실패 전략 "Sprint별 독립 롤백"이 실행 가능. |
| D5 일관성 | 7/10 | Sprint 순서 ↔ Brief §4 ✅. Go/No-Go 번호 ↔ Step 06 품질 게이트 ✅. FR Sprint 배정 ↔ Step 05 도메인 요구사항 ✅. 단, **FR-OC2 WS 연결 상한 50 vs Step 07 L1794 상한 10은 심각한 불일치** (이슈 #2). Step 08 v3 리스크 ↔ Step 06 혁신 리스크 내용 중복이지만 상호 참조 없음 (이슈 #1). |
| D6 리스크 | 7/10 | v2 기술 4건 + 시장 3건 + 리소스 2건 + v3 7건 = 16건 리스크 커버. Sprint별 독립 롤백 + Sprint 2.5 분할 옵션. 단, v3 리스크 6/7건이 Step 06 복사본 (이슈 #1). Sprint 2 과부하 트리거 부재 (이슈 #3). Sprint 간 의존성 실패 시 연쇄 영향 분석 없음 (이슈 #4). |

## 가중 평균: 7.80/10 ✅ PASS

(9×0.10) + (8×0.25) + (8×0.15) + (9×0.10) + (7×0.15) + (7×0.25) = 0.90 + 2.00 + 1.20 + 0.90 + 1.05 + 1.75 = **7.80**

---

## 이슈 목록

### HIGH (1건)

**1. [D5 일관성] FR-OC2 WebSocket 연결 상한 — 50 vs 10 불일치**

- **위치**: L2277 (FR-OC2) vs L1794 (Step 07 통합 목록)
- **문제**: FR-OC2에서 `/ws/office` 회사별 동시 연결을 **50개**로 정의. Step 07 Technical Architecture Context 통합 목록(L1794)에서는 **10개**로 정의. 5배 차이. 구현자가 어느 값을 따를지 모호. 보안 관점에서 50개는 DoS 표면이 넓고, 10개는 정상 사용에 부족할 수 있음.
- **수정 제안**: 하나로 통일. 보안 vs 사용성 트레이드오프 판단 필요:
  - 10개: 소규모 회사(Admin 1~2명 + CEO 1명) 충분. 보안 안전
  - 50개: 대규모 회사(Admin 5명 + 직원 다수) 대비. DoS 리스크 증가
  - **제안**: 20~30개 절충 또는 Tier별 차등 (Basic: 10, Pro: 30, Enterprise: 50). 양쪽 모두 동일 값으로 수정

### MEDIUM (2건)

**2. [D2/D6 완전성·리스크] v3 Sprint 리스크 — Step 06 혁신 리스크와 6/7건 내용 중복**

- **위치**: L2057-2065 (Step 08 v3 리스크) vs L1663-1673 (Step 06 혁신 리스크)
- **문제**: Step 08 v3 리스크 7건 중 6건(n8n OOM, PixiJS 번들, Reflection 비용, agent_memories 단절, 스프라이트 재현, sanitization 우회)이 Step 06 혁신 리스크와 동일 내용·동일 완화 전략. 유일한 신규는 "Sprint 2 과부하". 중복은 문서 유지보수 부담 증가 + 한쪽만 수정 시 불일치 발생 리스크.
- **수정 제안**: 두 가지 옵션:
  - **A) 참조 통합**: Step 08 v3 리스크 테이블을 "Sprint 2 과부하" 1건만 유지 + "v3 혁신 리스크 7건은 Innovation & Novel Patterns §혁신 리스크 완화 참조" 1행 추가
  - **B) 관점 분리**: Step 08은 "Sprint 일정 영향" 관점 컬럼 추가 (예: "Sprint 지연 예상일수"), Step 06은 "혁신 실패 시 제품 영향" 유지 — 동일 리스크를 다른 렌즈로 분석

**3. [D6 리스크] Sprint 2 과부하 — 분할 트리거 기준 미정의**

- **위치**: L2059 (Sprint 2 과부하), L1986 (실패 전략)
- **문제**: "Sprint 2 과부하 (15건+ 동시)" 리스크와 "Sprint 2.5 분할 가능" 완화가 있으나, **언제** 분할을 결정하는지 트리거 기준이 없음. "15건+"이 Sprint 2 작업 수를 의미한다면, 현재 Step 05에서 Sprint 2는 11건(N8N-SEC 6 + MKT 5). FR 매핑에서는 FR-N8N 5건 추가. 어느 시점에 2.5 분할을 실행하는가?
- **수정 제안**: 구체적 트리거 추가: "Sprint 2 착수 1주차 완료 시점에 완료율 < 30%이면 Sprint 2.5 분할 실행" 또는 "스토리 포인트 합산 > N이면 분할" 등 정량 기준

### LOW (1건)

**4. [D6 리스크] Sprint 의존성 연쇄 실패 분석 미흡**

- **위치**: L1971-1976 (Sprint 테이블 의존성 컬럼)
- **문제**: Sprint 2→Sprint 1, Sprint 3→Sprint 1, Sprint 4→Sprint 1~3 의존성이 명시됨. "Sprint별 독립 롤백 가능"(L1985)이라고 하지만, Sprint 1 실패 시 Sprint 2~4 전부 블록되는 연쇄 영향이 분석되지 않음. Sprint 1이 의존성 루트이므로 Sprint 1 지연 = 전체 v3 지연.
- **수정 제안**: Sprint 1 지연 시 대응 전략 1줄 추가: "Sprint 1 지연 시: Sprint 2 n8n Docker는 독립 인프라이므로 Sprint 1과 병렬 착수 가능. Sprint 3~4는 Sprint 1 완료 대기." 또는 의존성 그래프에서 병렬 가능 구간 명시.

---

## Cross-talk 요약

Winston(Critic-A, Architecture)과 교차 검토 필요:

1. **FR-OC2 WS 연결 상한 50 vs 10**: 아키텍처 관점에서 적정 값 판단. 서버 메모리 관점에서 WS 연결당 리소스 추정 → 적정 상한 도출 필요
2. **Sprint 의존성 병렬화 가능성**: Sprint 1과 Sprint 2 n8n Docker가 실제로 병렬 가능한지 — soul-enricher.ts 통합 지점이 Sprint 2에서 필수인지 확인

---

## 긍정 평가

1. **MVP 2단계 전략**이 fail-fast 원칙에 충실. MVP-A(기술 검증) → MVP-B(가치 검증) 순서가 리스크 제거 관점에서 정확.
2. **Sprint 순서 근거** 4개 항목이 Brief §4와 정합하며, soul-enricher.ts 주입 경로 선제 확보 → n8n/메모리 순서가 기술적으로 타당.
3. **오픈소스 활용 전략**이 Phase 1~4 + v3 Sprint 1~4 전부 커버. "대체 대상" 컬럼이 마이그레이션 판단에 유용.
4. **FR Sprint 매핑 21건**이 Step 05 도메인 요구사항과 정확히 정합. Sprint별 작업 범위가 명확.
5. **실패 전략** "Sprint별 독립 롤백"이 v3 기능을 Layer로 분리한 아키텍처의 강점을 활용.

---

## 재검증 (Fixes Applied)

**Date**: 2026-03-21

### 수정 확인 (내 이슈 4건 + CT-1건 + 타 Critic 5건):

| # | 이슈 | 상태 | 확인 위치 |
|---|------|------|---------|
| 1 | WS 연결 상한 50 vs 10 통일 | ✅ 반영 | L1794: "per-company 연결 상한 20, 초과 시 idle 연결 graceful eviction". FR-OC2 L2276: "회사별 최대 20개 동시 연결 (초과 시 idle 연결 graceful eviction)". 양쪽 20으로 통일 + graceful eviction 추가 |
| 2 | v3 리스크 6건 중복 제거 | ✅ 반영 | L2057: "고유 항목만. 혁신별 기술 리스크 상세·폴백은 §Innovation 혁신 리스크 완화 참조" — Option A 적용. 고유 2건만 유지 |
| 3 | Sprint 2.5 분할 트리거 | ✅ 반영 | L2061: "**분할 트리거**: Sprint 2 중간 리뷰 시점에 인프라 트랙(n8n Docker+보안) 미완료 시 워크플로우 트랙을 Sprint 2.5로 이월" |
| 4 | Sprint 의존성 연쇄 실패 | ✅ 반영 | L2062: "Sprint 2 n8n Docker는 soul-enricher.ts 비의존(독립 컨테이너) → Sprint 1 Big Five 미완료 시에도 n8n 인프라 트랙 병렬 착수 가능" — 리스크 테이블에 신규 행으로 추가 |
| CT-1 | Sprint 2 의존성 정밀화 | ✅ 반영 | L2062 동일 행에서 "soul-enricher.ts 주입 경로만 Sprint 1 필수" 명시. Sprint 테이블 L1974 의존성 컬럼은 미수정이나 리스크 테이블에서 보완 |
| 5 | Pre-Sprint / Layer 0 주석 | ✅ 반영 | L1988: "※ Pre-Sprint (디자인 토큰 확정) 및 Layer 0 UXUI 리셋은 전 Sprint 병행 — Go/No-Go #6 참조" |
| 6 | @pixi/tilemap vs pixi-tiledmap | ✅ 반영 | L2112: 양쪽 병기 + 선택 근거("low-level renderer vs Tiled JSON parser") + "Sprint 4 착수 시 에셋 파이프라인에 따라 확정" |
| 7 | Gemini Embedding 재활용 | ✅ 반영 | L2107: "Phase 4 @google/genai 재활용" + "Epic 10 인프라 재활용" + "신규 Embedding 인프라 구축 불필요" |
| 8 | llm-cost-tracker v3 제거 대상 | ✅ 반영 | L2077: "**(v3 제거 대상 — CLI Max 월정액, GATE 2026-03-20)**" |
| 9 | pg-boss 큐잉 라이브러리 | ✅ 반영 | L2108: 조건부 추가 + "아키텍처에서 스케줄링 전략 확정 후 채택 여부 결정" + 대체 대상 명시 |

### 추가 확인:

- **WS 연결 상한 20**: Quinn/Winston은 10을 제안했으나, Bob+Sally cross-talk에서 20 + graceful eviction으로 합의. 보안 관점에서 20은 수용 가능 — graceful eviction이 DoS 방어 역할 수행 (idle 연결 자동 해제). 100社 × 20 = 2,000 WS ≈ 200MB (Winston 추정 기준 연결당 ~100KB) — VPS 24GB 여유 충분
- **Sprint 테이블 L1974 의존성 컬럼 미수정**: CT-1에서 Sprint 2 의존성 컬럼 수정을 제안했으나, 리스크 테이블 L2062에서 동일 내용이 보완됨. 두 곳에서 정보가 분산되나, 리스크 테이블이 더 상세하므로 수용 가능

### 재검증 차원별 점수:

| 차원 | 초기 | 재검증 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 9 | 9 | WS 20 + graceful eviction 구체적. Sprint 2.5 트리거 "중간 리뷰 시점 인프라 미완료 시" 구체적. pg-boss 조건부 + 대안 명시 |
| D2 완전성 | 8 | 9 | 리스크 중복 제거 + §Innovation 참조 = 문서 구조 개선. Pre-Sprint 주석, Gemini Embedding 재활용, llm-cost-tracker 제거 표기, pixi-tiledmap 병기 — 오픈소스 커버리지 완전 |
| D3 정확성 | 8 | 9 | WS 상한 양쪽 20으로 통일. 기술 주장 정확 (pg-boss PostgreSQL 네이티브 ✅, Gemini Embedding Epic 10 재활용 ✅) |
| D4 실행가능성 | 9 | 9 | Sprint 1 지연 시 n8n 병렬 착수 경로 명확. @pixi/tilemap vs pixi-tiledmap 선택 기준 제시 |
| D5 일관성 | 7 | 9 | WS 상한 통일 (L1794 = FR-OC2 = 20). 리스크 테이블 §Innovation 참조로 중복 해소. Sprint 테이블 의존성 컬럼은 미수정이나 리스크 테이블에서 보완 |
| D6 리스크 | 7 | 9 | Sprint 2.5 트리거 정량화. Sprint 1 지연 대응(n8n 병렬) 명시. graceful eviction으로 WS DoS 방어. pg-boss 조건부 채택으로 Reflection 부하 리스크 대응 |

### 재검증 가중 평균: 9.00/10 ✅ PASS

(9×0.10) + (9×0.25) + (9×0.15) + (9×0.10) + (9×0.15) + (9×0.25) = 0.90 + 2.25 + 1.35 + 0.90 + 1.35 + 2.25 = **9.00**

### 잔존 이슈: 0건

---
