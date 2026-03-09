# Command Center (사령관실) UX/UI 설명서

> 페이지: #01 command-center
> 패키지: app
> 경로: /command-center
> 작성일: 2026-03-09

---

## 1. 페이지 목적

CEO가 AI 에이전트 조직에 명령을 내리는 **유일한 진입점**. 채팅 형태의 인터페이스로 명령 입력 → 실시간 처리 과정 확인 → 보고서 열람까지 한 화면에서 처리.

**핵심 사용자 시나리오:**
- CEO가 텍스트/슬래시 명령/@멘션으로 AI에게 지시
- 위임 체인(비서실장 → 팀장 → 전문가)이 실시간으로 표시
- 완료된 보고서를 바로 확인

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "🎖️ 사령관실"          [⭐ 프리셋 관리]    │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│   MessageList            │   ReportPanel            │
│   (채팅 메시지 목록)      │   (선택된 보고서)         │
│   - 날짜 구분선           │   - 보고서가 없으면       │
│   - 유저: 인디고 말풍선    │     이 패널 안 보임      │
│   - AI: 회색 말풍선       │                          │
│   - 품질 뱃지 (PASS/FAIL)│                          │
│   - 스케치 프리뷰 카드    │                          │
│                          │                          │
├──────────────────────────┴──────────────────────────┤
│  DelegationChain (접이식 — 처리 중일 때만 표시)       │
│  "비서실장 → CMO → 콘텐츠전문가" 실시간 추적          │
├─────────────────────────────────────────────────────┤
│  CommandInput                                       │
│  [자동 확장 textarea]              [전송 버튼]       │
│  / 치면 SlashPopup, @ 치면 MentionPopup             │
└─────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "🎖️ 사령관실" [⭐]  │
├─────────────────────┤
│ [💬 채팅] [📋 보고서] │  ← 탭 전환
├─────────────────────┤
│                     │
│  MessageList        │
│  또는 ReportPanel   │
│  (탭에 따라 전환)    │
│                     │
├─────────────────────┤
│ DelegationChain     │
├─────────────────────┤
│ [입력]        [전송] │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **시각적 위계 부족**: 메시지 목록이 단순 나열이라 중요 보고서와 일반 메시지 구분이 어려움
2. **프리셋 접근성**: 프리셋 관리가 모달 안에 숨어있어 자주 쓰는 명령을 빠르게 실행하기 어려움
3. **위임 체인 가시성**: 접이식이라 처리 중인 명령의 진행 상황을 놓치기 쉬움
4. **빈 상태 디자인**: 초기 빈 상태의 3개 예시 명령이 시각적으로 매력적이지 않음
5. **모바일 탭 전환**: 채팅 ↔ 보고서 전환 시 컨텍스트 유실 (어떤 명령의 보고서인지 불명확)
6. **입력 영역**: CommandInput이 하단에 고정되어 있지만 시각적으로 메시지 영역과의 구분이 약함
7. **스케치 프리뷰**: 카드가 작아서 다이어그램 내용 파악이 어려움
8. **에이전트 응답 말풍선**: 긴 텍스트가 잘려서 "전체 보기"를 눌러야 하는데 그 동선이 불명확
9. **로딩 상태 미정의**: 히스토리 로딩 중 skeleton UI가 없으면 빈 화면으로 보임
10. **에러 상태 미정의**: API 실패 시 사용자에게 보여줄 에러 UI가 정의되지 않음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — v1의 "군사 테마"에 얽매이지 않음
- 페이지 이름, 아이콘, 색상 등은 관리자가 커스터마이즈 가능한 플랫폼이므로 특정 테마를 강제하지 않음
- 상태별 색상 구분은 유지 (처리 중/완료/실패가 시각적으로 명확해야 함)
- 카드 기반 레이아웃으로 메시지 간 시각적 분리 강화

