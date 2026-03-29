# Part 2-10: 전략실(Trading) + 메신저 + AGORA 결과

## 테스트 환경
- 일시: 2026-03-29 20:15
- 브라우저: Chrome
- 해상도: 1440x617
- 계정: ceo (대표님 User)

## 단계별 결과
| # | 단계 | 결과 | 비고 |
|---|------|------|------|
| 1 | 전략실 페이지 로딩 | PASS | URL: /trading, 타이틀 "트레이딩 Trading", 시장 개장 Market Open 표시, TERMINAL_STABLE_V3.0.4 |
| 2 | 차트/포트폴리오/워치리스트 위젯 확인 | PASS | 시세 Tickers(BTC/USD, ETH/USD, SOL/USD, AAPL, NVDA, TSLA), OHLC 차트, Financial Metrics(NET PROFIT +12.42%, TOTAL EQUITY $125,847.30), 주문 ORDER 패널, AI 전략(Alpha-7 Arbitrage, Beta-V Momentum, Delta-2 Sentiment), Global Signal Feed 모두 표시 |
| 3 | 타임프레임 필터 클릭 | PASS | 1분/5분/15분/1시간/1일/1주 필터 정상 전환, 선택 시 하이라이트 표시 |
| 4 | 스크린샷 저장 | PASS | 세션 내 캡처 완료 (ss_2973pahaj) |
| 5 | 메신저 페이지 로딩 | PASS | URL: /messenger, 타이틀 "Messenger", ACTIVE NODES 채널 목록 표시 |
| 6 | 채널 목록 확인 | PASS | 전략팀 Strategy Team(3), 김수호 Suho Kim(1), 보안팀 Security Team, 이다은 Da-eun Lee, 운영팀 Operations, 한예진 Ye-jin Han 등 6개+ 채널 |
| 7 | 채널 클릭 → 메시지 목록 확인 | FAIL | 채널 헤더는 변경되지만 메시지 내용이 모든 채널에서 동일 (BUG-001) |
| 8 | 메시지 입력창 확인 | PASS | "Type command or message..." placeholder, 이모지/첨부/전송 버튼 표시, TERMINAL: ACTIVE LEVEL: 4 CLEARANCE 상태바 |
| 9 | 스크린샷 저장 | PASS | 세션 내 캡처 완료 (ss_4951dnocs) |
| 10 | AGORA 페이지 로딩 | PASS | URL: /agora, 타이틀 "Agora Terminal", 카테고리 + 스레드 목록 표시 |
| 11 | 카드/항목 클릭 → 상세 확인 | FAIL | 스레드 카드 제목, 댓글 아이콘, 눈 아이콘 모두 클릭해도 상세 페이지로 이동하지 않음 (BUG-002) |
| 12 | 스크린샷 저장 | PASS | 세션 내 캡처 완료 (ss_6887apoc9) |

## 발견된 버그
### BUG-001: 메신저 채널 전환 시 메시지 내용이 변경되지 않음
- 페이지: https://corthex-hq.com/messenger
- 재현 단계:
  1. 메신저 페이지 진입
  2. 좌측 ACTIVE NODES에서 "전략팀 Strategy Team" 확인 (메시지 3건 표시)
  3. "김수호 Suho Kim" 클릭
  4. "보안팀 Security Team" 클릭
- 기대 결과: 각 채널별 고유한 메시지가 표시되어야 함
- 실제 결과: 헤더만 변경되고 (STRATEGY TEAM → SUHO KIM → SECURITY TEAM) 메시지 내용은 동일한 3개 메시지(김수호 텍스트, 김수호 PDF 첨부, 이다은 답변)가 그대로 표시
- 심각도: Major

### BUG-002: AGORA 스레드 카드 클릭 시 상세 페이지 미이동
- 페이지: https://corthex-hq.com/agora
- 재현 단계:
  1. AGORA 페이지 진입
  2. "v3.2 업데이트 관련 의견 수렴" 스레드 제목 클릭
  3. 댓글 아이콘(24) 클릭
  4. 눈 아이콘 클릭
- 기대 결과: 스레드 상세 페이지(댓글 목록 등)로 이동
- 실제 결과: 아무 반응 없음. 스레드 상세를 볼 수 있는 방법이 없음
- 심각도: Major

