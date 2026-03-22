# Stage 4 Step 6 — PM (Critic-C, Product + Delivery) Review

**Reviewer:** PM (Critic-C, Product + Delivery)
**Date:** 2026-03-22
**Target:** `_bmad-output/planning-artifacts/architecture.md` L2460-2715 — v3 Project Structure & Boundaries
**Focus:** FR coverage completeness (53 FRs), Sprint feasibility, Go/No-Go alignment, data flow accuracy

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 20% | 디렉토리 트리 Sprint별 주석 완전(L2468-2553). 파일별 E-패턴 + D-결정 크로스레퍼런스 우수. 의존성 규칙 8행(L2597-2606) 의존 가능/금지 명시. 데이터 흐름 4개 다이어그램에 `confidence≥0.7`, `flagged=false`, `importance DESC` 구체적 조건 포함(L2708). 버전 핀(pixi.js 8.17.1, @pixi/react 8.0.5) 명시. |
| D2 완전성 | 8/10 | 20% | 53 FRs 전부 파일 매핑됨(L2610-2656). Cross-cutting 7개(L2660-2668). Integration 7내부+3외부(L2674-2690). 데이터 흐름 4 Sprint(L2694-2715). File change summary(L2558-2566). **R1 gap 해소**: FR-MEM9~11 모니터링 → `app/src/pages/agents.tsx (memory 탭)` (L2637). **잔여 gap**: `routes/observations.ts` 디렉토리 트리에서 누락 — FR-MEM1~2 매핑(L2634)에서 참조하나 트리(L2468-2553)에 없음. |
| D3 정확성 | 6/10 | 15% | **FR-PERS 매핑 3건 오류 + FR-N8N 매핑 2건 오류** (상세 아래). 반면: 데이터 흐름 4개 전부 PRD 시퀀스 일치 ✅, 의존성 규칙 정확 ✅, integration points 정확 ✅, Sprint별 file count 현실적 ✅. |
| D4 실행가능성 | 8/10 | 15% | 디렉토리 트리 = 파일 생성 위치 즉시 확인. 의존성 매트릭스 = import 규칙 명확. 데이터 흐름 = 구현 순서 가이드. File change summary = Sprint 계획 기초. 테스트 파일 Go/No-Go 매핑 (#2, #3, #9, #11). |
| D5 일관성 | 7/10 | 10% | Step 5 E11-E22 패턴 크로스레퍼런스 정확. Sprint 순서 PRD 일치. soul-enricher Sprint 1→3 additive-only 반영(L2481-2482). **불일치**: FR 매핑 번호 ↔ PRD FR 정의 불일치 (D3 상세). E22 6그룹명 PRD FR-UX1 원문과 상이 (Step 5에서 계속). |
| D6 리스크 | 7/10 | 20% | Sprint 4 = 9 NEW(최다) — PixiJS 학습 곡선 리스크 PRD에서 인지. Layer 0 ~67 MODIFY = 점진적 전환(빅뱅 아님). @google/genai 삭제 1건 명시(L2560). **미식별**: FR 매핑 오류가 Sprint planning에 혼선 유발 가능. routes/observations.ts 누락 = Sprint 3 초기 파일 생성 누락 가능. |

## 가중 평균: 7.40/10 ✅ PASS

**계산:** (8×0.20) + (8×0.20) + (6×0.15) + (8×0.15) + (7×0.10) + (7×0.20) = 1.60 + 1.60 + 0.90 + 1.20 + 0.70 + 1.40 = **7.40**

---

## 이슈 목록

### 🟡 Must Fix (2건)

#### 1. [D3 Critical] FR-PERS 매핑 3건 — FR 번호 ↔ 설명 불일치

**위치:** L2614-2618

**현재 매핑 vs PRD 실제 정의:**

| 현재 매핑 (L2614-2618) | PRD 실제 정의 | 판정 |
|------------------------|-------------|------|
| FR-PERS1~3 → "성격 CRUD" routes/admin/agents.ts | PERS1=슬라이더 UI, PERS2=JSONB 저장+Zod, **PERS3=soul-enricher.ts** | ❌ PERS3은 routes 아님, soul-enricher |
| FR-PERS4~5 → "프리셋" routes + DB seed | PERS4=**즉시 반영**(배포 불필요), PERS5=**코드 분기 없음**(프롬프트만) | ❌ 둘 다 프리셋 아님, 아키텍처 제약 |
| FR-PERS6 → "Soul 주입" soul-enricher.ts | PERS6=**역할 프리셋 선택 UI** | ❌ soul 주입은 PERS3 |
| FR-PERS7 → "PER-1 보안" soul-enricher.ts | PERS7=**기본 프리셋 최소 3종** | ❌ PER-1은 FR 번호 아님 |
| FR-PERS8~9 → UI 슬라이더 | PERS8=툴팁, PERS9=키보드 접근성 | ✅ |

**권고 수정:**

```
| FR-PERS1 슬라이더 UI        | app/src/pages/agents.tsx (기존 확장) |
| FR-PERS2 JSONB 저장+Zod    | routes/admin/agents.ts + migration |
| FR-PERS3 Soul extraVars 주입 | services/soul-enricher.ts (E11) |
| FR-PERS4~5 즉시 반영+프롬프트 | (아키텍처 패턴, 별도 파일 불필요) |
| FR-PERS6~7 프리셋 선택+3종  | app/src/pages/agents.tsx + DB seed migration |
| FR-PERS8 툴팁              | app/src/pages/agents.tsx |
| FR-PERS9 접근성             | app/src/pages/agents.tsx |
```

#### 2. [D3] FR-N8N 매핑 2건 — 파일 그룹 불일치

**위치:** L2624-2625

**현재 매핑 vs PRD 실제 정의:**

| 현재 매핑 (L2624-2625) | PRD 실제 정의 | 판정 |
|------------------------|-------------|------|
| FR-N8N1~3 → "Docker 설정" docker-compose + iptables | N8N1=**Admin 워크플로우 목록 API**, N8N2=**CEO 읽기전용 UI**, N8N3=**기존 코드 삭제** | ❌ Docker 설정은 N8N4 |
| FR-N8N4~6 → "Proxy + 보안" n8n-proxy.ts | N8N4=**Docker 배포+8-layer**, N8N5=**장애 메시지 UI**, N8N6=에디터 접근 | ⚠️ N8N5는 CEO app UI 필요 |

**권고 수정:**

```
| FR-N8N1 워크플로우 목록 API  | routes/admin/n8n-proxy.ts (GET /admin/n8n/workflows) |
| FR-N8N2 CEO 읽기전용 결과   | app/src/pages/jobs.tsx (워크플로우 탭) |
| FR-N8N3 기존 코드 삭제      | 기존 routes/workflow.ts + 프론트 페이지 DELETE |
| FR-N8N4 Docker 배포+보안    | docker-compose.n8n.yml + iptables + n8n-proxy.ts (E20 8-layer) |
| FR-N8N5 장애 메시지          | app/src/ (CEO앱 에러 바운더리) + n8n healthcheck |
| FR-N8N6 에디터 접근          | routes/admin/n8n-proxy.ts (n8n-editor 라우트) |
```

---

### 🟡 Should Fix (2건)

#### 3. [D2] routes/observations.ts — 디렉토리 트리 누락

**위치:** L2468-2553 (트리) vs L2634 (매핑)

FR-MEM1~2 매핑에서 `routes/observations.ts (신규)` 참조하나, 디렉토리 트리 `routes/` 섹션(L2489-2492)에 `admin/n8n-proxy.ts`와 `admin/marketing.ts`만 있고 `observations.ts` 없음.

**위치 확인 필요:** `routes/observations.ts` (admin 하위? workspace 하위?) 경로 명시 + 트리에 추가.

#### 4. [D3/D5] E22 6그룹 — PRD FR-UX1 원문과 상이 (Step 5에서 계속)

L2654: "6그룹: Hub/Dashboard/Agents/Library/Jobs/Settings"
PRD L2495: "hub+command-center, classified+reports+files→문서함, argos+cron-base, home+dashboard, activity-log+ops-log, agents+departments+org"

차이:
- PRD #5 `activity-log+ops-log` → E22에서 Dashboard에 흡수
- PRD #6 `agents+departments+org` → E22에서 Agents + Settings 분리
- PRD #2 `classified+reports+files→문서함` ≠ E22 #4 `Library`

D34 deferred이므로 블로커 아니나, PRD 원문 기재를 기본으로 권장 (Step 5 R2 잔여 이슈와 동일).

---

### 🟢 Nice to Have (2건)

#### 5. Sprint 2 file count: 7 NEW vs 실제 나열

L2562: "7 (tool-sanitizer, n8n-proxy, marketing, compose, presets ×4)" — 이는 8개 (1+1+1+1+4). presets를 1그룹으로 카운트한 듯하나, 디렉토리 트리에는 4개 별도 파일(L2549-2552). Minor — 카운트 기준 명시 권장.

#### 6. FR-MKT3/MKT5 UI 파일 누락

FR-MKT3 = "CEO앱 웹 UI에서 사람이 승인/거부" — CEO app 페이지 필요하나 매핑에 서버 파일만.
FR-MKT5 = "온보딩 시 마케팅 템플릿 설치 제안" — 온보딩 UI 수정 필요하나 매핑 미포함.
심각도 낮음 — 구현 시점에 자연스럽게 추가 가능.

---

## 긍정적 평가

1. **53 FRs 전부 매핑** — R1 Step 5에서 빠졌던 FR-MKT, FR-MEM9~11 모두 포함
2. **데이터 흐름 4개** — Sprint별 E2E 시퀀스가 PRD와 정합. Sprint 3 메모리 파이프라인이 특히 상세 (confidence, flagged, importance, Haiku, Voyage, reflection)
3. **의존성 규칙** — 8행 매트릭스가 E8 경계, services/ 격리, packages/office/ 격리를 명확히 정의
4. **테스트 파일 Sprint 매핑** — 4개 security test가 Go/No-Go #2, #3, #9, #11 직접 매핑
5. **디렉토리 트리** — Sprint 주석으로 "언제 이 파일이 생기는지" 즉시 파악 가능
6. **아키텍처 경계 ASCII** — 전체 시스템 flow를 한눈에 파악

---

## Cross-talk 참조

- Step 5 E22 6그룹 PRD 불일치 — 여전히 해소 안 됨 (D34 deferred로 인정)
- Step 5 R2에서 추가된 E20b(FR-MKT) — Step 6에서 파일 매핑 + 디렉토리 트리 반영 ✅
- Step 5 E15 5-path mapping — Step 6 agent-loop.ts MODIFY 1건(L265+L277)과 정합 ✅
- Step 5 E14 confidence≥0.7 — Step 6 데이터 흐름(L2708)에 반영 ✅

---

## 요약

전체 구조는 우수하며 53 FRs 매핑, 데이터 흐름, 의존성 규칙이 PRD와 잘 정합됩니다. **FR-PERS/FR-N8N 매핑의 FR 번호 ↔ 설명 불일치**가 가장 큰 이슈이며, 구현 시점에 개발자가 잘못된 파일을 수정할 위험이 있습니다. 이 매핑만 교정하면 상당히 견고한 구조 문서입니다.

**7.40/10 ✅ PASS** — 🟡 #1, #2 교정 권고.
