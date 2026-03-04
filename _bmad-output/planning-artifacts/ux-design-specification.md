---
stepsCompleted: [step-01-init, step-02-discovery, step-03-patterns, step-04-screens, complete]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/product-brief-CORTHEX_HQ-2026-03-02.md
revision: 7
revisionDate: 2026-03-04
revisionReason: "P2 완전 스펙 — 전략실/야간작업/보고서/파일관리 56개 결정 + 19개 검토 수정 + WebSocket P2 이벤트 구조 + KIS 미연동 정책 + Phase E 신설 + 자동매매 모바일 Accordion + 실투자 경고 3곳 + P2 화면간 플로우 + 엣지케이스"
---

# UX Design Specification — CORTHEX v2 (Revision 7)

**Author:** Elddl
**Date:** 2026-03-04
**Revision:** 7 — P2 완전 스펙 (전략실/야간작업/보고서/파일관리 56개 결정 + 19개 검토 수정 + WebSocket P2 이벤트 + KIS 정책 + Phase E + 실투자 경고)

---

## 1. Design Philosophy

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Clarity over Decoration** | 장식보다 명확성. 정보 계층을 시각적으로 즉시 파악 |
| **Consistent Density** | 관리자 = 고밀도(테이블/폼), 유저 = 저밀도(대화/카드) |
| **Status at a Glance** | 에이전트 상태, 작업 상태, 연결 상태를 1초 안에 파악 |
| **Dark-first** | 다크 모드를 기본으로 설계하고 라이트 모드를 파생 |

### 참조 디자인

- **Linear** — 사이드바 구조, 상태 배지, 키보드 중심 인터랙션
- **Vercel Dashboard** — 깔끔한 데이터 카드, 모노크롬 + 포인트 컬러
- **Claude Desktop** — 채팅 UI, 에이전트 응답 스트리밍

---

## 2. Technology Stack (아키텍처 확정)

| 항목 | 결정 |
|------|------|
| **프레임워크** | React 19 + Vite 6 |
| **스타일링** | Tailwind CSS 4 (빌드 포함, @tailwindcss/vite) |
| **컴포넌트** | @corthex/ui (자체 공유 라이브러리, CVA 기반) |
| **상태 관리** | Zustand 5 (클라이언트) + TanStack Query 5 (서버) |
| **라우팅** | React Router DOM 7 |
| **실시간** | WebSocket (Hono 내장) |
| **시각화** | @xyflow/react + @dagrejs/dagre (NEXUS 캔버스) |
| **모노레포** | Turborepo — packages/admin, packages/app, packages/ui, packages/shared |

---

## 3. Design Token System

### 색상 팔레트 (Tailwind CSS 4 @theme)

```css
@theme {
  --color-corthex-accent: oklch(0.55 0.2 264);        /* indigo-600 */
  --color-corthex-accent-dark: oklch(0.7 0.17 264);    /* indigo-400 */
  --color-corthex-success: oklch(0.55 0.16 160);       /* emerald-600 */
  --color-corthex-warning: oklch(0.65 0.16 75);        /* amber-600 */
  --color-corthex-error: oklch(0.55 0.2 25);           /* red-600 */
}
```

### 표면/배경 체계

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| **bg-base** | `white` | `zinc-950` | 메인 콘텐츠 배경 |
| **bg-surface** | `zinc-50` | `zinc-900` | 사이드바, 카드 배경 |
| **bg-elevated** | `white` | `zinc-900` | 카드, 모달, 팝오버 |
| **bg-muted** | `zinc-100` | `zinc-800` | 인풋 필드, 뱃지 배경 |
| **border-default** | `zinc-200` | `zinc-800` | 기본 보더 |
| **text-primary** | `zinc-900` | `zinc-100` | 제목, 본문 |
| **text-secondary** | `zinc-500` | `zinc-400` | 부가 설명 |
| **text-muted** | `zinc-400` | `zinc-500` | 비활성 텍스트 |

### 타이포그래피

| 용도 | 클래스 |
|------|--------|
| 페이지 제목 | `text-xl font-semibold tracking-tight` |
| 섹션 제목 | `text-base font-semibold` |
| 카드 제목 | `text-sm font-medium` |
| 본문 | `text-sm text-zinc-600 dark:text-zinc-400` |
| 캡션 | `text-xs text-zinc-500` |
| 코드/모노 | `font-mono text-xs` |
| **금액** | `font-mono` (숫자 정렬) |
| **날짜/시간** | `font-mono text-xs text-muted` |
| **에러 메시지** | `text-sm text-corthex-error` |
| **성공 메시지** | `text-sm text-corthex-success` |

### 간격 시스템

| 용도 | 값 |
|------|-----|
| 페이지 패딩 | `p-6` |
| 카드 패딩 | `p-4` 또는 `p-5` |
| 섹션 간격 | `space-y-6` |
| 카드 내 항목 간격 | `space-y-3` |

### 에이전트 상태 인디케이터

| 상태 | Dot | 뱃지 라이트 | 뱃지 다크 |
|------|-----|------------|----------|
| **online** | `bg-emerald-500` | `bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20` | `bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20` |
| **working** | `bg-amber-500 animate-pulse` | `bg-amber-50 text-amber-700 ring-1 ring-amber-600/20` | `bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20` |
| **error** | `bg-red-500` | `bg-red-50 text-red-700 ring-1 ring-red-600/20` | `bg-red-500/10 text-red-400 ring-1 ring-red-500/20` |
| **offline** | `bg-zinc-300 dark:bg-zinc-600` | `bg-zinc-100 text-zinc-600` | `bg-zinc-800 text-zinc-400` |

---

## 4. Shared UI Component Library (@corthex/ui)

### 구현 완료

| 컴포넌트 | 설명 |
|----------|------|
| `Button` | variant: default/outline/ghost/destructive, size: default/sm/lg/icon |
| `cn()` | clsx + tailwind-merge 유틸 |

### 추가 구현 필요

| 컴포넌트 | 우선순위 | 설명 |
|----------|----------|------|
| `Card` | P0 | 표면 카드. variant: default/bordered |
| `Input` | P0 | 텍스트 입력. size: default/sm. 비밀번호 👁 토글 |
| `Badge` | P0 | 상태 뱃지. variant: default/success/warning/error/outline |
| `StatusDot` | P0 | 에이전트/연결 상태 인디케이터 (online/working/error/offline) |
| `Skeleton` | P0 | 로딩 스켈레톤 |
| `Modal` | P0 | 모달 다이얼로그. 모바일=풀스크린 시트 |
| `Toast` | P0 | 알림 토스트. variant: success/error/info. **위치: 우상단 `top-4 right-4`** |
| `EmptyState` | P0 | 빈 상태 안내 + CTA |
| `Tabs` | P0 | 탭 전환. 알림/설정 등 |
| `Toggle` | P0 | ON/OFF 스위치. 알림 설정용 |
| `Select` | P1 | 드롭다운 |
| `Textarea` | P1 | auto-resize 텍스트영역 (채팅 입력) |
| `Timeline` | P1 | 작전일지 타임라인 (세로선 + 도트 + 카드) |
| `FilterChip` | P1 | 토글형 필터 뱃지 (작전일지 필터) |
| `ConfirmDialog` | P1 | 삭제 확인 다이얼로그 |
| `AgentListModal` | P1 | **공용 에이전트 목록 모달** — 홈 "더 보기"와 채팅 "새 대화" 공유 |
| `SparklineChart` | P2 | SVG 미니 차트 (관심목록 일봉) |
| `ProgressBar` | P2 | 사용량/한도 프로그레스 바 |
| `UploadZone` | P2 | 드래그&드롭 파일 업로드 영역 |
| `MarkdownRenderer` | P2 | 보고서 마크다운 렌더링 (`prose`) |
| `RadioGroup` | P2 | 작업 유형 라디오 |

### 컴포넌트 구현 순서 (Phase 의존성)

```
Phase A — 모든 화면 공통 기반 (먼저 구현)
  Badge, StatusDot, Skeleton, Toast, EmptyState

Phase B — 레이아웃 + 입력
  Card, Input, Modal
  → Phase A 완료 후 가능

Phase C — 상호작용 컴포넌트
  Tabs, Toggle, Textarea, ConfirmDialog, Select, AgentListModal
  → Phase B 완료 후 가능

Phase D — 특수 컴포넌트 (P1 + P2 공통)
  Timeline, FilterChip (작전일지)
  SparklineChart   (전략실 관심목록 — 20일봉 SVG)
  ProgressBar      (파일관리 사용량 + 전략실 SafeGuard 한도)
  MarkdownRenderer (보고서 읽기 뷰 — prose)
  → Phase C 완료 후 가능

Phase E — P2 전용 특수 컴포넌트 (신설)
  UploadZone   (파일 관리 — 드래그&드롭, 다중 업로드)
  RadioGroup   (야간작업 등록 모달 작업 유형 선택)
  → Phase D 완료 후 가능
```

**화면별 개발 가능 시점:**

| 화면 | 필요 Phase |
|------|-----------|
| 로그인 | B |
| 홈 | A + B |
| 채팅 | A + B + C |
| 알림 | A + C |
| 설정(API 연동) | A + B + C |
| 작전일지 | A + D |
| 야간작업 | C + E |
| 보고서 | D |
| 파일 관리 | D + E |
| 전략실 | D + E |
| Admin 보고 라인 | A + B + C |

---

## 5. Global Layout

### 공통 구조

