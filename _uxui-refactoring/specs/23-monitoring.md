# Monitoring UX/UI 설명서

> 페이지: #23 monitoring
> 패키지: admin
> 경로: /admin/monitoring
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 CORTHEX 시스템의 **실시간 상태를 모니터링**하는 대시보드 페이지. 서버 상태, 메모리 사용량, 데이터베이스 연결, 최근 에러를 4개 카드로 요약 표시. **30초마다 자동 갱신**되어 관리자가 별도 새로고침 없이 시스템 건강 상태를 파악 가능.

**핵심 사용자 시나리오:**
- 관리자가 서버가 정상 가동 중인지 한눈에 확인 (업타임, 빌드 번호)
- 메모리 사용률을 프로그레스 바로 확인 (80% 이상 주의, 90% 이상 위험)
- DB 연결 상태 + 응답 시간 확인
- 최근 24시간 에러 목록 확인
- 수동 새로고침 버튼으로 즉시 상태 갱신

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────────┐
│  "시스템 모니터링"                          [새로고침]    │
├─────────────────────────────────────────────────────────┤
│  ┌─ 서버 상태 ──────────┐  ┌─ 메모리 ──────────────┐   │
│  │ "서버 상태"    [ok]   │  │ "메모리"         85%  │   │
│  │ 업타임: 3일 5시간 12분 │  │ [████████████░░░░]    │   │
│  │ 런타임: Bun 1.1.x     │  │ RSS: 245 MB           │   │
│  │ 빌드: #142 · abc1234  │  │ 힙: 180 / 256 MB      │   │
│  └──────────────────────┘  └────────────────────────┘   │
│                                                         │
│  ┌─ 데이터베이스 ────────┐  ┌─ 에러 (24시간) ────────┐  │
│  │ "데이터베이스" [ok]   │  │ "에러 (24시간)" [3건]  │  │
│  │ 응답 시간: 2 ms       │  │ 2026-03-09 14:32:01   │  │
│  │                       │  │ "Connection timeout"  │  │
│  │                       │  │ 2026-03-09 12:15:44   │  │
│  │                       │  │ "Rate limit exceeded" │  │
│  └──────────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "시스템 모니터링"     │
│              [새로고침]│
├─────────────────────┤
│ ┌─ 서버 상태 ─────┐ │
│ │ ok / 업타임 ...  │ │
│ └─────────────────┘ │
│ ┌─ 메모리 ────────┐ │
│ │ 85% [████████░]  │ │
│ └─────────────────┘ │
│ ┌─ DB ────────────┐ │
│ │ ok / 2ms         │ │
│ └─────────────────┘ │
│ ┌─ 에러 ──────────┐ │
│ │ 3건 / 목록       │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **회사 선택 불필요**: 모니터링은 시스템 전체 상태인데 다른 admin 페이지처럼 회사 선택이 필요하지 않음 -- 현재 코드는 회사 선택 없이 바로 조회 (올바름)
2. **자동 갱신 표시 없음**: 30초마다 자동 갱신되지만 마지막 갱신 시간이나 카운트다운이 없어 데이터가 얼마나 최신인지 불명확
3. **메모리 바 세밀도**: 단순 프로그레스 바라 시간 추이(트렌드)를 볼 수 없음 -- 현재 순간 값만 표시
4. **에러 목록 잘림**: truncate로 긴 에러 메시지가 잘리는데 확장 방법 없음
5. **DB 카드 정보 부족**: 응답 시간만 있고 연결 수, 쿼리 수 등 추가 메트릭 없음
6. **에러 상태 페이지**: 서버 연결 실패 시 "잠시 후 다시 시도해주세요"만 표시 -- 재시도 버튼 없음
7. **로딩 상태 개선 가능**: Skeleton 카드가 4개인데 카드 내부 구조를 반영하지 않음
8. **카드 크기 불균형**: 서버/메모리 카드는 내용이 많고 DB 카드는 내용이 적어 시각적 균형이 맞지 않음
9. **색상 임계치 하드코딩**: 메모리 바의 80%/90% 임계치가 코드에 하드코딩 -- 설정 가능하면 좋겠음
10. **알림 없음**: 위험 상태(메모리 90%+, DB 다운, 에러 급증)일 때 별도 알림이 없음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2가 결정** -- 모니터링 대시보드답게 정보 밀도 높은 디자인
- 상태별 색상 유지: ok(green), error(red), warning(amber)
- 메모리 바 색상 3단계 유지: 정상(emerald), 주의(amber), 위험(red)

