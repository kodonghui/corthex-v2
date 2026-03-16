# Prompt 1: Gemini 4 스타일 — Web (데스크톱)

아래 프롬프트를 Gemini에 그대로 복사 붙여넣기하세요.

---

CORTHEX v2라는 SaaS 프로덕트의 UXUI를 완전히 새로 디자인해줘.

## 디자인 방향: 내추럴 오가닉 (Natural Organic)
Notion, Things 3, Bear App을 참고해.
- 따뜻한 베이지/크림 배경 (#faf8f5 메인, #f5f0eb 서브)
- 카드: 순백 (#ffffff), rounded-2xl (16px), shadow `0 4px 20px rgba(0,0,0,0.03)`, border #e8e6e1
- 액센트 3색: 올리브그린(#5a7247 primary), 테라코타(#c4622d secondary), 머스타드(#d4a843 accent)
- 텍스트: 본문 #3f3e3a, muted #8c8a82, light #b5b3ab
- **타이포**: 헤딩은 세리프(Noto Serif KR 400/600/700), 본문은 산세리프(Pretendard)
- 부드러운 그림자, 넉넉한 패딩(p-6), 둥근 모서리(12~16px)
- 편안하고 따뜻한 느낌. 차가운 테크/다크모드 느낌 절대 내지 마.
- 네비게이션 active 상태: bg-surface-alt + font-semibold + text-primary-700
- 버튼 primary: bg-primary-600 text-white rounded-xl px-4 py-2

## Tailwind Config (이거 정확히 따라서)
```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: '#faf8f5', alt: '#f5f0eb' },
        surface: { DEFAULT: '#ffffff', alt: '#fdfcfb' },
        primary: { 50: '#f2f6ef', 100: '#e1ebd9', 200: '#c6dab8', 300: '#a3c28f', 400: '#7fa368', 500: '#61864b', 600: '#5a7247', 700: '#3e5831' },
        secondary: { DEFAULT: '#c4622d', hover: '#a85325', light: '#faebe4' },
        accent: { DEFAULT: '#d4a843', hover: '#be963b', light: '#fbf4e4' },
        text: { main: '#2d2c2a', muted: '#73706c', light: '#a6a39f' },
        border: { DEFAULT: '#e5e0d8', focus: '#c7c0b5' }
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 8px 30px -4px rgba(0, 0, 0, 0.04)',
        float: '0 12px 40px -6px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: { lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem' }
    }
  }
}
```

## 작업 방법
1. design-system.html을 먼저 만들어 (색상 팔레트, 타이포, 버튼, 카드, 인풋, 뱃지, 사이드바 네비 전부 포함)
2. design-system.html의 시스템을 정확히 따라서 각 페이지 standalone HTML+Tailwind CDN으로 만들어.
3. 모든 페이지에 공통 사이드바(w-64, 고정) + 상단바 포함. 일관된 레이아웃.
4. 각 HTML 파일 상단에 해당 API 엔드포인트 주석으로 표시.

## 참고 자료 (내가 첨부한 파일 2개를 반드시 읽고 시작해)

### 첨부 파일 1: corthex-technical-spec.md (1,649줄)
이 파일에 다 있어:
- **모든 페이지 라우트** — 각 페이지가 뭘 보여주는지, 어떤 컴포넌트로 구성되는지
- **모든 API 엔드포인트** — 각 페이지가 호출하는 API (method, path, request/response shape)
- **DB 스키마** — 테이블, 컬럼, 타입, FK 관계 전부
- **데이터 타입** — TypeScript 인터페이스 (Agent, Department, Tier, Job 등)
- **실시간 기능** — WebSocket 채널 7개, SSE 이벤트 6종
- 각 페이지의 폼 필드, 에러 상태, 리다이렉트 플로우까지 전부 기술돼 있음
- **이 파일에 나온 API 엔드포인트를 각 HTML 상단에 주석으로 정확히 표시해줘**

### 첨부 파일 2: corthex-vision-identity.md (809줄)
이 파일에서 읽을 것:
- **CORTHEX가 뭔 제품인지** — AI 에이전트 조직 관리 플랫폼. 조직도를 그리면 AI 팀이 움직임
- **사용자 페르소나** — 비개발자 CEO, 중소기업 관리자, 개인 투자자, Admin
- **핵심 개념** — 허브(명령 브리지), NEXUS(조직도 캔버스), Soul(에이전트 성격), 핸드오프(위임 체인), 티어(등급)
- **감정적 방향** — 통제감, 전문적, 지능적, 신뢰감. 챗봇/장난스러운 느낌 절대 아님
- **기능 우선순위** — P0(항상 보이는 것) ~ P3(파워유저 전용) 계층 분류

### 디자인은 위 "디자인 방향" 섹션을 따르고, 기능/구조/API는 첨부 파일 기준으로 만들어.

## 만들 페이지 (App 27개)
1. login — 로그인
2. onboarding — 온보딩 마법사
3. home — 홈 대시보드 (인사말 + 에이전트 상태 + 알림)
4. hub — 허브/사령관실 (터미널 인터페이스 + 핸드오프 트래커)
5. chat — 에이전트 1:1 채팅 (에이전트 선택 → 채팅)
6. dashboard — 분석 대시보드 (메트릭 4열 + 차트 + 활동)
7. agents — 에이전트 디렉토리 (카드 그리드 + 상세 패널)
8. departments — 부서 관리 (카드 + 상세 + 할당 에이전트)
9. tiers — 티어 관리 (N단계 등급 + 모델 매핑)
10. jobs — 작업 관리 (야간작업/스케줄/트리거 탭)
11. reports — 보고서 (목록 + 상세 뷰어)
12. trading — 전략실 (3패널: 워치리스트 + 차트 + AI 채팅)
13. nexus — NEXUS 조직도 (React Flow 캔버스 + 도구바)
14. knowledge — 라이브러리 (3패널: 폴더 + 문서목록 + 상세)
15. sns — SNS 관리 (탭: 콘텐츠/발행대기/카드뉴스/통계/계정)
16. messenger — 메신저 (대화목록 + 채팅)
17. agora — AGORA 토론 (3패널: 목록 + 타임라인 + 정보)
18. files — 파일 관리 (그리드/리스트 뷰 전환)
19. costs — 비용 분석 (차트 + 프로바이더별 테이블)
20. performance — 성과 분석 (에이전트 매트릭스 + 제안)
21. activity-log — 통신 로그 (타임라인)
22. ops-log — 작전 일지 (KPI + 이벤트 로그)
23. notifications — 알림 (탭: 전체/시스템/에이전트)
24. classified — 기밀 문서 (보안등급별 3패널)
25. settings — 설정 (프로필/디스플레이/알림/API 등 탭)
26. workflows — 워크플로우 관리
27. sketchvibe — 스케치바이브 (AI 협업 캔버스)

## 만들 페이지 (Admin 16개)
1. admin-dashboard — 관리자 대시보드
2. admin-users — 사용자 관리
3. admin-employees — 직원 부서 배정
4. admin-departments — 부서 CRUD
5. admin-agents — 에이전트 CRUD (Soul 편집기 포함)
6. admin-credentials — CLI 인증 관리
7. admin-tools — 도구 정의 관리
8. admin-costs — 비용 관리
9. admin-report-lines — 보고 라인 설정
10. admin-soul-templates — Soul 템플릿 라이브러리
11. admin-monitoring — 시스템 모니터링
12. admin-nexus — 관리자 NEXUS 캔버스
13. admin-onboarding — 온보딩 설정
14. admin-settings — 관리자 설정
15. admin-companies — 회사 관리 (슈퍼어드민)
16. admin-workflows — 워크플로우 관리

## 주의사항
- 기존 코드 절대 보지 마. 완전 새로 만드는 거야.
- 한국어 UI. 모든 페이지 일관된 디자인 시스템.
- 각 HTML 상단에 해당 API 엔드포인트 주석 표시.
- 더미 데이터 넣어서 실제처럼 보이게 만들어.
- 사이드바 네비에 모든 페이지 링크 포함.
