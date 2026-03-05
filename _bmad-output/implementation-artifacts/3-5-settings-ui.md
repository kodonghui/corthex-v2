# Story 3.5: Settings UI

Status: done

## Story

As a 일반 직원(유저),
I want 설정 페이지가 탭 구조로 정리되어 API 연동, 텔레그램, 소울 편집 등을 탭으로 분리해서 보고 싶다,
so that 설정 항목이 많아져도 깔끔하게 관리할 수 있다.

## Acceptance Criteria

1. **Given** 설정 페이지 **When** 접속 **Then** 상단 탭 바 표시: [API 연동] [텔레그램] [소울 편집] + P2/P3 탭은 "준비 중" 표시
2. **Given** 탭 바 **When** 탭 클릭 **Then** 해당 탭 컨텐츠 표시, URL 쿼리 파라미터(`?tab=api`/`?tab=telegram`/`?tab=soul`) 동기화
3. **Given** URL에 `?tab=soul` **When** 페이지 로드 **Then** 소울 편집 탭이 활성 상태로 표시
4. **Given** 모바일(md 이하) **When** 탭 5개 이상 **Then** 가로 스크롤(`overflow-x-auto`) + 스냅 스크롤
5. **Given** API 연동 탭 **When** 활성 **Then** 기존 API Key 섹션 + 서비스 연동 안내 표시
6. **Given** 텔레그램 탭 **When** 활성 **Then** 기존 텔레그램 연동 섹션 표시
7. **Given** 소울 편집 탭 **When** 활성 **Then** 기존 에이전트 소울 편집 섹션 표시
8. **Given** P2/P3 탭(파일 관리/매매 설정/알림 설정) **When** 클릭 **Then** "준비 중입니다" placeholder 표시

## Tasks / Subtasks

- [x] Task 1: 탭 네비게이션 컴포넌트 구현 (AC: #1, #4)
  - [x] 탭 목록 정의: api(API 연동), telegram(텔레그램), soul(소울 편집), files(파일 관리), trading(매매 설정), notifications(알림 설정)
  - [x] 활성 탭 스타일: indigo 하단 보더 + 텍스트 색상
  - [x] 모바일 가로 스크롤: `overflow-x-auto` + `scroll-snap-type: x mandatory`
  - [x] P2/P3 탭에 "준비 중" Badge 표시
- [x] Task 2: URL 쿼리 파라미터 동기화 (AC: #2, #3)
  - [x] `useSearchParams`로 `?tab=` 쿼리 읽기/쓰기
  - [x] 기본 탭: `api` (쿼리 없을 때)
  - [x] 탭 클릭 시 URL 업데이트 (navigate 없이 searchParams만 교체)
- [x] Task 3: 기존 섹션 탭별 분리 (AC: #5, #6, #7)
  - [x] API 연동 탭: 기존 API Key 등록/목록 + 서비스 연동 안내 이동
  - [x] 텔레그램 탭: 기존 TelegramSection 이동
  - [x] 소울 편집 탭: 기존 AgentSoulSection 이동
- [x] Task 4: P2/P3 탭 placeholder (AC: #8)
  - [x] "준비 중입니다" 메시지 + 아이콘
- [x] Task 5: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: 기존 settings.tsx를 탭 구조로 리팩터링

현재 settings.tsx는 모든 섹션(API Key, 텔레그램, 소울 편집, 안내)이 세로로 나열. UX 스펙 10.14에 따라 탭으로 분리.

### UX 스펙 10.14 탭 구조

```
[API 연동 (P1)] [텔레그램] [소울 편집] [파일 관리 (P2)] [매매 설정 (P2)] [알림 설정 (P3)]
```

- P1 탭: API 연동 — 이미 Story 3-4에서 구현됨
- 텔레그램, 소울 편집: 기존 코드 있음 (Story 1-x에서 구현)
- P2/P3 탭: placeholder로 표시

### 모바일 탭 처리

```css
overflow-x-auto
scroll-snap-type: x mandatory
각 탭: scroll-snap-align: start; min-width: 100px
```
모바일 탭 라벨 단축: "API"/"텔레"/"소울"/"파일"/"매매"/"알림"

### URL 쿼리 파라미터

```typescript
const [searchParams, setSearchParams] = useSearchParams()
const activeTab = searchParams.get('tab') || 'api'
const setTab = (tab: string) => setSearchParams({ tab })
```

### 탭 정의 구조

```typescript
const TABS = [
  { key: 'api', label: 'API 연동', shortLabel: 'API', enabled: true },
  { key: 'telegram', label: '텔레그램', shortLabel: '텔레', enabled: true },
  { key: 'soul', label: '소울 편집', shortLabel: '소울', enabled: true },
  { key: 'files', label: '파일 관리', shortLabel: '파일', enabled: false },
  { key: 'trading', label: '매매 설정', shortLabel: '매매', enabled: false },
  { key: 'notifications', label: '알림 설정', shortLabel: '알림', enabled: false },
]
```

### 현재 settings.tsx 구조

```
SettingsPage()
├── API Key 관리 섹션 (PROVIDER_FIELDS 동적 폼, Badge, toast)
├── TelegramSection()
├── AgentSoulSection()
└── 서비스 연동 안내 섹션
```

→ 변경 후:
```
SettingsPage()
├── 탭 네비게이션
├── activeTab === 'api' → API Key 관리 + 서비스 연동 안내
├── activeTab === 'telegram' → TelegramSection
├── activeTab === 'soul' → AgentSoulSection
└── 나머지 → placeholder
```

### 주의사항

- **기존 API Key 로직 변경 금지**: Story 3-4에서 완성된 PROVIDER_FIELDS, credentials 객체, toast 알림 등 변경하지 않음
- **TelegramSection, AgentSoulSection 내부 변경 금지**: 기존 로직 유지, 탭으로 이동만
- **useSearchParams**: react-router-dom에서 import. 현재 App.tsx에서 이미 사용 가능
- **'설정' 제목**: 탭 위에 유지

### Project Structure Notes

```
packages/app/src/
├── pages/settings.tsx    ← 수정 (탭 구조 추가, 기존 섹션 탭별 분리)
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.14] — 설정 페이지 탭 구조, 모바일 처리
- [Source: packages/app/src/pages/settings.tsx] — 현재 설정 페이지 (Story 3-4 완료)
- [Source: _bmad-output/implementation-artifacts/3-4-personal-api-key.md] — 이전 스토리 참조

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- TABS 배열: 6개 탭 (api/telegram/soul + files/trading/notifications P2/P3 placeholder)
- 탭 네비게이션: indigo 하단 보더, 모바일 가로 스크롤(scroll-snap), shortLabel 모바일 라벨
- useSearchParams: ?tab= 쿼리 파라미터 동기화, 기본값 'api', replace: true
- ApiKeyTab: 기존 SettingsPage API Key 로직 분리 (PROVIDER_FIELDS, credentials, toast 등 유지)
- TelegramSection, AgentSoulSection: 기존 코드 변경 없이 탭 분리
- PlaceholderTab: "준비 중입니다" + 🚧 아이콘
- P2/P3 disabled 탭: 클릭 불가, "준비 중" 라벨, 회색 텍스트
- 빌드 3/3 성공, 유닛 테스트 69/69 통과

### File List
- packages/app/src/pages/settings.tsx — 탭 구조 추가, ApiKeyTab 분리, PlaceholderTab, useSearchParams 동기화
