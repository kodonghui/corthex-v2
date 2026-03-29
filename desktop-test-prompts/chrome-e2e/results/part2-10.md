# Part 2-10: 전략실(Trading) + 메신저 + AGORA 결과

## 테스트 환경
- 일시: 2026-03-30 22:30
- 브라우저: Chrome (claude-in-chrome)
- 해상도: 1529x804
- OS: Windows 11 Home

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | 전략실 페이지 로딩 | PASS | /trading | 2s | 타이틀 "트레이딩 Trading", Market Open 상태, TERMINAL_STABLE_V3.0.4 표시 (ss_73775o30y에서 확인) |
| 2 | 차트/포트폴리오/워치리스트 위젯 확인 | PASS | /trading | 1s | 시세 TICKERS 8개(BTC/USD, ETH/USD, SOL/USD, AAPL, NVDA, TSLA, AMZN, GOOGL), 캔들차트, OHLC 데이터, Financial Metrics(NET PROFIT +12.42%, TOTAL EQUITY $125,847.30), 주문 ORDER 패널(Buy/Sell), Active Strategies 3개 (ss_73775o30y에서 확인) |
| 3 | 타임프레임 필터 클릭 | PASS | /trading | 1s | 1분/5분/15분/1시간/1일/1주 탭 존재. "1시간" 기본 활성. 클릭 시 하이라이트 변경 확인 (ss_0625ecpm2에서 확인) |
| 4 | 스크린샷: trading | PASS | /trading | - | ss_73775o30y (초기), ss_9965foe23 (Line 차트 전환) |
| 5 | 메신저 페이지 로딩 | PASS | /messenger | 2s | "CORTHEX > Messenger" 타이틀, Active Nodes 목록 7개, 메시지 표시 영역, 입력창 (ss_05211725p에서 확인) |
| 6 | 채널 목록 확인 | PASS | /messenger | 1s | 전략팀 Strategy Team(3), 김수호 Suho Kim(1), 보안팀 Security Team, 이다은 Da-eun Lee, 운영팀 Operations, 한예진 Ye-jin Han, 트레이딩팀 Trading — 온라인 상태 표시(녹색 dot) (ss_05211725p에서 확인) |
| 7 | 채널 클릭 → 메시지 목록 확인 | PASS | /messenger | 1s | 전략팀 → 김수호 메시지(3월 시장 분석 리포트 첨부), PDF 파일(시장분석_2026Q1.pdf 2.4MB), ADMIN 응답 메시지. 이다은 채널 전환 시 "NODE IS COMPUTING..." 표시 (ss_05211725p, ss_16582kwkl에서 확인) |
| 8 | 메시지 입력창 확인 | PASS | /messenger | 0.5s | "Type command or message..." placeholder, + 버튼, 이모지, 첨부, 전송 버튼. 하단 "TERMINAL: ACTIVE  LEVEL: 4 CLEARANCE", "Ctrl + Enter to dispatch" (ss_05211725p에서 확인) |
| 9 | 스크린샷: messenger | PASS | /messenger | - | ss_05211725p (Strategy Team), ss_16582kwkl (Da-eun Lee 채널) |
| 10 | AGORA 페이지 로딩 | PASS | /agora | 2s | "Agora Terminal" 타이틀, "Centralized intelligence and internal department discourse" 설명 (ss_8887ublzc에서 확인) |
| 11 | 카드/항목 클릭 → 상세 확인 | FAIL | /agora | 3s | 스레드 카드 클릭 시 상세 페이지로 이동하지 않음. 제목 클릭도 동일. 상세 보기 불가 (ss_08488self에서 확인) |
| 12 | 스크린샷: agora | PASS | /agora | - | ss_8887ublzc (메인), ss_8081vow0j (카테고리 필터) |

## 발견된 버그
### BUG-001: AGORA 스레드 클릭 시 상세 페이지 미이동
- 페이지 URL: https://corthex-hq.com/agora
- 재현 단계: 1. AGORA 페이지 접속 2. 스레드 카드(예: "v3.2 업데이트 관련 의견 수렴") 클릭 3. 스레드 제목 직접 클릭
- 기대 결과: 스레드 상세 페이지로 이동하여 댓글/토론 내용을 볼 수 있어야 함
- 실제 결과: 클릭해도 아무 반응 없음. URL 변경 없음. 상세 내용 확인 불가
- 콘솔 에러: 없음 (콘솔 트래킹 시점 이후 에러 없음)
- 네트워크 에러: 없음
- 스크린샷: ss_08488self (클릭 후 변화 없음)
- 심각도: Major
- 추정 원인: 스레드 카드에 onClick 핸들러 또는 Link가 연결되지 않았을 가능성

