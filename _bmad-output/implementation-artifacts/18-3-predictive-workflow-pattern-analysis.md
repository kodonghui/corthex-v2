# Story 18-3: Predictive Workflow Pattern Analysis

## 1. Story Foundation
**Epic:** Epic 18 (Workflow Automation)
**Story ID:** 18-3
**Title:** Predictive Workflow Pattern Analysis
**Status:** ready-for-dev

### User Story
As an intelligent AI assistant, I want to analyze the user's historical chat patterns, tool usage, and repetitive tasks, so that I can proactively suggest creating an automated workflow for them.

### Acceptance Criteria
- [ ] 시스템에 `PatternAnalyzer` 모듈 추가.
- [ ] 주/월 단위 혹은 특정 이벤트 트리거 시 사용자의 최근 대화(chat_messages) 및 도구 호출(tool_calls) 이력을 분석하는 크론(Cron) 작업 혹은 백그라운드 워커 구현.
- [ ] 반복 패턴 감지 시(예: 매일 아침 '어제자 매출 데이터 검색' 후 '보고서 작성' -> '팀원에게 이메일 발송'), 해당 패턴을 워크플로우 템플릿 형태로 변환.
- [ ] 변환된 제안 워크플로우를 보관할 수 있는 스키마(예: `workflow_suggestions` 또는 `workflows` 테이블의 `is_suggestion` 플래그) 설계 및 반영.
- [ ] API를 통해 사용자에게 '추천 워크플로우' 목록을 제공할 수 있어야 함.

### Business Context
The ultimate goal of AI is not just execution, but proactive assistance. By recognizing what users do repeatedly, Corthex can build workflows for them without requiring them to use a complex Builder UI manually. This significantly improves UX and feature adoption.

## 2. Developer Context & Guardrails

### Technical Requirements
- **Log Analysis:** `tool_calls`와 `chat_messages` 테이블 데이터를 시간대, 빈도, 연속성 기준으로 군집화(Clustering)하는 로직 필요. (간단하게는 빈도 기반 Heuristic, 복잡하게는 LLM 판단 위임)
- **LLM Pattern Extraction (Optional/Advanced):** 너무 복잡한 로직 대신, 주기적으로 "최근 N개의 툴 호출 내역"을 LLM 엔진에 던져서 "반복 패턴이 보이면 워크플로우 JSON으로 응답해라" 하는 프롬프트 엔지니어링 수행.
- **Workflow Suggestion API:** `GET /workspace/workflows/suggestions` 엔드포인트 구현.

### Database Schema (Target)
`workflow_suggestions` DB 테이블 추가 (혹은 `workflows`에 플래그 추가):
- `id` (uuid)
- `companyId` (uuid)
- `userId` (uuid) -> 제안 대상자
- `reason` (text) -> "매주 금요일마다 주간 보고서를 작성하는 패턴이 감지되었습니다."
- `suggestedSteps` (jsonb) -> 제안된 스텝 배열
- `status` (enum: 'pending', 'accepted', 'rejected')
- `createdAt`

### Architecture Compliance
- 분석 작업은 매우 무거울 수 있으므로 실시간 트랜잭션에서 분리해야 함. (Epic 11의 Cron Engine 또는 Night Job Worker와 연동 강력 권장).
- 데이터 격리 (Tenant Isolation) 필수. 타사 데이터가 분석에 섞여 들어가지 않도록 쿼리에 `company_id` 강제.

### Testing Requirements
1. `tool_calls` 더미 데이터를 반복적인 패턴으로 삽입한 후, Analyzer 스케줄러를 돌렸을 때 정상적으로 1건의 `workflow_suggestions`가 생성되는지 확인.
2. 생성된 제안을 `accepted` 상태로 변경(수락)하면 실제 `workflows` 테이블에 레코드가 insert 되는지 확인하는 통합 흐름 작성.
