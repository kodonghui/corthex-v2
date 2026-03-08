# Story 11.5: Diff 뷰 + 토론 결과 사령관실 삽입

Status: done

## Story

As a CEO/Human 직원,
I want 토론 결과를 Diff 뷰로 확인하고, 완료된 토론 결과가 사령관실 대화 이력에 자동 삽입되도록,
so that 토론 전후 변화를 시각적으로 비교하고, 사령관실에서도 토론 결과를 즉시 확인할 수 있다.

## Acceptance Criteria

1. **Diff 뷰 컴포넌트**: AGORA 토론 완료 시, 토론 결과를 원문(토론 주제/요약)과 토론 후 합의 결과를 비교하는 Diff 뷰가 표시된다. 추가된 내용은 녹색 배경, 삭제/변경된 내용은 빨간 배경으로 하이라이트된다.
2. **Diff 탭**: AGORA 페이지 우측 패널(DebateInfoPanel)에 "정보" / "Diff" 탭이 추가된다. Diff 탭 선택 시 토론 결과의 각 라운드별 포지션 변화를 Diff 형태로 표시한다.
3. **토론 결과 사령관실 삽입**: 토론 완료 시 사령관실(chat) 대화 이력에 토론 결과 요약 카드가 자동 삽입된다. 카드에는 토픽, 합의 결과(consensus/dissent/partial), 핵심 논점, "AGORA에서 보기" 링크가 포함된다.
4. **사령관실 → AGORA 전환**: 사령관실에서 `/토론 [주제]` 또는 `/심층토론 [주제]` 명령 입력 시, 인라인 알림("토론이 시작됩니다. AGORA로 이동합니다") 표시 후 AGORA 페이지로 자동 전환된다.
5. **AGORA → 사령관실 복귀**: 토론 완료 후 "사령관실로 돌아가기" 버튼이 표시되며, 클릭 시 사령관실로 이동한다.
6. **라운드별 포지션 변화 추적**: 각 에이전트의 라운드별 position 변화가 시각적으로 표시된다 (예: R1: support → R2: oppose → R3: conditional-support).
7. **완료 토론 Diff 접근**: 토론 목록에서 완료된 토론 클릭 시 Diff 탭이 자동 활성화되어 결과를 즉시 확인할 수 있다.

## Tasks / Subtasks

