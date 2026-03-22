# Critic-A Review — Stage 2 Step 10: Project Scoping & Phased Development (PRD L2085-2272)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 2085–2272
**Grade Request**: A (2사이클 필수, avg ≥ 8.0)
**Revision**: **v1 8.55 → R2 9.30 PASS FINAL**

---

## Review Score: 8.55/10 ✅ PASS

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 15% | Sprint 테이블: 핵심 기능·Go/No-Go·블로커·의존성 4칼럼 구조. 리스크: 확률/영향/완화 정량. OSS: URL·버전·대체 대상 명시. "직접 구현 유지" 10개 파일 경로 포함 |
| D2 완전성 | 8/10 | 15% | 4 하위 섹션 전체 커버. But: Sprint 3 Go/No-Go 2/5만 표시 (M2). v3 Must-Have/Nice-to-Have 분류 부재 (L1). Pre-Sprint Go/No-Go #10 Sprint 테이블 미포함 (L3) |
| D3 정확성 | 8.5/10 | **25%** | L2197 "15건+" — Step 9 교정 "17건+" (N8N-SEC 8건) 미전파 (M1). Sprint 순서 근거 4개 전부 논리적. v3 여정 매핑 6개 Journey 전부 정합. Must-Have/Nice-to-Have 분류 적절 |
| D4 실행가능성 | 9/10 | **20%** | Sprint 순서 근거 (Brief §4) 명시. 리스크 완화: 구체적 타임라인 ("Phase 1 1주차"), 폴백 ("3단계 폴백"), 수치 ("~10줄"). OSS URL 전부 유효. pg-boss "조건부" 정직한 불확실성 인정 |
| D5 일관성 | 8/10 | 15% | M1: L2197 "15건+" vs L2077 "17건+". Sprint 3 gates 불완전 vs 정규 14-gate 목록. pg-boss 나열 vs cross-talk 합의 "크론 오프셋 기본". Sprint roadmap (L427-451) ↔ Sprint 전략 테이블 순서 정합 ✅ |
| D6 리스크 | 9/10 | 10% | v3 추가 리스크 2행: Sprint 2 과부하에 "분할 트리거" 조건 명시 ✅. Sprint 1 지연 병렬 착수 방안 ✅. Phase 1 실패 하이브리드 전략 ✅. v3 독립 롤백 전략 ✅. "Innovation 참조" 교차 링크 ✅ |

**가중 평균**: (9×0.15)+(8×0.15)+(8.5×0.25)+(9×0.20)+(8×0.15)+(9×0.10) = 1.35+1.20+2.125+1.80+1.20+0.90 = **8.575 → 8.55**

---

## 이슈 목록

### MINOR (2건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| M1 | Sprint 2 과부하 "15건+" — Step 9 교정 "17건+" 미전파 | L2197 | Step 9 Fix 5에서 L2077 "N8N-SEC 6건→8건" 교정 → 6+5+others=15→8+5+others=17. L2197은 교정 범위 밖이어서 구값 잔류. 동일 패턴: 4G→2G, 20→50 단일 위치 전파 실패 | D3 정확성, D5 일관성 |
| M2 | Sprint 3 Go/No-Go 불완전: #4, #7만 표시 — #9, #11, #14 누락 | L2111 | 정규 14-gate 목록 (L453-469): #9 Obs Poisoning(Sprint 3), #11 Tool Sanitization(Sprint 3), #14 Capability Eval(Sprint 3). Sprint 3가 가장 gate-heavy Sprint(5개)인데 2/5만 표시. Sprint 플래너가 이 테이블만 보면 3개 gate 미계획 | D2 완전성, D5 일관성 |