```
┌──────────────────────────────────────────────────────┐
│  ┌─────────┐  ┌──────────────────────────────────┐  │
│  │ Sidebar │  │         Main Content             │  │
│  │ (240px) │  │         (flex-1, overflow-auto)   │  │
│  │         │  │         padding: 24px            │  │
│  └─────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Sidebar 구조

| 영역 | 높이 | 내용 |
|------|------|------|
| Logo | h-14 | 로고 아이콘(C) + 앱명 + (Admin: "Admin Console") |
| Nav | flex-1 | NavLink 목록. 활성=indigo 배경, 호버=zinc 배경 |
| User | h-14 | 이름 + 역할 + 로그아웃 |

### 반응형 레이아웃

**브레이크포인트:**

| 구간 | 레이아웃 |
|------|---------|
| `lg` (1024px+) | 사이드바 고정 (`w-60`), 메인 `ml-60` |
| `md` 이하 | 사이드바 숨김, 상단바 + 햄버거 버튼 |

**모바일 상단바 (md 이하):**

```
┌──────────────────────────────────┐
│ ☰  │  현재 페이지명              │
└──────────────────────────────────┘
h-14, bg-surface, border-b, sticky top-0
```

**햄버거 사이드바 동작:**

| 이벤트 | 동작 |
|--------|------|
| ☰ 버튼 클릭 | 사이드바 왼쪽에서 슬라이드인 (200ms ease-out) + 뒤 `bg-black/40` 오버레이 |
| 오버레이 클릭 | 슬라이드아웃 (200ms) |
| NavLink 클릭 | 페이지 이동 + 사이드바 자동 닫힘 |
| 뒤로가기 (History) | 사이드바 열려있으면 닫힘 |
| Esc 키 | 사이드바 닫힘 |
| 스크롤 | 닫히지 않음 |

**채팅 모바일 특수 케이스:**
- 기본: 세션 목록 전체화면
- 세션 선택: 대화 화면 전체화면
- 대화 화면 상단 `← 대화 목록` 버튼으로 복귀
- 전역 사이드바(☰)는 대화 화면에서도 접근 가능

---

## 6. Global UX 폴리시

전체 앱에 일관 적용되는 규칙. 신규 화면 개발 시 의무 준수.

### 로딩 폴리시

```
- 모든 데이터 fetch → Skeleton UI (animate-pulse)
- "로딩 중..." 텍스트 금지
- Skeleton은 실제 레이아웃과 동일한 모양으로 제작
- 최소 표시 시간 없음 — 데이터 오면 즉시 교체
```

### 에러 폴리시

```
- 페이지 레벨 에러 (전체 fetch 실패)
  → 메인 영역 중앙: 에러 카드 + [다시 시도] 버튼
  → 사이드바는 정상 유지

- 컴포넌트 레벨 에러 (부분 실패)
  → 해당 컴포넌트 내 인라인: "❌ 불러오기 실패 [다시 시도]"
  → 나머지 화면 정상 유지

- 폼 제출 에러
  → 폼 하단 인라인 에러 텍스트 (Toast 사용 안 함)
  → 모달/폼 유지, 입력값 유지

- Toast는 성공 알림 + 페이지 외부 이벤트 알림에만 사용
```

### 빈 상태 폴리시

```
- 모든 목록 화면 → EmptyState 필수
- 구성: 아이콘(이모지) + 설명 1줄 + CTA 버튼(선택)
- "데이터 없음" 단독 텍스트 금지
```

### 폼 폴리시

```
- 제출 중: 버튼 disabled + "...중" 텍스트 (예: "저장 중...")
- 성공: 모달/폼 닫힘 + Toast success
- 실패: 모달/폼 유지 + 인라인 에러
- 삭제: ConfirmDialog 필수 (직접 삭제 금지)
- 저장 실패 시: 입력값 유지, 버튼 재활성화
```

### 애니메이션 폴리시

```
- 모든 트랜지션: 150ms ease-out (Tailwind transition-all)
- 페이지 전환: 없음 (즉시, 애니메이션 없음)
- 모달 진입: fade-in + scale-95→100 (150ms)
- 사이드바 슬라이드: 200ms ease-out
- Toast 진입: slide-in from 우측 (200ms). 위치: 우상단 top-4 right-4
```

### 다크모드 폴리시

```
- 시스템 설정 자동 감지 (prefers-color-scheme)
- 전환 시 깜빡임 방지: <html> 태그에 theme class 즉시 적용 (초기화 script)
- 수동 토글: P3 (P1에서는 시스템 따라감)
```

### 에이전트 아바타 Fallback

```
이미지 있음 → 원형 이미지
이미지 없음 → 이름 첫 글자 이니셜
              bg-corthex-accent/20 text-corthex-accent font-semibold text-sm
              원형, 동일 크기 유지

예: "비서실장" → "비", "금융분석팀장" → "금"
```

---

## 7. 에러 바운더리 (Error Boundary)

전체 앱 3단계 에러 바운더리.

### 레벨 1 — 앱 전체 (최상위)

```
흰 화면 대신:
┌────────────────────────────────────┐
│              C O R T H E X         │
│                                    │
│   예기치 않은 오류가 발생했습니다   │
│   [새로고침]                        │
└────────────────────────────────────┘
bg-base 전체화면, 중앙 정렬
```

### 레벨 2 — 페이지 레벨 (각 라우트)

```
- 해당 페이지 영역만 에러 카드로 교체
- 사이드바는 정상 유지 (다른 페이지 이동 가능)
- "[다시 시도]" 버튼 → 해당 페이지 리마운트
```

### 레벨 3 — 컴포넌트 레벨 (카드, 위젯)

```
- 해당 컴포넌트만 인라인 에러
- 나머지 페이지 완전 정상 유지
- "❌ 불러오기 실패 [다시 시도]" 인라인 표시
```

---

## 8. 화면간 네비게이션 규칙

### URL 파라미터 공통 규칙

1. URL 파라미터가 있으면 진입 시 해당 리소스 자동 활성화
2. 존재하지 않는 ID → 파라미터 무시, 기본 상태로 진입
3. 뒤로가기 → 브라우저 기본 동작 (별도 처리 없음)
4. 필터 상태는 URL에 반영 → 새로고침/공유 가능

### 화면 진입 시나리오

| 진입 URL | 동작 |
|---------|------|
| `/chat` | 마지막 활성 세션 자동 선택. 없으면 EmptyState |
| `/chat?session={id}` | 해당 세션 자동 선택 + 스크롤 최하단 + 세션 패널 해당 항목 하이라이트 |
| `/notifications` | 기본 목록 탭 |
| `/ops-log` | 필터 없음, 전체 |
| `/ops-log?filter={type}` | 해당 FilterChip 자동 활성화 |
| `/ops-log?filter={type}&id={logId}` | 필터 활성화 + 해당 로그 스크롤 + 5초 하이라이트 (`ring-2 ring-corthex-accent`) |
| `/settings` | API 연동 탭 (기본) |
| `/settings?tab={tabName}` | 해당 탭 자동 활성화 |
| `/trading` | 관심목록 탭 (기본) |
| `/trading?tab=portfolio` | 포트폴리오 탭 자동 활성화 |
| `/trading?tab=history` | 매매이력 탭 자동 활성화 |
| `/trading?tab=auto` | 자동매매 탭 자동 활성화 |
| `/trading?tab=settings` | 설정 탭 자동 활성화 |
| `/reports` | 보고서 목록 (전체 탭 기본) |
| `/reports/:id` | 해당 보고서 읽기 뷰 직접 진입 |
| `/jobs` | 야간작업 목록 (일회성 탭 기본) |

### 설정 복귀

설정 페이지에서 작업 완료 후 자동 복귀 없음. 뒤로가기만 지원.

### 토큰 만료 리다이렉트

- REST API 응답 `401` → `/login?redirect={현재경로}` 자동 이동
- 로그인 성공 후 `redirect` 파라미터 경로로 복귀
- WebSocket `type: 'auth_error'` 수신 → 즉시 `/login` 이동

---

## 9. Admin Console (admin.corthex-hq.com)

### 9.1 사이드바 메뉴

| 순서 | 메뉴 | 라우트 | FR |
|------|------|--------|-----|
| 1 | 대시보드 | `/` | — |
| 2 | 회사 관리 | `/companies` | FR-1.2 |
| 3 | 직원 관리 | `/users` | FR-1.3 |
| 4 | 부서 관리 | `/departments` | FR-1.6 |
| 5 | AI 에이전트 | `/agents` | FR-1.7 |
| 6 | 도구 관리 | `/tools` | FR-1.8 |
| 7 | CLI / API 키 | `/credentials` | FR-1.4, FR-1.5 |
| 8 | **보고 라인** | `/report-lines` | **FR-1.9** |

### 9.2 대시보드

통계 카드(4열) + 직원 목록 + 에이전트 현황. 스켈레톤 로딩, 상태 뱃지 ring 스타일.

### 9.3~9.8 기존 CRUD 페이지

회사/직원/부서/에이전트/도구/CLI 관리 — 기존 구현 유지.

> **스타일 통일 기준:** 신규 개발(보고 라인)에만 아래 기준 적용. 기존 7개 페이지는 현행 유지 (P3 리팩터링).

**Admin 신규 페이지 스타일 기준:**
- 테이블: `border rounded-lg overflow-hidden`. thead `bg-muted text-xs font-medium text-secondary`. tbody `divide-y`
- 폼: `max-w-2xl`. 라벨 `text-sm font-medium`. Input/Select 전체 너비
- 액션 버튼: 행 내 `Button size="sm"`. 삭제=`variant="destructive"`

### 9.9 보고 라인 (신규 — FR-1.9)

**목적:** 유저별 직속 보고 대상 설정. 비서 오케스트레이션 및 CEO 보고 전달 경로에 사용.

**결정 사항:**
- 보고 대상: **단수(1명)**. 직속 상관 1명. 복잡한 매트릭스 조직 구조는 P3 이후 검토.
- 저장 방식: 변경 감지 → 상단 배너 방식

**레이아웃:**

```
┌────────────────────────────────────────────────────┐
│  보고 라인                                         │
│                                                    │
│  ┌─ 미저장 변경 배너 (변경 있을 때) ─────────────┐  │
│  │  ⚠️ 저장되지 않은 변경사항이 있습니다.        │  │
│  │                        [취소]  [저장]         │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  직원명      역할       보고 대상             │  │
│  ├──────────────────────────────────────────────┤  │
│  │  김민지      대리       [이사 박철수       ▾] │  │
│  │  이준호      과장       [이사 박철수       ▾] │  │
│  │  박지영      팀장       [CEO 최영훈        ▾] │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

| 요소 | 설명 |
|------|------|
| **보고 대상 Select** | 전체 직원 목록. 자기 자신 제외. 미설정=`placeholder "미설정"` |
| **미저장 배너** | 변경 발생 시 상단에 sticky 표시. [저장] = 변경된 행 전체 일괄 저장. [취소] = 원래 값으로 복원 |
| **페이지 이탈** | 미저장 변경 있을 때 이탈 시 ConfirmDialog: "저장하지 않은 변경사항이 있습니다. 나가시겠어요?" |

**API:** `GET /report-lines`, `PUT /report-lines` (배열로 일괄 업데이트)

---

## 10. User App (corthex-hq.com)

### 10.1 사이드바 메뉴

