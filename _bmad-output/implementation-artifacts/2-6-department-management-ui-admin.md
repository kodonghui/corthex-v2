# Story 2.6: Department Management UI (Admin)

Status: done

## Story

As a 관리자,
I want 관리자 콘솔에서 부서를 생성/편집/삭제하고 삭제 시 cascade 영향 분석을 확인하기를,
so that 안전하게 조직 구조를 변경할 수 있다.

## Acceptance Criteria

1. **Given** 부서 관리 화면 진입 **When** 페이지 로드 **Then** 부서 목록 테이블 표시 (이름, 에이전트 수, 상태)
2. **Given** "새 부서 만들기" 버튼 클릭 **When** 부서명 입력 + 생성 클릭 **Then** 부서 즉시 생성되고 목록 갱신 + 성공 토스트
3. **Given** 부서 카드에서 "수정" 클릭 **When** 이름/설명 변경 후 저장 **Then** 부서 정보 즉시 반영 + 성공 토스트
4. **Given** 부서 카드에서 "삭제" 클릭 **When** cascade 경고 모달 표시 **Then** 영향 분석 정보 표시 (에이전트 수, 진행 중 작업, 학습 기록, 비용)
5. **Given** cascade 모달에서 모드 선택 **When** "완료 대기" 또는 "강제 종료" 선택 **Then** 해당 모드로 삭제 실행 + 결과 토스트

## Tasks / Subtasks

