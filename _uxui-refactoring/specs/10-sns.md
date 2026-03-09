# SNS 퍼블리싱 UX/UI 설명서

> 페이지: #10 SNS 퍼블리싱
> 패키지: app
> 경로: /sns
> 작성일: 2026-03-09

---

## 1. 페이지 목적

AI 에이전트가 생성한 SNS 콘텐츠를 **기획 - 생성 - 승인 - 예약 - 발행**까지 한 곳에서 관리하는 퍼블리싱 허브. 인스타그램, YouTube, 티스토리, 다음카페, LinkedIn 등 멀티 플랫폼을 지원하며, A/B 테스트와 카드뉴스 시리즈 제작까지 포함한다.

**핵심 사용자 시나리오:**
- AI 에이전트에게 주제를 던져서 콘텐츠 + 이미지를 자동 생성
- 생성된 콘텐츠를 검토 후 승인/반려 처리
- 승인된 콘텐츠를 예약 발행 큐에 등록
- 카드뉴스 시리즈를 만들어 멀티 이미지 발행
- A/B 변형을 생성하고 성과를 비교
- SNS 계정을 등록/관리

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Header: "SNS 통신국"                                │
│  [콘텐츠] [발행 큐] [카드뉴스] [통계] [계정 관리]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  (탭별 콘텐츠 영역)                                   │
│                                                     │
│  ── 콘텐츠 탭 ──                                     │
│  [계정 필터▼] [□ 원본만] [목록|갤러리]    [+ 새 콘텐츠] │
│  ┌───────────────────────────────────────────┐      │
│  │ 인스타그램 · @계정명 · 초안                 │      │
│  │ 콘텐츠 제목                                │      │
│  │ 작성자 · 2026.03.09                        │      │
│  └───────────────────────────────────────────┘      │
│  (반복...)                                          │
│                                                     │
│  ── 상세 뷰 (콘텐츠 클릭 시) ──                      │
│  ← 목록으로                                         │
│  [StatusStepper: 초안→승인대기→승인→예약→발행]        │
│  제목 / 본문 / 이미지 / 해시태그                      │
│  [승인요청] [승인] [반려] [발행] [이미지생성] [삭제]    │
│  ── A/B 테스트 ──                                   │
│  [변형복제] [AI변형생성] [성과입력] [결과비교]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "SNS 통신국"         │
│ [콘텐츠][큐][카드]... │  ← shortLabel로 축약
├─────────────────────┤
│                     │
│ [필터] [+ 새 콘텐츠] │
│                     │
│ ┌─────────────────┐ │
│ │ 콘텐츠 카드       │ │
│ │ 제목 / 상태      │ │
│ └─────────────────┘ │
│ (반복...)           │
│                     │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **탭 과다**: 5개 탭이 모바일에서 가로 스크롤 없이 보기 어려움 (shortLabel로 축약하지만 여전히 빽빽함)
2. **목록/상세 전환 방식**: SPA 내 뷰 전환(list/create/detail)이 URL에 반영되지 않아 뒤로 가기가 직관적이지 않음
3. **갤러리 뷰 활용도 낮음**: 이미지 없는 콘텐츠가 갤러리에서 제외되어 빈 화면이 될 수 있음
4. **A/B 테스트 UI 복잡**: 변형 생성, 성과 입력, 결과 비교가 한 화면에 밀집되어 정보 과부하
5. **승인 플로우 가시성**: StatusStepper가 상세 뷰에만 있어 목록에서는 현재 단계를 한눈에 파악하기 어려움
6. **카드뉴스 편집**: 카드 순서 변경(위/아래 버튼)이 드래그앤드롭 대비 불편
7. **통계 차트**: 막대 그래프가 div 높이 기반이라 정밀한 데이터 비교가 어려움
8. **빈 상태 디자인**: 각 탭별 빈 상태가 텍스트만 있어 시각적으로 밋밋함
9. **계정 관리 인증 정보**: JSON 직접 입력 방식이 비개발자에게 불친절
10. **발행 큐 상태 카드**: 4개 요약 카드가 좁은 화면에서 깨질 수 있음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 v0.dev가 결정** -- 특정 테마 강제하지 않음
- 상태별 색상 구분은 유지 (초안/대기/승인/예약/발행/실패를 시각적으로 명확히)
- 플랫폼별 아이콘/색상 코드로 빠른 식별