| 그룹 | 메뉴 | 라우트 | FR | Phase |
|------|------|--------|-----|-------|
| — | 홈 | `/` | FR-2.2 | P1 |
| 업무 | 채팅 | `/chat` | FR-3 | P1 |
| 업무 | **전략실** | `/trading` | FR-8 | P2 |
| 업무 | 야간작업 | `/jobs` | FR-7 | P2 |
| 업무 | 보고서 | `/reports` | FR-5 | P2 |
| 운영 | SNS | `/sns` | FR-9 | P3 |
| 운영 | 메신저 | `/messenger` | FR-10.5 | P3 |
| 운영 | 대시보드 | `/dashboard` | FR-10.2 | P3 |
| 운영 | 작전일지 | `/ops-log` | FR-10.1, FR-13 | P1(로그) P3(UI) |
| 운영 | NEXUS | `/nexus` | FR-11 | P4 |
| 시스템 | 알림 | `/notifications` | FR-10.6 | P1 |
| 시스템 | 설정 | `/settings` | FR-2.4 | P1 |

### 10.2 로그인 — FR-2.1

**결정 사항:**

| 항목 | 결정 |
|------|------|
| Admin/User 로그인 | **분리.** `admin.corthex-hq.com/login` / `corthex-hq.com/login` 각각 별도. UI는 동일 컴포넌트 재사용, Admin은 "Admin Console" 문구 추가 |
| Rate limit 기준 | **서버 기준** (IP + 계정 아이디 조합). 5회 실패 → 1분 잠금 → 잠금 해제 후 카운터 리셋 |
| 잠금 UI | `⚠️ 잠시 후 다시 시도하세요 (47초 후 잠금 해제)` — 카운트다운 표시 |
| 토큰 만료 | REST API `401` → `/login?redirect={경로}` 리다이렉트 (섹션 8 참조) |
| WebSocket 만료 | `type: 'auth_error'` 수신 → `/login` 이동 |

**레이아웃:**

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              ┌──────────────────────┐              │
│              │                      │              │
│              │     C O R T H E X    │              │
│              │         HQ           │              │
│              │                      │              │
│              │  아이디              │              │
│              │  ┌──────────────────┐│              │
│              │  │                  ││              │
│              │  └──────────────────┘│              │
│              │                      │              │
│              │  비밀번호            │              │
│              │  ┌──────────────────┐│              │
│              │  │         👁       ││              │
│              │  └──────────────────┘│              │
│              │                      │              │
│              │  ┌──────────────────┐│              │
│              │  │     로그인       ││              │
│              │  └──────────────────┘│              │
│              │                      │              │
│              └──────────────────────┘              │
│              빌드 #42 · v2.0.0                     │
│                                                    │
└────────────────────────────────────────────────────┘
```

| 요소 | 설명 |
|------|------|
| **레이아웃** | `bg-base` 전체 화면 중앙. `max-w-sm mx-auto bg-surface border rounded-xl p-8` |
| **로고** | `text-2xl font-bold tracking-tight` 중앙 |
| **입력** | Input 2개 (아이디, 비밀번호 `type="password"` + 👁 토글) |
| **버튼** | 전체 너비 `bg-corthex-accent`. 제출 중 "로그인 중..." |
| **에러** | 인라인: `❌ 아이디 또는 비밀번호가 올바르지 않습니다` |
| **Rate Limit** | 5회 실패 → 카운트다운 표시. 입력창 disabled |
| **빌드 정보** | `text-xs text-muted` 하단 |
| **Enter** | 로그인 실행 |
| **사이드바** | 없음 (로그인 전) |
| **모바일** | 동일 (`max-w-sm`이 자연스럽게 반응) |

### 10.3 홈 (`/`) — FR-2.2

**목표:** 로그인 직후 첫 화면. 개인화 인사 + 팀 현황 + 빠른 접근

**결정 사항:**

| 항목 | 결정 |
|------|------|
| 실시간 | **없음.** 홈은 REST fetch만. 알림 카드는 5분 폴링으로 단순화 |
| API 부분 실패 | **카드 단위 독립 처리.** "내 팀" 실패 시 Skeleton → 재시도. 나머지 실패 시 카드 숨김 |
| "내 팀" 표시 기준 | 관리자가 내 부서에 배정한 에이전트 전체 (내가 대화한 에이전트 아님) |
| "내 팀" 정렬 | ①비서(secretary role) 최상단 ⭐ → ②online → working → offline → ③동일 상태 내 이름 가나다순 |
| "내 팀" 표시 한도 | 최대 8명. 초과 시 `+N명 더 보기` → `AgentListModal` (채팅 에이전트 선택과 공용) |

**첫 로그인 빈 화면:**

```
┌────────────────────────────────────────────────────┐
│  안녕하세요, {이름}님 👋                            │
│  CORTHEX에 오신 걸 환영합니다!                      │
│  2026년 3월 4일 화요일                              │
│                                                    │
│  ┌─ 내 팀 ──────────────────────────────────────┐  │
│  │  아직 배정된 에이전트가 없습니다.              │  │
│  │  관리자에게 에이전트 배정을 요청하세요.        │  │
│  └──────────────────────────────────────────────┘  │
│  (알림/대화 카드: 0건이면 숨김)                     │
└────────────────────────────────────────────────────┘
```

**정상 화면:**

```
┌────────────────────────────────────────────────────┐
│  안녕하세요, {이름}님 👋                            │
│  2026년 3월 4일 화요일                              │
│                                                    │
│  ┌─ 내 팀 ──────────────────────────────────────┐  │
│  │  [아바타] [아바타] [아바타] ...               │  │
│  │  비서실장  금융분석  콘텐츠                    │  │
│  │  ● online ● online  ○ off                    │  │
│  │  [대화]   [대화]    [대화]    [+3명 더 보기]  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ 최근 알림 ─────────────────── [모두 보기 →] ┐  │
│  │  🔔 금융분석팀장이 삼성전자 분석 완료   2분전 │  │
│  │  ✅ 야간작업 "뉴스 브리핑" 완료     오전 6:00 │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ 최근 대화 ──────────────────────────────────┐  │
│  │  💬 삼성전자 분석 — 비서실장           2시간전 │  │
│  │  💬 주간보고서 작성 — 비서실장            어제 │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**영역별 상세:**

| 영역 | 설명 |
|------|------|
| **인사 헤더** | `text-xl font-semibold` + 날짜 `text-sm text-secondary` |
| **내 팀** | Card. 에이전트 그리드 `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`. 48px 원형 아바타(fallback=이니셜) + StatusDot + CTA. 비서=⭐뱃지. 오프라인=`opacity-60`+비활성. 8명 초과 시 `+N명 더 보기` |
| **최근 알림** | Card. 최대 5건. 아이콘(🔔✅⚠️❌) + 메시지 + 시간. 미읽음=`bg-corthex-accent/5`. **5분 폴링** (실시간 아님). 0건이면 카드 숨김 |
| **최근 대화** | Card. 최대 3건. 💬 + 세션 제목 + 에이전트 + 시간. 클릭→`/chat?session=`. 0건이면 카드 숨김 |
| **P2 추가** | "완료된 작업" 카드 + "포트폴리오 요약" 카드 |

**모바일:** 세로 스택, 에이전트 2열, 패딩 `p-4`

**API:** `GET /agents`, `GET /notifications?limit=5` (5분 폴링), `GET /chat/sessions?limit=3` 병렬 호출. 독립 실패 처리.

### 10.4 채팅 (`/chat`) — FR-3

**P1 핵심 화면. 가장 복잡.**

**결정 사항:**

| 항목 | 결정 |
|------|------|
| 에이전트 선택 검색 | **항상 표시.** 3명 이하 시 `disabled`. 이름+역할 텍스트 클라이언트 필터링 |
| 세션 제목 생성 | **서버 키워드 요약.** 첫 응답 `done` 수신 후 서버에서 핵심 명사/키워드 추출 (20자 이내). 예: "삼성전자 분석 요청". 임시 제목: "새 대화" |
| 스트리밍 중 세션 이탈 | **백그라운드 계속 수신.** 확인 다이얼로그 없음. 세션 패널에 ● pulse 인디케이터. 동시 활성 세션 **3개 제한** (초과 시 가장 오래된 비활성 세션 일시 정지, UI 표시 없음) |
| 세션 삭제 | **소프트 딜리트.** 에이전트 메모리 유지. 복구 불가 안내 |
| 재연결 복구 | 재연결 성공 → `GET /chat/sessions/:id/messages?after={lastMessageId}` 호출 → 누락 메시지 append. 배너: `⚡ 연결 복구됨` (2초 자동 사라짐) |

**전체 레이아웃:**

```
┌─────────────────────────────────────────────────────┐
│ 세션 패널(w-72)  │        Chat Area                 │
│                  │                                   │
│ [+ 새 대화]      │ ┌─ Header ──────────────────────┐│
│                  │ │ [아바타] 비서실장 ● online     ││
│ ▸ 오늘           │ │ 금융분석팀장에게 위임 중...    ││
│  ├ 삼성 분석     │ ├──────────────────────────────┤│
│  └ 주간보고  ●  │ │                              ││
│                  │ │  Message Area (scroll)       ││
│ ▸ 어제           │ │                              ││
│  ├ ...           │ │  [유저 버블] [에이전트 버블]  ││
│                  │ │  [도구 호출 토글 카드]        ││
│                  │ │  [타이핑 인디케이터▌]         ││
│                  │ │                              ││
│                  │ ├──────────────────────────────┤│
│                  │ │ [입력 textarea]     [전송/중지]││
│                  │ │ Shift+Enter: 줄바꿈           ││
│                  │ └──────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

> 세션 목록에서 백그라운드 스트리밍 중인 세션은 제목 옆 `●` pulse 인디케이터 표시.

#### 세션 패널

| 요소 | 설명 |
|------|------|
| **새 대화** | `+ 새 대화` 버튼 → `AgentListModal` (검색 Input 항상 표시, 3명 이하 시 disabled) |
| **AgentListModal** | 아바타(fallback=이니셜)+이름+상태+소개. 비서=⭐. 오프라인=`opacity-50` 선택 불가 |
| **날짜 그룹** | 오늘/어제/이번 주/이전 — 접기/펼치기 |
| **세션 아이템** | 제목(서버 키워드 요약, 최대 40자) + 에이전트 아이콘 + 시간 + 백그라운드 스트리밍 중 ● pulse |
| **세션 편집** | ··· 메뉴 → 이름 변경, 삭제 |
| **세션 삭제 확인** | "이 대화를 삭제하시겠어요? 삭제된 대화는 복구할 수 없습니다. 에이전트의 기억은 유지됩니다." |
| **모바일** | 세션 목록 전체 화면 → 선택 시 대화 화면 (← 대화 목록) |

#### 채팅 헤더

**위임 체인 표시:**

```
// 위임 없음 또는 1단계
[아바타] 비서실장  ● online

