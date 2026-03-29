# Part 1-1: 로그인 테스트 (2분)

## 성공 기준
올바른 계정으로 대시보드 접속, 잘못된 계정으로 에러 메시지 표시

## 테스트 단계

### 정상 로그인
1. https://corthex-hq.com/admin/login 접속
2. 아이디: `admin` 입력
3. 비밀번호: `admin1234` 입력
4. "세션 시작" 버튼 클릭
5. **확인**: 대시보드 페이지로 이동, 상단에 숫자 카드 3개 보임
6. **확인**: URL이 `/admin` 또는 `/admin/dashboard`로 변경됨
7. 스크린샷 저장: `screenshots/part1-01-login-success.png`

### 잘못된 비밀번호
8. 로그아웃 또는 `/admin/login`으로 이동
9. 아이디: `admin`, 비밀번호: `wrongpassword` 입력
10. "세션 시작" 클릭
11. **확인**: 빨간색 에러 메시지 표시
12. **확인**: 로그인 페이지에 머무름
13. 스크린샷 저장: `screenshots/part1-01-login-fail.png`

### 다시 정상 로그인 (다음 파트를 위해)
14. 올바른 계정으로 재로그인

## 결과 저장
results/part1-01.md에 각 단계 PASS/FAIL 기록
