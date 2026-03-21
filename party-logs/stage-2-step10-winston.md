# Critic-A Review — Step 10 Non-Functional Requirements

> Reviewer: Winston (Architect + API)
> Date: 2026-03-21
> Target: `_bmad-output/planning-artifacts/prd.md` L2341–2486 (NFR 섹션 전체)
> Step: `step-10-nfr.md` — Non-Functional Requirements

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 14개 신규 NFR 전부 수치 기준 포함: FCP ≤3초, ≤200KB, ≤2초, 30초/5초, ≤30초, 20연결, 4GB/2CPU, ≤$0.10/일. Go/No-Go #5,#7 참조. 측정 방법 전부 명시. |
| D2 완전성 | 15% | 9/10 | 6개 카테고리(성능·보안·확장성·접근성·비용·운영) 전부 커버. CLI Max 모순 2건(S7, D7) 삭제. FR-OC/PERS/MEM/N8N 모든 v3 도메인의 품질 목표 NFR화. |
| D3 정확성 | 25% | 8/10 | Go/No-Go 매핑 정확. Step 06~09 수치 일관. 4-layer 보안 스택 정확. **단, 이슈 #3 참조 (NFR-S9 6-layer ↔ N8N-SEC 갭 2건), 이슈 #4 참조 (NFR-SC7 VPS 4GB 오류).** |
| D4 실행가능성 | 20% | 9/10 | 전부 측정 방법 명시(Lighthouse, Vite, 타이머, 네트워크 테스트). P0/P1/P2 우선순위로 릴리스 게이트 명확. Sprint 태그로 스케줄링 가능. |
| D5 일관성 | 15% | 9/10 | Step 06 4-layer→NFR-S8 ✅. Step 07 Docker→NFR-SC9 ✅. Step 08 WS 20→NFR-SC8 ✅. Step 06 Reflection→NFR-COST3 ✅. advisory lock→NFR-O10 ✅. |
| D6 리스크 | 10% | 8/10 | P0 우선순위 적절 배정. n8n health check(NFR-O9), Reflection 안정성(NFR-O10), 비용 게이트(NFR-COST3) 핵심 리스크 커버. |

## 가중 평균: 8.65/10 ✅ PASS

`(0.15×9) + (0.15×9) + (0.25×8) + (0.20×9) + (0.15×9) + (0.10×8) = 1.35 + 1.35 + 2.00 + 1.80 + 1.35 + 0.80 = 8.65`

---

## 이슈 목록

### 1. ~~**[D3 정확성] LOW — NFR-P15 heartbeat 2단계 vs NRT-2 3단계**~~ **철회**

- ~~NFR-P15: "적응형 간격: idle 30초 / active 5초"~~
- ~~Step 05 NRT-2: "heartbeat 5s/15s/30s" — 3단계 (active/moderate/idle)~~
- **철회 사유**: Quinn cross-talk에서 NRT-2(Application layer, 에이전트 상태 전환)와 NFR-P15(Transport layer, WS ping/pong 연결 유지)가 **아키텍처적으로 별개 메커니즘**임을 확인. 2단계 vs 3단계 불일치가 아님.
- **대체 권고**: NFR-P15에 "(WS transport keep-alive, NRT-2 에이전트 상태와 별개)" 스코프 주석 추가, NRT-2에도 "(Application layer — 에이전트 상태 전환 타이머)" 추가, 캐스케이드 관계 명시: "WS 끊김(NFR-P15) → NRT-2 error 전환"

### 2. **[D1 구체성] LOW — NFR 총수 73 vs 실제 72 (off by 1)**

- L2485: "총 활성 73개 (v2 59 + v3 14)"
- 실제 카운트: 16+8+9+3+7+6+3+10+3+3+3+1 = **72개** 활성
- **수정 제안**: 72로 정정 또는 누락된 1개 확인

### 3. **[D3/D5 정확성+일관성] MEDIUM — NFR-S9 6-layer ↔ N8N-SEC 매핑 갭 2건** (Quinn CT-1)

NFR-S9: "n8n 6-layer 보안 스택 (Docker network → Hono proxy → API key → webhook HMAC → tag isolation → rate limiting)"

**정확한 매핑:**

| NFR-S9 Layer | N8N-SEC | 상태 |
|---|---|---|
| 1. Docker network | N8N-SEC-1 (포트 차단) | ✅ |
| 2. Hono proxy | N8N-SEC-2 (Admin JWT) | ✅ |
| 3. API key | **없음** | ⚠️ GAP |
| 4. webhook HMAC | N8N-SEC-4 | ✅ |
| 5. tag isolation | N8N-SEC-3 | ✅ |
| 6. rate limiting | **없음** (N8N-SEC-6은 DB 접근 금지) | ⚠️ GAP |