// 2단계 위임
[아바타] 비서실장  ● online  |  금융분석팀장에게 위임 중...

// 3단계 이상 — 기본 (접힌 상태)
[아바타] 비서실장  ● online  |  🔀 2단계 위임 중 ▾

// 3단계 이상 — 펼친 상태 (클릭 토글)
[아바타] 비서실장  ● online
🔀 비서실장 → 금융분석팀장 → 리서치팀원
       현재 활성: 리서치팀원  (font-medium)
```

**위임 관련 WebSocket 이벤트:**

| 이벤트 | 헤더 변화 |
|--------|----------|
| `type: 'delegation-start', target: '금융분석팀장'` | "금융분석팀장에게 위임 중..." 표시 |
| `type: 'delegation-chain', chain: ['비서실장','금융분석팀장','리서치팀원']` | 3단계 이상 체인 표시 |
| `type: 'delegation-end'` | 원래 에이전트(비서실장) 단독 표시로 복귀 |

#### 메시지 유형 — WebSocket 이벤트 매핑

| WebSocket 이벤트 | UI 표현 |
|-----------------|---------|
| `type: 'token'` | 텍스트 한 글자씩 + 커서 `▌` |
| `type: 'tool-start'` | 도구 카드: `⏳ search_web 실행 중...` (pulse) |
| `type: 'tool-end'` | 카드 업데이트: `✅ search_web — 15건` (접힌 상태) |
| `type: 'done'` | 커서 사라짐, 메시지 확정, 세션 제목 서버 요약으로 업데이트 |
| `type: 'error'` | 에이전트 버블 스타일로 `❌ 응답 중 오류가 발생했습니다 / 오류 코드: {code} / [다시 시도]`. 이전 스트리밍 내용 유지 |
| `type: 'agent-status', status: 'offline'` | 스트리밍 중 오프라인: 아래 "에이전트 오프라인" 처리 |
| `type: 'auth_error'` | `/login` 즉시 리다이렉트 |
| `type: 'delegation-start/chain/end'` | 헤더 위임 체인 업데이트 |
| `type: 'trade-executed'` | 매매이력 invalidateQueries + Toast success |
| `type: 'job-progress'` | 야간작업 카드 진행률 업데이트 |
| `type: 'job-completed'` | 야간작업 카드 완료 상태 + 결과 버튼 활성화 |
| `type: 'job-failed'` | 야간작업 카드 실패 상태 + 에러 코드 |

#### P2 WebSocket 이벤트 페이로드 구조

```ts
// trade-executed
{
  type: "trade-executed",
  tradeId: string,
  stockCode: string,
  stockName: string,
  tradeType: "buy" | "sell",
  quantity: number,
  price: number,
  mode: "mock" | "real",
  executedAt: string       // ISO 8601
}

// job-progress
{
  type: "job-progress",
  jobId: string,
  progress: number,        // 0–100
  statusMessage: string    // "뉴스 수집 중..." 단계 설명
}

// job-completed
{
  type: "job-completed",
  jobId: string,
  durationMs: number,
  resultSessionId: string | null,
  relatedReportId: string | null   // 자동 생성 보고서 ID
}

// job-failed
{
  type: "job-failed",
  jobId: string,
  errorCode: string,
  errorMessage: string,
  retryCount: number
}
```

#### 에이전트 대화 중 오프라인

```
─────────────────────────────────────────
⚠️ 비서실장이 오프라인 상태가 되었습니다
   진행 중이던 응답이 중단되었습니다
                              [다시 시도]
─────────────────────────────────────────
bg-warning/10, border-warning/20, rounded-lg p-3
```

- 스트리밍 중 수신된 내용까지는 버블로 표시 유지
- 입력창 비활성화 + placeholder "에이전트가 오프라인입니다"
- 에이전트 재온라인 시 자동으로 입력창 재활성화

#### 메시지 버블 디자인

**유저:** 우측 정렬. `bg-corthex-accent text-white rounded-2xl rounded-br-md px-4 py-2`. 하단 시간

**에이전트:** 좌측 정렬 (max-w-[80%]). `bg-surface border rounded-2xl rounded-bl-md p-4`. 상단 에이전트 이름+아이콘(fallback=이니셜). 도구 호출=접이식 카드 (`▸`/`▾`, `border rounded-lg p-3`)

#### 입력 영역

| 요소 | 설명 |
|------|------|
| **텍스트** | auto-resize textarea (1~6줄). Enter=전송, Shift+Enter=줄바꿈 |
| **전송 버튼** | 입력 시 `bg-corthex-accent` 활성, 비어있으면 `bg-muted` |
| **스트리밍 중** | 전송→`■ 중지` 변경. 입력 비활성 |
| **에이전트 오프라인** | 입력 비활성 + placeholder "에이전트가 오프라인입니다" |

#### 상태별 화면

| 상태 | 표시 |
|------|------|
| 첫 방문 | EmptyState: "에이전트와 첫 대화를 시작해보세요!" + `새 대화 시작` |
| 로딩 | 세션: Skeleton 3줄. 메시지: Skeleton 버블 3개 |
| WebSocket 끊김 | 상단 배너: `⚠️ 연결이 끊겼습니다. 재연결 중...` (`bg-warning/10`) |
| 재연결 성공 | `⚡ 연결 복구됨` (2초 자동 사라짐), 누락 메시지 자동 fetch |
| 에러 | 인라인: `❌ 응답 실패. [다시 시도]` |

#### 컴포넌트 트리

```
ChatPage → SessionPanel (NewChatButton → AgentListModal, SessionGroup/SessionItem, )
         → ChatArea (ChatHeader/DelegationChain, MessageList (UserMessage, AgentMessage/ToolCallCard, TypingIndicator, AgentOfflineBanner), ChatInput (AutoResizeTextarea, SendButton/StopButton))
```

파일: `chat-page.tsx`, `session-panel.tsx`, `chat-area.tsx`, `message-list.tsx`, `chat-input.tsx`, `tool-call-card.tsx`, `delegation-chain.tsx`, `agent-offline-banner.tsx`

### 10.5 야간작업 (`/jobs`) — FR-7

**3개 탭 + 작업 등록 모달**

**전체 레이아웃:**

```
┌────────────────────────────────────────────────────┐
│  야간작업                             [+ 작업 등록] │
│  ┌─ 탭 ────────────────────────────────────────┐   │
│  │ [일회성 (3)] [반복 스케줄 (2)] [트리거 (1)]  │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📋 뉴스 브리핑 작성                          │  │
│  │    🤖 비서실장 → 콘텐츠팀장                  │  │
│  │    등록: 오늘 15:30  예정: 오늘 23:00        │  │
│  │    🟡 대기 중                  [취소] [편집]  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📊 포트폴리오 리밸런싱 분석                  │  │
│  │    🤖 금융분석팀장                           │  │
│  │    시작: 어제 23:00 → 완료: 오늘 01:23       │  │
│  │    ✅ 완료 (2시간 23분)         [결과 보기]   │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📰 경쟁사 동향 분석                          │  │
│  │    🤖 비서실장                               │  │
│  │    시작: 어제 23:00 → 실패: 오늘 00:15       │  │
│  │    ❌ 실패 (3회 재시도) — TOOL_002            │  │
│  │                       [작전일지] [다시 실행]   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

| 요소 | 설명 |
|------|------|
| **작업 카드** | `Card bordered p-4`. 제목 `font-medium` + 에이전트 `text-sm text-secondary` + 시간 `text-xs font-mono text-muted` |
| **위임 표시** | `비서실장 → 콘텐츠팀장` 화살표 체인 |
| **[결과 보기]** | `/chat?session={jobResultSessionId}` 이동 |
| **[작전일지]** | `/ops-log?filter=job&id={jobId}` 이동 |

#### 반복 스케줄 탭 (FR-7.5)

주기 `text-sm text-secondary` + 마지막/다음 실행 `font-mono text-xs` + `StatusDot` + `[편집][중지]`

#### 이벤트 트리거 탭 (FR-7.6)

조건 + 액션 + `StatusDot` "● 감시 중" + `[편집][중지]`

**트리거 달성 후 동작:** 1회 실행 후 자동 비활성화 (`StatusDot offline`). 카드에 "마지막 발동: 날짜" 표시. `[다시 감시]` 버튼으로 재활성화 가능.

**지원 트리거 유형:**

| 트리거 | 설명 | 추가 필드 |
|--------|------|----------|
| `price-above` | 종목 현재가 ≥ 목표가 | 종목 선택 + 목표가 입력 |
| `price-below` | 종목 현재가 ≤ 목표가 | 종목 선택 + 목표가 입력 |
| `market-open` | 장 시작 시 | 없음 |
| `market-close` | 장 마감 시 | 없음 |

가격 트리거는 30초 폴링 기준. 조건 달성 확인 주기 = 폴링 주기와 동일.

#### 작업 등록 모달

유형 `RadioGroup` (일회성/반복/트리거) → 유형별 폼 필드 변경. `max-w-lg`. 모바일=풀스크린 시트.

**유형별 폼 필드:**

| 유형 | 필드 |
|------|------|
| 일회성 | 내용 Textarea + 에이전트 Select + 실행 시간 `Input type="datetime-local"` (min=현재+1h) |
| 반복 스케줄 | 내용 + 에이전트 + 주기 RadioGroup(매일/매주/특정요일) + 실행 시간 `Input type="time"` + 요일 체크박스(매주/특정요일 선택 시) |
| 이벤트 트리거 | 내용 + 에이전트 + 트리거 유형 Select + 유형별 추가 필드 |

**유효성 검증:**
- 반복 스케줄 "매주/특정요일" 선택 시 요일 최소 1개 필수. 미선택="실행할 요일을 1개 이상 선택하세요" 인라인 에러
- 실행 시간 과거 입력 불가 (min 속성)

#### 상태 뱃지 6종

| 상태 | 뱃지 |
|------|------|
| 대기 중 | `Badge warning` |
| 실행 중 | `Badge default` + `animate-pulse` |
| 완료 | `Badge success` |
| 실패 | `Badge error` + 에러 코드 |
| 활성 (스케줄/트리거) | `StatusDot online` |
| 중지 | `StatusDot offline` |

