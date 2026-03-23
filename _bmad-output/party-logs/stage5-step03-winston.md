# Critic-A (Architecture) Review — Stage 5 Step 3: Core Experience

**Reviewer:** Winston (Architect)
**Date:** 2026-03-23
**Document:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Section 3: Core Experience, lines 238–471)
**Step File:** `step-03-core-experience.md`

## ✅ FINAL SCORE: 9.0/10 (R1: 8.40 → R2: 9.00)

---

## R2 Fix Verification (8 issues from R1 + cross-talk)

| # | Issue | Source | Status | Verification |
|---|-------|--------|--------|-------------|
| 1 | Secretary 라우팅 실패 CEO UX | Winston | ✅ FIXED | Lines 261-265: 에이전트 태그 표시, 재라우팅 버튼, misroute 신고 1-click, 3회+ 패턴 Admin 알림. 3개 질문 전부 해결. |
| 2 | NEXUS undo/redo 안전망 | Winston | ✅ FIXED | Line 448: EP-2에 확인 모달 + Ctrl+Z 10회 스택 + Soul diff 미리보기. Dev 확인: v2에 undo 없음 → v3 신규 요구사항으로 정의. |
| 3 | FR-MKT EI/CSM 분리 | Winston | ✅ FIXED | Lines 342-348: EI-3 일반(≤10분) vs 마케팅(≤30분, 6단계) 명확 분리. CSM-5 Line 427: 마케팅 행 추가 (≤30분, 진행률). |
| 4 | soul-enricher.ts 실패 fallback | Winston | ⚪ PARTIAL | Line 331: soul-enricher.ts→soul-renderer.ts 관계 명확화. 실패 시 base Soul fallback은 Dev 크로스톡으로 확인 (engine 수준 처리) — UX spec에 명시적 fallback UX는 없으나, 아키텍처 수준 해결이므로 수용. |
| 5 | [E-XXX-NNN] PRD 출처 오기 | Winston | ✅ FIXED | Line 469: "(PRD 패턴)" → "(v3 UX 신규 형식 — XXX=모듈 코드, NNN=에러 번호)". |
| 6 | React Router v6→v7 | Dev | ✅ FIXED | Line 320: "React Router v7 (`react-router-dom ^7.13.1`)". |
| 7 | Platform Strategy 상태관리 누락 | Dev | ✅ FIXED | Line 300: "Zustand 5 (클라이언트) + React Query 5 (서버)" 행 추가. |
| 8 | Tailwind breakpoint 커스텀 | Dev | ✅ FIXED | Line 312: `tailwind.config.ts theme.screens` 커스텀 주의사항 추가. |

### 추가 개선 (다른 비평가 이슈 반영)
- fps 전환: Line 314 — 500ms debounce + matchMedia 리스너 (Dev 이슈)
- 접근성: CSM-1~5 전체에 a11y 행 추가 (Quinn 이슈) — 스크린리더, 키보드, aria 속성
- 데이터 가시성 권한: EI-5 Line 363 — Admin/CEO/직원별 Reflection 접근 제어
- soul-enricher.ts 관계 명확화: EI-1 Line 331, EI-5 Line 361

---

## R2 Scoring

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|----------|
| D1 구체성 | 9 | 9 | 유지. debounce 500ms, undo 10회 스택, misroute 3회+ 임계값 등 신규 항목도 정량적. |
| D2 완전성 | 8 | 9 | Secretary 실패 UX 추가, FR-MKT 분리, 상태관리 추가, 접근성 CSM 행 전부 추가. |
| D3 정확성 | 8 | 9 | React Router v7 수정, EP-5 출처 수정, soul-enricher.ts 관계 명확화. |
| D4 실행가능성 | 9 | 9 | 유지. 신규 항목 모두 구현 가능한 수준. |
| D5 일관성 | 9 | 9 | 유지. 모든 신규 추가분이 Architecture + Step 2와 정합. |
| D6 리스크 | 7 | 9 | Secretary misroute 복구 UX, NEXUS undo 안전망, fps debounce, 데이터 접근 권한. |