### BUG-003: AGORA 카테고리 필터 미작동
- 페이지: https://corthex-hq.com/agora
- 재현 단계:
  1. AGORA 페이지 진입
  2. 좌측 CATEGORIES에서 "기술 Tech (28)" 클릭
- 기대 결과: [기술] 태그 스레드만 필터링되어 표시
- 실제 결과: "기술 Tech"가 하이라이트되지만 [전략], [운영], [자유], [Q&A] 등 모든 카테고리 스레드가 그대로 표시
- 심각도: Minor

### BUG-004: AGORA 탭(TRENDING/UNRESOLVED) 전환 시 콘텐츠 미변경
- 페이지: https://corthex-hq.com/agora
- 재현 단계:
  1. LATEST 탭에서 스레드 목록 확인
  2. TRENDING 탭 클릭
- 기대 결과: 인기순/트렌딩 기준으로 정렬된 다른 스레드 목록
- 실제 결과: 탭 하이라이트만 변경되고 동일한 스레드 목록 표시
- 심각도: Minor

### BUG-005: AGORA 페이지네이션 미작동
- 페이지: https://corthex-hq.com/agora
- 재현 단계:
  1. 하단 페이지네이션에서 "2" 클릭
- 기대 결과: 2페이지 스레드 목록으로 이동
- 실제 결과: 페이지 1 그대로 유지, 콘텐츠 변경 없음
- 심각도: Minor

### BUG-006: 전략실 티커 클릭 시 차트 종목 미변경
- 페이지: https://corthex-hq.com/trading
- 재현 단계:
  1. 좌측 시세 Tickers에서 "ETH/USD" 행 클릭
- 기대 결과: 차트가 ETH/USD로 전환, OHLC 데이터 업데이트
- 실제 결과: 차트 헤더는 BTC/USD $67,432.50 그대로 유지
- 심각도: Minor

## UX 탐색 발견사항

### 전략실 (Trading)
- 타임프레임 필터(1분~1주) 전환 → 정상 작동, 선택 상태 하이라이트 표시
- 차트 유형(캔들/라인/영역) 전환 → 탭 선택은 정상, 차트 영역은 빈 검정색(실제 차트 렌더링 없음)
- 매수 Buy / 매도 Sell 토글 → 정상 전환 (매수=노란색, 매도=빨간색)
- 하단 AI 전략 카드(Alpha-7 Arbitrage +22.4%, Beta-V Momentum +8.1%, Delta-2 Sentiment -0.2%) → 표시만 됨, 클릭 불가
- Global Signal Feed(WHALE ALERT, FED RESERVE) → 표시만 됨
- 서버 상태바(LATENCY: 14MS, SERVER: TOKYO-AWS-01, API STATUS: 200 OK) → 정상 표시

### 메신저 (Messenger)
- 필터 아이콘(깔때기) → 클릭해도 아무 반응 없음
- "+" 버튼 → "이 기능은 준비 중입니다" 토스트 표시 (적절한 안내)
- Secure Feed 버튼 → 클릭해도 아무 반응 없음
- ⋮ (더보기) 메뉴 → 클릭해도 드롭다운 미표시
- 이모지 버튼 → 클릭해도 이모지 피커 미표시
- 첨부 버튼(클립 아이콘) → 테스트 미실시
- 파일 첨부 메시지(시장분석_2026Q1.pdf, 2.4 MB, Encrypted) → 다운로드 아이콘 표시
- 채널별 온라인 상태 표시(초록색 점) → 정상 표시

### AGORA
- CREATE THREAD 버튼 → 정상 작동, "새 토론 시작" 모달 표시 (토론 주제 입력, 토론 유형 2라운드/3라운드, 참여 에이전트 선택)
- Active Agents 위젯 → "8 AI Agents currently contributing" 표시, 아바타 A/B/C/+5
- 카테고리 목록 → 전체(142), 전략(42), 기술(28), 운영(35), 자유(19), Q&A(18) 정상 표시
- 스레드 다양성 → [전략], [기술], [운영], [자유], [Q&A] 태그별 스레드 존재
- 페이지네이션 → 12페이지 표시 (UI는 정상이나 기능 미작동)

### 콘솔 경고
- DialogContent에 `Description` 또는 `aria-describedby` 누락 경고 8건 (접근성 이슈)
- 심각한 JavaScript 에러는 없음

## 요약
- 총 단계: 12
- PASS: 10
- FAIL: 2
- 버그: 6건 (Major 2건, Minor 4건)
