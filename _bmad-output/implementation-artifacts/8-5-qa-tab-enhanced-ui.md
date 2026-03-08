# Story 8.5: QA Tab Enhanced UI

Status: done

## Story

As a CEO/관리자,
I want 통신로그 QA 탭에서 규칙별 검수 상세 결과, 환각 탐지 보고서, 프롬프트 인젝션 알림을 확인한다,
so that 품질 게이트가 어떤 기준으로 에이전트 결과물을 판정했는지 투명하게 파악하고, 환각/보안 위협을 즉시 인지할 수 있다.

## Acceptance Criteria

1. **Given** QA 탭에서 검수 결과 행 클릭 **When** 확장 패널 열림 **Then** 규칙별 상세 결과(규칙명, 카테고리, severity, pass/warn/fail, 메시지) 테이블이 표시된다
2. **Given** 검수 결과에 hallucinationReport 존재 **When** 확장 패널 열림 **Then** 환각 보고서 섹션(총 주장 수, 검증/불일치/미확인 수, verdict, 주장별 상세) 표시
3. **Given** 검수 결과에 inspectionScore 존재 **When** 행 렌더링 **Then** 총점 옆에 시각적 점수 바(프로그레스 바) + 색상 표시 (green/amber/red)
4. **Given** QA 탭 **When** 필터 드롭다운 사용 **Then** 카테고리(completeness/accuracy/safety), 판정(pass/fail), severity(critical/major/minor)로 필터링 가능
5. **Given** 프롬프트 인젝션 차단 발생 **When** QA 탭 조회 **Then** 보안 알림 섹션에서 차단 이력(패턴, severity, 시간) 확인 가능
6. **Given** WebSocket quality 이벤트 수신 **When** 새 검수 완료 **Then** QA 탭이 실시간으로 새 항목 표시 (React Query 캐시 무효화)
7. **Given** 확장 패널 **When** rubricScores 존재 **Then** 루브릭 항목별 점수(1-5) + weight + 피드백 표시
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: QualityReview 타입 확장 + API 응답 확장 (AC: #1, #2, #3, #7)
  - [x] 1.1 `packages/app/src/pages/activity-log.tsx`의 QualityReview 타입에 ruleResults, rubricScores, hallucinationReport, inspectionScore/inspectionMaxScore 추가
  - [x] 1.2 서버 `activity-log-service.ts`의 getQualityReviews()는 이미 scores JSONB 전체를 반환 — 변경 불필요. 프롬프트 인젝션 알림 API 추가 (audit_logs 조회)

- [x] Task 2: QualityTable 확장 — 규칙별 상세 결과 (AC: #1, #3)
  - [x] 2.1 행 렌더링에 inspectionScore/inspectionMaxScore 기반 프로그레스 바 추가 (totalScore/25 → inspectionScore/maxScore)
  - [x] 2.2 확장 패널을 기존 5-항목 그리드에서 탭 기반 상세 뷰로 변경:
    - "규칙별 결과" 탭: ruleResults 배열을 카테고리별 그룹핑하여 테이블 표시
    - "루브릭" 탭: rubricScores 있을 때만 표시, 항목별 1-5 점수 + weight + 피드백
    - "환각 보고서" 탭: hallucinationReport 있을 때만 표시
    - "기존 점수" 탭: 기존 5-항목 점수 (conclusionQuality 등)
  - [x] 2.3 규칙 결과 행: severity 뱃지 (critical=빨강, major=주황, minor=회색) + result 뱃지 (pass=초록, warn=노랑, fail=빨강)

- [x] Task 3: 환각 보고서 UI (AC: #2)
  - [x] 3.1 HallucinationReportPanel 컴포넌트: verdict 뱃지 + 요약 통계 (총/검증/불일치/미확인)
  - [x] 3.2 주장별 상세 리스트: type 아이콘 (number/date/name/url/statistic), value, verified/matched 상태, toolSource, discrepancy

- [x] Task 4: 필터 강화 (AC: #4)
  - [x] 4.1 QA 탭 전용 필터 바: 판정 셀렉트 (전체/PASS/FAIL), severity 셀렉트 (전체/critical/major/minor)
  - [x] 4.2 서버에 필터 파라미터 전달: conclusion은 기존 지원, severity는 클라이언트 필터링 (scores.ruleResults 내 severity 기반)
  - [x] 4.3 카테고리 필터: 클라이언트에서 ruleResults 내 category 기반 필터링

- [x] Task 5: 프롬프트 인젝션 알림 섹션 (AC: #5)
  - [x] 5.1 새 API: GET /api/workspace/activity/security-alerts — audit_logs에서 SECURITY_* 액션 조회 (paginated)
  - [x] 5.2 서버 서비스: activity-log-service.ts에 getSecurityAlerts() 추가
  - [x] 5.3 QA 탭 상단에 "보안 알림" 배너/접이식 섹션: 최근 24시간 인젝션 시도 수 + 최근 10건 리스트

- [x] Task 6: WebSocket 실시간 + 빌드 검증 (AC: #6, #8)
  - [x] 6.1 use-activity-ws.ts에서 'quality' 채널 이벤트 시 activity-quality 쿼리 무효화 (이미 구현됨 — 확인 완료)
  - [x] 6.2 보안 알림도 WebSocket 연동 (security 채널 이벤트 시 security-alerts 쿼리 무효화)
  - [x] 6.3 turbo build 3/3 성공 확인

## Dev Notes

### 기존 데이터 구조 (매우 중요 — 이미 DB에 저장됨)

**qualityReviews.scores JSONB 실제 구조** (`chief-of-staff.ts` line ~425-440):
```typescript
mergedScores = {
  // 레거시 5항목 (P0)
  conclusionQuality: number,
  evidenceSources: number,
  riskAssessment: number,
  formatCompliance: number,
  logicalCoherence: number,
  legacyScores: QualityScores,
  legacyTotalScore: number,
  legacyPassed: boolean,
  // P1 검수 엔진 결과 (이미 저장됨)
  ruleResults?: RuleResult[],           // 규칙별 상세 결과
  inspectionConclusion?: 'pass' | 'fail' | 'warning',
  inspectionScore?: number,
  inspectionMaxScore?: number,
  rubricScores?: RubricScore[],         // 루브릭 평가
  hallucinationReport?: HallucinationReport,  // 환각 보고서
}
```

**RuleResult 타입** (`inspection-engine.ts`):
```typescript
{ ruleId: string, ruleName: string, category: string, severity: Severity,
  result: 'pass' | 'warn' | 'fail', score?: number, message?: string, skipped?: boolean }
```

**RubricScore 타입** (`inspection-engine.ts`):
```typescript
{ id: string, label: string, weight: number, critical: boolean, score: number, feedback: string }
```

**HallucinationReport 타입** (`hallucination-detector.ts`):
```typescript
{ claims: ClaimVerification[], unsourcedClaims: FactualClaim[],
  verdict: 'clean' | 'warning' | 'critical', score: number, details: string,
  totalClaims: number, verifiedClaims: number, mismatchedClaims: number, unsourcedCount: number }
```

**ClaimVerification 타입**:
```typescript
{ claim: FactualClaim, matched: boolean, verified: boolean, toolSource?: string,
  discrepancy?: string, confidence: number, severity: 'critical' | 'minor' | 'none' }
```

### 핵심: 서버 변경 최소화

- `getQualityReviews()`는 이미 `scores` JSONB 전체를 반환 → **프론트엔드만 확장하면 ruleResults, rubricScores, hallucinationReport 모두 표시 가능**
- 프롬프트 인젝션 알림만 새 API 필요 (audit_logs 테이블 조회)

### 프롬프트 인젝션 알림 데이터 소스

**audit_logs 테이블** — `audit-log.ts`에서 보안 액션:
- `SECURITY_INPUT_BLOCKED`: 입력 차단됨
- `SECURITY_OUTPUT_REDACTED`: 출력 필터링됨
- `SECURITY_INJECTION_ATTEMPT`: 인젝션 시도 탐지

액션 상수는 `audit-log.ts`에 정의. 보안 알림 API는 이 액션들로 필터링하여 조회.

### 기존 코드 재사용 (중복 금지)

**activity-log.tsx** (현재 505줄):
- 기존 QualityTable 컴포넌트 확장 — 새 파일 분리 금지
- 기존 StatusBadge, SCORE_LABELS 재사용
- 기존 useActivityWs, buildParams, pagination 로직 그대로 유지

**@corthex/ui 컴포넌트**:
- Badge: variant='success'|'error'|'warning'|'info'|'default' → severity/result 표시
- Tabs: 확장 패널 내 서브탭 사용 가능
- Input, SkeletonTable, EmptyState: 기존대로

**use-activity-ws.ts**:
- 이미 tab별 queryKey 무효화 구현됨
- 'quality' 탭일 때 'activity-quality' 쿼리 무효화

### 파일 구조 (변경/신규)

```
packages/app/src/
├── pages/
│   └── activity-log.tsx         # 수정 — QualityTable 확장, 필터 추가, 보안 알림 섹션
├── hooks/
│   └── use-activity-ws.ts       # 수정 — security 채널 추가 (필요 시)

packages/server/src/
├── services/
│   └── activity-log-service.ts  # 수정 — getSecurityAlerts() 추가
├── routes/workspace/
│   └── activity-tabs.ts         # 수정 — GET /activity/security-alerts 엔드포인트 추가
```

### 코딩 컨벤션 (필수)

- 파일명: kebab-case 소문자
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 컴포넌트명: PascalCase
- 테넌트 격리: companyId 필수 (departmentIds 직원 스코프)
- import 경로 대소문자: git ls-files 기준 실제 케이싱 일치 필수
- 테스트: bun:test (서버), @corthex/ui 스타일 (프론트)

### UI 디자인 가이드라인 (UX Design Spec 기반)

**점수 시각화:**
- 프로그레스 바: inspectionScore/inspectionMaxScore 비율
- 색상: >= 80% 초록, >= 60% 노랑/주황, < 60% 빨강
- 기존 totalScore/25도 유지 (레거시 호환)

**규칙별 결과 테이블:**
| 규칙명 | 카테고리 | severity | 결과 | 메시지 |
- 카테고리별 섹션 구분: completeness / accuracy / safety
- severity 뱃지: critical=빨강 배경, major=주황 배경, minor=회색 배경
- result 뱃지: pass=초록, warn=노랑, fail=빨강

**환각 보고서 패널:**
- 요약 카드: verdict 뱃지 + 4개 통계 숫자 (총/검증/불일치/미확인)
- 주장 리스트: 불일치/미확인만 기본 표시, "전체 보기" 토글

**보안 알림:**
- QA 탭 최상단에 경고 배너 (차단 건수가 있을 때만 표시)
- 접이식: "최근 24시간 N건 차단" → 클릭 시 상세 리스트

### 이전 스토리 교훈

- **8-1**: YAML 파서 + Zod 검증 패턴 확립
- **8-2**: InspectionEngine — ruleResults, rubricScores 구조 확립. chief-of-staff.ts에 통합하여 mergedScores로 DB 저장
- **8-3**: HallucinationDetector — ClaimVerification, HallucinationReport 구조 확립. 한국어 단위 지원
- **8-4**: PromptGuard — 감사 로그에 SECURITY_* 액션으로 기록. middleware/prompt-guard.ts
- **6-4**: ActivityLog 4탭 UI — 현재 QualityTable의 기반. 확장 패널 패턴 (expandedId 토글)
- **공통**: Badge 컴포넌트 variant 패턴, 페이지네이션, 날짜 필터, 검색 패턴이 모두 확립됨

### v1 코드 참고

- v1 feature spec의 "Quality gate: auto-review + rework" — v2에서는 yaml 규칙 + LLM 하이브리드로 강화
- v1에서 QA 탭은 단순 통과/반려 표시 — v2에서 규칙별 상세, 환각 보고서, 보안 알림으로 대폭 강화

### 기술 스택

- React + Vite (CEO 앱)
- @tanstack/react-query (데이터 페칭)
- zustand (필요시 — 현재 activity-store.ts)
- @corthex/ui (공유 컴포넌트)
- Tailwind CSS (스타일링)
- Hono (서버 API)
- Drizzle ORM (DB 쿼리)
- bun:test (테스트)

### Project Structure Notes

- `packages/app/src/pages/activity-log.tsx` — CEO 앱 통신로그 페이지 (현재 505줄)
- `packages/app/src/hooks/use-activity-ws.ts` — WebSocket 훅 (60줄)
- `packages/server/src/services/activity-log-service.ts` — 4탭 데이터 서비스 (376줄)
- `packages/server/src/routes/workspace/activity-tabs.ts` — 4탭 API 라우트 (90줄)
- `packages/server/src/services/audit-log.ts` — 감사 로그 서비스 (보안 액션 포함)
- `packages/server/src/db/schema.ts` — qualityReviews 테이블 (line 773-788)

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FR52 QA 탭 검수 결과 확인]
- [Source: _bmad-output/planning-artifacts/epics.md#E8-S5 QA 탭 강화 UI]
- [Source: packages/server/src/services/inspection-engine.ts — InspectionResult, RuleResult 타입]
- [Source: packages/server/src/services/hallucination-detector.ts — HallucinationReport 타입]
- [Source: packages/server/src/services/chief-of-staff.ts#line425-440 — mergedScores 저장 구조]
- [Source: packages/app/src/pages/activity-log.tsx — 기존 QualityTable 컴포넌트]
- [Source: packages/server/src/services/audit-log.ts — SECURITY_* 액션 상수]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — QA 탭 UX]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 8 acceptance criteria met
- Server: getSecurityAlerts() + getSecurityAlertCount24h() added to activity-log-service.ts
- Server: GET /activity/security-alerts endpoint added to activity-tabs.ts with parallel Promise.all fetch
- Frontend: activity-log.tsx rewritten (~900 lines) with enhanced QA tab:
  - MergedScores types (RuleResult, RubricScore, HallucinationReport, ClaimVerification)
  - Score visualization with progress bars + color coding (green/amber/red)
  - 4 sub-tab detail panel: 규칙별 결과, 루브릭, 환각 보고서, 기존 점수
  - Security alert banner (collapsible, 24h count + recent 10 items)
  - Conclusion filter (전체/PASS/FAIL) for QA tab
- WebSocket: quality channel already invalidates activity-quality query (confirmed)
- Build: 3/3 packages pass (server, app, admin)
- Tests: 104+ new tests across 2 test files (app + server)
- TEA test regression fixed: activity-tabs-tea.test.ts updated from 4→5 GET handlers

### File List

- `packages/app/src/pages/activity-log.tsx` — QA 탭 강화 (타입, 시각화, 상세 패널, 필터, 보안 알림)
- `packages/server/src/services/activity-log-service.ts` — getSecurityAlerts(), getSecurityAlertCount24h() 추가
- `packages/server/src/routes/workspace/activity-tabs.ts` — GET /activity/security-alerts 엔드포인트
- `packages/app/src/__tests__/qa-tab-enhanced.test.ts` — 프론트엔드 TEA 테스트 (55+ tests)
- `packages/server/src/__tests__/unit/qa-tab-enhanced.test.ts` — 서버 TEA 테스트 (49+ tests)
- `packages/server/src/__tests__/unit/activity-tabs-tea.test.ts` — 기존 TEA 테스트 수정 (4→5 GET handlers)
