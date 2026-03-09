# Agora (토론 엔진) UX/UI 설명서

> 페이지: #05 agora
> 패키지: app
> 경로: /agora
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트 팀장들이 주제에 대해 **라운드 기반 토론**하는 것을 관전하는 페이지. CEO는 토론 주제를 던지고, AI들이 각자 의견을 제시하며 합의/비합의에 도달.

**핵심 사용자 시나리오:**
- 토론 주제 설정 → AI 팀장들이 라운드별로 토론
- 진행 중인 토론 실시간 관전 (5초 자동 갱신)
- 완료된 토론 타임라인 열람
- 토론 결과 Diff 뷰 + 합의/비합의 확인

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌────────────┬─────────────────────┬────────────────┐
│ DebateList  │   DebateTimeline    │ DebateInfoPanel│
│ (w-72)     │   (flex-1)          │ (w-72, lg만)   │
│            │                     │                │
│ [+ 새 토론] │  토론 주제 헤더       │ 참여자 목록    │
│            │  라운드별 발언        │ 상태           │
│ 토론 목록   │  실시간 업데이트      │ 유형           │
│ - 주제     │                     │ 라운드 정보    │
│ - 상태     │                     │                │
│ - 날짜     │                     │                │
└────────────┴─────────────────────┴────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ DebateListPanel     │  ← mobileView='list'
│ 토론 목록 (전체 너비) │
└─────────────────────┘

┌─────────────────────┐
│ [← 목록으로]         │  ← mobileView='detail'
│ 토론 주제            │
│ DebateTimeline      │
│ (InfoPanel 숨김)    │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **토론 목록 시각적 단조로움**: 주제+상태만 표시, 참여자 수나 라운드 진행도 없음
2. **타임라인 가독성**: 라운드별 발언이 긴 텍스트로 나열되어 읽기 부담
3. **진행중 토론 시각 피드백**: animate-pulse 점만으로 진행 상태 전달 부족
4. **InfoPanel 접근성**: lg(1024px) 이상에서만 표시, 태블릿에서 참여자 정보 확인 불가
5. **빈 상태**: 토론 미선택 시 이모지+텍스트만 있어 단조로움
6. **"사령관실로 돌아가기" 텍스트**: v1 군사 테마 잔재
7. **새 토론 모달**: CreateDebateModal의 UX가 기본적임
8. **Diff 뷰 부재**: v1에 있던 라운드 간 의견 변화 비교 기능이 UI에 노출 안 됨

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 토론/포럼 느낌 (Reddit, StackOverflow, 또는 법정 토론 같은 구조화된 대화)
- 라운드 구분이 시각적으로 명확해야 함

### 4.2 레이아웃 개선
- **토론 목록**: 진행도 표시 (라운드 N/M), 참여자 아바타
- **타임라인**: 발언자별 색상 구분, 라운드 구분선 강화
- **진행중 표시**: 더 눈에 띄는 라이브 인디케이터

### 4.3 인터랙션 개선
- 토론 생성: 주제 + 유형(일반/심층) + 참여자 선택 UX 개선
- Diff 뷰: 타임라인 상단에 "Diff 보기" 토글 버튼 배치. 활성화 시 라운드 간 동일 참여자의 의견 변화를 나란히 비교 표시 (v1 기능 복원). 기존 timeline API 데이터를 클라이언트에서 재가공 (API 변경 없음)
- "사령관실로 돌아가기" → "채팅으로 돌아가기"로 텍스트 변경 (v1 군사 테마 잔재 제거)

