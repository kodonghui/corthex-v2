# CLAUDE.md — CORTHEX v2

## 사용자 정보
- 비개발자. 개발 용어 사용 금지. 쉽고 자세하게 설명할 것
- 항상 존댓말 사용

## 배포 규칙
- 작업 완료 시 커밋 + 푸시까지 자동으로 (매번 물어보지 말 것)
- main 푸시 → GitHub Actions 자동 배포 → Cloudflare 캐시 자동 퍼지
- 커밋 후 배포 보고: 빌드 번호(#N) + 변경 내용 + 확인 위치를 표로 정리

## BMAD 워크플로우 규칙
- 새 기능/프로젝트 기획 시 `_bmad-output/BMAD-WORKFLOW.md`의 단계를 반드시 따를 것

### Party Mode 실행 규칙 (매우 중요)
- 아래 5개 시점에서 Claude가 스스로 `/party-mode`를 실행할 것 (사용자가 요청하지 않아도):
  1. Product Brief 완성 후
  2. PRD 완성 후
  3. Architecture + UX 설계 완성 후
  4. 개발 시작 직전
  5. Epic(기능 묶음) 하나 완료마다
- Party Mode는 **합의가 날 때까지 반복 실행**할 것:
  - 에이전트들이 문제/우려사항을 제기하면 → 문서 수정 → Party Mode 재실행
  - 모든 에이전트가 "다음 단계로 진행해도 됩니다" 또는 이견 없음 상태가 될 때까지 반복
  - 합의 기준: 주요 반대 의견이 0개, 또는 남은 의견이 모두 "사소한 것"으로 분류될 때
- Party Mode 없이 다음 단계로 넘어가려 하면 반드시 경고하고 Party Mode를 먼저 실행할 것

## 코딩 컨벤션
- 파일명은 kebab-case 소문자. import 경로는 `git ls-files` 기준 실제 케이싱과 반드시 일치시킬 것 (Linux CI 대소문자 구분)
- 유일한 예외: Nexus 컴포넌트 (`AgentNode.tsx` 등 PascalCase, git도 PascalCase)
