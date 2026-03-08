# Story 11.4: AGORA UI: 라운드 타임라인 + 발언 카드

Status: done

## Story

As a CEO/Human 직원,
I want AGORA 토론 전용 화면에서 토론 목록 조회, 새 토론 시작, 라운드별 타임라인 뷰로 에이전트 발언 카드를 실시간 스트리밍으로 확인하고, 합의/비합의 결과를 시각적으로 볼 수 있도록,
so that 사령관실에서 /토론 명령 후 AGORA 화면으로 자동 전환되어 실시간 토론 과정을 관전하고, 완료 후 결과를 한눈에 파악할 수 있다.

## Acceptance Criteria

1. **AGORA 페이지 라우트**: `/agora` 경로에 AGORA 토론 전용 페이지가 존재한다. App.tsx 라우트에 등록되고 사이드바 '업무' 섹션에 메뉴가 표시된다.
2. **토론 목록**: 좌측 패널에 기존 토론 목록이 표시된다 (GET /api/workspace/debates). 각 항목은 토픽, 상태(badge), 생성일, 참여자 수를 보여준다. 상태별 필터링 가능 (전체/진행중/완료).
3. **새 토론 시작**: "토론 시작" 버튼 → 모달에서 주제 입력 + 참여 에이전트 선택 + 토론 유형(2라운드/3라운드) 선택 → POST /api/workspace/debates → POST /api/workspace/debates/:id/start.
4. **라운드 타임라인 뷰**: 선택된 토론의 중앙 패널에 라운드별 구분선과 함께 발언 카드가 시간순으로 표시된다. 각 라운드 시작에 "Round N / Total" 헤더가 표시된다.
5. **발언 카드 (Speech Card)**: 각 발언은 에이전트 아바타(이름 첫 글자 + 색상) + 에이전트 이름 + 라운드 번호 + 발언 내용 + position 태그로 구성된다. 긴 발언은 접기/펼치기 가능.
6. **WebSocket 실시간 스트리밍**: debate 채널 구독 (debateId 기반). round-started → 라운드 구분선 삽입. speech-delivered → 발언 카드 실시간 추가 + 자동 스크롤. round-ended → 라운드 완료 표시. debate-completed → 합의 결과 카드 표시. debate-failed → 오류 표시.
7. **합의 결과 카드**: 토론 완료 시 하단에 결과 카드 표시. consensus/dissent/partial 상태별 색상. summary, majorityPosition, minorityPosition, keyArguments 표시.
8. **토론 상세 사이드 패널**: 우측에 토론 메타정보 (주제, 유형, 참여자, 라운드 수, 시작/완료 시간) 표시.
9. **타임라인 리플레이**: 완료된 토론 선택 시 GET /api/workspace/debates/:id/timeline 호출하여 전체 타임라인을 재생 형태로 표시.
10. **빈 상태**: 토론이 없을 때 EmptyState 컴포넌트 ("진행된 토론이 없습니다" + CTA 버튼).
11. **사령관실 연동**: 사령관실에서 /토론 또는 /심층토론 명령 시 AGORA 페이지로 자동 이동 (react-router navigate).
12. **반응형**: 모바일에서는 패널 토글 (목록/상세 전환), 데스크톱에서는 3패널 레이아웃.

## Tasks / Subtasks

