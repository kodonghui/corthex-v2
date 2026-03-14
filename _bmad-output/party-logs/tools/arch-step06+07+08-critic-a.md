# CRITIC-A Review — arch-step06+07+08 (Project Structure + Validation + Complete)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**Target:** architecture.md lines 1193–1522 (Steps 06 + 07 + 08)
**Date:** 2026-03-14
**Score: 8.5/10 (PASS)**

---

## Summary

Step 06 디렉토리 트리는 30개 파일을 체계적으로 구성하고 각 파일의 FR/패턴 참조가 명확하다. FR-to-File 매핑은 41개 FR 전체를 커버하며, Step 07 검증 매트릭스는 D22–D29 × D1–D21 호환성과 E11–E17 충돌 검증이 논리적으로 완전하다. TEA 테스트 케이스 14개(Critical 4개 포함)는 보안 격리 시나리오를 잘 커버한다. 그러나 **lib/ credential-crypto.ts 임포트 경계 규칙 누락(SIGNIFICANT)**, **의존성 순서 step 2 잘못된 선행 조건(MODERATE)**, 3개 MINOR 이슈가 발견되었다.

---

## John (PM) — FR/NFR 커버리지 정확성

**Issue #1 — MINOR: FR coverage 헤더 "29/41개" 계산 모호 + FR-SO2~7 Phase 2 주석 매트릭스와 충돌** (lines 1384–1390)

Step 07 FR 커버리지 테이블 헤더: "Phase 1 FR 커버리지 (29/41개)". 그러나 본문 breakdown은:
- 21개 Phase 1 구현
- 12개 Phase 2+ Deferred
- 8개 선행 조건 미충족 Phase 2

21 + 12 + 8 = 41 (전체 일치). 21 + 8 = 29 → 헤더의 "29"는 "Phase 1 + 선행조건 Phase 2 합산"으로 추정되나 명시 없음. 또한 8개 행의 설명: "FR-SO2~7 일부 Phase 2 Admin UI" — FR-to-File 매핑 행렬(lines 1352–1358)은 FR-SO1–7 전부를 Phase 1 구현으로 명시. 두 표 간 직접 충돌.

**수정:** 헤더 "29/41개"를 "21개 Phase 1 구현 / 12개 Deferred / 8개 부분 적용"으로 재표기. FR-SO Phase 2 Admin UI 항목이 있다면 FR-to-File 매트릭스에도 "(Admin UI → Phase 2)" 주석 추가.

---

## Sally (UX) — 구현 패턴 정확성 + 구조 일관성

**Issue #2 — SIGNIFICANT: lib/ credential-crypto.ts 임포트 경계 규칙 불완전 (line 1375)**

Architectural Boundaries 섹션 (line 1375):
```
credential-crypto.ts — routes/admin/credentials.ts + engine/mcp/mcp-manager.ts만 import 허용
```

그러나 getDB() 확장 `listCredentialsForScrubber()` (lines 379–382)는 이미 `decrypt(r.encryptedValue)` 호출을 포함한다 — `db/scoped-query.ts`(getDB() 정의 파일)가 `credential-crypto.ts`를 import한다. 경계 규칙은 2개 파일만 허용한다고 명시하지만 실제 구현 설계는 3번째 파일(scoped-query.ts)의 import를 요구한다.

**결과:** Story 개발자가 경계 규칙을 따르면 scoped-query.ts의 `decrypt()` 호출이 경계 위반으로 판단되어 구현 혼란 발생. 또는 `listCredentialsForScrubber()`에서 decrypt를 제외하고 credential-scrubber.ts에서 직접 decrypt하도록 설계를 바꿀 경우 — scrubber가 encryptedValue를 받아 decrypt하면 credential-scrubber.ts도 credential-crypto.ts import 필요 → 경계 규칙 위반.

**수정:**
```
credential-crypto.ts — 허용 importers:
  - routes/admin/credentials.ts (CRUD 암호화/복호화)
  - engine/mcp/mcp-manager.ts (RESOLVE 단계 credential inject)
  - db/scoped-query.ts (listCredentialsForScrubber() decrypt 호출)
```
Code Disposition Matrix에 `db/scoped-query.ts [MODIFY: listCredentialsForScrubber() + decrypt import]` 추가 필요 (현재 MODIFY 목록에 없음).

**Issue #3 — MINOR: routes 디렉토리 트리 vs FR-to-File 매핑 FR 번호 불일치** (lines 1307, 1345)

