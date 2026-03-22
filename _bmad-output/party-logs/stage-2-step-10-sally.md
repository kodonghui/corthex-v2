# Critic-UX (Sally) Review — Stage 2 Step 10: Project Scoping & Phased Development

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 2085–2272 (## Project Scoping & Phased Development)
> Cross-refs: confirmed-decisions-stage1.md (#2 n8n 2G, #5 30일 TTL, #10 WebSocket 50/co), Go/No-Go 14 gates (L586-607 / L453-469), Innovation 품질 게이트 (L1743-1756), User Journeys (Step 6, L1100-1150), Technical Architecture Sprint 2 과부하 (L2077)
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Sprint 전략 테이블 5-column 구조 (핵심 기능, Go/No-Go, 블로커 조건, 의존성) 우수. 리스크 테이블 확률·영향·완화 3축 구조. 오픈소스 Phase별/Sprint별 버전 핀 + 대체 대상 명시. Sprint 2 분할 트리거 구체적 ("중간 리뷰 시점에 인프라 트랙 미완료 시 워크플로우 트랙을 Sprint 2.5로 이월"). "직접 구현 유지" 목록 10항목 파일명·Sprint 매핑 완비. |
| D2 완전성 | 8/10 | MVP 전략 → 기능셋 → 리스크 → 오픈소스 논리 흐름 우수. v3 여정 지원 테이블 6행으로 Sprint↔Journey 매핑. **약점:** **(1)** Sprint 전략 테이블에 Pre-Sprint 행 부재 — Voyage AI 마이그레이션(Go/No-Go #10), Neon Pro, 디자인 토큰 등 중요 선행 작업이 L2124 텍스트에만 언급. **(2)** Sprint 테이블 Go/No-Go 6/14 — 8개 게이트 누락, 교차 참조 문구 없음. **(3)** v3 여정 테이블에서 Journey 2(박과장)와 Journey 3(투자자)의 v3 혜택 미반영. |
| D3 정확성 | 9/10 | MVP-A/B 2단계 검증 논리 정확. Sprint 의존성 근거 4항목 논리적. 오픈소스 패키지 용도·대체 대상 정합. 확정 결정 반영 (≤ 200KB PIX-1, Option B MEM-1, CLI Max GATE). **약점:** L2197 "Sprint 2 과부하 (15건+ 동시)" — Technical Architecture(L2077)에서 Step 9 Fix 5 적용으로 "17건+"으로 수정됨. 전파 누락. |
| D4 실행가능성 | 9/10 | Sprint 순서 근거가 변경 범위(Big Five 최소) → 병렬성(n8n 독립 컨테이너) → DB 마이그레이션(Sprint 1 주입 경로 활용) → 데이터 의존(activity_logs) 순으로 논리적. Sprint 2.5 분할 트리거 명확. Sprint 1 지연 시 n8n 인프라 병렬 착수 대응. "직접 구현 유지" 목록이 아키텍처와 정합. |
| D5 일관성 | 8/10 | Sprint 테이블 ↔ Sprint roadmap(L430-451) 대체로 정합. Must-Have 6개 ↔ Phase 1-2 범위 일치. 오픈소스 ↔ 아키텍처 기술 스택 정합 (pgvector, React Flow, PixiJS 동일 버전). **약점:** **(1)** L2197 "15건+" vs L2077 "17건+" 전파 불일치. **(2)** Sprint 테이블 Go/No-Go 6/14만 표시 — Innovation 품질 게이트(L1743-1756) 14/14와 불일치. **(3)** v3 여정 테이블이 User Journeys(Step 6) J2/J3 v3 내용과 불완전 매핑. |
| D6 리스크 | 9/10 | 기술·시장·리소스 3축 리스크 분류 + v3 추가 2행 구체적. Sprint 2 과부하 분할 트리거, Sprint 1 지연 병렬 착수 대응. "v3 실패 시 전략" Sprint별 독립 롤백 명시. 오픈소스 Phase 5+ Langfuse 검토 적절. **약점:** v3 리스크 테이블이 "§Innovation 혁신 리스크 완화 참조"로 위임하지만, Sprint 2 과부하 수치(15건+) 불일치. |

---

## 이슈 목록

### MAJOR (0)

없음.

### MINOR (4)

**1. [D3/D5] L2197 Sprint 2 과부하 "15건+ 동시" — "17건+"이어야 함**
- L2197: `Sprint 2 과부하 (15건+ 동시)`
- Technical Architecture L2077 (Step 9 Fix 5 적용): `n8n(N8N-SEC 8건) + 마케팅(MKT 5건) + soul-enricher 통합 = 17건+ 집중`
- Step 7에서 N8N-SEC 6→8건으로 확장 (N8N-SEC-7 암호화, N8N-SEC-8 rate limit)
- **전파 누락**: Technical Architecture는 수정됨, Project Scoping은 미수정
- **수정**: L2197 "15건+" → "17건+"

**2. [D2] Sprint 전략 테이블(L2107-2112) — Pre-Sprint 행 부재**
- Sprint 1~4만 표시. Pre-Sprint는 L2124에서 텍스트로만 언급
- Pre-Sprint 포함 항목: Voyage AI 768d→1024d 마이그레이션(Go/No-Go #10, 🔴 Sprint 3 블로커), Neon Pro 업그레이드(🔴 전 Sprint 블로커), 디자인 토큰 확정, 사이드바 IA
- Sprint roadmap(L430-432)에서는 Pre-Sprint가 첫 행으로 명시
- **수정**: Sprint 전략 테이블에 Pre-Sprint 행 추가 (핵심: Voyage AI + Neon Pro, Go/No-Go: #10, 블로커: 마이그레이션 실패 시 Sprint 3 시맨틱 검색 불능)

**3. [D2/D5] Sprint 테이블 Go/No-Go 6/14 게이트만 표시 — 교차 참조 부재**
- 표시된 6개: #2(S1), #3(S2), #4(S3), #5(S4), #7(S3), #8(S4)
- 누락된 8개: #1(전체), #6(S1), #9(S3), #10(Pre-Sprint), #11(S2-3), #12(전체), #13(전체), #14(S3)
- Innovation 품질 게이트(L1743-1756)와 Success Criteria(L586-607)가 14/14 커버하지만, Project Scoping Sprint 테이블에서 "독립적인 Go/No-Go 게이트를 갖는다"(L2105)고 하면서 절반만 표시
- Sprint 3에만 #4, #7, #9, #14 4개 게이트가 걸리는데, 테이블에서 #4, #7만 보이면 Sprint 3 부하 과소 평가 가능
- **수정**: 테이블 각 Sprint Go/No-Go 열에 누락 게이트 추가하거나, 테이블 하단에 "전체 14 게이트 → §Success Criteria v3 기술 기준 참조" 교차 참조 문구 추가

**4. [D2/D5] v3 여정 지원 테이블(L2141-2150) — Journey 2, 3 v3 혜택 미반영**
- User Journeys(Step 6) 기준:
  - Journey 2 (팀장 박과장): Sprint 2 — n8n 워크플로우 실행 결과 확인 (L1129-1132)
  - Journey 3 (투자자 이사장): Sprint 3 — 메모리 성장으로 분석 날카로워짐 (L1144-1145), Sprint 4 — /office 4명 동시 시각화 (L1147-1148)
- v3 여정 테이블은 6 Journey만 (J1, J4, J7, J8, J9, J10). J2, J3의 v3 Sprint 혜택 누락
- 구현 팀이 Sprint 계획 시 J2/J3 v3 기능을 빠뜨릴 가능성
- **수정**: v3 여정 테이블에 Journey 2 (Sprint 2: n8n 결과 확인) + Journey 3 (Sprint 3: 메모리 성장, Sprint 4: /office 병렬) 2행 추가

---

### 긍정적 관찰

- **MVP-A/B 2단계 검증 논리(L2089-2096)**: "Phase 1 실패하면 Phase 2 불가능하다 → fail-fast" 논리가 명확하고 UX적으로도 기술 리스크→가치 증명 순서가 올바름.
- **Sprint 순서 근거(L2114-2118)**: 변경 범위 최소→병렬성→DB 마이그레이션→데이터 의존 순서가 논리적. 특히 "Sprint 1 우선: soul-enricher.ts 주입 경로 선제 확보"가 Sprint 2-3에 대한 의존성 해결 전략으로 우수.
- **Sprint 2.5 분할 트리거(L2197)**: "중간 리뷰 시점에 인프라 트랙 미완료 시 워크플로우 트랙 이월" — 구체적 판단 시점 + 기준이 있어 실행 가능.
- **Sprint 1 지연 대응(L2198)**: "n8n Docker는 soul-enricher.ts 비의존(독립 컨테이너) → 병렬 착수 가능" — Sprint 의존성에서 n8n 인프라와 MKT 도구 엔진을 분리하여 병렬성 확보.
- **직접 구현 유지 목록(L2256-2266)**: 10항목에 파일 경로 + v3 Sprint 매핑까지 포함. "CORTHEX 고유 가치"와 "오픈소스 대체 가능"의 경계가 명확.
- **오픈소스 v3 Sprint 테이블(L2240-2248)**: pg-boss "조건부" 채택 (아키텍처 스케줄링 전략 확정 후), PixiJS tilemap 2개 옵션 비교 — 구현 시점 판단 유보가 적절.
- **v3 실패 시 전략(L2120-2122)**: Sprint별 독립 롤백 + Sprint 2.5 분할 가능 — graceful degradation이 UX적으로 중요한 설계 원칙.

---

## 가중 평균: 8.60/10 ✅ PASS

계산: (9×0.15) + (8×0.20) + (9×0.15) + (9×0.15) + (8×0.20) + (9×0.15) = 1.35 + 1.60 + 1.35 + 1.35 + 1.60 + 1.35 = **8.60**

---

## Cross-talk 완료

### 스코어 비교

| Critic | Score | Status |
|--------|-------|--------|
| Sally (UX) | 8.60 | ✅ PASS |
| Winston (Architecture) | 8.55 | ✅ PASS |
| Bob (Scrum) | 8.05 | ✅ PASS |
| Quinn (QA/Security) | TBD | ✅ PASS |

### Cross-talk 합의 (4/4 critics)

| Issue | Quinn | Winston | Sally | Bob | 합의 |
|-------|-------|---------|-------|-----|------|
| Sprint table gates 불완전 (6/14) | ✅ M1 | ✅ M2 | ✅ m3 | ✅ #1 | **4/4 만장일치** |
| "15건+" → "17건+" 전파 | ✅ m1 | ✅ M1 | ✅ m1 | ✅ #3 | **4/4 만장일치** |
| Sprint 3 과부하 리스크 행 부재 | ✅ m3 | implied | ✅ (Q3 제기) | implied | **4/4** |
| Pre-Sprint 행 부재 | ✅ M1 | ✅ L3→MINOR 상향 | ✅ m2 | ✅ 채택 | **4/4** |
| v3 Journey J2/J3 누락 | ✅ m6 채택 | ✅ LOW 채택 | ✅ m4 | ✅ 채택 | **4/4** |
| Must-Have v3 분류 부재 | — | — | obs | ✅ #2 | 2/4 (Bob 주도) |

### Cross-talk 채택

**#5 (from Quinn m3/Q3). [D6] Sprint 3 과부하 리스크 행 부재 (minor)**
- Sprint 2는 "15건+(→17건+) 과부하" 리스크 행(L2197) 존재
- Sprint 3는 더 많은 게이트(5개: #4, #7, #9, #11, #14) + DB/LLM/API 집중인데 리스크 행 없음
- Sprint 3 구성: pgvector INSERT + observations 테이블 + agent_memories embedding(DB), Reflection cron Haiku + MEM-6 content classification(LLM), Voyage AI embedding(API)
- **수정**: v3 추가 리스크 테이블에 Sprint 3 과부하 행 추가

### Cross-talk 조정

**m3 Sprint 3 gates 수정: 4개 → 5개**
- Winston이 #11 (Tool Sanitization, Sprint 2-3)을 추가. 원래 내 m3에서 4개(#4, #7, #9, #14)로 표기했으나 실제 5개
- L604: "#11: 에이전트 보안 Tool Sanitization | Sprint 2, 3" — Sprint 3에도 적용
- Sprint 3 = **가장 gate-heavy Sprint** (5/14 게이트)

### Cross-talk 관찰 (스코어 비변동)

**Obs-A (from Bob #2). Must-Have v3 분류 부재**
- Must-Have 목록이 v2 Phase 1-2 전용. v3 기능은 Sprint 순서로 암묵적 우선순위
- Sally 판단: 정보 존재하지만 형식 다름. "v3 우선순위는 Sprint 순서로 결정" 문구 추가면 해소
- Bob severity 판단에 위임

**Obs-B (from Winston Q1). Journey 1 CEO Sprint 2 gap**
- Sprint 2 = Admin/n8n 도메인. CEO 직접 터치포인트 없는 건 역할 분리(RBAC) 정상
- 억지로 CEO Sprint 2 행을 넣으면 RBAC 경계 흐림. Not a UX concern.

**Obs-C (from Quinn m4). Voyage AI "신규" label (L2243)**
- Phase 4에서 이미 voyageai 패키지 사용(L2236). Sprint 3 테이블에 "(신규)"는 부정확할 수 있음
- Quinn 단독 발견, LOW

### Cross-talk 확인 (기존 이슈 강화)

- **m1 (15→17)**: 4/4 만장일치. 동일 전파 패턴 (Steps 7-9에서 반복)
- **m2 (Pre-Sprint)**: Winston이 구체적 행 템플릿 제공. Go/No-Go #10 + 의존성 "v2 Phase 1~4 완료"
- **m3 (Sprint gates)**: 5개 게이트로 상향 수정. 교차 참조 문구 또는 전체 게이트 열거 필요
- **m4 (J2/J3)**: Winston LOW 채택, Quinn m6 채택. J2 Sprint 2 n8n 결과, J3 Sprint 3+4

### Bob Q1 답변 확인
- Sprint 2.5 분할 트리거 조건은 수치 기반이 아닌 진행률 기반 ("인프라 트랙 미완료 시"). 수치 수정(15→17)만으로 충분. 트리거 조건 변경 불필요. ✅ 동의.

---

## R2 검증 (7개 수정 사항)

| # | Fix | 검증 결과 |
|---|-----|-----------|
| 1 | Sprint 테이블 Pre-Sprint 행 추가 + Go/No-Go 확장 (S2: #11, S3: #9/#11/#14 → 5 gates) + 각주 "14-gate → §Success Criteria" | ✅ L2109 Pre-Sprint 행 정확, L2112 Sprint 3 5개 게이트 완전, L2115 각주 교차 참조 |
| 2 | L2208 "15건+" → "17건+" | ✅ N8N-SEC 8건 + MKT 5건 + soul-enricher = 17건+ 정합 |
| 3 | v3 Must-Have #7-#10 추가 (Sprint 1-4 각 1개, Go/No-Go 매핑) | ✅ L2165-2169 v3 Must-Have 4항목, Go/No-Go 참조 정확 |
| 4 | Hook 5개 → 4개 (cost-tracker GATE 제거) | ✅ L2159 "Hook 4개" + GATE 2026-03-20 주석 |
| 5 | Sprint 3 게이트 과밀 리스크 행 추가 | ✅ L2209 5 Go/No-Go 명시, 완화 전략 (#9/#11 Sprint 2 선행, #14 회고 성격) 구체적 |
| 6 | Voyage AI "신규" → "Pre-Sprint #10 마이그레이션 후 계속" | ✅ L2255 라벨 수정, Phase 4 → Pre-Sprint 연속성 명확 |
| 7 | v3 여정 J2 (박과장 Sprint 2 n8n 결과) + J3 (투자자 Sprint 3 메모리 + Sprint 4 /office) | ✅ L2152-2153 2행 추가, User Journeys Step 6과 정합 |

**7/7 수정 전부 검증 완료.**

---

## R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|-----------|
| D1 구체성 (15%) | 9 | 9 | 이미 높음. Pre-Sprint 행 추가로 Sprint 테이블 상세도 향상 |
| D2 완전성 (20%) | 8 | 9 | Pre-Sprint 행(Fix 1), 14-gate 교차 참조(Fix 1 각주), v3 Must-Have(Fix 3), J2/J3 여정(Fix 7) |
| D3 정확성 (15%) | 9 | 9 | 17건+(Fix 2), Hook 4개(Fix 4), Voyage AI 라벨(Fix 6) 수정으로 전파 오류 해소 |
| D4 실행가능성 (15%) | 9 | 9 | Sprint 3 과밀 리스크 인식(Fix 5) — 완화 전략 "#9/#11 Sprint 2 선행" 실행 가능 |
| D5 일관성 (20%) | 8 | 9 | Go/No-Go 14/14 교차 참조(Fix 1), 17건+ 전파 해소(Fix 2), Journey 테이블 완전(Fix 7) |
| D6 리스크 (15%) | 9 | 9 | Sprint 3 과밀 리스크 행(Fix 5) 추가로 Sprint 2/3 균형 |

---

## R2 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

---

## Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| Go/No-Go #5 L460 "< 200KB" → "≤ 200KB" | Bob (Step 5 범위) | Step 5 리뷰 시 수정 대상 |
| "총 효과" 추정치 방법론 | Quinn l1 | 섹션 성격상 개략 추정 적절 |
| 시장 리스크 "6개월 선점" 근거 | Quinn l2 | 경쟁 분석 범위 |
| pg-boss "조건부" 유지 | Winston L2 | 아키텍처 확정 후 결정 |

---

## 최종 결과

| | R1 | R2 |
|---|-----|-----|
| Score | 8.60 | **9.00** |
| Status | ✅ PASS | **✅ PASS** |

**Step 10 Project Scoping & Phased Development — COMPLETE.**
