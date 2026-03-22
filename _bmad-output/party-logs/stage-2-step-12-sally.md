# Critic-UX (Sally) Review — Stage 2 Step 12: Non-Functional Requirements

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 2499–2647 (## Non-Functional Requirements)
> Cross-refs: 확정 결정 12건, Go/No-Go 14 gates, FR-MEM12~14 (Step 11 R2), FR-PERS9 (Step 11 R2), NFR-S8 (PER-1 패턴), Domain MEM-6
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 74개 활성 NFR, 12개 카테고리. NFR-S9 n8n 8-layer 각 SEC 항목별 상세. NFR-P5 베이스라인 API 5개 명시. NFR-P15 적응형 heartbeat idle 30초/active 5초. NFR-O4 "10개 프롬프트 A/B 블라인드, 평가자 2명 5점 척도" — 측정 방법까지 구체적. |
| D2 완전성 | 8/10 | 12 카테고리 포괄적. v3 Sprint 1-4 NFR 완비. GATE 삭제 2건 적절. 3건 proactive fix. **그러나**: **(1)** NFR-S에 MEM-6 observation sanitization 품질 기준 부재 — NFR-S8(PER-1)과 비대칭. **(2)** Go/No-Go #13 "CEO 일상 태스크 5분" NFR 부재 — NFR-O7(Admin 15분) + O8(NEXUS 10분)은 있으나 CEO 일상 태스크 메트릭 없음. |
| D3 정확성 | 9/10 | Proactive fix 3건 정확 (SC8 50/500, S9 8-layer, D8 Option B+30일). NFR-COST3 "$0.10/일" = Go/No-Go #7 정합. NFR-SC9 "2G+1536" = 확정 #2. **약점**: NFR-A5 "aria-label" vs FR-PERS9 "aria-valuetext" — 다른 ARIA 속성인데 교차 참조 불일치. |
| D4 실행가능성 | 9/10 | 모든 NFR에 객관적 측정 지표. NFR-O4 응답 품질 A/B 설계 실용적. NFR-SC7 pgvector 3GB/4GB 현실적. NFR-COST3 Stage 1 추정치 $0.06/day 제공으로 검증 가능. NFR-AV1 "99%" (월 ~7시간) solo-dev 현실적. |
| D5 일관성 | 8/10 | 확정 결정 12건 NFR 정합 대부분 우수. FR ↔ NFR 연동 강함 (FR-MEM13↔NFR-D8, FR-MEM14↔NFR-COST3, FR-OC9↔NFR-A7, FR-OC10↔NFR-A6). **약점**: **(1)** NFR-S8(PER-1) 존재 but MEM-6 NFR-S 부재 — 3개 sanitization chain 중 1개만 NFR. **(2)** NFR-A5 aria-label vs FR-PERS9 aria-valuetext 불일치. |
| D6 리스크 | 8/10 | P0 21개 릴리스 게이트 적절. GATE 삭제 처리 깔끔. NFR-SC9 n8n Docker OOM 방지. NFR-O10 advisory lock + rate limit. **약점**: MEM-6 NFR 부재 = Sprint 3 개발 중 sanitization 품질 기준 없이 Go/No-Go #9 게이트에서만 검증 — 늦은 발견 리스크. |

---

## 이슈 목록

### MAJOR (0)

없음.

### MINOR (3)

**1. [D2/D5/D6] MEM-6 Observation Sanitization NFR 부재**
- NFR-S8: PER-1 personality 4-layer "100% 통과" (🔴 P0, Sprint 1) ✅
- NFR-S9: n8n 8-layer "100% 통과" (🔴 P0, Sprint 2) ✅
- MEM-6 observation 4-layer: **NFR 없음** ❌
- FR-MEM12 = 기능 요구사항 (무엇을). Go/No-Go #9 = 게이트 검증 (합격 기준). NFR = 개발 중 지속적 품질 기준 (어떻게 잘).
- NFR-S8이 PER-1에 대해 "4-layer 100% 통과"라는 NFR을 제공하면서, MEM-6에는 동일 패턴의 NFR이 없음 — 비대칭
- 리스크: Sprint 3 개발 중 observation sanitization 품질 측정 기준 없이 Go/No-Go #9에서만 검증 → 늦은 발견
- **수정**: NFR-S10 추가: `observation content 4-layer sanitization 100% 통과 (10KB cap + control char strip + prompt hardening + content classification — 10종 adversarial payload 100% 차단. FR-MEM12 품질 기준, Go/No-Go #9)` [🔴 P0, Sprint 3]

**2. [D3/D5] NFR-A5 vs FR-PERS9 ARIA attribute 불일치**
- NFR-A5 (L2569): "aria-valuenow + Arrow keys + **특성 설명 aria-label**"
- FR-PERS9 (L2466): "aria-valuenow + **aria-valuetext**로 현재 값과 의미를 스크린리더에 전달"
- `aria-label` = 요소의 접근성 이름 (예: "개방성 슬라이더")
- `aria-valuetext` = 현재 값의 텍스트 설명 (예: "높은 개방성: 창의적, 호기심 많음")
- 다른 ARIA 속성이며 다른 용도. 둘 다 필요하지만, NFR과 FR이 서로 다른 속성을 명시 → 구현 시 혼동
- Go/No-Go L601은 "aria-valuenow + 키보드" 만 명시 — valuetext/label 미지정
- **수정**: NFR-A5를 "aria-valuenow + aria-valuetext + aria-label + Arrow keys"로 확장하여 FR-PERS9와 정합. 또는 최소한 FR-PERS9의 aria-valuetext를 NFR에 반영

**3. [D2/D5] Go/No-Go #13 CEO 일상 태스크 NFR 부재**
- Go/No-Go #13 (L606): "Admin 온보딩 완주 ≤ 15분 + **CEO 일상 태스크 5분 완료**"
- NFR-O7: "Admin 초기 설정 ≤ 15분" ✅
- NFR-O8: "CEO NEXUS 첫 설계 ≤ 10분" — NEXUS 전용, "일상 태스크"와 다름
- "CEO 일상 태스크 5분" = 허브에서 에이전트에게 지시, 결과 확인, 알림 처리 등 — 일상 UX 속도 메트릭
- **수정**: NFR-O에 추가: "CEO 일상 태스크 (에이전트 지시 + 결과 확인) ≤ 5분 완료 (Go/No-Go #13)" [P1, 전체]

---

### 긍정적 관찰

- **NFR-P15 적응형 heartbeat(L2521)**: "idle 30초 / active 5초. 3회 미수신 시 재연결. WS transport keep-alive — NRT-2 에이전트 상태 전환과 별개. WS 끊김 시 NRT-2도 error 전환" — 네트워크 상태와 애플리케이션 상태의 분리를 NFR에서 명시. UX 관점에서 중요한 구분.
- **NFR-O4 응답 품질 A/B(L2601)**: "10개 프롬프트(Phase 1 전 정의) A/B 블라인드. 평가자 2명 5점 척도. 평균 ≥ 기존" — v2→v3 전환 시 품질 저하 방지를 위한 과학적 검증 설계. solo-dev에서도 실행 가능한 규모.
- **NFR-SC8 FR-OC2 교차 참조(L2550)**: "FR-OC2 기능 기준, NFR은 성능 검증" — FR과 NFR의 역할을 명시적으로 구분. 이 패턴이 전체 NFR에 일관되면 이상적.
- **GATE 삭제 처리(S7, D7)**: 취소선 + GATE 사유 + 날짜. 삭제 추적 가능.
- **Proactive fix 3건**: SC8(50/500), S9(8-layer), D8(Option B+30일) — 확정 결정 사전 반영으로 R1 품질 향상.
- **NFR-COST3 추정치 제공(L2615)**: "Stage 1 추정: ~$0.06/day" — 목표($0.10)와 추정치 간 40% 여유. 구현 시 검증 기준 명확.
- **NFR-A6/A7 FR 품질 기준 명시**: "FR-OC10 품질 기준", "FR-OC9 품질 기준" — NFR이 FR의 품질 검증 역할을 명시적으로 선언. 우수한 패턴.

---

## 가중 평균: 8.45/10 ✅ PASS

계산: (9×0.15) + (8×0.20) + (9×0.15) + (9×0.15) + (8×0.20) + (8×0.15) = 1.35 + 1.60 + 1.35 + 1.35 + 1.60 + 1.20 = **8.45**

**PASS 사유**: NFR 구조 탄탄하고, 74개 활성 NFR이 12개 카테고리를 포괄. 확정 결정 정합 우수 (proactive fix 3건). FR ↔ NFR 연동 강함. MEM-6 NFR 부재는 MINOR (FR-MEM12 + Go/No-Go #9가 기능적 보장 제공, NFR은 추가 품질 메트릭).

---

## Cross-talk 완료

### 스코어 비교

| Critic | Score | Status |
|--------|-------|--------|
| Winston (Architecture) | 9.10 | ✅ PASS |
| Sally (UX) | 8.45 | ✅ PASS |
| Bob (Scrum) | 8.10 | ✅ PASS |
| Quinn (QA/Security) | 7.90 | ❌ FAIL |

### Cross-talk 합의

| Issue | Quinn | Winston | Sally | Bob | 합의 |
|-------|-------|---------|-------|-----|------|
| MEM-6 NFR-S 부재 | ✅ | ✅ M1 | ✅ m1 | ✅ #1 | **4/4 만장일치** |
| NFR-A5 vs FR-PERS9 aria 불일치 | ✅ m3 | ✅ 채택 | ✅ m2 | ✅ 채택 | **4/4** |
| Go/No-Go #13 CEO 태스크 NFR | — | — | ✅ m3 | ✅ 채택 | **2/4** |
| NFR-COST2 Phase 4 → Sprint 3 | — | — | ✅ 채택 | ✅ #2 | **2/4** |
| NFR-SC7 Phase 4 → Sprint 3 | — | ✅ M2 | ✅ 채택 | — | **2/4** |

### Cross-talk 채택

**m4 (from Bob #2). [D3/D5] NFR-COST2 Voyage AI Phase "4" → Sprint 3**
- Step 9 Fix 9에서 integration table은 "Pre-Sprint→유지"로 수정됨
- NFR-COST2는 여전히 Phase 4 + "문서 1,000건" 범위
- Sprint 3에서 observation + reflection embedding 비용 발생 — NFR-COST2 미포함
- **수정**: NFR-COST2 Phase "4" → "Sprint 3~4", 범위에 Sprint 3 observation/reflection embedding 포함

**m5 (from Winston M2). [D2/D6] NFR-SC7 pgvector 메모리 Phase 4 → Sprint 3**
- Sprint 3에서 observations + agent_memories VECTOR(1024) + HNSW 인덱스 추가
- NFR-SC7 측정 Phase가 4인데 Sprint 3 OOM 리스크 미감지
- **수정**: NFR-SC7 Phase "4" → "Sprint 3~4" (Sprint 3 벡터 테이블 추가 시 메모리 측정 시작)

### Cross-talk 관찰 (스코어 비변동)

**Obs-A (from Bob). Sprint 3 P0 부족**
- P0 21개 중 Sprint 3 전용 P0 = NFR-COST3 1개뿐
- Go/No-Go 5개(#4, #7, #9, #11, #14)인 Sprint에 P0이 적음
- MEM-6 NFR-S10 추가 시 Sprint 3 P0 = 2개 — 개선

**Obs-B (from Bob). TOOLSANITIZE 품질 타겟 위치**
- FR-TOOLSANITIZE3에 "10종 100% 차단" 포함 — 품질 메트릭이 FR에 위치
- NFR-S8/S9는 품질 타겟이 NFR에 위치 — 패턴 불일치
- 정보는 존재하므로 non-blocking. QA 테스트 시 FR+NFR 양쪽 확인 필요

**Obs-C (from Quinn). 허브 채팅 스트리밍 a11y**
- assistant-ui 오픈소스 내장 접근성으로 커버 (Step 11 Obs-B 합의)
- 별도 NFR 불필요

**Obs-D. NFR-O7 Admin 15분 달성 가능성 확인**
- FR-PERS6/7 프리셋 + FR-MKT5 템플릿 + 기본 Soul = ~12분 예상
- 15분 내 달성 가능

### Winston Q 답변 — NFR-A5 aria-valuetext

- aria-valuetext = FR-PERS8 툴팁의 접근성 등가물
- NFR-A5를 "aria-valuenow + aria-valuetext + aria-label + Arrow keys"로 통합 확장 합의
- Winston 채택 확인

### Quinn Q 답변 — NFR-A6 aria-live 충분성

- FR-OC10 "aria-live='polite'" = /office 상태 모니터링에 적절
- `polite` = 현재 읽기 완료 후 업데이트 — 방해 없음
- `assertive`는 긴급 알림용이므로 /office에 부적절

---

## R2 검증 — 6 fixes applied

### Fix 검증 결과

| # | Fix | 검증 | 결과 |
|---|-----|------|------|
| 1 | NFR-S10 MEM-6 observation sanitization (4/4) | L2538: 4-layer 상세 + 10종 payload 100% 차단 + Go/No-Go #9 + 확정 #8 + PER-1 분리 + FR-MEM12 교차 참조. 🔴 P0 Sprint 3 | ✅ 완벽 |
| 2 | NFR-A5 ARIA attributes 정합 (4/4) | L2570: aria-valuenow + aria-valuetext + aria-label + Arrow keys. "FR-PERS9 정합" 명시 | ✅ |
| 3 | NFR-COST2 Phase + scope 확장 (4/4) | L2616: Phase "Pre-Sprint~Sprint 4". observations/reflections 임베딩 포함. Go/No-Go #10 참조 | ✅ |
| 4 | NFR-SC7 Phase 수정 (2/4) | L2550: Phase "Sprint 3~4". "Sprint 3 VECTOR(1024) HNSW 추가 시 측정 시작" 명시 | ✅ |
| 5 | NFR-P4 Go/No-Go #5 참조 정리 (2/4) | L2510: "(Brief §4). Go/No-Go #5는 PixiJS 번들 전용 (NFR-P13)" — 혼동 해소 | ✅ |
| 6 | NFR-O11 CEO 일상 태스크 (2/4) | L2609: "/office→에이전트 식별→Chat→태스크 지시→/office 결과 확인 ≤ 5분 (Go/No-Go #13)". P1 전체 | ✅ |

**6/6 fixes verified ✅**

### 추가 검증 — P0/P1/총 활성 카운트

| 우선순위 | R1 | R2 | 변동 |
|---------|-----|-----|------|
| 🔴 P0 | 21 | 22 | +1 (NFR-S10) |
| P1 | 42 | 43 | +1 (NFR-O11) |
| P2 | 10 | 10 | — |
| CQ | 1 | 1 | — |
| 삭제 | 2 | 2 | — |
| **총 활성** | **74** | **76** | **+2** |

L2643-2648 카운트 검증 ✅ (22+43+10+1 = 76 활성)

### 추가 관찰 — 3개 sanitization chain NFR 완성

R2에서 3개 공격 표면이 모두 NFR 품질 게이트를 확보:
1. **PER-1** (NFR-S8): personality 4-layer 100% 통과 [Sprint 1]
2. **MEM-6** (NFR-S10): observation 4-layer + 10종 payload 100% 차단 [Sprint 3]
3. **TOOLSANITIZE** (FR-TOOLSANITIZE3): tool response 10종 100% 차단 [Sprint 2-3]

NFR-S8/S10은 NFR 섹션에, TOOLSANITIZE3은 FR 섹션에 — 위치는 다르지만 3개 모두 품질 기준 존재. Bob Obs-B 패턴 참고.

### R2 차원별 점수

| 차원 | R1 | R2 | 변동 근거 |
|------|-----|-----|-----------|
| D1 구체성 | 9 | 9 | NFR-S10 4-layer + 10종 상세. NFR-A5 3개 ARIA 속성. NFR-O11 구체적 사용자 플로우 |
| D2 완전성 | 8 | 9 | 3개 gap 해소: MEM-6(S10), CEO 태스크(O11), COST2 scope. 76개 NFR이 확정 결정 12건 + Go/No-Go 14개 완전 커버 |
| D3 정확성 | 9 | 9 | NFR-A5 ↔ FR-PERS9 정합. NFR-P4 Go/No-Go #5 혼동 해소. NFR-COST2 ↔ Step 9 정합 |
| D4 실행가능성 | 9 | 9 | 모든 신규 NFR 측정 가능. NFR-O11 "≤ 5분" Go/No-Go #13 직접 대응 |
| D5 일관성 | 8 | 9 | 3개 sanitization chain 전부 NFR 품질 게이트. NFR-A5/FR-PERS9 aria 정합. Go/No-Go #13 ↔ NFR-O11 연결 |
| D6 리스크 | 8 | 9 | MEM-6 Sprint 3 P0 게이트 확보. Sprint 3 벡터 메모리 측정 시작(SC7). CEO UX 메트릭 추가 |

### 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| Go/No-Go #5 L598 "< 200KB" → "≤ 200KB" | Step 5 범위 | carry-forward (각 섹션 리뷰 시 수정 대상) |
| TOOLSANITIZE 품질 타겟 FR vs NFR 위치 | Bob Obs-B | 정보 존재하므로 non-blocking. 패턴 일관성은 향후 개선 |
| NFR 테이블 열 구조 불일치 (Performance 6열 vs Security 5열) | Bob Q1 | 가독성 이슈, 기능적 영향 없음 |
