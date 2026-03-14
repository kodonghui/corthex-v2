# arch-step02+03 Fix Summary

**Date:** 2026-03-14
**Step:** step-02 (Project Context Analysis) + step-03 (Starter Template Evaluation)
**Critic Feedback Score:** 6.5/10 (critic-b, 10 issues)
**Post-fix Expected Score:** 8.5+/10

---

## Issues Applied (10/10)

### CRITICAL

**C1 — getMcpServersForAgent cross-tenant SQL fix**
- Problem: WHERE 절에 `mcpServerConfigs.companyId` 누락 → cross-tenant MCP config 노출 가능 (D1 위반)
- Fix: `.where(and(eq(agentMcpAccess.agentId, agentId), eq(mcpServerConfigs.companyId, companyId), eq(mcpServerConfigs.isActive, true)))` 로 수정
- File: architecture.md getDB() getMcpServersForAgent 메서드

**C2 — mcp_lifecycle_events 테이블 추가 (FR-SO3, NFR-R3)**
- Problem: PRD FR-SO3이 `{ company_id, mcp_server_id, event: 'spawn'|...|'teardown'|'error', timestamp, latency_ms }` 요구. 어느 테이블도 저장 불가. NFR-R3 zombie process 30초 알림의 데이터 소스 없음.
- Fix: 6번째 Phase 1 테이블 `mcp_lifecycle_events` 추가 (Drizzle 스키마 + getDB 메서드 2개: insertMcpLifecycleEvent, getActiveMcpSessions)
- zombie process 감지 SQL 패턴 포함 (sessionId 기준 teardown 누락 세션 조회)
- 파일 구조 + 신규 파일 수 업데이트 (28 → 30)

### SIGNIFICANT

**S1 — tool_call_events.companyId FK 추가**
- Problem: `text('company_id').notNull()` — `.references(() => companies.id)` FK 누락
- Fix: `text('company_id').notNull().references(() => companies.id)` 로 수정

**S2 — FR-CM6 credential audit log 구현 경로 명시**
- Problem: credentials CRUD 감사 경로 없음
- Fix: credentials 테이블에 `createdByUserId` + `updatedByUserId` 인라인 audit 필드 추가. 삭제 감사는 error_code='CREDENTIAL_DELETED' 패턴으로 대체. FR-CM6 구현 경로 주석 명시.

**S3 — D26 cold start timeout 분리**
- Problem: cold start timeout 30s → PRD가 "10–30초" cold start이므로 false-timeout 위험
- Fix: D26을 `warm start SLA ≤3s(Notion)/≤5s(Playwright), cold start timeout 120s (npm 다운로드 포함)` 으로 수정

### MODERATE

**M1 — Dockerfile Code Disposition Matrix 추가**
- Fix: Dockerfile `수정` 항목 추가 — fonts-noto-cjk APT 설치 + Puppeteer Chromium 캐시 경로 Docker layer 캐싱

**M2 — D29 PRD Deferred Decisions 테이블 등재**
- Fix: PRD-D8 → D29 해결 내용(3종 인덱스)을 공식 PRD Deferred Decisions 해결 테이블에 추가

**M3 — send_email Code Disposition Matrix 추가**
- Fix: `send_email 수정` 항목 추가 — NFR-I4 MIME multipart 지원 검증 + `save_report(pdf_email)` 선행 조건 명시

**M4 — mcp-manager.ts SpawnFn 주입 인터페이스 명시**
- Fix: 파일 구조에 SpawnFn 타입 정의 포함 (`type SpawnFn = (cmd, args, env) => ChildProcess`) — bun:test에서 mock spawn 주입 가능 명시

### MINOR

**N1 — Puppeteer 검증 명령어 ESM 수정**
- Problem: `bun -e "const p = require('puppeteer')..."` — Bun ESM 컨텍스트에서 실패
- Fix: `bun --eval "import puppeteer from 'puppeteer'; ..."` 로 수정

---

## Round 2 Fixes — critic-a 신규 이슈 (3개 추가)

**S2 (getDB audit calls):**
- insertCredential(data, userId), updateCredential(keyName, encryptedValue, userId) 파라미터 확장
- createdByUserId/updatedByUserId 인라인 audit 자동 기록
- 삭제 감사: route 레벨 pre-delete audit 호출 패턴 명시

**M-a (db_schema_change 복잡도 불일치):**
- Project Context Analysis에 M-a 주석 추가: PRD frontmatter 4개 → Architecture 실제 6개 설명
- 복잡도 5/5 재평가 가능 명시

**M-b (agent_mcp_access cross-company isolation 테스트):**
- agent_mcp_access 테이블 주석에 TEA 필수 테스트 케이스 3개 명시
- cross-tenant 격리 검증 시나리오 구체화

---

## DB Table Count Update

- Phase 1 신규 테이블: **6개** (credentials, mcp_server_configs, agent_mcp_access, reports, tool_call_events, mcp_lifecycle_events)
- Phase 2 사전 정의: content_calendar
- Total 신규 파일: **30개**