- [x] Task 1: AGORA 페이지 라우트 + 사이드바 (AC: #1)
  - [x]1.1 `packages/app/src/pages/agora.tsx` 생성 — AGORA 메인 페이지 (3패널 레이아웃)
  - [x]1.2 `packages/app/src/App.tsx`에 `/agora` lazy 라우트 추가
  - [x]1.3 `packages/app/src/components/sidebar.tsx`의 '업무' 섹션에 AGORA 메뉴 추가

- [x]Task 2: 토론 목록 패널 (AC: #2, #10)
  - [x]2.1 `packages/app/src/components/agora/debate-list-panel.tsx` — 좌측 토론 목록
  - [x]2.2 useQuery로 GET /api/workspace/debates 호출, 상태별 필터링
  - [x]2.3 DebateListItem 컴포넌트: 토픽, 상태 Badge, 생성일, 참여자 수
  - [x]2.4 EmptyState 표시 (토론 없을 때)

- [x]Task 3: 새 토론 시작 모달 (AC: #3)
  - [x]3.1 `packages/app/src/components/agora/create-debate-modal.tsx` — 토론 생성 모달
  - [x]3.2 주제 입력 (필수), 토론 유형 선택 (debate/deep-debate), 에이전트 멀티 선택
  - [x]3.3 useMutation: POST /debates → POST /debates/:id/start 순차 호출
  - [x]3.4 생성 후 해당 토론 자동 선택 + WS 구독

- [x]Task 4: 라운드 타임라인 뷰 (AC: #4, #5, #9)
  - [x]4.1 `packages/app/src/components/agora/debate-timeline.tsx` — 중앙 타임라인 컴포넌트
  - [x]4.2 라운드 구분 헤더: "Round N / Total" 표시
  - [x]4.3 `packages/app/src/components/agora/speech-card.tsx` — 발언 카드 컴포넌트
  - [x]4.4 아바타(이름 첫 글자 + 해시 기반 색상), 에이전트명, 라운드번호, position 태그, 내용
  - [x]4.5 긴 발언 접기/펼치기 (기본 200자 초과 시 접기)
  - [x]4.6 완료 토론: timeline API 응답으로 렌더링, 진행중 토론: rounds 데이터 + WS 이벤트

- [x]Task 5: WebSocket debate 채널 훅 (AC: #6)
  - [x]5.1 `packages/app/src/hooks/use-agora-ws.ts` — debate 채널 구독/해제 + 이벤트 핸들러
  - [x]5.2 subscribe({ channel: 'debate', params: { id: debateId } }) / unsubscribe
  - [x]5.3 이벤트 핸들러: round-started → 라운드 구분, speech-delivered → 카드 추가, round-ended → 라운드 완료, debate-completed → 결과 표시, debate-failed → 오류
  - [x]5.4 자동 스크롤: 새 발언 시 스크롤 바닥으로 이동 (사용자가 위로 스크롤한 경우 제외)

- [x]Task 6: 합의 결과 카드 (AC: #7)
  - [x]6.1 `packages/app/src/components/agora/consensus-card.tsx` — 합의 결과 카드
  - [x]6.2 consensus = 초록, dissent = 빨강, partial = 노랑 배경
  - [x]6.3 summary, majorityPosition, minorityPosition, keyArguments 표시

- [x]Task 7: 토론 상세 사이드 패널 (AC: #8)
  - [x]7.1 `packages/app/src/components/agora/debate-info-panel.tsx` — 우측 메타정보 패널
  - [x]7.2 주제, 유형(2라운드/3라운드), 참여자 목록(아바타), 라운드 수, 시작/완료 시간 표시

- [x]Task 8: 사령관실 연동 (AC: #11)
  - [x]8.1 사령관실에서 `/토론` `/심층토론` 명령 실행 시 navigate('/agora') 호출
  - [x]8.2 debateId를 URL 파라미터 또는 상태로 전달하여 자동 선택 + 구독

- [x]Task 9: 반응형 레이아웃 (AC: #12)
  - [x]9.1 모바일: 토론 목록 ↔ 토론 상세 전환 (패널 토글)
  - [x]9.2 데스크톱: 좌측 목록(w-72) + 중앙 타임라인(flex-1) + 우측 정보(w-80)

## Dev Notes

### Architecture Compliance

- **파일 구조**: `packages/app/src/pages/agora.tsx` (페이지), `packages/app/src/components/agora/` (하위 컴포넌트)
- **라우트 패턴**: App.tsx의 기존 lazy 라우트 패턴과 동일 (`React.lazy(() => import('./pages/agora'))`)
- **API 호출**: `packages/app/src/lib/api.ts`의 `api.get/post` 패턴 사용
- **상태 관리**: TanStack Query (서버 데이터) + Zustand 없이 로컬 state로 UI 상태 관리
- **WebSocket**: `packages/app/src/stores/ws-store.ts`의 `subscribe/addListener` 패턴 사용 (debate 채널은 이미 WsChannel에 'debate' 정의됨)
- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`

### 핵심 참조 파일 (읽기 전용)

| 파일 | 역할 |
|------|------|
| `packages/shared/src/types.ts:552-670` | Debate, DebateWsEvent, DebateSpeech 등 모든 타입 |
| `packages/server/src/routes/workspace/debates.ts` | 토론 API (GET /debates, POST /debates, GET /:id, GET /:id/timeline) |
| `packages/app/src/stores/ws-store.ts` | WebSocket 스토어 (subscribe, addListener, isConnected) |
| `packages/app/src/lib/api.ts` | API 호출 유틸리티 |
| `packages/app/src/components/sidebar.tsx` | 사이드바 (메뉴 추가 위치) |
| `packages/app/src/App.tsx` | 라우터 (라우트 추가 위치) |
| `packages/app/src/hooks/use-dashboard-ws.ts` | WS 훅 예시 (패턴 참조) |
| `packages/app/src/hooks/use-activity-ws.ts` | WS 훅 예시 (패턴 참조) |
| `packages/app/src/pages/chat.tsx` | 3패널 레이아웃 예시 (좌-세션/우-채팅) |
| `packages/app/src/pages/ops-log.tsx` | 타임라인 뷰 예시 |

### 핵심 참조 파일 (수정 대상)

| 파일 | 수정 내용 |
|------|----------|
| `packages/app/src/App.tsx` | `/agora` 라우트 추가 |
| `packages/app/src/components/sidebar.tsx` | '업무' 섹션에 AGORA 메뉴 추가 |

### 신규 파일

| 파일 | 설명 |
|------|------|
| `packages/app/src/pages/agora.tsx` | AGORA 메인 페이지 |
| `packages/app/src/components/agora/debate-list-panel.tsx` | 토론 목록 패널 |
| `packages/app/src/components/agora/create-debate-modal.tsx` | 토론 생성 모달 |
| `packages/app/src/components/agora/debate-timeline.tsx` | 라운드 타임라인 뷰 |
| `packages/app/src/components/agora/speech-card.tsx` | 발언 카드 |
| `packages/app/src/components/agora/consensus-card.tsx` | 합의 결과 카드 |
| `packages/app/src/components/agora/debate-info-panel.tsx` | 토론 상세 사이드 패널 |
| `packages/app/src/hooks/use-agora-ws.ts` | debate 채널 WS 훅 |

### 기존 API 엔드포인트 (서버 이미 구현됨)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/workspace/debates` | GET | 토론 목록 (limit, offset 쿼리) |
| `/api/workspace/debates` | POST | 토론 생성 (topic, debateType, participantAgentIds) |
| `/api/workspace/debates/:id` | GET | 토론 상세 (rounds, result, participants 포함) |
| `/api/workspace/debates/:id/start` | POST | 토론 시작 (비동기 실행) |
| `/api/workspace/debates/:id/timeline` | GET | 타임라인 이벤트 배열 (재생용) |

### WebSocket debate 채널 (11-3에서 구현 완료)

```typescript
// 구독: { type: 'subscribe', channel: 'debate', params: { id: debateId } }
// 해제: { type: 'unsubscribe', channel: 'debate', params: { id: debateId } }
// 이벤트: DebateWsEvent union (debate-started, round-started, speech-delivered, round-ended, debate-completed, debate-failed)
```

### 공유 타입 (packages/shared/src/types.ts)

```typescript
// 주요 타입
Debate             // 토론 전체 데이터 (id, topic, status, participants, rounds, result)
DebateSpeech       // 발언 (agentId, agentName, content, position, createdAt)
DebateRound        // 라운드 (roundNum, speeches[])
DebateResult       // 결과 (consensus, summary, majorityPosition, minorityPosition, keyArguments)
ConsensusResult    // 'consensus' | 'dissent' | 'partial'
DebateStatus       // 'pending' | 'in-progress' | 'completed' | 'failed'
DebateType         // 'debate' | 'deep-debate'
DebateWsEvent      // WebSocket 이벤트 union (6종)
DebateTimelineEntry // = DebateWsEvent (타임라인 배열 요소)
CreateDebateRequest // POST 요청 바디
```

### v1 AGORA UI 패턴 (반드시 참고)

v1 코드: `/home/ubuntu/CORTHEX_HQ/web/templates/index.html` (7789-8022), `static/js/corthex-app.js` (5343-5483)

**v1 3패널 레이아웃:**
- 좌측: 쟁점 트리 (계층형, 상태 이모지) → v2에서는 토론 목록으로 변경
- 중앙: 토론 라이브 (발언 카드 스트리밍 + 자동 스크롤) → v2도 동일
- 우측: 논문 DIFF / 대화록 탭 → v2에서는 토론 메타정보 + 결과 표시

**v1 발언 카드 패턴:**
- 아바타 (이름 첫 글자 + 색상 코딩)
- 에이전트명 + 라운드 번호 (R1, R2...)
- 발언 내용 (whitespace-pre-wrap)
- 인용 표시 (verified/unverified)
- 사회자 태그 (별도 표시)

**v1 SSE 이벤트 핸들링 (v2에서 WS로 대체):**
- agora_round_complete → 발언 카드 push + 자동 스크롤
- agora_round_start → 해당 쟁점 자동 선택
- agora_consensus → 상태 업데이트
- agora_debate_complete → 완료 표시

**v1에서 가져올 것:**
- 발언 카드 UI 패턴 (아바타 + 이름 + 라운드 + 내용)
- 자동 스크롤 로직 (새 발언 시 바닥으로)
- 화자별 색상 코딩 → v2에서는 에이전트 이름 해시 기반 동적 색상

**v1과 다른 점:**
- v1: SSE EventSource → v2: WebSocket debate 채널
- v1: 3명 고정 토론자(kodh/psb/kdw) → v2: 동적 참여자 (관리자가 선택)
- v1: 논문 기반 쟁점 트리 → v2: 토론 목록 기반
- v1: Alpine.js → v2: React + TanStack Query

### 기존 UI 컴포넌트 재사용 (packages/ui)

| 컴포넌트 | 용도 |
|---------|------|
| `Card, CardHeader, CardContent` | 발언 카드, 결과 카드 래핑 |
| `Badge` | 토론 상태 (pending/in-progress/completed/failed) |
| `Button` | CTA 버튼 (토론 시작 등) |
| `Modal` | 토론 생성 모달 |
| `EmptyState` | 빈 상태 |
| `Spinner` | 로딩 |
| `Avatar` | 에이전트 아바타 (있다면 재사용, 없으면 간단 구현) |
| `Tabs` | 우측 패널 탭 (필요 시) |
| `Input, Textarea, Select` | 모달 폼 |

### 사령관실 연동 패턴

사령관실(`packages/app/src/pages/command-center.tsx`)에서 /토론 또는 /심층토론 슬래시 명령 처리 시:
1. 서버에서 debate 생성 + 시작 후 debateId가 반환됨
2. 프론트에서 `navigate('/agora', { state: { debateId } })` 호출
3. AGORA 페이지에서 `useLocation().state?.debateId`로 받아서 자동 선택 + WS 구독

> 주의: 사령관실의 슬래시 명령 처리 로직은 이 스토리에서 직접 수정하지 않을 수 있음. debateId 기반 네비게이션만 구현하되, 실제 사령관실 → AGORA 전환은 E11-S5(Diff 뷰 + 사령관실 삽입)에서 완성될 수 있음. 이 스토리에서는 최소한 URL 파라미터 `/agora?debateId=xxx` 또는 state 기반 자동 선택이 동작하면 됨.

### Project Structure Notes

- 파일명: kebab-case (`agora.tsx`, `speech-card.tsx`, `use-agora-ws.ts`)
- 컴포넌트명: PascalCase (`AgoraPage`, `SpeechCard`, `DebateListPanel`)
- import: `@corthex/shared`에서 공유 타입, `@corthex/ui`에서 공유 컴포넌트
- 테스트: bun:test (`packages/server/src/__tests__/unit/`) — 이 스토리는 프론트엔드이므로 서버 테스트 불필요. UI 로직 테스트가 필요하면 별도 판단.

### Previous Story Intelligence (11-1, 11-2, 11-3)

- **11-1**: AGORA 엔진 코어 (`createDebate`, `startDebate`, `executeDebateRounds`, `detectConsensus`, `emitDebateEvent`) 구현. 49 tests.
- **11-2**: 토론 명령 통합 (`debate-command-handler.ts`). `processDebateCommand`, `selectDebateParticipants`, `formatDebateReport`. DelegationTracker에 토론 이벤트 추가. 38 tests.
- **11-3**: WebSocket debate 채널 스트리밍. `emitDebateEvent` 시그니처 변경 (debateId, companyId, type, payload). 이벤트 이름 통일 (agent-spoke → speech-delivered, debate-done → debate-completed). 타임라인 영속화 (debates.timeline jsonb). 28 tests.
- **핵심**: 백엔드는 완전히 준비됨. 이 스토리는 **순수 프론트엔드 구현**. API와 WS는 모두 동작 중.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 11, E11-S4 (3 SP)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — CEO #5 AGORA 토론 UX
- [Source: _bmad-output/planning-artifacts/architecture.md] — WebSocket 7채널, UI 컴포넌트 패턴
- [Source: packages/shared/src/types.ts:552-670] — Debate, DebateWsEvent 타입
- [Source: packages/server/src/routes/workspace/debates.ts] — 토론 API 라우트
- [Source: packages/app/src/stores/ws-store.ts] — WS 스토어
- [Source: packages/app/src/components/sidebar.tsx] — 사이드바 메뉴
- [Source: /home/ubuntu/CORTHEX_HQ/web/templates/index.html:7789-8022] — v1 AGORA UI
- [Source: /home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js:5343-5483] — v1 AGORA JS

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- All 47 new tests pass (agora-ui-components.test.ts, 309 expect() calls)
- TypeScript compilation clean (no errors in app package)
- Vite build successful (27.99s)

### Completion Notes List

- AGORA 페이지 3패널 레이아웃 구현 (좌: 토론 목록, 중: 타임라인, 우: 정보)
- 발언 카드: 에이전트 아바타(해시 기반 색상) + 이름 + 라운드 + position 태그 + 접기/펼치기
- 합의 결과 카드: consensus/dissent/partial 색상 구분 + 핵심 논점 표시
- WebSocket debate 채널 훅: debateId 기반 구독/해제 + 이벤트 핸들링
- 사령관실 연동: URL 파라미터 또는 state로 debateId 전달 후 자동 선택
- 반응형: 모바일 패널 토글, 데스크톱 3패널
- 타임라인 리플레이: 완료 토론은 timeline API로, 진행중은 WS 실시간 + rounds 데이터
- 모달 API 차이 수정: open→isOpen, danger→error, EmptyState action→ReactNode
- 사이드바 '업무' 섹션에 AGORA 메뉴 추가

### File List

- `packages/app/src/pages/agora.tsx` (신규: AGORA 메인 페이지)
- `packages/app/src/components/agora/debate-list-panel.tsx` (신규: 토론 목록 패널)
- `packages/app/src/components/agora/create-debate-modal.tsx` (신규: 토론 생성 모달)
- `packages/app/src/components/agora/debate-timeline.tsx` (신규: 라운드 타임라인 뷰)
- `packages/app/src/components/agora/speech-card.tsx` (신규: 발언 카드)
- `packages/app/src/components/agora/consensus-card.tsx` (신규: 합의 결과 카드)
- `packages/app/src/components/agora/debate-info-panel.tsx` (신규: 토론 상세 패널)
- `packages/app/src/hooks/use-agora-ws.ts` (신규: debate WebSocket 훅)
- `packages/app/src/App.tsx` (수정: /agora 라우트 추가)
- `packages/app/src/components/sidebar.tsx` (수정: AGORA 메뉴 추가)
- `packages/server/src/__tests__/unit/agora-ui-components.test.ts` (신규: 47 tests)