- [x] Task 1: Diff 뷰 컴포넌트 (AC: #1, #6)
  - [x] 1.1 `packages/app/src/components/agora/diff-view.tsx` 생성 — 라운드별 포지션 변화 Diff 뷰
  - [x] 1.2 각 에이전트별 라운드 간 position 변화 시각화 (color-coded: 찬성=초록, 반대=빨강, 조건부=노랑)
  - [x] 1.3 토론 전(R1 초기 발언) vs 토론 후(최종 라운드) 합의 변화 요약 표시
  - [x] 1.4 핵심 논점(keyArguments) 라운드별 추적 표시

- [x] Task 2: AGORA 우측 패널 Diff 탭 (AC: #2, #7)
  - [x] 2.1 `packages/app/src/components/agora/debate-info-panel.tsx` 수정 — "정보" / "Diff" 탭 추가
  - [x] 2.2 완료 토론 선택 시 Diff 탭 자동 활성화
  - [x] 2.3 진행중 토론은 정보 탭만 표시, Diff 탭 비활성화

- [x] Task 3: 토론 결과 사령관실 삽입 카드 (AC: #3)
  - [x] 3.1 `packages/app/src/components/agora/debate-result-card.tsx` 생성 — 사령관실용 결과 요약 카드
  - [x] 3.2 카드 내용: 토픽, consensus 결과 (색상 Badge), summary, keyArguments(최대 3개), "AGORA에서 보기" 링크
  - [x] 3.3 사령관실 채팅 메시지 렌더러에 debate-result 타입 처리 추가

- [x] Task 4: 사령관실 → AGORA 전환 (AC: #4)
  - [x] 4.1 사령관실 chat 페이지에서 `/토론 [주제]` `/심층토론 [주제]` 명령 감지 로직
  - [x] 4.2 인라인 알림 표시 후 `navigate('/agora', { state: { debateId, fromChat: true } })` 호출
  - [x] 4.3 토론 생성 API 호출: POST /workspace/debates → POST /workspace/debates/:id/start

- [x] Task 5: AGORA → 사령관실 복귀 (AC: #5)
  - [x] 5.1 토론 완료 시 "사령관실로 돌아가기" 버튼 표시 (fromChat 상태 기반)
  - [x] 5.2 복귀 시 사령관실 대화 이력에 결과 카드 자동 삽입

- [x] Task 6: WebSocket debate-completed 이벤트 처리 (AC: #3)
  - [x] 6.1 사령관실 페이지에서도 debate 채널 구독하여 완료 이벤트 수신
  - [x] 6.2 debate-completed 이벤트 시 결과 카드 자동 삽입 (사령관실에 있을 때)

## Dev Notes

### Architecture Compliance

- **파일 구조**: `packages/app/src/components/agora/` (하위 컴포넌트), `packages/app/src/pages/` (페이지)
- **API 호출**: `packages/app/src/lib/api.ts`의 `api.get/post` 패턴 사용
- **상태 관리**: TanStack Query (서버 데이터) + 로컬 state (UI)
- **WebSocket**: `packages/app/src/stores/ws-store.ts`의 `subscribe/addListener` 패턴
- **API 응답 형식**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **라우팅**: react-router `useNavigate`, `useLocation`

### 핵심 참조 파일 (읽기 전용)

| 파일 | 역할 |
|------|------|
| `packages/shared/src/types.ts:577-695` | Debate, DebateResult, DebateWsEvent, ConsensusResult 등 모든 타입 |
| `packages/server/src/routes/workspace/debates.ts` | 토론 API (GET /debates, POST /debates, GET /:id, GET /:id/timeline) |
| `packages/app/src/stores/ws-store.ts` | WebSocket 스토어 (subscribe, addListener, isConnected) |
| `packages/app/src/lib/api.ts` | API 호출 유틸리티 |
| `packages/app/src/hooks/use-agora-ws.ts` | debate 채널 WS 훅 (11-4에서 구현) |
| `packages/app/src/components/agora/consensus-card.tsx` | 합의 결과 카드 (재사용/확장) |
| `packages/app/src/components/agora/speech-card.tsx` | 발언 카드 (position 태그 참조) |
| `packages/app/src/pages/chat.tsx` | 사령관실 채팅 페이지 |
| `packages/app/src/hooks/use-dashboard-ws.ts` | WS 훅 예시 |

### 핵심 참조 파일 (수정 대상)

| 파일 | 수정 내용 |
|------|----------|
| `packages/app/src/components/agora/debate-info-panel.tsx` | Diff 탭 추가 |
| `packages/app/src/pages/agora.tsx` | 사령관실 복귀 버튼, Diff 탭 연동 |
| `packages/app/src/pages/chat.tsx` | 토론 명령 감지, 결과 카드 삽입 |

### 신규 파일

| 파일 | 설명 |
|------|------|
| `packages/app/src/components/agora/diff-view.tsx` | 라운드별 포지션 변화 Diff 뷰 |
| `packages/app/src/components/agora/debate-result-card.tsx` | 사령관실 삽입용 토론 결과 카드 |

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
// 이벤트: DebateWsEvent union
// debate-completed 이벤트: { type: 'debate-completed', result: DebateResult }
```

### 공유 타입 (packages/shared/src/types.ts)

```typescript
DebateResult {
  consensus: ConsensusResult    // 'consensus' | 'dissent' | 'partial'
  summary: string               // 토론 요약
  majorityPosition: string      // 다수 입장
  minorityPosition: string      // 소수 입장
  keyArguments: string[]         // 핵심 논점 목록
  roundCount: number             // 총 라운드 수
}

DebateSpeech {
  agentId: string
  agentName: string
  content: string
  position: string              // 'support' | 'oppose' | 'neutral' | 'conditional-support' 등
  createdAt: string
}
```

### Diff 뷰 구현 전략

v1에서는 논문 텍스트의 unified_diff를 생성했지만, v2 토론은 논문 기반이 아님. v2 Diff 뷰는 다음으로 대체:

1. **라운드별 포지션 변화 추적**: 각 에이전트가 라운드별로 position이 어떻게 변했는지 시각적 추적
   - 예: Agent A: R1(support) → R2(oppose) → R3(conditional-support)
   - color-coded 화살표 or progress bar

2. **합의 수렴 시각화**: 전체 참여자의 position 분포가 라운드별로 어떻게 변화했는지
   - R1: 3 support, 2 oppose → R2: 4 support, 1 neutral → R3: 5 consensus

3. **핵심 논점 변화**: keyArguments가 라운드별로 어떻게 추가/수정되었는지

이 방식은 **v1의 논문 diff → v2의 의견 diff**로 자연스럽게 진화한 형태.

### v1 AGORA 참고 (구현 참조)

v1 코드: `/home/ubuntu/CORTHEX_HQ/web/agora_engine.py` (lines 197-223)

**v1 Diff 패턴:**
- 논문 원본 vs 수정본의 unified_diff를 HTML로 변환
- `.diff-add` (녹색): 추가된 줄
- `.diff-del` (빨강): 삭제된 줄
- `.diff-ctx` (기본): 변경 없는 줄
- `.diff-hdr` (헤더): @@ 구분선

**v1 프론트엔드 (corthex-app.js:402-412):**
- `agora.rightTab: 'diff'` — 우측 패널에 diff/book 탭
- `_loadAgoraDiff()` — 최신 논문 diff HTML 로드

**v2에서 가져올 것:**
- 우측 패널 탭 패턴 (정보/Diff)
- 색상 코딩 규칙 (녹색=추가, 빨강=삭제)
- 자동 Diff 탭 활성화 (완료 토론)

**v2에서 다른 것:**
- v1: 논문 텍스트 diff → v2: 에이전트 포지션/논점 변화 diff
- v1: SSE agora_paper_updated → v2: WS debate-completed

### 사령관실 연동 패턴 (UX 스펙 참조)

```
사령관실 /토론 입력
    ↓
인라인 알림: "토론이 시작됩니다. AGORA로 이동합니다"
    ↓
자동으로 AGORA 화면 전환
    ↓
토론 완료 시: 결과 표시 + "사령관실로 돌아가기" 버튼
    ↓
사령관실 대화 이력에도 토론 결과 요약 카드 자동 삽입
```

### 기존 UI 컴포넌트 재사용 (packages/ui)

| 컴포넌트 | 용도 |
|---------|------|
| `Card, CardHeader, CardContent` | 결과 카드, Diff 카드 래핑 |
| `Badge` | consensus/dissent/partial 상태 |
| `Button` | "사령관실로 돌아가기", "AGORA에서 보기" |
| `Tabs, TabsList, TabsTrigger, TabsContent` | 우측 패널 정보/Diff 탭 |
| `Tooltip` | 포지션 변화 설명 |

### Project Structure Notes

- 파일명: kebab-case (`diff-view.tsx`, `debate-result-card.tsx`)
- 컴포넌트명: PascalCase (`DiffView`, `DebateResultCard`)
- import: `@corthex/shared`에서 공유 타입, `@corthex/ui`에서 공유 컴포넌트
- 서버 API 추가 불필요 — 기존 debates/:id GET 응답에 rounds[].speeches[].position 데이터가 이미 포함됨

### Previous Story Intelligence (11-1 ~ 11-4)

- **11-1**: AGORA 엔진 코어 구현. `createDebate`, `startDebate`, `executeDebateRounds`, `detectConsensus`, `emitDebateEvent`. 49 tests.
- **11-2**: 토론 명령 통합. `processDebateCommand`, `selectDebateParticipants`, `formatDebateReport`. DelegationTracker에 토론 이벤트 추가. 38 tests.
- **11-3**: WebSocket debate 채널. `emitDebateEvent(debateId, companyId, type, payload)`. 타임라인 영속화. 28 tests.
- **11-4**: AGORA UI. 3패널 레이아웃, 발언 카드, 합의 결과 카드, WS debate 훅, 사령관실 연동(navigate). 47 tests (309 expects).
- **핵심**: 이 스토리는 11-4 위에 Diff 뷰 + 사령관실 결과 삽입을 추가하는 **마무리 스토리**. 기존 컴포넌트를 확장하고 사령관실 연동을 완성한다.

### References

- [Source: _bmad-output/planning-artifacts/epics.md] — Epic 11, E11-S5 (2 SP)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:356-361] — 사령관실 → AGORA 전환 흐름
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:270] — AGORA Diff 뷰 (Phase 2)
- [Source: packages/shared/src/types.ts:577-695] — Debate 관련 타입
- [Source: packages/server/src/routes/workspace/debates.ts] — 토론 API
- [Source: packages/app/src/pages/agora.tsx] — AGORA 메인 페이지
- [Source: packages/app/src/pages/chat.tsx] — 사령관실 채팅 페이지
- [Source: /home/ubuntu/CORTHEX_HQ/web/agora_engine.py:197-223] — v1 Diff HTML 생성
- [Source: /home/ubuntu/CORTHEX_HQ/web/static/js/corthex-app.js:402-412] — v1 AGORA 상태 (rightTab: diff)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- All 48 new tests pass (agora-diff-view.test.ts, 107 expect() calls)
- All 47 existing AGORA tests pass (agora-ui-components.test.ts, 309 expect() calls)
- TypeScript compilation clean (no errors in agora/chat-area files)
- Vite build successful (8.83s)

### Completion Notes List

- DiffView 컴포넌트: 에이전트별 포지션 변화 추적 + 라운드별 합의 수렴 시각화 + 토론 전후 비교
- DebateInfoPanel: "정보" / "Diff" 탭 추가, 완료 토론 시 Diff 탭 자동 활성화
- DebateResultCard: 사령관실 삽입용 토론 결과 요약 카드 (토픽, consensus, keyArguments, AGORA 링크)
- 사령관실 → AGORA 전환: /토론, /심층토론 명령 감지, 인라인 알림, 자동 네비게이션
- AGORA → 사령관실 복귀: fromChat 상태 기반 "돌아가기" 버튼
- WebSocket debate-completed 이벤트 수신: 사령관실에 결과 카드 자동 삽입

### File List

- `packages/app/src/components/agora/diff-view.tsx` (신규: Diff 뷰 컴포넌트)
- `packages/app/src/components/agora/debate-result-card.tsx` (신규: 사령관실 결과 카드)
- `packages/app/src/components/agora/debate-info-panel.tsx` (수정: 정보/Diff 탭 추가)
- `packages/app/src/pages/agora.tsx` (수정: fromChat 상태, 복귀 버튼)
- `packages/app/src/components/chat/chat-area.tsx` (수정: 토론 명령 감지, 결과 카드 삽입, WS 리스너)
- `packages/server/src/__tests__/unit/agora-diff-view.test.ts` (신규: 48 tests)
- `_bmad-output/implementation-artifacts/11-5-diff-view-debate-result-insertion.md` (수정: story file)
