# Party Mode Round 1: Collaborative Review — Emotional Response & Trust

**Step:** step-04-emotional-response
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **John (PM)**: Product strategy & user needs alignment
- **Sally (UX Designer)**: Emotional design & usability
- **Winston (Architect)**: Architecture → UX alignment
- **Quinn (QA)**: Edge cases & testability

## Review Discussion

**Sally (UX):** The emotional journey maps are visually creative and well-structured. The ASCII curves effectively communicate the emotion trajectory. The micro-interaction table in 3.5 is excellent — specific timing values (200ms ease-out, 300ms spring) are exactly what developers need. However, I notice the emotional maps only cover Journey A and B. Journey C (비서 없는 직원) and Journey D (조직 리디자인) are missing emotional curves. Journey C in particular has a distinct emotional profile — a non-CEO employee may feel *less* empowered since they can't auto-route. Their emotional curve would be different: uncertainty about which agent to pick → relief when the agent responds well.

**John (PM):** The Trust Building Patterns table (3.2) is solid but missing one critical trust element: **데이터 보안 신뢰**. The architecture uses AES-256-GCM for credential vault (D14) and tenant isolation via companyId. Users need to *feel* their data is safe, especially for financial commands (전략실) and sensitive business data. A visual trust indicator like a lock icon or "암호화됨" badge on credential-related fields would reinforce this. Also, the Control hierarchy in 3.3 shows Admin Level 4 as "접근 통제" but doesn't mention the **도구 권한** aspect granularly enough — per architecture (D6), tools have PreToolUse hooks for permission checking. The UX should show which tools are enabled/disabled per agent.

**Winston (Architect):** The anxiety reduction table (3.4) is well-mapped to architectural features. One gap: the "이거 비용 폭탄 아니야?" anxiety is only addressed post-response (done event). But the architecture defines **cost limit hooks** (Stop hook in E4) that can terminate execution mid-stream when budget is exceeded. The UX should show a pre-emptive cost indicator DURING processing — like "현재 비용: $0.012..." updating in real-time — not just at the end. This would reduce cost anxiety more effectively. The architecture's Stop hook fires per-tool-call, so we could expose running cost during processing.

**Quinn (QA):** The micro-interaction specs in 3.5 are great for automation — I can verify animation durations. But there's an untestable scenario: the "예측 가능성" trust element says "동일 명령 = 동일 라우팅 경로." This is actually NOT guaranteed architecturally — the secretary's LLM-based routing could change based on context, recent conversations, or Soul updates. This trust claim may create false expectations. Should be softened or qualified.

## Issues Found

1. **[ISSUE-R1-1] Missing Emotional Maps for Journey C & D** — Only A and B have emotional curves. Journey C (비서 없는 직원) and D (조직 리디자인) have distinct emotional profiles that need mapping.

2. **[ISSUE-R1-2] No Real-Time Cost During Processing** — Cost anxiety addressed only post-response. Architecture Stop hook enables real-time cost tracking during processing. UX should show running cost counter.

3. **[ISSUE-R1-3] False Predictability Claim** — Trust table claims "동일 명령 = 동일 라우팅 경로" but LLM-based routing is non-deterministic. Must qualify this claim.

## Fixes Applied

- **ISSUE-R1-1**: Added emotional curves for Journey C (에이전트 선택 불안→직접 대화 안도→1:1 친밀감) and Journey D (편집 자유→구조화 만족→저장 안도)
- **ISSUE-R1-2**: Added "실시간 비용" row to anxiety reduction table — processing 중 "현재 비용: $0.012..." 실시간 갱신
- **ISSUE-R1-3**: Changed "동일 명령 = 동일 라우팅 경로" to "유사 명령 → 유사 라우팅 경향. 비서실장 Soul이 일관된 라우팅 기준을 정의하며, 결과는 컨텍스트에 따라 달라질 수 있음"
