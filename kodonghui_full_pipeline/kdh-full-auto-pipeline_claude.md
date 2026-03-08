---
description: 'BMAD Full Pipeline (Planning or Story Dev). Usage: /kdh-full-auto-pipeline [planning|story-ID]'
---

# Kodonghui Full Pipeline v4.1 (Claude Autonomous Edition)

This workflow implements the Single-Worker v3 protocol for BMAD planning and development, optimized for Claude Code.

// turbo-all
1. **Initialize Environment**:
   - Ensure `_bmad/` skills and manifest are available.
   - Detect mode based on input argument (default to `planning`).

2. **Mode: Planning** (if argument is 'planning'):
   - Execute the following stages in sequence:
     a. **Stage 1 (Product Brief) [Flash Preferred]**: Vision, Users, Metrics, Scope.
     b. **Stage 2 (PRD) [Flash Preferred]**: Discovery, Journeys, Domain, Functional, Non-functional, etc.
     c. **Stage 3 (Architecture) [Pro High Required]**: Context, Decisions, Patterns, Structure, Validation.
     d. **Stage 4 (UX Design) [Flash Preferred]**: Core Experience, Design System, Journeys, etc.
     e. **Stage 5 (Epics & Stories) [Flash Preferred]**: Design Epics, Create Stories.
     f. **Stage 6 (Readiness) [Pro High Recommended]**: PRD Analysis, UX Alignment, Epic Quality.
     g. **Stage 7 (Sprint Planning) [Flash Sufficient]**: Generate `sprint-status.yaml`.
   - **For each step** in Stage 1-6: Perform **3-Round Party Mode**.
     - **Round 1-2 (Collaborative/Adversarial)**: Use **Flash** to save quota.
     - **Round 3 (Final Forensic)**: Use **Pro High** for final verification.
   - Commit after each stage: `docs(planning): {stage} complete -- {N} party modes` && git push.

3. **Mode: Story Dev** (if argument is a Story ID, e.g. '18-1'):
   - Execute the following phases:
     a. **Phase 1 (create-story) [Flash Sufficient]**: Run `bmad-bmm-create-story`.
     b. **Phase 2 (dev-story) [Pro High Required]**: Run `bmad-bmm-dev-story`.
        - **PARALLEL EXECUTION**: Identify independent components (e.g., API vs. UI, schema vs. types). Execute their implementation in **parallel via tool calls**.
        - **NO STUBS/MOCKS.**
     c. **Phase 3 (TEA) [Pro High Recommended]**: Run `bmad-tea-automate` for risk-based tests.
     d. **Phase 4 (QA) [Pro High Recommended]**: Run `bmad-agent-bmm-qa` for functional verification.
     e. **Phase 5 (code-review) [Pro High Required]**: Run `bmad-bmm-code-review` and auto-fix issues.
   - **Checklist**: Output the Hard Checklist (1-6) and ensure all are marked `[x]`.
   - **Commit**: `feat: Story [ID] [title] -- [summary] + TEA [N] tests` && git push.
   - Update `sprint-status.yaml` status to `done`.

4. **Absolute Rules & Quota Management**:
   - Never skip steps because "file already exists".
   - **Parallel Orchestration**: Act as a Team Lead by spawning multiple internal tool-calls for independent sub-tasks.
   - **Quota Strategy**: Use **Gemini 3.1 Flash** for drafting, logging, and Round 1-2 reviews. Reserve **Gemini 3.1 Pro High** for final logic, architecture, and code-review.
   - Use the 7 experts from the manifest (John, Winston, Sally, Amelia, Quinn, Mary, Bob).
   - All expert comments must be at least 2-3 sentences.
