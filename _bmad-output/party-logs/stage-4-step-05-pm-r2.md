# Stage 4 Step 5 — PM (Critic-C, Product + Delivery) R2 Review

**Reviewer:** PM (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` — v3 Implementation Patterns E11~E22 (R2)
**R1 Score:** 6.80/10 ❌ FAIL → **R2 Score:** see below

---

## R1 이슈 해결 검증

### 🔴 Must Fix (3건) — 전부 해결됨 ✅

| R1 # | 이슈 | R2 수정 (Fix #) | 검증 결과 |
|------|------|----------------|----------|
| 🔴1 | FR-MKT 7 FRs 패턴 누락 | F7: E20b 신규 추가 | ✅ `MarketingSettings` 인터페이스 + `installPresetWorkflow()` + fallback Switch + API 타임아웃 + 에러 코드 3종 (L2308~2343). FR-MKT1(엔진 설정), MKT2(프리셋 설치), MKT6(워터마크), MKT7(fallback) 전부 커버. |
| 🔴2 | E16 상태 4종 vs PRD 5+1종 | F1: 6-state 수정 | ✅ `'idle'\|'working'\|'speaking'\|'tool_calling'\|'error'\|'degraded'` (L2155). FR-OC4(speaking 말풍선), FR-OC5(tool_calling 이펙트) 구현 가능. 적응형 폴링 + 백프레셔 추가 (L2164-2166). |
| 🔴3 | E14 confidence ≥ 0.7 누락 | F2: 필터 추가 | ✅ Step 3: `WHERE reflected=false AND confidence >= 0.7 AND flagged = false ORDER BY importance DESC LIMIT 20` (L2088). `pg_try_advisory_xact_lock` non-blocking (L2086, L2097). PRD FR-MEM3 정합. |

### 🟡 Should Fix (4건) — 3건 해결, 1건 잔여

| R1 # | 이슈 | R2 수정 | 검증 결과 |
|------|------|--------|----------|
| 🟡4 | Go/No-Go 6개 미포함 | F11 | ✅ #1, #4, #8, #12, #13, #14 전부 추가 (L2424~2429). 14/14 완전 커버. |
| 🟡5 | E22 6그룹 미기재 | F14 | ⚠️ 부분 해결 — 아래 잔여 이슈 참조 |
| 🟡6 | E20 rate limit 60 vs PRD 100 | — | ❌ 미수정 (L2285 여전히 60req/min) |
| 🟡7 | FR-MEM monitoring 패턴 | — | ❌ 미수정 — 단, 엔진 패턴 범위 고려 시 심각도 낮음 |

---

## R2 차원별 점수

| 차원 | R1 | R2 | 가중치 | R2 근거 |
|------|-----|-----|--------|--------|
| D1 구체성 | 8 | 9/10 | 20% | E11: 9 callers/10 call sites 명시 + interface 동결 규칙. E15: 5-path mapping (L219/L238/L265/L277/L291) line-by-line. E16: 6-state 각각 FR 대응 주석. E20b: `MarketingSettings` TypeScript 인터페이스 + 타임아웃(이미지 2분, 영상 10분). 잔여: "regex 10종" 미열거, E12 프리셋 5축 값 미명시. |
| D2 완전성 | 6 | 8/10 | 20% | E20b로 FR-MKT 7 FRs 커버 ✅. Go/No-Go 14/14 검증 전략 ✅. E11 additive-only 계약 (Sprint간 안정성) ✅. E20 OOM recovery ✅. 잔여: FR-MEM9/10/11/13 모니터링 UI 패턴 부재 — 단 이는 services/API layer이며 engine pattern 범위 경계. |
| D3 정확성 | 6 | 7/10 | 15% | E16 6-state PRD 일치 ✅. E14 confidence + flagged 필터 ✅. E11 `Record<string, string>` renderSoul 타입 일치 ✅. **잔여 2건**: (1) E20 60req/min vs PRD 100req/min (L2285), (2) E22 6그룹 구성 PRD FR-UX1과 상이. |
| D4 실행가능성 | 8 | 9/10 | 15% | E15 5-path 매핑 = 정확히 어디를 수정할지 즉시 파악 가능. E20b `installPresetWorkflow()` 4-step 패턴. E11 Sprint 동결 규칙으로 cross-Sprint 인터페이스 깨짐 방지. E14 non-blocking lock으로 Neon serverless 호환. |
| D5 일관성 | 7 | 8/10 | 10% | Step 4 피드백 전부 반영 (크론 주기, tool sanitizer 위치, renderSoul 시그니처, confidence 필터). E22 6그룹 PRD 불일치 잔존. E20 rate limit 불일치 잔존. |
| D6 리스크 | 6 | 8/10 | 20% | Go/No-Go 14/14 커버 ✅. E20 OOM recovery(restart + healthcheck + Admin 알림) ✅. E14 non-blocking lock(Neon 세션 이슈 대응) ✅. E16 adaptive polling(리소스 절약) + backpressure(불필요 broadcast 방지) ✅. 잔여: FR-MEM 모니터링 부재 = Sprint 3 CEO 체감 리스크(낮음). |

## R2 가중 평균: 8.20/10 ✅ PASS

**계산:** (9×0.20) + (8×0.20) + (7×0.15) + (9×0.15) + (8×0.10) + (8×0.20) = 1.80 + 1.60 + 1.05 + 1.35 + 0.80 + 1.60 = **8.20**

---

## R2 잔여 이슈 (블로커 아님)

### 🟡 1. E22 6그룹 구성 — PRD FR-UX1과 상이

**PRD FR-UX1 (L2495) GATE 결정 기준:**
1. hub + command-center
2. classified + reports + files → 문서함
3. argos + cron-base
4. home + dashboard
5. activity-log + ops-log
6. agents + departments + org

**E22 (L2349-2354) R2 기재:**
1. 허브(Hub) — 채팅 + 트래커 통합
2. 대시보드(Dashboard) — 비용 + 모니터링 + 활동 통합
3. 에이전트(Agents) — 에이전트 목록 + 상세 + 성격 통합
4. 라이브러리(Library) — 지식 + 브리핑 + 노트북 통합
5. 잡스(Jobs) — ARGOS + 트레이딩 + 워크플로우 통합
6. 설정(Settings) — 조직 + 보안 + 테마 + 기타 통합

**차이:**
- PRD #5 `activity-log + ops-log` → E22에서 대시보드에 흡수됨
- PRD #6 `agents + departments + org` → E22에서 에이전트(#3) + 설정(#6) 분리
- PRD #2 `classified + reports + files` ≠ E22 #4 `지식 + 브리핑 + 노트북`
- D34가 "구현 시점 결정"으로 deferred — 아키텍처의 재해석 여지 있음

**권고:** D34 deferred 취지 인정하나, PRD FR-UX1 원문의 6그룹을 기본으로 기재하고 아키텍처 관점 재편안은 "대안" 또는 "권고"로 분리 표기 권장. 구현 시점 혼선 방지.

### 🟡 2. E20 rate limit 60req/min vs PRD 100req/min

E20 L2285 여전히 60req/min. PRD L1779 "100 req/min".
의도적 하향이면 PRD 수정 필요. 아니면 E20을 100으로 수정.

### 🟢 3. FR-MEM9/10/11/13 모니터링 패턴 부재

엔진 패턴 섹션 범위를 벗어나는 UI/API layer 이슈. Sprint 3 구현 시 story에서 별도 정의 가능. 블로커 아님.

---

## Cross-talk 요약 (R2)

- R1 🔴 3건 전부 깔끔하게 해결. 특히 E20b(FR-MKT) 패턴은 충분한 구체성으로 Sprint 2 delivery 리스크 해소.
- E15 5-path mapping은 dev critic이 R1에서 제기한 tool sanitizer 위치 문제를 더 정밀하게 해결 (5개 push 경로 중 L265+L277만 sanitize).
- E14 `pg_try_advisory_xact_lock` non-blocking 전환은 Neon serverless 환경 리스크 대응으로 적절.
- E11 `Record<string, string>` 타입 수정은 dev critic 제기(Record<string, number>→string) 반영.
- E22 6그룹은 PRD 원문과 다르나, D34 "deferred" + 그룹 기재 자체가 R1 대비 큰 개선.

---

## 요약

R2는 R1의 3개 🔴 이슈를 전부 해결하고, 추가로 Go/No-Go 14/14 커버, OOM recovery, non-blocking lock, adaptive polling, interface 동결 규칙 등 품질을 크게 향상시켰습니다.

잔여 이슈(E22 그룹 구성 차이, E20 rate limit)는 블로커가 아니며 구현 단계에서 해소 가능합니다.

**8.20/10 ✅ PASS**
