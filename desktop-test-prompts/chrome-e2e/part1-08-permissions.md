# Part 1-8: 직원 부서 배치 + 권한 테스트 (3분)

## 성공 기준
부서 배정 직원은 자기 부서만, 미배정 직원은 전체, CEO는 전체 접근

## 사전 조건
- part1-05에서 만든 `cqa01` 직원의 임시 비밀번호 필요
- results/part1-05.md 또는 results/part1-02.md에서 비밀번호 확인

## 테스트 단계

### 직원 계정으로 App 로그인
1. 새 시크릿 탭 열기
2. https://corthex-hq.com/login 접속
3. 아이디: `cqa01`
4. 비밀번호: (메모한 임시 비밀번호)
5. "INITIALIZE COMMAND" 클릭
6. **확인**: Hub 페이지 로드 성공
7. 스크린샷: `screenshots/part1-08-employee-login.png`

### 부서 스코프 확인
8. /agents 페이지 이동
9. **확인**: cqa01이 배정된 부서의 에이전트만 보이는지
10. /departments 페이지 이동
11. **확인**: cqa01의 부서만 보이는지
12. 스크린샷: `screenshots/part1-08-scope.png`

### 부서 미배정 직원 테스트
13. Admin 탭으로 돌아가기
14. /admin/employees → "Add Employee"
15. 아이디: `cqa-nogroup`, 이름: `미소속검수원`, 이메일: `nogroup@chrometest.dev`
16. **부서 체크박스: 아무것도 선택 안 함**
17. "초대" 클릭 → 비밀번호 메모
18. 시크릿 탭에서 로그아웃 → `cqa-nogroup`으로 로그인
19. /agents 페이지
20. **확인**: 모든 에이전트가 보임 (부서 미배정 = 전체 접근)
21. 스크린샷: `screenshots/part1-08-nogroup.png`

### CEO vs 직원 비교
22. 시크릿 탭에서 `ceo` / `ceo1234`로 로그인
23. /agents 페이지
24. **확인**: 모든 에이전트/부서 접근 가능
25. **결론**: 직원은 제한적, CEO는 전체
26. 스크린샷: `screenshots/part1-08-ceo.png`

## 결과 저장
results/part1-08.md에 각 단계 PASS/FAIL 기록