**실행 중 진행률:**
- WebSocket `job-progress` 이벤트 수신 시: 카드 하단에 `ProgressBar` + `statusMessage` 텍스트
- `job-progress` 없는 경우: `border-corthex-accent` + pulse 좌측 바만 (graceful degradation)
- `job-completed` 수신: 완료 상태로 즉시 전환 + `relatedReportId` 있으면 `[보고서 보기]` 버튼 추가
- `job-failed` 수신: 실패 상태 + `errorCode` 표시

**편집 모달:** 등록 모달과 동일 구조. 실행 중(`실행 중` 상태)인 작업의 편집 버튼은 `disabled + tooltip "실행 중에는 편집할 수 없습니다"`.

**취소 ConfirmDialog:** 실행 중 작업만 ConfirmDialog. 대기 중 작업은 즉시 취소.

**[결과 보기]:** 미리보기 없이 즉시 `/chat?session={resultSessionId}` 이동.

**보고서 연결:** `job-completed.relatedReportId` 있을 때 `[결과 보기]` 옆에 `[보고서 보기 →]` 버튼 표시. 클릭 → `/reports/{relatedReportId}`.

**상태별:** 작업 없음→EmptyState "에이전트에게 밤새 할 일을 맡겨보세요!", 로딩→Skeleton 3개, 실행 중→`border-corthex-accent`+pulse 좌측 바

**모바일:** 탭 가로 스크롤. 카드 100%. 모달→풀스크린 시트

**API:** `GET /jobs?type=once|schedule|trigger&page=&limit=`, `POST /jobs`, `PUT /jobs/:id`, `PUT /jobs/:id/toggle`, `DELETE /jobs/:id`, `POST /jobs/:id/retry`

**컴포넌트:** `JobsPage → Tabs (OnceJobList, ScheduleJobList, TriggerJobList) + JobCard (StatusBadge, AgentLabel, TimeInfo, ActionButtons, ProgressBar) + CreateJobModal (RadioGroup, DatetimeInput, RecurringForm, TriggerForm)`

파일: `jobs-page.tsx`, `job-card.tsx`, `schedule-card.tsx`, `trigger-card.tsx`, `create-job-modal.tsx`

### 10.6 보고서 (`/reports`) — FR-5

**목록 뷰 + 읽기 뷰 + 코멘트 + CEO 보고**

#### 목록 뷰

```
┌────────────────────────────────────────────────────┐
│  보고서                                            │
│  ┌─ 탭 ────────────────────────────────────────┐   │
│  │ [전체 (12)] [내가 요청 (5)] [CEO 보고 (3)]   │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📄 삼성전자 종합 분석 보고서                  │  │
│  │    🤖 금융분석팀장 — 2026-03-04 14:35        │  │
│  │    "삼성전자의 24년 4분기 실적과 전망..."     │  │
│  │    [📖 읽기] [💬 코멘트 (2)] [📤 CEO 보고]   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

#### 읽기 뷰

```
┌────────────────────────────────────────────────────┐
│  [← 목록]  삼성전자 종합 분석 보고서               │
│  🤖 금융분석팀장 — 2026-03-04 14:35               │
│  ┌─ 본문 (prose prose-sm dark:prose-invert) ────┐  │
│  └──────────────────────────────────────────────┘  │
│  ┌─ 코멘트 (2) ────────────────────────────────┐   │
│  │  👤 CEO — 3/4 15:00 "반도체 부문 더 자세히"  │   │
│  │  🤖 금융분석팀장 — 3/4 15:30 "추가 분석..."  │   │
│  │  ┌────────────────────┐ [코멘트 추가]        │   │
│  └──────────────────────────────────────────────┘   │
│  [📤 CEO에게 보고]  [📥 다운로드]                   │
└────────────────────────────────────────────────────┘
```

**보고서 카드 상세:**
- 미리보기 텍스트 `line-clamp-2 text-sm text-secondary`
- CEO 보고 완료된 카드: `Badge success "📤 CEO 보고 완료"` + 보고 날짜 표시

**CEO 보고 플로우:**
1. `[📤 CEO에게 보고]` 클릭 → ConfirmDialog: "이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다."
2. 확인 → Toast success "CEO에게 보고했습니다"
3. 버튼 → `disabled`. 카드에 `Badge success "📤 CEO 보고 완료"` + 날짜
4. 재보고: P1 없음 (버튼 비활성 유지)

**읽기 뷰 URL:** 독립 URL `/reports/:id`. 뒤로가기(`[← 목록]`) = `navigate(-1)`. 모바일 전체화면 자연스럽게 대응.

**읽기 뷰 상단 안내 (CEO 보고 완료 시):** `text-xs text-muted "CEO에게 보고된 보고서입니다"`. 본문 편집 불가, 에이전트 추가 생성 불가. 코멘트는 계속 가능.

**코멘트 섹션:**
- 순서: 오래된 것 위, 최신 아래 (시간순 오름차순). 입력창은 항상 최하단
- 최초 로딩 5개. "이전 코멘트 N개 더 보기" 버튼으로 lazy load
- 시각 구분:

| 작성자 | 정렬 | 배경 |
|--------|------|------|
| CEO (본인) | 우측 | `bg-corthex-accent/10` |
| 에이전트 | 좌측 | `bg-bg-muted` + 에이전트 아바타 |

**다운로드:** MD 형식만. `GET /reports/:id/download` → `.md` 파일 다운로드. 실패 시 Toast error. 다운로드 중 버튼 disabled + "다운로드 중..." + spinner.

**"내가 요청" 탭 기준:** `requestedBy == currentUserId` 필터. 채팅에서 `/보고서 작성` 요청 또는 직접 작업 등록 시 `requestedBy` 기록.

**에이전트와 이어서 논의:** 읽기 뷰 하단에 `[💬 에이전트와 이어서 논의하기]` 버튼. 클릭 → `/chat?newSession=true&agentId={보고서작성에이전트}&prompt=보고서+{id}+관련`.

**채팅 → 보고서 연결:** 채팅에서 보고서 생성 완료 시 스트리밍 완료 메시지에 "📄 보고서가 생성되었습니다 [보고서 보기]" 인라인 링크 포함. 알림에도 `[보고서 보기]` 액션 링크 → `/reports/{id}`.

**상태별:** 보고서 없음→EmptyState, 로딩(목록)→Skeleton 3개, 로딩(읽기)→Skeleton 10줄, CEO 보고 성공→Toast success

**모바일:** 카드 100%. 읽기 뷰 전체 화면. 액션 버튼 `sticky bottom-0 bg-base p-4 border-t`

**API:** `GET /reports?tab=all|mine|ceo&page=&limit=`, `GET /reports/:id`, `GET /reports/:id/comments?limit=5&before=`, `POST /reports/:id/comments`, `POST /reports/:id/submit-ceo`, `GET /reports/:id/download`

파일: `reports-page.tsx`, `report-card.tsx`, `report-reader.tsx`, `markdown-renderer.tsx`, `comment-section.tsx`

### 10.7 SNS: 멀티플랫폼. draft→pending→approved→published

### 10.8 메신저: 채널 기반 인간↔인간 채팅

### 10.9 대시보드: 비용 모니터링 + 에이전트 상태 종합

### 10.10 작전일지 (`/ops-log`) — FR-13, FR-10.1

**P1: 로그 데이터 + 실시간 스트리밍. P3: 상세 UI 보강.**

**결정 사항:**

| 항목 | 결정 |
|------|------|
| URL 필터 자동 활성화 | `/ops-log?filter={type}&id={logId}` 진입 시 FilterChip 자동 활성화 + 해당 로그 스크롤 + **5초 ring 하이라이트** (`ring-2 ring-corthex-accent`). hover 시 카운트다운 연장. 없는 id면 필터만 활성화 |
| 날짜 범위 필터 | **P1: 없음.** 날짜 그룹 구분 + 무한 스크롤로 충분. P3에서 달력 피커 추가 |
| start/end 시간 기준 | **서버 타임스탬프 기준.** `activity_logs.createdAt` 필드. 클라이언트 수신 시각 무관 |
| 스크롤 위치 관리 | **명시적 scroll position 관리.** 과거 로그 fetch 전 `scrollTop` 저장 → 완료 후 `scrollTop + 추가 높이` 보정. Chrome scroll anchoring 의존 금지 |
| REST 폴백 표시 | WebSocket 끊김 + REST 폴백 전환 시 **조용히 전환** (사용자에게 별도 안내 없음). `🟡 재연결 중...` 표시는 WebSocket 끊김 시에만 |

**레이아웃:**

```
┌────────────────────────────────────────────────────┐
│  ┌─ 필터 바 ────────────────────────────────────┐  │
│  │ [전체] [채팅] [도구] [위임] [에러] [시스템]   │  │
│  │                                  🔴 실시간 ON│  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ 새 로그 배너 (스크롤 내림 상태일 때) ────────┐  │
│  │ ↑ 새로운 활동 3건 — 클릭하여 확인             │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ── 오늘 ────────────────────────────────────────  │
│  14:35  🟡──┌ 💬 채팅 — 비서실장 ──────────────┐  │
│         │   │ "삼성전자 분석해줘"  ⏱ 진행 중... │  │
│         │   └────────────────────────────────────┘  │
│  14:35  ●──┌ 🔧 도구 호출 — 금융분석팀장 ──────┐   │
│             │ search_web ✅ 완료 (1.2초)          │   │
│             └──────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

#### 필터 바

| 요소 | 설명 |
|------|------|
| **필터 칩** | 토글형 뱃지. 활성=`bg-corthex-accent text-white`, 비활성=`bg-muted`. 복수 선택 가능 |
| **유형** | `chat`, `tool_call`, `delegation`, `job`, `trade`, `sns`, `system`, `error` |
| **실시간 표시** | 🔴 `animate-pulse` + "실시간 ON". 끊김=🟡 "재연결 중..." / ⚫ "오프라인" |

#### system 로그 예시

| system 로그 이벤트 | 표시 |
|-------------------|------|
| 서버 재시작 | ⚙️ 시스템 재시작 |
| 에이전트 온라인/오프라인 전환 | ⚙️ 비서실장 온라인 전환 |
| 스케줄 작업 시작 | ⚙️ 야간작업 스케줄러 시작 |
| WebSocket 재연결 | ⚙️ 실시간 연결 복구 |

#### 타임라인 아이템 — activity_logs 매핑