### 4.4 상태 정의
- **로딩 상태**: 토론 목록 로딩 시 스켈레톤 카드 3개 표시, 타임라인 로딩 시 중앙 스피너
- **에러 상태**: "토론을 불러오지 못했습니다. 다시 시도해주세요" + 재시도 버튼
- **토론 생성 실패**: 모달 내 인라인 에러 메시지 표시
- **토론 0개 빈 상태**: 목록 패널에 "아직 토론이 없습니다" + 새 토론 CTA 버튼 표시

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | AgoraPage | 레이아웃 조정, "채팅으로 돌아가기" 텍스트 수정 | pages/agora.tsx |
| 2 | DebateListPanel | 카드 스타일, 진행도 추가 | components/agora/debate-list-panel.tsx |
| 3 | DebateTimeline | 발언 카드 디자인, 라운드 구분, Diff 뷰 토글 | components/agora/debate-timeline.tsx |
| 4 | DebateInfoPanel | 정보 패널 스타일 개선 | components/agora/debate-info-panel.tsx |
| 5 | CreateDebateModal | 토론 생성 UX 개선 | components/agora/create-debate-modal.tsx |
| 6 | DebateResultCard | 채팅 내 토론 결과 카드 스타일 개선 (관련 컴포넌트) | components/agora/debate-result-card.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| selectedDebate | useState | 선택된 토론 |
| debateDetail | useQuery → /workspace/debates/:id | 토론 상세 (5초 갱신) |
| timelineData | useQuery → /workspace/debates/:id/timeline | 타임라인 항목 |
| mobileView | useState ('list' or 'detail') | 모바일 뷰 전환 |
| fromChat | location.state.fromChat | 채팅에서 왔는지 여부 |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/debates` — 토론 목록
- `GET /api/workspace/debates/:id` — 토론 상세
- `GET /api/workspace/debates/:id/timeline` — 타임라인
- `POST /api/workspace/debates` — 토론 생성

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 진행중 토론 | 에메랄드 점 + 라이브 텍스트 |
| 완료된 토론 | 중립 색상 |
| 라운드 구분 | 각 라운드별 시각적 구분선 |
| 발언자별 | 에이전트마다 고유 색상/아바타 |
| 합의 | 초록 뱃지 |
| 비합의 | 노랑/빨강 뱃지 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 3컬럼 (목록 + 타임라인 + 정보) |
| **768px~1023px** (Tablet) | 2컬럼 (목록 + 타임라인), 정보 숨김. 타임라인 헤더에 참여자 수 + 토론 유형 + 라운드 진행도 요약 표시 |
| **~375px** (Mobile) | 1컬럼: 목록 ↔ 상세 전환, Diff 뷰는 세로 스택(위: 이전 라운드, 아래: 현재 라운드) |

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 5번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 토론 생성 (일반 2라운드 / 심층 3라운드)
- [x] 라운드 기반 토론 진행
- [x] 실시간 업데이트 (진행중 토론 5초 자동 갱신)
- [x] 타임라인 열람
- [x] 참여자 목록 + 상태
- [x] 채팅에서 토론으로 이동 (fromChat)
- [x] Diff 뷰 (라운드 간 의견 변화 비교) — UI 노출 복원
- [x] 합의/비합의 결과 뱃지 표시

**UI 변경 시 절대 건드리면 안 되는 것:**
- autoDebateId 기반 자동 선택 로직
- debateDetail refetchInterval (5초) 로직
- CreateDebateModal의 토론 생성 API 호출
- location.state 기반 fromChat 네비게이션

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents.

This page: A debate arena where AI agents (team leaders) hold structured, round-based discussions on topics chosen by the user. The user watches as multiple AI agents present their arguments, counter-arguments, and reach consensus (or disagreement).

User workflow:
1. User sees a list of past and ongoing debates in the left panel
2. User can create a new debate by specifying a topic and type (standard: 2 rounds, deep: 3 rounds)
3. The center panel shows the debate timeline — each round, each agent's statement, and the progression toward consensus
4. If a debate is in-progress, it updates in real-time (auto-refresh every 5 seconds)
5. The right panel shows debate metadata: participants, status, type, round progress

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Debate list panel (left, ~280px) — list of debates with: topic (truncated), status (in-progress with live indicator / completed), date, participant count, round progress (e.g., "Round 2/3").
2. Debate timeline (center, flexible) — the main content. Shows: debate topic as header, status badge, round separators, and individual agent statements as cards. Each statement shows agent name, department, and their argument text. Live debates show a pulsing indicator.
3. Debate info panel (right, ~280px, desktop only) — participants with avatars, debate type (standard/deep), status, creation date, round count.
4. "New Debate" button — opens a modal where user sets topic and debate type.
5. Empty state — when no debate is selected, show a welcoming message encouraging the user to start or select a debate.
6. In-progress indicator — clearly visible live indicator for ongoing debates.
7. Diff view toggle — a button at the top of the timeline that, when activated, shows a side-by-side comparison of how each participant's opinion changed between rounds.
8. Loading state (skeleton cards for debate list, spinner for timeline), error state (error message + retry button).

Design tone — YOU DECIDE:
- This is a structured discussion/debate viewer. Think of it like a courtroom or academic panel discussion viewer.
- Each agent's contribution should be visually distinct (unique color/avatar per agent).
- Round transitions should feel like chapter breaks.
- Light or dark theme — your choice.

Design priorities:
1. The debate timeline must be the visual focal point — easy to read and follow.
2. Round boundaries must be obvious (which statements belong to which round).
3. Live status must be immediately visible.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

### 모바일 버전
```
Mobile version (375x812) of the same debate arena page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Two views that toggle: Debate List and Debate Detail
- Debate Detail shows timeline only (info panel hidden)
- Back button to return to list
- "New Debate" button accessible from list view

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `agora-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `debate-list-panel` | 토론 목록 패널 | 목록 영역 |
| `debate-item` | 토론 항목 | 개별 토론 선택 |
| `debate-create-btn` | 새 토론 버튼 | 모달 열기 |
| `debate-create-modal` | 생성 모달 | 모달 표시 |
| `debate-topic-input` | 주제 입력 | 토론 주제 |
| `debate-type-select` | 유형 선택 | 일반/심층 |
| `debate-timeline` | 타임라인 컨테이너 | 타임라인 영역 |
| `debate-round-separator` | 라운드 구분선 | 라운드 전환 |
| `debate-statement` | 발언 카드 | 개별 발언 |
| `debate-info-panel` | 정보 패널 | 메타데이터 |
| `debate-live-indicator` | 라이브 표시 | 진행중 토론 |
| `debate-empty-state` | 빈 상태 | 토론 미선택 |
| `debate-back-btn` | 뒤로가기 (모바일) | 목록 복귀 |
| `debate-status-badge` | 상태 뱃지 | 완료/진행중 |
| `debate-create-submit` | 생성 모달 제출 버튼 | 토론 생성 실행 |
| `debate-consensus-badge` | 합의 결과 뱃지 | 합의/비합의/부분합의 |
| `debate-back-to-chat` | 채팅 복귀 버튼 | fromChat 시 채팅으로 돌아가기 |
| `debate-diff-toggle` | Diff 뷰 토글 | 라운드 간 비교 활성화 |
| `debate-diff-view` | Diff 비교 뷰 | 라운드 간 의견 변화 표시 |
| `debate-loading` | 로딩 상태 | 스켈레톤/스피너 |
| `debate-error` | 에러 상태 | 에러 메시지 + 재시도 |
| `debate-result-card` | 토론 결과 카드 (채팅 내) | 채팅에서 토론 결과 표시 |
| `debate-retry-btn` | 재시도 버튼 | 에러 시 재시도 |
| `debate-participant-summary` | 참여자 요약 (태블릿/모바일) | 타임라인 헤더 내 참여자 요약 |
| `debate-list-empty` | 토론 0개 빈 상태 | 토론 목록이 비어있을 때 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /agora 접속 | `agora-page` 존재 |
| 2 | 토론 목록 | 로드 완료 | 토론 항목들 표시 |
| 3 | 토론 선택 | 토론 클릭 | 타임라인 표시 |
| 4 | 새 토론 | + 버튼 클릭 | `debate-create-modal` 표시 |
| 5 | 토론 생성 | 주제 입력 + 생성 | 새 토론 목록에 추가 |
| 6 | 빈 상태 | 토론 미선택 | `debate-empty-state` 표시 |
| 7 | 모바일 뷰 | 375px에서 토론 클릭 | 상세 뷰 전환 |
| 8 | 모바일 뒤로 | 뒤로 클릭 | 목록 뷰 복귀 |
| 9 | 반응형 | 375px 뷰포트 | 1컬럼 레이아웃 |
| 10 | Diff 뷰 토글 | 완료된 토론에서 Diff 토글 클릭 | `debate-diff-view` 표시 |
| 11 | 로딩 상태 | 페이지 최초 로드 | `debate-loading` 표시 후 콘텐츠 전환 |
| 12 | 에러 상태 | API 실패 시뮬레이션 | `debate-error` + 재시도 버튼 표시 |
| 13 | 합의 뱃지 | 완료된 토론 선택 | `debate-consensus-badge` 표시 |