### 4.2 레이아웃 개선
- **메시지 카드화**: 각 AI 응답을 카드로 감싸서 시각적 위계 확보
- **위임 체인 스타일 강화**: 현재 위치(메시지 목록 아래) 유지, 타임라인 UI와 색상만 개선 (구조 변경 아님)
- **입력 영역 강화**: 배경 구분 + 그림자로 시각적 분리
- **빈 상태 개선**: 일러스트 + 인터랙티브 예시 카드로 온보딩 경험 향상

### 4.3 인터랙션 개선
- 슬래시 명령 팝업: 카테고리별 그룹핑 + 아이콘 추가
- 멘션 팝업: 에이전트 아바타 + 부서 색상 코드
- 프리셋: 사이드바 또는 퀵 액세스 버튼으로 노출 강화

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | CommandCenterPage | 레이아웃 spacing, padding 조정 | pages/command-center/index.tsx |
| 2 | MessageList | 메시지 카드 디자인, 날짜 구분선 스타일 | pages/command-center/components/message-list.tsx |
| 3 | CommandInput | 입력 영역 배경 구분, 전송 버튼 스타일 | pages/command-center/components/command-input.tsx |
| 4 | DelegationChain | 타임라인 UI 개선, 색상 강화 | pages/command-center/components/delegation-chain.tsx |
| 5 | MentionPopup | 아바타 색상, 부서 그룹핑 비주얼 | pages/command-center/components/mention-popup.tsx |
| 6 | SlashPopup | 아이콘 추가, 카테고리 구분 강화 | pages/command-center/components/slash-popup.tsx |
| 7 | PresetManager | 모달 내부 레이아웃 정리, 카드 디자인 | pages/command-center/components/preset-manager.tsx |
| 8 | SketchPreviewCard | 프리뷰 크기 확대, 액션 버튼 스타일 | pages/command-center/components/sketch-preview-card.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| messages | useCommandCenter → command store | 채팅 메시지 목록 |
| delegationSteps | WebSocket → command store | 실시간 위임 체인 |
| managers | useCommandCenter → org chart API | @멘션 에이전트 목록 |
| presets | usePresets → presets API | 슬래시 팝업 프리셋 목록 |
| activeCommandId | command store | 현재 처리 중인 명령 |
| selectedReportId | command store | 선택된 보고서 |
| viewMode | command store | 모바일 탭 상태 (chat/report) |

**API 엔드포인트 (변경 없음):**
- `POST /api/workspace/commands` — 명령 제출
- `GET /api/workspace/commands` — 히스토리 조회 (limit 50)
- CRUD `/api/workspace/presets` — 프리셋 관리
- WebSocket: command, delegation, tool, nexus 채널

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 유저 메시지 배경 | 인디고 | bg-indigo-600 |
| AI 응답 카드 배경 | 다크 그레이 | bg-zinc-800/80 |
| 처리 중 상태 | 앰버 | text-amber-400, border-amber-500 |
| 완료 상태 | 에메랄드 | text-emerald-400, border-emerald-500 |
| 실패 상태 | 레드 | text-red-400, border-red-500 |
| 입력 영역 배경 | 진한 다크 | bg-zinc-900 |
| 팝업 배경 | 다크 + 보더 | bg-zinc-800 border-zinc-700 |
| 품질 PASS 뱃지 | 그린 | bg-emerald-500/20 text-emerald-400 |
| 품질 FAIL 뱃지 | 레드 | bg-red-500/20 text-red-400 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 2컬럼 (채팅 + 보고서 사이드), 넓은 패딩 |
| **768px~1439px** (Tablet) | 1컬럼, 보고서는 오버레이 패널 |
| **~375px** (Mobile) | 탭 전환 (채팅/보고서), 최소 패딩, 팝업 풀스크린 |

