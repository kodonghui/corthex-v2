# CLAUDE.md — CORTHEX v2

## 사용자 정보
- 비개발자. 개발 용어 사용 금지. 쉽고 자세하게 설명할 것
- 항상 존댓말 사용

## 배포 규칙
- 작업 완료 시 커밋 + 푸시까지 자동으로 (매번 물어보지 말 것)
- main 푸시 → GitHub Actions 자동 배포 → Cloudflare 캐시 자동 퍼지
- 커밋 후 배포 보고: 빌드 번호(#N) + 변경 내용 + 확인 위치를 표로 정리

## 코딩 컨벤션
- 파일명은 kebab-case 소문자. import 경로는 `git ls-files` 기준 실제 케이싱과 반드시 일치시킬 것 (Linux CI 대소문자 구분)
- 유일한 예외: Nexus 컴포넌트 (`AgentNode.tsx` 등 PascalCase, git도 PascalCase)
