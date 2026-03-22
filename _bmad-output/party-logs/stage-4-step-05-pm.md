# Stage 4 Step 5 — PM (Critic-C, Product + Delivery) Review

**Reviewer:** PM (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` — v3 Implementation Patterns E11~E22
**Focus:** PRD alignment, Sprint feasibility, Go/No-Go gate coverage, Zero Regression, FR-UX

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 20% | TypeScript 코드 블록 복붙 수준 (E11 enrich, E12 4-layer, E15 PreToolResult, E20 proxy). 에러 코드 22개 Sprint별 분류. Anti-pattern 10개 why/correct 대조. **BUT**: E15 "regex 10종" 미열거, E12 "프리셋 3종+" 미명명 (FR-PERS7), E22 "6그룹" 그룹명 미기재 (FR-UX1이 명시한 6그룹 목록 없음). |
| D2 완전성 | 6/10 | 20% | 12 패턴 × 8 핵심 영역 커버. 3 sanitization 체인 격리(E19) 탁월. **GAP 3건**: (1) **FR-MKT 7개 FR(13% v3) 패턴 완전 누락** — 마케팅 설정 API, 프리셋 워크플로우 설치, fallback 엔진 전환 패턴 없음, (2) FR-MEM9/10/11/13 모니터링 UI/API 패턴 없음, (3) Go/No-Go 14개 중 **6개**(#1,#4,#8,#12,#13,#14) Pattern Verification Strategy 미포함. |
| D3 정확성 | 6/10 | 15% | **3건 오류**: (1) E16 `OfficeStateMessage.state` = `idle\|working\|delegating\|error` (4종) — PRD FR-OC2 = `idle/working/speaking/tool_calling/error` (5종) + NRT-1 `degraded` (6종). `delegating`은 PRD에 없고, `speaking`/`tool_calling` 누락으로 FR-OC4(말풍선)/FR-OC5(도구 이펙트) 구현 불가. (2) E14 reflection 크론 쿼리에 `confidence ≥ 0.7` 필터 누락 — PRD FR-MEM3 "reflected=false ≥ 20 AND confidence ≥ 0.7 조건 충족 시 처리". (3) E20 rate limit 60req/min — PRD L1779 "100 req/min". 반면: Sprint 매핑, sanitization 체인, Voyage 1024d, observations 스키마 정합✅. |
| D4 실행가능성 | 8/10 | 15% | E11 before/after 코드 패턴, E12 4-layer 순서, E15 PreToolResult 삽입 지점, E17 React.lazy import, E20 proxy 핸들러 — 전부 즉시 구현 가능. Pattern Verification Strategy 테이블이 Sprint별 검증 방법 제공. Anti-pattern 테이블이 실수 방지 가이드. |
| D5 일관성 | 7/10 | 10% | E14 크론 스케줄 `0 3 * * *` — Step 4 D28 피드백(John 🔴 #1) 반영 OK. E15 PreToolResult 위치 — Step 4 D27 피드백(dev 🔴 #1) 반영 OK. **불일치 2건**: E16 상태 모델 vs PRD 6종, E20 rate limit 60 vs PRD 100. |
| D6 리스크 | 6/10 | 20% | Anti-pattern 10개 + Verification 12행이 주요 위험 식별. **미식별 리스크 3건**: (1) FR-MKT 패턴 부재 = Sprint 2 delivery 리스크 (7 FR 구현 가이드 없이 Sprint 착수), (2) Go/No-Go 6개 미검증 = 전체 완료 시 게이트 통과 불확실, (3) FR-MEM 모니터링 부재 = Sprint 3 CEO 여정 C("에이전트가 성장했다") 체감 지표 미보장. |

## 가중 평균: 6.80/10 ❌ FAIL

**계산:** (8×0.20) + (6×0.20) + (6×0.15) + (8×0.15) + (7×0.10) + (6×0.20) = 1.60 + 1.20 + 0.90 + 1.20 + 0.70 + 1.20 = **6.80**

---

## 이슈 목록

### 🔴 Must Fix (3건)

#### 1. [D2 Critical] FR-MKT 7개 FR — 패턴 완전 누락

**PRD 참조:** FR-MKT1~7 (L2448~2454), Sprint 2

E11~E22에 FR-MKT 관련 패턴이 **0건**. E20(n8n proxy)은 인프라 보안만 다루고 마케팅 비즈니스 로직 패턴 없음.

**누락된 패턴:**
- **FR-MKT1**: AI 도구 엔진 설정 API (`/api/company/:id/marketing-settings`) — 저장 위치(company.settings JSONB? 별도 테이블?), AES-256 API 키 저장 패턴
- **FR-MKT2**: n8n 프리셋 워크플로우 설치 — n8n API 호출로 6단계 파이프라인 자동 생성하는 패턴 (POST /workflows + credential injection)
- **FR-MKT7**: fallback 엔진 자동 전환 — Switch 노드 설정 패턴, 장애 감지 + 전환 알림

**영향:** Sprint 2의 7/13 FR(54%)이 구현 가이드 없이 시작됨. FR-N8N(6개) + FR-TOOLSANITIZE(3개)는 패턴 있으나 FR-MKT가 빠지면 Sprint 2 절반이 패턴 미커버.

**권고:** E20 확장 또는 별도 E20b "마케팅 자동화 패턴" 추가:
```
E20b: Marketing Automation Pattern (D25 확장)
- company.settings JSONB에 marketing_engine_config 키 저장 (AES-256)
- n8n preset install: POST /api/v1/workflows + tag company:{companyId}
- fallback: Switch 노드 primary→fallback 우선순위 + 실패 시 webhook→Admin 알림
```

#### 2. [D3] E16 OfficeStateMessage 상태 모델 — PRD 5+1종 vs 패턴 4종

**위치:** architecture.md E16 (L2131)

**E16 정의:**
```typescript
state: 'idle' | 'working' | 'delegating' | 'error'  // 4종
```

**PRD 정의:**
- FR-OC2 (L2424): `idle/working/speaking/tool_calling/error` — 5종
- NRT-1 (L1512): Brief 5종 + PRD 추가 `degraded` — 6종
- Journey D (L222): "5-state(idle/working/speaking/tool_calling/error)"

**문제:**
| E16 상태 | PRD 상태 | 판정 |
|---------|---------|------|
| idle | idle | ✅ |
| working | working | ✅ |
| **delegating** | — | ❌ PRD에 없음 |
| error | error | ✅ |
| — | **speaking** | ❌ FR-OC4 말풍선 표시 불가 |
| — | **tool_calling** | ❌ FR-OC5 도구 이펙트 표시 불가 |
| — | **degraded** | ❌ NRT-1 추가 상태 누락 |

**권고:** `state: 'idle' | 'working' | 'speaking' | 'tool_calling' | 'error' | 'degraded'`로 수정.

#### 3. [D3/D2] E14 Reflection 크론 — `confidence ≥ 0.7` 필터 누락

**위치:** architecture.md E14 (L2080)

**E14 기술:**
```
// 3. SELECT unreflected observations (importance DESC, LIMIT 20)
// 4. 20건 미달 시 스킵 (PRD FR-MEM3)
```

**PRD FR-MEM3 (L2472):**
> "에이전트별 `reflected=false` 관찰 ≥ 20개 **AND confidence ≥ 0.7** 조건 충족 시 처리"

**PRD MEM-2 (L1480):**
> "confidence ≥ 0.7 우선"

**문제:** E14는 importance DESC만 기준으로 20건 선택. confidence 필터가 없으면:
- 저신뢰도(0.3) observation이 reflection에 포함 → 반성 품질 저하
- Go/No-Go #7 검증 기준 "confidence ≥ 0.7" 미달

**권고:** Step 3을 수정:
```
// 3. SELECT unreflected observations WHERE confidence >= 0.7 ORDER BY importance DESC LIMIT 20
// 4. confidence >= 0.7인 unreflected 20건 미달 시 스킵
```

---

### 🟡 Should Fix (4건)

#### 4. [D2/D6] Go/No-Go 6개 — Pattern Verification Strategy 미포함

**위치:** architecture.md Pattern Verification Strategy (L2329~2342)

현재 커버: #2, #3, #5, #6, #7, #9, #10, #11 = **8/14개**

**미포함 6개:**

| # | 게이트 | Sprint | 누락 이유 | 권고 검증 패턴 |
|---|--------|--------|----------|-------------|
| 1 | Zero Regression | 전체 | 프로세스 게이트 | `bun test` 전체 스위트 — 매 Sprint 완료 시 |
| 4 | Memory Zero Regression | 3 | E14에 미연결 | 기존 memory-extractor.ts 테스트 전부 통과 + E2E |
| 8 | 에셋 품질 승인 | 4 | PM 프로세스 | PM 스프라이트 5종 승인 체크리스트 |
| 12 | v1 기능 패리티 | 전체 | v1-feature-spec 미참조 | v1-feature-spec.md 체크리스트 전수 Playwright 검증 |
| 13 | 사용성 검증 | 전체 | 수동 테스트 | Admin 온보딩 15분 + CEO 5분 시나리오 |
| 14 | Capability Eval | 3 | 새 게이트 | 표준 task corpus 3개 × N≥3회, 재수정 ≤ 50% |

#### 5. [D1/D2] E22 FR-UX 페이지 6그룹 목록 미기재

**위치:** architecture.md E22 (L2280)

E22: "14 페이지 → 6 그룹 통합 (FR-UX1)" — 그룹명 없음.

**PRD FR-UX1 (L2495) 명시적 정의:**
1. hub + command-center
2. classified + reports + files → 문서함
3. argos + cron-base
4. home + dashboard
5. activity-log + ops-log
6. agents + departments + org

**권고:** 6그룹 목록을 E22에 포함. 개발자가 PRD 크로스레퍼런스 없이 패턴만 보고 구현 가능해야 함.

#### 6. [D3] E20 n8n rate limit 60req/min vs PRD 100req/min

**위치:** architecture.md E20 (L2255) vs PRD (L1779)

- E20: "rate limit: 60req/min per company (SEC-8)"
- PRD L1779: "Hono proxy rate limit **100 req/min**"

Step 4에서 John이 이미 지적했으나 E20에서 수정되지 않음. PRD 기준 100req/min으로 통일하거나, 60req/min이 의도적이면 PRD 수정 필요.

#### 7. [D2] FR-MEM9/10/11/13 모니터링 패턴 부재

Sprint 3 CEO 여정 C의 핵심: "에이전트가 성장했다" 체감.

| FR | 내용 | 패턴 필요 |
|----|------|----------|
| FR-MEM9 | CEO Reflection 이력 + 성장 지표 (성공률 추이) | API endpoint + 데이터 집계 쿼리 패턴 |
| FR-MEM10 | 새 Reflection 생성 알림 | 기존 Notifications WS 채널 연동 패턴 |
| FR-MEM11 | Admin observation/reflection 관리 | CRUD API 패턴 |
| FR-MEM13 | Admin TTL 보존 기간 설정 | company.settings JSONB 패턴 |

엔진 패턴에 집중하느라 UI/API 계층이 빠짐 — Sprint 3 delivery 시 가이드 부재.

---

### 🟢 Nice to Have (1건)

#### 8. [D1] E12 프리셋 구조 미상세

E12 L2039: "프리셋 (`balanced`, `creative`, `analytical`)는 하드코딩 값 — DB seed migration으로 제공"

FR-PERS7: "기본 프리셋 최소 3종" — 이름은 명시됐으나 각 프리셋의 5축 값(예: balanced={50,50,50,50,50})이 없음. Seed migration 시 값이 필요하므로 명시 권장.

---

## Cross-talk 요약

- **John (Step 4)**: D28 크론 주기 `*/5 → 0 3 * * *` 수정 — **E14에서 반영됨 ✅**. D22 observations 스키마 누락 4건 — D22 DDL에서 반영됨 ✅. Tier-based cap — **E14에 Step 2 "Tier 한도 체크" 언급은 있으나 상세 로직 미기술**.
- **dev (Step 4)**: D27 PostToolUse 보안 결함 — **E15에서 PreToolResult로 수정됨 ✅**. D23 renderSoul 시그니처 — **E11에서 4파라미터 정확 반영 ✅**.
- **Bob (Step 4)**: 확인 필요 — Step 4 피드백 반영도 검증 필요.

---

## 요약

E11~E22는 v3 핵심 엔진 패턴(soul enricher, 3 sanitization chains, tool sanitizer 위치, n8n proxy, OpenClaw 격리, Voyage AI)을 높은 구체성으로 다루며, Step 4 피드백(크론 주기, tool sanitizer 위치, renderSoul 시그니처)을 잘 반영했습니다.

그러나 **FR-MKT 7개 FR 전체 누락**(Sprint 2의 54%), **OfficeStateMessage 상태 모델 PRD 불일치**(5+1종 vs 4종), **reflection confidence 필터 누락**은 제품 정합성 측면에서 수정 필수입니다. Go/No-Go 14개 중 6개가 검증 전략에서 빠진 것도 delivery 리스크입니다.

**R2에서 필요한 수정:** 🔴 3건 + 🟡 #4, #5 우선.
