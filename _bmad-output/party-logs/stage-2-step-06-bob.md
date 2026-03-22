# Stage 2 Step 06 — Bob (Critic-C, Scrum Master)

**Section:** PRD lines 1070–1335 (User Journeys)
**Grade:** B
**Date:** 2026-03-22

---

## Scoring

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| D1 Specificity | 15% | 9 | 10 journeys with specific UI interactions, time expectations, error scenarios. Requirements Summary maps journeys to phases/sprints. Accessibility details (aria-valuenow, keyboard shortcuts). Marketing pipeline 6-step with specific tools/costs. /office 5-state mapping explicitly documented. |
| D2 Completeness | 20% | 7 | 5 personas, all Phases + Sprints, error scenarios in 4/10 journeys. Requirements Summary + cross-reference tables. BUT: no security incident journey (poisoning/tool sanitization), no Pre-Sprint in Requirements Summary, observation 30-day TTL not visible in memory journey. |
| D3 Accuracy | 15% | 7 | Brief 5-state mapping correct (L1248-1251). Option B agent_memories confirmed (L1288). Big Five accessibility matches Step 5. BUT: Journey 10 Planning stage implies stored artifact count + manual trigger — Product Scope L896 defines Planning as read-time semantic search only. Weekly report not scoped. Reflection count 14 mathematically impossible (should be 2). |
| D4 Implementability | 15% | 7 | Requirements Summary gives clear FR mapping. Cross-reference table identifies integration points. BUT: Planning UI/count/trigger implies unscoped work. Dev could build Planning features that aren't in Product Scope Feature 5-4. |
| D5 Consistency | 15% | 8 | Sprint alignment matches Step 4 roadmap. /office states match Brief + Step 4. n8n error workflow matches Step 5 triggers. Onboarding time matches Step 5 Gate #13. Big Five presets match Product Scope. Tier frequency confirmed via MEM-2. Minor: Planning count/trigger inconsistency. |
| D6 Risk Awareness | 20% | 7 | Error scenarios in J1 (SDK failure), J5 (scope rejection), J8 (API timeout), J10 (wrong learning). Memory error = delete + regenerate. BUT: no security incident scenario (poisoning defense activation, tool sanitization alert). No Voyage migration impact on journeys. |

**Weighted Score: 7.30/10 — PASS ✅ (barely)**

Calculation: (9×0.15)+(7×0.20)+(7×0.15)+(7×0.15)+(8×0.15)+(7×0.20) = 1.35+1.40+1.05+1.05+1.20+1.40 = 7.45

---

## Must-Fix (Critical) — 0 items

No critical issues. Journeys are fundamentally well-structured.

---

## Should-Fix (Major) — 4 items

### #1: Journey 10 "Planning" Stage Implies Unscoped UI Features
**Lines:** L1172, L1267-1271, L1279, L1288
**Severity:** Major (D3, D4, D5)
**Evidence:**
- Journey 10 L1271: "Planning: Reflection 기반 다음 태스크 전략 생성 (자동, **수동 트리거 가능**)"
- Journey 10 L1279: "Planning: **5건 적용**" (countable artifacts)
- Journey 10 L1288: "**Planning 재생성 트리거**" (manual re-generation)
- Journey 4 L1172: "Observation → Reflection → Planning **3단계 파이프라인 모니터링**"
- Product Scope L896: "**계획 (Planning)** — 태스크 시작 시 `agent_memories`(reflection 타입) pgvector 시맨틱 검색 → Soul에 주입"

**Discrepancy:** Product Scope defines Planning as a **read-time operation** (semantic search at task start → inject into Soul). It has no stored artifacts, no count, no manual trigger, no regeneration capability. Journey 10 presents Planning as a **generative stage** with its own output count ("5건 적용"), manual trigger, and monitoring dashboard.

**Impact:** If a developer reads Journey 10 and builds:
1. A "Planning" storage table → scope creep (not in schema)
2. A "Planning count" UI → implies a write operation (Product Scope defines read-only)
3. A "manual Planning trigger" button → requires new API endpoint not scoped
4. A "Planning monitoring view" → UI page not in Product Scope

