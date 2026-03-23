# Critic-A (Architecture) Review — Step 2: Discovery

**Reviewer:** Winston (Architect)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 23-217)
**Date:** 2026-03-23
**Rubric:** Critic-A weights (D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | hex 색상 3개 명시 (`#faf8f5`, `#283618`, `#606C38`), FCP ≤3초, PixiJS ≤200KB gzip, 5-state 열거(idle→working→speaking→tool_calling→error), Big Five 0-100 정수, 프리셋 ≤30초/수동 ≤2분, aria 속성 명세. DC-2 "부서별 방(room) 분리 또는 미니맵 도입"에 임계점 수치 부재(에이전트 몇 명부터?), /ws/office 연결 스펙(50conn/company, 500/server, 10msg/s) 미반영. |
| D2 완전성 | 7/10 | Step 02 요구 4개 영역(Executive Summary, Target Users, Design Challenges, Design Opportunities) 전부 커버. 4 Layer + Layer 0 체계적 정리. **그러나 PRD FR-UX (CEO앱 14페이지→6그룹 통합, 3 FRs, 병행 Sprint) 완전 누락** — 사이드바 구조 변경은 CEO 김도현의 일상 사용에 직접 영향하는 핵심 UX 변경이며, PRD에서 별도 Journey까지 있음. FR-MKT(마케팅 자동화, 7 FRs, Sprint 2)의 Admin/CEO 대면 UI 언급도 부재. |
| D3 정확성 | 7/10 | 기술 수치 대부분 정확: 485 API, 86 테이블, 71 페이지, Sprint 순서, 4-layer sanitization 경로, Hono 리버스 프록시 `/admin/n8n/*`, soul-enricher.ts E8 경계 패턴. **문제 2건**: (1) **"Sovereign Sage" 명칭 오용**: L40 `(Sovereign Sage: cream #faf8f5, olive #283618, sage #606C38)`로 표기하나, Sovereign Sage는 v2 Phase 7 dark theme(`slate-950 bg, cyan-400 accent` — CLAUDE.md). v3 planning brief는 "Sovereign Sage (dark/cyan) — 폐기" 명시. Architecture.md는 `테마: Natural Organic`으로 표기. (2) **`#606C38` 미출처 색상**: Architecture.md 색상은 `#283618`/`#5a7247`/`#e5e1d3`. `#606C38`(sage)은 어떤 소스 문서에도 없는 신규 색상 — 출처 불명. |
| D4 실행가능성 | 8/10 | Discovery 단계에 적합한 수준. 디자인 챌린지별 대응 방안이 구현 방향을 잡아줌. DC-1 aria-live 패널 + 이중 인코딩, DC-3 프리셋 + 툴팁, DC-5 네이티브/프록시 분리 등 아키텍처 패턴 정합. DC-6 ESLint 룰 + Playwright 자동 감지는 구현 가능한 게이팅. 온보딩 Wizard 순서도 명확. |
| D5 일관성 | 7/10 | Sprint 순서(1→Big Five, 2→n8n, 3→Memory, 4→OpenClaw) PRD/Architecture 정합. 용어(OpenClaw, NEXUS, Soul, Reflection) 일관. **문제**: (1) "Sovereign Sage" = Natural Organic 색상으로 재정의 — 기존 문서(CLAUDE.md, planning brief, PRD line 1036)와 충돌. 구현자가 "Sovereign Sage"를 검색하면 `slate-950`/`cyan-400` 결과를 얻어 혼동 유발. (2) "Controlled Nature" 디자인 방향명이 이 문서 최초 등장 — 이전 문서에 없는 신규 용어. |
| D6 리스크 | 7/10 | DC-1~DC-6 6개 UX 리스크 + 대안 제시. PixiJS 접근성, n8n OOM, 점진적 전환 게이팅 잘 다룸. **누락**: (1) `/ws/office` WebSocket 연결 끊김/재연결 UX — architecture에 50conn/company, token bucket 명시하나 UX fallback 없음. (2) VPS 4코어 CPU 병목(architecture 명시) 시 `/office` 렌더링 + n8n + Reflection 동시 실행이 UX 체감에 미치는 영향. (3) Neon serverless LISTEN/NOTIFY 미지원 시 500ms 폴링 폴백의 UX 체감 차이(실시간 vs 0.5초 지연). |

---

## 가중 평균 계산

| 차원 | 점수 | 가중치 | 가중 점수 |
|------|------|--------|-----------|
| D1 구체성 | 8 | 15% | 1.20 |
| D2 완전성 | 7 | 15% | 1.05 |
| D3 정확성 | 7 | 25% | 1.75 |
| D4 실행가능성 | 8 | 20% | 1.60 |
| D5 일관성 | 7 | 15% | 1.05 |
| D6 리스크 | 7 | 10% | 0.70 |

### **가중 평균: 7.35/10 ✅ PASS**

---

## 이슈 목록

### High Priority

1. **[D3 정확성 / D5 일관성] "Sovereign Sage" 명칭 오용 — 구현 혼동 유발**
   - L40: `Natural Organic 팔레트 (Sovereign Sage: cream #faf8f5...)` — 잘못된 등치.
   - Sovereign Sage = `slate-950 bg, cyan-400 accent` (CLAUDE.md, v2 Phase 7 dark theme, **폐기 확정** — PRD L1036, planning-brief).
   - Architecture.md는 v3 테마를 `Natural Organic`으로 명명.
   - DO-5 제목도 "Sovereign Sage 팔레트"로 되어 있으나 내용은 Natural Organic.
   - **권장 수정**: L40의 `(Sovereign Sage:` → `(` 또는 별도 v3 테마명 확정. DO-5 제목도 "Natural Organic 팔레트"로 수정. CLAUDE.md의 Sovereign Sage 정의와 명확히 구분.

2. **[D3 정확성] `#606C38` 미출처 색상**
   - Architecture.md 색상 팔레트: `#faf8f5`(cream), `#283618`(olive dark), `#5a7247`(olive medium), `#e5e1d3`(sand).
   - `#606C38`(sage)은 Brief, PRD, Architecture, Technical Research 어디에도 없음.
   - 구현자가 이 색상을 토큰에 포함할 경우 소스 문서와 불일치 발생.
   - **권장 수정**: `#606C38`을 architecture에 근거한 색상(`#5a7247`)으로 교체하거나, 신규 색상이면 architecture에 먼저 추가 후 참조.

3. **[D2 완전성] FR-UX (CEO앱 14→6 페이지 통합) 완전 누락**
   - PRD에 FR-UX1/UX2/UX3 3개 FR + 별도 Journey + 사이드바 통합 설계 존재.
   - CEO 김도현의 일상 네비게이션을 근본 변경하는 UX 결정 (14메뉴→6그룹).
   - 기존 라우트 redirect(FR-UX2), 기존 기능 100% 보장(FR-UX3) 등 Design Challenge로 다뤄야 할 사항.
   - **권장 수정**: DC-7 또는 Executive Summary에 FR-UX 페이지 통합 추가. 최소한 6그룹 구조, redirect 전략, 기존 기능 보장 언급.

### Medium Priority

4. **[D6 리스크] `/ws/office` WebSocket 연결 끊김 UX 미정의**
   - Architecture: 50conn/company, 500/server, 10msg/s token bucket rate limiting.
   - 연결 끊김 시 사용자 피드백(stale indicator? retry banner? auto-reconnect?), Neon LISTEN/NOTIFY 미지원 시 500ms 폴링의 UX 체감 차이 미언급.
   - **권장 수정**: DC-1에 "WebSocket 연결 끊김 시 stale indicator + auto-reconnect(exponential backoff) + 폴링 폴백 시 시각적 차이 최소화" 추가.

5. **[D5 일관성] "Controlled Nature" 신규 용어**
   - L40 첫 등장. Brief/PRD/Architecture 어디에도 없음. Quinn(Critic-B)도 동일 지적.
   - 신규 디자인 방향명이면 이 문서에서 정의를 명확히 하거나, 이후 참조될 수 있도록 출처 표기 필요.

### Low Priority

6. **[D2 완전성] FR-MKT 마케팅 자동화 UX 접점 누락**
   - 7개 FR, Sprint 2. Admin n8n 관리 페이지, 프리셋 워크플로우, AI 도구 엔진 설정 등 사용자 대면 UI 있음.
   - Discovery에서 최소한 Layer 2 설명(L34)에 마케팅 자동화 연동 언급 권장.

7. **[D6 리스크] VPS 4코어 CPU 병목 시 UX 열화 전략**
   - Architecture에 CPU가 병목으로 명시 (동시 세션 상한 20). CI/CD + n8n + PG 동시 실행 시 `/office` 렌더링 지연 가능.
   - UX 관점: 부하 시 graceful degradation 전략 (PixiJS 프레임 드롭 허용? 낮은 FPS 표시? 리스트 뷰 자동 전환?) 미언급.

---

## Cross-talk 요약

- **Quinn (Critic-B) 동의**: `/ws/office` WebSocket fallback UX 미정의 — 나의 이슈 #4와 동일 관점. Quinn은 보안 측면(sanitization 실패 시 사용자 피드백)에서, 나는 인프라 측면(연결 끊김/폴링 폴백)에서 같은 결론.
- **John (Critic-C) 보완**: John의 "Admin Reflection 비용 한도 UI" 이슈를 아키텍처 관점에서 지지 — Architecture ECC-2(cost-aware routing)가 Tier별 모델 선택 + Reflection Haiku $0.10/일 한도를 명시하므로 UX에도 반영 필요.
- **Quinn/John 미탐지 — 내 고유 이슈**: (1) Sovereign Sage / Natural Organic 명칭 충돌은 두 크리틱 모두 놓침. 구현 시 색상 토큰 혼동 직결. (2) `#606C38` 미출처 색상 — 아키텍처 문서에 없는 색상값 도입. (3) FR-UX 14→6 페이지 통합 완전 누락.
- **John의 Big Five 0-100 vs PRD 0.0-1.0 불일치 플래그에 동의** — UX 스펙의 0-100이 올바름 (Stage 1 Decision 4.3.1 + DB CHECK 제약 0-100 정수). PRD 내부 L136 수정 필요.

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 (존재하지 않는 API/파일/함수 참조) | ❌ 해당 없음 — `#606C38`은 할루시네이션이 아닌 미출처 색상 |
| 보안 구멍 | ❌ 해당 없음 |
| 빌드 깨짐 | ❌ 해당 없음 (Discovery 단계) |
| 데이터 손실 위험 | ❌ 해당 없음 |
| 아키텍처 위반 (E8 경계) | ❌ 해당 없음 — soul-enricher, agent-loop 참조 정확 |

---

## 최종 판정

**7.35/10 — ✅ PASS**

아키텍처 정합성이 높은 Discovery 문서. Layer 구조, Sprint 순서, 기술 패턴(E8 경계, soul-enricher, Hono proxy) 정확. **핵심 수정 필요 사항 3건**: (1) Sovereign Sage→Natural Organic 명칭 정리(구현 혼동 방지), (2) `#606C38` 미출처 색상 해결, (3) FR-UX 14→6 페이지 통합 추가. 이 3건 수정 시 D3→8, D5→8로 상승하여 ~7.85 예상.