| 필드 | UI |
|------|-----|
| `type` | 아이콘: 💬chat 🔧tool_call 🔀delegation 📋job 💰trade 📢sns ⚙️system ❌error |
| `phase: 'start'` | 🟡 `animate-pulse` + "진행 중..." |
| `phase: 'end'` | 🟢 + "✅ 완료 (duration)" |
| `phase: 'error'` | 🔴 + "❌ 실패" + 에러 코드 |

#### start/end 쌍 매칭 (서버 타임스탬프 기준)

| 패턴 | 설명 |
|------|------|
| **진행 중** | start만, end 없음 → 🟡 pulse + "진행 중..." |
| **빠른 완료** | 서버 타임스탬프 간격 < 3초 → 카드 1개로 합침 |
| **느린 완료** | 서버 타임스탬프 간격 > 3초 → start, end 카드 각각 |
| **에러** | start + error → 🔴 에러 카드 + 에러 코드 + 재시도 횟수 |

#### 실시간 (WebSocket `activity-log` 채널)

| 이벤트 | 반응 |
|--------|------|
| 새 로그 + 스크롤 최상단 | 자동 prepend (slide-in). `scrollTop` 보정으로 위치 유지 |
| 새 로그 + 스크롤 내림 | "↑ 새로운 활동 N건" 배너. prepend 안 함 |
| end 도착 | 기존 start 카드 도트 색상 변경 + duration 추가 |
| WebSocket 끊김 | 🟡 "재연결 중..." 표시. 30초 REST 폴백 (조용히 전환) |

**페이지네이션:** 초기 50건 + 무한 스크롤 50건씩. 스크롤 위치 명시적 보정 (`scrollTop + 추가 높이`)

**모바일:** 시간 → 카드 위로 이동, 필터 칩 가로 스크롤, 카드 100%

파일: `ops-log-page.tsx`, `timeline-list.tsx`, `timeline-item.tsx`, `filter-bar.tsx`

### 10.11 NEXUS: React Flow + Dagre 캔버스 조직도. 관리자 전용 편집

### 10.12 전략실 (`/trading`) — FR-8

**v1 핵심 기능 이식. 주식 매매의 모든 것. 5개 탭 구조.**

**전체 레이아웃:**

```
┌──────────────────────────────────────────────────────┐
│ Sidebar │           전략실                             │
│         │  ┌─ 모드 배너 (실투자 시만) ───────────────┐ │
│         │  │ 🔴 실투자 모드 — 실제 자금이 사용됩니다 │ │
│         │  └──────────────────────────────────────── ┘ │
│         │  ┌─ 탭 ─────────────────────────────────┐   │
│         │  │ [관심목록] [포트폴리오] [매매이력]     │   │
│         │  │ [자동매매] [설정]                      │   │
│         │  └──────────────────────────────────────┘   │
│         │  🟡 모의투자 모드        (전역 모드 뱃지)   │
│         │  (각 탭 내용...)                             │
└──────────────────────────────────────────────────────┘
```

#### 전역 모드 뱃지 + 실투자 경고

| 요소 | 모의투자 | 실투자 |
|------|---------|--------|
| 탭 상단 뱃지 | `Badge warning "🟡 모의투자"` | `Badge error "🔴 실투자"` |
| 실투자 배너 | 없음 | 페이지 최상단 `bg-red-500/10 border border-red-500/30 text-red-400` 전체 폭 배너 |
| 자동매매 매매 버튼 | `Button default "[매수/매도 주문]"` | `Button destructive "[🔴 실매수/실매도 주문]"` |
| 사이드바 전략실 아이템 | 일반 | 아이템 좌측 빨간 dot |

뱃지 클릭 → 설정 탭으로 scroll (`/trading?tab=settings`).
모드 전환 후 → `invalidateQueries(['trading/watchlist', 'trading/portfolio', 'trading/history'])` 전부 재조회.

#### KIS 미연동 상태 접근 정책

| 연동 상태 | 처리 |
|-----------|------|
| 완전 미연동 | 모든 탭 콘텐츠 영역 = EmptyState "KIS API 연동이 필요합니다" + `[설정→]` 버튼. 탭 헤더는 활성 유지 |
| 모의만 연동 | 실투자 관련 항목 `disabled + tooltip "실투자 API를 연동하세요"` |
| 실만 연동 | 모의 관련 항목 `disabled + tooltip "모의투자 API를 연동하세요"` |
| 모두 연동 | 완전 기능 |

#### 탭 1: 관심목록 (FR-8.1, 8.2, 8.3)

```
┌────────────────────────────────────────────────────┐
│  관심목록  (현재 3/20)            [+ 종목 추가]    │
│  마지막 갱신: 14:32:10  (갱신 중 시 spinner)       │
│  ┌─────────────────────────────────────────────┐   │
│  │ 종목명     현재가     등락률   목표가   액션 │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 삼성전자   72,400    +1.2%   80,000  [분석] │   │
│  │            sparkline(80×32px, emerald)       │   │
│  │ 카카오     52,100    -0.8%    —  ✏  [분석] │   │
│  │            sparkline(80×32px, red)           │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

**결정 사항:**

| 항목 | 결정 |
|------|------|
| 종목 추가 모달 | 종목명+코드 debounce 300ms 검색 → 목록 선택. max 20종목. 헤더에 `(현재 N/20)`. 이미 추가된 종목은 `disabled` |
| sparkline | 20일봉 SVG `80×32px`. `/trading/watchlist` 응답에 `sparklineData: number[]` 포함. KIS 미연동 시 `null` → 회색 placeholder |
| 등락률 색상 | 양수=`text-emerald-500`, 음수=`text-red-500`, 보합=`text-zinc-400` |
| 목표가 inline edit | 셀 hover 시 연필 아이콘 표시. 클릭 → input 전환. Enter=저장, Esc=취소. 저장 성공 Toast 없음 (조용히) |
| 미설정 목표가 | `—` 표시. hover 시 `—✏` |
| 종목 삭제 | hover 시 우측 `🗑` 아이콘. ConfirmDialog("삼성전자를 관심목록에서 삭제하시겠습니까?"). 모바일=swipe-left → 빨간 삭제 버튼 |
| 30초 폴링 | 장 중(09:00~15:30 평일)만 폴링. 장 외: 폴링 중지, 갱신 시간 영역 "장 마감 (마지막 갱신: 15:30)" |
| 모바일 | md 이하 = 카드 레이아웃. 카드: 종목명+현재가 `font-mono font-bold`+등락률 뱃지+sparkline+`[분석]`. 목표가는 카드에서 숨김 (편집 버튼으로 접근) |
| 빈 상태 | "관심 있는 종목을 추가해보세요" + `[+ 종목 추가]` |
| [분석] 버튼 | `/chat?newSession=true&agentId={id}&prompt={종목명}+분석해줘` → 새 채팅 세션 |
| 폴링 3회 연속 실패 | 갱신 시간 영역에 `⚠️ 가격 정보를 불러올 수 없습니다` `text-xs text-amber-500`. 포커스 복귀 시 즉시 재시도 |

**API:** `GET /trading/watchlist` (sparklineData 포함), `POST /trading/watchlist`, `DELETE /trading/watchlist/:id`, `PUT /trading/watchlist/:id/target-price`, `GET /trading/prices?codes=` (30초 폴링, 장 중만)

#### 탭 2: 포트폴리오 (FR-8.6)

```
┌────────────────────────────────────────────────────┐
│  ┌─ 요약 ────────────────────────────────────────┐  │
│  │  총 평가금액                                  │  │
│  │  52,340,000원   (text-2xl font-mono font-bold)│  │
│  │  총 손익: +2,340,000원    수익률: +4.68%       │  │
│  │           text-emerald-500                    │  │
│  └──────────────────────────────────────────────┘  │
│  ┌─ 보유 종목 ─────────────────────────────────┐    │
│  │ 종목  수량  평균단가  현재가  손익  비중      │    │
│  │ 삼성  10   70,000   72,400  +2.4% ████ 45%  │    │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

| 항목 | 결정 |
|------|------|
| 총 평가금액 | `text-2xl font-mono font-bold` |
| 총 손익/수익률 | 양수=`text-emerald-500`, 음수=`text-red-500` |
| 비중 바 | `ProgressBar` 우측 컬럼. 색상 `bg-corthex-accent/60`. 오른쪽에 `text-xs text-muted` % 텍스트 |
| 모바일 컬럼 | 평균단가/수량 `hidden md:table-cell` 숨김. 종목/현재가/손익/비중만 표시 |
| 빈 상태 | KIS 미연동="KIS API 연동이 필요합니다" + `[설정→]`. 연동 후 보유 없음="아직 보유 종목이 없습니다" |
| 실시간 업데이트 | WebSocket `trade-executed` → `invalidateQueries(['trading/portfolio'])` 즉시 재조회 |

**API:** `GET /trading/portfolio`

#### 탭 3: 매매이력 (FR-8.9)

성과 요약 카드 + `FilterChip` 2그룹 + 매매 행 무한스크롤

| 항목 | 결정 |
|------|------|
| 성과 요약 | 승률 = 매도 중 수익 비율. 현재 필터(모의/실) 반영 |
| 매매 행 색상 | 매수=`▲ text-emerald-500`, 매도=`▼ text-red-500`. 모의거래=`Badge outline "모의"` |
| 필터 UI | `FilterChip` 2그룹: `[매수][매도]` + `[모의][실투자]`. 다중선택. 기본=전체 |
| 페이지네이션 | 무한스크롤 `limit=20` cursor 기반 |
| 빈 상태 | "아직 매매 이력이 없습니다" / 필터 적용 시 "해당 조건의 이력이 없습니다" |

**API:** `GET /trading/history?type=buy|sell&mode=mock|real&limit=20&cursor=`, `GET /trading/history/summary?mode=`

#### 탭 4: 자동매매 (FR-8.4, 8.5, 8.7, 7.7)

**모바일 레이아웃 — Accordion:**
```
md 이하:
  ▼ 즉시 매매        (기본 펼침)
    [폼 내용...]
  ▶ 스케줄 매매  (2)  (기본 접힘)
  ▶ 목표가 트리거 (1) (기본 접힘)
  ▶ 에이전트 자율 모드 (기본 접힘)

lg 이상: Accordion 없음, 전부 펼침 세로 배치
```

**즉시 매매 폼:**

