# Part 4-02: App — CEO 첫 로그인 + 둘러보기 (3분)

## 시나리오
Part 4-01에서 만든 CEO 계정으로 App에 첫 로그인해서 조직 확인.

## 테스트 단계

### 1. CEO 로그인
1. https://corthex-hq.com/login 접속
2. nw-ceo / (Part 4-01에서 기록한 비밀번호) 로그인
3. **확인**: /hub 로 리다이렉트
4. 스크린샷: `screenshots/part4-02-hub.png`

### 2. 조직 확인
5. 사이드바 → 조직 → **확인**: 넥스트웨이브 조직도 표시
6. 사이드바 → 부서 → **확인**: AI연구소, 사업개발팀 표시
7. 사이드바 → 에이전트 → **확인**: 넥스트비서(online), 데이터분석봇(online)
8. 스크린샷: `screenshots/part4-02-agents.png`

### 3. 대시보드 확인
9. 사이드바 → 대시보드
10. **확인**: ACTIVE AGENTS 2, 직원 수, 부서 수 정확한지
11. 스크린샷: `screenshots/part4-02-dashboard.png`

### 4. 설정 확인
12. 사이드바 → 설정
13. **확인**: 회사명 "넥스트웨이브" 표시
14. **확인**: API Keys 탭 → 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 존재
15. 스크린샷: `screenshots/part4-02-settings.png`

## 결과 저장
results/part4-02.md