### R2 가중 평균 (Critic-A)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 | 9 | 15% | 1.35 |
| D2 | 9 | 15% | 1.35 |
| D3 | 9 | 25% | 2.25 |
| D4 | 9 | 20% | 1.80 |
| D5 | 9 | 15% | 1.35 |
| D6 | 9 | 10% | 0.90 |

### **R2 가중 평균: 9.00/10 ✅ PASS (Excellent)**

### 아키텍처 정합성 (R2): 21/21 ✅
- R1의 3건 불일치 전부 해소 (React Router, 에러 형식 출처, 상태관리)
- Secretary 라우팅 실패 UX: activity_logs 기록 = Architecture activity_logs 테이블 정합
- NEXUS undo 10회 스택: React Flow history API 활용 가능 (Epic 9 기반)
- Zustand + React Query: Architecture §311 정합

### 최종 판정
Step 3 Core Experience는 R2에서 8건 이슈 중 7건 완전 해결, 1건 수용. Secretary 라우팅 실패 UX가 특히 훌륭 — 인지→재라우팅→피드백→자동개선의 4단계 복구 흐름이 아키텍처와 완벽 정합. Step 4로 진행 권장.

---

## R1 Review (Original, preserved below)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | Hex 색상 (#283618, #faf8f5), px 치수 (280px sidebar, 56px topbar, 1440px max-width), 4-breakpoint 정확한 px 범위, fps별 PixiJS 처리 (30/60fps), 시간 목표 (FCP ≤1.5s, TTI ≤3s, ≤15min 온보딩, ≤10min n8n, ≤30s 프리셋, ≤500ms toast), Secretary 라우팅 80%+/95%+, Big Five 프리셋 구체 값 (O:85 C:90 E:30 A:60 N:20). 거의 모든 항목이 정량화됨. |
| D2 완전성 | 8/10 | Step 요구사항 5개 영역 전부 충족. EI 5개 + CSM 5개 + EP 5개로 v3 4개 Layer 커버. **누락**: (1) FR-MKT 마케팅 파이프라인이 일반 n8n에 묻힘, (2) Secretary 라우팅 실패 UX, (3) Platform Strategy에 상태관리 미언급 — Architecture 311줄 "Zustand (client) + React Query (server)" (Dev 발견). |
| D3 정확성 | 8/10 | React 19 확인. Secretary 80%+ PRD 일치. soul-enricher.ts v3 계획 파일 정합. WebSocket 17채널, PixiJS ≤200KB 정확. **오류 2건**: (1) Line 309 "React Router v6" → 실제 `react-router-dom ^7.13.1` (Dev 발견), (2) EP-5 `[E-XXX-NNN]` "PRD 패턴" — PRD에서 미확인, 출처 오기. |
| D4 실행가능성 | 9/10 | CEO/Admin Core Loop가 단계별 flow diagram. CSM 테이블의 성공/실패 기준이 정량적이어서 QA 체크리스트로 바로 전환 가능. EI 항목이 구체적 파일 참조 (soul-enricher.ts, memory-reflection.ts, agent-loop.ts). EP가 "적용" 예시로 실행 가능. |
| D5 일관성 | 9/10 | Step 2 Discovery의 모든 결정과 정합: FCP/TTI 분리, DC-7 graceful degradation 참조, 4-layer/8-layer sanitization, Sovereign Sage 색상, 빈 상태 패턴. PRD 용어 (Hub, Secretary, NEXUS, Soul, Tier, ARGOS) 일관. App shell 구조가 design tokens §1.1 60-30-10 비율과 정합. |
| D6 리스크 | 7/10 | EP-5 "Safe to Fail"이 에러 철학을 정의하고 DC-7 참조. n8n OOM/healthcheck 커버. **누락**: (1) Secretary 라우팅 20% 실패의 CEO 체감 UX, (2) NEXUS "저장 즉시 반영"의 undo/redo 안전망, (3) soul-enricher.ts enrichment 실패 시 fallback (pgvector 타임아웃 → relevant_memories 누락 → generic 응답). |