| 필드 | 결정 |
|------|------|
| 종목 선택 | `Select` 기본값=관심목록 종목. "직접 입력" 옵션 추가. 관심목록 비어있으면 직접 검색 fallback |
| 주문 유형 | `RadioGroup [시장가 ●][지정가 ○]`. 지정가 선택 시 희망가격 Input 추가 표시 |
| 희망가격 기본값 | 지정가 전환 시 = 현재가 자동 채움 |
| 수량 | `Input type="number" min={1} step={1}`. 소수점 방지 |
| 예상 금액 | 수량 × 현재가 `font-mono text-sm text-secondary` 자동 계산 표시 |
| SafeGuard 한도 초과 | input 테두리 `ring-1 ring-red-500` + 경고 텍스트 |
| 실행 중 | 버튼 `disabled + "주문 중..." + spinner`. 폼 전체 잠금 |
| 성공 | Toast success "삼성전자 10주 매수 주문 완료" + `invalidateQueries(['trading/history'])` |
| 실패 | Toast error "주문 실패: {에러 메시지}". 폼 잠금 해제 |
| SafeGuard 차단 | Toast error "SafeGuard 한도 초과로 주문이 차단되었습니다" |

**SafeGuard 패널 (폼 하단 고정):**
```
┌─ SafeGuard ──────────────────────────┐
│ 모드: 🟡 모의투자                    │
│ 오늘 사용: 150,000 / 500,000원 (30%) │
│ 자율 범위: 종목당 최대 5만원         │
└──────────────────────────────────────┘
```

**SafeGuard 5단계 UI 매핑:**

| 단계 | UI 위치 |
|------|---------|
| ①모드 확인 | 전략실 상단 전역 뱃지 + 실투자 배너 |
| ②일일 한도 | SafeGuard 패널 진행 표시 + 설정 탭 `ProgressBar` |
| ③자율 범위 | 자율 모드 `Select` 반영 + SafeGuard 패널 표시 |
| ④실행 | 매매 버튼 (모의=default, 실=destructive) |
| ⑤기록 | 자동 (`trade_logs` INSERT) |

**에이전트 자율 모드 Select 옵션:**

| 값 | 레이블 |
|----|--------|
| `off` | 자율 매매 비활성화 |
| `suggest` | 제안만 (실행 안 함) |
| `auto-low` | 종목당 1만원 이하 자율 실행 |
| `auto-mid` | 종목당 5만원 이하 자율 실행 |
| `auto-high` | 일일 한도 내 자율 실행 |

기본값=`off`.

**스케줄/트리거 목록:** `TradingScheduleCard` (JobCard 파생, 매매 특화 내용).

**API:** `POST /trading/execute`, `GET/POST /trading/schedules`, `PUT /trading/schedules/:id`, `DELETE /trading/schedules/:id`, `GET/POST /trading/triggers`, `PUT /trading/triggers/:id`, `DELETE /trading/triggers/:id`, `GET/PUT /trading/autonomous`, `GET /trading/safeguard/status`

#### 탭 5: 설정 (FR-8.8, 8.11, 8.13, 8.14)

**KIS 연결 상태 (최상단 섹션):**
```
┌─ KIS API 연결 상태 ────────────────────┐
│ 모의투자 API  ● 연결됨  마지막: 14:30  │
│ 실투자 API    ○ 미연결  [연동하기]      │
└──────────────────────────────────────┘
```

**투자 모드 전환:**
- 모의→실: ConfirmDialog "실투자 모드로 전환합니다. 실제 자금이 사용됩니다. 계속하시겠습니까?"
- 실→모의: ConfirmDialog "자동매매 스케줄이 실행 중일 수 있습니다. 모의투자로 전환하면 실행 중인 스케줄이 중지됩니다."
- 모드 전환 후 전체 데이터 재조회

**SafeGuard 한도:** `Input type="number"` + 단위 `원`. blur 또는 Enter 시 저장 (debounce 1000ms). `ProgressBar`로 현재 사용량 시각화.

**매매 전략 편집:** `font-mono text-sm Textarea auto-resize`. `[전략 저장]` 버튼 명시적. 미저장 변경 시:
- 라우터 이탈: `useBlocker` (React Router 6.4+) → 커스텀 ConfirmDialog "저장하지 않은 전략이 있습니다. 나가시겠습니까?"
- 브라우저 닫기: `beforeunload` 이벤트

**API:** `GET /trading/settings`, `PUT /trading/settings/mode`, `PUT /trading/settings/limits`, `PUT /trading/settings/strategy`, `GET /trading/safeguard/status`

#### 전략실 컴포넌트 트리

```
TradingPage → ModeBadge + RealTradingBanner (실투자 시만)
           → Tabs (overflow-x-auto 모바일 가로스크롤)
             WatchlistTab (WatchlistTable/WatchlistCard, AddStockModal, InlineTargetPrice)
             PortfolioTab (PortfolioSummary, HoldingsTable)
             HistoryTab (PerformanceSummary, FilterChips, TradeList)
             AutoTradeTab (Accordion 모바일)
               InstantTradeForm (StockSelect, OrderTypeRadio, SafeGuardPanel)
               TradingScheduleList (TradingScheduleCard)
               TradingTriggerList (TradingScheduleCard)
               AutonomousModeSelect
             SettingsTab (KisStatusSection, ModeSelectorWithDialog, SafeGuardLimits/ProgressBar, StrategyEditor)
```

파일: `trading-page.tsx`, `watchlist-tab.tsx`, `portfolio-tab.tsx`, `history-tab.tsx`, `auto-trade-tab.tsx`, `trading-settings-tab.tsx`, `trading-schedule-card.tsx`, `safe-guard-panel.tsx`, `mode-badge.tsx`

### 10.13 알림 (`/notifications`) — FR-10.6

**결정 사항:**

| 항목 | 결정 |
|------|------|
| 알림 클릭 후 복귀 | 해당 페이지 이동. 복귀 버튼 없음. 읽음 처리는 클릭 즉시 (이동 전). 브라우저 뒤로가기로 복귀 |
| 사이드바 뱃지 | **실제 미읽음 건수** 유지. 목록 페이지 진입해도 자동 초기화 안 함. 개별 클릭 또는 "모두 읽음"으로만 감소 |
| 알림 삭제 | **P1 없음.** 30일 서버 자동 삭제. P3에서 개별/전체 삭제 추가 |
| 실시간 삽입 위치 | **"오늘" 그룹 최상단** slide-in. 스크롤 내림 상태이면 `↑ 새 알림 N건` 배너 |
| Toast 위치 | **우상단** `top-4 right-4` (채팅 입력창과 겹침 방지) |
| 30일 보관 안내 | 알림 설정 탭 하단 `text-xs text-muted`: "알림은 30일간 보관됩니다" |

#### 알림 목록 (탭 1)

```
┌────────────────────────────────────────────────────┐
│  [● 알림 목록 (3)]  [ 알림 설정 ]                   │
│                                                    │
│  [전체] [미확인만]                    [모두 읽음 ✓] │
│                                                    │
│  ── 오늘 ────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🔵 🔔 금융분석팀장이 삼성전자 분석을 완료    │  │
│  │    💬 채팅에서 확인하기              2분 전   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

| 요소 | 설명 |
|------|------|
| **미확인** | 🔵 좌측 인디고 점 + `bg-corthex-accent/5`. 클릭 시 읽음 처리 |
| **아이콘** | 🔔일반 ✅완료 ⚠️경고 ❌에러 🤖에이전트 💰매매 🛡️SafeGuard |
| **액션 링크** | `text-corthex-accent` — 해당 페이지로 이동 |
| **실시간** | WebSocket `notifications` 채널 → 오늘 그룹 최상단 slide-in 또는 배너 |
| **페이지 밖 Toast** | 우상단 `top-4 right-4`. 5초 자동 닫힘. "확인하기" 클릭 → `/notifications` |

**알림 유형 매핑:**

| 이벤트 | 아이콘 | 액션 링크 |
|--------|--------|----------|
| 채팅 응답 완료 | 🔔 | 💬 채팅 → `/chat?session=` |
| 도구 호출 실패 | ⚠️ | 📋 작전일지 → `/ops-log` |
| 야간작업 완료 | ✅ | 💬 결과 보기 → `/chat?session=` |
| 야간작업 실패 | ❌ | 📋 작전일지 → `/ops-log` |
| 위임 완료 | 🤖 | 💬 채팅 → `/chat?session=` |
| 매매 체결 (P2) | 💰 | 📊 전략실 → `/trading` |
| SafeGuard 차단 (P2) | 🛡️ | ⚙️ 설정 → `/settings` |

#### 알림 설정 (탭 2)

카테고리별 Card — 이벤트 행마다 Toggle 스위치. 변경 즉시 저장 (낙관적 업데이트 + API 호출. 이탈 시 API 호출 계속 진행, 실패 시 무시).

| 카테고리 | 이벤트 | P1 | P2 |
|----------|--------|----|----|
| **채팅** | 에이전트 응답 완료 | 앱 | +푸시 |
| | 도구 호출 실패 | 앱 | +푸시 |
| | 위임 완료 | 앱 | +푸시 |
| **작업** | 야간작업 완료/실패 | 앱 | +푸시 |
| **시스템** | 에이전트 상태 변경 | 앱 | |
| | 서버 재시작 | 앱 | |
| **매매 (P2)** | 매매 체결 | — | 앱+푸시 |
| | SafeGuard 차단 | — | 앱+푸시 |
| | 목표가 도달 | — | 앱+푸시 |

탭 하단 `text-xs text-muted`: "알림은 30일간 보관됩니다"

**모바일:** 탭 전체 너비 2등분. 알림 카드 100%. 설정 탭 토글 우측 정렬

파일: `notifications-page.tsx`, `notification-list.tsx`, `notification-item.tsx`, `notification-settings.tsx`

### 10.14 설정 (`/settings`) — FR-2.4

**탭 구조:** [API 연동 (P1)] [파일 관리 (P2)] [매매 설정 (P2)] [소울 편집 (P3)]

**결정 사항:**

| 항목 | 결정 |
|------|------|
| 수정 시 pre-fill | 계좌번호/호스트/포트/사용자명/발신주소 → pre-fill. App Key/Secret/비밀번호/API Key → 빈 상태 (placeholder: "변경하지 않으려면 비워두세요") |
| 빈 필드 처리 | **payload에서 제외.** 빈 필드는 서버에 아예 안 보냄. 서버는 누락 필드를 기존 값 유지 |
| 연동 테스트 | **서비스별 차등.** KIS/노션: 저장 후 자동 테스트 (결과 인라인 표시). 이메일 SMTP: 별도 `[테스트 메일 보내기]` 버튼 (사용자 트리거) |
| KIS 모의/실 동시 연동 | **동시 가능.** 모의/실은 독립 자격증명. 전략실 설정 탭에서 사용 모드 전환 |
| 저장 실패 처리 | 모달 유지 + 입력값 유지 + 모달 하단 인라인 에러 + 버튼 재활성화 |
| HTTPS 안내 문구 | 모든 API 등록/수정 모달 공통: `🔒 모든 키는 서버에서 암호화되어 저장됩니다` (`text-xs text-muted`) |

#### API 연동 탭 (P1)

```
┌────────────────────────────────────────────────────┐
│  개인 도구의 API 연동 정보를 관리하세요.            │
│                                                    │
│  ┌─ KIS 증권 (모의투자) ────────────────────────┐  │
│  │  상태: ✅ 연동됨           [수정][삭제]       │  │
│  │  App Key    [••••••••••••hk3F]               │  │
│  │  App Secret [••••••••••••9xPw]               │  │
│  │  계좌번호   [50123456-01]                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ KIS 증권 (실투자) ──────────────────────────┐  │
│  │  상태: ○ 미연동                       [등록] │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ 노션 ──────────────────────────────────────┐  │
│  │  상태: ✅ 연동됨           [수정][삭제]       │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─ 이메일 (SMTP) ─────────────────────────────┐  │
│  │  상태: ○ 미연동          [등록]              │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**서비스별 폼 필드:**

