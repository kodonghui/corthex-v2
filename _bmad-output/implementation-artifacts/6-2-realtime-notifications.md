# Story 6.2: 실시간 알림 UI — 알림 페이지 + 사이드바 뱃지 + Toast

Status: review

## Story

As a 사용자,
I want 알림 페이지에서 목록을 확인하고 사이드바 뱃지로 미읽음 수를 보며 Toast로 즉시 알림을 받는다,
so that 에이전트 활동을 놓치지 않고 효율적으로 관리할 수 있다.

## Acceptance Criteria

1. **Given** /notifications 페이지 진입 **When** 로드 **Then** [알림 목록] [알림 설정] 2개 탭 표시, 알림 목록 기본 활성
2. **Given** 알림 목록 탭 **When** 알림 데이터 있음 **Then** 날짜 그룹(오늘/어제/날짜별) + 유형 아이콘 + 제목 + 시간 표시
3. **Given** 미확인 알림 **When** 표시 **Then** 좌측 인디고 점 + bg-corthex-accent/5 배경. 클릭 시 읽음 처리 + 액션 링크 이동
4. **Given** [전체]/[미확인만] 필터 **When** 미확인만 클릭 **Then** isRead=false인 알림만 표시
5. **Given** [모두 읽음] 버튼 **When** 클릭 **Then** POST /read-all API 호출 + 모든 알림 읽음 처리
6. **Given** 사이드바 알림 메뉴 **When** 미읽음 > 0 **Then** 🔔 옆에 인디고 뱃지 숫자 표시 (GET /notifications/count 폴링 30초)
7. **Given** WS notifications 채널 구독 **When** 새 알림 도착 **Then** 오늘 그룹 최상단 slide-in + 사이드바 뱃지 +1
8. **Given** 다른 페이지에서 **When** 새 알림 WS 수신 **Then** 우상단 Toast 5초 표시 ("확인하기" 클릭 → /notifications)
9. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [ ] Task 1: 알림 목록 페이지 (AC: #1, #2, #3, #4, #5)
  - [ ] notifications.tsx 전면 교체 (플레이스홀더 → 실제 UI)
  - [ ] Tabs 컴포넌트로 [알림 목록 (N)] [알림 설정] 탭
  - [ ] notification-list.tsx: useQuery GET /notifications + 날짜 그룹 + 무한스크롤
  - [ ] notification-item.tsx: 아이콘 + 제목 + body + 시간 + 미읽음 점 + 클릭 핸들러
  - [ ] [전체]/[미확인만] 토글 + [모두 읽음] 버튼

- [ ] Task 2: 사이드바 알림 뱃지 (AC: #6)
  - [ ] sidebar.tsx에 useQuery GET /notifications/count (30초 refetchInterval)
  - [ ] 알림 항목 옆 인디고 뱃지 (count > 0일 때)

- [ ] Task 3: WS 실시간 알림 수신 (AC: #7)
  - [ ] ws-store에서 notifications 채널 구독
  - [ ] 새 알림 도착 → React Query invalidation + 목록 prepend

- [ ] Task 4: Toast 알림 (AC: #8)
  - [ ] @corthex/ui Toast 컴포넌트 활용 또는 알림 전용 toast 구현
  - [ ] 현재 /notifications 페이지가 아닐 때만 Toast 표시
  - [ ] 5초 자동 닫힘 + "확인하기" 액션 링크

- [ ] Task 5: 빌드 검증 (AC: #9)

## Dev Notes

### 기존 코드 참조

**notification-store.ts (교체 대상):**
- `packages/app/src/stores/notification-store.ts` — 현재 클라이언트 전용 Zustand 스토어
- 6-1에서 서버 API가 생기므로 이 스토어는 React Query로 교체하거나 WS 수신 전용으로 축소

**notifications.tsx (교체 대상):**
- `packages/app/src/pages/notifications.tsx` — 현재 플레이스홀더

**sidebar.tsx:39:**
- `{ to: '/notifications', label: '알림', icon: '🔔' }` — 뱃지 없이 메뉴만 존재

**UX 스펙 참조 (ux-design-specification.md):**
- 1818-1841행: 알림 목록 UI 와이어프레임
- 1842-1852행: 알림 유형별 아이콘/액션 링크 매핑
- 1814행: 실시간 삽입 → 오늘 그룹 최상단 slide-in
- 1840행: Toast → 우상단 top-4 right-4, 5초 자동 닫힘

**ops-log.tsx 패턴 참조:**
- 날짜 그룹 (getDateGroup 함수), WS 실시간 prepend, 스크롤 위치 관리

### 알림 설정 탭은 6-4에서 구현
이 스토리에서 탭 구조만 만들고 "알림 설정" 탭 내용은 placeholder로 둠

### References

- [Source: ux-design-specification.md#1805-1874] — 알림 페이지 전체 스펙
- [Source: packages/app/src/stores/notification-store.ts] — 기존 Zustand 스토어
- [Source: packages/app/src/pages/notifications.tsx] — 플레이스홀더
- [Source: packages/app/src/components/sidebar.tsx:39] — 사이드바 알림 메뉴

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