- **Layer 3 "API key"**: n8n 자체 인증(`N8N_BASIC_AUTH_USER/PASSWORD`) 의미. Hono proxy(Layer 2)와 별개 — Layer 2는 경유 강제, Layer 3는 n8n 내부 인증. 별도 N8N-SEC 항목 추가 필요 (N8N-SEC-8)
- **Layer 6 "rate limiting"**: L1792에 "proxy rate limit(100 req/min/Admin)" 언급이나 N8N-SEC 전용 항목 없음. 별도 N8N-SEC 항목 추가 필요 (N8N-SEC-9)
- **수정 제안**: Step 07 N8N-SEC에 2건 추가 (N8N-SEC-8 API key 인증, N8N-SEC-9 rate limiting) + NFR-S9 레이어 명칭을 N8N-SEC과 정확히 정렬

### 4. **[D3 정확성] MEDIUM — NFR-SC7 "Oracle VPS 4GB 기준" 오류** (Quinn 질의)

- NFR-SC7 (L2390): "pgvector HNSW 인덱스 포함 ≤ 3GB (**Oracle VPS 4GB** 기준)"
- 실제 VPS: Oracle ARM64 **24GB** (L550, L391)
- "4GB"는 PostgreSQL 메모리 할당을 의미하는 것으로 추정되나, 아키텍처 문서에 PG 할당 정의가 없음
- **수정 제안**: "(PostgreSQL shared_buffers 4GB 기준)"으로 괄호 수정 또는 VPS 메모리 예산 테이블 추가

---

## 검증 방법

| 확인 항목 | 방법 | 결과 |
|---------|------|------|
| NFR-S7 삭제 (CLI Max) | L2376 strikethrough | ✅ |
| NFR-D7 삭제 (CLI Max) | L2424 strikethrough | ✅ |
| NFR-P13 번들 = Go/No-Go #5 | Brief L447 "< 200KB gzipped" | ✅ |
| NFR-COST3 = Go/No-Go #7 | Brief L449 + Step 06 L1648 | ✅ |
| NFR-S8 = 4-layer (PER-1) | Step 05 L1371 + Step 06 L1669 | ✅ |
| NFR-SC8 WS 20 = Step 08 합의 | Step 08 L1794 + L2276 | ✅ |
| NFR-SC9 4GB/2CPU = Step 07 | Step 07 N8N-SEC-5 | ✅ |
| NFR-O10 advisory lock = Step 06 | Step 06 L1671 | ✅ |
| NFR-P14 ≤2초 = NRT-4 | Step 05 NRT-4 "지연 ≤2s" | ✅ |
| NFR-P15 heartbeat 스코프 | NRT-2 vs NFR-P15 별개 메커니즘 확인 (Quinn CT-2) | ✅ 별개 |
| NFR-S9 6-layer ↔ N8N-SEC | Quinn CT-1 교차 검증 | ⚠️ 2건 갭 |
| NFR-SC7 VPS 메모리 | L550 "24GB", L391 "15.5GB 여유" | ⚠️ "4GB" 오류 |
| NFR-A5~A7 FR 보완 관계 | FR-PERS1, FR-OC10, FR-OC9 | ✅ |

---

## Cross-talk 완료

Quinn (QA + Security)과의 교차 검토 완료:
- **CT-1 NFR-S9 6-layer**: N8N-SEC 매핑 갭 2건 발견 (Layer 3 API key, Layer 6 rate limiting). N8N-SEC-8, N8N-SEC-9 추가 필요. **MEDIUM** 합의.
- **CT-2 NFR-P15 vs NRT-2**: 별개 메커니즘 확인 (Transport vs Application layer). 스코프 주석 + 캐스케이드 관계 명시 권고. Winston 이슈 #1 철회.
- **NFR-SC7 VPS 4GB**: "Oracle VPS 4GB"는 오류 (실제 24GB). PostgreSQL 할당 기준으로 수정 필요. **MEDIUM** 합의.

---

