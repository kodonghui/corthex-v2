# Critic-UX (Sally) Review — Stage 2 Step 11: Functional Requirements

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 2285–2494 (## Functional Requirements)
> Cross-refs: Domain MEM-6 (Obs 4-layer), MEM-7 (30일 TTL), confirmed-decisions #5/#8/#9, Go/No-Go #9 (L602), Go/No-Go a11y (L601), User Journeys J1-J10 (Step 6), Scoping Must-Have (Step 10)
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | FR-N8N4 보안 5항목 상세 (방화벽 + UI + proxy + DB 차단 + 2G 메모리). FR-PERS2 Zod 스키마 + DB CHECK 제약 명시. FR-OC7 LISTEN/NOTIFY + 폴백 패턴. FR-MKT2 6단계 파이프라인 구체적. 119개 FR 전반의 구체도 높음. |
| D2 완전성 | 7/10 | 19개 서브섹션, v2 70개 + v3 49개 = 119개 FR로 포괄적. **그러나**: **(1)** MEM-6 observation 4-layer sanitization FR 부재 — 확정 결정 #8, Go/No-Go #9인데 "기능 계약서"에 없음. **(2)** MEM-7 30일 TTL FR 부재 — 확정 결정 #5. **(3)** FR-PERS a11y (슬라이더 키보드 접근성) Go/No-Go L601에 명시인데 FR 없음. **(4)** FR-MEM3 reflection trigger 불완전. |
| D3 정확성 | 9/10 | Option B 정합 완벽 (proactive 5건 + cross-section 2건). n8n 2G(#2), WebSocket 50/co(#10) 정확. GATE 삭제(FR37, FR39) 적절. Phase/Sprint 배정 정확. |
| D4 실행가능성 | 9/10 | FR-OC7 LISTEN/NOTIFY fallback 실용적. FR-PERS2 Zod+CHECK 구현 가능. FR-MKT7 fallback 전환 구체적. Sprint 매핑이 Scoping(Step 10) 테이블과 정합. |
| D5 일관성 | 7/10 | Option B 전파 우수 (7건 proactive fix). GATE 반영 정확. **약점**: **(1)** MEM-6가 Domain(Step 7), Innovation(Step 8), Compliance(Step 9), Risk Registry(R10), Go/No-Go(#9) 5곳에 존재하나 FR에 부재. **(2)** Go/No-Go #9 "Observation Poisoning 4-layer 방어"에 대응하는 FR 없음. **(3)** L601 a11y "Big Five 슬라이더: aria-valuenow + 키보드 조작" → FR-PERS에 미반영. **(4)** FR-MEM3 "20개 누적 시 자동 실행" vs MEM-2 "confidence ≥ 0.7 우선 + Tier 한도 + advisory lock" — 스펙 충실도 차이. |
| D6 리스크 | 7/10 | FR-TOOLSANITIZE1-3이 도구 응답 보안(#11) 커버. **그러나** MEM-6 observation content 보안(#9)은 별도 공격 표면인데 FR 부재. 공격 체인: malicious observation → Reflection LLM 오염 → Soul 주입. "기능 계약서에 없으면 구현 안 됨"(L2287) 원칙 적용 시, observation poisoning 방어가 FR-MEM에 없으면 구현되지 않을 리스크. |

---

## 이슈 목록

### MAJOR (1)

**1. [D2/D5/D6] MEM-6 Observation 4-layer sanitization FR 부재**
- 확정 결정 #8: "4-layer sanitization (max 10KB, control char strip, prompt hardening, content classification)"
- Go/No-Go #9 (L602): "10종 adversarial payload 100% 차단"
- Domain MEM-6 (Step 7), Innovation 7 (Step 8), Compliance (Step 9), Risk Registry R10 — **5곳에서 명시**
- FR-MEM1~11에 observation content sanitization FR 없음
- FR-TOOLSANITIZE1-3은 **도구 응답** 보안(#11)이지 **observation content** 보안(#9)이 아님 — PER-1 vs MEM-6 = 별개 공격 표면, 별개 방어 체인 (Step 7 확인)
- L2287 "여기에 없는 기능은 최종 제품에 존재하지 않는다" — MEM-6 FR 부재 = 구현 누락 리스크
- **수정**: FR-MEM에 FR-MEM12/13 추가:
  - FR-MEM12: [Sprint 3] observation 저장 전 4-layer sanitization 실행 (max 10KB truncate + 제어문자 strip + `<observation>` 태그 격리 + 콘텐츠 분류 flagging)
  - FR-MEM13: [Sprint 3] flagged observation은 Reflection 크론에서 제외된다

### MINOR (3)

**2. [D2/D5] MEM-7 30일 TTL FR 부재**
- 확정 결정 #5: "processed observations (reflected=true): 30일 후 자동 삭제"
- Domain MEM-7 (Step 7): "reflected=true 관찰 30일 후 자동 삭제 크론. Admin 보존 정책"
- Compliance (Step 9 L2052): "reflected=true observations 30일 후 자동 삭제 (MEM-7, Sprint 3 필수)"
- FR-MEM1~11에 observation TTL/자동 삭제 FR 없음
- **수정**: FR-MEM14 추가: [Sprint 3] reflected=true observations가 30일 후 자동 삭제된다 (Admin 보존 정책으로 기간 변경 가능)

**3. [D2/D5] FR-PERS a11y — 슬라이더 키보드 접근성 부재**
- Go/No-Go a11y (L601): "Big Five 슬라이더: aria-valuenow + 키보드 조작 (←→ 키)"
- FR-PERS1-8에 접근성 요구사항 없음
- FR-OC10은 /office a11y (aria-live 텍스트 대안) 우수하게 커버
- Big Five 슬라이더는 Admin 핵심 도구 — 키보드 접근성 필수
- **수정**: FR-PERS8 뒤에 FR-PERS9 추가: [Sprint 1] Big Five 슬라이더가 키보드(←→ 키)로 조작 가능하고 aria-valuenow 속성이 현재 값을 반영한다

**4. [D2/D3] FR-MEM3 Reflection trigger 불완전**
- FR-MEM3: "미처리 관찰 20개 누적 시 자동 실행"
- Domain MEM-2: 일 1회 크론 + reflected=false ≥ 20 AND + confidence ≥ 0.7 우선 + Tier 3-4 주 1회 한도 + ECC 2.2 비용 초과 시 자동 일시 중지 + advisory lock
- FR-MEM4에서 "비용: NFR-COST3 Haiku ≤ $0.10/일" 참조하지만, **자동 일시 중지 메커니즘**은 FR에 없음
- Tier별 한도, confidence 우선순위, advisory lock도 FR에 없음
- **수정**: FR-MEM3 확장: "... 자동 실행된다. confidence ≥ 0.7 관찰 우선 처리. Tier 3-4는 주 1회 한도. 비용 한도(NFR-COST3) 초과 시 크론 자동 일시 중지"

---

### 긍정적 관찰

- **FR-N8N4 보안 상세도(L2440)**: 5개 보안 항목을 하나의 FR에 집약하되 각 항목이 구체적. "(1) VPS 방화벽... (2) N8N_DISABLE_UI... (3) Hono proxy... (4) DB 직접 접근 금지... (5) Docker 2G" — 실질적 구현 체크리스트 역할.
- **FR-PERS2 검증 명세(L2459)**: Zod 스키마, DB CHECK 제약, prompt injection 방지까지 3중 검증. "검증 필수" 태그로 구현 누락 방지.
- **FR-OC7 LISTEN/NOTIFY + fallback(L2429)**: "Neon serverless 지원 여부를 Sprint 4 착수 전 검증 필수. 미지원 시 폴백: 500ms 폴링" — 실용적 불확실성 대응.
- **FR-OC9/OC10 접근성 패턴**: 모바일 리스트 뷰(OC9) + aria-live 텍스트 대안(OC10) — /office의 UX graceful degradation 완벽.
- **GATE 삭제 처리**: FR37, FR39 취소선 + GATE 주석. 삭제 사유 추적 가능.
- **Option B 정합**: 7건 proactive fix로 모든 FR-MEM이 "agent_memories(reflection)" 일관 용어 사용. "별도 reflections 테이블 없음" 명시.
- **FR-MKT2 파이프라인 상세**: "주제 입력 → AI 리서치 → 카드뉴스 + 숏폼 → 사람 승인 → 멀티 플랫폼 게시" + "일부 플랫폼 실패 시 성공 플랫폼 유지" — 에러 처리까지 FR에 포함.

---

## 가중 평균: 7.90/10 ❌ FAIL (Grade A 8.0 미달)

계산: (9×0.15) + (7×0.20) + (9×0.15) + (9×0.15) + (7×0.20) + (7×0.15) = 1.35 + 1.40 + 1.35 + 1.35 + 1.40 + 1.05 = **7.90**

**FAIL 사유**: MEM-6 observation 4-layer sanitization이 "기능 계약서"에 없으면, Go/No-Go #9를 통과할 수 없다. 확정 결정 #8이 FR로 구현되지 않는 리스크가 8.0 미달의 주요 원인.

---

## Cross-talk 완료

### 스코어 비교

| Critic | Score | Status |
|--------|-------|--------|
| Winston (Architecture) | 8.80 | ✅ PASS |
| Sally (UX) | 7.90 | ❌ FAIL |
| Bob (Scrum) | 7.83 | ❌ FAIL |
| Quinn (QA/Security) | 7.65 | ❌ FAIL |

### Cross-talk 합의

| Issue | Quinn | Winston | Sally | Bob | 합의 |
|-------|-------|---------|-------|-----|------|
| MEM-6 FR 부재 | ✅ M1 | ✅ M1 | ✅ M1 | ✅ #3 | **4/4 만장일치** |
| MEM-7 TTL FR 부재 | ✅ m1 | ✅ M2 | ✅ m2 | ✅ 채택 | **4/4** |
| FR-MEM3 trigger 불완전 | ✅ | — | ✅ m4 | ✅ #2 | **3/4** |
| FR-PERS a11y 부재 | — | — | ✅ m3 | ✅ 채택 | **2/4** |
| FR-TOOLSANITIZE Sprint 2↔#11 Sprint 3 | — | — | ✅ 채택 | ✅ #1 | **2/4** |

### Cross-talk 채택

**#5 (from Bob #1). [D3/D5] FR-TOOLSANITIZE Sprint 2 vs Go/No-Go #11 Sprint 2-3 (observation)**
- FR-TOOLSANITIZE1-3 모두 [Sprint 2]인데 Go/No-Go #11은 Sprint 2-3 범위
- 구현 Sprint 2, 검증 Sprint 3 의도라면 FR에 명시 필요
- observation 수준 — Sprint 매핑 모호성이지 기능 누락은 아님

### Cross-talk 관찰 (스코어 비변동)

**Obs-A (from Quinn l1). FR에 구현 상세 포함 (FR-PERS2 Zod, FR-N8N4 Docker)**
- Solo-dev + Claude Code AI pair 컨텍스트에서 FR이 곧 구현 명세 — 적절
- 가독성은 떨어지지만 정보 누락보다 나음

**Obs-B (from Winston Q2). 허브 채팅 접근성 FR 부재**
- 허브 = assistant-ui/AI Elements 오픈소스 → 접근성 내장
- /office = PixiJS 커스텀 → FR-OC10 필수
- 허브 접근성 별도 FR 불필요

**Obs-C. Journey FR 커버리지 검증**
- J1-J4, J7-J10: Sprint 1-4 범위 내 FR 완전 커버 ✅
- J5 (가입자 체험): Phase 5+ 범위
- J6 (에이전트 내부): developer-facing, FR 범위 밖

### Bob Q2 답변 — FR-MEM3 trigger model 수준
- FR = "무엇을" (일 1회 크론, ≥20 AND, Tier 한도 참조, 비용 초과 자동 중지)
- Domain = "어떻게" (confidence 수치, Tier cap 구체값, advisory lock, 시간)
- Bob 수정 예시 동의. John에게 이 수준으로 권장.

### Quinn MEM-6 UX impact 확인
- Admin 관찰 이력(FR-MEM11): flagged obs 시각 구분 필요
- CEO 성장 지표(FR-MEM9): poisoned reflection → 오염된 메트릭
- CEO 알림(FR-MEM10): poisoned reflection에도 알림 발송 → 신뢰 오류
- MEM-6 FR = 보안 + UX 신뢰성의 기반

---

## R2 검증 — 8 fixes applied

### Fix 검증 결과

| # | Fix | 검증 | 결과 |
|---|-----|------|------|
| 1 | FR-MEM12 Observation 4-layer 방어 (MAJOR) | L2481: 4-layer 상세 (10KB+strip+hardening+classification), Admin 플래그+감사 로그, MEM-6/Go/No-Go #9/확정 #8 참조, PER-1 분리 명시 | ✅ 완벽 |
| 2 | FR-MEM13 30일 TTL | L2482: reflected=true 30일 자동 삭제, MEM-7/확정 #5, Admin 보존 기간 조정 | ✅ |
| 3 | FR-MEM14 비용 자동 차단 | L2483: NFR-COST3 한도 초과 → 크론 자동 일시 중지 + Admin 알림, ECC 2.2/Go/No-Go #7, Admin 확인 후 재개 | ✅ |
| 4 | FR-MEM3 트리거 조건 보완 | L2472: 일 1회 크론 + reflected=false ≥ 20 AND + confidence ≥ 0.7 + Tier 한도 + advisory lock + ECC 2.2 auto-pause | ✅ Bob "무엇을" 수준 준수 |
| 5 | FR-N8N4 SEC-4/7/8 추가 | L2440: 8/8 완성 — (4) HMAC webhook (7) AES-256-GCM (8) rate limit 60/min | ✅ |
| 6 | FR-TOOLSANITIZE3 Sprint 명확화 | L2489: "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]" + PER-1/FR-MEM12 분리 명시 | ✅ |
| 7 | FR-PERS9 슬라이더 접근성 | L2466: 키보드 ←→ + aria-valuenow + aria-valuetext. Go/No-Go L601 정합 | ✅ |
| 8 | FR-MEM1 MEM-6 참조 | L2470: "MEM-6 4-layer 방어 적용 후 자동 저장. 방어 실패 시 저장 거부 + 감사 로그" | ✅ 게이트 체인 완성 |

**8/8 fixes verified ✅**

### 추가 관찰 — 3개 공격 표면 완전 분리

R2에서 3개 sanitization chain이 FR 수준에서 명확히 분리됨:
1. **PER-1** (NFR-S8): personality_traits → bounded integer → 4-layer (Key Boundary → API Zod → extraVars strip → Template regex)
2. **MEM-6** (FR-MEM12): observation content → free text → 4-layer (10KB → strip → hardening → classification)
3. **FR-TOOLSANITIZE** (#11): tool response → structured output → injection 감지 + 차단

FR-MEM1 "방어 실패 시 저장 거부"로 MEM-6 게이트가 observation 진입점에서 차단. FR-TOOLSANITIZE3이 3개 공격 표면 교차 참조. 체계적.

### R2 차원별 점수

| 차원 | R1 | R2 | 변동 근거 |
|------|-----|-----|-----------|
| D1 구체성 | 9 | 9 | 기존 높은 수준 유지. 신규 5개 FR 모두 구체적 (FR-MEM12 4-layer 상세, FR-MEM3 6개 조건, FR-N8N4 8/8 SEC) |
| D2 완전성 | 7 | 9 | 4개 누락 FR 모두 추가 (MEM-6→FR-MEM12, MEM-7→FR-MEM13, a11y→FR-PERS9, trigger→FR-MEM3 확장) + FR-MEM14 비용 차단. 124개 FR로 확정 결정/Go/No-Go 완전 커버 |
| D3 정확성 | 9 | 9 | FR-MEM3이 Domain MEM-2 "무엇을" 수준과 정합. FR-TOOLSANITIZE3 Sprint 매핑 정확. Option B 용어 일관 유지 |
| D4 실행가능성 | 9 | 9 | FR-MEM12 4-layer 구현 경로 명확. FR-MEM14 auto-pause 메커니즘 구체적. FR-PERS9 = 표준 HTML5 range a11y |
| D5 일관성 | 7 | 9 | MEM-6: 5-section 일관성 복원 (Domain→Innovation→Compliance→Risk→FR). Go/No-Go #9→FR-MEM12 대응 완성. L601 a11y→FR-PERS9 연결. 3개 sanitization chain 교차 참조 |
| D6 리스크 | 7 | 9 | MEM-6 공격 체인(malicious obs→Reflection 오염→Soul 주입) FR-MEM1+12로 차단. 비용 폭주 FR-MEM14로 방어. "기능 계약서에 없으면 구현 안 됨" 리스크 해소 |

### 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

### Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| Go/No-Go #5 L460/L598 "< 200KB" → "≤ 200KB" | Step 5 범위 | 각 섹션 리뷰 시 수정 대상 (carry-forward) |
| FR-N8N4 8항목 과밀 | Quinn l1 | solo-dev 컨텍스트 수용. 구현 시 체크리스트 분해 권장 |
| FR-MEM12 content classification flag vs block 경계 | observation | 4-layer 마지막 단계가 hard block only인지 soft flag 경로도 있는지 구현 시 명확화 |
