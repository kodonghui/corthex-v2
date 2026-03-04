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
- 각 단계 완료 후 다음 단계로 넘어가기 전에 `/party-mode`를 먼저 실행할 것
- 특히 아래 5개 시점은 Party Mode 필수:
  1. Product Brief 완성 후
  2. PRD 완성 후
  3. Architecture + UX 설계 완성 후
  4. 개발 시작 직전
  5. Epic(기능 묶음) 하나 완료마다
- Party Mode 없이 다음 단계로 넘어가려 하면 반드시 경고할 것

## 코딩 컨벤션
- 파일명은 kebab-case 소문자. import 경로는 `git ls-files` 기준 실제 케이싱과 반드시 일치시킬 것 (Linux CI 대소문자 구분)
- 유일한 예외: Nexus 컴포넌트 (`AgentNode.tsx` 등 PascalCase, git도 PascalCase)