### 4.2 레이아웃 개선
- **탭 스크롤**: 모바일에서 5개 탭이 가로 스크롤 가능하도록 처리
- **콘텐츠 카드 강화**: 목록에서 상태 스텝 미니 인디케이터 표시
- **갤러리 뷰 개선**: 이미지 없는 콘텐츠도 플레이스홀더 썸네일로 표시
- **A/B 테스트 분리**: 별도 섹션으로 시각적 구분, 접이식 처리

### 4.3 인터랙션 개선
- 카드뉴스 카드 순서 변경: 드래그앤드롭 도입 검토
- 계정 관리: API키/토큰 필드를 개별 입력으로 분리
- 통계: 호버 시 수치 툴팁

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | SnsPage | 탭 레이아웃 spacing, 모바일 탭 스크롤 | pages/sns.tsx |
| 2 | ContentTab | 목록 카드 디자인, 상태 미니 인디케이터 추가 | components/sns/content-tab.tsx |
| 3 | QueueTab | 요약 카드 반응형 정리, 배치 액션 UI 개선 | components/sns/queue-tab.tsx |
| 4 | CardNewsTab | 시리즈 카드 디자인, 생성 폼 레이아웃 | components/sns/card-news-tab.tsx |
| 5 | CardNewsDetail | 카드 뷰어/편집기 UI 개선 | components/sns/card-news-detail.tsx |
| 6 | StatsTab | 차트 비주얼 강화, 기간 선택 UI | components/sns/stats-tab.tsx |
| 7 | AccountsTab | 계정 카드 디자인, 인증 정보 UX 개선 | components/sns/accounts-tab.tsx |
| 8 | StatusStepper | 컬러 강화, 미니 모드 추가 | components/sns/status-stepper.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| snsContents | useQuery → GET /workspace/sns | 콘텐츠 목록 |
| snsDetail | useQuery → GET /workspace/sns/:id | 콘텐츠 상세 |
| snsAccounts | useQuery → GET /workspace/sns-accounts | 계정 목록 |
| agents | useQuery → GET /workspace/agents | AI 에이전트 목록 (생성용) |
| queueItems | useQuery → GET /workspace/sns/queue | 발행 큐 목록 |
| queueStats | useQuery → GET /workspace/sns/queue/stats | 큐 요약 통계 |
| snsStats | useQuery → GET /workspace/sns/stats?days=N | 기간별 통계 |
| abResults | useQuery → GET /workspace/sns/:id/ab-results | A/B 테스트 결과 |

**API 엔드포인트 (변경 없음):**
- CRUD: `/workspace/sns`, `/workspace/sns/:id`
- 워크플로우: `/workspace/sns/:id/submit`, `/approve`, `/reject`, `/engine-publish`, `/cancel-schedule`
- AI 생성: `/workspace/sns/generate-with-image`, `/workspace/sns/:id/generate-image`
- 변형: `/workspace/sns/:id/create-variant`, `/generate-variants`
- 성과: `/workspace/sns/:id/metrics`, `/ab-results`
- 배치: `/workspace/sns/batch-schedule`, `/batch-cancel`
- 카드뉴스: `/workspace/sns/card-series`, `/card-series/generate`
- 계정: CRUD `/workspace/sns-accounts`

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 초안 상태 | 그레이 | bg-zinc-100 text-zinc-700 |
| 승인 대기 | 옐로 | bg-yellow-100 text-yellow-800 |
| 승인됨 | 그린 | bg-green-100 text-green-800 |
| 예약됨 | 블루 | bg-blue-100 text-blue-800 |
| 발행 완료 | 인디고 | bg-indigo-100 text-indigo-800 |
| 반려됨 | 레드 | bg-red-100 text-red-800 |
| 발행 실패 | 레드 | bg-red-100 text-red-800 |
| 발행 중 | 퍼플 | bg-purple-100 text-purple-800 |
| 변형 뱃지 | 퍼플 | bg-purple-100 text-purple-700 |
| 카드뉴스 뱃지 | 오렌지 | bg-orange-100 text-orange-700 |
| CTA 버튼 | 인디고 | bg-indigo-600 text-white |
| 카드뉴스 CTA | 오렌지 | bg-orange-600 text-white |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 탭 풀 라벨, 갤러리 4컬럼, 요약 카드 4컬럼, 넓은 패딩 |
| **768px~1439px** (Tablet) | 탭 풀 라벨, 갤러리 3컬럼, 요약 카드 2~4컬럼 |
| **~375px** (Mobile) | 탭 shortLabel + 가로 스크롤, 갤러리 2컬럼, 요약 카드 2컬럼, 폼 풀 너비 |

