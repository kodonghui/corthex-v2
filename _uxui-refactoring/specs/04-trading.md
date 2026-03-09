# Trading (전략실) UX/UI 설명서

> 페이지: #04 trading
> 패키지: app
> 경로: /trading
> 작성일: 2026-03-09

---

## 1. 페이지 목적

주식 투자 분석 + 자동매매를 관리하는 **트레이딩 워크스테이션**. 종목 사이드바, 차트 패널, AI 분석 채팅이 3패널로 구성.

**핵심 사용자 시나리오:**
- 관심종목 리스트에서 종목 선택 → 차트 확인
- AI(CIO)와 대화하며 투자 분석 요청
- 종목 비교 모드로 여러 종목 비교
- 포트폴리오/수익률 확인
- 종목 검색 → 관심종목에 추가

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌────────────┬─────────────────────┬────────────────┐
│ StockSidebar│     ChartPanel      │   ChatPanel    │
│ (240px)    │    또는             │   (360px)      │
│            │  ComparisonPanel    │                │
│ 종목 검색   │                     │ AI 분석 채팅   │
│ 관심종목    │  주가 차트           │                │
│ 실시간 가격 │  포트폴리오 요약      │ 입력 + 전송    │
│ 드래그 정렬 │                     │                │
└────────────┴─────────────────────┴────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ StockSidebar (축소)  │
│ max-h-[180px]       │
├─────────────────────┤
│ [차트] [채팅]  ← 탭  │
├─────────────────────┤
│ ChartPanel          │
│ 또는 ChatPanel      │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **3패널 비율**: 고정 비율(240px/1fr/360px)이라 화면 크기에 따라 차트가 너무 좁을 수 있음
2. **종목 사이드바 정보 밀도**: 종목명 + 가격만 표시, 등락률/차트 미니맵 등 추가 정보 부족
3. **차트 패널 기능**: 차트 자체의 시각적 품질 개선 여지
4. **채팅 패널 분리감**: 메인 채팅 페이지와 동일한 컴포넌트인데 여기서의 맥락(투자 분석)이 불명확
5. **비교 모드 진입**: URL 파라미터(?compare)로만 전환, 직관적 UI 버튼 부족
6. **모바일 종목 사이드바**: max-h-[180px]로 제한되어 종목이 많으면 스크롤 불편
7. **빈 상태 미정의**: 관심종목이 없을 때의 온보딩 UX 없음
8. **로딩/에러 상태 미정의**: 시세 데이터 로딩 중 표시 없음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 트레이딩 플랫폼 느낌 (TradingView, Robinhood, 토스증권 참고)
- 숫자/데이터가 핵심이므로 가독성 최우선

### 4.2 레이아웃 개선
- **종목 사이드바**: 미니 차트 + 등락률 추가, 시장 필터 강화
- **차트 패널**: 시각적 품질 향상
- **비교 모드**: 직관적 진입 버튼 추가

### 4.3 인터랙션 개선
- 종목 호버 시 빠른 정보 프리뷰 (데스크톱/태블릿: 마우스 호버 팝오버, 모바일: 종목 카드 탭 시 인라인 확장으로 등락률/미니차트 표시 — long-press는 드래그 정렬과 충돌하므로 사용 금지). 모바일 확장 카드는 accordion 방식: 한 번에 1개만 열림, 다른 종목 탭 시 기존 확장 자동 접힘
- 비교 모드 토글 버튼
- 채팅에서 종목 이름 클릭 시 차트 이동

### 4.4 에러/로딩 상태 개선
- **로딩 상태**: 시세 데이터 로딩 시 skeleton UI (차트 영역 + 종목 리스트)
- **에러 상태**: 시세 API 실패 시 "데이터를 불러올 수 없습니다" + 재시도 버튼
- **자동 갱신 실패**: 60초 갱신 실패 시 종목 가격 옆에 "갱신 실패" 경고 아이콘 + 마지막 갱신 시각 표시. 3회 **연속** 실패 시 상단에 배너 "실시간 시세 연결이 불안정합니다" + 수동 갱신 버튼. 수동 갱신 성공 시 배너 자동 닫힘 + 연속 실패 카운터 리셋
- **채팅 에러**: 연결 실패 시 채팅 패널 내 에러 메시지 + 재연결 버튼
- **빈 상태**: 관심종목 0개일 때 "종목을 검색해서 추가해보세요" 안내 카드
- **검색 결과 0건**: 검색어에 매칭되는 종목이 없을 때 "'{검색어}'에 해당하는 종목이 없습니다" 메시지 표시

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | TradingPage | 전체 레이아웃 조정 | pages/trading.tsx |
| 2 | StockSidebar | 종목 카드 스타일 개선 | components/strategy/stock-sidebar.tsx |
| 3 | ChartPanel | 차트 영역 스타일 개선 | components/strategy/chart-panel.tsx |
| 4 | ChatPanel | 투자 맥락 헤더 강화 | components/strategy/chat-panel.tsx |
| 5 | ComparisonPanel | 비교 뷰 스타일 개선 | components/strategy/comparison-panel.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| mobileTab | useState ('chart' or 'chat') | 모바일 탭 전환 |
| isCompareMode | searchParams.has('compare') | 비교 모드 여부 |
| CenterPanel | ChartPanel or ComparisonPanel | 중앙 패널 동적 전환 |
| isChatOpen | useState (boolean) | 태블릿에서 채팅 슬라이드인 열림/닫힘 제어 |