## 재검증 (Verified) — 9건 수정 후

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|----------|
| D1 구체성 | 15% | 9 | 9 | NFR 총수 74 정정(Fix 9), P17 MKT E2E 시간 구체적(Fix 8), EXT3 MKT 타임아웃 예외(Fix 6) |
| D2 완전성 | 15% | 9 | 9 | D8 observations/reflections 보존 정책 추가(Fix 3), P17 MKT E2E(Fix 8), EXT3 타임아웃(Fix 6) — 3개 신규 NFR로 커버리지 확대 |
| D3 정확성 | 25% | 8 | 9 | SC7 "VPS 4GB"→"PostgreSQL 4GB, VPS 24GB" 정정(Fix 1). 이슈 #1 철회(별개 메커니즘). N8N-SEC 갭은 Step 07 도메인 요구사항 범위 — NFR-S9 자체는 6-layer를 정확히 기술 |
| D4 실행가능성 | 20% | 9 | 9 | SC8↔FR-OC2 역할 분리(Fix 4) — 부하 테스트 vs 기능 상한 명확. P17 E2E 시간 측정 가능 |
| D5 일관성 | 15% | 9 | 9 | NFR↔FR 교차 참조 추가(Fix 7): A6←FR-OC10, A7←FR-OC9, SC8←FR-OC2. S9 "100% 통과"(Fix 5) |
| D6 리스크 | 10% | 8 | 9 | D8 보존 정책(데이터 손실 리스크 완화), EXT3 MKT 타임아웃 예외(영상 생성 장기 작업 리스크 커버), P17 E2E 기준(MKT 성능 리스크 모니터링) |

## 재검증 가중 평균: 9.00/10 ✅ PASS

`(0.15×9) + (0.15×9) + (0.25×9) + (0.20×9) + (0.15×9) + (0.10×9) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = 9.00`

### 수정 검증 상세:

| # | 이슈 | 수정 내용 | 검증 위치 | 결과 |
|---|------|---------|---------|------|
| 1 | NFR-SC7 VPS 4GB (Winston #4 + Quinn HIGH) | "(PostgreSQL 할당 메모리 4GB 기준, VPS 총 24GB)" | L2391 | ✅ |
| 2 | NFR-P15 heartbeat 3-tier | "active 5초 / moderate 15초 / idle 30초 (NRT-2 기준)" | L2363 | ✅ ⚠️ 주석 참조 |
| 3 | NFR-D8 observations 보존 (Quinn) | "observations 90일, reflections 무기한. 자동 아카이브" | L2426 | ✅ |
| 4 | NFR-SC8↔FR-OC2 분리 (Sally) | "부하 테스트 통과 (FR-OC2 기능 기준, NFR은 성능 검증)" | L2392 | ✅ |
| 5 | NFR-S9 "100% 통과" (Bob) | "전부"→"100%" | L2379 | ✅ |
| 6 | NFR-EXT3 MKT 타임아웃 (Quinn) | "MKT 영상 생성은 최대 5분 허용" | L2434 | ✅ |
| 7 | NFR↔FR 교차 참조 (Bob) | A6←FR-OC10, A7←FR-OC9, SC8←FR-OC2 | L2412-2413, L2392 | ✅ |
| 8 | NFR-P17 MKT E2E (Sally) | "이미지 ≤2분, 영상 ≤10분, 게시 ≤30초" | L2365 | ✅ |
| 9 | NFR 총수 정정 (Winston #2) | 74개 (v2 58 + v3 16), P0/P1/P2/CQ 재집계 | L2481-2488 | ✅ |

### 잔여 권고 (비블로킹):

1. ~~**NFR-P15 스코프 주석**~~ → **Fix v2로 해결**: 2-tier 복원 + "(WS transport keep-alive — NRT-2와 별개)" 스코프 주석 + 캐스케이드 관계 명시 ✅
2. ~~**N8N-SEC 갭**~~ → **Fix v2로 해결**: NFR-S9를 N8N-SEC-1~6에 정렬 + rate limiting을 §Integration 참조로 추가 ✅

### v2 추가 수정 검증:

| # | 이슈 | 수정 내용 | 검증 위치 | 결과 |
|---|------|---------|---------|------|
| 2v2 | NFR-P15 스코프 (Winston 철회+Quinn LOW) | 2-tier 복원, "(WS transport keep-alive — NRT-2와 별개. WS 끊김 시 NRT-2도 error)" | L2363 | ✅ |
| — | NRT-2 스코프 | "(Application layer — NFR-P15 WS keep-alive와 별개)" | L1413 | ✅ |
| 6v2 | NFR-S9 N8N-SEC 정렬 (Winston+Quinn MEDIUM) | N8N-SEC-1~6 명시 참조 + rate limiting §Integration | L2379 | ✅ |

**잔여 권고 0건** — 전부 해결됨.