**모바일 특별 처리:**
- SlashPopup/MentionPopup: bottom-sheet 스타일로 변경
- PresetManager 모달: 풀스크린
- 메시지 카드: 좌우 마진 최소화
- CommandInput: 키보드 올라올 때 고정 유지

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 1번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 일반 텍스트 명령 입력 + AI 라우팅
- [x] @멘션으로 특정 에이전트 직접 지정
- [x] 슬래시 명령어 9종 (전체, 순차, 도구점검, 배치실행, 배치상태, 명령어, 토론, 심층토론, 스케치)
- [x] 프리셋 CRUD + 실행
- [x] 실시간 위임 체인 표시 (WebSocket)
- [x] 보고서 열람 (데스크톱: 사이드 패널, 모바일: 탭)
- [x] 품질 뱃지 (PASS/FAIL)
- [x] 스케치 다이어그램 프리뷰 + SketchVibe 연동
- [x] 명령 히스토리 (최근 50개)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `useCommandCenter` 훅의 API 호출 로직
- `usePresets` 훅의 CRUD 로직
- `useCommandStore` Zustand 스토어 구조
- WebSocket 이벤트 핸들링
- 명령 제출 플로우 (submitCommand)

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: The primary workspace where the user gives natural language instructions to AI agents and monitors their progress. It's the most-used page in the entire product.

