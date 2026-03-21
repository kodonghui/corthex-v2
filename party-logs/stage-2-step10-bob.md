# Critic-C Review — Step 10 Non-Functional Requirements

**Reviewer**: Bob (Scrum Master / Product + Delivery)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L2341–2486 (NFR 전체)
**Rubric**: Critic-C weights (D1=20%, D2=20%, D3=15%, D4=15%, D5=10%, D6=20%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 14개 신규 NFR 전부 정량적 목표 명시 (P13 ≤3초/≤200KB, P14 ≤2초, P16 ≤30초, SC9 4GB/2CPU, COST3 ≤$0.10/일). 측정 방법 컬럼 포함. Sprint 태그 전부 부착. 2건 모호: NFR-S9 "전부 통과"에 100% 명시 없음, NFR-P15 heartbeat 3단계→2단계 단순화 |
| D2 완전성 | 8/10 | 12개 카테고리 73건(활성). Step 09 carry-forward 2건(S7 삭제, NRT-2→P15) 전부 반영. 우선순위 요약 테이블(L2477-2485) 포함. **NFR-SC7 "Oracle VPS 4GB 기준"이 실제 VPS 24GB(Stage 1 L391, L550)와 모순** — v2 작성 시 잔존 수치 |
| D3 정확성 | 9/10 | Go/No-Go #5(번들 200KB)→NFR-P13, #7(Reflection 비용)→NFR-COST3 정확 매핑. Step 05 PER-1 4-layer→NFR-S8, N8N-SEC 6개→NFR-S9 정합. CLI Max 삭제(S7, D7) 완전. Stage 1 R6(Docker 4G/2CPU)→NFR-SC9 정확 |
| D4 실행가능성 | 9/10 | 각 NFR에 측정 방법 명시 (Lighthouse, Vite 빌드, 타이머, 네트워크 테스트). Sprint별 시기 태그로 검증 시점 명확. P0 22개 릴리스 블로커 식별로 Sprint Planning 진입 준비 완료 |
| D5 일관성 | 8/10 | NFR↔FR 수치 중복 3건: SC8↔FR-OC2(20 연결), A6↔FR-OC10(aria-live), A7↔FR-OC9(모바일 리스트). 기능(FR)과 품질(NFR) 분리 의도 이해되나, 동일 수치·문구 반복. NFR-SC7 "4GB"↔SC9 "VPS 전체 ≤80%" 기준 모순 |
| D6 리스크 | 9/10 | CLI Max 모순 완전 제거(S7, D7 삭제 + 취소선 + 사유). NFR-O9(n8n health) + O10(Reflection lock)으로 운영 리스크 커버. NFR-COST3에 Stage 1 추정($0.06/day) 참조. 우수 |

---

## 가중 평균: 8.70/10 ✅ PASS (Grade B)

계산: (9×0.20) + (8×0.20) + (9×0.15) + (9×0.15) + (8×0.10) + (9×0.20) = 1.80 + 1.60 + 1.35 + 1.35 + 0.80 + 1.80 = **8.70**

---

## 이슈 목록

### 1. **[D2 완전성] NFR-SC7 "Oracle VPS 4GB 기준" — 실제 24GB와 모순** — MEDIUM
- NFR-SC7 (L2390): "pgvector HNSW 인덱스 포함 ≤ 3GB (**Oracle VPS 4GB 기준**)"
- Stage 1 Technical Research L391: "VPS **15.5GB 여유**" (n8n 4GB 할당 후)
- Stage 1 L550: "Oracle VPS **24GB** 기준"
- 4GB는 v2 초기 추정치가 잔존한 것. 실제 VPS는 ARM64 Ampere 24GB
- **요청**: NFR-SC7을 "pgvector HNSW 인덱스 포함 ≤ 3GB (Oracle VPS 24GB — 전체 메모리 예산은 NFR-SC9 참조)" 로 정정

### 2. **[D1 구체성] NFR-P15 heartbeat 단순화 — NRT-2 3단계 미반영** — LOW
- NRT-2 도메인 요구사항 (L1413): "heartbeat **5초** 간격. **15초** 미응답 시 degraded. **30초** 미응답 시 error" (3단계)
- NFR-P15 (L2363): "idle **30초** / active **5초**. 3회 미수신 시 재연결" (2단계)
- NRT-2는 에이전트 상태 감지(server→client), NFR-P15는 WS 연결 유지(client→server) — 다른 관심사이지만, 15초 degraded 전환 기준이 NFR에 미반영
- **요청**: NFR-P15에 "(에이전트 상태 감지 기준: NRT-2 참조)" 주석 추가. 또는 NFR-P15를 "idle 30초 / active 5초 / degraded 15초" 3단계로 확장

### 3. **[D5 일관성] NFR↔FR 수치 중복 3건** — LOW
- NFR-SC8 "20 동시 연결 + eviction" ↔ FR-OC2 동일 문구
- NFR-A6 "aria-live polite 텍스트 대안" ↔ FR-OC10 동일 문구
- NFR-A7 "모바일/태블릿 리스트 뷰" ↔ FR-OC9 동일 문구
- FR은 "기능 존재", NFR은 "품질 수준" — 분리 의도는 이해하나, 현재 문구가 사실상 동일
- **요청**: NFR 쪽을 측정 중심으로 차별화. 예: NFR-SC8 "20 연결 부하 테스트: 21번째 연결 시 idle eviction ≤ 500ms + 신규 연결 성공 확인"

### 4. **[D1 구체성] NFR-S9 측정 기준 "전부 통과" — 수치 미명시** — LOW
- NFR-S8: "4-layer **100%** 통과" — 명확
- NFR-S9: "Docker network → ... → rate limiting **전부 통과**" — "100%"가 빠짐
- **요청**: "6-layer **100%** 통과" 로 통일

---

## Cross-talk 요청

- **Sally (UX)**: NFR-A5 슬라이더 접근성 (aria-valuenow + Arrow keys)이 FR-PERS8 행동 예시 툴팁과 결합될 때, 스크린리더에서 "성실성: 90. 예시: 체크리스트 자동 생성" 같은 복합 안내가 필요한지? 아니면 aria-label은 특성명만으로 충분한지?

---

## Step 09 Carry-Forward 검증

| 항목 | 상태 | 검증 |
|------|------|------|
| NFR-S7 cost-tracker 삭제 | ✅ | L2376: 취소선 + "CLI Max 월정액, cost-tracker v3 제거 대상" 사유 |
| NRT-2 heartbeat → NFR | ✅ | L2363: NFR-P15 적응형 heartbeat 추가 |

---

## 총평

CLI Max 모순 2건(S7, D7) 깔끔하게 삭제하고, v3 Sprint 1~4 NFR 14건을 체계적으로 추가. 특히 NFR-S8(4-layer), S9(6-layer) 보안 NFR이 Step 05 도메인 요구사항을 충실히 반영. NFR-COST3의 Go/No-Go #7 연동과 Stage 1 추정치($0.06/day) 참조가 검증 가능성을 높임. 우선순위 요약 테이블(P0 22개, P1 37개, P2 14개)이 Sprint Planning 진입에 즉시 활용 가능.

주요 수정: **NFR-SC7 VPS 메모리 "4GB→24GB" 정정** (MEDIUM). 나머지 3건은 주석/문구 수준.

---

## Re-Verification (Fixes Applied)

### 검증 결과 (4건 내 이슈 + 5건 타 Critic = 9건)

| # | 이슈 | 상태 | 검증 위치 |
|---|------|------|---------|
| 1 | NFR-SC7 VPS "4GB→24GB" (MEDIUM) | ✅ 해결 | L2391: "(PostgreSQL 할당 메모리 4GB 기준, VPS 총 24GB)" — PostgreSQL 할당과 VPS 총량 구분 명확 |
| 2 | NFR-P15 heartbeat 2→3-tier (LOW) | ✅ 해결 | L2363: "active 5초 / moderate 15초 / idle 30초 (NRT-2 기준)" — 3단계 + NRT-2 참조 |
| 3 | NFR↔FR 교차 참조 (LOW) | ✅ 해결 | L2392: "FR-OC2 기능 기준, NFR은 성능 검증", L2412: "FR-OC10 품질 기준", L2413: "FR-OC9 품질 기준" |
| 4 | NFR-S9 "100% 통과" (LOW) | ✅ 해결 | L2379: "rate limiting 100% 통과" |

### 타 Critic 수정사항 교차 확인

| 수정 | 상태 | 검증 |
|------|------|------|
| NFR-D8 observations/reflections 보존 (Quinn) | ✅ | L2426: "observations 90일, reflections 무기한. 90일 초과 자동 아카이브" |
| NFR-SC8 역할 분리 (Sally) | ✅ | L2392: "부하 테스트 통과 + eviction (FR-OC2 기능 기준, NFR은 성능 검증)" |
| NFR-EXT3 MKT 영상 타임아웃 (Quinn) | ✅ | L2434: "MKT 영상 생성은 최대 5분 허용" |
| NFR-P17 MKT E2E 시간 (Sally) | ✅ | L2365: "이미지 ≤2분, 영상 ≤10분, 게시 ≤30초" |
| 총수 정정 | ✅ | L2488: 74개 활성 (v2 58 + v3 16), P0 21 / P1 42 / P2 10 / CQ 1 |

### Re-Score

| 차원 | 초기 | 수정 후 | 변화 근거 |
|------|------|--------|---------|
| D1 구체성 | 9 | 9 | P15 3-tier, S9 100% 추가로 강화 |
| D2 완전성 | 8 | 9 | SC7 정정 + D8(observations 보존) + P17(MKT E2E) 추가 |
| D3 정확성 | 9 | 9 | 유지 |
| D4 실행가능성 | 9 | 9 | 유지 |
| D5 일관성 | 8 | 9 | FR↔NFR 교차 참조 + SC7↔SC9 VPS 정합 |
| D6 리스크 | 9 | 9 | 유지. EXT3 영상 타임아웃 예외로 MKT 장애 대응 강화 |

### 가중 평균: 9.00/10 ✅ PASS (Grade A)

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 총평 (수정 후)

9건 수정 전부 정확 반영. NFR-SC7 VPS 메모리 정정(PostgreSQL 4GB vs VPS 24GB 구분)으로 인프라 예산 혼란 제거. NFR↔FR 역할 분리(기능 vs 검증)가 Sprint 실행 시 개발자↔QA 참조 포인트 명확화. NFR-D8(observations 보존 정책) + NFR-P17(MKT E2E) 추가로 데이터 수명주기와 마케팅 성능 기준 완비.

---

## Re-Verification v2 (Cross-talk 추가 수정)

### 추가 검증 (3건)

| # | 수정 | 상태 | 검증 |
|---|------|------|------|
| 1 | NFR-P15 3-tier 철회 → 2-tier + 스코프 주석 | ✅ | L2363: "idle 30초 / active 5초" 2-tier 유지 + "(WS transport keep-alive — NRT-2 에이전트 상태 전환과 별개. WS 끊김 시 NRT-2도 error 전환)" |
| 2 | NRT-2 스코프 주석 추가 | ✅ | L1413: "(Application layer 에이전트 상태 전환 — NFR-P15 WS keep-alive와 별개)" |
| 3 | NFR-S9 N8N-SEC-1~6 매핑 정렬 | ✅ | L2379: "N8N-SEC-1~6 100% 통과: 포트 차단(SEC-1) → ... → DB 직접 접근 차단(SEC-6) + proxy rate limiting(100 req/min/Admin)" |

### 평가

- **NFR-P15↔NRT-2 분리 판단 정확**: WS transport keep-alive(연결 유지)와 application layer 에이전트 상태 전환(비즈니스 로직)은 별개 메커니즘. 캐스케이드 관계(WS 끊김→NRT-2 error) 명시로 연결점도 문서화. 이전 3-tier 통합은 잘못된 방향이었음 — Winston 철회 합당
- **NFR-S9 N8N-SEC 매핑**: 추상적 "6-layer"에서 N8N-SEC-1~6 구체적 매핑으로 변경. 100 req/min 수치 포함. 검증 시 체크리스트로 직접 활용 가능

### 최종 점수: 9.00/10 유지 (Grade A)

cross-talk 수정은 D1(구체성)과 D5(일관성) 품질을 강화하나, 이미 9/10이므로 점수 변동 없음.