**하위 컴포넌트 데이터는 각 컴포넌트 내부에서 관리 (변경 없음)**

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 상승 | KR 시장: 빨강 / US 시장: 초록 (시장 필터에 따라 자동 전환) |
| 하락 | KR 시장: 파랑 / US 시장: 빨강 (시장 필터에 따라 자동 전환) |
| 보합 | 회색 |
| 선택된 종목 | 하이라이트 배경 |
| 시장 필터 (KR/US) | 구분 색상 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 3패널 그리드 (240px / 1fr / 360px) |
| **768px~1439px** (Tablet) | 2패널 (사이드바 + 중앙), 채팅은 우측 슬라이드인 패널 (채팅 버튼 클릭으로 열고 닫기, position: fixed, width: 360px, 반투명 backdrop 클릭 또는 ESC 키로 닫기 가능). 채팅 열림 시 차트 영역은 그대로 유지 (채팅이 overlay로 위에 뜸). 종목 변경 시 채팅 컨텍스트는 새 종목으로 자동 갱신 |
| **~375px** (Mobile) | 상단 종목 축소 + 차트/채팅 탭 전환 |

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 6번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 관심종목 리스트 (드래그 정렬, KR/US 필터)
- [x] 실시간 가격 (60초 자동 갱신)
- [x] 주가 차트 모달
- [x] AI(CIO)와 투자 분석 채팅
- [x] 종목 비교 모드
- [x] 포트폴리오 대시보드 (현금, 보유종목, 수익률)
- [x] 자동매매 상태 표시 — v1 6.3 기능. 포트폴리오 요약 영역에 **읽기 전용**으로: 자동매매 ON/OFF 상태 뱃지 + 투자 성향(보수/균형/공격) 뱃지 + 최근 체결 3건 요약 + "전체 보기" 링크(별도 페이지로 이동). 자동매매 설정 변경은 이 페이지에서 하지 않음 (설정 페이지에서 관리). CIO(분석)+VECTOR(실행) 분리 구조는 백엔드 로직이므로 UI에서는 실행 결과만 표시
- [x] 모의거래(Paper Trading) 표시 — v1 6.4 기능. 포트폴리오 영역에 "모의거래 모드" 뱃지 표시. 실제 거래와 모의거래를 시각적으로 명확히 구분 (예: 모의거래 시 배경 색상 차이 또는 "PAPER" 워터마크)

**UI 변경 시 절대 건드리면 안 되는 것:**
- StockSidebar 내부의 종목 데이터 fetch/정렬 로직
- ChartPanel 내부의 차트 데이터 처리
- ChatPanel 내부의 메시지 전송/수신 로직
- ComparisonPanel 내부의 비교 데이터 로직
- URL searchParams 기반 compare 모드 전환

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A trading workstation where the user monitors stocks and discusses investment strategies with AI analysts. Three-panel layout combining a stock watchlist, price charts, and an AI chat for analysis.

User workflow:
1. User browses their watchlist of stocks in the left panel (real-time prices, drag-to-reorder)
2. Clicking a stock opens its chart in the center panel (candlestick/line chart with portfolio summary)
3. In the right panel, user chats with an AI investment analyst about the selected stock
4. User can switch to "comparison mode" to compare multiple stocks side-by-side

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Stock watchlist panel (left, ~240px) — search bar, market filter (KR/US), list of watched stocks with: ticker, name, current price, change %, mini sparkline chart. Drag-to-reorder handles.
2. Chart panel (center, flexible width) — stock price chart (candlestick or line), time period selector, portfolio summary (cash, holdings, total return, auto-trade ON/OFF badge, investment style badge: conservative/balanced/aggressive, last 3 trade executions summary, "PAPER" watermark when in paper trading mode). Clean, data-rich but not overwhelming.
3. AI chat panel (right, ~360px) — conversation with AI analyst about investment strategy. Message thread + input area. Context-aware: shows which stock is being discussed.
4. Compare mode — alternative center panel showing multiple stocks side-by-side with comparison charts.
5. Empty state — when no stock is selected, show a prompt to pick one from the watchlist.
6. Loading state — skeleton while price data loads.
7. Error state — when price data fails to load, show an error message with a retry button.

Design tone — YOU DECIDE:
- This is a financial analysis tool. Think TradingView meets AI chat.
- Professional, data-dense, but not intimidating for non-traders.
- Numbers must be highly readable. Use appropriate colors for gains/losses.
- Light or dark theme — your choice (dark is common in trading apps).

Design priorities:
1. Stock prices and changes must be instantly scannable.
2. The chart must be the visual focal point.
3. The AI chat should feel integrated, not bolted on.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

