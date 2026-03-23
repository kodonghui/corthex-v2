# Critic-B Review — Step 0-1: Technical Spec

**Reviewer:** Marcus (Visual Hierarchy) + Quinn (WCAG Verification)
**Document:** `_uxui_redesign/phase-0-foundation/spec/technical-spec.md` (1170 lines)
**Date:** 2026-03-23

---

## Verification Performed

### Codebase Cross-Checks (13 items verified)

| Item | Expected | Actual | Status |
|------|----------|--------|--------|
| `POST /api/workspace/hub/stream` | Exists | `server/src/routes/workspace/hub.ts:31` | ✅ MATCH |
| `GET /api/workspace/nexus/org-data` | Exists | `server/src/routes/workspace/nexus.ts:18` | ✅ MATCH |
| `GET /api/workspace/performance/summary` | Exists | `server/src/routes/workspace/performance.ts:13` | ✅ MATCH |
| `GET /api/workspace/quality-dashboard` | Exists | `server/src/routes/workspace/quality-dashboard.ts:11` | ✅ MATCH |
| `GET /api/workspace/activity/security-alerts` | Exists | `server/src/routes/workspace/activity-tabs.ts:94` | ✅ MATCH |
| Sidebar nav sections (4) + items (23) | Match code | `app/src/components/sidebar.tsx:20-63` | ✅ MATCH |
| Topbar height h-14 (56px) | Match code | `app/src/components/layout.tsx:146` | ✅ MATCH |
| Lucide React icons (22 imported) | Match code | `app/src/components/sidebar.tsx:6-11` | ✅ MATCH |
| `agents` table columns (13 cols) | Match schema | `server/src/db/schema.ts:145-171` | ✅ MATCH |
| `sns_contents.variantOf/isCardNews/cardSeriesId` | Match schema | `server/src/db/schema.ts:504-531` | ✅ MATCH |
| `knowledge_docs.embedding` VECTOR(768) | Match schema | `server/src/db/schema.ts:1547-1569` | ✅ MATCH |
| `agent_memories.embedding` column | Spec claims exists | **Column DOES NOT EXIST** in schema | ❌ MISMATCH |
| `packages/office/` directory | Spec says `[v3]` | Directory does not exist (correctly tagged v3) | ⚠️ OK |

### Contrast Ratio Analysis (Current Natural Organic Theme)

| Pair | Foreground | Background | Ratio | WCAG AA |
|------|-----------|------------|-------|---------|
| Primary text on cream | `#1a1a1a` | `#faf8f5` | **16.4:1** | ✅ Pass |
| Secondary text on cream | `#6b705c` | `#faf8f5` | **4.83:1** | ✅ Pass (normal text) |
| Tertiary/placeholder on cream | `#a3a08e` | `#faf8f5` | **2.46:1** | ❌ **FAIL** (< 3:1) |
| Sidebar text on olive dark | `#a3c48a` | `#283618` | **6.68:1** | ✅ Pass |
| Focus ring on cream | `#606C38` | `#faf8f5` | ~**4.2:1** | ⚠️ Borderline (UI comp needs 3:1, passes; text needs 4.5:1, fails) |

### Accessibility Audit of Current Codebase