---

## 가중 평균 (Critic-A 가중치)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 9 | 15% | 1.35 |
| D2 완전성 | 8 | 15% | 1.20 |
| D3 정확성 | 8 | 25% | 2.00 |
| D4 실행가능성 | 9 | 20% | 1.80 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 7 | 10% | 0.70 |

### **가중 평균: 8.40/10 ✅ PASS (Great)**

> **R1 수정**: D3 9→8 (React Router v7 오기, [E-XXX-NNN] 출처 오기). 원래 8.65에서 0.25 감소. Cross-talk 반영.

---

## 이슈 목록 (5건)

### 🔴 Priority 1 (Must Fix)

**Issue #1 — [D6 리스크] Secretary 라우팅 실패 시 CEO UX 미정의**

Secretary 라우팅 정확도 목표가 80% (첫 시도)이면, **5번 중 1번은 잘못된 에이전트가 응답**한다. 이것은 CEO의 "절대적으로 완벽해야 하는 하나의 인터랙션"에 직결되는 실패 경로인데, 실패 시 CEO가 보는 UX가 전혀 정의되지 않았다.

구체적으로 답해야 할 질문:
1. CEO가 잘못된 에이전트가 응답하고 있음을 **어떻게 인지**하는가? (에이전트 이름/부서 표시?)
2. "이 에이전트가 아닌데" → **재라우팅 메커니즘**이 있는가? ("다른 에이전트에게 넘기기" 버튼?)
3. Secretary 라우팅 실패가 **피드백 루프**로 학습되는가? (v3 Memory와 연동?)

**Fix:** CSM-1 또는 별도 섹션에 "Secretary 라우팅 실패 UX" 추가. 최소한: Chat에서 응답 에이전트 이름+부서 항상 표시 + "다른 에이전트에게 다시 물어보기" 버튼 + 잘못된 라우팅 피드백 기록.

### 🟡 Priority 2 (Should Fix)

**Issue #2 — [D6 리스크] NEXUS "저장 즉시 반영"의 undo/redo 안전망 없음**

Admin의 Critical Interaction이 NEXUS 드래그&드롭인데, EP-2 "Zero-Deploy"가 "저장 즉시 반영"을 약속한다. 문제: **실수도 즉시 반영**된다. 에이전트를 잘못된 부서에 드롭하거나, 부서를 실수로 삭제하면?

아키텍처에 NEXUS React Flow가 이미 구현되어 있고 (Epic 9, 461 tests), v2에서 undo/redo가 있는지 확인 필요. 없다면 UX spec에서 안전망을 정의해야 한다.

**Fix:** EI-1 또는 EP-2에 "NEXUS undo/redo: Ctrl+Z 최근 10회 복원, 삭제 시 확인 모달 (부서 삭제는 하위 에이전트 존재 시 차단 — 아키텍처 '비서실장 삭제 방지' 패턴과 동일 적용)" 추가.

### 🟡 Priority 3 (Should Fix)

**Issue #3 — [D2 완전성] FR-MKT 마케팅 파이프라인이 EI-3/CSM-5에 묻힘**

EI-3 "n8n 워크플로우 → 코드 없이 자동화"와 CSM-5 "첫 n8n 워크플로우 성공"이 일반적인 "Slack 알림" 시나리오만 다룬다. 그런데 DC-5에서 추가된 FR-MKT 마케팅 6단계 파이프라인 (이미지→영상→나레이션→자막→편집→배포)은 복잡도가 완전히 다르다:
- 6개 외부 AI API 각각의 설정
- Switch 노드 fallback 전환
- 단계별 실패 시각화

이것을 "Slack 알림 10분"과 동일한 EI/CSM으로 퉁치면 구현 시 혼란.

