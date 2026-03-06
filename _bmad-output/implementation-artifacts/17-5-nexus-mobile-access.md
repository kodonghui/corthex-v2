# Story 17.5: NEXUS 모바일 접근

Status: done

## Story

As a 모바일 기기를 사용하는 일반 유저,
I want NEXUS 조직도와 워크플로우를 모바일에서도 편하게 사용,
so that 이동 중에도 조직도 확인, 에이전트 정보 조회, 워크플로우 목록/편집을 할 수 있다.

## Acceptance Criteria

1. **Given** 모바일 화면(< 768px) **When** `/nexus` 조직도 탭 접근 **Then** React Flow 캔버스가 터치 팬/줌으로 동작하고 MiniMap 숨김 처리 (화면 작아서 불필요)
2. **Given** 모바일에서 에이전트 노드 탭 **When** NexusInfoPanel 표시 **Then** 고정 사이드바 대신 하단 슬라이드업 패널(모바일 시트) 형태로 표시, 외부 클릭/Esc/하단 스와이프로 닫기
3. **Given** 모바일에서 부서 노드 탭 **When** 하이라이트 동작 **Then** 기존과 동일하게 opacity 0.3 적용 (터치 탭으로 토글)
4. **Given** 모바일 화면 **When** 워크플로우 탭 접근 **Then** WorkflowListPanel 카드가 `grid-cols-1`로 세로 배치 (이미 반응형 적용됨 — 검증만)
5. **Given** 모바일에서 워크플로우 편집 **When** WorkflowEditor 진입 **Then** 툴바 버튼들이 모바일에서 줄바꿈되어 표시 + 캔버스 터치 드래그/줌 동작
6. **Given** 모바일에서 WorkflowEditor 툴바 **When** 화면 너비 부족 **Then** 핵심 버튼(목록/저장/실행)만 1줄 표시, 나머지(노드추가/실행기록/템플릿/삭제)는 더보기(...) 드롭다운 메뉴로 접기
7. **Given** 모바일 NEXUS 헤더 **When** 조직도/워크플로우 탭 표시 **Then** 탭이 가로 꽉 차게 배치 (flex-1 적용)
8. **Given** PWA 모드(홈 화면 추가) **When** 오프라인 상태에서 `/nexus` 접근 **Then** Service Worker 캐시된 앱 셸 표시 + 데이터 로딩 시 "네트워크 연결을 확인하세요" 메시지
9. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건

## Tasks / Subtasks

