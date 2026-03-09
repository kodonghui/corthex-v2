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
- **다크 테마 기반** (현재 유지): 명령 센터 느낌의 프로페셔널한 분위기
- 색상 강조: 처리 중(amber), 완료(emerald), 실패(red) 상태별 색상 강화
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
Product context:
CORTHEX is an AI-powered company management platform. A human CEO controls an entire AI organization — departments, AI employees (agents), and human staff — from a single web dashboard. Think of it as "running a company where most employees are AI agents."

This page — "Commander's Office" (사령관실):
The CEO's primary workspace. This is WHERE the CEO gives orders to the AI organization and monitors execution in real-time. It's the single most important page in the product.

What the CEO does here:
1. Types a natural language command (e.g., "Research competitor pricing and write a report")
2. Watches the delegation chain unfold in real-time: Chief of Staff → Department Head → Specialist agent
3. Reads the completed report/deliverable

Required functional elements (arrange these however produces the BEST UX — no layout constraints):
- Chat-style message thread: CEO's commands (user bubbles) and AI agent responses (with agent name, role badge)
- Delegation chain visualization: real-time pipeline showing which agent is currently working (amber=processing, green=done, red=failed)
- Report/deliverable viewer: rendered markdown reports, Mermaid diagrams, sketch previews
- Command input area: auto-expanding textarea with send button
- Slash command popup: categorized command list (triggered by "/" key)
- @mention popup: agent list grouped by department with avatars (triggered by "@" key)
- Preset commands: quick-access to saved command templates
- Quality badges: PASS/FAIL indicators on agent outputs
- Empty state: welcoming onboarding with example commands for first-time users
- Loading skeleton: while history loads
- Error state: when API fails

Tone & mood:
- Dark theme (zinc-800/900 base)
- Military command center meets modern SaaS — authoritative but clean
- Color coding: indigo for user actions, amber for processing, emerald for success, red for failure
- Professional, minimal, no decorative clutter — pure functionality

Design freedom:
You have FULL creative freedom on layout, component arrangement, and visual hierarchy. The current version uses a simple split-view, but you can reimagine this completely. Prioritize: (1) command input accessibility, (2) delegation chain visibility, (3) report readability.

Resolution: 1440x900, UI screenshot style, pixel-perfect.
```

### 모바일 버전
```
Mobile version (375x812) of the CORTHEX "Commander's Office" — the CEO's AI organization command center.

Same product context as desktop: CEO gives natural language commands to AI agents, watches delegation chain execute in real-time, reads completed reports.

Required elements (optimize arrangement for mobile touch UX):
- Chat message thread (CEO commands + AI agent responses with badges)
- Delegation chain status (real-time processing visualization)
- Report/deliverable viewing area
- Command input (bottom-fixed, with send button)
- Slash command popup (triggered by "/")
- @mention popup (triggered by "@")
- Preset quick-access
- Quality badges (PASS/FAIL)
- Loading/empty/error states

Tone: Dark theme (zinc-800/900), military meets SaaS, professional.
Colors: indigo=user, amber=processing, emerald=success, red=failure.

Design freedom:
Full creative freedom on mobile layout. Current version uses tab switching (Chat/Report), but you can try bottom sheets, swipe navigation, collapsible sections, or any mobile pattern that works best. Prioritize: easy command input with one thumb, clear delegation status at a glance.

Resolution: 375x812, mobile UI screenshot style, pixel-perfect.
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