### LOW (4건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| L1 | v3 Must-Have/Nice-to-Have 분류 부재 | L2152-2165 | Must-Have 6개 + Nice-to-Have 5개는 v2 Phase 1~4만. v3 Sprint 1~4 기능은 독립 롤백 전략(L2121)으로 구조적 해결되나, 명시적 우선순위 없음. Sprint 4 PixiJS는 "실패해도 무영향"(L2121) = Nice-to-Have에 해당하나 미분류 | D2 완전성 |
| L2 | pg-boss "조건부" — cross-talk 합의 "크론 오프셋 기본" 미반영 | L2244 | Step 9 cross-talk: Winston/Bob/Quinn 합의 "크론 오프셋 기본, 100+ 회사 시 pg-boss 검토". L2244는 pg-boss를 동등 대안으로 나열. "아키텍처에서 확정"은 맞으나 현재 선호 방향 없음 | D5 일관성 |
| L3 | Pre-Sprint Go/No-Go #10 Sprint 테이블 미포함 | L2107-2112 | Go/No-Go #10 (Voyage AI 마이그레이션, Pre-Sprint)은 Sprint 3 시맨틱 검색의 필수 전제. Sprint 테이블에 Pre-Sprint 행 없음. L2124에서 Pre-Sprint 언급하나 #10 교차 참조 없음 | D2 완전성 |
| L4 | "전체" 게이트 (#1, #12, #13) Sprint 테이블 미언급 | L2107-2112 | #1 Zero Regression, #12 v1 Feature Parity, #13 Usability = "전체" Sprint. 테이블 각 행에 표시하기엔 반복적이나 테이블 하단 각주 "전체 Sprint에 #1, #12, #13 적용" 정도는 필요 | D2 완전성 |

---

## john 7대 체크포인트 검증

| # | 체크포인트 | 판정 | 근거 |
|---|-----------|------|------|
| 1 | 확정 결정 정합 | ✅ | #2 n8n 2G: OSS Sprint 2 "2.12.3" ✅ (리소스는 Step 9 범위). #5 30일 TTL: Scoping 범위 밖 (Domain). #10 WS 50: 선제 수정 L2412 ✅. Sprint 순서·의존성 Brief §4 정합 ✅ |
| 2 | Go/No-Go 게이트 | ⚠️ | Sprint 테이블 7/14 gate. Sprint 3에서 #9, #11, #14 누락 (M2). "전체" #1, #12, #13 미언급 (L4). Pre-Sprint #10 미포함 (L3). 정규 목록(L453-469)은 무결하나 Scoping 테이블이 불완전 |
| 3 | Sprint 의존성 | ✅ | 4개 Sprint 순서 근거 전부 논리적. Sprint 1 soul-enricher → Sprint 2 n8n (독립 병렬 가능) → Sprint 3 메모리 (Sprint 1 경로 활용) → Sprint 4 PixiJS (1~3 데이터 필요). Sprint 1 지연 시 n8n 인프라 병렬 착수 방안 ✅ |
| 4 | 리스크 구체성 | ✅ | 기술 4행: 확률/영향/완화 + 타임라인. 시장 3행 + 리소스 2행: 모두 구체적 폴백. v3 추가 2행: Sprint 2 분할 **트리거 조건** 명시 (중간 리뷰 시점). 단, L2197 "15건+" 미교정 (M1) |
| 5 | 오픈소스 목록 | ✅ | Phase 1~4: 12개 + v3 Sprint 1~4: 6개 + Phase 5+: 1개 = 19개. URL/버전/대체 대상 전부 명시. pg-boss "조건부" 정직. Voyage AI Phase 4 + Sprint 3 이중 참조 적절 (다른 용도). llm-cost-tracker "v3 제거 대상" 표기 ✅ |
| 6 | Must-Have/Nice-to-Have | ✅ | Must-Have 6개: Phase 1~2 핵심 (엔진, 보안, 핸드오프, 회귀, 허브, Soul). Nice-to-Have 5개: 대체 가능 (CRUD 대체, 키워드 대체 등). 분류 적절. v3 분류 부재는 L1 |
| 7 | Cross-section 일관성 | ⚠️ | Sprint roadmap (L427-451) ↔ Sprint 테이블 순서 정합 ✅. v3 여정 매핑 6개 Journey 정합 ✅. But: L2197 "15건+" vs L2077 "17건+" 전파 실패 (M1). Sprint 3 gates 불완전 vs 정규 목록 (M2) |

---

## 선제 수정 검증

| 위치 | 수정 | 판정 |
|------|------|------|
| L925 | memoryTypeEnum 'reflection', 'observation' → 'reflection' only (Option B) | ✅ Step 8 residual 해소 |
| L929 | ALTER TYPE → observation 별도 테이블 주석 | ✅ Option B 정합 |
| L975 | memoryTypeEnum += 'reflection' only | ✅ |
| L2412 | FR-OC2 20개→50개 | ✅ 확정 결정 #10 정합 |

4/4 선제 수정 전부 정확.

---

## 긍정 평가

1. **Sprint 순서 근거 4개** (L2114-2118): 각 Sprint "왜 이 순서인가" Brief §4 참조 + 기술 의존성 분석 — Sprint 플래너 즉시 활용 가능
2. **Sprint 2 분할 트리거** (L2197): "중간 리뷰 시점에 인프라 미완료 시" — 트리거 조건 명시로 Scrum 의사결정 자동화
3. **Sprint 1 지연 병렬 방안** (L2198): n8n Docker soul-enricher 비의존 분석 — Sprint 의존성 그래프의 partial execution 가능성 분석
4. **v3 독립 롤백** (L2121): 각 Sprint 실패 시 해당 Layer만 비활성화 — Graceful degradation 전략
5. **"직접 구현 유지" 10개** (L2256-2266): 파일 경로 + v3 Sprint 귀속 명시 — CORTHEX 고유 가치 vs 오픈소스 경계 명확
6. **pg-boss "조건부"** (L2244): "아키텍처에서 확정 후 채택 여부 결정" — 정직한 불확실성 인정, PRD 과확정 방지
7. **llm-cost-tracker "v3 제거 대상" 표기** (L2213): CLI Max 월정액 GATE 결정 반영 — 패키지 생명주기 관리
8. **v3 여정 매핑 6행** (L2143-2150): Sprint×Journey 매트릭스로 사용자 가치 검증 가능

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 — OSS URL, 버전, 파일 경로 전부 검증 가능 |
| 보안 구멍 | ❌ 없음 — Must-Have에 "Hook 5개 보안 체계" 포함. OSS secret-scrubber ✅ |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 — Sprint 독립 롤백, Phase 1 하이브리드 전략 |
| 아키텍처 위반 | ❌ 없음 — "직접 구현 유지" agent-loop.ts + types.ts E8 경계 준수 |

---

## Confirmed Decisions Coverage

| # | Decision | Step 10 반영 |
|---|----------|-------------|
| 2 | n8n Docker 2G | ✅ OSS Sprint 2 n8n 2.12.3 (리소스 상세는 Step 9) |
| 3 | n8n 8-layer | ⚠️ L2197 "15건+" (6→8 미전파, M1) |
| 5 | 30일 TTL | N/A (Domain 범위) |
| 8 | Obs Poisoning | ⚠️ Sprint 3 Go/No-Go #9 미표시 (M2) |
| 9 | Advisory lock | ⚠️ Sprint 3 Go/No-Go에 미포함 (정규 #12→Reflection cron 관련) |
| 10 | WS limits | ✅ L2412 선제 수정 50/co |
| 11 | 14 gates | ⚠️ Sprint 테이블 7/14 (M2, L3, L4) |
| 12 | host.docker.internal | N/A (Scoping 범위 밖) |

---

## Carry-Forward to Writer

1. **L2197 "15건+"→"17건+"**: N8N-SEC 8건 반영 (Step 9 Fix 5 전파)
2. **Sprint 3 Go/No-Go 확장**: "#4, #7" → "#4, #7, #9, #11, #14" (정규 목록 5/5)
3. **Sprint 테이블 각주**: "전체 Sprint: #1 Zero Regression + #12 v1 Feature Parity + #13 Usability" + "Pre-Sprint: #10 Voyage AI 마이그레이션"

---

## R2 검증 — 7/7 수정 확인

**R2 Score: 9.30/10 ✅ PASS FINAL**

### R2 차원별 점수

| 차원 | R1 | R2 | 가중치 | 근거 |
|------|-----|-----|--------|------|
| D1 구체성 | 9 | 9.5 | 15% | Pre-Sprint 행 추가 (Voyage AI + Neon Pro + 디자인 토큰). Sprint 3 5-gate 상세. v3 Must-Have 4항목 Go/No-Go 교차 참조 |
| D2 완전성 | 8 | 9.5 | 15% | 14/14 gate 커버: Pre-Sprint(#10, #6) + Sprint 1(#2) + Sprint 2(#3, #11) + Sprint 3(#4, #7, #9, #11, #14) + Sprint 4(#5, #8) + 전체(#1, #12, #13). v3 Must-Have 4항목. J2/J3 여정 추가 |
| D3 정확성 | 8.5 | 9 | **25%** | 15→17 교정 ✅. Hook 5→4 (GATE 반영) ✅. Voyage AI "Pre-Sprint 후 계속" ✅. But: L2115 각주 #1 설명 오류 (신규 LOW) |
| D4 실행가능성 | 9 | 9.5 | **20%** | Sprint 3 과밀 리스크 + 완화 전략 (#9/#11 Sprint 2 선행, #14 회고 성격). v3 Must-Have Sprint+gate 교차 참조로 Sprint 플래너 즉시 활용 |
| D5 일관성 | 8 | 9 | 15% | 15→17 통일 ✅. Sprint 테이블 ↔ 정규 14-gate 정합 ✅. Pre-Sprint 행 ↔ Sprint roadmap L430 정합 ✅. 각주 #1 설명만 불일치 (신규 LOW) |
| D6 리스크 | 9 | 9.5 | 10% | Sprint 3 과밀 리스크 행 추가 — 5-gate 집중 + 완화 전략 (선행 검증 + 회고 성격 구분). 원래 2행 → 3행 |

**가중 평균**: (9.5×0.15)+(9.5×0.15)+(9×0.25)+(9.5×0.20)+(9×0.15)+(9.5×0.10) = 1.425+1.425+2.25+1.90+1.35+0.95 = **9.30**

### 7/7 수정 검증

| # | Fix | 검증 | 위치 |
|---|-----|------|------|
| 1 | Sprint 테이블 Go/No-Go 확장 + Pre-Sprint 행 | ✅ | L2109 Pre-Sprint(#10, #6), L2111 Sprint 2(+#11), L2112 Sprint 3(5 gates), L2115 각주 |
| 2 | 15→17 | ✅ | L2208 "17건+" |
| 3 | v3 Must-Have 4항목 | ✅ | L2165-2169: #7-#10 Sprint+gate 교차 참조 |
| 4 | Hook 5→4 | ✅ | L2159 "Hook 4개 — cost-tracker 제거" |
| 5 | Sprint 3 과밀 리스크 행 | ✅ | L2209 "Sprint 3 게이트 과밀 (5 Go/No-Go)" + 선행 검증 완화 |
| 6 | Voyage AI "Pre-Sprint 후 계속" | ✅ | L2255 설명 갱신 |
| 7 | v3 여정 J2/J3 | ✅ | L2152 Journey 2, L2153 Journey 3 |

### Confirmed Decisions Coverage R2

| # | Decision | R1 | R2 |
|---|----------|-----|-----|
| 2 | n8n Docker 2G | ✅ | ✅ |
| 3 | n8n 8-layer | ⚠️ | ✅ (17건+ 교정) |
| 8 | Obs Poisoning | ⚠️ | ✅ (Sprint 3 #9 표시) |
| 9 | Advisory lock | ⚠️ | ✅ (#11 Sprint 2-3 포함) |
| 10 | WS limits | ✅ | ✅ |
| 11 | 14 gates | ⚠️ | ✅ (14/14 커버) |

### R2 Residuals (non-blocking)

| Item | Notes |
|------|-------|
| L2115 각주 #1 설명 오류 | "#1 (Voyage AI 1024d 정합)" → 정규 L456 #1 = "Zero Regression (485 API + 10,154 테스트)". Gate 번호 정확, 설명만 #10과 혼동. 수정 권고 |
| pg-boss "조건부" | cross-talk 합의 "크론 오프셋 기본" — Architecture에서 확정 |
| llm-cost-tracker Phase 1 유지 | v2 구현에 필요, v3에서 제거 예정. 현재 표기 적절 |
