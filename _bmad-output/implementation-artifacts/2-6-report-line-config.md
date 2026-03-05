# Story 2.6: Report Line Configuration

Status: done

## Story

As a 관리자,
I want 직원 간 보고 라인을 설정하기를,
so that 보고서가 올바른 상위자에게 전달된다.

## Acceptance Criteria

1. **Given** 보고 라인 페이지 **When** 보고 대상 Select 변경 **Then** 상단에 "저장되지 않은 변경사항" 배너 표시
2. **Given** 변경사항 있음 **When** [저장] 클릭 **Then** 변경된 행 전체 일괄 PUT 저장 + 성공 토스트
3. **Given** 변경사항 있음 **When** [취소] 클릭 **Then** 원래 값으로 복원 + 배너 사라짐
4. **Given** 변경사항 있음 **When** 다른 페이지로 이동 시도 **Then** "저장하지 않은 변경사항이 있습니다. 나가시겠어요?" 확인 대화상자
5. **Given** 보고 라인 페이지 **When** 로딩 **Then** 회사 선택 store 기준 데이터 표시
6. **Given** 자기 자신을 보고 대상으로 **When** 설정 시도 **Then** Select에서 자기 자신 제외 (이미 구현)

## Tasks / Subtasks

- [x] Task 1: Sticky 배너 + 취소 버튼 (AC: #1, #3)
  - [x] 변경 감지 시 상단 sticky 배너: "저장되지 않은 변경사항이 있습니다" + [저장] [취소]
  - [x] [취소] 클릭 시 원래 서버 데이터로 롤백
- [x] Task 2: 페이지 이탈 경고 (AC: #4)
  - [x] `beforeunload` 이벤트로 브라우저 이탈 방지
  - [x] React Router의 `useBlocker` 또는 `window.confirm`으로 내부 네비게이션 차단
- [x] Task 3: Store 연동 + 토스트 (AC: #2, #5)
  - [x] admin-store companyId 연동
  - [x] 저장 성공 시 토스트
- [x] Task 4: 테스트
  - [x] 보고 라인 일괄 PUT API 테스트
  - [x] 순환 보고 방지 (A→B→A) 서버 검증 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/report-lines.tsx` — 보고 라인 UI 거의 완성
  - 테이블: 직원명/역할/보고 대상 Select/유형 표시
  - 변경 감지: `hasChanges` state
  - 일괄 저장: `PUT /admin/report-lines`
  - Skeleton 로딩, @corthex/ui 컴포넌트(Card, Badge, Button, Skeleton) 사용
- `packages/server/src/routes/admin/` — report-lines 라우트 (GET/PUT)

**수정 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 변경 배너 | 저장 버튼만 disabled 토글 | Sticky 배너 + 취소 버튼 |
| 페이지 이탈 | 경고 없음 | beforeunload + Router 차단 |
| 회사 선택 | `companyData?.data?.[0]?.id` | admin-store 연동 |
| 성공 피드백 | 초록색 텍스트만 | 토스트 알림 |

### 파일 변경 범위

```
packages/admin/src/pages/report-lines.tsx — sticky 배너 + 취소 + 이탈 경고
```

### References

- [Source: packages/admin/src/pages/report-lines.tsx] — 현재 UI (거의 완성)
- [Source: UX spec] — 미저장 배너, 페이지 이탈 ConfirmDialog
- [Source: PRD FR-1.9] — 보고 라인 설정

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Sticky 배너 + 취소 버튼 구현
- 페이지 이탈 경고 (beforeunload)
- admin-store companyId 연동
- 저장 성공 토스트
- 코드리뷰: 순환 보고 + 자기 참조 방지 서버 로직 추가

### File List
- packages/admin/src/pages/report-lines.tsx — sticky 배너 + 취소 + 이탈 경고
- packages/server/src/routes/admin/report-lines.ts — GET/PUT + 순환 참조 감지