**모바일 특별 처리:**
- 변형 생성 모달: 풀스크린
- A/B 결과 비교: 세로 스택 (가로 비교 대신)
- 콘텐츠 상세: 액션 버튼 가로 스크롤
- 계정 관리 모달: 풀스크린

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 8번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 콘텐츠 생성 (직접 작성 + AI 자동 생성)
- [x] 승인/반려 플로우 (draft → pending → approved → scheduled → published)
- [x] 예약 발행 큐
- [x] 카드뉴스 시리즈 (5~10장 한 번에)
- [x] 멀티 플랫폼 지원 (인스타그램, YouTube, 티스토리, 다음카페, LinkedIn)
- [x] A/B 변형 생성 + 성과 비교
- [x] 이미지 생성 (AI)
- [x] SNS 계정 CRUD
- [x] 배치 예약/취소
- [x] 통계 (상태별/플랫폼별/일별)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.post/get/put/delete` 호출 경로 및 페이로드 구조
- 상태 전이 로직 (draft → pending → approved → ...)
- `useMutation` / `useQuery` 훅의 queryKey 구조
- StatusStepper의 상태 매핑 로직

---

## 10. v0.dev 디자인+코딩 지시사항

> v0.dev가 디자인과 코딩을 동시에 수행합니다. 아래 내용을 v0 프롬프트에 포함하세요. 레이아웃은 v0에게 자유도를 부여합니다.

### v0 프롬프트 (디자인+코딩 통합)
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. Think of it like a social media management tool (similar to Hootsuite or Buffer), but AI agents create the content automatically and the user just reviews, approves, and schedules publication.

This page: A social media publishing hub with 5 tabs — Content, Queue, Card News, Stats, and Account Management.

User workflow:
1. User browses a list of AI-generated social media posts (text + images) across multiple platforms (Instagram, blog, Twitter, Facebook).
2. Each post goes through a workflow: Draft → Pending Review → Approved → Scheduled → Published. The user approves or rejects content.
3. Approved content enters a publishing queue where it can be scheduled for specific times.
4. User can create "Card News" series — multi-image carousel posts (5-10 slides).
5. User can run A/B tests by generating variants of a post and comparing engagement metrics.
6. Stats tab shows content performance over time — by status, platform, and daily trends.
7. Account Management tab lets the user register and manage SNS platform credentials.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation (switching between pages). DO NOT include any navigation sidebar in your design.
- The app already has a TOP HEADER with the app logo, user avatar, notifications. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — the space to the right of the sidebar and below the header.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Show the Content tab as the default view with:
1. Tab bar at the top — 5 tabs with clear active state.
2. Filter row — platform filter dropdown, "originals only" checkbox, list/gallery view toggle, and a "New Content" button.
3. Content list — cards showing: platform icon, account name, status badge (color-coded), title, creator name, date. Each card is clickable.
4. For one card, show it expanded into a detail view with: status stepper (5-step progress bar), content preview (title, body text, image, hashtags), action buttons (Submit for Review, Approve, Reject, Publish, Generate Image, Delete), and an A/B testing section.
5. Gallery view alternative — grid of image thumbnails with hover overlays showing title and status.

Design tone — YOU DECIDE:
- This is a social media management tool. It should feel organized and efficient.
- Content cards should clearly communicate status at a glance.
- The status stepper should feel like progress — completed steps should look satisfying.
- Choose whatever visual tone makes a social media publishing workflow feel smooth and productive.
- Clean, professional. Users spend time reviewing and scheduling — it should not be visually noisy.

Design priorities (in order):
1. Status at a glance — the user must instantly see which content needs attention (pending review).
2. Content preview — the body text and image should be readable without clicking into detail.
3. Action buttons should be prominent and contextual (only show relevant actions per status).

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 참고사항
```
Mobile version (375x812) of the same page described above.