**Fix:** EI-3에 "마케팅 자동화 파이프라인: 프리셋 선택 → API 키 6개 설정 → 활성화 ≤ 30분. 일반 워크플로우 (≤10분)와 구분" 추가. 또는 CSM-5에 마케팅 시나리오 행 추가.

### ⚪ Priority 4 (Nice to Have)

**Issue #4 — [D6 리스크] soul-enricher.ts enrichment 실패 시 fallback UX**

EI-1이 "Soul 편집 = 즉시 행동 변화"를 약속하는데, soul-enricher.ts가 extraVars injection에 실패할 수 있는 경로:
- pgvector 쿼리 타임아웃 → `{relevant_memories}` 누락
- personality_traits JSONB 손상 → `{personality_*}` 누락
- department_context API 실패 → `{department_context}` 누락

실패 시 CEO가 보는 경험: 성격이나 기억이 없는 generic 응답? 에러? 이전 캐시?

**Fix:** EP-5 "Safe to Fail" 또는 EI-1에 "enrichment 실패 시: (1) 변수 누락 경고 로그 (Admin 대시보드), (2) CEO Chat은 정상 동작하되 enrichment 없는 base Soul로 응답, (3) 다음 요청에서 자동 재시도" 추가.

### ⚪ Priority 5 (Nice to Have)

**Issue #5 — [D3 정확성] `[E-XXX-NNN]` 에러 형식이 PRD에 미존재**

EP-5 Line 447: "에러 메시지 형식 `[E-XXX-NNN] 한국어 설명 + 다음 행동` (PRD 패턴)". PRD에서 이 정확한 형식을 검색했으나 발견하지 못함. Sally가 신규 제안한 형식이라면 "(PRD 패턴)" 문구를 제거하거나 "UX 신규 정의"로 변경. 좋은 형식이므로 채택 권장하되, 출처 오기는 수정.

**Fix:** "(PRD 패턴)" → "(UX spec 신규 정의)" 또는 출처 문구 제거.

---

### Cross-talk 추가 이슈 (Dev/John 발견, Winston 수용)

**🔴 Issue #6 (Must Fix, Dev) — React Router v6 → v7 오기**

Line 309 "React Router v6, React.lazy 코드 분할" — 실제 `react-router-dom ^7.13.1`. v7은 API 표면이 다름 (loader/action 패턴 변경). 정확한 버전 기재 필요.

**🟡 Issue #7 (Should Fix, Dev) — Platform Strategy에 상태관리 누락**

Architecture:311 "Zustand (client) + React Query (server)". /office WebSocket = Zustand store. Platform Strategy 테이블에 상태관리 기술 스택 행 추가 필요.

**🟡 Issue #8 (Should Fix, Dev) — Tailwind breakpoint 커스텀 설정 미언급**

md=640px, xl=1440px는 Tailwind 기본값 (768/1280)과 다름. `tailwind.config.ts theme.screens` 커스텀 설정 필요 — Platform Strategy에 주의사항 추가.

---

## 자동 불합격 조건 확인

| 조건 | 결과 |
|------|------|
| 할루시네이션 (존재하지 않는 API/파일/함수 참조) | ✅ PASS — soul-enricher.ts는 v3 계획 파일 (아키텍처 문서 확인). React 19 코드 확인. |
| 보안 구멍 | ✅ PASS — EP-5 보안 에러 비노출 정책 적절 |
| 빌드 깨짐 | ✅ PASS — N/A (UX spec) |
| 데이터 손실 위험 | ✅ PASS — N/A |
| 아키텍처 위반 | ✅ PASS — engine/ public API (agent-loop.ts + types.ts) 외 직접 참조 없음 |

---

## 아키텍처 정합성 요약