| 서비스 | 필드 | 자동 테스트 |
|--------|------|------------|
| KIS (모의/실) | App Key, App Secret, 계좌번호 | ✅ 저장 후 자동 |
| 노션 | API Key | ✅ 저장 후 자동 |
| 이메일 SMTP | 호스트, 포트, 사용자명, 비밀번호, 발신 주소 | 수동 버튼 |

**자동 테스트 결과 표시:**
```
✅ KIS 증권 연동 확인됨          (저장 성공 + 테스트 성공)
⚠️ 저장됨. 연동 확인 실패: 유효하지 않은 App Key  (저장 성공 + 테스트 실패)
```

| 요소 | 설명 |
|------|------|
| **상태 뱃지** | ✅ 연동됨 (`Badge success`) / ○ 미연동 (`Badge outline`) |
| **필드 마스킹** | 앞 4자 + `••••` + 뒤 4자 |
| **등록/수정 모달** | `type="password"` + 👁 토글. 하단 `🔒 모든 키는 서버에서 암호화되어 저장됩니다` |
| **저장 실패** | 모달 유지, 인라인 에러, 버튼 재활성화 |
| **삭제** | ConfirmDialog 필수 |
| **모바일** | 카드 100% + 모달→풀스크린 시트 |

**API:** `GET /credentials`, `POST /credentials`, `PATCH /credentials/:id`, `DELETE /credentials/:id`, `POST /credentials/:id/test`

### 10.15 파일 관리 (설정 P2 탭) — FR-11b

```
┌────────────────────────────────────────────────────┐
│  파일 관리                                         │
│  ┌─ 사용량 ────────────────────────────────────┐   │
│  │  234 MB / 1 GB (23.4%)                      │   │
│  │  ████████░░░░░░░░░░░░░░░░░░░░  (90% 이상 시 │   │
│  │  "저장 공간이 부족합니다" text-amber-600)    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌─ 업로드 ────────────────────────────────────┐   │
│  │  📤 파일을 드래그하거나 클릭하여 업로드       │   │
│  │  지원: png/jpg/mp4/md/txt/pdf. 최대 100MB    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌─ 업로드 진행 행 (업로드 중인 파일) ─────────┐  │
│  │  📄 삼성분석.md  ████░░░ 45%  [취소]         │  │
│  └──────────────────────────────────────────────┘  │
│  ┌─ 파일 목록 (최신순) ─────────────────────────┐  │
│  │  📄 삼성분석.md    문서  12KB  3/4   ⬇ 🗑   │  │
│  │  📕 연간보고서.pdf  PDF  2.3MB  3/3   ⬇ 🗑  │  │
│  │  🖼 차트캡처.png   이미지  840KB 3/2   ⬇ 🗑 │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**결정 사항:**

| 항목 | 결정 |
|------|------|
| 기본 정렬 | 업로드 최신순 (createdAt DESC) |
| 타입 아이콘 | md/txt=📄, pdf=📕, png/jpg=🖼, mp4=🎬, 기타=📎 |
| 업로드 진행 | 목록 상단에 진행 행 인라인 표시. `ProgressBar` + "업로드 중... 45%" + `[취소]` 버튼 |
| 다중 파일 업로드 | 최대 5개 동시. 초과분 큐 대기 |
| 크기 초과 에러 | 업로드 영역 하단 인라인 `text-sm text-corthex-error "파일 크기가 100MB를 초과합니다"` |
| 90% 경고 | 사용량 바 `bg-amber-500`. `text-amber-600 "저장 공간이 부족합니다"` |
| 파일 삭제 | ConfirmDialog 필수. 에이전트 참조 중인 경우 "이 파일은 {에이전트명}이 참조 중입니다. 삭제해도 괜찮으시겠습니까?" |
| 검색/필터 | P2 없음 |
| 목록 페이지네이션 | 무한스크롤 `limit=20` |
| 업로드 취소 | `AbortController.abort()` + `DELETE /files/upload/{uploadId}` 자동 호출 |
| 네트워크 끊김 | 즉시 실패 표시 + `[재시도]` 버튼. 자동 재시도 없음 |

**API:** `GET /files?limit=20&cursor=`, `GET /files/usage`, `POST /files/upload`, `GET /files/:id/download`, `DELETE /files/:id`, `DELETE /files/upload/:uploadId` (취소), `GET /files/:id/references` (삭제 전 참조 확인)

파일: `file-management-tab.tsx`, `upload-zone.tsx`, `file-row.tsx`

### 10.16 P2 기존 화면 확장

#### 홈 P2 확장 (FR-2.2)

| 카드 | 설명 |
|------|------|
| **완료된 작업** | Card. 최대 3건. ✅+작업명+에이전트+시간. `[모두 보기]`→`/jobs`. 야간작업 없으면 숨김 |
| **포트폴리오 요약** | Card. 총 평가금액 `font-mono font-bold` + 수익률 + 모드 뱃지 + `[포트폴리오→]` → `/trading?tab=portfolio`. KIS 미연동 시 숨김 |

#### 알림 설정 PWA 확장 (FR-10.6)

기존 알림 설정에 P2 푸시 토글 추가 + 매매 알림 카테고리 추가

#### 채팅 P2 확장 — 위임 체인 상세 (FR-12)

헤더 위임 체인 상세 (섹션 10.4 참조). 단체 세션: 아바타 그룹 `flex -space-x-2`

---

## 11. Interaction Rules

| 패턴 | 규칙 |
|------|------|
| **로딩** | 스켈레톤 UI (pulse 애니메이션). "로딩 중..." 금지 |
| **에러** | 인라인 `text-corthex-error` 메시지 + 에러 코드 |
| **빈 상태** | 안내 + CTA 버튼 |
| **실시간** | WebSocket으로 상태/알림 자동 업데이트 |
| **반응형** | 모든 페이지 반응형(P1). lg(1024px+)=사이드바 고정, md 이하=햄버거 오버레이 |
| **다크모드** | 시스템 설정 자동 감지. 깜빡임 방지 초기화 script |
| **폼 제출** | disabled + "...중" → 성공 시 자동 닫기 + 캐시 무효화 |
| **삭제** | ConfirmDialog 필수 |
| **Toast 위치** | 우상단 `top-4 right-4` (전역 통일) |

---

## 12. Phase별 UI 범위

### P1 (현재)

**Admin:**
- [x] Admin 7개 페이지 (기존 구현 유지)
- [ ] Admin 보고 라인 (FR-1.9) — 섹션 9.9 스펙 완료

**App:**
- [x] 로그인
- [x] 홈 기본
- [x] 채팅 기본
- [ ] 공유 UI 컴포넌트 Phase A→E 순차 구현 (Phase E 신설: UploadZone, RadioGroup)
- [ ] 반응형 CSS — 햄버거 메뉴 포함 모든 페이지
- [ ] 알림 페이지 (목록 + 설정)
- [ ] 설정 — API 연동 탭
- [ ] 작전일지 — WebSocket 실시간 스트리밍
- [ ] 전역 Toast (우상단), 에러 바운더리 3단계
- [ ] 토큰 만료 리다이렉트 (REST + WebSocket)

### P2

- [x] **전략실** (5탭) — 관심목록+포트폴리오+매매이력+자동매매+설정. 모드 뱃지+실투자 경고 배너. KIS 미연동 정책. 장 외 폴링 중지. 모바일 Accordion
- [x] **야간작업** (3탭) — 일회성+반복스케줄+이벤트트리거. 작업 등록 모달 유형별 폼. job-progress 실시간 진행률. 보고서 자동 연결
- [x] **보고서** — 목록(3탭)+읽기뷰(`/reports/:id`)+코멘트+CEO 보고. 채팅↔보고서 연결 플로우
- [x] **파일 관리** — 설정 탭 확장. 다중 업로드+진행+취소. 에이전트 참조 확인 삭제
- [x] **홈 P2 확장** — 완료 작업 + 포트폴리오 요약 (`/trading?tab=portfolio`)
- [x] **알림 PWA 확장** — 푸시 토글 + 매매 알림
- [x] **채팅 위임 확장** — 위임 체인 상세 + 단체 세션
- [x] **P2 WebSocket 이벤트** — trade-executed/job-progress/job-completed/job-failed 구조 확정
- [ ] **PWA** — Service Worker + 푸시 알림 + 오프라인 캐시

### P3

- [ ] SNS 멀티플랫폼 + 승인
- [ ] 메신저 채널 기반
- [ ] 대시보드 비용 모니터링
- [ ] 작전일지 상세 UI + 날짜 범위 필터
- [ ] 에이전트 소울 편집
- [ ] Admin 소울 템플릿
- [ ] 이메일 알림 설정
- [ ] Admin 7개 페이지 스타일 통일 리팩터링
- [ ] 다크모드 수동 토글

### P4

- [ ] NEXUS 스케치바이브 (캔버스→코드 반영)
- [ ] MCP 연동 설정