### 4.2 레이아웃 개선
- **자동 갱신 타이머 표시**: "30초 후 자동 갱신" 카운트다운 또는 마지막 갱신 시간
- **에러 메시지 확장**: 클릭 시 전체 메시지 표시
- **카드 균형**: DB 카드에 추가 정보 표시 또는 카드 크기 조정

### 4.3 인터랙션 개선
- 에러 상태에서 재시도 버튼 추가
- 위험 임계치 초과 시 카드 보더 강조 (pulse 애니메이션 등)
- 에러 목록 더보기/접기

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | MonitoringPage | 자동 갱신 타이머 표시, 에러 페이지 재시도 | pages/monitoring.tsx |
| 2 | ServerStatusCard | 카드 내부 레이아웃 정리 | pages/monitoring.tsx (내부) |
| 3 | MemoryCard | 메모리 바 + 수치, 임계치 경고 강조 | pages/monitoring.tsx (내부) |
| 4 | DatabaseCard | DB 상태 + 응답 시간, 레이아웃 균형 | pages/monitoring.tsx (내부) |
| 5 | ErrorCard | 에러 목록, 메시지 확장, 건수 뱃지 | pages/monitoring.tsx (내부) |
| 6 | MemoryBar | 프로그레스 바 (3단계 색상) | pages/monitoring.tsx (내부) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| server.status | useQuery → GET /admin/monitoring/status | 서버 상태 (ok/error) |
| server.uptime | 〃 | 업타임 (초 단위 -> 일/시간/분 변환) |
| server.version | 〃 | 빌드 번호, 커밋 해시, 런타임 정보 |
| memory.rss | 〃 | RSS 메모리 (MB) |
| memory.heapUsed/heapTotal | 〃 | 힙 메모리 사용량/전체 (MB) |
| memory.usagePercent | 〃 | 메모리 사용률 (%) |
| db.status | 〃 | DB 연결 상태 (ok/error) |
| db.responseTimeMs | 〃 | DB 응답 시간 (ms) |
| errors.count24h | 〃 | 24시간 에러 건수 |
| errors.recent | 〃 | 최근 에러 목록 (timestamp + message) |

**API 엔드포인트 (변경 없음):**
- `GET /admin/monitoring/status` -- 전체 모니터링 데이터 (30초 자동 갱신)

**자동 갱신:**
- `refetchInterval: 30_000` (30초)
- 수동 새로고침: `refetch()` 호출

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 서버 OK 뱃지 | 그린 | Badge variant="success" |
| 서버 Error 뱃지 | 레드 | Badge variant="error" |
| DB OK 뱃지 | 그린 | Badge variant="success" |
| DB Error 뱃지 | 레드 | Badge variant="error" |
| 에러 0건 뱃지 | 그린 | Badge variant="success" |
| 에러 N건 뱃지 | 레드 | Badge variant="error" |
| 메모리 바 (정상 ~79%) | 에메랄드 | bg-emerald-500 |
| 메모리 바 (주의 80~89%) | 앰버 | bg-amber-500 |
| 메모리 바 (위험 90%+) | 레드 | bg-red-500 |
| 메모리 바 배경 | 징크 | bg-zinc-200 dark:bg-zinc-700 |
| 에러 메시지 배경 | 투명 | border-b border-zinc-100 dark:border-zinc-800 |
| 에러 타임스탬프 | 징크 mono | text-zinc-500 font-mono |
| 카드 배경 | @corthex/ui Card | Card + CardContent 컴포넌트 |
| 로딩 스켈레톤 | @corthex/ui Skeleton | Skeleton 컴포넌트 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 2x2 그리드 (4개 카드), 넓은 카드 |
| **768px~1439px** (Tablet) | 2x2 그리드 유지, 카드 약간 축소 |
| **~375px** (Mobile) | 1컬럼 세로 스택 (4개 카드), 새로고침 버튼 축소 |

