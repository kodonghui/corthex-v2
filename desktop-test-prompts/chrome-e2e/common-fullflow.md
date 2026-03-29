# CORTHEX 풀 플로우 E2E 테스트 — 공통 컨텍스트

## 시나리오
신규 회사를 Admin에서 처음부터 세팅하고, 그 회사의 CEO로 App에 로그인해서 실제 업무를 수행하는 전체 플로우.

## 접속 정보
- Admin URL: https://corthex-hq.com/admin
- App URL: https://corthex-hq.com
- Superadmin: admin / admin1234

## 테스트 데이터 (Part 4 전용 — 기존과 겹치지 않게)
- 회사명: `풀플로우테크`
- 회사 슬러그: `fullflow-tech`
- CEO 아이디: `ff-ceo`
- CEO 이름: `김풀플로우`
- CEO 이메일: `ceo@fullflow.dev`
- 부서1: `개발본부`
- 부서2: `마케팅팀`
- 직원 아이디: `ff-dev01`
- 직원 이름: `박개발`
- 에이전트1: `풀플로우비서`
- 에이전트1 역할: `CEO 비서 및 일정 관리`
- 에이전트2: `코드리뷰봇`
- 에이전트2 역할: `코드 리뷰 전문가`
- 소울 텍스트: `당신은 풀플로우테크의 비서입니다. 일정 관리와 회의 정리를 담당합니다.`
- API 키 (Anthropic OAuth): `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`

## 규칙
- 각 단계 실행 후 결과를 PASS/FAIL로 보고
- 스크린샷을 반드시 찍어서 screenshots/ 폴더에 저장
- **이전 파트에서 생성한 데이터가 다음 파트에서 사용됨 — 순서 필수**
- 에러 발생 시 재시도 1회, 그래도 실패하면 FAIL 기록 후 다음 진행
- 결과를 results/part4-NN.md 파일에 저장

## 보고서 양식
```markdown
# Part 4-NN: [테스트 이름] 결과

## 테스트 환경
- 일시: YYYY-MM-DD HH:MM
- 브라우저: Chrome

## 단계별 결과
| # | 단계 | 결과 | 비고 |
|---|------|------|------|

## 발견된 버그
### BUG-001: [제목]
- 페이지: [URL]
- 재현 단계: ...
- 기대 vs 실제: ...
- 스크린샷: screenshots/part4-NN-bug001.png
- 심각도: Critical / Major / Minor

## 요약
- 총 단계: N / PASS: N / FAIL: N / 버그: N건
```
