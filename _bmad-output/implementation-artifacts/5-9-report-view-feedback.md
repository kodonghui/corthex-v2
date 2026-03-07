# Story 5.9: 보고서 뷰 + 피드백 (Report View + Feedback)

Status: done

## Story

As a **CEO (앱 사용자)**,
I want **AI가 생성한 보고서를 마크다운으로 깔끔하게 렌더링하고, 품질 뱃지(PASS/FAIL)와 비용 요약을 함께 보며, thumbs up/down으로 피드백할 수 있는 기능**,
so that **보고서 품질을 직관적으로 파악하고, 피드백으로 AI 결과물의 만족도를 기록할 수 있다**.

## Acceptance Criteria

1. **마크다운 보고서 렌더링**: 명령 결과(commands.result)를 마크다운으로 렌더링
   - headers, lists, tables, code blocks, bold/italic, blockquote 지원
   - 결론/분석/리스크/추천 4개 섹션 하이라이트 (배경색 구분)
   - 기존 `MarkdownRenderer` 컴포넌트 재사용 + 섹션 하이라이트 확장

2. **품질 게이트 뱃지**: commands.metadata.qualityGate 데이터 기반
   - PASS = 초록 뱃지 + 점수(예: "PASS 18/25")
   - FAIL = 빨강 뱃지 + 점수
   - WARNING = 노랑 뱃지 (warningFlag=true일 때)
   - 뱃지 클릭 시 5항목 상세 스코어 팝오버 (conclusionClarity, evidenceSufficiency, riskMention, formatAdequacy, logicalConsistency)

3. **비용 요약**: 해당 명령에서 사용된 토큰 수 + 비용 합계 표시
   - API: GET /api/workspace/commands/:id/cost -> cost_records에서 commandId 기반 집계
   - 표시: 입력 토큰 + 출력 토큰 + 비용($)

4. **thumbs up/down 피드백** (FR18)
   - 각 보고서에 thumbs up/down 버튼 2개
   - API: PATCH /api/workspace/commands/:id/feedback `{ rating: 'up' | 'down', comment?: string }`
   - 서버: commands.metadata에 feedback 필드 추가 저장 (jsonb merge)
   - 이미 피드백한 경우 선택된 상태 표시 + 변경 가능

5. **보고서 상세 모달**: 보고서 클릭 시 전체 화면 모달
   - 위임 체인 시각화: 어떤 에이전트가 참여했는지 (orchestration_tasks 조회)
   - 에이전트별 소요 시간
   - 품질 게이트 상세 (5항목 스코어카드)
   - 재작업 이력 (attemptNumber > 1일 때)

## Tasks / Subtasks

