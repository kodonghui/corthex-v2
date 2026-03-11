# Story 5.2: 비서 Soul 템플릿 작성

Status: done

## Story

As a 비서 에이전트,
I want 사용자 명령을 분석하여 적절한 부서/에이전트에 위임하는 Soul을,
so that 하드코딩 없이 자연어로 라우팅이 동작한다.

## Acceptance Criteria

1. 비서 Soul 마크다운 (~2,000자) 작성 — `packages/server/src/lib/soul-templates.ts`에 `SECRETARY_SOUL_TEMPLATE` 상수 추가
2. 역할 정의: 명령 분류, 부서 라우팅, 결과 종합, CEO 눈높이 보고
3. `{{agent_list}}` 변수로 가용 에이전트 자동 주입 (soul-renderer.ts가 치환)
4. `{{department_name}}` 변수로 부서 정보 자동 주입
5. call_agent 도구 사용 지시: "분석이 필요하면 해당 전문가에게 call_agent으로 위임"
6. 종합 보고 지시: "여러 에이전트 결과를 CEO가 이해하기 쉽게 종합"
7. QA 검수 지시 (v1 spec #19): 결론/근거/리스크/형식/논리 5항목
8. v1 비서실장 기능 재현: 자동 분류 → 부서 배분 → 병렬 위임 → 종합
9. `BUILTIN_SOUL_TEMPLATES` 배열에 비서 템플릿 항목 추가 (category: 'secretary', tier: 'secretary')

## Tasks / Subtasks

- [x] Task 1: SECRETARY_SOUL_TEMPLATE 상수 작성 (AC: #1~#8)
  - [x] 1.1 역할 섹션: 비서실장 정체성, CEO 보좌, 명령 분류 책임
  - [x] 1.2 조직 컨텍스트: `{{agent_list}}`, `{{department_name}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{owner_name}}`, `{{specialty}}` 변수 활용
  - [x] 1.3 라우팅 로직: 메시지 분석 → 적합 에이전트 판단 → call_agent 호출
  - [x] 1.4 종합 보고: 다수 에이전트 결과 통합 → CEO 눈높이 보고서
  - [x] 1.5 QA 게이트: 5항목(결론/근거/리스크/형식/논리) 자체 검수
  - [x] 1.6 ~2,000자 이내 유지 (토큰 효율)

- [x] Task 2: BUILTIN_SOUL_TEMPLATES 배열 업데이트 (AC: #9)
  - [x] 2.1 비서 항목 추가: name, description, content, category='secretary', tier='secretary'

- [x] Task 3: 단위 테스트 (soul-renderer 기존 패턴 확장)
  - [x] 3.1 SECRETARY_SOUL_TEMPLATE에 6개 변수 전부 포함 확인
  - [x] 3.2 renderSoul로 비서 Soul 치환 시 모든 변수 정상 대체 확인
  - [x] 3.3 빈 에이전트 목록에서도 graceful 동작 확인

- [x] Task 4: tsc --noEmit 통과 확인

## Dev Notes

### 핵심 구현 방향

이 스토리는 **코드 로직이 아니라 Soul 프롬프트 작성**이 핵심이다. `soul-templates.ts` 파일에 `SECRETARY_SOUL_TEMPLATE` 문자열 상수를 추가하고, `BUILTIN_SOUL_TEMPLATES` 배열에 등록하는 것이 전부다. 복잡한 로직은 없으나, Soul 내용이 v1 비서실장의 모든 기능을 재현해야 하므로 **프롬프트 품질**이 핵심이다.

### v1 비서실장 기능 (반드시 재현)

v1 `chief-of-staff.ts`의 `process_command()` 흐름:
```
CEO 명령 입력
  → 비서실장 AI가 명령 분류 (어느 부서?)
    → 해당 팀장(Manager)에게 call_agent 위임
      → 팀장이 부하에게 재위임 (call_agent 재귀)
    → 비서실장이 최종 정리 (CEO 눈높이로)
```

v2에서는 이 흐름을 **하드코딩이 아닌 Soul 프롬프트**로 재현한다:
- `call_agent` 도구를 사용하여 적합한 에이전트에게 위임
- Soul이 "누구에게 위임할지"를 자율 판단
- `{{agent_list}}`에서 가용 에이전트 정보를 받아 라우팅 결정

### CEO 아이디어 반영

- **#010**: 비서실장 = 편집장 → QA 5항목(결론/근거/리스크/형식/논리) 검수
- **#007**: 처장 = 5번째 분석가 → 매니저에게 이미 적용됨, 비서는 종합 역할

### soul-renderer.ts 치환 메커니즘 (E4)

`renderSoul(soulTemplate, agentId, companyId)` 함수가 6개 변수를 치환:
- `{{agent_list}}` — 회사 내 전체 에이전트 목록 `이름(역할)` 형식
- `{{subordinate_list}}` — 이 에이전트에게 reportTo하는 부하 목록
- `{{tool_list}}` — 이 에이전트에게 할당된 도구 목록 `이름: 설명` 형식
- `{{department_name}}` — 소속 부서명
- `{{owner_name}}` — 소유 사용자명
- `{{specialty}}` — agent.role 필드

치환 규칙:
- `{{변수명}}` 이중 중괄호만 사용
- 미등록 변수 → 빈 문자열 대체 (에러 아님)
- 사용자 입력 직접 삽입 절대 금지 (prompt injection 방지)

### 기존 MANAGER_SOUL_TEMPLATE 패턴 참고

```typescript
// packages/server/src/lib/soul-templates.ts
export const MANAGER_SOUL_TEMPLATE = `# {{specialty}} — {{department_name}}
## 역할
당신은 {{department_name}} 매니저입니다. ...
## 팀 구성
### 부하 에이전트
{{subordinate_list}}
### 사용 가능 도구
{{tool_list}}
## 작업 방법론
...`
```

비서 Soul도 동일 패턴 따르되, 비서 고유 섹션(라우팅, QA 게이트, 종합 보고) 추가.

### call_agent 도구 사양

비서 Soul에서 `call_agent`을 참조할 때 알아야 할 사항:
- 입력: `{ targetAgentId: string, message: string, priority?: string }`
- 깊이 제한: `ctx.maxDepth` (기본 3) — 비서(depth 0) → 매니저(depth 1) → 전문가(depth 2) 가능
- 순환 감지: 이미 방문한 에이전트 재호출 차단
- Phase 1: 순차 실행만 (Promise.all 병렬은 Phase 2+)

### hub.ts와의 관계

`hub.ts` POST `/stream` 핸들러가:
1. 비서 에이전트를 secretary fallback으로 찾음 (`allAgents.find(a => a.isSecretary)`)
2. `renderSoul(targetAgent.soul, targetAgent.id, companyId)` 호출
3. `runAgent({ ctx, soul, message })` 실행

→ 비서의 `soul` 필드에 이 SECRETARY_SOUL_TEMPLATE이 저장됨.
→ 시드 스크립트 또는 관리자 UI에서 비서 에이전트 생성 시 이 템플릿이 사용됨.

### Project Structure Notes

- 수정 대상: `packages/server/src/lib/soul-templates.ts` (SECRETARY_SOUL_TEMPLATE + BUILTIN 배열 항목 추가)
- 테스트 수정: `packages/server/src/__tests__/unit/soul-renderer.test.ts` (비서 Soul 치환 테스트 추가)
- 변경 없음: `packages/server/src/engine/soul-renderer.ts` (6개 변수 이미 충분)
- 변경 없음: `packages/server/src/routes/workspace/hub.ts` (이미 비서 Soul 렌더링 구현됨)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2] — AC 원본
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#1.2] — 명령 처리 흐름
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#19] — 품질 관리 QA 5항목
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#22 #010] — 비서실장=편집장
- [Source: _bmad-output/planning-artifacts/architecture.md#E4] — Soul 템플릿 변수 규칙
- [Source: packages/server/src/lib/soul-templates.ts] — MANAGER_SOUL_TEMPLATE 패턴
- [Source: packages/server/src/engine/soul-renderer.ts] — 6개 변수 치환 로직
- [Source: packages/server/src/routes/workspace/hub.ts] — 비서 fallback + renderSoul 호출
- [Source: packages/server/src/tool-handlers/builtins/call-agent.ts] — 핸드오프 도구 사양

### Library/Framework Requirements

- 추가 의존성 없음 (순수 문자열 상수 + 기존 배열 확장)
- TypeScript `as const` 패턴 유지

### Testing Requirements

- bun:test
- 기존 `soul-renderer.test.ts` 확장 (새 테스트 케이스 추가)
- SECRETARY_SOUL_TEMPLATE이 6개 변수를 모두 포함하는지 정적 확인
- renderSoul로 비서 Soul 치환 후 변수가 정상 대체되는지 동적 확인

### Previous Story Intelligence (5.1)

- Story 5.1: `ownerUserId` 컬럼 + `is_secretary` unique partial index + 비서 삭제 방지 완료
- `packages/server/src/db/schema.ts` — agents 테이블에 `ownerUserId` 추가됨
- `packages/server/src/lib/error-codes.ts` — `ORG_SECRETARY_DELETE_DENIED` 추가됨
- `packages/server/src/services/organization.ts` — 비서 삭제 방지 로직 추가됨
- 마이그레이션: `0047_secretary-owner-fields.sql`
- 패턴: 기존 코드 분석 후 최소 변경, tsc 통과 필수

### Git Intelligence

최근 커밋:
- `5e36932 chore(uxui): clean up failed redesign artifacts`
- 이전 Epic 4 커밋 패턴: `feat: Story X.Y title — N tests + details`
- 커밋 시: `feat: Story 5.2 비서 Soul 템플릿 — secretary soul template + tests`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Initial SECRETARY_SOUL_TEMPLATE missing {{specialty}} variable — fixed by adding to header and role section

### Completion Notes List

- AC#1: SECRETARY_SOUL_TEMPLATE ~1,900 chars written in soul-templates.ts
- AC#2: 4-step flow: 명령 분류 → 에이전트 위임 → 결과 종합 → 품질 검수
- AC#3: {{agent_list}} variable included in "가용 에이전트" section
- AC#4: {{department_name}} variable in header and role section
- AC#5: call_agent delegation instructions in step 2 with detailed guidance
- AC#6: CEO-level synthesis instructions in step 3
- AC#7: QA 5-item gate (결론/근거/리스크/형식/논리) in step 4 with rework instruction
- AC#8: v1 flow reproduced: auto-classify → dept routing → delegation → synthesis
- AC#9: BUILTIN_SOUL_TEMPLATES entry added (category='secretary', tier='secretary')
- Tests: 10 new tests added (21 total in soul-renderer.test.ts), all pass
- tsc --noEmit: clean
- Regression: 86 tests across 3 files, 0 failures

### Change Log

- 2026-03-11: Story 5.2 구현 완료 — SECRETARY_SOUL_TEMPLATE + BUILTIN entry + 10 tests

### File List

- packages/server/src/lib/soul-templates.ts (modified — SECRETARY_SOUL_TEMPLATE + BUILTIN entry 추가)
- packages/server/src/__tests__/unit/soul-renderer.test.ts (modified — 10개 비서 Soul 테스트 추가)