### 태블릿 버전
```
Tablet version (768x1024) of the same trading page.

IMPORTANT — Tablet app shell context:
- LEFT SIDEBAR for navigation (don't include). TOP HEADER (don't include).
- Content area only (approximately 700px wide).

Tablet-specific:
- Two-panel layout: stock sidebar (200px) + chart/comparison panel (flexible)
- Chat is accessed via a floating action button (bottom-right corner) that opens a slide-in panel from the right (360px wide, position: fixed, full height)
- Slide-in has a close button (X) at top-right and a semi-transparent backdrop
- Comparison mode available via toggle button
- Stock sidebar slightly narrower than desktop

Design tone: Same as desktop. YOU DECIDE.
Resolution: 768x1024, pixel-perfect UI screenshot style.
```

### 모바일 버전
```
Mobile version (375x812) of the same trading page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR for navigation (don't include).
- Compact TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Compact watchlist at top (scrollable, max ~180px height)
- Tab switcher below: "Chart" and "Chat"
- Selected tab fills remaining space
- No comparison mode on mobile

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `trading-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `stock-sidebar` | 종목 사이드바 | 사이드바 영역 |
| `stock-search` | 종목 검색 | 검색 입력 |
| `stock-filter-kr` | KR 필터 | 한국 시장 |
| `stock-filter-us` | US 필터 | 미국 시장 |
| `stock-item` | 종목 항목 | 개별 종목 클릭 |
| `chart-panel` | 차트 패널 | 차트 영역 |
| `chat-panel` | 채팅 패널 | AI 채팅 영역 |
| `compare-panel` | 비교 패널 | 비교 모드 |
| `compare-toggle` | 비교 모드 토글 | 모드 전환 |
| `mobile-tab-chart` | 차트 탭 (모바일) | 탭 전환 |
| `mobile-tab-chat` | 채팅 탭 (모바일) | 탭 전환 |
| `trading-empty-state` | 빈 상태 | 종목 미선택 시 |
| `trading-loading` | 로딩 상태 | 데이터 로딩 중 |
| `trading-error-state` | 에러 상태 | API 실패 시 에러 표시 |
| `stock-add` | 관심종목 추가 버튼 | 검색 결과에서 추가 |
| `chart-period-selector` | 차트 기간 선택 | 기간 변경 |
| `portfolio-summary` | 포트폴리오 요약 | 현금/보유/수익률 표시 |
| `chat-overlay-toggle` | 채팅 오버레이 토글 (태블릿) | 슬라이드인 열기/닫기 |
| `retry-button` | 재시도 버튼 | 에러 시 재시도 |
| `stock-search-results` | 검색 결과 드롭다운 | 검색 결과 목록 표시 |
| `stock-drag-handle` | 드래그 핸들 | 종목 드래그 정렬 |
| `compare-stock-checkbox` | 비교 종목 체크박스 | 비교 모드에서 종목 선택/해제 |
| `auto-trade-status` | 자동매매 상태 뱃지 | ON/OFF 표시 |
| `investment-style-badge` | 투자 성향 뱃지 | 보수/균형/공격 |
| `paper-trading-badge` | 모의거래 모드 뱃지 | PAPER 모드 표시 |
| `recent-trades-summary` | 최근 체결 요약 | 최근 3건 |
| `stock-refresh-warning` | 갱신 실패 경고 | 시세 갱신 실패 배너 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /trading 접속 | `trading-page` 존재 |
| 2 | 종목 사이드바 | 로드 완료 | `stock-sidebar` + 종목 항목 표시 |
| 3 | 종목 선택 | 종목 클릭 | `chart-panel` 차트 표시 |
| 4 | 시장 필터 | KR/US 필터 클릭 | 필터된 종목 목록 |
| 5 | 종목 검색 | 검색어 입력 | 필터된 결과 |
| 6 | 채팅 메시지 | 메시지 입력 + 전송 | AI 응답 표시 |
| 7 | 모바일 탭 | 375px에서 탭 전환 | 차트↔채팅 전환 |
| 8 | 반응형 | 375px 뷰포트 | 모바일 레이아웃 |
| 9 | 에러 상태 | 시세 API 실패 시뮬레이션 | `trading-error-state` + 재시도 버튼 표시 |
| 10 | 빈 상태 | 관심종목 0개 | `trading-empty-state` 안내 카드 표시 |
| 11 | 포트폴리오 | 종목 선택 후 | `portfolio-summary` 현금/보유/수익률 표시 |
| 12 | 차트 기간 | 기간 버튼 클릭 | `chart-period-selector` 차트 갱신 |
| 13 | 비교 모드 | 토글 클릭 | `compare-panel` 표시 + 여러 종목 비교 |
| 14 | 태블릿 채팅 | 768px에서 채팅 버튼 | 슬라이드인 패널 열림/닫힘 |
| 15 | 관심종목 추가 | 검색 → 결과에서 추가 클릭 | `stock-add` 클릭 후 종목 목록에 추가됨 |
| 16 | 드래그 정렬 | 종목 드래그 | 순서 변경 유지 |