- [x] Task 1: 부서 목록을 테이블 형태로 리팩터링 (AC: #1)
  - [x] 현재 카드 그리드 -> 테이블 뷰 (이름, 설명, 에이전트 수, 상태)
  - [x] 각 행에 수정/삭제 액션 버튼
  - [x] 빈 상태 시 "새 부서 만들기" CTA 표시

- [x] Task 2: 부서 생성/편집 폼 개선 (AC: #2, #3)
  - [x] 현재 인라인 폼 유지 (이미 동작하는 기능)
  - [x] 폼 유효성 검사 강화 (부서명 필수, 중복 서버 에러 처리)

- [x] Task 3: Cascade 위저드 모달 구현 (AC: #4, #5)
  - [x] 삭제 버튼 클릭 -> cascade-analysis API 호출
  - [x] 영향 분석 결과 표시: 에이전트 수, 진행 중 작업, 학습 기록, 비용
  - [x] 에이전트 목록 (이름, 계급, 시스템 여부) 브레이크다운 표시
  - [x] 모드 선택: "완료 대기 (권장)" / "강제 종료" 라디오 버튼
  - [x] 삭제 확인 버튼 (빨간색)
  - [x] 삭제 실행 -> executeCascade API 호출 -> 결과 토스트 -> 목록 갱신

- [x] Task 4: API 연동 수정 (기존 API 활용)
  - [x] GET /admin/departments -- 목록 (이미 동작)
  - [x] POST /admin/departments -- 생성 (이미 동작)
  - [x] PATCH /admin/departments/:id -- 수정 (이미 동작)
  - [x] GET /admin/departments/:id/cascade-analysis -- 영향 분석 (신규 연동)
  - [x] DELETE /admin/departments/:id?mode=force|wait_completion -- cascade 삭제 (신규 연동)

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/departments.tsx` -- 기본 부서 CRUD 페이지 (카드 그리드 형태)
  - 생성 폼 (인라인), 수정 (인라인 편집), 삭제 (confirm 다이얼로그)
  - react-query 사용 (useQuery, useMutation, useQueryClient)
  - admin-store의 selectedCompanyId 사용
  - toast-store 사용
- `packages/server/src/routes/admin/departments.ts` -- 완전한 REST API
  - GET /departments -- 목록
  - GET /departments/tree -- 트리 뷰 (에이전트 포함)
  - GET /departments/:id -- 단건 조회
  - GET /departments/:id/cascade-analysis -- cascade 영향 분석
  - POST /departments -- 생성
  - PATCH /departments/:id -- 수정
  - DELETE /departments/:id?mode=force|wait_completion -- cascade 삭제
- `packages/server/src/services/organization.ts` -- 비즈니스 로직
  - analyzeCascade() -> CascadeAnalysis 타입 반환
  - executeCascade() -> mode에 따른 삭제 실행

**수정 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 부서 목록 | 카드 그리드 | 테이블 뷰 |
| 삭제 | window.confirm() | cascade 위저드 모달 |
| cascade API | 미연동 | cascade-analysis + mode 선택 삭제 |

### CascadeAnalysis API 응답 구조

```typescript
interface CascadeAnalysis {
  departmentId: string
  departmentName: string
  agentCount: number
  activeTaskCount: number
  totalCostUsdMicro: number  // micro USD (1,000,000 = $1)
  knowledgeCount: number
  agentBreakdown: Array<{
    id: string
    name: string
    tier: 'manager' | 'specialist' | 'worker'
    isSystem: boolean
    activeTaskCount: number
    totalCostUsdMicro: number
  }>
}
```

### 삭제 API

```
DELETE /admin/departments/:id?mode=force|wait_completion
```
- `force`: 즉시 강제 삭제 (진행 중 작업 중단, 에이전트 미배속 전환)
- `wait_completion`: 진행 중 작업 있으면 대기 상태 반환, 없으면 바로 삭제

### 파일 변경 범위

```
packages/admin/src/pages/departments.tsx  -- 테이블 뷰 + cascade 모달 전체 리팩터링
```
서버 코드 변경 없음 -- API가 이미 완전히 구현되어 있음.

### UI 패턴 참고

- 기존 admin 앱 패턴: `packages/admin/src/pages/agents.tsx`, `packages/admin/src/pages/tools.tsx`
- API 유틸: `packages/admin/src/lib/api.ts` -- api.get/post/patch/delete
- 상태: `packages/admin/src/stores/admin-store.ts` -- selectedCompanyId
- 토스트: `packages/admin/src/stores/toast-store.ts` -- addToast({ type, message })
- react-query: useQuery, useMutation, useQueryClient -- 동일 패턴

### UX 디자인 참조 (Admin A2)

- 부서 목록 테이블 (이름, 에이전트 수, 상태)
- 부서 생성/편집 폼
- cascade 위저드 모달 4단계:
  - Step 1: 영향 분석 표시
  - Step 2: 작업 처리 모드 선택 (완료 대기 / 강제 종료)
  - Step 3: 에이전트 처리 확인 (미배속 전환 자동)
  - Step 4: 최종 확인 + 삭제 실행
- 현재 서버 API는 2가지 모드만 지원 (force / wait_completion)이므로 위저드를 간소화:
  - Step 1: 영향 분석 표시 + 에이전트 브레이크다운
  - Step 2: 모드 선택 + 최종 확인 -> 삭제 실행

### 이전 스토리에서 배운 점 (2-5)

- admin-store의 selectedCompanyId를 반드시 사용
- 토스트 알림 패턴: addToast({ type: 'success'|'error', message })
- react-query invalidateQueries 패턴으로 캐시 갱신
- Tailwind CSS 클래스 기반 스타일링 (dark mode 지원)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E2-S6] -- 스토리 요구사항
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Admin-A2] -- UX 디자인
- [Source: packages/server/src/routes/admin/departments.ts] -- 서버 API (변경 불필요)
- [Source: packages/server/src/services/organization.ts#analyzeCascade] -- cascade 분석 로직
- [Source: packages/admin/src/pages/departments.tsx] -- 현재 UI (리팩터링 대상)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- 부서 목록을 카드 그리드에서 테이블 뷰로 리팩터링 (이름, 설명, 에이전트 수, 상태 컬럼)
- 빈 상태 시 "새 부서 만들기" CTA 표시
- 인라인 생성/편집 폼 유지 (grid 레이아웃으로 개선)
- Cascade 위저드 모달 구현: 영향 분석 표시 (에이전트 수, 진행 중 작업, 학습 기록, 비용)
- 에이전트 브레이크다운 표시 (이름, 계급, 시스템 여부, 작업 수)
- 모드 선택 UI (완료 대기 권장 / 강제 종료) 라디오 버튼
- cascade-analysis API 연동 (GET /admin/departments/:id/cascade-analysis)
- cascade 삭제 API 연동 (DELETE /admin/departments/:id?mode=force|wait_completion)
- 37개 단위 테스트 작성 (cascade 분석 표시, 비용 포맷팅, 모드 선택, 폼 검증, API 응답 파싱)
- 53개 TEA 리스크 기반 테스트 추가 (P0/P1/P2 커버리지)
- 코드 리뷰: formatCost/tierLabels를 컴포넌트 외부로 이동, cascadeData 초기화 버그 수정

### File List

- packages/admin/src/pages/departments.tsx -- 테이블 뷰 + cascade 위저드 모달 (전체 리팩터링)
- packages/server/src/__tests__/unit/department-management-ui.test.ts -- 37개 단위 테스트 (신규)
- packages/server/src/__tests__/unit/department-management-ui-tea.test.ts -- 53개 TEA 테스트 (신규)
