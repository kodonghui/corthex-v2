# 현재 작업 상태
> 마지막 업데이트: 2026-03-10 (세션6 — Agent Engine v3 PoC 완료)

## 지금 하고 있는 것
**PoC 8/8 PASS 완료** → 다음: Phase 1 (엔진 교체) 시작

## PoC 결과 (8/8 ALL PASS)
- Test 1: SDK query() → PASS (4.4s, $0.02)
- Test 2: CLI 토큰 인증 → PASS (4.9s, $0.01)
- Test 3: call_agent 도구 → PASS (21.6s, $0.04) ← 핵심!
- Test 4: Hook 시스템 → PASS (16.3s, $0.03)
- Test 6: 서브에이전트 → PASS (10.5s, $0.05)
- Test 7: 중첩 한계 → PASS (18.6s, 1단계만 가능 확인 → call_agent 패턴 필수)
- Test 8: 병렬 실행 → PASS (5.0s, 64% 시간 절약)
- Test 9: MCP 연결 → PASS (12.3s)
- PoC 코드: `_poc/agent-engine-v3/`
- 결과 보고서: `_poc/agent-engine-v3/POC-RESULT.md`

## PoC에서 확인된 핵심 사실
1. **call_agent MCP 도구 패턴 동작** — tool() + createSdkMcpServer() + Zod v4
2. **SDK Agent 도구는 1단계만** — 중첩 불가 → call_agent 패턴 필수
3. **CLI 토큰 주입** — env: { ANTHROPIC_API_KEY: token } 방식
4. **Hook 21개 이벤트** — PreToolUse(deny/allow/modify), PostToolUse(audit), Stop
5. **병렬 query()** — Promise.all로 64% 절약
6. **CLAUDECODE="" 필요** — Claude Code 안에서 SDK 실행 시 (프로덕션에선 불필요)

## 핵심 결정사항 (26개, Party Mode 5라운드)
(이전과 동일 — 간략화)
- call_agent 도구 패턴 / 5개 서비스 삭제 / llm-router 유지
- 품질게이트 제거 / N단계 계급 / 비서 선택제 / CLI 토큰 정책
- NEXUS=조직관리 / 스케치바이브=개발협업
- NotebookLM MCP / pgvector 의미검색

## 다음 할 일: Phase 1 (엔진 교체)
1. `engine/agent-loop.ts` — thin wrapper (~50줄, query() 래퍼)
2. `engine/hooks/` — 5개 훅 (permission-guard, credential-scrubber, delegation-tracker, cost-tracker, output-redactor)
3. `call-agent.ts` — MCP 도구 (핸들러에서 query() spawn → 무한 깊이 위임)
4. 기존 5개 서비스 삭제 (chief-of-staff, manager-delegate, agent-runner, cio-orchestrator, delegation-tracker)
5. llm-router.ts 유지

## Phase 로드맵
- ~~Phase 0: PoC~~ ✅ 완료
- Phase 1: 엔진 교체 (2주)
- Phase 2: 오케스트레이션 이동 (3주)
- Phase 3: 계급 유연화 (2주)
- Phase 4: 정보국 강화 (2주)

## 주의사항
- 커밋 전 `npx tsc --noEmit -p packages/server/tsconfig.json` 필수
- CLI 토큰! API 아님!
- SDK는 서브프로세스 spawn 방식 — new Anthropic() 주입 불가
- 에이전트 메타데이터를 비서 시스템 프롬프트에 자동 주입
