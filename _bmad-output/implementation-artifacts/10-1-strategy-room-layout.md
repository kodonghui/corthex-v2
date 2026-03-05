# Story 10.1: 전략실 레이아웃 — 3패널 반응형 레이아웃 + 종목 검색

Status: review

## Story

As a 일반 직원(유저),
I want 전략실 페이지에서 종목을 검색/선택하고, 차트 영역과 에이전트 채팅 영역을 한 화면에서 볼 수 있다,
so that 투자 전략을 논의하면서 실시간 시세를 동시에 확인할 수 있다.

## Acceptance Criteria

1. **Given** `/trading` 접속 **When** 페이지 로드 **Then** 3패널 레이아웃 표시: 왼쪽(종목 목록), 중앙(차트 영역), 오른쪽(채팅)
2. **Given** 데스크탑(md 이상) **When** 화면 표시 **Then** 3패널이 좌우로 나란히 표시 (좌 240px, 중앙 flex-1, 우 360px)
3. **Given** 모바일(md 미만) **When** 화면 표시 **Then** 탭 전환으로 차트/채팅 전환, 종목 목록은 상단 검색바 + 드롭다운
4. **Given** 종목 검색바 **When** 텍스트 입력 **Then** 종목명/코드로 필터링된 결과 표시 (로컬 검색, 시드 데이터 기반)
5. **Given** 종목 선택 **When** 클릭 **Then** URL 파라미터(`?stock=CODE`) 업데이트 + 중앙 차트 영역에 선택 종목 표시
6. **Given** 차트 영역 **When** 종목 미선택 **Then** 빈 상태 표시: "종목을 선택해주세요"
7. **Given** 차트 영역 **When** 종목 선택됨 **Then** 종목명 + 현재가 placeholder 카드 표시 (실시간 차트는 10-3에서 구현)
8. **Given** 채팅 영역 **When** 표시 **Then** "전략 에이전트와 대화하세요" placeholder 표시 (실제 채팅은 10-2에서 구현)
9. **Given** 전략실 **When** DB 쿼리 **Then** strategy_watchlists 테이블에서 유저별 관심 종목 목록 조회
10. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — strategy_watchlists 테이블 (AC: #9)
  - [x] `packages/server/src/db/schema.ts`에 strategy_watchlists 테이블 추가
    - id (uuid PK), company_id (FK), user_id (FK), stock_code (varchar 20), stock_name (varchar 100), market (varchar 10, 'KOSPI'|'KOSDAQ'), created_at
  - [x] Drizzle 마이그레이션 생성 + 적용
  - [x] seed.ts에 샘플 관심 종목 데이터 추가 (삼성전자, SK하이닉스, NAVER, 카카오, LG에너지솔루션 등 10개)

- [x] Task 2: API — 관심 종목 CRUD (AC: #4, #9)
  - [x] `packages/server/src/routes/workspace/strategy.ts` 생성
  - [x] GET `/workspace/strategy/watchlist` — 유저의 관심 종목 목록 반환
  - [x] POST `/workspace/strategy/watchlist` — 종목 추가 (stock_code, stock_name, market)
  - [x] DELETE `/workspace/strategy/watchlist/:id` — 종목 삭제
  - [x] `workspace/index.ts`에 라우트 등록

- [x] Task 3: 프론트엔드 — 3패널 레이아웃 (AC: #1, #2, #3)
  - [x] `packages/app/src/pages/trading.tsx` 리팩토링 — placeholder → 3패널 레이아웃
  - [x] 데스크탑: `grid grid-cols-[240px_1fr_360px]` 레이아웃
  - [x] 모바일: 상단 종목 검색 + Tabs(차트/채팅) 전환
  - [x] 전체 높이: `h-[calc(100dvh-var(--header-h))]` (사이드바 제외 영역)

- [x] Task 4: 프론트엔드 — StockSidebar 종목 목록 컴포넌트 (AC: #4, #5)
  - [x] `packages/app/src/components/strategy/stock-sidebar.tsx` 생성
  - [x] 상단 검색 Input (종목명/코드 필터링, debounce 300ms)
  - [x] 관심 종목 리스트 (react-query GET watchlist)
  - [x] 종목 클릭 → URL searchParams `?stock=CODE` 업데이트
  - [x] 선택된 종목 하이라이트 (bg-zinc-100 dark:bg-zinc-800)
  - [x] 종목 추가/삭제 버튼 (+ / x)

- [x] Task 5: 프론트엔드 — ChartPanel + ChatPanel placeholder (AC: #6, #7, #8)
  - [x] `packages/app/src/components/strategy/chart-panel.tsx` 생성
    - 종목 미선택: EmptyState "종목을 선택해주세요"
    - 종목 선택: Card에 종목명 + 코드 + "차트 준비 중" placeholder
  - [x] `packages/app/src/components/strategy/chat-panel.tsx` 생성
    - "전략 에이전트와 대화하세요" EmptyState placeholder

- [x] Task 6: 빌드 확인 (AC: #10)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 레이아웃 참조: chat.tsx 패턴
chat.tsx의 2패널(세션 목록 + 채팅) 반응형 패턴을 3패널로 확장:
- 데스크탑: CSS Grid `grid-cols-[240px_1fr_360px]`
- 모바일: 종목 검색은 상단 고정, 본문은 Tabs로 차트/채팅 전환

### DB 테이블 구조
```sql
strategy_watchlists (
  id          uuid PK default gen_random_uuid(),
  company_id  uuid FK → companies(id) NOT NULL,
  user_id     uuid FK → users(id) NOT NULL,
  stock_code  varchar(20) NOT NULL,
  stock_name  varchar(100) NOT NULL,
  market      varchar(10) NOT NULL default 'KOSPI',
  created_at  timestamp default now(),
  UNIQUE(company_id, user_id, stock_code)
)
```

### API 패턴 (Hono + Zod)
workspace/chat.ts 참조. authMiddleware → zValidator → Drizzle ORM 패턴 동일 적용.

### 시드 데이터 종목 예시
| stock_code | stock_name | market |
|------------|------------|--------|
| 005930 | 삼성전자 | KOSPI |
| 000660 | SK하이닉스 | KOSPI |
| 035420 | NAVER | KOSPI |
| 035720 | 카카오 | KOSPI |
| 373220 | LG에너지솔루션 | KOSPI |
| 006400 | 삼성SDI | KOSPI |
| 051910 | LG화학 | KOSPI |
| 068270 | 셀트리온 | KOSPI |
| 207940 | 삼성바이오로직스 | KOSPI |
| 005380 | 현대자동차 | KOSPI |

### 컴포넌트 트리
```
TradingPage
├── StockSidebar (왼쪽 / 모바일: 상단 검색)
│   ├── Input (검색)
│   └── WatchlistItem[] (종목 리스트)
├── ChartPanel (중앙 / 모바일: 탭1)
│   └── EmptyState | StockCard placeholder
└── ChatPanel (오른쪽 / 모바일: 탭2)
    └── EmptyState placeholder
```

### URL 상태 관리
- `?stock=005930` — 선택된 종목 코드
- useSearchParams로 읽기/쓰기 (chat.tsx의 session 파라미터와 동일 패턴)

### 이 스토리에서 하지 않는 것
- 실시간 주가 차트 (10-3)
- 전략 에이전트 채팅 (10-2)
- 전략 메모/노트 (10-4)
- 내보내기 기능 (10-5)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Task 1: strategy_watchlists 테이블 — uuid PK, company_id/user_id FK, stock_code/stock_name/market, UNIQUE constraint, Drizzle migration 0011 생성, seed.ts에 10개 KOSPI 종목 추가
- Task 2: strategy.ts API — GET/POST/DELETE watchlist endpoints, Hono + zValidator + Drizzle ORM, authMiddleware 적용, onConflictDoNothing으로 중복 방지
- Task 3: trading.tsx — 데스크탑 3패널 CSS Grid (240px/1fr/360px), 모바일 Tabs(차트/채팅) + 상단 종목 검색
- Task 4: stock-sidebar.tsx — Input 검색 필터링, react-query watchlist, URL searchParams ?stock=CODE, 선택 하이라이트, x 삭제 버튼
- Task 5: chart-panel.tsx (EmptyState/Card placeholder), chat-panel.tsx (EmptyState placeholder)
- Task 6: turbo build 3/3 성공 (trading 4.63 kB)

### File List

- packages/server/src/db/schema.ts (수정 — strategyWatchlists 테이블 + relations 추가)
- packages/server/src/db/migrations/0011_strategy-watchlists.sql (신규)
- packages/server/src/db/seed.ts (수정 — 10개 관심 종목 시드)
- packages/server/src/routes/workspace/strategy.ts (신규)
- packages/server/src/index.ts (수정 — strategyRoute 등록)
- packages/app/src/pages/trading.tsx (수정 — 3패널 레이아웃)
- packages/app/src/components/strategy/stock-sidebar.tsx (신규)
- packages/app/src/components/strategy/chart-panel.tsx (신규)
- packages/app/src/components/strategy/chat-panel.tsx (신규)