**Fix:** Align Journey 10 with Product Scope L896:
- Replace "Planning: 5건 적용" with language reflecting read-time retrieval: e.g., "메모리 활용: 최근 5건 Reflection이 CIO의 다음 태스크 Soul에 자동 주입"
- Remove "수동 트리거 가능" from L1271 (Planning is automatic at task start per L896)
- Change L1288 "Planning 재생성 트리거" to "Reflection 재생성 트리거" (Admin can trigger new reflection cron run, not a separate planning phase)
- Change J4 L1172 "3단계 파이프라인 모니터링" to "Observation/Reflection 2단계 + Planning 자동 활용 모니터링"

### #2: Weekly Growth Report Notification Not in Product Scope
**Lines:** L1109
**Severity:** Major (D2, D4)
**Evidence:**
- L1109: "Reflection 알림: **매주 월요일 '이번 주 에이전트 성장 리포트' 도착** → CIO 반복 오류율 40%→15% 감소 확인"
- Product Scope Feature 5-4: Defines reflection cron, observation storage, memory retrieval. **No weekly notification or growth report feature.**
- No corresponding FR in Requirements Summary table

**Impact:** Journey implies a notification feature (weekly push to CEO with growth metrics) that doesn't exist in Product Scope or Requirements Summary. Developers may assume this needs to be built. If intentional, it needs to be added to Product Scope. If narrative embellishment, it should be marked as future or removed.

**Fix:** Either:
- (A) Add to Product Scope Feature 5-4: "CEO 알림: 주 1회 에이전트 성장 리포트 (반복 오류율 변화) — Dashboard 또는 텔레그램"
- (B) Remove from Journey 1 or rephrase as: "이수진(Admin)이 메모리 대시보드에서 주간 성과를 확인하고 김도현에게 보고"

### #3: Journey 10 Reflection Count Mathematically Impossible (adopted from Winston cross-talk)
**Lines:** L1277-1279
**Severity:** Major (D3)
**Evidence:**
- L1277-1279: "Observation: 47건 누적 → Reflection: 14건 생성 (매일 1건)"
- Product Scope L951: "20개 관찰(reflected=false)이 쌓이면 자동 실행"
- 47 observations / 20 threshold = max **2 reflections** in 2 weeks. **14 is mathematically impossible.**
- Root cause: Journey follows Brief's "일 1회 크론" daily model. Product Scope adds "20개 threshold" gating condition. Journey didn't account for the threshold.
- **Additional:** L1285 "반복 오류율 40%→15%" improvement claim also needs recalibration — 2 reflections cannot realistically achieve this improvement magnitude.

**Impact:** Sets unrealistic user expectations ("에이전트가 매일 성장한다"). When Sprint 3 delivers 2 reflections instead of 14, it will feel like a regression from the promised experience. CEO's "성장 리포트" delight moment depends on visible, frequent improvement.
**Fix:** Update L1277-1279 to realistic numbers under 20-count threshold:
- "Observation: 47건 누적 / Reflection: **2건 생성** (20개 관찰 축적 시 자동 실행) / 메모리 활용: 2건의 Reflection이 다음 태스크 Soul에 자동 주입"
- L1285: Recalibrate "40%→15%" to match realistic 2-reflection improvement, or note it as aspirational (longer-term target, not 2-week outcome).
- If 2 reflections/2weeks feels too sparse for the narrative, flag as product decision to lower threshold (20→10) — but don't inflate Journey numbers to match aspirational pace.
**Source:** Winston cross-talk (H1), Quinn cross-talk (L1285 recalibration)

### #4: FR-UX1 (CEO Sidebar 14→6) Not in Requirements Summary (adopted from Sally cross-talk)
**Lines:** L1292-1319
**Severity:** Major (D2, D4)
**Evidence:**
- Success Criteria L501: "CEO 앱 네비게이션이 간결하다 | 사이드바 메뉴 항목 수 | 기존 대비 6개+ 감소 | 병행"
- Success declaration L660: "CEO 앱 사이드바: 합쳐진 메뉴 구조로 간결화 (14→6개 그룹, FR-UX1)"
- Technical Success L597: "페이지 통합 회귀 | 합쳐진 페이지(6건) 기존 기능 100% | 병행 | 신규"
- Requirements Summary (L1292-1319): No FR-UX1 row. No sidebar integration or page merge FR.
**Impact:** FR-UX1 appears in 3 other sections but has no journey-derived requirement. Requirements Summary is the traceability bridge from journeys to implementation — missing this means no dev will know to implement the page merge from journey context.
**Fix:** Add row: "CEO 김도현 | 병행 | 사이드바 메뉴 통합 (14→6개 그룹, FR-UX1) — 합쳐진 페이지에서 기존 기능 100% 동작 + 라우트 redirect"
**Source:** Sally cross-talk

