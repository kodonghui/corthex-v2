# Part 4-01: Admin — 회사 + 조직 세팅 (5분)

## 시나리오
Superadmin으로 새 회사를 만들고, 부서/직원/에이전트를 전부 세팅한다.

## 테스트 단계

### 1. 로그인
1. https://corthex-hq.com/admin/login 접속
2. admin / admin1234 로그인
3. **확인**: 대시보드 진입

### 2. 회사 생성
4. 사이드바 → 회사 → "Create" 클릭
5. 회사명: `넥스트웨이브`, 슬러그: `nextwave-inc`
6. "생성" 클릭 → **확인**: 목록에 추가
7. 스크린샷: `screenshots/part4-01-company.png`

### 3. 온보딩 (해당 회사 선택 후)
8. 사이드바 → 온보딩 → 넥스트웨이브 선택
9. Step 1 (회사 정보): 이미 입력됨, Next
10. Step 2 (부서 생성): `AI연구소` 추가, `사업개발팀` 추가
11. Step 3 (에이전트 생성): `넥스트비서` (역할: CEO 비서 및 일정 관리), `데이터분석봇` (역할: 코드 리뷰 전문가)
12. Step 4 (직원 초대): CEO — 아이디 `nw-ceo`, 이름 `최넥스트` → 초대
13. **확인**: 비밀번호 모달 표시 → 비밀번호 복사/기록
14. 추가 직원 — 아이디 `nw-dev01`, 이름 `한개발` → 초대
15. Step 5 (API 키): Provider `Anthropic`, 키 `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` → 저장
16. 스크린샷: `screenshots/part4-01-onboarding.png`

### 4. 에이전트 활성화
17. 사이드바 → 에이전트 → 넥스트비서 클릭
18. "Go Online" 버튼 클릭 → **확인**: 상태 online
19. 데이터분석봇도 동일
20. 스크린샷: `screenshots/part4-01-agents-online.png`

### 5. 보고 라인 설정
21. 사이드바 → 보고 라인
22. 한개발 → 상사: 최넥스트 선택 → 저장
23. **확인**: 토스트 메시지

## 결과 저장
results/part4-01.md — **반드시 CEO 비밀번호를 기록해둘 것 (다음 파트에서 사용)**
