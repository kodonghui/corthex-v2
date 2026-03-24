# Routing Scenarios — Secretary/Hub Routing Test (NFR-O5)

**Purpose**: Validate secretary routing accuracy across 10 predefined scenarios.

**System under test**: `llm-router.ts` — determines target department/agent from user input.

**Scoring rubric**:
- Correct department routing = **1.0 pt**
- Wrong department routing = **0.0 pt**
- Appropriate clarification when ambiguous = **0.5 pt**

**Pass threshold**: **8/10+ = PASS** (per NFR-O5)

---

## Scenario 1: Direct Department Request

- **Input**: "마케팅팀에 SNS 포스트 작성 요청"
- **Expected routing**: Marketing department
- **Expected agent**: Marketing content agent
- **Rationale**: Explicit department name + clear task. No ambiguity. Direct routing.

## Scenario 2: Ambiguous Request

- **Input**: "새 프로젝트 시작하고 싶어"
- **Expected routing**: Clarification prompt OR default department (general assistant)
- **Expected agent**: Secretary/hub agent asks follow-up ("어떤 종류의 프로젝트인가요?")
- **Rationale**: No department specified. Multiple departments could handle. Clarification is correct behavior. Score: 0.5 for clarification, 0.0 for wrong guess.

## Scenario 3: Cross-Department

- **Input**: "개발팀이 만든 API를 마케팅팀이 사용할 수 있게 문서화해줘"
- **Expected routing**: Development department (primary), with marketing handoff or coordination
- **Expected agent**: Dev documentation agent → marketing handoff
- **Rationale**: Primary action is documentation (dev domain). Marketing is secondary stakeholder. Score 1.0 if dev primary, 0.5 if marketing primary with dev coordination.

## Scenario 4: Out-of-Scope

- **Input**: "오늘 서울 날씨 어때?"
- **Expected routing**: General assistant (polite decline or best-effort response)
- **Expected agent**: Hub agent handles directly without department routing
- **Rationale**: Weather is outside company scope. Should not route to any department. Polite acknowledgment + redirect to company tasks = correct behavior.

## Scenario 5: Follow-up (Context Continuation)

- **Input**: (after Scenario 1 marketing query) "거기서 예산은 얼마야?"
- **Expected routing**: Same marketing department (context preserved)
- **Expected agent**: Same marketing agent from previous conversation
- **Rationale**: "거기서" (there) refers to previous marketing context. Router must maintain session context and not re-route to finance/budget department.

## Scenario 6: Multi-step

- **Input**: "HR팀에 채용 공고 올리고, 마케팅팀에 홍보 요청해줘"
- **Expected routing**: HR department first, then marketing department (sequential)
- **Expected agent**: HR recruitment agent → marketing promotion agent
- **Rationale**: Two explicit tasks for two departments. Router should handle sequentially or coordinate handoff. Score 1.0 if both departments engaged, 0.5 if only one.

## Scenario 7: Bilingual (Korean + English)

- **Input A**: "인사팀에 연차 신청서 제출해줘" (Korean)
- **Input B**: "Ask the development team to review this pull request" (English)
- **Expected routing**: A → HR department, B → Development department
- **Expected agent**: A → HR admin agent, B → Dev review agent
- **Rationale**: Router must handle both Korean and English inputs correctly. Department identification should work regardless of language. Score: 0.5 per input (1.0 total for both correct).

## Scenario 8: Abbreviation

- **Input**: "마팀에 보고서 보내줘"
- **Expected routing**: Marketing department
- **Expected agent**: Marketing general agent
- **Rationale**: "마팀" is common Korean abbreviation for "마케팅팀". Router should resolve abbreviated department names. Score 1.0 if correctly resolved, 0.0 if fails to recognize.

## Scenario 9: Typo

- **Input**: "개발팀에 벅그 리포트 보내줘"
- **Expected routing**: Development department
- **Expected agent**: Dev bug tracking agent
- **Rationale**: "벅그" is typo for "버그" (bug). LLM-based router should be typo-tolerant. Department name "개발팀" is correct — the typo is in the task description, not the department name.

## Scenario 10: Concurrent

- **Input A**: "개발팀 코드 리뷰 해줘" (sent simultaneously with B)
- **Input B**: "마케팅팀 주간 보고서 작성해줘" (sent simultaneously with A)
- **Expected routing**: A → Development, B → Marketing (independently, no interference)
- **Expected agent**: A → Dev review agent, B → Marketing report agent
- **Rationale**: Two simultaneous requests to different departments must not interfere. `llm-router.ts` uses per-request `LLMRouterContext` — no shared mutable state. Score 1.0 if both routed correctly, 0.5 if one fails.
