# Story 3.3: Home Briefing

Status: done

## Story

As a 일반 직원(유저),
I want 홈 화면에서 오늘 날짜, 내 팀 에이전트 현황, 야간작업 결과를 한눈에 보고 싶다,
so that 출근 후 바로 업무 상황을 파악할 수 있다.

## Acceptance Criteria

1. **Given** 홈 페이지 **When** 로그인 후 접속 **Then** "안녕하세요, {이름}님 👋" + 오늘 날짜("2026년 3월 5일 수요일") 표시
2. **Given** 내 회사에 에이전트 배정됨 **When** 홈 렌더링 **Then** 에이전트 정렬: ①비서(⭐) → ②online → working → offline → ③이름 가나다순
3. **Given** 에이전트 8명 초과 **When** 내 팀 카드 **Then** 최대 8명 표시 + "+N명 더 보기" 텍스트
4. **Given** 에이전트 카드 **When** 오프라인 에이전트 **Then** opacity-60 + "채팅 →" 링크 숨김
5. **Given** 비서 에이전트 **When** 에이전트 카드 **Then** ⭐ 뱃지 표시
6. **Given** 에이전트 카드 클릭 **When** 온라인 에이전트 **Then** /chat 페이지로 이동
7. **Given** 홈 페이지 **When** 모바일(md 이하) **Then** 에이전트 그리드 2열, 패딩 p-4

## Tasks / Subtasks

- [x] Task 1: 인사 헤더 날짜 추가 (AC: #1)
  - [x] 오늘 날짜를 한국어 포맷으로 표시 (예: "2026년 3월 5일 수요일")
  - [x] 👋 이모지 추가
- [x] Task 2: 에이전트 정렬 + 8명 제한 (AC: #2, #3)
  - [x] 서버 응답에 isSecretary 포함 확인 후 프론트 정렬 로직 구현
  - [x] secretary → online → working → offline 순, 동일 상태 내 이름 가나다순
  - [x] 8명 초과 시 "+N명 더 보기" 표시
- [x] Task 3: 에이전트 카드 개선 (AC: #4, #5, #6)
  - [x] 비서 에이전트 ⭐ 뱃지 표시
  - [x] 오프라인 에이전트 opacity-60 + "채팅 →" 숨김
  - [x] 온라인 에이전트 클릭 시 /chat 이동 유지
- [x] Task 4: 반응형 그리드 (AC: #7)
  - [x] grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
  - [x] 모바일 패딩 p-4 (기존 p-6 → 모바일은 p-4)
- [x] Task 5: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: 기존 home.tsx 개선

현재 home.tsx는 기본 구조가 있으나 UX 스펙 10.3의 상세 요구사항이 미적용됨.

### 현재 vs 변경

| 항목 | 현재 | 변경 |
|------|------|------|
| 인사 헤더 | "안녕하세요 {name}님" + "오늘도 좋은 하루 되세요" | "안녕하세요, {name}님 👋" + 날짜 |
| 에이전트 정렬 | 서버 순서 그대로 | secretary→online→working→offline→이름순 |
| 에이전트 제한 | 무제한 | 8명 + "+N명 더 보기" |
| 에이전트 카드 | 기본 StatusDot | ⭐비서뱃지 + 오프라인 opacity-60 |
| 그리드 | cols-2 md:cols-3 | cols-2 md:cols-3 lg:cols-4 |
| 빠른 시작 | 3열 카드 | 유지 (UX 스펙에 명시 없으나 유용) |

### 서버 API 확인

`GET /workspace/agents` 응답 필드:
```typescript
{ id, name, role, status, isSecretary, departmentId }
```
→ `isSecretary` 필드가 이미 서버에서 반환됨. 프론트에서 정렬만 구현하면 됨.

### Agent 타입 업데이트 필요

현재 Agent 타입:
```typescript
type Agent = { id: string; name: string; role: string; status: string }
```
→ `isSecretary: boolean` 추가 필요

### 날짜 포맷

```typescript
new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
})
// → "2026년 3월 5일 수요일"
```

### 에이전트 정렬 로직

```typescript
agents.sort((a, b) => {
  // 1. 비서 우선
  if (a.isSecretary !== b.isSecretary) return a.isSecretary ? -1 : 1
  // 2. 상태 순서
  const statusOrder = { online: 0, working: 1, error: 2, offline: 3 }
  const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
  if (statusDiff !== 0) return statusDiff
  // 3. 이름 가나다순
  return a.name.localeCompare(b.name, 'ko')
})
```

### 주의사항

- **"최근 알림" / "최근 대화" 카드는 이 스토리 범위 아님**: 알림 API와 채팅 세션 API는 Epic 4+에서 구현. 현재는 야간작업 알림만
- **빠른 시작 섹션 유지**: UX 스펙에 명시 안 되어 있으나, 현재 유용하므로 삭제하지 않음
- **Agent 타입만 수정**: 서버 API 변경 불필요

### Project Structure Notes

```
packages/app/src/
├── pages/home.tsx    ← 수정 (날짜, 정렬, 8명 제한, 카드 개선, 반응형)
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.3] — 홈 화면 상세 스펙
- [Source: packages/app/src/pages/home.tsx] — 현재 홈 페이지 구현
- [Source: packages/server/src/routes/workspace/agents.ts] — workspace agents API (isSecretary 포함)
- [Source: _bmad-output/implementation-artifacts/3-2-workspace-sidebar.md] — 이전 스토리 참조

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- 인사 헤더: "안녕하세요, {name}님 👋" + 한국어 날짜 포맷 (toLocaleDateString ko-KR)
- sortAgents(): isSecretary → status(online/working/error/offline) → name(localeCompare ko) 정렬
- 8명 제한: MAX_AGENTS=8, slice + "+N명 더 보기" overflow 텍스트
- 에이전트 카드: ⭐비서뱃지, offline opacity-60 + 클릭/채팅링크 비활성, online 클릭→/chat
- 반응형 그리드: cols-2 md:cols-3 lg:cols-4 gap-4, 페이지 패딩 p-4 md:p-6
- Agent 타입에 isSecretary: boolean 추가
- 빌드 3/3 성공, 유닛 테스트 69/69 통과

### File List
- packages/app/src/pages/home.tsx — 날짜, 정렬, 8명 제한, 카드 개선, 반응형
