# Story 12.5: SNS 통신국 UI

Status: done

## Story

As a CEO/관리자,
I want SNS 통신국 전체 UI를 사용하여 콘텐츠 관리, 예약 발행 큐, 카드뉴스 시리즈, 미디어 갤러리, 승인 플로우를 통합 관리할 수 있기를,
so that Hootsuite/Buffer 수준의 멀티 플랫폼 SNS 발행을 하나의 화면에서 효율적으로 운영할 수 있다.

## Acceptance Criteria

1. **탭 기반 통합 UI**: 기존 SNS 페이지를 탭 기반으로 리팩터링 -- 콘텐츠(기존), 발행 큐, 카드뉴스, 통계, 계정 5개 탭
2. **발행 큐 탭**: 예약된/대기중/완료/실패 콘텐츠를 상태별 필터로 조회, 큐 통계 카드(총 예약/오늘 발행/실패 건수), 배치 선택+일괄 예약/취소
3. **카드뉴스 탭**: 시리즈 목록 (썸네일 그리드), 시리즈 생성 폼 (수동: 카드 추가/삭제/순서변경, AI: 주제+플랫폼+장수 입력), 카드 프리뷰 캐러셀
4. **카드뉴스 상세**: 개별 카드 편집 (이미지URL, 캡션, 레이아웃 선택), 시리즈 승인 플로우 (submit→approve/reject), 플랫폼별 발행 미리보기
5. **승인 스테퍼**: 콘텐츠 상세에서 현재 상태를 시각적 스텝으로 표시 (draft→pending→approved→scheduled→published), 각 스텝에 타임스탬프+액터
6. **미디어 갤러리**: 이미지가 있는 콘텐츠를 그리드 형태로 표시, 플랫폼 필터, 상태 배지
7. **캘린더 뷰 (선택)**: 예약된 콘텐츠를 날짜 기반으로 시각화 (월/주 뷰)
8. **반응형**: 모바일에서 탭이 가로 스크롤, 카드 그리드가 1열로 변환

## Tasks / Subtasks

