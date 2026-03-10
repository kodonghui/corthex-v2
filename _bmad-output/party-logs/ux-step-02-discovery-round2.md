# Party Mode Round 2: Adversarial Review — UX Discovery

**Step:** step-02-discovery
**Round:** 2 (Adversarial)
**Date:** 2026-03-11

## Expert Panel (Cynical Mode)

- **John (PM)**: "Show me the gap"
- **Winston (Architect)**: "What breaks first?"
- **Sally (UX)**: "Users will hate this because..."
- **Quinn (QA)**: "What's untestable?"

## Review Discussion

**John (PM):** Looking at this more critically — the v1 feature spec lists **22 features**. The Pain Points table (1.3) covers engine-related changes well, but it's suspiciously silent on several v1 features that users depend on daily. Where's the **크론기지 (Cron Schedule)** pain point? Where's **ARGOS**? Where's **SNS 통신국**? These aren't engine-related, but they're v1 features that users actively use. The Discovery section should at least acknowledge which v1 features are preserved as-is vs. changed vs. deferred. Without this, developers implementing stories might not know if they need to redesign these features or just port them.

**Winston (Architect):** John's right. And I have a specific architectural concern: the NEXUS section in 1.4 says "Edge: 위임 관계" but the architecture defines NEXUS access as split between **admin** (`/admin/nexus` — full edit) and **user** (`/app/nexus` — read-only, own hierarchy only). The Discovery section's UC1 says "CEO/Admin" for NEXUS design, but per the architecture, CEOs access `/app/nexus` which is **read-only**. Only Admins can edit via `/admin/nexus`. This is a critical UX constraint that's misrepresented — it could lead to building edit capabilities in the wrong app package.

**Sally (UX):** Building on Winston's NEXUS point — if the CEO can only VIEW the org chart but not EDIT it, that's a significantly different UX than what UC1 describes. The CEO's Aha! moment of "부서를 드래그&드롭으로 만듦" is only available if they're also the Admin. For a pure CEO (non-admin), NEXUS is view-only. This changes Persona 1's experience description. Also — I note the persona numbering is weird: it goes 1, 2, 4, 3. The Admin persona should be renumbered for readability.

**Quinn (QA):** From a v1 feature coverage perspective, I cross-checked the 22 features from v1-feature-spec.md against this Discovery section. Missing coverage check items: **사내 메신저** (Phase 3 per PRD), **자동화 워크플로우**, **전력분석 Soul Gym**, and **기밀문서 아카이브**. These are Phase 2/3 features but the Discovery section doesn't acknowledge their existence or deferral at all. A simple "v1 Feature Coverage Map" table would fix this and serve as a cross-reference for later steps.

## Issues Found

1. **[ISSUE-R2-1] NEXUS Access Level Misrepresentation** — UC1 says "CEO/Admin" can design orgs in NEXUS, but architecture specifies CEO gets read-only `/app/nexus`, only Admin gets edit `/admin/nexus`. Must correct.

2. **[ISSUE-R2-2] Missing v1 Feature Coverage Map** — 22 v1 features need a cross-reference showing which are preserved/changed/deferred. Current Pain Points only cover engine changes, not feature coverage.

3. **[ISSUE-R2-3] Persona Numbering Inconsistency** — Goes 1, 2, 4, 3 after adding Admin persona. Should be sequential: 1, 2, 3, 4.

## Fixes Applied

All 3 issues fixed in main document.
