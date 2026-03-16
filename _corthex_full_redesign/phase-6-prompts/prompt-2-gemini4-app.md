# Prompt 2: Gemini 4 스타일 — App (모바일)

아래 프롬프트를 Gemini에 그대로 복사 붙여넣기하세요.

---

CORTHEX v2라는 SaaS 프로덕트의 **모바일 앱** UXUI를 완전히 새로 디자인해줘.
뷰포트: 390x844 (iPhone 14 Pro). Capacitor로 래핑할 네이티브앱용이야.

## 디자인 방향: 내추럴 오가닉 (Natural Organic) — 모바일 버전
Notion 모바일, Things 3 iOS, Bear App iOS를 참고해.
- 따뜻한 베이지/크림 배경 (#faf8f5 메인, #f5f0eb 서브)
- 카드: 순백 (#ffffff), rounded-2xl (16px), shadow `0 4px 20px rgba(0,0,0,0.03)`, border #e8e6e1
- 액센트 3색: 올리브그린(#5a7247 primary), 테라코타(#c4622d secondary), 머스타드(#d4a843 accent)
- 텍스트: 본문 #3f3e3a, muted #8c8a82, light #b5b3ab
- **타이포**: 헤딩은 세리프(Noto Serif KR 400/600/700), 본문은 산세리프(Pretendard)
- 편안하고 따뜻한 느낌. 차가운 테크/다크모드 느낌 절대 내지 마.

## 모바일 전용 규칙
- 하단 탭바 네비게이션 (5개: 홈, 허브, 채팅, 알림, 더보기)
- safe-area-inset 적용 (상단 + 하단)
- 터치 타겟 최소 44x44px
- 스와이프 제스처 고려 (목록 아이템 스와이프 삭제 등)
- 모달은 bottom sheet 스타일 (rounded-t-3xl)
- 검색은 pull-to-search 또는 상단 검색바
- 사이드바 없음 — 하단 탭 + 스택 네비게이션

## Tailwind Config (웹과 동일)
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
      },
      borderRadius: { lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem' }
    }
  }
}
```

## 작업 방법
1. design-system-mobile.html 먼저 만들어 (하단 탭바, 카드, 버튼, 인풋, bottom sheet 등)
2. 각 페이지 standalone HTML+Tailwind CDN으로 만들어. 뷰포트 390px 고정.
3. 각 HTML 상단에 해당 API 엔드포인트 주석 표시.

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
- **사용자 페르소나** — 비개발자 CEO가 모바일에서 에이전트에게 명령, 알림 확인, 트레이딩 모니터링
- **핵심 개념** — 허브(명령 브리지), NEXUS(조직도), Soul(에이전트 성격), 핸드오프(위임 체인)
- **감정적 방향** — 통제감, 전문적, 신뢰감

### 디자인은 위 "디자인 방향" 섹션을 따르고, 기능/구조/API는 첨부 파일 기준으로 만들어.

## CORTHEX 모바일에서 특히 중요한 것
- 허브: 채팅 중심 (키보드 올라와도 입력창 보임)
- 알림: 푸시 알림 → 앱 내 알림 목록
- 에이전트 상태: 실시간 (온라인/작업중/오프라인)
- 트레이딩: 세로 스크롤 (차트→거래내역→AI 분석)
- 한국어 UI. 비개발자 CEO가 주 사용자.

## 만들 화면 (24개)
1. login — 로그인
2. home — 홈 (인사말 + 에이전트 상태 카드 + 빠른실행)
3. hub — 허브 (채팅 인터페이스 + 핸드오프 상태바)
4. chat-list — 채팅 목록 (에이전트별 최근 대화)
5. chat-detail — 1:1 채팅
6. dashboard — 대시보드 (메트릭 2열 + 활동)
7. agents — 에이전트 목록 (카드 리스트)
8. agent-detail — 에이전트 상세 (Soul + 활동 + 성과)
9. departments — 부서 목록
10. department-detail — 부서 상세 + 할당 에이전트
11. trading — 전략실 (세로: 차트 → 거래 → AI)
12. nexus — NEXUS 조직도 (핀치 줌 + 패닝)
13. knowledge — 라이브러리 (폴더 → 문서목록 → 상세 스택)
14. notifications — 알림 목록
15. jobs — 작업 목록
16. reports — 보고서 목록 → 상세
17. costs — 비용 (차트 + 테이블)
18. sns — SNS 관리 (탭)
19. messenger — 메신저
20. files — 파일 (그리드)
21. settings — 설정 (목록 → 각 항목)
22. activity-log — 통신 로그
23. classified — 기밀 문서
24. agora — AGORA 토론

## 주의사항
- 데스크톱 레이아웃 절대 쓰지 마. 100% 모바일 전용.
- 한국어 UI. 더미 데이터로 실제처럼.
- 각 HTML 상단에 API 엔드포인트 주석.
- 하단 탭바는 모든 화면에 일관되게 포함.