**모바일 특별 처리:**
- 4개 카드가 세로로 스택
- 에러 목록: 메시지 줄바꿈 허용 (truncate 해제)
- 새로고침 버튼: 아이콘만 또는 축소
- 메모리 바: 전체폭 유지

---

## 9. 기존 기능 참고사항

v1-feature-spec.md에 별도 모니터링 항목은 없지만, v2 관리자 콘솔의 필수 기능으로 아래가 **반드시** 동작해야 함:

- [x] 서버 상태 표시 (status, uptime, version)
- [x] 메모리 사용량 표시 (RSS, heap, usage percent)
- [x] DB 연결 상태 + 응답 시간
- [x] 최근 24시간 에러 목록
- [x] 30초 자동 갱신
- [x] 수동 새로고침

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get('/admin/monitoring/status')` 호출
- `refetchInterval: 30_000` 설정
- MonitoringData 타입 구조
- formatUptime 함수
- MemoryBar의 임계치 로직 (80/90)
- @corthex/ui의 Card, CardContent, Badge, Skeleton 사용 패턴

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator monitors system health in real-time.

This page: System monitoring dashboard — a real-time overview of server health, memory usage, database status, and recent errors. Auto-refreshes every 30 seconds.

User workflow:
1. Admin opens this page and immediately sees four status cards in a 2x2 grid.
2. Server Status card: shows "OK" or "Error" badge, uptime (e.g., "3d 5h 12m"), runtime version, build number with commit hash.
3. Memory card: shows usage percentage, a progress bar (green under 80%, amber 80-89%, red 90%+), RSS memory in MB, and heap used/total in MB.
4. Database card: shows "OK" or "Error" badge and response time in milliseconds.
5. Error card (24h): shows error count badge, and a list of recent errors with timestamp and message.
6. A "Refresh" button in the header lets the admin manually trigger a data reload. Data auto-refreshes every 30 seconds.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — "System Monitoring" title + "Refresh" button (shows "Refreshing..." when loading).
2. Server Status card — status badge (green=OK, red=Error), uptime formatted as days/hours/minutes, runtime version, build number with commit hash.
3. Memory card — usage percentage display, horizontal progress bar with 3-tier coloring (green/amber/red based on thresholds), RSS value, heap used vs total.
4. Database card — status badge (green=OK, red=Error), response time in milliseconds.
5. Error Summary card — error count badge (green=0, red=N), chronological list of recent errors showing timestamp (monospace) and truncated message.
6. Loading state — 4 skeleton cards matching the grid layout.
7. Error state — connection failure message with retry option.
8. Auto-refresh indicator — subtle indicator showing data freshness (e.g., "Last updated: 15s ago" or countdown).

Design tone — YOU DECIDE:
- This is a system health dashboard — think: Grafana, Datadog, or Vercel Analytics.
- Information density is important — all critical metrics visible without scrolling.
- Status should be immediately apparent through color coding (green=healthy, amber=warning, red=critical).
- Clean, professional, data-focused. The admin glances at this page multiple times a day.

Design priorities:
1. Status must be visible at a glance — the admin should know system health in under 2 seconds.
2. Memory usage threshold colors must be immediately clear — green is fine, amber needs attention, red is urgent.
3. Error list must be scannable — timestamps and messages should be easy to read.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: an admin panel showing real-time system health monitoring with auto-refresh.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, stacked vertically):
1. Server Status card (status badge, uptime, build info)
2. Memory card (percentage, progress bar, heap info)
3. Database card (status badge, response time)
4. Error card (count badge, recent error list)
5. Refresh button (compact, in header area)
6. Loading / error states

All four cards stack vertically in a single column.

Design tone: Same as desktop — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Cards must be fully readable without horizontal scrolling.
2. Status badges and memory bar must be clearly visible on small screens.
3. Error messages should wrap instead of truncating.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `monitoring-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `monitoring-refresh-btn` | 새로고침 버튼 | 수동 데이터 갱신 |
| `monitoring-server-card` | 서버 상태 카드 | 서버 정보 영역 |
| `monitoring-server-status` | 서버 상태 뱃지 | ok/error 표시 |
| `monitoring-server-uptime` | 업타임 표시 | 가동 시간 |
| `monitoring-server-build` | 빌드 정보 | 빌드 번호 + 해시 |
| `monitoring-server-runtime` | 런타임 정보 | Bun 버전 |
| `monitoring-memory-card` | 메모리 카드 | 메모리 정보 영역 |
| `monitoring-memory-percent` | 사용률 표시 | 퍼센트 값 |
| `monitoring-memory-bar` | 메모리 프로그레스 바 | 시각적 사용량 |
| `monitoring-memory-rss` | RSS 값 | RSS 메모리 |
| `monitoring-memory-heap` | 힙 사용량 | 힙 used/total |
| `monitoring-db-card` | DB 카드 | DB 정보 영역 |
| `monitoring-db-status` | DB 상태 뱃지 | ok/error 표시 |
| `monitoring-db-response` | 응답 시간 | ms 단위 |
| `monitoring-error-card` | 에러 카드 | 에러 정보 영역 |
| `monitoring-error-count` | 에러 건수 뱃지 | 24시간 에러 수 |
| `monitoring-error-item` | 에러 항목 | 개별 에러 (timestamp + message) |
| `monitoring-error-empty` | 에러 없음 | "에러 없음" 표시 |
| `monitoring-loading` | 로딩 상태 | 스켈레톤 카드 |
| `monitoring-error-state` | 에러 상태 | 연결 실패 메시지 + 재시도 버튼 |
| `monitoring-refresh-timer` | 자동 갱신 타이머 | "N초 후 갱신" 또는 마지막 갱신 시간 |
| `monitoring-error-expand` | 에러 메시지 확장 | 긴 에러 메시지 전체 보기 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/monitoring 접속 | `monitoring-page` 존재, 4개 카드 표시 |
| 2 | 서버 상태 표시 | 카드 확인 | 상태 뱃지(ok/error) + 업타임 + 빌드 정보 |
| 3 | 메모리 바 표시 | 카드 확인 | 프로그레스 바 + 퍼센트 + RSS + 힙 정보 |
| 4 | DB 상태 표시 | 카드 확인 | 상태 뱃지 + 응답 시간(ms) |
| 5 | 에러 목록 표시 | 카드 확인 | 에러 건수 뱃지 + 타임스탬프 + 메시지 |
| 6 | 에러 없음 | 에러 0건일 때 | `monitoring-error-empty` 표시 |
| 7 | 수동 새로고침 | 새로고침 버튼 클릭 | "새로고침 중..." 표시 후 데이터 갱신 |
| 8 | 자동 갱신 | 30초 대기 | 데이터 자동 갱신 (isFetching 상태 변화) |
| 9 | 로딩 스켈레톤 | 첫 로드 시 | `monitoring-loading` 스켈레톤 4개 표시 |
| 10 | 연결 실패 | API 에러 시 | `monitoring-error-state` 에러 메시지 표시 |
| 11 | 메모리 색상 정상 | usagePercent < 80 | 메모리 바 에메랄드 색상 |
| 12 | 메모리 색상 주의 | usagePercent 80~89 | 메모리 바 앰버 색상 |
| 13 | 메모리 색상 위험 | usagePercent >= 90 | 메모리 바 레드 색상 |
| 14 | 반응형 | 375px 뷰포트 | 4개 카드 1컬럼 세로 스택 |
| 15 | 빌드 해시 표시 | 해시 있을 때 | "#N · abcdef" 형식 표시 |
| 16 | 갱신 타이머 | 페이지 로드 후 | `monitoring-refresh-timer` 카운트다운 또는 시간 표시 |
| 17 | 에러 메시지 확장 | 긴 에러 항목 클릭 | 전체 에러 메시지 표시 |
| 18 | 연결 실패 재시도 | 에러 상태에서 재시도 클릭 | 데이터 재로드 시도 |
