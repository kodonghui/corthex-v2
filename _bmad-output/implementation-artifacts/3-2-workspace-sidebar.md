# Story 3.2: Workspace Sidebar

Status: done

## Story

As a 일반 직원(유저),
I want 워크스페이스 사이드바에서 메뉴를 탐색하고 모바일에서도 사용할 수 있다,
so that 어떤 기기에서든 CORTHEX의 모든 기능에 접근할 수 있다.

## Acceptance Criteria

1. **Given** lg(1024px+) 화면 **When** 로그인 후 페이지 접속 **Then** 사이드바 w-60 고정 표시, 메인 콘텐츠 flex-1
2. **Given** md 이하 화면 **When** 페이지 접속 **Then** 사이드바 숨김 + 상단바(h-14)에 ☰ 햄버거 + 로고 + 유저 아바타 표시
3. **Given** 모바일 **When** ☰ 버튼 클릭 **Then** 사이드바 왼쪽 슬라이드인(200ms) + 뒤 bg-black/40 오버레이
4. **Given** 모바일 사이드바 열림 **When** 오버레이 클릭 / NavLink 클릭 / Esc 키 / 뒤로가기 **Then** 사이드바 닫힘(슬라이드아웃 200ms)
5. **Given** UX 스펙 10.1 메뉴 구조 **When** 사이드바 렌더링 **Then** 홈, 업무(채팅/전략실/야간작업/보고서), 운영(SNS/메신저/대시보드/작전일지/NEXUS), 시스템(알림/설정) 그룹 표시
6. **Given** 현재 페이지 **When** 사이드바 NavLink 렌더링 **Then** 활성 메뉴=indigo 배경, 호버=zinc 배경
7. **Given** 사이드바 하단 **When** 유저 로그인 상태 **Then** 유저 이름 + 역할 + 로그아웃 + 빌드 번호 표시

## Tasks / Subtasks

