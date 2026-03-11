# Story 5.6: @멘션 + 프리셋 시스템

Status: review

## Story

As a CEO,
I want @팀장이름으로 직접 지시하고, 자주 쓰는 명령을 프리셋으로 저장하는 것을,
so that 효율적으로 AI를 지휘할 수 있다.

## Acceptance Criteria

1. @멘션 파싱: `@투자분석팀장 삼성전자 분석` → 비서 우회, 직접 해당 에이전트 (AC: #1)
2. 에이전트 이름/nameEn 정확 일치 매칭 (fuzzy 아님) (AC: #2)
3. 프리셋 CRUD: 단축어→전체 명령 매핑 (DB 저장) (AC: #3)
4. 예: "시황" → "현재 주식시장 시황을 분석해줘" (AC: #4)
5. 프리셋 실행: 단축어 입력 시 자동 확장 + hub.ts SSE 엔진으로 실행 (AC: #5)

## Current State Analysis — CRITICAL

### @멘션: ALREADY IMPLEMENTED ✅
- `packages/server/src/routes/workspace/hub.ts` (line 24-27): `parseMention()` 함수 존재
- 정확 일치: `agent.name === mention.name || agent.nameEn === mention.name` (line 53-54)
- 비서 우회: @mention 매칭 시 secretary fallback 건너뜀 (line 52-58)
- **AC #1, #2 이미 충족** — 추가 구현 불필요

### 프리셋 CRUD: ALREADY IMPLEMENTED ✅ (BUT NEEDS MIGRATION)
- `packages/server/src/routes/workspace/presets.ts`: 전체 CRUD + execute 라우트 존재
- DB 스키마: `packages/server/src/db/schema.ts` (line 978-994) — presets 테이블 존재
- **문제점**: presets.ts가 `db` 직접 import 사용 → E3 패턴(getDB) 위반
- **문제점**: execute 엔드포인트가 `chief-of-staff.ts` 사용 → Phase 2에서 Soul 기반 전환 필요

### 프리셋 실행 via Hub SSE: NOT IMPLEMENTED ❌
- 현재 presets.ts의 execute는 REST 응답 (비동기 fire-and-forget)
- hub.ts의 SSE 스트리밍 엔진을 통하지 않음
- **핵심 과제**: hub.ts에서 프리셋 단축어 감지 → 확장 → SSE 스트리밍 실행

## Tasks / Subtasks

- [x] Task 1: hub.ts 프리셋 단축어 감지 + 확장 (AC: #4, #5)
  - [x] 1.1 hub.ts의 stream 엔드포인트에서 프리셋 매칭 로직 추가
  - [x] 1.2 메시지가 정확히 프리셋 name과 일치 시 → preset.command로 확장
  - [x] 1.3 확장된 명령을 기존 @mention/secretary 파이프라인으로 처리
  - [x] 1.4 sortOrder 증가 (사용 빈도 추적)

- [x] Task 2: presets.ts → getDB(companyId) 마이그레이션 (E3 패턴 준수)
  - [x] 2.1 scoped-query.ts에 presets 메서드 추가
  - [x] 2.2 presets.ts의 모든 `db` 직접 사용을 `getDB(companyId)` 또는 scoped 메서드로 교체
  - [x] 2.3 presets.ts의 execute 엔드포인트 — getDB 마이그레이션 완료 (chief-of-staff.ts 아직 존재하므로 현행 유지)

- [x] Task 3: @멘션 검증 + 에러 메시지 개선 (AC: #1, #2)
  - [x] 3.1 hub.ts parseMention 기존 구현 검증 (이미 동작 확인)
  - [x] 3.2 nameEn 빈 값 처리, 대소문자 정확 일치 확인

- [x] Task 4: 테스트
  - [x] 4.1 프리셋 단축어 감지 + 확장 테스트
  - [x] 4.2 @멘션 기존 테스트 검증 (이미 있음)
  - [x] 4.3 getDB 마이그레이션 후 CRUD 테스트

## Dev Notes

### 핵심 구현: hub.ts 프리셋 감지

hub.ts의 `/stream` 엔드포인트에서 @mention 해석 전에 프리셋 매칭을 수행:

```typescript
// hub.ts — stream 엔드포인트 내, @mention 파싱 전
// 1. 프리셋 매칭: 메시지 전체가 프리셋 name과 일치하면 확장
const matchedPreset = allPresets.find(p => p.name === message.trim())
if (matchedPreset) {
  agentMessage = matchedPreset.command  // 확장된 명령으로 대체
  // sortOrder 증가 (비동기, 응답 차단 안 함)
  // 확장된 명령에 @mention이 있으면 그대로 @mention 파이프라인으로
}
```

**실행 순서 (hub.ts stream):**
1. `requestedAgentId`가 있으면 → 해당 에이전트 직접 사용
2. **프리셋 매칭** → 메시지를 확장된 명령으로 교체
3. `@mention` 파싱 → 에이전트 직접 지정
4. secretary fallback → 비서실장 사용

### presets.ts → getDB 마이그레이션

현재 presets.ts에서 `import { db } from '../../db'`로 직접 쿼리 → E3 위반.

**수정 방향:**
- scoped-query.ts에 preset 메서드 추가:
  ```typescript
  presets: () => db.select().from(presets).where(eq(presets.companyId, companyId)),
  presetsByUser: (userId: string) => db.select().from(presets).where(
    and(eq(presets.companyId, companyId), eq(presets.isActive, true),
    or(eq(presets.userId, userId), eq(presets.isGlobal, true)))
  ),
  insertPreset: (data: Omit<NewPreset, 'companyId'>) =>
    db.insert(presets).values({ ...data, companyId }),
  updatePreset: (id: string, data: Partial<Preset>) =>
    db.update(presets).set(data).where(and(eq(presets.id, id), eq(presets.companyId, companyId))),
  deletePreset: (id: string) =>
    db.delete(presets).where(and(eq(presets.id, id), eq(presets.companyId, companyId))),
  ```

### presets.ts execute 엔드포인트 처리

현재 execute는 `chief-of-staff.ts`를 사용하는데, Story 5.5에서 이미 삭제 대상.
**결정:** execute 엔드포인트는 hub.ts의 SSE 스트리밍으로 대체하거나, 현행 유지하되 import를 확인.

확인 필요: Story 5.5 상태 — chief-of-staff.ts가 아직 존재하는지, 삭제되었는지.
- Sprint status에서 5.5는 아직 backlog → chief-of-staff.ts 아직 존재
- **따라서**: presets.ts execute는 현행 유지 (chief-of-staff.ts 아직 사용 가능)
- hub.ts에서 프리셋 단축어 → SSE 실행이 주 흐름

### v1 참고 (CORTHEX_HQ/)

v1에서 프리셋:
- DB에 name/command 매핑 저장
- 사용자가 프리셋 이름 입력 → command 텍스트로 확장 → 일반 명령처럼 처리
- 카테고리 6종: 일반, 분석, 보고, 전략, 마케팅, 기술
- sortOrder로 사용 빈도 추적 (자주 쓰는 것 상위)
- 슬래시 팝업(/)에서 기본 명령어 + 프리셋 혼합 표시

### Architecture Compliance

| 패턴 | 적용 |
|------|------|
| E3 getDB | presets.ts → scoped-query.ts 마이그레이션 |
| E1 SessionContext | hub.ts 기존 패턴 유지 |
| E5 SSE 이벤트 | hub.ts 기존 6개 이벤트 유지 |
| D6 단일 진입점 | 프리셋 실행도 hub.ts → agent-loop.ts 경유 |
| 파일명 | kebab-case (기존 presets.ts 유지) |
| API 응답 | `{ success: true, data }` / `{ success: false, error }` |

### 기존 파일 목록

| 파일 | 상태 | 변경 내용 |
|------|------|----------|
| `packages/server/src/routes/workspace/hub.ts` | 수정 | 프리셋 단축어 감지 로직 추가 |
| `packages/server/src/routes/workspace/presets.ts` | 수정 | getDB 마이그레이션 |
| `packages/server/src/db/scoped-query.ts` | 수정 | preset 메서드 추가 |
| `packages/server/src/__tests__/unit/preset-crud.test.ts` | 존재 | 기존 테스트 유지/확장 |

### Anti-Patterns (하지 말 것)

- ❌ @멘션 로직 재구현 (이미 hub.ts에 완성됨)
- ❌ 프리셋 CRUD API 재구현 (이미 presets.ts에 완성됨)
- ❌ fuzzy match 추가 (정확 일치만 — AC #2)
- ❌ `db` 직접 import 유지 (E3 위반)
- ❌ 프리셋 실행에 새로운 SSE 이벤트 타입 추가 (기존 6개만 — E5)
- ❌ engine/ 내부 파일 직접 import (E8 — agent-loop.ts + types.ts만)

### Project Structure Notes

- hub.ts: `packages/server/src/routes/workspace/hub.ts` — SSE 스트리밍 진입점
- presets.ts: `packages/server/src/routes/workspace/presets.ts` — 프리셋 REST CRUD
- scoped-query.ts: `packages/server/src/db/scoped-query.ts` — getDB() 멀티테넌시
- schema.ts: `packages/server/src/db/schema.ts` — presets 테이블 (line 978)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#E3, E5, E8, D6]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#1.1 명령 입력 방식]
- [Source: packages/server/src/routes/workspace/hub.ts#parseMention]
- [Source: packages/server/src/routes/workspace/presets.ts#CRUD+execute]
- [Source: packages/server/src/db/schema.ts#presets table]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- @멘션은 이미 hub.ts에 완전 구현됨 — 검증 테스트 7개 추가
- 프리셋 CRUD도 이미 presets.ts에 완전 구현됨 — getDB 마이그레이션 완료
- **신규 구현**: hub.ts에서 프리셋 단축어 감지 + command 확장 (~10줄)
  - 메시지가 프리셋 name과 정확 일치 → preset.command로 확장
  - 확장된 명령은 기존 @mention/secretary 파이프라인으로 처리
  - sortOrder 비동기 증가 (사용 빈도 추적)
- **마이그레이션**: presets.ts의 모든 `db` 직접 사용 → `getDB(companyId)` (E3 패턴 준수)
  - scoped-query.ts에 6개 메서드 추가: presetsByUser, presetById, presetByName, insertPreset, updatePreset, deletePreset, incrementPresetSortOrder
- presets.ts execute 엔드포인트: chief-of-staff.ts 아직 존재하므로 현행 유지 (getDB만 적용)
- tsc --noEmit PASS, 27개 신규 테스트 + 126개 전체 프리셋 테스트 PASS
- 기존 테스트 회귀 0건

### File List

- `packages/server/src/routes/workspace/hub.ts` — 프리셋 단축어 감지 + 확장 로직 추가
- `packages/server/src/routes/workspace/presets.ts` — getDB(companyId) 마이그레이션 (db 직접 import 제거)
- `packages/server/src/db/scoped-query.ts` — preset CRUD 스코프 메서드 7개 추가
- `packages/server/src/__tests__/unit/mention-preset-system.test.ts` — 신규 27개 테스트
