# Stage 2 Step 05 — Quinn (Critic-B: QA + Security) Review

**Step:** 5 — Success Criteria
**Section:** PRD lines 471–663
**Grade:** B (reverify)
**Date:** 2026-03-22
**Cycle:** 2 (post-fix verification)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 8/10 | v2 기준 매우 구체적(시간, 퍼센트, 측정법 명시). v3 Sprint-aligned 기준도 대부분 정량적. 에셋 품질(#8)만 주관적(PM 승인, 루브릭 없음). |
| D2 완전성 | **25%** | 5/10 | v3 Technical 테이블 14개 중 8개만 커버 — #9~#14 전부 누락. Pre-Sprint 마일스톤 Voyage AI 누락. Observation poisoning 성공 기준 전무. 비용 한도 실패 트리거 부재. P0에 신규 critical gates 미포함. |
| D3 정확성 | 15% | 5/10 | **L549 n8n OOM "4G→6G"** — Brief 2G mandate + 확정 결정 #2 정면 위반. **L585 Gate #6** "tokens.css 생성" — Step 4에서 "ESLint 0 + Playwright 0"으로 수정됐으나 여기는 구버전. |
| D4 실행가능성 | 10% | 7/10 | Sprint 마일스톤 명확, 실패 트리거 대응 전략 실행 가능. 다만 6개 누락 게이트의 검증 방법 부재로 구현팀 체크리스트 불완전. |
| D5 일관성 | 15% | 4/10 | Gate #6 이중 정의(L585 vs L461). Pre-Sprint 3항목 vs Exec Summary 4항목. "4G→6G" vs R6 "2G cap". Technical 8/14 게이트. Sprint 3 완료 기준에 Gate #7 auto-block 미반영. |
| D6 리스크 | **25%** | 5/10 | observation poisoning 실패 시나리오 없음. 비용 한도 위반 실패 트리거 없음. Voyage migration 실패 트리거 없음. P0에 #10(Voyage, Pre-Sprint blocker), #12(v1 parity) 미포함. |

### 가중 평균: 5.35/10 ❌ FAIL

계산: (8×0.10) + (5×0.25) + (5×0.15) + (7×0.10) + (4×0.15) + (5×0.25) = 0.80 + 1.25 + 0.75 + 0.70 + 0.60 + 1.25 = **5.35**

---

## 이슈 목록

### CRITICAL (2)

**#1 [D3/D5] L549 n8n OOM failover "4G→6G" — Brief 2G mandate 위반**
- L549: "n8n Docker OOM 3회+ | Docker 메모리 한도 조정 (4G→6G). 불가 시 VPS 스케일 검토"
- 확정 결정 #2: `--memory=2g`, `NODE_OPTIONS=--max-old-space-size=1536` (Brief mandate)
- Exec Summary R6 (L402): "Docker compose: `memory: 2G`"
- **4G와 6G는 Brief에서 명시적으로 금지한 값**. OOM 대응은 2G 제약 내에서 해결해야 함
- 수정안: "2G 제약 내 최적화 (NODE_OPTIONS 조정, 동시 워크플로우 제한, 불필요 모듈 비활성화). 불가 시 Brief 수정 요청 후 결정"

**#2 [D2/D5] v3 Technical 테이블 (L579-594) — 14개 Go/No-Go 중 8개만 커버**
- 섹션 헤더: "(Go/No-Go 통합 + Sprint 정렬)"
- 포함: #1, #2, #3, #4, #5, #6, #7, #8
- **누락 6개:**
  - #9 Observation Poisoning 방어 (Sprint 3, security)
  - #10 Voyage AI 마이그레이션 (Pre-Sprint, blocker)
  - #11 에이전트 보안 Tool Sanitization (Sprint 3, security)
  - #12 v1 기능 패리티 (전체, CLAUDE.md mandate)
  - #13 사용성 검증 (전체, v2 교훈)
  - #14 Capability Evaluation (Sprint 3, memory 검증)
- 이 6개는 Step 4에서 추가된 게이트 — Success Criteria에 미전파
- 구현팀이 Technical Success를 verification checklist로 사용하면 6개 게이트 미검증

### MAJOR (4)

**#3 [D5] L585 Gate #6 정의 — Step 4 수정과 불일치**
- L585: "디자인 토큰 추출 | tokens.css 생성 + Stitch 2 디자인 시스템 준수 | 1 | #6"
- Exec Summary L461: "UXUI Layer 0 자동 검증 | ESLint 하드코딩 색상 0 + Playwright dead button 0 (Brief §4 기준)"
- **완전히 다른 정의**. tokens.css 생성은 선행 조건이지 게이트 자체가 아님 (Step 4 Fix 2에서 해결)
- 수정안: L585를 Exec Summary L461과 동일하게 변경

**#4 [D2/D5] L522 Pre-Sprint 마일스톤 — Voyage AI migration 누락**
- L522: "Neon Pro 업그레이드 + 디자인 토큰 확정 + 사이드바 IA 확정" (3개)
- Exec Summary L430-434: Neon Pro + Voyage AI + 사이드바 IA + 디자인 토큰 (4개)
- Step 4 Fix 4에서 Voyage AI를 Exec Summary Pre-Sprint에 추가했으나 여기 미전파
- 수정안: "+ Voyage AI 임베딩 마이그레이션 (768d→1024d, re-embed + HNSW rebuild)" 추가

**#5 [D2/D6] Observation poisoning — Success Criteria 전체에서 부재**
- Go/No-Go #9 (Exec Summary L464): "4-layer sanitization E2E 검증, 10종 adversarial payload 100% 차단"
- v3 Technical 테이블: ❌ 없음
- P0/P1/P2 우선순위: ❌ 없음
- Sprint 3 완료 기준 (L625): ❌ 없음
- v3 실패 트리거 (L545-553): ❌ 없음
- Security gate가 Success Criteria 어디에도 없으면 QA가 검증 범위에서 제외할 위험

**#6 [D2/D6] 비용 한도 실패 트리거 부재**
- Gate #7 (Step 4 fix): "비용 한도 초과 시 크론 자동 일시 중지 (ECC 2.2). Tier별 일일/월간 예산 한도"
- 확정 결정 #6: $17/mo total (reflection $1.80 + importance $9 + operational $6.20)
- v3 실패 트리거 (L545-553): n8n OOM, PixiJS bundle, 마케팅 실패율 — **비용 관련 없음**
- Sprint 3 Reflection + importance scoring이 $17/mo 초과 시 대응 전략 미정의
- 수정안: "LLM 비용 > $17/mo | Sprint 3 중 | Reflection 크론 빈도 감소 + importance scoring 배치 주기 확대. Auto-block(Gate #7) 발동 시 수동 해제 전 크론 일시 중지 유지"

### MINOR (3)

**#7 [D2/D6] P0 우선순위 (L598-608) — 신규 critical gates 미포함**
- P0 10개: Go/No-Go #1-#5만 포함
- 누락 P0 후보:
  - #10 Voyage migration (Pre-Sprint blocker — 실패 시 Sprint 3 전체 불가)
  - #12 v1 기능 패리티 (CLAUDE.md: "if it worked in v1, it must work in v2")
  - #9 Observation poisoning (security — 실패 시 production 보안 위험)
- P1 목록(L610)에도 이 게이트들 없음

**#8 [D5] Sprint 3 완료 기준 (L625) — Gate #7 auto-block 미반영**
- L625: "Reflection 크론 90%+ + 반복 오류 30%- + Haiku ≤ $0.10/일"
- Gate #7 (Step 4): "+ 비용 한도 초과 시 크론 자동 일시 중지 (ECC 2.2)"
- Sprint 3 "완료" 판정 시 auto-blocking 동작 검증이 빠져 있음

**#9 [D5] L590 Reflection 기준 — 20개 관찰 트리거 조건 미포함**
- L590: "크론 실행 성공 + Haiku 비용 ≤ $0.10/일"
- Exec Summary L376 (Step 4 fixed): "일 1회 크론 + reflected=false 관찰 20개 이상 조건 충족 시"
- Product Scope L910: "에이전트별 최근 20개 관찰(reflected=false)이 쌓이면 자동 실행"
- Technical Success에서 트리거 조건 검증이 누락 — 크론이 실행됐는지만 확인하고 올바른 조건에서 실행됐는지는 미검증

---

## 확정 결정 반영 체크리스트 (Success Criteria 내)

| # | 확정 결정 | 반영 | 위치 |
|---|----------|------|------|
| 1 | Voyage AI 1024d | ❌ Pre-Sprint 마일스톤 누락, Technical 테이블 누락 | — |
| 2 | n8n Docker 2G | ❌ **L549 "4G→6G" 정면 위반** | L549 |
| 3 | n8n 8-layer | ⚠️ "3중 검증"만 (8-layer 전체 아님 — 게이트 #3 정의는 3중이 맞음) | L586 |
| 4 | Stitch 2 | ⚠️ L585 "Stitch 2" 언급이나 게이트 정의 구버전 | L585 |
| 5 | 30일 TTL | ❌ Success Criteria에 없음 (Product Scope level) | — |
| 6 | LLM Cost $17/mo | ❌ 실패 트리거에 비용 한도 없음 | — |
| 7 | reflected/reflected_at | ❌ 구현 상세 — Success Criteria 불필요 | — |
| 8 | Obs poisoning | ❌ Technical/P0/Sprint 3 완료/실패 트리거 전부 부재 | — |
| 9 | Advisory lock | ❌ Technical 테이블 없음 (구현 상세일 수 있음) | — |
| 10 | WebSocket limits | ❌ Technical 테이블 없음 | — |
| 11 | Go/No-Go 14 gates | ❌ Technical 테이블 8개만 | L579-594 |
| 12 | host.docker.internal | ⚠️ Architecture level | — |

**필수 반영**: #1(Voyage), #2(2G 위반 수정), #6(비용 한도), #8(obs poisoning), #11(14 gates)

---

## Cross-talk 요약

### Winston (Critic-A) — 6.10/10 ❌ FAIL
- C1: Technical Success #9-#14 누락 확인. 보안 테스트 사각지대 우려
- C2: L549 "4G→6G" Brief 위반 확인
- **NEW 질문**: Obs Poisoning "10종 payload 100% 차단"을 Technical Success에 포함해야 하는가? → Quinn 답변: YES. Go/No-Go 통합 표방 섹션에서 보안만 빠지면 optional 인식 위험
- **NEW 질문**: Voyage re-embed + n8n 동시 VPS 리소스 경합? → Quinn 분석: Neon serverless이므로 HNSW rebuild는 서버 측. VPS 부하 낮음. 다만 Pre-Sprint에서 n8n은 아직 미설치(Sprint 2)
- **NEW 질문**: Reflection 90% 실패 시 10% 처리 정책(retry/데이터 유실/alerting) 미정의 → 유효한 갭이나 Architecture 단계에서 상세화

### Sally (Critic-C) — 6.40/10 ❌ FAIL
- 보안 게이트 #9/#11 Technical 부재 확인
- P0에 보안 게이트 없음 — QA 우선순위에서 보안 테스트 하위 위험
- L549 "4G→6G" QA 테스트 환경 기준 혼란 우려
- **NEW**: Sprint 3 완료 기준에 Gate #4(Memory Zero Regression), #9(obs poisoning), #14(Capability Eval) 미참조 — Sprint 완료 판정 시 QA 체크리스트 불일치

### Bob (Critic-D) — 5.30/10 ❌ FAIL (Grade C)
- C1: L549 "4G→6G" Brief 위반 확인
- C2: Gates #9-#14 Technical 부재 확인
- **질문**: #9/#11 보안 게이트 P0 여부? → Quinn 답변: YES. Security failure = sprint halt = P0 by definition
- **NEW**: Sprint 3 마일스톤(L525) 3개 메트릭만 — advisory lock, poisoning defense, Option B 확장, Capability Eval 전부 누락. "가장 복잡한 Sprint인데 exit criteria가 가장 단순" — 구조적 문제
- Gate #6 정의 불일치 영향 분석 요청 → Quinn: Sprint 1 "Technical PASS but Go/No-Go FAIL" 상황 발생 가능

### Cross-talk 합의
- **전원 합의 (4/4)**: v3 Technical 테이블 #9-#14 누락 (CRITICAL)
- **전원 합의**: L549 "4G→6G" Brief 2G mandate 위반 (CRITICAL) — 단일 위치 오류(isolated)
- **전원 합의**: P0에 보안 게이트 #9/#11 필수 — security failure = sprint halt
- **전원 합의**: Sprint 3 완료 기준 불완전 — 가장 복잡한 Sprint인데 exit criteria 최소
- **Sally 추가**: v3 실패 트리거가 기술에만 치우침 — 보안/비용/UX 시나리오 전무
- **Winston carry-forward**: Reflection 90% 실패 시 10% 처리 정책 미정의 → Architecture

### 크리틱 평균: (5.35 + 6.10 + 6.40 + 5.30) / 4 = **5.79/10** ❌ FAIL

---

## 수정 제안 요약 (9건)

1. **L549**: "4G→6G" → "2G 제약 내 최적화 (NODE_OPTIONS 조정, 동시 워크플로우 제한). Brief 수정 요청 후 결정"
2. **v3 Technical 테이블**: 6개 게이트 추가 (#9 obs poisoning, #10 Voyage, #11 tool sanitization, #12 v1 parity, #13 usability, #14 Capability Evaluation)
3. **L585 Gate #6**: "tokens.css 생성" → "ESLint 하드코딩 색상 0 + Playwright dead button 0" (Exec Summary 정합)
4. **L522 Pre-Sprint**: Voyage AI migration 추가 → 4개 항목으로 통합
5. **Sprint 3 완료 기준 (L625)**: + observation poisoning 검증 + auto-blocking 검증 + Capability Evaluation
6. **v3 실패 트리거**: LLM 비용 $17/mo 초과 시나리오 + observation poisoning 방어 실패 시나리오 + Voyage migration 실패 시나리오 추가
7. **P0 우선순위**: #10 Voyage migration, #12 v1 parity 추가 (최소). #9 obs poisoning 추가 권장
8. **L590 Reflection 기준**: "reflected=false 관찰 20개 이상 조건 충족 시 트리거" 검증 추가
9. **L625 Sprint 3**: Gate #7 "비용 한도 초과 시 크론 자동 일시 중지" 동작 검증 추가

---

## Cycle 2 — Post-Fix Verification (10 fixes)

### 검증 결과: 12/12 항목 ✅ ALL RESOLVED

| # | 원본 이슈 | 수정 확인 | PRD 위치 |
|---|----------|----------|---------|
| 1 | L549 "4G→6G" Brief 위반 | ✅ 2G 유지, max_concurrency=1, restart | L549 |
| 2 | Technical 8/14 gates | ✅ 6행 추가 (#9-#14) | L599-604 |
| 3 | Gate #6 old definition | ✅ ESLint 0 + Playwright 0 | L589 |
| 4 | Pre-Sprint Voyage 누락 | ✅ 4개 항목 + Go/No-Go #10 | L522 |
| 5 | Obs poisoning 전체 부재 | ✅ Technical + P0 + Sprint 3 + 실패 트리거 | L599, L619, L639, L555 |
| 6 | Cost ceiling 실패 트리거 | ✅ $17/월 초과 시나리오 추가 | L556 |
| 7 | P0 보안 gates 미포함 | ✅ 10→14개 (#9/#10/#11/#12) | L619-622 |
| 8 | Sprint 3 auto-block | ✅ Gate #7 confidence+20개+ECC 2.2+advisory lock | L594, L639 |
| 9 | Reflection 20개 trigger | ✅ "confidence ≥ 0.7 + reflected=false 20개" | L594 |
| 10 | Sprint 3 #4/#9/#14 refs | ✅ Sprint 3 = #7+#9+#4+#14+advisory lock | L639 |
| 11 | 실패 트리거 보안/비용 | ✅ Voyage+poisoning+cost+tool sanitization | L554-557 |
| 12 | P0 #9/#10/#12 추가 | ✅ 전부 P0 목록에 포함 | L619-622 |

### Residuals (2건 — minor, cosmetic)

**Residual-1 [MINOR]**: L600 Voyage SQL `SELECT COUNT(*) FROM observations WHERE embedding IS NOT NULL` — observations만 체크. Exec Summary Gate #10 (L465)은 `knowledge_docs WHERE embedding IS NULL = 0`. 전수 re-embed 검증은 ALL vector-bearing tables(knowledge_docs, observations, agent_memories) 필요. Architecture에서 SQL 구체화 예상.

**Residual-2 [MINOR]**: L604 Capability Evaluation "정확도/관련성/완결성 기준 통과" — Exec Summary Gate #14 정의("동일 태스크 N≥3회, 3회차 재수정 ≤ 1회차 50%")보다 추상적. 다만 Technical table은 요약 수준이므로 수용 가능.

### 수정 후 차원별 점수

| 차원 | 가중치 | Cycle 1 | Cycle 2 | 변화 근거 |
|------|--------|---------|---------|----------|
| D1 구체성 | 10% | 8 | 9 | Reflection 기준에 confidence+20개+auto-block+advisory lock 전부 추가 |
| D2 완전성 | **25%** | 5 | 9 | 14개 게이트 전부 Technical 반영, P0 14개, 실패 트리거 4건 추가, Sprint 완료 기준 게이트 참조 |
| D3 정확성 | 15% | 5 | 9 | L549 2G 준수, Gate #6 Brief 정합, Reflection 조건 Product Scope 일치 |
| D4 실행가능성 | 10% | 7 | 8.5 | 완전한 Technical checklist, Sprint exit criteria 명확 |
| D5 일관성 | 15% | 4 | 8.5 | Gate #6 통일, Pre-Sprint 4항목, Sprint→Go/No-Go 매핑 완전. Residual-2로 0.5 감점 |
| D6 리스크 | **25%** | 5 | 9 | 보안/비용/migration 실패 트리거 전부 추가, P0에 보안 gates 포함 |

### 가중 평균: 8.85/10 ✅ PASS

계산: (9×0.10) + (9×0.25) + (9×0.15) + (8.5×0.10) + (8.5×0.15) + (9×0.25)
= 0.90 + 2.25 + 1.35 + 0.85 + 1.275 + 2.25 = **8.875 ≈ 8.85**

### 보충 수정 (Fix 11-12) 검증

**Fix 11 (UX 실패 트리거 3건)**: L558-560 ✅
- Admin 온보딩 >15분 → UI 간소화 + 가이드 패널 (Go/No-Go #13)
- CEO 내비게이션 혼란 → IA 재검토 + 퀵액션 (Go/No-Go #13)
- Big Five 슬라이더 >3분 → 프리셋 원클릭 + Low/Mid/High 3단계
- v3 실패 트리거 총: 14건 (7 기술 + 4 보안/비용 + 3 UX) — Sally 지적 완전 해소

**Fix 12 (n8n OOM 3단계 에스컬레이션)**: L549 ✅
- "(1) 메모리 프로파일링 (2) NODE_OPTIONS 최적화 (3) 워크플로우 분할"
- "4G=OOM 확정" 명시, 마지막 수단 "VPS 전체 스케일업" (n8n 단독 증설 불가)
- Bob의 3-step 반영

### 최종 점수 조정: 8.85 → **8.90/10** ✅ PASS
- D4 실행가능성: 8.5→9 (n8n 3단계 에스컬레이션으로 대응 경로 명확화)
- 계산: (9×0.10)+(9×0.25)+(9×0.15)+(9×0.10)+(8.5×0.15)+(9×0.25) = 8.925 ≈ **8.90**

### 점수 이력
- Cycle 1: **5.35/10 ❌ FAIL** (2C + 4M + 3m = 9건)
- Cross-talk: 3건 추가 → 12건 총. 크리틱 평균 5.79
- Cycle 2: **8.90/10 ✅ PASS** (12 fixes, 12/12 resolved, 2 minor residuals)