- [x] Task 1: 반응형 Layout 컴포넌트 리팩터링 (AC: #1, #2)
  - [x] layout.tsx에 lg 이상 사이드바 고정, md 이하 숨김 처리
  - [x] 모바일 상단바 (h-14): ☰ 버튼 + 로고(C아이콘+CORTHEX) + 유저 아바타 초기
  - [x] useSidebar 상태 관리: isOpen, toggle, close
- [x] Task 2: 모바일 사이드바 오버레이 (AC: #3, #4)
  - [x] 슬라이드인/아웃 애니메이션 (200ms ease-out, translate-x)
  - [x] bg-black/40 오버레이 클릭 → close
  - [x] NavLink 클릭 시 자동 close
  - [x] Esc 키 이벤트 핸들러
  - [x] 뒤로가기(popstate) 이벤트 핸들러 — history.pushState로 가상 히스토리 추가, popstate에서 close
- [x] Task 3: 사이드바 메뉴 구조 업데이트 (AC: #5)
  - [x] UX 스펙 10.1 기준으로 navSections 업데이트: 시스템 그룹(알림/설정) 추가
  - [x] /notifications 라우트용 페이지 placeholder 추가 (App.tsx)
  - [x] /trading 라우트용 페이지 placeholder 추가 (App.tsx) — P2이지만 메뉴 구조에 포함
- [x] Task 4: 빌드 + 기존 테스트 통과 확인 (AC: #1~#7)
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과

## Dev Notes

### 핵심: 모바일 반응형 추가

현재 sidebar.tsx는 데스크톱 고정만 지원. UX 스펙 섹션 5 반응형 레이아웃에 따라:
- lg(1024px+): 현행 유지 (w-60 고정)
- md 이하: 사이드바 숨김 → 상단바 + 햄버거

### 현재 파일 상태

| 파일 | 현재 상태 | 필요한 변경 |
|------|----------|------------|
| `packages/app/src/components/layout.tsx` | flex + Sidebar + main | 반응형 분기 (lg: 현행, md이하: 상단바+오버레이) |
| `packages/app/src/components/sidebar.tsx` | 데스크톱 전용 w-60 | 메뉴 구조 업데이트(알림/설정 시스템 그룹), 모바일 close 콜백 |
| `packages/app/src/App.tsx` | 라우트 정의 | /notifications, /trading placeholder 추가 |

### 사이드바 메뉴 구조 (UX 스펙 10.1 기준)

현재 → 변경:
```
현재:                           변경 후:
홈                              홈
업무: 채팅/야간작업/보고서      업무: 채팅/전략실(P2)/야간작업/보고서
운영: SNS/메신저/대시보드/      운영: SNS/메신저/대시보드/
      작전일지/NEXUS                  작전일지/NEXUS
설정                            시스템: 알림/설정
```

**변경점:**
- 전략실(/trading) 메뉴 추가 (업무 그룹, P2)
- 알림(/notifications) 메뉴 추가 (시스템 그룹, P1)
- 설정을 시스템 그룹으로 이동

### 반응형 레이아웃 구현 패턴

**Layout 구조 (변경 후):**
```
lg 이상:
┌─────────┬──────────────────────┐
│ Sidebar │   Main Content       │
│ (w-60)  │   (flex-1)           │
└─────────┴──────────────────────┘

md 이하:
┌──────────────────────────────┐
│ ☰  [C] CORTHEX        [👤]  │  ← 상단바 h-14
├──────────────────────────────┤
│       Main Content           │
│       (full width)           │
└──────────────────────────────┘

☰ 클릭 시:
┌────────┬─────────────────────┐
│Sidebar │  bg-black/40        │  ← 오버레이
│(w-60)  │  오버레이            │
│slide-in│                     │
└────────┴─────────────────────┘
```

**모바일 상단바 (md 이하):**
```
┌──────────────────────────────────┐
│  ☰    [C] CORTHEX         [👤]  │
└──────────────────────────────────┘
h-14, bg-surface, border-b, sticky top-0
```

### 햄버거 사이드바 동작 (UX 스펙)

| 이벤트 | 동작 |
|--------|------|
| ☰ 버튼 클릭 | 사이드바 왼쪽에서 슬라이드인 (200ms ease-out) + 뒤 bg-black/40 오버레이 |
| 오버레이 클릭 | 슬라이드아웃 (200ms) |
| NavLink 클릭 | 페이지 이동 + 사이드바 자동 닫힘 |
| 뒤로가기 (History) | 사이드바 열려있으면 닫힘 |
| Esc 키 | 사이드바 닫힘 |
| 스크롤 | 닫히지 않음 |

### 구현 방식 권장

**상태 관리:** layout.tsx 내부 useState로 `sidebarOpen` 관리. Zustand store 불필요 (이 컴포넌트 범위 내에서만 사용).

**반응형 분기:** Tailwind CSS 클래스로 처리:
- 사이드바: `hidden lg:flex` (데스크톱), 모바일은 조건부 렌더링
- 상단바: `lg:hidden flex` (모바일만 표시)
- 메인 영역은 항상 flex-1

**애니메이션:** CSS transition으로 구현:
```css
transform: translateX(-100%) → translateX(0)
transition: transform 200ms ease-out
```

**NavLink 클릭 시 close:** sidebar.tsx에 `onNavClick?: () => void` prop 추가, NavLink onClick에서 호출

### Story 3-1 참조 (이전 스토리 인텔리전스)

- auth-store.ts에 user 객체 (name, role, companyId) 있음 — 사이드바 하단 유저 영역에서 사용
- localStorage 키: `corthex_token`, `corthex_user`
- 빌드 전역 변수: `__BUILD_NUMBER__`, `__BUILD_HASH__`, `__BUILD_TIME__`

### 주의사항

- **전략실/알림 페이지는 placeholder만**: 실제 구현은 각각 P2, P1 이후 스토리에서. 빈 페이지 컴포넌트만 생성
- **기존 사이드바 스타일 유지**: 색상, NavLink 클래스, 아이콘 이모지 패턴 그대로
- **admin 사이드바와 별개**: admin은 회사 드롭다운 있음, app은 없음
- **다크모드**: 기존 dark: 접두사 패턴 유지

### Project Structure Notes

```
packages/app/src/
├── components/
│   ├── layout.tsx         ← 수정 (반응형 레이아웃, 모바일 상단바, 오버레이)
│   └── sidebar.tsx        ← 수정 (메뉴 구조 업데이트, onNavClick prop)
├── pages/
│   ├── notifications.tsx  ← 신규 (placeholder)
│   └── trading.tsx        ← 신규 (placeholder)
├── App.tsx                ← 수정 (/notifications, /trading 라우트 추가)
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 5] — Sidebar 구조, 반응형 레이아웃
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Section 10.1] — User App 사이드바 메뉴 구조
- [Source: packages/app/src/components/sidebar.tsx] — 현재 사이드바 구현
- [Source: packages/app/src/components/layout.tsx] — 현재 레이아웃 구현
- [Source: packages/admin/src/components/sidebar.tsx] — Admin 사이드바 참조 패턴
- [Source: _bmad-output/implementation-artifacts/3-1-user-login-jwt.md] — 이전 스토리 참조

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- layout.tsx: 반응형 레이아웃 — lg 이상 데스크톱(사이드바 고정), lg 미만 모바일(상단바+햄버거 오버레이)
- layout.tsx: 모바일 상단바 h-14 — ☰ 햄버거 + 로고(C아이콘+CORTHEX) + 유저 아바타 이니셜
- layout.tsx: 사이드바 오버레이 — bg-black/40, 슬라이드인 애니메이션(200ms), Esc/popstate/오버레이 클릭으로 닫기
- sidebar.tsx: 메뉴 구조 UX 스펙 10.1 기준 업데이트 — 전략실(/trading) 추가, 시스템 그룹(알림/설정) 분리
- sidebar.tsx: onNavClick prop 추가 — 모바일 NavLink 클릭 시 사이드바 자동 닫기
- index.css: slide-in 키프레임 애니메이션 추가 (200ms ease-out)
- App.tsx: /trading, /notifications 라우트 + lazy 페이지 추가
- notifications.tsx, trading.tsx: placeholder 페이지 신규 생성
- 빌드 3/3 성공, 유닛 테스트 69/69 통과, 기존 테스트 회귀 없음

### File List
- packages/app/src/components/layout.tsx — 반응형 레이아웃 (데스크톱/모바일 분기, 상단바, 오버레이)
- packages/app/src/components/sidebar.tsx — 메뉴 구조 업데이트, onNavClick prop
- packages/app/src/App.tsx — /trading, /notifications 라우트 추가
- packages/app/src/pages/notifications.tsx — 알림 placeholder 페이지 (신규)
- packages/app/src/pages/trading.tsx — 전략실 placeholder 페이지 (신규)
- packages/app/src/index.css — slide-in 키프레임 애니메이션 추가
