# Story 18-2: Workflow Execution Engine (Sequential & Parallel)

## 1. Story Overview

**Epic**: Epic 18: Workflow Automation
**Story**: 18-2-workflow-execution-engine
**Status**: ready-for-dev
**Priority**: High
**Story Points**: 8

**Description**:
As a system, I need an execution engine capable of parsing workflow definitions, resolving dependencies (DAG), and executing steps both sequentially and in parallel based on those dependencies. The engine must support various step types (`tool`, `llm`, `condition`) and pass context/outputs between steps.

## 2. Requirements (ACs)

**AC1: Dependency Resolution (DAG Parsing)**
- The engine must parse a workflow's `steps` array.
- It must build a Directed Acyclic Graph (DAG) based on the `dependsOn` field.
- Circular dependencies must fail execution securely (with localized error logs).

**AC2: Execution Strategy (Parallel & Sequential) & Step Execution**
- Steps with no unmet dependencies should be executed concurrently.
- Steps with unresolved dependencies must wait for all dependent steps to complete successfully.
- **`llm` Type**: Invoke the `AgentRunner` or LLM router.
- **`tool` Type**: Invoke the respective registered tool from `ToolPool`.
- **`condition` Type**: Evaluate branching logic securely using a safe expression evaluator (NO `eval()` allowed) or structured predefined operators.

**AC3: Context & Output Passing**
- Outputs from completed steps must be stored in a shared state/context object for the current workflow execution instance.
- Subsequent steps must be able to inject outputs from previous steps into their `params` via deep templating (e.g., `{{step1.output.result.value}}`) using a safe getter like `lodash/get`.

**AC4: Error Handling & Event Publishing**
- If a step fails, all directly or indirectly dependent steps must be marked as `skipped` (not failed).
- Independent parallel branches should continue execution unless explicitly halted.
- The engine must publish state transitions (e.g., `pending` -> `running` -> `success`/`failed`/`skipped`) locally via `EventBus` to support real-time UI updates.
- The engine must log step-level execution status (success, failure, duration) as system activity logs.

## 3. Technical Implementation

1. **DAG Solver Utility**: `packages/server/src/lib/workflow/dag-solver.ts`
   - Algorithm to topologically sort steps and identify parallel execution tiers.
2. **Execution Context**: `packages/server/src/lib/workflow/execution-context.ts`
   - Manages state, variable resolution (`{{var}}`), and outputs.
3. **Execution Engine Class**: `packages/server/src/lib/workflow/engine.ts`
   - The main runner utilizing `Promise.all` for parallel tiers and looping for sequential steps.
   - Integration with Agent/Tool infrastructures.
4. **API Integration**:
   - `POST /api/workspace/workflows/:id/execute` route to trigger executions manually or via cron.

## 4. Verification

- Write unit tests for DAG solver demonstrating parallel step extraction.
- Write unit tests for variable templating injection.
- Integration tests simulating a mock workflow with LLM + Tool + Condition steps evaluating parallel/sequential execution.
