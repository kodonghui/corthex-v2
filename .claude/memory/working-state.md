# Working State — 2026-03-16

## 현재 작업
- App Shell Stitch 리빌드 완료 (배포 중) → 페이지별 비교 완료 → 구조 차이 수정 대기

## 오늘 완료한 것 (2026-03-16)
1. Stitch MCP 앱 화면 21개 추가 생성 (총 56개)
2. Phase 7 JSX 재작성 (6배치 병렬) — 21개 페이지
3. NEXUS/SketchVibe 분리 리팩토링
4. gzip 압축 + 야간 워커 버그 수정
5. Workflow 페이지 추가 (PRD #14)
6. FR49 서버재시작 알림 + FR66 에이전트 취소
7. 코드 리뷰 v2.0 실행 (7.0→7.95)
8. 파이프라인 개선: kdh-uxui v4.3, kdh-full v7.2, kdh-code-review v2.0
9. PRD 전수검사 97%, SketchVibe/NEXUS 전수검사
10. Docker 정리 (40GB→19GB), env.production 복구
11. LeetMaster 메모리 저장, 영어 교정 모드 설정
12. **App Shell 리빌드** — Stitch 01-app-shell.html 기준
    - sidebar.tsx: Hexagon 브랜드 아이콘 + "MANAGEMENT PLATFORM" + bg-slate-900 + nav active bg-cyan-400/10
    - layout.tsx: 상단 바 추가 (브레드크럼 + 검색(⌘K) + 알림 벨)
13. **6개 에이전트 병렬 비교** — Stitch HTML vs 현재 코드 전수비교
    - 잘 맞음: Hub(95%), Dashboard(90%), Chat(90%), SNS(85%), Notifications(85%)
    - 구조 차이: Trading(테이블/타임프레임), Agents(detail panel), Departments(상세섹션)

## 다음 할 일
1. 배포 확인 후 유저에게 알림
2. 구조 차이 페이지 수정 (유저 우선순위에 따라):
   - Trading: Recent Trades 테이블 + 타임프레임 버튼 + AI 퀵액션
   - Agents: persistent detail panel + 활동목록 + 성과통계
   - Departments: 상세 섹션 + 할당 에이전트 목록
3. VS Code Playwright QA 프롬프트 작성 (이전 세션에서 소실)
4. 버그 수정 후 재배포

## 핵심 교훈
- App Shell(사이드바+상단바)이 전체 인상의 70%. 여기를 먼저 맞춰야 함
- Phase 7 파이프라인에 "레이아웃 셸 리빌드" 단계가 빠져있었음 → 근본 원인
- Stitch HTML에서 sidebar/topbar는 무시, content area만 참고
- Dark mode 전용이므로 Stitch의 light mode 차이는 무시
- Light mode 차이를 "문제"로 보고하면 안 됨 — 우리 앱은 dark mode only

## 미해결
- Playwright QA 프롬프트 재작성 필요 (컴팩으로 소실)
- Trading/Agents/Departments 구조 수정 대기
- hook→렌더링 바인딩 미검증 (Playwright QA 필요)