---

## Observations (Minor) — 5 items

### #5: Tier-Based Reflection Frequency (downgraded from should-fix per Winston MEM-2 confirmation)
**Lines:** L1273
**Observation:** L1273 "Tier 1-2(Sonnet/Opus)은 Reflection 무제한, Tier 3-4(Haiku)은 주 1회로 제한" — initially flagged as inconsistent with Product Scope's single daily cron. However, Winston confirmed MEM-2 (L1462) + NFR (L1647) explicitly define tier-based frequency as a PRD-internal constraint. This is a valid PRD elaboration, not a contradiction.
**Remaining concern:** The mechanism isn't clear — does "주 1회" mean the cron skips Tier 3-4 agents 6 days/week, or a separate weekly cron? Implementation spec should clarify.
**Suggestion:** Add brief mechanism note: "Tier 3-4 주 1회 = 일요일 크론에서만 Tier 3-4 포함 (또는 cron_eligible 플래그로 제어)"

### #6: No Security Incident Journey
**Observation:** 10 journeys cover happy paths + operational errors (SDK failure, API timeout, wrong learning). But no journey covers a security incident: observation poisoning defense activation (Go/No-Go #9), tool sanitization blocking (Go/No-Go #11), or CLI token leak detection. Admin is the persona who would handle security alerts, but Journey 4/10 only cover operational management.
**Suggestion:** Add an error scenario to Journey 10: "Observation content에 프롬프트 주입 시도 감지 → 4-layer sanitization이 자동 차단 → Admin 대시보드에 '차단된 관찰 3건' 알림. 이수진이 확인 → 해당 에이전트의 도구 출력 검토."

### #7: Pre-Sprint Not in Requirements Summary
**Observation:** Requirements Summary (L1292-1319) maps journeys to Phase/Sprint but has no Pre-Sprint row. Pre-Sprint includes Neon Pro upgrade, Voyage AI migration, design tokens, sidebar IA — all Admin work. Expected omission for user journeys (Pre-Sprint is infrastructure), but the Requirements Summary could note "Pre-Sprint: 인프라 작업 (여정 해당 없음)" for completeness.
**Suggestion:** Add a note row: "Pre-Sprint | 인프라 | Neon Pro + Voyage AI + 디자인 토큰 + 사이드바 IA (Admin DevOps, 사용자 여정 해당 없음)"

### #8: 30-Day TTL Not Visible in Memory Management Journey
**Observation:** Journey 10 (Admin memory management) describes observation monitoring, reflection cron, and error correction. But confirmed-decision #5 (30-day TTL for processed observations) isn't mentioned. Admin should know that reflected=true observations auto-delete after 30 days — this affects memory management decisions.
**Suggestion:** Add to Journey 10 Resolution (L1288): "processed observations(reflected=true)는 30일 후 자동 삭제 — 장기 기억은 agent_memories의 Reflection으로 보존."

### #9: /office Connection Limit Not in Journey 9
**Observation:** Journey 9 (/office deep dive) describes real-time PixiJS visualization but doesn't mention WebSocket connection limits (50/company, 500/server from confirmed-decisions #10). Not required in a user journey narrative, but an error scenario could reference it: "동시 접속 50명 초과 시 '접속 대기' 메시지 + 큐 순서 표시".
**Suggestion:** Optional — add to Journey 9 error scenario or leave as implementation detail.

---

## Cross-Reference Verification

| Source | Journey Status | Notes |
|--------|---------------|-------|
| Sprint roadmap (Step 4 L430-448) | ✅ | Journeys align: Pre-Sprint→S1(Big Five)→S2(n8n)→S3(Memory)→S4(/office) |
| Go/No-Go #1-#14 (Step 4 L456-469) | ⚠️ | Implicitly covered through Sprint alignment. Not explicitly referenced (narrative section — OK) |
| n8n Docker 2G (confirmed-decisions #2) | ✅ | Not mentioned in journeys (infrastructure detail — OK) |
| Voyage AI 1024d | ✅ | Not mentioned (infrastructure — OK) |
| Option B agent_memories | ✅ | L1288 explicitly references "agent_memories" |
| Brief 5-state (/office) | ✅ | L1248-1251 correctly maps 5 states → 4 NEXUS colors + degraded |
| Observation poisoning defense | ⚠️ | Not visible in Journey 10 (Admin memory management) |
| Advisory lock | ✅ | Not mentioned (implementation detail — OK for journey) |
| WebSocket limits (#10) | ⚠️ | Not mentioned in Journey 9 |
| 30-day TTL (#5) | ⚠️ | Not mentioned in Journey 10 |
| Product Scope Planning (L896) | ❌ | Journey 10 implies stored count + manual trigger vs L896 read-time search |
| Weekly growth report | ❌ | L1109 implies feature not in Product Scope |
| Tier-based frequency | ⚠️ | L1273 "주 1회" — confirmed in MEM-2 (L1462) + NFR (L1647). Mechanism unclear but valid PRD constraint |
| Big Five accessibility | ✅ | L1164 matches Step 5 L598 (aria-valuenow, keyboard) |
| /office accessibility | ✅ | L1255 matches Step 5 L598 (desktop-only, mobile list, aria-live) |
| Onboarding ≤ 15min | ✅ | L1197 "15분 초과 시" matches Gate #13 |
| Marketing 6-step pipeline | ✅ | L1207-1214 consistent with Sprint 2 scope |
| n8n error workflow | ✅ | L1228 matches Step 5 failure trigger L552 |
| Requirements Summary | ✅ | 20 rows covering all journeys. Missing: Pre-Sprint |
| Cross-reference table | ✅ | 10 cross-references covering key integration points |

---

## Strengths

1. **Narrative quality** — Each journey tells a compelling story with persona context, emotional arc (problem→action→delight), and specific UI interactions. CEO journeys build from "transparent change" → "personality" → "growth" → "visual team" progression.
2. **Error scenarios** — 4 journeys include specific error handling (SDK failure retry, scope rejection with guidance, API timeout with fallback, wrong learning with deletion). Error messages are user-friendly, not technical.
3. **Accessibility integration** — L1164 Big Five slider (aria-valuenow, keyboard ←→, Shift+arrow 10단위) and L1255 /office (desktop-only, mobile list view, aria-live) match Step 5 Technical criteria.
4. **Requirements Summary** — 20 rows mapping journeys to specific FRs. Cross-reference table identifies 10 integration points with functional implications.
5. **Sprint 2 marketing deep dive (J8)** — 6-step pipeline with specific AI tools (Ideogram V3, Kling 3.0), cost estimates ($0.03-0.09/image), and error workflow (timeout→retry→fallback).
6. **Brief 5-state mapping** — L1248-1251 explicitly documents the mapping: 5 Brief states → 4 NEXUS colors, with "degraded" as a PRD-added operational state.
7. **Cross-persona causality** — Admin sets Big Five → CEO feels tone change (Sprint 1). Admin manages memory → CEO sees growth (Sprint 3). The journey cross-references explicitly capture these causal chains.

---

## Summary

User Journeys is one of the strongest sections reviewed so far. The narrative quality is excellent — each journey has a clear persona, emotional arc, and specific UI interactions. Error scenarios are practical and user-friendly. Accessibility is properly integrated. The Requirements Summary and cross-reference tables add significant implementation value.

The primary issue is **Journey 10's Planning stage overstatement**: Product Scope L896 defines Planning as a read-time semantic search operation, but the journey presents it as a generative stage with stored artifact count ("5건 적용"), manual trigger, and monitoring dashboard. This creates scope creep risk if developers build Planning features not in the spec.

Secondary issues are the **weekly growth report** (L1109, not in Product Scope) and **Reflection count math** (47 obs / 20 threshold = 2, not 14 — also invalidates L1285 "40%→15%" claim).

**Cross-talk findings adopted:**
- Winston: Reflection count math impossible (added as #3 should-fix) + Tier frequency confirmed via MEM-2 (downgraded to observation #5)
- Sally: FR-UX1 (CEO sidebar 14→6) missing from Requirements Summary (added as #4 should-fix)
- Quinn: L1285 error rate recalibration (incorporated into #3)

**Estimated post-fix score: 8.5+** if the 4 should-fix items are addressed (9 items total: 0 critical + 4 major + 5 observations).

---

## Verified Post-Fix Score (R2 FINAL)

**10 fixes applied** — verified against PRD lines 1070–1351.

### Fix Verification

| Fix | Status | Verification |
|-----|--------|-------------|
| #1 Journey 10 전면 재작성 | ✅ | L1278: 4-layer 보안 필터 + Go/No-Go #9. L1279: "reflected=false 20개 이상 시에만 실행" + advisory lock + ECC 2.2. L1280: "read-time semantic search, agent_memories Option B". L1282: 30일 TTL. L1298-1302: 3 error scenarios (wrong learning, poisoning, cron failure). "수동 트리거", "5건 적용", "Planning 재생성" 전부 제거됨 |
| #2 Journey 2 에러 시나리오 | ✅ | L1132: "n8n OOM, Docker 2G 한도 내" + CEO 앱 ❌ 실패 표시 + Admin 문의 안내 |
| #3 Journey 3 에러 시나리오 | ✅ | L1150: ARGOS 크론 뉴스분석가 타임아웃 → /office 빨간 느낌표 → CIO 3명 결과 종합 |
| #4 Journey 8 n8n 2G + 보안 | ✅ | L1214: "n8n Docker 컨테이너(2G RAM, --memory=2g)에 자동 생성. 보안: port 5678 외부 차단 + 태그 필터 교차 접근 차단 + webhook HMAC 검증 (Go/No-Go #3)" |
| #5 Journey 9 WebSocket limits | ✅ | L1264: "동시 접속 50+ 또는 에이전트 50명+" + heartbeat 5초→15초→30초 + confirmed decision #10, R15 |
| #6 Journey 1 FR-UX1 | ✅ | L1101-1102: "CEO 앱 사이드바가 14개 메뉴에서 6개 그룹으로 통합 (FR-UX1)" — Layer 0 병행 단락 추가 |
| #7 Requirements Summary 5행 | ✅ | L1327-1331: 보안(Observation 4-layer, Go/No-Go #9), Reflection 크론(20개 threshold + advisory lock + 비용 차단), 사이드바 FR-UX1, n8n 2G/보안(Go/No-Go #3), /office WebSocket 제한 |
| #8 주간 리포트 → Admin 대시보드 | ✅ | Journey 1 L1112 수정 + Requirements Summary L1313 "Admin 대시보드 성과 확인" 수정 완료 |
| #9 오류율 40%→30% | ✅ | Journey 10 L1293 + Journey 1 L1112 모두 "40%→30%" 정합 |
| #10 에러 시나리오 3 (크론 실패) | ✅ | L1302: "3회 연속 실패 시 Admin 알림 발송" + reflected=false 유지 → 다음 크론 재처리 |

### Remaining Gaps — RESOLVED

R1 (L1313 주간 리포트) + R2 (L1112 오류율) — john이 잔여 수정 완료. 0 residuals.

### Post-Fix Scoring

| Dimension | Weight | R1 (pre-fix) | R2 (post-fix) | Delta | Notes |
|-----------|--------|-------------|---------------|-------|-------|
| D1 Specificity | 15% | 9 | 9 | 0 | Already strong. Error scenarios now more specific (poisoning 4-layer, cron failure 3-retry, WebSocket limits with heartbeat progression) |
| D2 Completeness | 20% | 7 | 9 | +2 | FR-UX1 in Requirements Summary. 5 new rows. Security error scenarios (poisoning, cron failure). n8n OOM + WebSocket in journeys. All 4 should-fix items addressed |
| D3 Accuracy | 15% | 7 | 9 | +2 | Reflection math corrected (47/20=2). Planning→read-time semantic search. Error rate 40%→30%. No more "수동 트리거" or "5건 적용". Minor: L1112 residual "40%→15%" |
| D4 Implementability | 15% | 7 | 9 | +2 | No more unscoped Planning features. Dev won't build Planning storage/trigger/UI. Requirements Summary has full traceability. Error scenarios guide actual error handling |
| D5 Consistency | 15% | 8 | 9 | +1 | Planning aligned with Product Scope. Residuals (L1313, L1112) resolved. Error rate 40%→30% consistent across J1 and J10. Weekly report replaced with Admin dashboard in both body and Requirements Summary |
| D6 Risk Awareness | 20% | 7 | 9 | +2 | Observation poisoning 4-layer (Go/No-Go #9). n8n 2G + 보안 3중 (Go/No-Go #3). WebSocket limits (confirmed #10). Cron failure 3-retry. Advisory lock. Cost auto-blocking |

**R2 FINAL: 9.00/10 — PASS ✅**

Calculation: (9×0.15)+(9×0.20)+(9×0.15)+(9×0.15)+(9×0.15)+(9×0.20) = 1.35+1.80+1.35+1.35+1.35+1.80 = 9.00

Residuals (L1112, L1313) resolved by john → D5 upgraded to 9.