### ✅ 정합 (18건)
1. CEO Core Loop: Hub→Chat→/office→Dashboard→Notifications = PRD Journey J-1~J-3 일치
2. Admin Core Loop: Wizard→Big Five→Soul→n8n→Test task→CEO invite = PRD Journey J-4~J-6 일치
3. Secretary 라우팅 80%+ = PRD NFR-O2 (line 386) 일치
4. React 19 + Vite = `packages/app/package.json` 확인
5. 4-breakpoint (640/1024/1440) = 합리적 선택 (디자인 토큰 모바일 note와 정합)
6. App shell 280px sidebar + 56px topbar = design tokens §1.1 일치
7. PixiJS 30fps(lg)/60fps(xl) = 합리적 성능 분기
8. React Router v6 + React.lazy = v2 기존 패턴 유지
9. soul-enricher.ts extraVars (personality_traits, relevant_memories, department_context) = Architecture FR-PERS/FR-MEM 정합
10. memory-reflection.ts 크론 = Architecture FR-MEM 정합
11. WebSocket 16+1=17채널 = Architecture 정합
12. n8n Hono healthcheck /admin/n8n/healthz 30s = Architecture 정합
13. 4-layer sanitization (personality) = Architecture PER-1 정합
14. 8-layer 보안 (n8n) = Stage 1 Confirmed Decision #3 정합
15. Zero-Deploy 원칙 = Architecture Soul system 정합
16. FCP ≤1.5s + TTI ≤3s = NFR Performance 정합
17. PixiJS ≤200KB = NFR Performance 정합
18. 에이전트 5-state (idle/working/speaking/tool_calling/error) = Architecture FR-OC 정합

### ⚠️ 불일치 (3건)
1. `[E-XXX-NNN]` 에러 형식 — PRD에서 미확인. 출처 수정 필요 — Issue #5
2. React Router v6 → 실제 v7.13.1 — Issue #6 (Dev 발견)
3. 상태관리 (Zustand + React Query) Platform Strategy 누락 — Issue #7 (Dev 발견)

---

## Cross-talk 요약

### R1 (Winston → peers)
- John (Product): Secretary 라우팅 실패 UX가 CSM에 없음, FR-MKT 분리, NEXUS undo 필요성 판단
- Dev: NEXUS undo/redo 현재 구현 여부, soul-enricher.ts 실패 시 engine 동작, PixiJS 30fps 이유

### R1 응답 (peers → Winston)
- **John (8.05/10)**: Secretary 실패 UX에 전적 동의 (PM 최고 우선순위). FR-MKT → EI-6 또는 CSM-5b 별도 추가 권장. NEXUS undo **필요** ("최근 5건 되돌리기" 제안).
- **Dev (7.60/10)**: React Router v7 오기 발견 (**Must Fix** — 내가 놓침). EP-5 에러 형식 출처 오기 발견. 상태관리 누락. Tailwind breakpoint 커스텀 필요. PixiJS fps resize 전환 정의 필요.

### R2 응답 (Dev → Winston, questions answered)
- **NEXUS undo/redo**: Grepped `nexus.tsx` — **zero matches** for undo/redo/history. v2 has NO undo. Issue #2 confirmed as real implementation gap.
- **soul-enricher.ts failure**: Engine proceeds with base Soul (v2 behavior) — enrichment is try/catch wrapper. UX impact: "no personality/memory" not "error/crash". Issue #4 severity reduced.
- **30fps at lg**: No NFR backing — new constraint without architecture decision. 30fps may be too low for typing/speech animations. Recommend Sprint 4 benchmarking or architecture decision.

### Winston 수용 여부
- Dev Issue #6 (React Router v7): ✅ 수용 — D3 점수 9→8 하향
- Dev Issue #7 (상태관리 누락): ✅ 수용 — D2에 반영
- Dev Issue #8 (Tailwind breakpoint): ✅ 수용 — should-fix로 추가
- John Secretary/FR-MKT/undo: ✅ 기존 Issue #1/#2/#3와 정합 — 강화 근거로 반영

### 수정 후 점수: 8.65 → **8.40/10** (D3 하향 반영)
