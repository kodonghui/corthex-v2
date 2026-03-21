# Critic-C Review — Step 10 Non-Functional Requirements

**Reviewer**: Sally (UX Designer / Critic-C)
**Date**: 2026-03-21
**File**: `_bmad-output/planning-artifacts/prd.md` L2341–2486
**Step**: step-10-nfr.md

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 신규 NFR 14개 전부 구체적 수치 포함: P13(FCP≤3초, ≤200KB), P14(≤2초), P15(idle 30초/active 5초), P16(≤30초/agent), SC8(20연결), SC9(4GB/2CPU), COST3($0.10/일), O9(30초 간격, 3회 실패). 측정 방법(Lighthouse, 타이머, 네트워크 테스트) 전부 명시. |
| D2 완전성 | 20% | 8/10 | 14개 v3 NFR이 성능/보안/확장/접근성/비용/운영 6개 카테고리 커버. NRT-2 heartbeat → NFR-P15 carry-forward 완료. CLI Max 삭제 2건. **BUT**: (1) 마케팅 파이프라인 E2E 소요 시간 NFR 없음 — FR-MKT2 6단계 파이프라인의 품질 기준 부재. (2) NFR-A5 슬라이더 Arrow 키 step size 미정의 (0-100 범위에서 1? 5?). |
| D3 정확성 | 15% | 8/10 | COST3 ↔ Go/No-Go #7 정합 ✅. SC8 ↔ Step 08 연결 상한 20 ✅. O10 ↔ Step 06 advisory lock ✅. **BUT**: (1) NFR-P15 heartbeat "idle 30초/active 5초" 2 tier — Step 05 NRT-2는 "5s/15s/30s" 3 tier(포커스/백그라운드/hidden). 중간 tier(background 15초) 누락. (2) 우선순위 요약 "P0 22개" — 실제 카운트 21개(1개 차이). (3) 총 활성 "73개" — 실제 카운트 72개(1개 차이). |
| D4 실행가능성 | 15% | 9/10 | 전 NFR 측정 가능. S8 "4-layer 100% 통과"는 PER-1 정의와 1:1 대응. O9 "healthz 30초, 3회 실패"는 docker-compose healthcheck 구문으로 바로 변환. 우선순위 요약 테이블이 Sprint 계획 시 바로 참조 가능. |
| D5 일관성 | 10% | 9/10 | S7/D7 삭제 ↔ GATE 2026-03-20 ✅. COST3 ↔ Step 06 혁신 리스크 MEM-2 ✅. S9 "6-layer" ↔ Step 05 N8N-SEC-1~6 ✅. Phase/Sprint 태그 기존 패턴 일관. |
| D6 리스크 | 20% | 8/10 | NFR-SC8이 FR-OC2와 **내용 직접 중복** (둘 다 "20 동시 연결 + graceful eviction") — 독립 업데이트 시 수치 분기 위험. NFR-P15 중간 tier 누락 시 /office 백그라운드 탭 사용자 UX 영향 (30초 갭으로 상태 변화 누락 가능). |

## 가중 평균: 8.45/10 ✅ PASS

