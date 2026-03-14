# arch-step06+07+08 Fix Summary

**Date:** 2026-03-14
**Step:** step-06 (Project Structure) + step-07 (Validation) + step-08 (Complete)
**Critic Feedback Score:** 8/10 (joint, 9 issues)
**Post-fix Expected Score:** 9/10+

---

## Issues Applied (9/9)

### SIGNIFICANT (3개)

**S1 — FR 커버리지 헤더 수치 불명확 + FR-SO Phase 2 충돌**
- Fix: 헤더 "29/41개" → "21개 Phase 1 구현 / 20개 Phase 2+ Deferred"
- 4행 테이블: Phase 1 Agent-facing(21), Phase 1 Human UI/Security(8), Phase 2 Deferred(11), Phase 3+(1)
- FR-SO 세부 명시: SO1(P1), SO2/3(P1 수집+P2 UI), SO4/5/6/7(P1 전부)

**S2 — credential-crypto.ts lib/ 경계 + CDM에 scoped-query.ts 누락**
- lib/ 경계: "허용 importers: routes/admin/credentials.ts, engine/mcp/mcp-manager.ts, db/scoped-query.ts" 명시
- CDM: db/scoped-query.ts [MODIFY] 항목 추가 (credential-crypto.ts import 추가 이유 포함)

**S3 — FR-RM5/FR-RM6 누락 + routes 라벨 충돌**
- FR-to-File Matrix: FR-RM5(run_id 그룹 조회 — FR-RM4 통합), FR-RM6(distributionResults 재시도 — FR-RM1/2 통합) 행 추가
- routes 트리: admin/reports.ts + workspace/reports.ts → FR-RM3 → FR-RM4로 라벨 수정

### MODERATE (2개)

**M1 (Issue 4) — db/scoped-query.ts 파일 트리 미등재**
- db/ 섹션에 scoped-query.ts [MODIFY — 15개 신규 getDB() 메서드 추가] 추가 (메서드 목록 포함)

**M2 (Issue 5) — db/schema/*.ts 의존성 순서 선행 조건 오류**
- "선행 조건: credential-crypto.ts" → "선행 조건: 없음 (credential-crypto.ts와 독립, 병렬 진행 가능)"

### MINOR (4개)

**N1 (Issue 6) — "6개 테이블" 명시**
- 의존성 순서 Step 3: "(Phase 1 migration 대상 6개; content-calendar.ts Phase 2 사전 정의 포함 시 7개)" 추가

**N2 (Issue 7) — SIGKILL timeout 5s 상수 미정의**
- E12 TEARDOWN 규칙에 `const SIGTERM_TIMEOUT_MS = 5000` 상수 정의 추가

**N3 (Issue 8) — routes FR-RM 라벨 불일치**
- S3 수정에 포함 완료

**N4 (Issue 9) — TEA CREDENTIAL_ENCRYPTION_KEY startup 검증 누락**
- TEA Medium 15번 추가: "CREDENTIAL_ENCRYPTION_KEY 미설정 시 서버 시작 실패 + 에러 메시지 (키 값 미노출)"

---

## 변경 파일
- `/home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/architecture.md`
