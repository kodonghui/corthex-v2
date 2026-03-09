# Reports (보고서) UX/UI 설명서

> 페이지: #13 reports
> 패키지: app
> 경로: /reports
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트가 작성한 보고서를 관리하는 페이지. 보고서 작성(초안) → CEO 보고(제출) → 검토 완료까지의 **보고서 라이프사이클**을 한 화면에서 처리.

**핵심 사용자 시나리오:**
- 사용자가 마크다운으로 보고서 초안 작성
- 초안을 CEO에게 제출 (상태: draft → submitted)
- CEO가 검토 완료 처리 (상태: submitted → reviewed)
- 제출된 보고서에 코멘트 주고받기 (채팅 형태)
- 완료된 보고서를 마크다운 파일로 다운로드하거나 메신저로 공유

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "보고서"                   [+ 새 보고서]    │
├─────────────────────────────────────────────────────┤
│  Tabs: [전체 (N)] [내 보고서 (N)] [받은 보고서 (N)]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ReportList (max-w-2xl)                             │
│  ┌───────────────────────────────────────────┐      │
│  │ 보고서 제목          [Badge: 초안/제출/검토] │      │
│  │ 본문 미리보기 (120자)                      │      │
│  │ 작성자 · 날짜                              │      │
│  └───────────────────────────────────────────┘      │
│  ┌───────────────────────────────────────────┐      │
│  │ ...반복                                   │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 상세 뷰 (데스크톱)
```
┌─────────────────────────────────────────────────────┐
│  [← 목록]  "보고서 상세"                              │
├─────────────────────────────────────────────────────┤
│  [Badge: 상태]  작성: 이름 · 날짜  · 제출: 날짜       │
│  (CEO 보고 안내 메시지)                               │
│                                                     │
│  ┌── 보고서 제목 (h2) ──────────────────────────┐    │
│  │                                              │    │
│  │  MarkdownRenderer (bg-zinc-50)               │    │
│  │  보고서 본문 렌더링                           │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                     │
│  ──────── 액션 버튼 ────────                         │
│  [수정] [📤 CEO에게 보고] [삭제]      (draft 상태)    │
│  [📥 다운로드] [💬 메신저로 공유]     (submitted 이후) │
│  [검토 완료]                        (받은 보고서)     │
│                                                     │
│  ──────── 코멘트 섹션 ────────                       │
│  코멘트 (N)                                         │
│  [이전 코멘트 N개 더 보기]                            │
│  ┌─────────────────────────────┐                    │
│  │ 작성자 · 시간               │  ← 일반 코멘트     │
│  │ 코멘트 내용                  │                    │
│  └─────────────────────────────┘                    │
│            ┌─────────────────────────────┐          │
│            │ CEO · 시간                  │ ← CEO    │
│            │ 코멘트 내용 (인디고 배경)     │          │
│            └─────────────────────────────┘          │
│  [코멘트 입력...]                      [전송]        │
│                                                     │
│  ──────── 하단 CTA ────────                         │
│  [에이전트와 이어서 논의하기 →]                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ [← 목록] "보고서"    │
├─────────────────────┤
│ Tabs: [전체][내][받은]│
├─────────────────────┤
│ 보고서 카드 목록      │
│ (1컬럼, 풀폭)        │
│                     │
│ ...                 │
│                     │
├─────────────────────┤
│ [+ 새 보고서]       │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **목록 폭 제한**: `max-w-2xl`로 제한되어 넓은 화면에서 좌측에만 몰려 빈 공간 낭비
2. **카드 정보 밀도 부족**: 보고서 카드에 상태 아이콘 + 텍스트만 있어 제출일, 코멘트 수 등 핵심 정보 누락
3. **상세 뷰 전환 방식**: SPA 내 상태 전환(list/create/detail)인데, URL과 뷰 상태가 동기화되지 않는 케이스 존재
4. **코멘트 UI 단조로움**: 채팅 형태이나 말풍선 구분이 배경색만으로 되어 시각적 구분이 약함
5. **액션 버튼 혼재**: 상태별 액션 버튼이 한 줄에 나열되어 주요 액션과 부가 액션 구분 어려움
6. **빈 상태 온보딩**: 보고서가 없을 때 단순 텍스트만 표시, 작성 유도가 약함
7. **모바일 sticky 버튼**: 액션 버튼이 sticky bottom이지만 코멘트 입력과 겹칠 수 있음
8. **검색/정렬 부재**: 보고서가 많아지면 원하는 보고서 찾기 어려움
9. **마크다운 에디터**: 작성 시 단순 Textarea만 제공, 미리보기 없음
10. **로딩 상태**: 목록 로딩은 Skeleton이 있으나 상세 뷰 로딩이 산만함

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** -- 특정 테마 강제하지 않음
- 상태별 색상 구분 유지 (초안: 회색, 제출: 앰버, 검토완료: 그린)
- 보고서 콘텐츠는 읽기 편한 타이포그래피 우선
- 코멘트 섹션은 메신저 느낌 유지하되 좌/우 정렬 + 아바타 강화

### 4.2 레이아웃 개선
- **목록 뷰 폭 확장**: max-w-2xl → max-w-4xl로 확대하거나, 카드 그리드 적용
- **카드 정보 강화**: 코멘트 수, 첨부 여부, 최종 수정일 등 메타데이터 추가
- **마크다운 프리뷰**: 작성/수정 시 좌우 분할(편집 + 프리뷰) 또는 탭 전환
- **액션 버튼 그룹핑**: 주요 액션(CTA)과 부가 액션(더보기 메뉴) 분리

### 4.3 인터랙션 개선
- 보고서 목록에 검색 + 상태 필터 추가
- 코멘트에 타임스탬프 + 아바타 개선
- 제출 확인 다이얼로그에 안내 메시지 강화

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | ReportsPage | 검색/필터 추가, 레이아웃 spacing 조정 | pages/reports.tsx |
| 2 | ReportCard | 카드 디자인 강화, 메타정보 추가 | pages/reports.tsx (인라인) |
| 3 | ReportDetailView | 상세 뷰 타이포그래피 + 액션 버튼 그룹핑 | pages/reports.tsx (인라인) |
| 4 | ReportEditor | 마크다운 편집 + 프리뷰 모드 | pages/reports.tsx (인라인) |
| 5 | CommentSection | 코멘트 UI 개선 (아바타, 정렬, 타임스탬프) | pages/reports.tsx (인라인) |
| 6 | MarkdownRenderer | 기존 유지 (스타일만 조정) | components/markdown-renderer.tsx |
| 7 | ShareToConversationModal | 기존 유지 | components/messenger/share-to-conversation-modal.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| reports | useQuery ['reports', { tab, search }] | 보고서 목록 (탭/검색 필터 포함) |
| reportDetail | useQuery ['report', id] | 보고서 상세 정보 |
| comments | useQuery ['reportComments', id] | 코멘트 목록 (최근 5개 + lazy load) |
| user | useAuthStore | 현재 로그인 사용자 (작성자/수신자 판별) |

**API 엔드포인트 (변경 없음):**
- `GET /api/workspace/reports` -- 보고서 목록
- `GET /api/workspace/reports/:id` -- 보고서 상세
- `POST /api/workspace/reports` -- 보고서 생성 (초안)
- `PUT /api/workspace/reports/:id` -- 보고서 수정
- `DELETE /api/workspace/reports/:id` -- 보고서 삭제
- `POST /api/workspace/reports/:id/submit` -- CEO에게 제출
- `POST /api/workspace/reports/:id/review` -- 검토 완료 처리
- `GET /api/workspace/reports/:id/comments?limit=5&before=:id` -- 코멘트 목록 (페이징)
- `POST /api/workspace/reports/:id/comments` -- 코멘트 작성
- `GET /api/workspace/reports/:id/download` -- 마크다운 파일 다운로드

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 초안(draft) 뱃지 | 기본 그레이 | bg-zinc-100 text-zinc-600 |
| 제출됨(submitted) 뱃지 | 앰버 | bg-amber-100 text-amber-700 |
| 검토완료(reviewed) 뱃지 | 그린 | bg-emerald-100 text-emerald-700 |
| CTA 버튼 (보고/저장) | 인디고 | bg-indigo-600 text-white |
| 검토 완료 버튼 | 그린 | bg-green-600 text-white |
| 삭제 버튼 | 레드 텍스트 | text-red-500 |
| CEO 코멘트 배경 | 인디고 톤 | bg-indigo-50 dark:bg-indigo-950/20 |
| 일반 코멘트 배경 | 그레이 톤 | bg-zinc-50 dark:bg-zinc-800/50 |
| 마크다운 렌더링 배경 | 연한 그레이 | bg-zinc-50 dark:bg-zinc-800/50 |
| 다운로드/공유 버튼 | 보더 스타일 | border-zinc-300 hover:bg-zinc-50 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 1컬럼 넓은 폭 (max-w-4xl), 카드 여유 패딩 |
| **768px~1439px** (Tablet) | 1컬럼, 상세 뷰 동일 구조 |
| **~375px** (Mobile) | 카드 풀폭, 액션 버튼 sticky bottom, 코멘트 입력 하단 고정 |

**모바일 특별 처리:**
- 액션 버튼: sticky bottom 영역에 주요 버튼만 노출, 부가 기능은 더보기 메뉴
- 코멘트 입력: 하단 고정, 키보드 올라올 때 유지
- 마크다운 에디터: 프리뷰 탭 전환 (좌우 분할 불가)
- 보고서 카드: 터치 영역 확보 (min-height 48px)

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 12번(기밀문서/Archive) 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 보고서 CRUD (생성, 수정, 삭제)
- [x] 상태 관리 (draft → submitted → reviewed)
- [x] CEO 보고 기능 (submit)
- [x] 검토 완료 처리 (review)
- [x] 코멘트 작성/열람 (채팅 형태)
- [x] 코멘트 페이징 (최근 5개 + lazy load)
- [x] 마크다운 렌더링 (MarkdownRenderer)
- [x] 마크다운 파일 다운로드
- [x] 메신저로 공유 (ShareToConversationModal)
- [x] 에이전트와 이어서 논의하기 (채팅 연결)
- [x] 탭 필터 (전체/내 보고서/받은 보고서)
- [x] URL 기반 상세 뷰 (/reports/:id)

**UI 변경 시 절대 건드리면 안 되는 것:**
- Report/Comment 타입 정의 및 API 호출 로직
- useAuthStore 기반 사용자 판별 로직 (isMyReport, isReceivedReport)
- 상태 전환 mutation (submit, review) 로직
- 라우터 연동 (useNavigate, useParams)

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like Slack or Linear, but instead of messaging coworkers, you're giving tasks to AI employees and watching them collaborate to deliver results.

This page: A reports management page where AI-generated reports go through a lifecycle of draft → submitted → reviewed. Users write reports in markdown, submit them for review, and exchange comments with reviewers.

User workflow:
1. User views a list of reports filtered by tabs: All, My Reports, Received Reports.
2. User clicks a report card to see the full detail — rendered markdown content, status badge, metadata (author, dates).
3. On draft reports, user can edit, submit to CEO, or delete. On submitted reports, user can download as markdown file or share to messenger.
4. Below the report content, there's a comment thread (chat-style) where the author and reviewer exchange feedback.
5. User can create new reports with a markdown editor.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements (you decide the optimal arrangement):
1. Report list view — cards showing report title, status badge (draft/submitted/reviewed), content preview (first 120 chars), author name, and date. Filterable by tabs: All / My Reports / Received Reports.
2. Report detail view — full markdown-rendered content with status badge, author info, creation/submission dates. Action buttons change based on status (edit/submit/delete for drafts, download/share for submitted).
3. Comment section — chat-style thread below the report content. Author comments align left, reviewer/CEO comments align right with a distinct background color. Supports lazy loading older comments.
4. Comment input — text input with send button at the bottom of the comment section.
5. Report editor — markdown textarea for creating/editing reports. Title input + content textarea.
6. Submit confirmation dialog — warns that report content becomes locked after submission.
7. Empty state — when no reports exist, show encouraging text and a create button.
8. Loading state — skeleton UI while report list loads.

Design tone — YOU DECIDE:
- This is a professional document management interface. Reports are formal deliverables from AI agents.
- Clean, readable typography is critical — reports can be long markdown documents.
- Status colors should be clearly distinguishable (draft=neutral, submitted=amber/warning, reviewed=green/success).
- The comment section should feel like a lightweight messenger embedded within the page.
- Light theme, dark theme, or mixed — your choice.

Design priorities (in order):
1. Report content readability — markdown rendering must be clean and scannable.
2. Status visibility — report lifecycle state must be immediately obvious.
3. Comment flow — the comment thread should feel natural and easy to follow.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: a platform where users manage AI agents. This page manages AI-generated reports through a draft → submitted → reviewed lifecycle with markdown rendering and comment threads.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Report list with tab filters (All / My Reports / Received)
2. Report detail with rendered markdown content
3. Action buttons (sticky bottom area for primary actions)
4. Comment thread (chat-style, scrollable)
5. Comment input (bottom-positioned, above action bar)
6. Report editor (full-screen markdown textarea)
7. Status badges (draft / submitted / reviewed)
8. Loading / empty / error states

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Report content must be readable on small screens without horizontal scrolling.
2. Action buttons must be reachable with one thumb at the bottom.
3. Comment input should stay visible when scrolling through comments.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `reports-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `reports-tab-all` | 전체 탭 | 탭 전환 |
| `reports-tab-mine` | 내 보고서 탭 | 탭 전환 |
| `reports-tab-received` | 받은 보고서 탭 | 탭 전환 |
| `reports-create-btn` | + 새 보고서 버튼 | 생성 뷰 전환 |
| `reports-list` | 보고서 목록 컨테이너 | 목록 표시 영역 |
| `reports-card` | 보고서 카드 | 개별 보고서 항목 |
| `reports-status-badge` | 상태 뱃지 | 상태 확인 |
| `reports-empty-state` | 빈 상태 | 보고서 없을 때 |
| `reports-loading-skeleton` | 로딩 스켈레톤 | 목록 로딩 중 |
| `reports-title-input` | 제목 입력 | 보고서 작성 |
| `reports-content-textarea` | 본문 입력 | 보고서 작성 |
| `reports-save-draft-btn` | 초안 저장 버튼 | 초안 저장 |
| `reports-cancel-btn` | 취소 버튼 | 작성 취소 |
| `reports-back-btn` | ← 목록 버튼 | 목록으로 돌아가기 |
| `reports-detail-title` | 상세 뷰 제목 | 보고서 제목 표시 |
| `reports-detail-content` | 마크다운 렌더링 영역 | 본문 표시 |
| `reports-edit-btn` | 수정 버튼 | 수정 모드 전환 |
| `reports-submit-btn` | CEO에게 보고 버튼 | 제출 |
| `reports-delete-btn` | 삭제 버튼 | 보고서 삭제 |
| `reports-review-btn` | 검토 완료 버튼 | 검토 완료 처리 |
| `reports-download-btn` | 다운로드 버튼 | 마크다운 파일 다운로드 |
| `reports-share-btn` | 메신저 공유 버튼 | 메신저 공유 |
| `reports-submit-confirm` | 제출 확인 다이얼로그 | CEO 보고 확인 |
| `reports-delete-confirm` | 삭제 확인 다이얼로그 | 삭제 확인 |
| `reports-comment-list` | 코멘트 목록 | 코멘트 표시 영역 |
| `reports-comment-item` | 코멘트 항목 | 개별 코멘트 |
| `reports-comment-input` | 코멘트 입력 | 코멘트 작성 |
| `reports-comment-send-btn` | 코멘트 전송 버튼 | 코멘트 전송 |
| `reports-load-more-btn` | 이전 코멘트 더 보기 | 코멘트 lazy load |
| `reports-discuss-btn` | 에이전트와 논의 버튼 | 채팅 연결 |
| `reports-share-modal` | 공유 모달 | 메신저 공유 모달 |
| `reports-search-input` | 검색 입력 | 보고서 검색 |
| `reports-search-clear` | 검색 초기화 버튼 | 검색어 삭제 |
| `reports-error-state` | 에러 상태 | API 실패 시 표시 |
| `reports-error-retry-btn` | 에러 재시도 버튼 | 목록 재로드 |
| `reports-editor-preview-tab` | 프리뷰 탭 | 마크다운 프리뷰 전환 |
| `reports-editor-edit-tab` | 편집 탭 | 마크다운 편집 전환 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /reports 접속 | `reports-page` 존재, 로그인 안 튕김 |
| 2 | 빈 상태 표시 | 보고서 없을 때 | `reports-empty-state` 표시 |
| 3 | 탭 전환 | 내 보고서 탭 클릭 | 내 보고서만 필터링 |
| 4 | 새 보고서 작성 | + 새 보고서 클릭 → 제목/본문 입력 → 저장 | 보고서 생성, 상세 뷰 전환 |
| 5 | 보고서 카드 클릭 | 목록에서 카드 클릭 | 상세 뷰 전환, URL 변경 (/reports/:id) |
| 6 | 보고서 수정 | 수정 버튼 → 내용 변경 → 저장 | 수정 반영 |
| 7 | CEO에게 보고 | 보고 버튼 → 확인 다이얼로그 → 확인 | 상태 submitted 변경, 수정 불가 |
| 8 | 검토 완료 | (받은 보고서) 검토 완료 클릭 | 상태 reviewed 변경 |
| 9 | 보고서 삭제 | 삭제 → 확인 | 목록에서 제거 |
| 10 | 코멘트 작성 | 코멘트 입력 → 전송 | 코멘트 목록에 추가 |
| 11 | 코멘트 Enter 전송 | Enter 키 | 코멘트 전송 |
| 12 | 이전 코멘트 로드 | 더 보기 버튼 클릭 | 이전 코멘트 표시 |
| 13 | 다운로드 | 다운로드 버튼 클릭 | 파일 다운로드 시작 |
| 14 | 메신저 공유 | 공유 버튼 → 모달 | `reports-share-modal` 표시 |
| 15 | 목록 돌아가기 | ← 목록 버튼 클릭 | 목록 뷰 전환, URL /reports |
| 16 | 반응형 레이아웃 | 375px 뷰포트 | 카드 풀폭, 액션 버튼 sticky |
| 17 | 빈 전송 방지 | 제목 없이 저장 시도 | 저장 버튼 비활성화 |
| 18 | 에이전트 논의 | 논의하기 버튼 클릭 | /chat?newSession=true 이동 |
| 19 | URL 직접 접근 | /reports/:id 직접 접속 | 상세 뷰 바로 표시 |
| 20 | 로딩 스켈레톤 | 목록 로딩 중 | `reports-loading-skeleton` 표시 |
| 21 | 검색 기능 | 검색 입력 → 키워드 입력 | 보고서 목록 필터링 |
| 22 | 에러 상태 표시 | API 실패 시 | `reports-error-state` 표시, 재시도 버튼 |
| 23 | 마크다운 프리뷰 전환 | 편집 중 프리뷰 탭 클릭 | 마크다운 렌더링 표시 |
| 24 | 빈 코멘트 전송 방지 | 코멘트 없이 전송 시도 | 전송 버튼 비활성화 |