User workflow:
1. User types an instruction in natural language (e.g., "Analyze our Q3 sales data and create a presentation")
2. The system routes the task through a chain of AI agents — each specializing in different roles. The user sees this chain progress in real-time.
3. When agents complete their work, the user reads the deliverables (reports, diagrams, documents) right here.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Message thread — user's instructions and AI agent responses, chat-style. Agent messages show: agent name, role/department tag, and the response content.
2. Task delegation pipeline — real-time visualization of which AI agent is currently working. Shows a chain like: "Manager → Analyst → Writer" with status per step (waiting / working / done / failed).
3. Deliverable viewer — when an agent produces a report or diagram, the user can read it here. Supports rendered markdown, Mermaid diagrams, and sketch previews.
4. Input area — a text input at the bottom where the user types instructions. Has a send button. Auto-expands for longer text.
5. Quick command popup — when user types "/" in the input, a popup shows categorized commands (like Slack's slash commands).
6. Agent mention popup — when user types "@", a popup shows available AI agents grouped by department.
7. Saved templates — quick access to frequently-used instruction templates (the user can create/edit/delete these).
8. Quality indicators — PASS/FAIL badges on agent outputs showing quality check results.
9. Empty state — when there's no history yet, show a welcoming onboarding with example instructions the user can click to try.
10. Loading state — skeleton UI while history loads.
11. Error state — clear message when something goes wrong.

Design tone — YOU DECIDE:
- This is NOT a military/command center app. It's a modern productivity platform for managing AI workers.
- Choose whatever visual tone fits best for a professional tool that a CEO or team lead would use daily.
- Light theme, dark theme, or mixed — your choice. Pick what makes the most sense.
- Status colors should be clearly distinguishable (processing vs complete vs failed).
- Clean and functional. This is a tool people use 8 hours a day — it should feel effortless, not flashy.

Design priorities (in order):
1. The input area must be immediately accessible — this is what the user interacts with most.
2. The delegation pipeline must be visible at a glance — the user needs to know task progress without scrolling.
3. Deliverables must be readable — reports can be long, diagrams can be complex.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents by giving natural language instructions and monitoring task delegation in real-time.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Message thread (user instructions + AI agent responses)
2. Task delegation status (compact real-time visualization)
3. Deliverable viewing area
4. Input area (bottom-positioned, above the app's tab bar, with send button)
5. "/" command popup and "@" mention popup (mobile-friendly format — bottom sheets, not dropdowns)
6. Saved templates quick-access
7. Quality badges (PASS/FAIL)
8. Loading / empty / error states

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Input must be reachable with one thumb at the bottom of the screen.
2. Delegation status visible at a glance without scrolling.
3. Reading deliverables should feel comfortable despite smaller screen.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `command-center-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `message-list` | 메시지 목록 컨테이너 | 메시지 표시 영역 |
| `message-item-user` | 유저 메시지 | 유저 메시지 존재 확인 |
| `message-item-agent` | AI 에이전트 메시지 | AI 응답 존재 확인 |
| `message-empty-state` | 빈 상태 | 히스토리 없을 때 |
| `example-command` | 예시 명령 버튼 | 빈 상태의 예시 클릭 |
| `quality-badge` | 품질 뱃지 | PASS/FAIL 표시 확인 |
| `sketch-preview` | 스케치 프리뷰 카드 | 다이어그램 표시 확인 |
| `command-input` | 입력 textarea | 명령 입력 |
| `command-submit` | 전송 버튼 | 명령 전송 |
| `slash-popup` | 슬래시 명령 팝업 | / 입력 시 팝업 |
| `slash-command-item` | 슬래시 명령 항목 | 개별 명령 선택 |
| `mention-popup` | 멘션 팝업 | @ 입력 시 팝업 |
| `mention-agent-item` | 멘션 에이전트 항목 | 에이전트 선택 |
| `delegation-chain` | 위임 체인 컨테이너 | 처리 과정 표시 |
| `delegation-step` | 위임 단계 항목 | 개별 단계 확인 |
| `preset-manager-btn` | 프리셋 관리 버튼 | 모달 열기 |
| `preset-manager-modal` | 프리셋 관리 모달 | 모달 표시 확인 |
| `preset-item` | 프리셋 항목 | 개별 프리셋 |
| `preset-create-btn` | 프리셋 생성 버튼 | 새 프리셋 생성 |
| `preset-execute-btn` | 프리셋 실행 버튼 | 프리셋 실행 |
| `report-panel` | 보고서 패널 | 보고서 표시 영역 |
| `view-tab-chat` | 채팅 탭 (모바일) | 탭 전환 |
| `view-tab-report` | 보고서 탭 (모바일) | 탭 전환 |
| `message-loading-skeleton` | 로딩 스켈레톤 | 히스토리 로딩 중 |
| `command-error` | 에러 메시지 | API 실패 시 표시 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /command-center 접속 | `command-center-page` 존재, 로그인 안 튕김 |
| 2 | 빈 상태 표시 | 히스토리 없을 때 | `message-empty-state` + 예시 명령 3개 표시 |
| 3 | 명령 입력 | textarea에 텍스트 입력 | 전송 버튼 활성화 |
| 4 | 명령 전송 | 텍스트 입력 후 전송 클릭 | 유저 메시지 말풍선 추가 |
| 5 | 슬래시 팝업 | "/" 입력 | `slash-popup` 표시, 명령 목록 표시 |
| 6 | 슬래시 선택 | 팝업에서 명령 클릭 | 명령 텍스트 입력란에 삽입 |
| 7 | 멘션 팝업 | "@" 입력 | `mention-popup` 표시, 에이전트 목록 |
| 8 | 멘션 선택 | 팝업에서 에이전트 클릭 | 에이전트 이름 삽입 |
| 9 | 프리셋 관리 열기 | 프리셋 버튼 클릭 | `preset-manager-modal` 표시 |
| 10 | 프리셋 생성 | 이름+명령 입력 후 생성 | 목록에 새 프리셋 추가 |
| 11 | 키보드 네비게이션 | 슬래시 팝업에서 ↑↓ | 선택 항목 이동 |
| 12 | 모바일 탭 전환 | 보고서 탭 클릭 | 보고서 패널 표시, 채팅 숨김 |
| 13 | 반응형 레이아웃 | 375px 뷰포트 | 탭 UI 표시, 1컬럼 |
| 14 | 빈 전송 방지 | 빈 텍스트로 전송 시도 | 전송 버튼 비활성화 상태 확인 |
| 15 | 로딩 스켈레톤 | 히스토리 로딩 중 | `message-loading-skeleton` 표시 |
| 16 | 스케치 Mermaid 복사 | 복사 버튼 클릭 | 클립보드에 복사됨 |
