# Critic-UX (Sally) Review — Stage 2 Step 2: Discovery

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 110–264 (## Project Discovery)
> Cross-refs: Brief (v3-2026-03-20), Tech Research (2026-03-20), v2 Audit

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 파일 경로(`shared/types.ts:484-501`), 정량 점수(33/40), Decision 참조(4.3.1) 좋음. 단, Journey B 1문장으로 너무 추상적. Lines 167/192 "Subframe 아키타입" 스테일 명칭. |
| D2 완전성 | 7/10 | 8개 서브섹션 전부 존재. Journey B 심각하게 불완전(에러/빈/로딩/접근성 없음). GATE 제거 기능의 UX 전환 계획(사이드바 제거? 리다이렉트? 북마크 URL 처리?) 미정의. 접근성 커버리지 A/D만 있고 B/C 누락. |
| D3 정확성 | 7/10 | WebSocket 16채널(`shared/types.ts:484-501` 실제 코드 확인) 정확. 0-100 스케일 Decision 4.3.1 일치. **단**: Line 167/192 "Subframe" — 폐기된 도구명(Stitch 2가 정확). Line 155 "4GB peak" — Brief mandate `--memory=2g`와 불일치. Line 223 "삭제: 0줄"이 Line 253 GATE "costs 전면 제거"와 모순. |
| D4 실행가능성 | 7/10 | Sprint 의존성 그래프 명확, 코드 영향도 Sprint별 분리, GATE 결정 테이블 실행 가능. Journey B는 구현 가이드 전무. 제거 기능의 사이드바 IA 변경 구체 계획 없음. |
| D5 일관성 | 6/10 | **(1)** Line 167/192 "Subframe 아키타입" ↔ Line 102 용어집 "Subframe 폐기 → Stitch 2 전환" 자기모순. **(2)** Line 223 "삭제: 0줄 (Zero Regression)" ↔ Line 253 GATE "costs 전면 제거" 논리 모순. **(3)** Line 155 n8n "4GB peak" ↔ Brief 3곳 `--memory=2g` mandate. **(4)** Journey 접근성 커버리지 A/D는 상세, B/C는 없음 — 균일하지 않음. |
| D6 리스크 | 7/10 | PixiJS 학습 곡선, n8n OOM, UXUI color-mix 리스크 식별됨. **미식별**: (1) costs 페이지 제거 시 기존 사용자 UX 영향(북마크/습관), (2) /office PixiJS Canvas 색맹 접근성(5개 상태 색상 구분), (3) 모바일 /office 배터리·성능(Journey D에선 언급했으나 리스크 섹션에 없음). |

---

## 가중 평균: 6.80/10 ❌ FAIL

계산: (7×0.15) + (7×0.20) + (7×0.15) + (7×0.15) + (6×0.20) + (7×0.15) = 1.05 + 1.40 + 1.05 + 1.05 + 1.20 + 1.05 = **6.80**

---

## 이슈 목록

### Critical (일관성 — D5 주요 감점 원인)

1. **[D5/D3] Line 167, 192: "Subframe 아키타입" → "Stitch 2 아키타입"으로 수정 필수**
   - PRD 용어집(Line 102)에 `Stitch2: "Subframe 폐기 → Stitch 2 전환"` 명시.
   - Sprint 의존성(167)과 요구사항 유형(192) 테이블에 여전히 "Subframe" 잔존.
   - Brief도 전부 "Stitch 2" 사용(Line 88, 359, 382, 383, 393, 396).
   - **CRITICAL constraint** 위반: 팀 지시 "Subframe 폐기 → Stitch 2"

2. **[D5] Line 223 "삭제: 0줄" ↔ Line 253 GATE "costs 전면 제거" 자기모순**
   - "삭제: 0줄 (Zero Regression — 기존 코드 삭제 없음)"이라고 명시한 직후, GATE에서 costs 페이지 전면 제거 결정.
   - costs.ts, cost-aggregation.ts, budget.ts 등 실제 코드 삭제 발생 (PRD Line 1754 확인: "costs.ts/cost-aggregation.ts → v3에서 제거 대상").
   - **수정 제안**: "삭제: 0줄 (기존 기능 보존)" → "삭제: ~N줄 (GATE 결정 반영: costs/budget 페이지·API 제거)" 또는 Zero Regression 정의를 "유지 기능의 회귀 0%" 로 명확화.

3. **[D5/D3] Line 155 n8n "860MB idle/4GB peak" — Brief mandate와 불일치**
   - Brief는 3곳에서 `--memory=2g` 강제. Tech Research도 "Brief constrains to 2GB" 명시(Line 205).
   - PRD 복잡도 테이블에 "4GB peak"은 Docker 미제한 상태 기준 — Brief 제약 미반영.
   - **수정 제안**: "860MB idle/2GB Brief limit (unconstrained: 2-4GB)" 로 명확화.

### Major (완전성 — D2 감점 원인)

4. **[D2] Journey B (n8n 워크플로우) 심각하게 불완전**
   - 현재 1문장: "Admin → n8n 관리 페이지 → 드래그앤드롭으로 생성 → 활성화 → 확인"
   - **누락**: 에러 상태(n8n Docker 다운, 워크플로우 실행 실패), 빈 상태(첫 접속 시 워크플로우 0개), 로딩 상태(n8n iframe/API 응답 대기), 권한 모델(누가 생성/편집/삭제 가능?), 접근성(키보드 내비게이션, 스크린리더 대안).
   - Journey A/C/D 대비 현저히 얕음.
   - **수정 제안**: Journey A 수준으로 에러/빈/로딩 상태 + 접근성 + 구체적 인터랙션 단계 추가.

5. **[D2/D6] GATE 제거 기능의 UX 전환 계획 미정의**
   - costs (Admin+CEO), workflows (Admin+CEO) 제거 시:
     - 사이드바 메뉴 아이템 처리? (제거? 비활성+안내?)
     - 기존 사용자가 북마크한 URL `/costs`, `/admin/costs`, `/admin/budget` 접근 시? (404? 리다이렉트? 안내 페이지?)
     - v2→v3 마이그레이션 시 UX 안내 전략?
   - **수정 제안**: GATE 테이블에 "UX 전환" 컬럼 추가 — 각 제거 기능별 리다이렉트 대상/안내 메시지 명시.

### Major (Cross-talk 반영 — Winston + Bob 공통 발견)

6. **[D2/D4] Voyage AI 임베딩 마이그레이션이 Sprint 의존성 그래프에 누락**
   - Tech Research: Voyage AI 전환 시 768→1024 차원 마이그레이션 + 기존 임베딩 전수 re-embed 필요 (Brief Line 157 확정).
   - Sprint 의존성(L165-180)에 Pre-Sprint 블로커로 Neon Pro + 디자인 토큰 + 사이드바 IA만 있음.
   - Voyage AI 마이그레이션(2-3일 예상)이 Sprint 3 (메모리) 착수 전 필수인데 의존성 그래프에 없음.
   - **수정 제안**: Pre-Sprint 또는 Sprint 3 선행 조건에 "Voyage AI 임베딩 마이그레이션 (768→1024, 기존 데이터 re-embed)" 추가.
   - Cross-talk: Winston(Critic-A), Bob(Critic-C) 모두 동일 발견.

### Minor

7. **[D2] Journey C (메모리) 접근성 미언급**
   - Journey A/D에는 접근성 하위 항목 있으나 C에는 없음.
   - Reflection 성장 지표 차트(Performance 페이지)의 키보드/스크린리더 접근성 필요.

8. **[D6] /office 5-state 색맹 접근성 미식별**
   - idle/working/speaking/tool_calling/error 5개 상태를 색상으로만 구분 시 색맹 사용자 불리.
   - Journey D에 aria-live 텍스트 대안은 있으나, 시각적 아이콘/패턴 차별화 미언급.
   - **수정 제안**: 색상 + 아이콘/애니메이션 이중 인코딩 명시.

9. **[D3] 코드 영향도 "71개 페이지" — GATE 제거 미반영**
   - Line 225: "Layer 0 UXUI 71개 페이지 색상 리팩터" — GATE에서 costs/workflows 4+개 페이지 제거 → 실제 리팩터 대상 감소.
   - 수정 줄 수(~1,500)도 재계산 필요.

---

## Cross-talk 보낸 내용

- **Winston (Architect)에게**: n8n "4GB peak" vs Brief "2GB mandate" 불일치 — Architecture에서 Docker resource limit 확정 시 PRD 반영 필요. 코드 영향도 "삭제 0줄" vs GATE 제거의 기술적 영향도 검증 요청.
- **Quinn (QA)에게**: Subframe 스테일 레퍼런스 2곳(167/192) — 전문 검색으로 Discovery 범위 외에도 추가 잔존 확인 요청 (Line 397/566도 발견). Journey B 접근성 누락은 QA 테스트 계획에도 영향.
- **Bob (PM)에게**: GATE 제거 기능 UX 전환 전략 필요 — 사이드바 IA 변경, URL 리다이렉트 정책, v2→v3 마이그레이션 안내. Brief CEO features "Costs / Reports"(Brief Line 279)가 GATE 제거와 충돌 — Brief 업데이트 필요 여부 확인.

## Cross-talk 받은 내용 (반영)

- **Winston (7.60 PASS)**: Voyage AI Sprint deps 누락 동의 → Issue #6으로 추가. Cost removal이 Reflection LLM cost-tracker Hook까지 제거하게 될 리스크 지적 — "전면 제거" 표현의 스코프 모호성. PixiJS 1,000줄 추정에 대한 의문 — 학습 곡선 고려 시 과소 추정 가능성. **Sally 의견**: cost-tracker Hook 스코프 모호성은 Issue #2에서 "Zero Regression 정의 명확화" 제안에 포함됨. 동의.
- **Bob (7.70 PASS)**: Subframe 스테일, Costs/Brief 충돌, Voyage AI 누락 — 3건 모두 내 이슈와 일치. 추가로 Neon Pro 🔴 블로커 상태 강조. **Sally 의견**: Neon Pro는 의존성 그래프에 이미 있으므로 Discovery 섹션 내 정확성 OK. Voyage AI 누락은 공통 발견.
- **Quinn (7.60 PASS)**: Journey B 접근성 0 동의 + 3개 구체 제안 (iframe keyboard nav, Docker down 안내, 빈 상태 가이드). **추가 발견**: `cost` WS 채널(`shared/types.ts:497`) 오펀 리스크 — costs 페이지 제거 시 WS 채널도 제거/보존 명시 필요. **Sally 의견**: Issue #5 GATE UX 전환 계획에 WS 채널·사이드바·URL 포함 필요성 강화. 동의.

## Critic 간 점수 비교

| Critic | 점수 | 판정 |
|--------|------|------|
| Winston (Architect) | 7.60 | PASS |
| Bob (PM/Delivery) | 7.70 | PASS |
| Quinn (QA/Security) | 7.60 | PASS |
| Sally (UX Designer) | **6.80** | **FAIL** |

> **차이 원인**: D5 일관성에서 Sally만 6/10 — "삭제 0줄" vs GATE "전면 제거" 자기모순을 D5 핵심 이슈로 봄. Winston/Bob은 이를 표현 모호성(clarification needed)으로 분류한 듯. Sally는 UX 관점에서 "삭제 없음"이라는 메시지가 GATE 제거와 직접 모순되어 구현자 혼란 유발 가능성을 높게 평가.

---

## Post-Fix Verification (Cycle 2)

> 11 fixes applied by Writer. Sally re-scored after line-by-line verification.

### 검증 결과

| # | Issue | Status | 검증 |
|---|-------|--------|------|
| 1 | Subframe → Stitch 2 (L167/192) | ✅ Fixed | "Stitch 2 DESIGN.md 기반". grep Subframe = 0 stale refs in scope. |
| 2 | "삭제 0줄" ↔ GATE (L223/253) | ✅ Fixed | L228 "~200줄 GATE 반영". L231 Zero Regression 재정의. |
| 3 | n8n 4GB → 2G cap (L155) | ✅ Fixed | "Docker 2G cap — Brief mandate `--memory=2g`". |
| 4 | Journey B 확장 (L209) | ✅ Fixed | 접근성 + 에러 경로 + 빈 상태. 4줄로 확장. |
| 5 | GATE UX 전환 (L253) | ✅ Fixed | L263 blockquote: UI/내부 구분, WS채널 Architecture 확정, Brief §2 수정 필요. |
| 6 | Voyage AI Sprint deps (L169) | ✅ Fixed | Pre-Sprint 블로커 추가 (768d→1024d, 2-3일). |
| 7 | Journey C 접근성 (L218) | ✅ Fixed | 차트 키보드, aria-label, 스크린리더 텍스트 대안. |
| 8 | /office 색맹 (L222) | ✅ Fixed | 색상 + 아이콘/애니메이션 이중 인코딩. |
| 9 | 71개 → ~67개 (L230) | ✅ Fixed | "~67개 페이지 — GATE 제거 4개 제외". |

**Residual nit**: L243 Sprint 테이블 "71개 페이지 색상 토큰 전환" → ~67개로 수정 권장 (non-blocking).

### Post-Fix 차원별 점수

| 차원 | Before | After | 변화 근거 |
|------|--------|-------|-----------|
| D1 구체성 | 7/10 | 8/10 | Journey B 구체화, Voyage AI 정량(768→1024, 2-3일), Stitch 2 DESIGN.md 명시 |
| D2 완전성 | 7/10 | 8/10 | 4개 Journey 전부 접근성 보유, GATE UX 전환 명확화, Voyage AI deps 추가 |
| D3 정확성 | 7/10 | 9/10 | Subframe 제거, n8n Brief 정합, 삭제 줄 수 정확. Nit: L243 "71개" 잔존 |
| D4 실행가능성 | 7/10 | 8/10 | Journey B 구현 가능, Zero Regression 정의 명확, GATE Architecture 연계 |
| D5 일관성 | **6/10** | **8/10** | 3개 자기모순 전부 해소. Journey 접근성 균일. Nit: L243 |
| D6 리스크 | 7/10 | 8/10 | 색맹 이중 인코딩 추가, GATE 내부/UI 구분, n8n OOM Brief 연계 |

### Post-Fix 가중 평균: 8.15/10 ✅ PASS

계산: (8×0.15) + (8×0.20) + (9×0.15) + (8×0.15) + (8×0.20) + (8×0.15) = 1.20 + 1.60 + 1.35 + 1.20 + 1.60 + 1.20 = **8.15**