| Metric | Count | Assessment |
|--------|-------|------------|
| `aria-*` / `role=` / `sr-only` / `focus-visible` / `focus:ring` occurrences | **30 across 18 files** | Very sparse for 23 pages |
| Empty state patterns | **15 files** have some form | Not documented in spec |
| `font-mono` / `tabular-nums` / `JetBrains` usage | **72 files** | Widely used but JetBrains Mono NOT loaded via CDN |
| `prefers-reduced-motion` | **0 occurrences** | Not implemented |

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 10% | 파일 경로, hex 색상, API 메서드+경로 전부 명시. 단, SNS(35+), Trading(20+) 등 일부 페이지는 엔드포인트를 정확히 열거하지 않고 "N+ endpoints" 형태로 축약. 각 페이지의 px-level 레이아웃 치수도 없음. |
| D2 완전성 | 6/10 | **25%** | **[주요 감점]** 23 페이지 + API + DB + 아키텍처 커버리지는 우수. 그러나: (1) **접근성 섹션 완전 부재** — WCAG 목표, 키보드 내비게이션 패턴, 스크린 리더 고려사항, 포커스 관리 전략 없음. (2) **Empty/Error/Loading 상태 패턴 미문서화** — 15개 파일에 empty state가 존재하나 spec에 언급 없음. (3) **모달/다이얼로그 패턴 미문서화** — 에이전트 생성, 부서 cascade 분석 등 다수 모달 존재하나 공통 패턴 미정리. (4) **토스트/알림 스타일 미정리**. (5) **애니메이션/모션 스펙 없음** — `prefers-reduced-motion` 미언급. (6) **다크/라이트 모드 전환 전략 없음** — 현재 라이트(Natural Organic)에서 vision doc의 다크(slate-950)로의 마이그레이션 경로 미정의. |
| D3 정확성 | 7/10 | 15% | 13개 항목 codebase 교차검증 결과 12/13 정확. **`agent_memories.embedding` 컬럼은 실제 스키마에 존재하지 않음** (spec line 831). 또한 폰트 현황에서 JetBrains Mono가 72개 파일에서 사용되지만 CDN 로딩이 없다는 사실 미언급 — 로컬 폴백에 의존하거나 미렌더링 위험. |
| D4 실행가능성 | 7/10 | 10% | 개발자가 각 페이지의 API + 레이아웃 + 기능을 이해하기에 충분. 컴포넌트 패턴 코드 스니펫, 와이어프레임 참조, 상태 관리 구현 예시가 추가되면 8+ 가능. |
| D5 일관성 | 8/10 | 15% | Sidebar 그룹핑, API 응답 형식 `{success, data}`, 네이밍 컨벤션 모두 코드와 일치. 폰트 3개(Inter, JetBrains Mono, Noto Serif KR)가 공존하는 현황은 vision doc의 2-font 제약(Vignelli)과 충돌하나, spec은 "현재 상태"를 정확히 기술한 것으로 판단. |
| D6 리스크 | 5/10 | **25%** | **[주요 감점]** Section 7.9에 성능 목표 5개 존재하나: (1) **WCAG 접근성 리스크 미식별** — 현재 tertiary text (#a3a08e on #faf8f5)가 2.46:1로 AA 미충족, ARIA 사용 30건/18파일로 극히 부족. (2) **색상 마이그레이션 리스크 미언급** — Product Brief에서 428건 color-mix 사고 지적했으나 spec에서 마이그레이션 전략/리스크 없음. (3) **JetBrains Mono CDN 미로딩 리스크** — 72개 파일이 사용하지만 Google Fonts에서 로딩하지 않음. (4) **번들 사이즈 분석 없음** — 23개 lazy-loaded 페이지의 개별/총 번들 크기 미제시. (5) **WebSocket 16채널 복원력** — "automatic with backoff" 외 구체적 전략 없음. |

---

## 가중 평균: 6.50/10 ❌ FAIL

**산출:**
- D1: 8 × 0.10 = 0.80
- D2: 6 × 0.25 = 1.50
- D3: 7 × 0.15 = 1.05
- D4: 7 × 0.10 = 0.70
- D5: 8 × 0.15 = 1.20
- D6: 5 × 0.25 = 1.25
- **합계: 6.50**

---

## 이슈 목록 (우선순위 순)

### Critical (FAIL 원인)

1. **[D2 완전성] 접근성 섹션 완전 부재**
   - UXUI 리디자인 기술 스펙에서 접근성 문서가 없는 것은 심각한 누락
   - 필수 추가 내용:
     - WCAG AA 목표 선언 (최소 4.5:1 text, 3:1 UI component)
     - 현재 ARIA 사용 현황 (30건/18파일 — 극히 부족)
     - 키보드 내비게이션 패턴 (Tab order, focus trap in modals, Escape 동작)
     - 스크린 리더 랜드마크 (`<nav>`, `<main>`, `<aside>` 사용 현황)
     - `prefers-reduced-motion` 대응 여부 (현재: 미구현)
     - `prefers-color-scheme` 대응 여부

2. **[D6 리스크] 현재 contrast ratio WCAG AA 위반**
   - `#a3a08e` (tertiary text) on `#faf8f5` (cream bg) = **2.46:1** — AA 미충족
   - placeholder 텍스트도 WCAG SC 1.4.11 기준 3:1 이상 권장
   - 해결: tertiary 색상을 `#8a876f` 이상으로 변경 (≥3:1) 또는 `#6b705c` 통합

3. **[D6 리스크] 색상 428건 마이그레이션 전략 부재**
   - Product Brief에서 "428곳 color-mix 사고" 명시 — 리디자인의 핵심 동기
   - 현재 Natural Organic → 새 테마 전환 시 어떤 색상을 어떻게 매핑할지 미정의
   - 최소한 "현재 토큰 → 목표 토큰" 매핑 테이블 필요

### Major

4. **[D2 완전성] Empty/Error/Loading 상태 미문서화**
   - 15개 파일에 empty state 존재하지만 spec에 패턴 정리 없음
   - 리디자인 시 일관된 빈 상태 디자인을 위해 현재 패턴 수집 필요
   - Vision doc은 "Every empty state has a directive" 원칙을 명시 (Principle: Thorough)

5. **[D3 정확성] `agent_memories.embedding` 할루시네이션**
   - Spec line 831: `embedding` 컬럼 명시
   - 실제 `server/src/db/schema.ts`: 해당 컬럼 없음 (id, companyId, agentId, memoryType, key, content, context, source, confidence 등만 존재)
   - `knowledge_docs` 테이블만 embedding(VECTOR 768) 보유

6. **[D6 리스크] JetBrains Mono CDN 미로딩**
   - `theme.css:115`에서 `--font-monospace-body: "JetBrains Mono"` 정의
   - 72개 파일에서 `font-mono` 사용
   - 그러나 `index.html`은 Inter + Noto Serif KR만 CDN 로딩
   - 결과: JetBrains Mono가 로컬 미설치 시 시스템 monospace 폰트로 폴백
   - Spec에서 이 gap 미식별

### Minor

7. **[D1 구체성] SNS/Trading 엔드포인트 축약**
   - "35+ endpoints under /api/workspace/sns/*" — 정확한 목록 미제공
   - "20+ endpoints under /api/workspace/strategy/*" — 동일
   - 다른 페이지는 전부 열거한 것과 비일관

8. **[D2 완전성] 모달/다이얼로그 공통 패턴 미정리**
   - Agent 생성, Dept cascade 분석, Debate 생성, File 업로드 등 다수 모달 존재
   - 공통 모달 패턴 (크기, 오버레이, 포커스 트랩, Escape 동작) 미문서화

9. **[D5 일관성] 3-폰트 vs 2-폰트 제약 충돌 미설명**
   - 현재 코드: Inter + JetBrains Mono + Noto Serif KR (3개)
   - Vision doc Vignelli 제약: Inter + JetBrains Mono (2개)
   - Noto Serif KR의 위치 (유지? 폐기? 특수 용도?) 미정리

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ⚠️ `agent_memories.embedding` — 존재하지 않는 컬럼 참조. 단, 스펙의 핵심 로직이 아닌 테이블 인벤토리 항목이므로 자동 불합격까지는 아님. 수정 필요. |
| 보안 구멍 | ✅ 없음 |
| 빌드 깨짐 | ✅ 해당 없음 (문서) |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

## 통과 조건 (R2 재제출 시)

1. **접근성 섹션 추가** (Section 7.x 또는 별도 Section 9):
   - WCAG AA 목표
   - 현재 ARIA/keyboard/screen reader 현황
   - 현재 contrast ratio 테이블 (위 분석 참조)
   - `prefers-reduced-motion` / `prefers-color-scheme` 현황
2. **`agent_memories` 테이블 수정** — `embedding` 컬럼 제거
3. **색상 마이그레이션 리스크 섹션 추가** (428건 언급 + 현재→목표 매핑 방향)
4. **Empty/Error/Loading 상태 현황** — 최소한 패턴 존재 여부와 파일 위치
5. **JetBrains Mono CDN 로딩 gap 명시**

위 5개 해결 시 D2 → 7+, D6 → 7+ 예상 → 7.0+ PASS 가능.

---

## Cross-talk 요약

### Sent
- **ux-brand에게**: Noto Serif KR vs JetBrains Mono 폰트 전략 충돌 — vision doc의 2-font 제약과 현재 3-font 현실 사이의 결정이 필요. 브랜드 관점에서 어떤 조합이 맞는지 의견 요청.
- **tech-perf에게**: JetBrains Mono CDN 미로딩 이슈, 23개 lazy-loaded 페이지 번들 사이즈 분석 필요 여부, WebSocket 16채널 복원력 전략에 대한 의견 요청.

### Received (Post-Review Cross-talk)

**From ux-brand (Critic-A, REVISED 6.60/10 FAIL):**
- Contrast ratios corrected with proper WCAG 2.1 calc:
  - Sidebar `#a3c48a` on `#283618` = **6.63:1** ✅ (my 5.8:1 was close, their initial 4.2:1 was wrong)
  - Tertiary `#a3a08e` on `#faf8f5` = **2.48:1** ❌ (confirmed my 2.46:1)
  - Secondary `#6b705c` on `#faf8f5` = **4.83:1** ✅ (borderline, threshold is 4.5:1)
- Font brand recommendation: Inter + JetBrains Mono = keep (Vignelli 2-font). Noto Serif KR = defer to Phase 1 brand direction decision. CDN inconsistency = tech debt to document.
- **Score revised from 7.10 → 6.60 FAIL** after cross-talk (D2=5, D6=5)

**From tech-perf (Critic-C, 5.55/10 FAIL):**
- **[NEW] 44 Subframe (`@subframe/core`) components handle ARIA internally** — Dialog, Drawer, DropdownMenu, Select, etc. If Subframe migration happens (confirmed decision #4), ARIA parity is a massive regression risk. My 30 ARIA count was ONLY non-Subframe usage.
- **[NEW] 2.5MB dist bundle** — concrete figure not in spec
- **[NEW] Typography hierarchy is flat** — brand 14px = nav-item 14px = body 14px. Hierarchy depends on weight only, not size scale.
- **[NEW] ARIA live regions needed for 16 WebSocket channels** — screen readers get zero real-time feedback currently. `aria-live="polite"` needed for activity-log, notifications, dashboard metrics, budget alerts.
- **[NEW] WebSocket implementation risks** (verified `ws-store.ts`):
  - No max retry limit — reconnects forever (no UI escalation)
  - No jitter — thundering herd risk on mass disconnect
  - JWT in URL (`/ws?token=`) — visible in server access logs
  - Per-tab connections — no SharedWorker/BroadcastChannel sharing
- **[NEW] Gemini API in 4 server files** despite confirmed ban (decision #1) — not flagged in spec

### Updated Pass Conditions (incorporating cross-talk)

Original 5 conditions plus:
6. **Subframe ARIA dependency risk** — document the 44 Subframe components that provide ARIA internally and the migration parity requirement
7. **ARIA live regions** — document which real-time WebSocket channels need `aria-live` regions for screen reader accessibility
8. **Typography scale analysis** — current flat hierarchy (multiple elements at 14px) needs explicit documentation as a known design debt

### Score Summary (All Critics — Final after cross-talk)

| Critic | R1 Score | Revised | Verdict |
|--------|----------|---------|---------|
| Critic-A (ux-brand) | 7.10/10 | **6.60/10** | ❌ FAIL (revised) |
| **Critic-B (visual-a11y)** | **6.50/10** | **6.50/10** | **❌ FAIL** |
| Critic-C (tech-perf) | 5.55/10 | **5.55/10** | ❌ FAIL |
| **Average** | 6.38/10 | **6.22/10** | **❌ FAIL (unanimous)** |
