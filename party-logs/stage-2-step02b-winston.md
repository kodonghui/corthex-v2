# Critic-A (Architecture + API) Review — Step 02b Vision

**Reviewer**: Winston (Architect)
**Target**: `_bmad-output/planning-artifacts/prd.md` L283~L320
**Date**: 2026-03-20

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 9/10 | 에이전트 상태 5종(idle/working/speaking/tool_calling/error), 0-100 정수, 4-layer 전체 명시, 3단계 파이프라인(observations→reflection→planning), Option B, 구체적 예시("매일 9시 영업 보고서→Slack") |
| D2 완전성 | 15% | 8/10 | 6개 항목이 Brief §2 문제(블랙박스/획일성/정체/반복)와 정확히 매핑. v2 비전+원본 HTML 주석 보존. 3원칙 #2에 v3 항목 추가. Minor: "왜 지금인가"에 v3 기술 타이밍(PixiJS 8 tree-shaking, n8n 2.0 secure-by-default) 미언급 — 현재 SDK 중심 프레이밍도 충분 |
| D3 정확성 | 25% | 9/10 | 0-100 정수(Stage 1 Decision 4.3.1) ✅, 4-layer sanitization 구조 ✅, Option B 확장 ✅, call_agent MCP N단계 ✅, agent-loop.ts 격리 ✅. Minor: L303 "agent-loop.ts 실행 로그를 픽셀 동작으로 변환" — 기술적으로 EventBus→WS→PixiJS 체인이지만 executive summary 수준에서 허용 가능한 추상화 |
| D4 실행가능성 | 20% | 8/10 | 비전 섹션은 구현 가이드가 아닌 방향 설정. 각 항목이 구체 기술(extraVars, observations 테이블, Docker, @pixi/react)을 참조하여 후속 FR과 연결 가능 |
| D5 일관성 | 15% | 9/10 | Discovery 섹션(0-100, 4-layer, Sprint 독립), Tech Research(Option B, 4-layer, agent states), Stage 0(Sprint 순서, 안전망)와 전부 정합 |
| D6 리스크 | 10% | 7/10 | L296 안전망: Sprint 독립 실패 격리 명시. 비전 섹션 특성상 상세 리스크 분석은 범위 밖. n8n "기존 코드 완전 대체" 주장에 대한 마이그레이션 리스크 미언급 — Discovery에서 커버됨 |

### 가중 평균: 8.45/10 ✅ PASS

계산: (9×0.15) + (8×0.15) + (9×0.25) + (8×0.20) + (9×0.15) + (7×0.10) = 1.35 + 1.20 + 2.25 + 1.60 + 1.35 + 0.70 = **8.45**

---

## 이슈 목록

### 🟡 Minor (2건, non-blocking)

**1. [D3] L303 EventBus 체인 추상화**

- **현재**: "agent-loop.ts 실행 로그를 픽셀 동작으로 변환"
- **실제 데이터 흐름**: agent-loop.ts → EventBus emit('agent-status') → WS server → office channel broadcast → @pixi/react 렌더링
- **판정**: Executive Summary 수준에서 허용. FR/Architecture에서 정확한 체인이 명시되면 OK. **수정 불필요**.

**2. [D2] "왜 지금인가" v3 기술 타이밍**

- **현재**: SDK commodity화 중심 (v2 서사 유지)
- **가능한 보강**: "PixiJS 8(2024 Q4)이 tree-shaking을 지원하여 200KB 미만 번들 가능", "n8n 2.0(2025)이 secure-by-default로 API-only 모드 안정화" — v3 레이어가 가능해진 기술적 이유
- **판정**: 현재 "application 레이어 혁신 적기" 프레이밍도 충분. **선택적 보강**.

---

## 아키텍처 관점 소견

비전 재구성이 **기술 아키텍처와 깔끔하게 정렬**됨:

| 비전 키워드 | 기술 레이어 | E8 경계 | Sprint |
|------------|-----------|---------|--------|
| "보이고" (투명성) | @pixi/react + /ws/office | 외부 (packages/app) | 4 |
| "생각하고" (개성) | soul-renderer.ts extraVars | 경계선 (services/) | 1 |
| "성장한다" (기억) | observations + memory-reflection.ts | 외부 (services/) | 3 |
| 자동화 | n8n Docker + Hono proxy | 외부 (routes/) | 2 |
| 설계 | NEXUS React Flow | 외부 (packages/admin) | v2 완료 |
| 오케스트레이션 | agent-loop.ts + call_agent | **E8 내부** | v2 완료 |

6개 중 **E8 내부 접촉은 오케스트레이션 1개뿐** — v3 레이어 4개 모두 engine/ 외부. agent-loop.ts 무변경 원칙 완벽 준수.

---

## Cross-talk

이 Step은 비전/서사 영역. 아키텍처 이슈 없으므로 cross-talk 불필요.
