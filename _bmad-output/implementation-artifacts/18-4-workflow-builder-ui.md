# Story 18-4: Workflow Builder UI

## 1. Story Overview

**Epic**: Epic 18: Workflow Automation
**Story**: 18-4-workflow-builder-ui
**Status**: ready-for-dev
**Priority**: High
**Story Points**: 8

**Description**:
As a CEO or workspace Admin, I need a visual Workflow Builder UI in the application dashboard so that I can easily construct, edit, and visualize complex multi-step workflows (DAGs) without writing JSON manually. The UI should allow me to add different step types (Tool, LLM, Condition), draw execution paths (dependencies), and configure inputs (including global context template binding).

## 2. Requirements (ACs)

**AC1: Visual DAG Editor Canvas**
- The UI must render a visual canvas using an interactive node-based library (e.g., React Flow or simple custom HTML5 canvas).
- Nodes represent Workflow Steps (`WorkflowStep`).
- Edges represent Dependencies (`dependsOn`).

**AC2: Node Configuration Panel**
- Clicking a node opens a side panel to edit step details.
- Configurable fields: `id`, `name` (optional label), `type` ('tool', 'llm', 'condition'), `action`, and JSON-based `params`.
- Must support inserting context template variables `{{...}}` via a helper menu.

**AC3: Workflow CRUD Integration**
- The builder UI must connect to the Workflow CRUD API (`/api/workspace/workflows`) built in Story 18-1.
- Support creating a new workflow from scratch, and loading an existing workflow for editing.
- Save button serializes the visual graph back into the `WorkflowStep[]` JSON array.

**AC4: Real-time Execution Trigger (Optional/Basic)**
- Provide a "Run Workflow" button in the builder.
- Sends an execution request to `POST /api/workspace/workflows/:id/execute`.

## 3. Technical Implementation Plan

1. **Frontend Setup**:
   - Location: `packages/client/src/pages/workspace/workflows/Builder.tsx`
   - Evaluate whether to use a library like `reactflow` or build a simplified CSS grid/flexbox based sequential list with nested parallel blocks, given the project stack and dependencies constraints (avoiding heavy external libraries if `npm install` fails).
   - If `reactflow` isn't feasible, implement a "List-based Builder with dependency arrows" or a simplified drag-and-drop. Since I am an AI, I will design a structured React component that allows managing the JSON array visually.
2. **Context Helper UI**:
   - A dropdown or autocomplete inside the `params` editor showing available variables from previous nodes.
3. **State Management**:
   - React state to manage `Workflow` object, sync with backend on Save.

## 4. Design & UX Guidelines

- **High-end UI**: Use Antigravity WOW guidelines (glassmorphism if appropriate, smooth transitions on saving).
- **Party Mode Self-Review Check**: Ensure UX simplicity. Hiding JSON complexity from the end-user is critical.