Same product context: a social media publishing hub where AI agents create content, and the user reviews, approves, schedules, and publishes across multiple platforms.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation (switching between pages). DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile touch):
1. Tab bar — 5 tabs with shortened labels, horizontally scrollable if needed.
2. Content list — compact cards with status badge, platform icon, title, and date.
3. Filter controls — collapsible or minimal.
4. New Content button — floating or in header.
5. Detail view — full-screen takeover with status stepper, content preview, and action buttons.
6. Gallery view — 2-column grid.
7. A/B testing section — vertically stacked comparison.
8. Loading / empty / error states.

Design tone: Same as desktop version — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Status badges must be visible at a glance even on small cards.
2. Action buttons should be large enough for thumb tapping.
3. Tab switching should feel instant with minimal layout shift.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `sns-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `sns-tab-content` | 콘텐츠 탭 | 탭 전환 |
| `sns-tab-queue` | 발행 큐 탭 | 탭 전환 |
| `sns-tab-cardnews` | 카드뉴스 탭 | 탭 전환 |
| `sns-tab-stats` | 통계 탭 | 탭 전환 |
| `sns-tab-accounts` | 계정 관리 탭 | 탭 전환 |
| `sns-content-list` | 콘텐츠 목록 컨테이너 | 목록 표시 확인 |
| `sns-content-item` | 콘텐츠 카드 | 개별 콘텐츠 |
| `sns-content-empty` | 빈 상태 | 콘텐츠 없을 때 |
| `sns-create-btn` | 새 콘텐츠 버튼 | 생성 화면 진입 |
| `sns-create-manual` | 직접 작성 탭 | 수동 생성 모드 |
| `sns-create-ai` | AI 생성 탭 | AI 생성 모드 |
| `sns-form-title` | 제목 입력 | 콘텐츠 제목 |
| `sns-form-body` | 본문 textarea | 콘텐츠 본문 |
| `sns-form-submit` | 저장 버튼 | 콘텐츠 저장 |
| `sns-detail-view` | 상세 뷰 컨테이너 | 상세 화면 |
| `sns-status-stepper` | 상태 스텝퍼 | 진행 상태 표시 |
| `sns-action-submit-review` | 승인 요청 버튼 | 승인 요청 |
| `sns-action-approve` | 승인 버튼 | 콘텐츠 승인 |
| `sns-action-reject` | 반려 버튼 | 콘텐츠 반려 |
| `sns-action-publish` | 발행 버튼 | 콘텐츠 발행 |
| `sns-action-delete` | 삭제 버튼 | 콘텐츠 삭제 |
| `sns-image-generate` | 이미지 생성 버튼 | AI 이미지 생성 |
| `sns-ab-section` | A/B 테스트 영역 | A/B 테스트 |
| `sns-ab-create-variant` | 변형 복제 버튼 | 수동 변형 생성 |
| `sns-ab-ai-variant` | AI 변형 생성 버튼 | AI 변형 생성 |
| `sns-ab-metrics-btn` | 성과 입력 버튼 | 메트릭 입력 |
| `sns-ab-compare-btn` | 결과 비교 버튼 | A/B 결과 비교 |
| `sns-variant-modal` | 변형 생성 모달 | 모달 표시 확인 |
| `sns-gallery-toggle` | 갤러리 뷰 토글 | 뷰 모드 전환 |
| `sns-list-toggle` | 목록 뷰 토글 | 뷰 모드 전환 |
| `sns-account-filter` | 계정 필터 드롭다운 | 필터링 |
| `sns-originals-checkbox` | 원본만 보기 체크박스 | 필터링 |
| `sns-queue-stats` | 큐 요약 카드 영역 | 큐 통계 |
| `sns-queue-list` | 큐 목록 | 큐 항목 표시 |
| `sns-queue-batch-schedule` | 일괄 예약 버튼 | 배치 예약 |
| `sns-queue-batch-cancel` | 일괄 취소 버튼 | 배치 취소 |
| `sns-queue-select-all` | 전체 선택 체크박스 | 전체 선택 |
| `sns-cardnews-list` | 카드뉴스 시리즈 목록 | 시리즈 표시 |
| `sns-cardnews-create-btn` | 새 시리즈 버튼 | 시리즈 생성 |
| `sns-cardnews-card` | 개별 카드뉴스 시리즈 | 시리즈 선택 |
| `sns-stats-period` | 기간 선택 버튼 그룹 | 통계 기간 변경 |
| `sns-stats-summary` | 요약 카드 영역 | 통계 요약 |
| `sns-stats-status-chart` | 상태별 분포 차트 | 통계 차트 |
| `sns-stats-platform-chart` | 플랫폼별 분포 차트 | 통계 차트 |
| `sns-stats-daily-chart` | 일별 추이 차트 | 통계 차트 |
| `sns-accounts-list` | 계정 목록 | 계정 표시 |
| `sns-accounts-add-btn` | 계정 추가 버튼 | 계정 추가 |
| `sns-accounts-modal` | 계정 추가/수정 모달 | 모달 표시 확인 |
| `sns-accounts-save-btn` | 계정 저장 버튼 | 계정 저장 |
| `sns-loading` | 로딩 스켈레톤 | 로딩 중 표시 |
| `sns-error-state` | 에러 상태 | API 에러 시 표시 |
| `sns-back-btn` | 목록으로 돌아가기 버튼 | 뷰 전환 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /sns 접속 | `sns-page` 존재, 콘텐츠 탭 활성 |
| 2 | 탭 전환 - 발행 큐 | 발행 큐 탭 클릭 | URL에 ?tab=queue, 큐 영역 표시 |
| 3 | 탭 전환 - 카드뉴스 | 카드뉴스 탭 클릭 | URL에 ?tab=cardnews, 시리즈 목록 표시 |
| 4 | 탭 전환 - 통계 | 통계 탭 클릭 | URL에 ?tab=stats, 통계 영역 표시 |
| 5 | 탭 전환 - 계정 관리 | 계정 관리 탭 클릭 | URL에 ?tab=accounts, 계정 목록 표시 |
| 6 | 빈 상태 표시 | 콘텐츠 없을 때 | `sns-content-empty` 표시 |
| 7 | 새 콘텐츠 - 직접 작성 | + 새 콘텐츠 → 직접 작성 탭 | 제목/본문 입력 폼 표시 |
| 8 | 새 콘텐츠 - AI 생성 | + 새 콘텐츠 → AI 생성 탭 | 에이전트 선택 + 주제 입력 폼 표시 |
| 9 | 콘텐츠 저장 | 제목+본문 입력 후 저장 | 상세 뷰로 전환, 초안 상태 |
| 10 | 콘텐츠 상세 진입 | 목록에서 카드 클릭 | `sns-detail-view` + `sns-status-stepper` 표시 |
| 11 | 뷰 모드 전환 | 갤러리 토글 클릭 | 그리드 레이아웃으로 변경 |
| 12 | 계정 필터 | 드롭다운에서 계정 선택 | 해당 계정 콘텐츠만 표시 |
| 13 | 원본만 보기 | 체크박스 선택 | 변형 제외, 원본만 표시 |
| 14 | 큐 전체 선택 | 전체 선택 체크박스 클릭 | 모든 큐 항목 선택됨 |
| 15 | 통계 기간 변경 | 7일/30일/90일 버튼 클릭 | 통계 데이터 갱신 |
| 16 | 계정 추가 | + 계정 추가 → 정보 입력 → 저장 | 계정 목록에 새 항목 추가 |
| 17 | 반응형 레이아웃 | 375px 뷰포트 | 탭 shortLabel 표시, 콘텐츠 1컬럼 |
| 18 | 목록으로 돌아가기 | 상세 뷰에서 ← 클릭 | 목록 뷰로 복귀 |
| 19 | 로딩 상태 | 데이터 로딩 중 | `sns-loading` 스켈레톤 표시 |
| 20 | 에러 상태 | API 에러 발생 | `sns-error-state` 에러 메시지 + 재시도 버튼 |