- [x] Task 1: nexus.tsx — 모바일 반응형 헤더/탭 (AC: #7)
  - [x] 탭 버튼에 `flex-1 text-center` 추가 (모바일에서 탭 균등 배분)
  - [x] 모바일에서 "NEXUS" 제목 텍스트 크기 축소 (`text-base sm:text-lg`)

- [x] Task 2: nexus.tsx — 조직도 캔버스 모바일 최적화 (AC: #1, #3)
  - [x] MiniMap에 `hidden md:block` 클래스 추가 (모바일 숨김)
  - [x] ReactFlow에 터치 속성 이미 있음 확인 (`panOnScroll`, `zoomOnPinch`) — 검증만
  - [x] Controls 컴포넌트 모바일에서도 표시 (줌 +/- 필요)

- [x] Task 3: NexusInfoPanel — 모바일 하단 슬라이드업 시트 (AC: #2)
  - [x] 모바일(< md): 하단 고정 패널 (`fixed bottom-0 inset-x-0 z-40 max-h-[60vh]`) + 백드롭 오버레이
  - [x] 데스크톱(>= md): 기존 우측 사이드바 유지 (`w-72 border-l`)
  - [x] 모바일 패널 상단 드래그 핸들 바 (회색 가로바)
  - [x] 외부 클릭(백드롭) 시 닫기

- [x] Task 4: WorkflowEditor — 모바일 툴바 최적화 (AC: #5, #6)
  - [x] 핵심 버튼 그룹: `← 목록`, `저장`, `실행` — 항상 표시
  - [x] 보조 버튼 그룹: `+ 노드`, `실행 기록`, `템플릿 공유/해제`, `삭제` — 모바일에서 `...` 더보기 드롭다운
  - [x] 드롭다운: 상대 위치 + 외부 클릭 닫기 (`useRef` + 클릭 이벤트)
  - [x] 워크플로우 이름 `truncate max-w-[120px] sm:max-w-none`

- [x] Task 5: WorkflowListPanel — 모바일 검증 (AC: #4)
  - [x] 이미 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` 적용됨 — 검증만
  - [x] 생성 모달 `w-96` → `w-[90vw] max-w-96` 으로 모바일 대응
  - [x] 상단 필터/생성 버튼 영역 모바일 줄바꿈 (`flex-wrap`)

- [x] Task 6: 빌드 검증 (AC: #9)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### 현재 상태 분석 (Story 17-4 완료 후)

1. **NEXUS 페이지 구조** (`packages/app/src/pages/nexus.tsx`)
   - 조직도/워크플로우 2탭 구조, React Flow 캔버스, 에이전트 정보 패널
   - 모바일 반응형 처리 **전혀 없음** — 전부 데스크톱 기준 고정 레이아웃
   - MiniMap: 항상 표시 (모바일에서 캔버스 가림)
   - NexusInfoPanel: 우측 고정 사이드바 `w-72` (모바일에서 캔버스 절반 차지)

2. **WorkflowEditor** (`packages/app/src/components/nexus/WorkflowEditor.tsx`)
   - 툴바: 8개 버튼 한 줄 나열 (`flex-wrap` 있지만 버튼 많아 모바일에서 복잡)
   - 캔버스: ReactFlow 터치 동작 기본 지원 (별도 설정 불필요)

3. **WorkflowListPanel** (`packages/app/src/components/nexus/WorkflowListPanel.tsx`)
   - 카드 그리드: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` **이미 반응형**
   - 생성 모달: `w-96` 고정 (모바일 화면 넘침)

4. **기존 모바일 패턴 참고** (messenger.tsx — Epic 16-5)
   - `showChat` 상태로 모바일 뷰 전환
   - `hidden md:block` / `hidden md:flex` 패턴
   - `md:hidden` 뒤로가기 버튼
   - `[-webkit-overflow-scrolling:touch]` 터치 스크롤

5. **PWA 인프라** (Epic 16-5)
   - Service Worker (`sw.js`) 이미 설치됨
   - manifest.json 이미 설정
   - 캐시 전략 이미 동작 — NEXUS 라우트도 자동 포함

### 구현 설계

```
nexus.tsx 변경:
├─ 헤더: 탭 버튼 flex-1 + 모바일 텍스트 축소
├─ MiniMap: hidden md:block (모바일 숨김)
└─ NexusInfoPanel 래퍼: 모바일 하단시트 vs 데스크톱 사이드바

NexusInfoPanel.tsx 변경:
├─ 모바일: fixed bottom-0 inset-x-0 z-40 + 백드롭 + 드래그핸들
├─ 데스크톱: 기존 w-72 border-l 유지
└─ 반응형 전환: md: 브레이크포인트

WorkflowEditor.tsx 변경:
├─ 핵심 버튼: 항상 표시 (← 목록, 저장, 실행)
├─ 보조 버튼: md:inline-flex / hidden md:... 또는 더보기 드롭다운
└─ 워크플로우 이름 truncate 강화

WorkflowListPanel.tsx 변경:
├─ 모달: w-96 → w-[90vw] max-w-96
└─ 상단 flex-wrap
```

### 기존 패턴 재사용

1. **모바일 뷰 전환 패턴** → messenger.tsx의 `hidden md:block` / `hidden md:flex`
2. **하단 시트 패턴** → fixed bottom-0 + backdrop (새로 추가, 프로젝트 내 첫 사용)
3. **드롭다운 메뉴 패턴** → 외부 클릭 닫기 (useRef + useEffect)
4. **반응형 그리드 패턴** → 이미 WorkflowListPanel에 적용된 패턴
5. **터치 스크롤 패턴** → `[-webkit-overflow-scrolling:touch]`
6. **모바일 truncate 패턴** → `max-w-[Npx] sm:max-w-none`

### 변경 최소화 원칙

- DB/API 변경: **없음** (순수 프론트엔드 모바일 반응형)
- 새 파일 생성: **없음** (기존 파일 수정만)
- 라이브러리 추가: **없음** (Tailwind CSS 반응형 유틸리티만 사용)
- React Flow 터치: **이미 지원됨** (`zoomOnPinch`, `panOnScroll` 속성)

### Project Structure Notes

```
packages/app/
  src/
    pages/nexus.tsx                           <- 헤더/탭 반응형 + MiniMap 숨김 + 패널 모바일 분기
    components/nexus/
      NexusInfoPanel.tsx                      <- 모바일 하단 시트 + 데스크톱 사이드바 분기
      WorkflowEditor.tsx                      <- 모바일 툴바 더보기 드롭다운
      WorkflowListPanel.tsx                   <- 모달 너비 + flex-wrap
```

### References

- [Source: packages/app/src/pages/nexus.tsx] — NEXUS 메인 페이지 (조직도/워크플로우 탭)
- [Source: packages/app/src/components/nexus/NexusInfoPanel.tsx] — 에이전트 정보 패널
- [Source: packages/app/src/components/nexus/WorkflowEditor.tsx] — 워크플로우 편집 캔버스
- [Source: packages/app/src/components/nexus/WorkflowListPanel.tsx] — 워크플로우 목록
- [Source: packages/app/src/pages/messenger.tsx:985] — 모바일 반응형 패턴 참고 (`hidden md:block`)
- [Source: packages/app/src/components/settings/soul-editor.tsx:189-213] — 모바일 탭 전환 패턴
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1553] — "모바일: 읽기 전용만. 터치 팬/줌 허용. 노드 탭 → 슬라이드오버"
- [Source: _bmad-output/implementation-artifacts/epic-16-retro-2026-03-06.md:128] — "PWA 인프라(16-5): Service Worker 캐시/오프라인이 NEXUS 모바일(17-5)에도 적용"
- [Source: _bmad-output/implementation-artifacts/17-4-nexus-template-share.md] — 이전 스토리 완료 내역

### Previous Story Intelligence (17-4)

- 서버 API 변경: filter 쿼리 + clone API + updateSchema isTemplate — **이번 스토리에서 서버 변경 없음**
- WorkflowListPanel: 탭 필터 + 카드 복제 버튼 + 템플릿 뱃지 추가됨 — 이번에 모바일 최적화만
- WorkflowEditor: 툴바에 템플릿 공유/해제 버튼 추가됨 — 이번에 모바일 드롭다운 필요
- turbo build 8/8 success, 2161+ unit tests

### Git Intelligence

Recent commits:
- `2381ebc` feat: Story 17-4 NEXUS 템플릿 공유 — 복제 API + 템플릿 탭 + 공유 토글 + TEA 50건
- `b2a8eca` feat: Story 17-3 워크플로우 편집 + 실행 — CRUD API + 에디터 UI + 실행 이력 + TEA 110건
- `f917a50` feat: Story 17-2 NEXUS 캔버스 베이스 — 통합 그래프 API + 읽기전용 뷰 + 정보 패널 + TEA 106건
- `ea58da7` feat: Story 17-1 P4 DB 스키마 — nexusWorkflows + nexusExecutions + mcpServers + WS nexus 채널 + TEA 121건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: nexus.tsx 헤더 반응형 — 탭 flex-1 균등배분 + NEXUS 제목 text-base sm:text-lg
- Task 2: nexus.tsx 캔버스 — MiniMap hidden md:block (모바일 숨김) + 터치 속성 검증 (panOnScroll/zoomOnPinch)
- Task 3: NexusInfoPanel — 모바일 하단 슬라이드업 시트(fixed bottom-0 + backdrop + animate-slide-up) + 데스크톱 사이드바 유지(hidden md:block w-72)
- Task 4: WorkflowEditor — 모바일 더보기 드롭다운(···) + 핵심 버튼(저장/실행) 항상 표시 + 보조 버튼 hidden md:flex + 외부 클릭 닫기 + MiniMap 모바일 숨김
- Task 5: WorkflowListPanel — 생성 모달 w-[90vw] max-w-96 + 상단 flex-wrap + 반응형 그리드 검증
- Task 6: turbo build type-check 8/8 success, 26 new unit tests pass

### File List

- packages/app/src/pages/nexus.tsx (수정 — 헤더 반응형 + MiniMap 모바일 숨김)
- packages/app/src/components/nexus/NexusInfoPanel.tsx (수정 — 모바일 하단 시트 + 데스크톱 사이드바 분기)
- packages/app/src/components/nexus/WorkflowEditor.tsx (수정 — 모바일 더보기 드롭다운 + MiniMap 숨김)
- packages/app/src/components/nexus/WorkflowListPanel.tsx (수정 — 모달 너비 + flex-wrap)
- packages/app/src/index.css (수정 — slide-up 키프레임 + animate-slide-up 정의)
- packages/server/src/__tests__/unit/nexus-mobile-access.test.ts (신규 — 26 tests)