디렉토리 트리 (line 1307):
```
routes/admin/reports.ts [NEW — FR-RM3 Admin read]
routes/workspace/reports.ts [NEW — FR-RM3 Human read-only]
```
두 routes 파일이 모두 "FR-RM3"으로 태깅.

FR-to-File 매핑 (line 1345):
```
FR-RM4 (Admin UI) | routes/admin/reports.ts + routes/workspace/reports.ts | —
```
같은 파일들이 "FR-RM4"에 매핑됨. routes 트리는 FR-RM3, 매핑 테이블은 FR-RM4 — 어느 쪽이 맞는지 불명확.

**수정:** FR-RM3 = list/get 도구 (list-reports.ts, get-report.ts) / FR-RM4 = Admin UI routes (admin/reports.ts, workspace/reports.ts) 구분이라면 routes 트리 주석을 "FR-RM4" 로 수정.

---

## Mary (BA) — 엔지니어링 리스크 + 의존성 정확성

**Issue #4 — MODERATE: 구현 의존성 순서 step 2 선행 조건 오류** (line 1465)

```
1. credential-crypto.ts (E11, D23)  → 선행 조건: 없음
2. db/schema/*.ts (6개 테이블)      → 선행 조건: credential-crypto.ts  ← ❌
3. db/scoped-query.ts 확장 (getDB)  → 선행 조건: 스키마 파일
```

`db/schema/*.ts` 파일들은 Drizzle `pgTable()` 정의 파일 — `pgTable`, `text`, `uuid`, `timestamp`, `references` 등 Drizzle ORM만 import. `credential-crypto.ts`를 import하는 파일이 전혀 없다. Step 2의 "선행 조건: credential-crypto.ts"는 잘못됨.

실제 의존 관계:
- `db/schema/*.ts` → 선행 조건: 없음 (step 1과 병렬 가능)
- `db/scoped-query.ts` (step 3) → 선행 조건: schema + credential-crypto.ts (listCredentialsForScrubber의 decrypt 호출)

**수정:**
```
1. credential-crypto.ts             → 선행 조건: 없음
2. db/schema/*.ts (6개 테이블)      → 선행 조건: 없음 (step 1과 병렬 가능)
3. db/scoped-query.ts 확장 (getDB)  → 선행 조건: db/schema/*.ts + credential-crypto.ts
```

**Issue #5 — MINOR: TEA 테스트 #5 SIGKILL 5s 타임아웃 아키텍처에 미정의** (line 1489)

TEA 테스트 케이스 #5:
> "E12 TEARDOWN: 세션 종료 시 SIGTERM → 5s → SIGKILL 순서 검증"

"5s"는 어디에서 나온 값인가? D26은 cold start timeout 120s / warm start SLA만 정의. E12 TEARDOWN 규칙(line 845)은 `mcpManager.teardownAll(sessionId)` 호출만 명시 — SIGTERM/SIGKILL 상세 시퀀스나 grace period 타임아웃은 정의되지 않음.

Story 개발자가 TEA 테스트를 보고 5s를 하드코딩하면 근거 없는 임의 값이 됨.

**수정:** E12 TEARDOWN 규칙 또는 D26에 `teardownTimeoutMs: 5000 (SIGTERM grace period)` 추가. 또는 TEA 테스트를 "TEARDOWN 후 MCP 프로세스 종료 확인 (grace period 아키텍처 정의값 사용)"으로 수정.

---

## Issues Summary

| # | 심각도 | 위치 | 이슈 |
|---|-------|------|------|
| 1 | MINOR | lines 1384–1390 | FR coverage 헤더 29/41 모호 + FR-SO Phase 2 주석 매트릭스 충돌 |
| 2 | SIGNIFICANT | line 1375 | credential-crypto.ts 임포트 경계 scoped-query.ts 누락 + Code Disposition Matrix 미등재 |
| 3 | MINOR | lines 1307, 1345 | routes 트리 FR-RM3 vs 매핑 테이블 FR-RM4 번호 불일치 |
| 4 | MODERATE | line 1465 | 의존성 step 2 "db/schema → credential-crypto.ts" 잘못된 선행 조건 |
| 5 | MINOR | line 1489 | TEA 테스트 SIGKILL 5s 타임아웃 아키텍처에 미정의 |

**Score: 8.5/10 (PASS)** — 전체 구조·커버리지·검증 매트릭스 우수. SIGNIFICANT 1개 + MODERATE 1개 + MINOR 3개. 결정적 구현 블로커는 없으나 SIGNIFICANT Issue #2 (credential-crypto boundary)는 Story 개발 혼란 방지를 위해 수정 권고.