계산: (9×0.20) + (8×0.20) + (8×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.60 + 1.20 + 1.35 + 0.90 + 1.60 = **8.45**

---

## 이슈 목록

### 1. **[D3 정확성] NFR-P15 heartbeat 3 tier → 2 tier 축소** — MEDIUM
- **위치**: NFR-P15 (L2363)
- **문제**: Step 05 NRT-2 도메인 요구사항은 "5s/15s/30s" 3 tier (포커스/백그라운드/hidden). NFR-P15는 "idle 30초/active 5초" 2 tier. 중간 tier(background=탭 비활성이나 브라우저 전면)가 누락.
- **UX 영향**: CEO가 /office를 백그라운드 탭에 두고 허브에서 작업 중일 때, 30초 간격이면 에이전트 상태 변화를 최대 30초 늦게 인지. 15초면 수용 가능.
- **제안**: 3 tier 유지: "active(포커스) 5초 / background(visibilitychange) 15초 / hidden(최소화) 30초. 3회 미수신 시 재연결"

### 2. **[D6 리스크] NFR-SC8 ↔ FR-OC2 내용 중복 — 수치 분기 위험** — MEDIUM
- **위치**: NFR-SC8 (L2391) vs FR-OC2 (L2276)
- **문제**: NFR-SC8 "회사별 최대 20 동시 연결 + idle graceful eviction"이 FR-OC2와 동일 문장. 향후 한쪽만 수정 시 불일치 발생.
- **제안**: NFR-SC8에 "(FR-OC2 정의 준수)" 참조 추가. 또는 NFR-SC8을 "FR-OC2 연결 상한을 부하 테스트로 검증: 20연결 × 10회사 동시 시 서버 메모리 증가 ≤ 5MB" 같은 **품질 기준**으로 변환.

### 3. **[D2 완전성] 마케팅 파이프라인 E2E 소요 시간 NFR 없음** — LOW
- **위치**: NFR 섹션 전체
- **문제**: FR-MKT2가 주제 입력→게시까지 6단계 파이프라인을 정의하지만, 전체 소요 시간 품질 기준이 없음. Admin 이수진이 "마케팅 자동화가 너무 느리다"고 느끼는 임계점이 미정의.
- **제안**: "NFR-P17: 마케팅 워크플로우 E2E ≤ 10분 (사람 승인 대기 제외, 외부 AI API 의존)" 또는 "측정 어려움 — Phase 5+ 베이스라인 측정 후 목표 설정" 주석.

### 4. **[D3 정확성] NFR 카운트 미세 불일치** — LOW
- **위치**: L2481-2485 (우선순위 요약)
- **문제**: "P0 22개" → 실제 21개, "총 활성 73개" → 실제 72개. 1개 차이.
- **제안**: 재카운트 후 수정.

---

## UX 관점 특별 코멘트

### NFR-A5~A7 접근성 3건 추가 👍
- Big Five 슬라이더(A5), /office 스크린리더(A6), /office 반응형(A7) — v3 신규 기능 전부 접근성 NFR이 있음
- 특히 A5 "aria-valuenow + Arrow keys"는 슬라이더 접근성의 핵심 패턴. WCAG 2.1 AA 충족에 필수

### NFR-COST3 Go/No-Go #7 연동 ✅
- "$0.10/일 per company"가 명확한 게이트 조건이면서 "Stage 1 추정: ~$0.06/day" 참조값 병기 — Sprint 3 착수 시 판단 기준 즉시 활용 가능

### CLI Max 모순 삭제 ✅
- S7(cost-tracker 정확도) + D7(비용 보관) 삭제가 ~~삭제~~ 포맷으로 가시적 — 삭제 이유(GATE 결정)도 인라인 명시. 향후 "왜 삭제했지?" 의문 방지

### NFR-O9 n8n health → Sally Step 07 이슈 #1 최종 해소 ✅
- Step 07에서 "n8n Docker 장애 복구 전략 미명시"로 MEDIUM 이슈 제기 → Step 07 fixes에서 restart+healthcheck 추가 → 이제 NFR-O9으로 품질 기준까지 확정. 완전한 커버리지.

---

## Cross-talk 요청사항

**bob에게**: 이슈 #2(NFR-SC8 ↔ FR-OC2 중복)는 delivery 관점에서 NFR을 "부하 테스트 기준"으로 변환하는 게 나은지, 아니면 참조 추가로 충분한지 의견 부탁.

**Bob 답변**: 옵션 B(부하 테스트 기준 변환) 추천. FR=구현 계약(개발자) / NFR=검증 기준(QA) 역할 분리. NFR-A6/A7도 동일 패턴으로 FR 교차 참조 추가 제안. Sally 동의.

---

## 재검증 (Verification Round)

**검증 대상**: John의 9건 수정 (stage-2-step10-fixes.md)

### 검증 결과

| # | 수정 항목 | Sally 이슈 | 검증 | 위치 |
|---|---------|-----------|------|------|
| 1 | NFR-SC7 VPS 메모리 표기 정정 | — (Quinn+Bob) | ✅ L2391 "(PostgreSQL 할당 메모리 4GB 기준, VPS 총 24GB)". 기존 "Oracle VPS 4GB"의 모호함 해소. | NFR-SC7 |
| 2 | NFR-P15 heartbeat 3-tier 통일 | **이슈 #1** ✅ | ✅ L2363 "적응형 3-tier 간격: active 5초 / moderate 15초 / idle 30초 (NRT-2 기준)". Step 05 NRT-2 도메인 요구사항과 완전 일치. 백그라운드 탭(moderate 15초) 복원. | NFR-P15 |
| 3 | NFR-D8 observations/reflections 보존 | — (Quinn) | ✅ L2426 "observations 90일, reflections 무기한 보관. 90일 초과 observations 자동 아카이브 (삭제 아님)". 메모리 데이터 lifecycle 정의 — Sprint 3 구현 기준 즉시 활용 가능. | NFR-D8 |
| 4 | NFR-SC8↔FR-OC2 역할 분리 | **이슈 #2** ✅ | ✅ L2392 "회사별 20 동시 연결 부하 테스트 통과 + idle graceful eviction (FR-OC2 기능 기준, NFR은 성능 검증)". FR=기능 상한, NFR=품질 검증으로 차별화. Bob cross-talk 합의 반영. | NFR-SC8 |
| 5 | NFR-S9 "100% 통과" | — (Bob) | ✅ L2379 "100% 통과". 측정 가능한 수치 표현. | NFR-S9 |
| 6 | NFR-EXT3 영상 생성 타임아웃 예외 | — (Quinn) | ✅ L2434 "(MKT 영상 생성은 최대 5분 허용)". 영상 생성 현실적 소요 시간 반영. | NFR-EXT3 |
| 7 | NFR↔FR 교차 참조 추가 | **이슈 #2** (부분) ✅ | ✅ L2412 "FR-OC10 품질 기준", L2413 "FR-OC9 품질 기준", L2392 "FR-OC2 기능 기준". Bob cross-talk 제안 3건 전부 반영. | NFR-A6, A7, SC8 |
| 8 | NFR-P17 MKT 워크플로우 E2E 시간 | **이슈 #3** ✅ | ✅ L2365 "이미지 생성 ≤ 2분, 영상 생성 ≤ 10분, 게시 ≤ 30초 (NFR-EXT3 타임아웃 제외)". 마케팅 파이프라인 품질 기준 확립. | NFR-P17 |
| 9 | NFR 총수 정정 | **이슈 #4** ✅ | ✅ L2483 "P0 21개", L2488 "총 활성 74개 (v2 58 + v3 16)". NFR-D8, P17 추가 반영 + 기존 off-by-one 수정. | 우선순위 요약 |

### 잔여 사항 (Residual)

없음. Sally 이슈 4건 전부 해소.

### 재검증 점수

| 차원 | 가중치 | 초기 | 재검증 | 변동 근거 |
|------|--------|------|--------|---------|
| D1 구체성 | 20% | 9 | 9 | 유지. NFR-P17 마케팅 3종 수치(#8), heartbeat 3-tier 명시(#2), S9 "100%"(#5) 추가 구체성. |
| D2 완전성 | 20% | 8 | 9 | NFR-P17 마케팅 E2E(#8), NFR-D8 데이터 보존(#3). 마케팅 파이프라인 + 메모리 데이터 lifecycle 두 갭 모두 해소. |
| D3 정확성 | 15% | 8 | 9 | heartbeat 3-tier NRT-2 일치(#2). 총수 74개 정정(#9). SC7 VPS 24GB 명확화(#1). |
| D4 실행가능성 | 15% | 9 | 9 | 유지. NFR-EXT3 영상 5분 예외(#6)로 현실적 타임아웃 확보. |
| D5 일관성 | 10% | 9 | 9 | 유지. NFR↔FR 교차 참조(#7)로 문서 간 추적성 강화. |
| D6 리스크 | 20% | 8 | 9 | NFR-SC8↔FR-OC2 역할 분리(#4). NFR-A6/A7 FR 교차 참조(#7). 독립 업데이트 시 분기 위험 해소. |

### 재검증 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00**

---

## 재검증 v2 (Cross-talk 추가 수정)

**검증 대상**: John의 cross-talk 반영 추가 3건

### v2 검증 결과

| # | 수정 항목 | Sally 영향 | 검증 | 위치 |
|---|---------|-----------|------|------|
| Fix 2 수정 | NFR-P15 3-tier → 2-tier 복원 + 스코프 주석 | **이슈 #1 재평가** | ✅ L2363 "idle 30초 / active 5초 (WS transport keep-alive — NRT-2 에이전트 상태 전환과 별개. WS 끊김 시 NRT-2도 error 전환)". Winston 분석 타당: NFR-P15=WS transport heartbeat, NRT-2=application layer 상태 전환. 별개 메커니즘이므로 2-tier WS heartbeat 정확. 캐스케이드(WS 끊김→error 전환) 명시. Sally 원래 이슈는 두 메커니즘 혼동에 기반 — 수정 수용. | NFR-P15 |
| Fix 6 신규 | NFR-S9 N8N-SEC-1~6 매핑 정렬 | — (Winston+Quinn) | ✅ L2379 "N8N-SEC-1~6 100% 통과: 포트 차단(SEC-1) → ... → DB 직접 접근 차단(SEC-6) + proxy rate limiting". Step 05 도메인 요구사항 ID와 1:1 매핑으로 추적성 대폭 향상. | NFR-S9 |
| 기존 Fix 유지 | Fix 1,3~5,7~10 | — | ✅ v1 검증 결과 그대로 유지. | 전체 |

### v2 점수 영향

| 차원 | v1 재검증 | v2 재검증 | 변동 근거 |
|------|----------|----------|---------|
| D3 정확성 | 9 | 9 | NFR-P15 2-tier 복원이 기술적으로 더 정확 (WS transport ≠ app state). 스코프 주석으로 혼동 방지. |
| D5 일관성 | 9 | 9 | NFR-S9 ↔ N8N-SEC-1~6 ID 매핑으로 Step 05 도메인 요구사항과 정합 강화. |
| 나머지 | 9 전부 | 9 전부 | 변동 없음. |

### v2 재검증 가중 평균: 9.00/10 ✅ PASS (유지)