### BUG-002: AGORA 카테고리 필터가 스레드 목록을 필터링하지 않음
- 페이지 URL: https://corthex-hq.com/agora
- 재현 단계: 1. AGORA 페이지 접속 2. 카테고리에서 "기술 Tech" 클릭 3. 스레드 목록 확인
- 기대 결과: "기술" 태그의 스레드만 표시되어야 함
- 실제 결과: 카테고리는 하이라이트되지만 스레드 목록은 전체와 동일 (전략 태그 스레드가 그대로 보임)
- 콘솔 에러: 없음
- 스크린샷: ss_8081vow0j (기술 Tech 선택 후에도 전략 태그 스레드 표시)
- 심각도: Minor
- 추정 원인: 카테고리 필터 로직이 UI만 변경하고 실제 필터링을 수행하지 않을 가능성

### BUG-003: Trading 페이지 — 티커 클릭 시 차트가 변경되지 않음
- 페이지 URL: https://corthex-hq.com/trading
- 재현 단계: 1. 전략실 페이지 접속 2. 좌측 시세 TICKERS에서 "ETH/USD" 클릭
- 기대 결과: 차트가 ETH/USD로 변경되어야 함
- 실제 결과: 차트 헤더가 여전히 "BTC/USD 차트" 표시. 가격, OHLC 데이터도 BTC 기준 유지
- 콘솔 에러: 없음
- 스크린샷: ss_6799qaydf (ETH/USD 클릭 후에도 BTC/USD 차트 유지)
- 심각도: Minor
- 추정 원인: 티커 행에 클릭 핸들러가 없거나 차트 데이터 소스 전환 로직 미구현

## UX 탐색 발견사항

1. **Trading — 차트 타입 토글 (Candle/Line/Area)** → /trading → Line 클릭 시 하이라이트 정상 변경 (ss_9965foe23에서 확인). 시각적 피드백 양호
2. **Trading — Buy/Sell 토글** → /trading → Buy(기본) 클릭 시 노란색, Sell 클릭 시 빨간색으로 변경 (ss_9459re7jh에서 확인). 색상 구분 명확
3. **Trading — Active Strategies 섹션** → 스크롤 다운 후 확인 → Alpha-7 Arbitrage (ROI +22.4%, LOW RISK), Beta-V Momentum (ROI +8.1%, MID RISK), Delta-2 Sentiment (ROI -8.2%, HIGH RISK). 리스크 레벨별 프로그레스 바 색상 차이 (ss_9459re7jh에서 확인)
4. **Trading — Global Signal Feed** → 하단에 "WHALE ALERT: 5,000 BTC transfer detected" (8m ago, SECTOR: MACRO), "FED RESERVE: Rate maintenance confirmed" (14m ago, SECTOR: FIAT) 표시. 실시간 뉴스 피드 형태
5. **Trading — 푸터 정보** → "LATENCY: 14MS  SERVER: TOKYO-AWS-01  API STATUS: 200 OK  CORTHEX ARCHIVE // TRADING_ENGINE_ACTIVE" 표시. 서버 상태 모니터링 정보 제공
6. **Messenger — Secure Feed 버튼** → 우측 상단 "Secure Feed" 버튼 존재. 클릭 미시도 (상세 확인 불가)
7. **Messenger — 채널 전환** → 전략팀 → 이다은 채널 전환 시 매끄럽게 전환. 각 채널별 "CONNECTION STABLE • PING: 4MS" 상태 표시
8. **Messenger — 파일 첨부 표시** → PDF 파일(시장분석_2026Q1.pdf)이 인라인으로 표시됨. 다운로드 아이콘, 파일 크기(2.4MB), Encrypted 표시
9. **AGORA — TRENDING/UNRESOLVED 탭** → TRENDING 클릭 시 밑줄 이동 정상 (ss_54589yvdz에서 확인). 하지만 스레드 목록 내용이 LATEST와 동일해 보임
10. **AGORA — Active Agents 위젯** → "8 AI Agents currently contributing to discussions in AGORA" 표시. A, B, C +5 아바타 표시. 클릭 미시도
11. **AGORA — CREATE THREAD 버튼** → 우측 상단에 "+ CREATE THREAD" 버튼 있음. 클릭 미시도 (새 스레드 생성 테스트 미수행)
12. **AGORA — 스크린샷 캡처 간헐적 타임아웃** → AGORA 페이지에서 스크린샷 캡처 시 CDP 타임아웃이 2~3회 발생. 페이지 렌더링 부하가 높은 것으로 추정

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 미테스트
- 로딩 속도 체감: Trading 빠름(2s), Messenger 빠름(2s), AGORA 보통(2s + 간헐적 렌더러 지연)
- 레이아웃 깨짐: 없음. 3개 페이지 모두 정상 레이아웃
- AGORA 페이지에서 간헐적 렌더러 freeze 발생 (스크린샷 캡처 타임아웃 2~3회)

## 요약
- 총 단계: 12
- PASS: 11
- FAIL: 1 (AGORA 스레드 상세 진입 불가)
- 버그: 3건 (Major 1, Minor 2)
- UX 발견: 12건