- [x] Task 1: 피드백 API 엔드포인트 (AC: #4)
  - [x] 1.1 PATCH /api/workspace/commands/:id/feedback 라우트 추가 (commands.ts)
  - [x] 1.2 Zod 스키마: `{ rating: z.enum(['up', 'down']), comment: z.string().optional() }`
  - [x] 1.3 commands.metadata jsonb에 feedback 필드 merge 업데이트
  - [x] 1.4 companyId + userId 권한 확인

- [x] Task 2: 비용 집계 API 엔드포인트 (AC: #3)
  - [x] 2.1 GET /api/workspace/commands/:id/cost 라우트 추가 (commands.ts)
  - [x] 2.2 orchestration_tasks.commandId -> agentIds -> cost_records 시간 윈도우 집계
  - [x] 2.3 응답: `{ inputTokens, outputTokens, totalCostUsd }`

- [x] Task 3: 위임 체인 조회 API (AC: #5)
  - [x] 3.1 GET /api/workspace/commands/:id/delegation 라우트 추가
  - [x] 3.2 orchestration_tasks + agents 테이블 JOIN으로 에이전트 이름/역할/소요시간 반환
  - [x] 3.3 quality_reviews 테이블에서 해당 commandId의 검수 결과 포함

- [x] Task 4: ReportView 컴포넌트 (AC: #1, #2)
  - [x] 4.1 `packages/app/src/components/chat/report-view.tsx` 생성
  - [x] 4.2 기존 MarkdownRenderer 재사용 + 섹션 하이라이트 래퍼
  - [x] 4.3 QualityBadge 서브컴포넌트 (PASS/FAIL/WARNING 뱃지 + 팝오버)
  - [x] 4.4 CostSummary 서브컴포넌트 (토큰 + 비용 표시)
  - [x] 4.5 FeedbackButtons 서브컴포넌트 (thumbs up/down + 선택 상태)

- [x] Task 5: ReportDetailModal 컴포넌트 (AC: #5)
  - [x] 5.1 `packages/app/src/components/chat/report-detail-modal.tsx` 생성
  - [x] 5.2 위임 체인 시각화 (에이전트 이름 + 역할 + 소요시간 타임라인)
  - [x] 5.3 품질 게이트 상세 스코어카드 (5항목 막대)
  - [x] 5.4 재작업 이력 표시 (시도 횟수 + 결과)

- [x] Task 6: command-center/index.tsx에 ReportView 통합 (AC: all)
  - [x] 6.1 ReportPanel에 ReportView 컴포넌트 적용 (섹션 하이라이트 + 품질 뱃지 + 피드백)
  - [x] 6.2 보고서 클릭 시 ReportDetailModal 열기
  - [x] 6.3 피드백 버튼 클릭 시 API 호출 + UI 업데이트
  - [x] 6.4 Tabs API 수정 (id->value, activeId->value 기존 버그 수정)

- [x] Task 7: 단위 테스트 (AC: all)
  - [x] 7.1 피드백 스키마 + 메타데이터 머지 테스트 (8건)
  - [x] 7.2 비용 계산 + 응답 구조 테스트 (3건)
  - [x] 7.3 품질 뱃지 로직 테스트 (4건)
  - [x] 7.4 위임 체인 응답 구조 테스트 (3건)
  - [x] 7.5 섹션 감지 로직 테스트 (5건)
  - [x] 7.6 비용 변환 테스트 (3건)

## Dev Notes

### 기존 코드 재사용 (반드시 확인)

**1. MarkdownRenderer** (`packages/app/src/components/markdown-renderer.tsx`):
- ReactMarkdown 기반, Tailwind 스타일링 완료
- headers, lists, code, blockquote, strong, links 지원
- **확장 방법**: 이 컴포넌트를 import하여 래핑. 섹션 하이라이트는 result 텍스트 전처리로 구현 (## 결론, ## 분석 등의 섹션을 감지하여 div 래퍼 추가)

**2. commands 테이블 스키마** (`packages/server/src/db/schema.ts:718`):
- `result: text('result')` — 보고서 마크다운 텍스트
- `metadata: jsonb('metadata')` — qualityGate, classification 저장됨
- metadata 구조 (chief-of-staff.ts:648-667):
  ```
  {
    qualityGate: { passed: boolean, totalScore: number, attemptNumber: number, warningFlag: boolean },
    classification: { departmentId, managerId, confidence }
  }
  ```
- feedback 추가 시 metadata jsonb merge: `{ ...existing, feedback: { rating, comment, updatedAt } }`

**3. commands.ts 라우트** (`packages/server/src/routes/commands.ts`):
- 이미 POST /, GET /, GET /:id 존재
- authMiddleware 적용됨 — tenant에서 companyId, userId 추출
- HTTPError import 완료
- 새 엔드포인트를 기존 파일에 추가

**4. cost_records 테이블** (`packages/server/src/db/schema.ts:472`):
- `costUsdMicro: integer` — 1 = $0.000001
- `inputTokens, outputTokens: integer`
- **주의**: cost_records에 commandId 컬럼이 없음. source 필드('delegation' 등)와 sessionId로 연결
- 비용 집계 전략: orchestration_tasks에서 commandId로 taskId 목록 -> 각 task의 agentId 기반 집계, 또는 metadata에 commandId 포함

**5. orchestration_tasks 테이블** (`packages/server/src/db/schema.ts:737`):
- commandId 필드 있음 — 위임 체인 조회에 사용
- agentId — 에이전트 정보 JOIN
- type: classify|delegate|execute|synthesize|review
- parentTaskId — 위임 계층 구조

**6. quality_reviews 테이블** (`packages/server/src/db/schema.ts:759`):
- commandId 필드 있음
- scores: jsonb `{conclusionClarity, evidenceSufficiency, riskMention, formatAdequacy, logicalConsistency}`
- conclusion: 'pass' | 'fail'
- attemptNumber — 재작업 횟수
- feedback — 재작업 지시 텍스트

**7. chat-area.tsx** (`packages/app/src/components/chat/chat-area.tsx`):
- 이미 useQuery, useMutation, useQueryClient 사용
- api 유틸리티 import됨
- ToolCallCard 등 서브컴포넌트 패턴 확립

**8. v1 피드백 시스템** (`/home/ubuntu/CORTHEX_HQ/src/src/src/src/core/feedback.py`):
- FeedbackEntry: correlation_id, rating("good"/"bad"), comment, agent_id, timestamp
- v2에서는 'up'/'down'으로 단순화, commands.metadata에 저장

### API 응답 형식 (프로젝트 규칙)

```typescript
// 성공
{ success: true, data: { ... } }

// 실패
{ success: false, error: { code: 'ERR_CODE', message: '...' } }
```

### 섹션 하이라이트 구현 전략

보고서 result 텍스트에서 결론/분석/리스크/추천 섹션을 감지:
- `## 결론` 또는 `## 종합 결론` -> 파란 배경
- `## 분석` 또는 `## 상세 분석` -> 회색 배경
- `## 리스크` 또는 `## 위험 요소` -> 주황 배경
- `## 추천` 또는 `## 권고 사항` -> 초록 배경
- 정규식으로 섹션 분할 후 각 섹션을 색상 div로 래핑

### 테스트 프레임워크

- bun:test (서버 단위 테스트)
- 테스트 파일 위치: `packages/server/src/__tests__/unit/`
- 파일명: `report-feedback-api.test.ts`
- 기존 패턴 참고: `packages/server/src/__tests__/unit/chief-of-staff.test.ts`

### Project Structure Notes

- 새 파일:
  - `packages/app/src/components/chat/report-view.tsx` — ReportView + QualityBadge + CostSummary + FeedbackButtons
  - `packages/app/src/components/chat/report-detail-modal.tsx` — 상세 모달
  - `packages/server/src/__tests__/unit/report-feedback-api.test.ts` — API 테스트
- 수정 파일:
  - `packages/server/src/routes/commands.ts` — 3개 엔드포인트 추가
  - `packages/app/src/components/chat/chat-area.tsx` — ReportView 통합

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E5-S9] 보고서 뷰 + 피드백 AC
- [Source: _bmad-output/planning-artifacts/epics.md#E5-S4] Manager 종합 + 품질 검수 (보고서 생성원)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#DP2] 위임 투명성 원칙
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#DP5] 비용 가시성 원칙
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#243] 품질 게이트 투명성 — 보고서에 통과/반려 뱃지 + 5항목 스코어
- [Source: packages/server/src/services/chief-of-staff.ts:648-667] 명령 완료 시 metadata 저장 구조
- [Source: packages/server/src/db/schema.ts:718] commands 테이블 스키마
- [Source: packages/server/src/db/schema.ts:759] quality_reviews 테이블 스키마
- [Source: packages/app/src/components/markdown-renderer.tsx] 기존 마크다운 렌더러
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/core/feedback.py] v1 피드백 시스템

### Previous Story Intelligence (5-8)

- DelegationTracker 서비스 구현 완료 — 14종 이벤트 타입
- WebSocket 3채널 (command/delegation/tool) 완료
- EventBus → WS 브리지 패턴 확립
- 테스트 패턴: mock EventBus + DelegationTracker 검증
- **이 스토리에서 활용**: 위임 체인 시각화의 실시간 데이터는 5-8에서 구축된 WebSocket 채널로 이미 전송됨. 보고서 상세 모달에서는 DB 기반 이력 조회를 사용

### Git Recent Patterns

- 커밋 메시지 형식: `feat: Story X-Y Title -- 주요변경, N tests`
- 서비스 파일 + 테스트 파일 함께 커밋
- 모든 테스트 통과 확인 후 커밋

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- 3 API endpoints implemented: PATCH feedback, GET cost, GET delegation
- ReportView component: MarkdownRenderer + section highlights (결론/분석/리스크/추천) + QualityBadge + CostSummary + FeedbackButtons
- ReportDetailModal: delegation chain visualization + quality scorecard (5-item bars) + rework history + cost summary
- Command center ReportPanel replaced with ReportView integration + modal trigger
- Tabs API fix (pre-existing bug: id->value, activeId->value)
- Feedback uses jsonb merge to preserve existing metadata (qualityGate, classification)
- Cost aggregation: orchestration_tasks -> agentIds -> cost_records time-window approach (cost_records has no commandId)
- 26 unit tests covering schemas, merge logic, badge logic, section detection, cost conversion
- All 185 related tests pass, app builds successfully

### File List

- packages/server/src/routes/commands.ts (modify — add 3 endpoints: feedback, cost, delegation)
- packages/app/src/components/chat/report-view.tsx (new — ReportView + QualityBadge + CostSummary + FeedbackButtons)
- packages/app/src/components/chat/report-detail-modal.tsx (new — detail modal with delegation chain + quality scores)
- packages/app/src/pages/command-center/index.tsx (modify — ReportPanel uses ReportView, added modal, fixed Tabs API)
- packages/server/src/__tests__/unit/report-feedback-api.test.ts (new — 26 tests)
