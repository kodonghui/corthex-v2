# Prompt 3: Gemini 5 스타일 — Web (데스크톱)

아래 프롬프트를 Gemini에 그대로 복사 붙여넣기하세요.

---

CORTHEX v2라는 SaaS 프로덕트의 UXUI를 완전히 새로 디자인해줘.

## 디자인 방향: 미니멀 웜 (Minimal Warm)
Linear, Cal.com, Raycast를 참고해.
- 매우 밝은 크림 배경 (#fcfbf9 메인, #f5f3ec 서브, #e8e4d9 보더)
- 카드: 순백, rounded-3xl (24px), shadow `0 4px 20px rgba(0,0,0,0.03)`, border #f5f3ec
- 카드 hover: translateY(-2px) + shadow 강화
- 액센트 4색: 코랄(#e57373), 테라코타(#e07a5f), 앰버(#f4a261), 세이지그린(#81b29a)
- 텍스트: 본문 #2c2c2c, muted #6b6b6b
- **타이포**: Inter + Noto Sans KR (산세리프 통일, 세리프 없음)
- **아이콘**: Phosphor Icons (https://unpkg.com/@phosphor-icons/web)
- 스크롤바 숨김 (scrollbar-width: none)
- 상태 표시: working=코랄(#e57373) + glow, idle=그린(#81b29a), offline=회색(#d5cfc1)
- 미니멀하면서 따뜻한 느낌. 차가운 테크/다크모드 절대 내지 마.

## Tailwind Config (이거 정확히 따라서)
```js
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'Noto Sans KR', 'sans-serif'] },
      colors: {
        base: { 50: '#fcfbf9', 100: '#f5f3ec', 200: '#e8e4d9', 300: '#d5cfc1' },
        text: { main: '#2c2c2c', muted: '#6b6b6b' },
        accent: { coral: '#e57373', terracotta: '#e07a5f', amber: '#f4a261', green: '#81b29a' }
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' }
    }
  }
}
```

## CSS 컴포넌트 클래스 (이것도 따라서)
```css
.card {
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f5f3ec;
  transition: all 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-working { background-color: #e57373; box-shadow: 0 0 0 3px rgba(229,115,115,0.2); }
.status-idle { background-color: #81b29a; }
.status-offline { background-color: #d5cfc1; }
```

## 작업 방법
1. design-system.html 먼저 만들어 (색상, 타이포, 카드, 버튼, 인풋, 상태닷, 사이드바 등)
2. 각 페이지 standalone HTML+Tailwind CDN으로 만들어.
3. 모든 페이지에 좌측 사이드바(w-64) + 상단바 포함. 일관된 레이아웃.
4. 각 HTML 상단에 해당 API 엔드포인트 주석 표시.
5. Phosphor Icons 사용 (`<i class="ph ph-house"></i>` 형식)

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
3. home — 홈 대시보드
4. hub — 허브/사령관실 (터미널 + 핸드오프 트래커)
5. chat — 에이전트 1:1 채팅
6. dashboard — 분석 대시보드 (메트릭 + 차트)
7. agents — 에이전트 디렉토리
8. departments — 부서 관리
9. tiers — 티어 관리
10. jobs — 작업 관리
11. reports — 보고서
12. trading — 전략실 (3패널)
13. nexus — NEXUS 조직도
14. knowledge — 라이브러리 (3패널)
15. sns — SNS 관리
16. messenger — 메신저
17. agora — AGORA 토론
18. files — 파일 관리
19. costs — 비용 분석
20. performance — 성과 분석
21. activity-log — 통신 로그
22. ops-log — 작전 일지
23. notifications — 알림
24. classified — 기밀 문서
25. settings — 설정
26. workflows — 워크플로우
27. sketchvibe — 스케치바이브

## 만들 페이지 (Admin 16개)
1. admin-dashboard — 관리자 대시보드
2. admin-users — 사용자 관리
3. admin-employees — 직원 부서 배정
4. admin-departments — 부서 CRUD
5. admin-agents — 에이전트 CRUD + Soul 편집기
6. admin-credentials — CLI 인증 관리
7. admin-tools — 도구 정의 관리
8. admin-costs — 비용 관리
9. admin-report-lines — 보고 라인
10. admin-soul-templates — Soul 템플릿
11. admin-monitoring — 시스템 모니터링
12. admin-nexus — 관리자 NEXUS
13. admin-onboarding — 온보딩 설정
14. admin-settings — 관리자 설정
15. admin-companies — 회사 관리
16. admin-workflows — 워크플로우

## 주의사항
- 기존 코드 절대 보지 마. 완전 새로 만드는 거야.
- 한국어 UI. 모든 페이지 일관된 디자인 시스템.
- 각 HTML 상단에 API 엔드포인트 주석 표시.
- 더미 데이터로 실제처럼 보이게.
- 사이드바에 모든 페이지 링크 포함.
