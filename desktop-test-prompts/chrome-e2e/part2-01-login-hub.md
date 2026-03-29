# Part 2-01: App 로그인 + 허브 (2분)

## 성공 기준
CEO 로그인 + 허브 페이지 정상 로딩 + 카드/위젯 확인

## 테스트 단계

1. https://corthex-hq.com/login 접속
2. **확인**: 로그인 폼 표시 (아이디, 비밀번호, 로그인 버튼)
3. ceo / ceo1234 입력 → 로그인 클릭
4. **확인**: /hub 으로 리다이렉트
5. 스크린샷: `screenshots/part2-01-hub.png`
6. 허브 페이지에서 보이는 카드/위젯 확인:
   - 에이전트 상태 카드
   - 최근 활동
   - 알림 요약
7. 각 카드 클릭해서 상세 페이지로 이동 확인
8. **확인**: 사이드바 메뉴 정상 표시 (COMMAND, ORGANIZATION, TOOLS, SYSTEM 4섹션)
9. 스크린샷: `screenshots/part2-01-sidebar.png`

## 결과 저장
results/part2-01.md에 각 단계 PASS/FAIL 기록
