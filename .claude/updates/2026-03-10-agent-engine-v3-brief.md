# 2026-03-10: Agent Engine v3 Product Brief 완성

## 변경 내용
Party Mode 5라운드(에이전트 7명 참여)를 거쳐 Agent Engine v3 리팩토링 Product Brief 작성 완료.

## 왜?
- 기존 오케스트레이션 코드 ~1,200줄이 Claude Agent SDK / Gemini ADK가 이미 해결한 문제를 중복 구현
- "바퀴를 다시 발명하지 않는다" — 전문가 검증 코드 사용

## 주요 결정 (26개)
### 엔진
1. call_agent 도구 패턴 (SDK 서브에이전트 아닌 tool_use 기반)
2. 기존 서비스 5개 삭제, engine/agent-loop.ts 1개로 교체
3. Hook 시스템으로 감사/보안 분리
4. LLM Router 유지 (폴백/서킷/예산)
5. 얇은 래퍼 — SDK 종속 1파일만

### 조직
6. 품질게이트 삭제 → 매니저 Soul 검증
7. N단계 계급 (정수 + tier_configs)
8. 비서 선택제 (Human별)
9. CLI 토큰 정책 (명령자 기준)
10. 에러 전파 (Soul 지침)

### UI
11. NEXUS = 조직관리
12. 스케치바이브 = 개발협업

### 지식
13. NotebookLM MCP (29도구)
14. pgvector 의미검색

## 영향받는 파일
- 신규: `_bmad-output/planning-artifacts/product-brief-corthex-v2-engine-refactor-2026-03-10.md`
- 수정: `.claude/memory/working-state.md`, `MEMORY.md`

## 결과
- Build #22904869441 ✅ 성공
- 다음: PoC 실행 (Claude Agent SDK + CLI 토큰 호환성 검증)
