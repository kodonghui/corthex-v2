# CORTHEX E2E 테스트 — 공통 컨텍스트

## 접속 정보
- Admin URL: https://corthex-hq.com/admin
- App URL: https://corthex-hq.com
- Admin 계정: admin / admin1234
- CEO 계정: ceo / ceo1234

## 테스트 데이터 (기존 데이터와 겹치지 않게)
- 회사명: `크롬QA공사`
- 회사 슬러그: `chrome-qa-corp`
- 부서명: `보안점검팀`
- 직원 아이디: `cqa01`
- 직원 이름: `크롬검수원`
- 직원 이메일: `cqa01@chrometest.dev`
- 미배정 직원 아이디: `cqa-nogroup`
- 미배정 직원 이름: `미소속검수원`
- 미배정 직원 이메일: `nogroup@chrometest.dev`
- 에이전트 이름: `보안감사봇`
- 에이전트 역할: `보안 취약점 감사 전문가`
- 소울 텍스트: `당신은 보안 감사 전문가입니다. 취약점을 찾아 리포트합니다.`
- 소울 템플릿 이름: `보안감사소울`
- API 키 (Anthropic OAuth): `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`

## 규칙
- 각 단계 실행 후 결과를 PASS/FAIL로 보고
- 스크린샷을 반드시 찍어서 screenshots/ 폴더에 저장
- 에러 발견 시: 페이지URL, 재현단계, 기대vs실제, 콘솔에러 포함 보고
- **모든 단계를 빠짐없이 실행. 건너뛰지 마세요.**
- 결과를 results/part1-NN.md 파일에 저장

## UX 탐색 규칙 (매 파트 필수)
정해진 단계를 다 끝낸 뒤, 해당 페이지에서 **자유 탐색**을 추가로 실행:
1. 눌러보고 싶게 생긴 것(버튼, 링크, 카드, 아이콘 등)을 전부 클릭해본다
2. 호버 시 반응이 있는 요소를 찾아서 클릭해본다
3. 입력 필드가 있으면 빈칸 제출, 특수문자, 아주 긴 텍스트 등 엣지 케이스를 시도한다
4. 예상과 다르게 동작하는 것이 있으면 **UX 이슈**로 보고한다
5. 자유 탐색 결과도 보고서에 "## UX 탐색 발견사항" 섹션으로 기록한다

## 보고서 양식 (각 파트마다 results/part1-NN.md에 작성)
```markdown
# Part 1-NN: [테스트 이름] 결과

## 테스트 환경
- 일시: YYYY-MM-DD HH:MM
- 브라우저: Chrome
- 해상도: (자동 감지)

## 단계별 결과
| # | 단계 | 결과 | 비고 |
|---|------|------|------|
| 1 | 로그인 페이지 접속 | PASS | |
| 2 | admin/admin1234 입력 | PASS | |
| ... | ... | ... | ... |

## 발견된 버그
### BUG-001: [제목]
- 페이지: [URL]
- 재현 단계: 1. ... 2. ... 3. ...
- 기대 결과: ...
- 실제 결과: ...
- 스크린샷: screenshots/part1-NN-bug001.png
- 심각도: Critical / Major / Minor / Cosmetic

## UX 탐색 발견사항
- [눌러본 것] → [결과]
- [눌러본 것] → [결과]

## 요약
- 총 단계: N
- PASS: N
- FAIL: N
- 버그: N건
```
