# Prompt 4: Gemini 5 스타일 — App (모바일)

아래 프롬프트를 Gemini에 그대로 복사 붙여넣기하세요.

---

CORTHEX v2라는 SaaS 프로덕트의 **모바일 앱** UXUI를 완전히 새로 디자인해줘.
뷰포트: 390x844 (iPhone 14 Pro). Capacitor로 래핑할 네이티브앱용이야.

## 디자인 방향: 미니멀 웜 (Minimal Warm) — 모바일 버전
Linear 모바일, Cal.com 모바일, Apple 기본 앱 느낌을 참고해.
- 매우 밝은 크림 배경 (#fcfbf9 메인, #f5f3ec 서브)
- 카드: 순백, rounded-3xl (24px), shadow soft, border #f5f3ec
- 카드 tap: scale(0.98) + opacity 0.7 피드백
- 액센트 4색: 코랄(#e57373), 테라코타(#e07a5f), 앰버(#f4a261), 세이지그린(#81b29a)
- 텍스트: 본문 #2c2c2c, muted #6b6b6b
- **타이포**: Inter + Noto Sans KR (산세리프 통일)
- **아이콘**: Phosphor Icons
- 미니멀하면서 따뜻한 느낌. 차가운 테크/다크모드 절대 내지 마.

## 모바일 전용 규칙
- 하단 탭바 네비게이션 (5개: 홈, 허브, 채팅, 알림, 더보기)
- safe-area-inset 적용 (상단 + 하단)
- 터치 타겟 최소 44x44px
- 스와이프 제스처: 목록 아이템 스와이프 삭제, 뒤로가기
- 모달은 bottom sheet 스타일 (rounded-t-3xl, drag handle 포함)
- Large Title 네비게이션 바 (iOS 스타일, 스크롤하면 축소)
- 스크롤바 숨김
- 사이드바 없음 — 하단 탭 + 스택 네비게이션

## Tailwind Config
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

## 작업 방법
1. design-system-mobile.html 먼저 만들어 (하단 탭바, Large Title 헤더, 카드, 버튼, bottom sheet 등)
2. 각 페이지 standalone HTML+Tailwind CDN으로 만들어. 뷰포트 390px 고정.
3. 각 HTML 상단에 API 엔드포인트 주석 표시.
4. Phosphor Icons 사용.

## CORTHEX 모바일에서 중요한 것
- 허브: 채팅 중심 (키보드 올라와도 입력창 보임)
- 알림: 푸시 알림 → 앱 내 알림 목록
- 에이전트 상태: 실시간 (온라인/작업중/오프라인)
- 트레이딩: 세로 스크롤 (차트→거래→AI)
- 한국어 UI. 비개발자 CEO가 주 사용자.

## 만들 화면 (24개)
1. login — 로그인
2. home — 홈 (Large Title "CORTHEX" + 에이전트 카드 + 빠른실행)
3. hub — 허브 (채팅 + 핸드오프 상태바)
4. chat-list — 채팅 목록
5. chat-detail — 1:1 채팅
6. dashboard — 대시보드 (메트릭 2열)
7. agents — 에이전트 목록
8. agent-detail — 에이전트 상세
9. departments — 부서 목록
10. department-detail — 부서 상세
11. trading — 전략실 (세로 스크롤)
12. nexus — NEXUS 조직도 (핀치 줌)
13. knowledge — 라이브러리 (폴더 → 문서 → 상세)
14. notifications — 알림
15. jobs — 작업 목록
16. reports — 보고서 목록 → 상세
17. costs — 비용
18. sns — SNS
19. messenger — 메신저
20. files — 파일
21. settings — 설정
22. activity-log — 통신 로그
23. classified — 기밀 문서
24. agora — AGORA 토론

## 주의사항
- 데스크톱 레이아웃 절대 쓰지 마. 100% 모바일 전용.
- 한국어 UI. 더미 데이터로 실제처럼.
- 각 HTML 상단에 API 엔드포인트 주석.
- 하단 탭바는 모든 화면에 일관되게.
- Large Title 헤더는 모든 메인 화면에 적용.