- [x] Task 1: 탭 기반 레이아웃 리팩터링 (AC: #1)
  - [x]1.1 기존 SnsPage의 view 상태를 탭 네비게이션으로 변환
  - [x]1.2 탭: 콘텐츠 | 발행 큐 | 카드뉴스 | 통계 | 계정
  - [x]1.3 URL 해시 또는 쿼리 파라미터로 탭 상태 유지

- [x] Task 2: 발행 큐 탭 구현 (AC: #2)
  - [x]2.1 GET /workspace/sns/queue 호출하여 큐 목록 표시
  - [x]2.2 GET /workspace/sns/queue/stats 호출하여 통계 카드 (총 예약/오늘/실패)
  - [x]2.3 상태별 필터 (scheduled/publishing/published/failed)
  - [x]2.4 체크박스 다중 선택 + 배치 예약(POST /sns/batch-schedule), 배치 취소(POST /sns/batch-cancel)
  - [x]2.5 우선순위 표시 + 다음 발행 예정 시간 하이라이트

- [x] Task 3: 카드뉴스 시리즈 탭 구현 (AC: #3)
  - [x]3.1 시리즈 목록: isCardNews=true 콘텐츠 필터, 썸네일 그리드 레이아웃
  - [x]3.2 수동 생성 모달: 제목, 설명, 카드 추가/삭제 UI, 드래그 순서 변경
  - [x]3.3 AI 생성 모달: 주제+플랫폼+장수 입력 → POST /sns/card-series/generate
  - [x]3.4 시리즈 카드 캐러셀 프리뷰 (좌우 스와이프)

- [x] Task 4: 카드뉴스 상세 뷰 (AC: #4)
  - [x]4.1 GET /sns/card-series/:id 호출하여 모든 카드 표시
  - [x]4.2 개별 카드 편집: PUT /sns/card-series/:id/cards/:index
  - [x]4.3 레이아웃 선택 (cover/content/closing)
  - [x]4.4 시리즈 승인 버튼: submit, approve, reject
  - [x]4.5 시리즈 삭제: DELETE /sns/card-series/:id (draft만)

- [x] Task 5: 승인 스테퍼 컴포넌트 (AC: #5)
  - [x]5.1 StatusStepper 컴포넌트: draft→pending→approved→scheduled→published 단계
  - [x]5.2 현재 단계 하이라이트, 완료 단계 체크마크, 실패 상태 빨간색
  - [x]5.3 각 단계에 타임스탬프 (createdAt, reviewedAt, scheduledAt, publishedAt)
  - [x]5.4 기존 콘텐츠 상세(detail 뷰)와 카드뉴스 상세에 통합

- [x] Task 6: 미디어 갤러리 섹션 (AC: #6)
  - [x]6.1 콘텐츠 탭에 리스트/갤러리 뷰 토글 추가
  - [x]6.2 갤러리 뷰: imageUrl이 있는 콘텐츠를 3~4열 그리드로 표시
  - [x]6.3 플랫폼 아이콘 배지 + 상태 배지 오버레이
  - [x]6.4 클릭 시 상세 뷰로 이동

- [x] Task 7: 콘텐츠 탭 개선 + 통합 (AC: #1, #5, #8)
  - [x]7.1 기존 list/create/detail 뷰를 콘텐츠 탭 안으로 리팩터링
  - [x]7.2 detail 뷰에 승인 스테퍼 통합
  - [x]7.3 모바일 반응형: 탭 가로 스크롤, 카드 1열

## Dev Notes

### 기존 구현 현황 (확장 대상)

**현재 packages/app/src/pages/sns.tsx (910줄):**
- 5개 view 상태: list, create, detail, stats, accounts
- 콘텐츠 CRUD: 수동 생성, AI 생성, 이미지 생성
- 승인 플로우: submit, approve, reject, publish
- A/B 테스트: 변형 생성, 메트릭스 입력, 결과 비교
- 계정 관리: CRUD + credential 저장
- 통계: 상태별/플랫폼별/일별 추이

**Story 12-4에서 추가된 백엔드 API (이번 UI에서 사용):**
- `GET /workspace/sns/queue` — 예약 큐 목록 (status 필터, scheduledAt+priority 정렬)
- `GET /workspace/sns/queue/stats` — 큐 통계 (byStatus, byPlatform, nextScheduled, todayCount)
- `POST /workspace/sns/batch-schedule` — 배치 예약 (ids[] + scheduledAt)
- `POST /workspace/sns/batch-cancel` — 배치 취소 (ids[])
- `POST /workspace/sns/card-series` — 카드뉴스 시리즈 생성
- `GET /workspace/sns/card-series/:id` — 시리즈 상세
- `PUT /workspace/sns/card-series/:id/cards/:index` — 개별 카드 수정
- `DELETE /workspace/sns/card-series/:id` — 시리즈 삭제
- `POST /workspace/sns/card-series/:id/reorder` — 카드 순서 변경
- `POST /workspace/sns/card-series/generate` — AI 카드뉴스 생성
- `POST /workspace/sns/card-series/:id/submit` — 시리즈 승인 요청
- `POST /workspace/sns/card-series/:id/approve` — 시리즈 승인
- `POST /workspace/sns/card-series/:id/reject` — 시리즈 반려

### 아키텍처 & 파일 구조

**수정 파일:**
- `packages/app/src/pages/sns.tsx` — 탭 기반으로 리팩터링, 910줄 → 컴포넌트 분리 필수

**신규 파일 (컴포넌트 분리):**
- `packages/app/src/components/sns/sns-tabs.tsx` — 탭 네비게이션 wrapper
- `packages/app/src/components/sns/content-tab.tsx` — 기존 list/create/detail 뷰 이동
- `packages/app/src/components/sns/queue-tab.tsx` — 발행 큐 대시보드
- `packages/app/src/components/sns/card-news-tab.tsx` — 카드뉴스 시리즈 관리
- `packages/app/src/components/sns/card-news-detail.tsx` — 카드뉴스 상세/편집
- `packages/app/src/components/sns/stats-tab.tsx` — 기존 stats 뷰 이동
- `packages/app/src/components/sns/accounts-tab.tsx` — 기존 accounts 뷰 이동
- `packages/app/src/components/sns/status-stepper.tsx` — 승인 스테퍼 공용 컴포넌트
- `packages/app/src/components/sns/media-gallery.tsx` — 미디어 갤러리 그리드

### UI 패턴 (기존 코드에서 따를 것)

**탭 패턴** — 크론기지 (cron-base.tsx), Activity Log (activity-log.tsx) 참고:
```tsx
const [activeTab, setActiveTab] = useState<'content' | 'queue' | 'cardnews' | 'stats' | 'accounts'>('content')
// 탭 버튼은 <button> + 선택 시 border-bottom 또는 bg 변화
```

**API 호출 패턴** — 기존 sns.tsx와 동일:
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
// api.get<{ data: T }>('/workspace/sns/queue')
// api.post<{ data: T }>('/workspace/sns/batch-schedule', payload)
```

**상태 색상 매핑:**
- draft: gray/zinc
- pending: yellow/amber
- approved: blue
- scheduled: indigo/purple
- published: green/emerald
- failed: red
- rejected: red/rose

**플랫폼 아이콘 매핑 (기존 sns.tsx line 60-86):**
```tsx
const PLATFORM_LABELS: Record<string, string> = {
  instagram: '인스타그램', tistory: '티스토리', naver_blog: '네이버 블로그',
  twitter: '트위터', facebook: '페이스북', youtube: '유튜브', ...
}
```

**컴포넌트 임포트 패턴:**
```tsx
import { Select, Textarea } from '@corthex/ui'
// 다른 UI 요소는 TailwindCSS 직접 사용 (프로젝트 컨벤션)
```

### 카드뉴스 시리즈 데이터 구조

```typescript
// 시리즈 루트 콘텐츠 (isCardNews=true, cardIndex=null)
type CardSeriesContent = SnsContent & {
  metadata: {
    cards: Array<{
      index: number
      imageUrl: string
      caption: string
      layout: 'cover' | 'content' | 'closing'
    }>
    totalCards: number
    seriesTitle: string
  }
}

// 큐 통계
type QueueStats = {
  byStatus: { status: string; count: number }[]
  byPlatform: { platform: string; count: number }[]
  nextScheduled: string | null
  todayCount: number
  failedCount: number
}
```

### 이전 스토리 학습 (12-4)

1. **snsContents 확장**: priority, isCardNews, cardSeriesId, cardIndex 필드 추가됨
2. **metadata.cards[] 배열**: 카드뉴스 시리즈의 카드 정보를 metadata jsonb에 저장
3. **API 응답 형식**: `{ success: true, data }` + pagination 일관
4. **isCardNews 필터**: 카드뉴스 시리즈 루트는 `isCardNews=true AND cardIndex IS NULL`
5. **시리즈 상태**: 루트 콘텐츠의 status가 시리즈 전체 상태를 대표
6. **PublishEngine 분기**: isCardNews면 mediaUrls 배열로 전달, 플랫폼별 캐러셀/순열 처리

### UX 사양 요약 (CEO #8 SNS 통신국)

- **UX 영감**: Hootsuite/Buffer — 멀티 플랫폼 콘텐츠 캘린더, 승인 플로우, 예약 발행 큐, 미디어 갤러리
- **핵심 패턴**: 콘텐츠 카드 리스트 + 미디어 갤러리 그리드 + 승인 스테퍼 + 발행 큐
- **데이터 전략**: 폴링 (실시간 WebSocket 불필요)
- **빈 상태**: 모든 빈 상태에 가이드 + CTA 버튼 (예: "첫 콘텐츠를 만들어보세요")
- **톤**: 비개발자 CEO 대상, 한국어 존댓말, 조직 은유 유지

### v1 참고 (SNS 통신국)

v1에서는 `/home/ubuntu/CORTHEX_HQ/src/tools/sns/sns_manager.py`에서 SNS 전체를 관리했고, 프론트엔드는 Streamlit 기반이었음.
v2는 React SPA이므로 v1 UI 직접 참고 불가하나, 기능 범위(5플랫폼 발행, 승인/반려, 예약, 카드뉴스)는 동일하게 구현해야 함.

### 절대 금지

- 910줄 sns.tsx를 더 키우지 말 것 — 반드시 컴포넌트 분리
- stub/mock 데이터 사용 금지 — 실제 API 호출만
- 새로운 API 엔드포인트 만들지 말 것 — 12-1~12-4에서 만든 것만 사용
- @corthex/ui에 없는 컴포넌트를 만들 때 패키지에 추가하지 말 것 — 페이지/컴포넌트 내에서 Tailwind 직접 사용

### Project Structure Notes

- 파일명: kebab-case (sns-tabs.tsx, queue-tab.tsx 등)
- 컴포넌트명: PascalCase (SnsTabs, QueueTab 등)
- 위치: `packages/app/src/components/sns/` 디렉토리
- 라우트: `packages/app/src/pages/sns.tsx`는 탭 wrapper만 담당
- 기존 라우트 설정 변경 불필요 (SnsPage export 유지)

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 12, E12-S5]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - CEO #8 SNS 통신국, Hootsuite/Buffer]
- [Source: _bmad-output/planning-artifacts/prd.md - FR65]
- [Source: _bmad-output/implementation-artifacts/12-4-scheduled-publish-queue-card-news.md - 백엔드 API 전체]
- [Source: packages/app/src/pages/sns.tsx - 기존 910줄 UI]
- [Source: packages/server/src/routes/workspace/sns.ts - 전체 API 엔드포인트]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/src/tools/sns/ - SNS 기능 범위]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build: @corthex/app tsc clean (0 SNS-related errors)
- Tests: 73 new tests, 0 failures

### Completion Notes List

- Task 1: 기존 910줄 SnsPage를 탭 기반으로 완전 리팩터링. @corthex/ui의 Tabs 컴포넌트 사용, URL 쿼리 파라미터(?tab=xxx)로 탭 상태 유지. 5개 탭: 콘텐츠/발행 큐/카드뉴스/통계/계정.
- Task 2: QueueTab 구현 — GET /sns/queue 큐 목록, GET /sns/queue/stats 통계 카드(총 예약/오늘 발행/실패/다음 발행), 상태별 필터(scheduled/publishing/published/failed), 체크박스 다중 선택 + 배치 예약/취소, 우선순위 표시.
- Task 3: CardNewsTab 구현 — 시리즈 목록(썸네일 그리드), 수동 생성(카드 추가/삭제/순서변경), AI 생성(주제+플랫폼+장수+에이전트).
- Task 4: CardNewsDetail 구현 — 카드 캐러셀 프리뷰(좌우 네비게이션+인디케이터), 개별 카드 편집 모달, 레이아웃 선택(cover/content/closing), 시리즈 승인 플로우(submit/approve/reject), 삭제.
- Task 5: StatusStepper 컴포넌트 — 5단계(draft→pending→approved→scheduled→published), 현재 단계 하이라이트, 완료 체크마크, 실패/반려 빨간색 표시, 타임스탬프 표시.
- Task 6: 미디어 갤러리 — 콘텐츠 탭에 리스트/갤러리 뷰 토글, 갤러리는 2~4열 반응형 그리드, 이미지 호버 오버레이(제목+플랫폼), 상태 배지 오버레이.
- Task 7: 콘텐츠 탭에 기존 list/create/detail 뷰 통합, detail에 StatusStepper 적용, 카드뉴스 배지 표시, 모바일 반응형(Tabs overflow-x-auto snap-x).

### File List

- `packages/app/src/pages/sns.tsx` (수정 — 910줄 → 56줄 탭 wrapper)
- `packages/app/src/components/sns/sns-types.ts` (신규 — 공유 타입, 상수)
- `packages/app/src/components/sns/status-stepper.tsx` (신규 — 승인 스테퍼 컴포넌트)
- `packages/app/src/components/sns/content-tab.tsx` (신규 — 콘텐츠 탭: 리스트/생성/상세/갤러리)
- `packages/app/src/components/sns/queue-tab.tsx` (신규 — 발행 큐 탭: 큐 목록/통계/배치 액션)
- `packages/app/src/components/sns/card-news-tab.tsx` (신규 — 카드뉴스 탭: 시리즈 목록/생성)
- `packages/app/src/components/sns/card-news-detail.tsx` (신규 — 카드뉴스 상세: 캐러셀/편집/승인)
- `packages/app/src/components/sns/stats-tab.tsx` (신규 — 통계 탭)
- `packages/app/src/components/sns/accounts-tab.tsx` (신규 — 계정 관리 탭)
- `packages/app/src/__tests__/sns-publishing-ui.test.ts` (신규 — 73개 단위 테스트)
- `packages/app/src/__tests__/sns-publishing-ui-tea.test.ts` (신규 — 53개 TEA 리스크 기반 테스트)
- `_bmad-output/implementation-artifacts/12-5-sns-publishing-ui.md` (수정 — 스토리 파일)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (수정 — 상태 업데이트)
