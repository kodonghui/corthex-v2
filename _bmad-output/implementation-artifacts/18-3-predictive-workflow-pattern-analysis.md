# Story 18-3: Predictive Workflow Pattern Analysis

## 1. Story Overview

**Epic**: Epic 18: Workflow Automation
**Story**: 18-3-predictive-workflow-pattern-analysis
**Status**: ready-for-dev
**Priority**: Medium
**Story Points**: 5

**Description**:
As a system, I need an analysis service that can review historic workflow execution logs to identify performance bottlenecks, common failure points, and predictive optimisation opportunities. This will help users construct more efficient, resilient workflows and lower their LLM/Tool invocation latency and costs.

## 2. Requirements (ACs)

**AC1: Execution Analytics Endpoint**
- `GET /api/workspace/workflows/:id/analytics` route to fetch aggregated execution metrics.
- Should include time-series data, Total Executions, Success Rate (%), Average Duration (ms). 
- Must handle 0-execution edge cases gracefully by returning empty arrays/zeros instead of NaN exceptions.

**AC2: Bottleneck Detection**
- Identify step IDs using statistical outliers (e.g., z-score > 2 or taking > 50% relative time).
- Identify steps with the highest failure rates.

**AC3: Predictive Optimization Suggestions (On-Demand)**
- `POST /api/workspace/workflows/:id/analytics/insights` to generate LLM-based optimization suggestions. (Separated from GET to save LLM invocation costs).
- The LLM should review the structural DAG and the historical metrics to suggest optimal parallelization routes or retry integrations.

**AC4: Integration with Execution Logs**
- Ensure that the Workflow Engine (from 18-2) properly persists `StepSummary` data to the `workflow_executions` database table for historical analysis.

## 3. Technical Implementation

1. **Database Schema Enhancement**:
   - Ensure `workflow_executions` table exists and stores detailed step-level JSON logs (`StepSummary[]`).
2. **Analytics Service**: `packages/server/src/services/workflow/analytics.service.ts`
   - SQL queries/aggregations over JSONB data to get averages and error rates.
3. **LLM Insights Service**: `packages/server/src/services/workflow/predictive-insights.service.ts`
   - Packages DAG + Analytics into a prompt for the semantic engine.
4. **API Extension**:
   - Add routes mapped to these services in `workflows.ts`.

## 4. Verification

- Test aggregation logic with mock execution records (e.g., verifying bottleneck detection correctly flags a 5000ms step).
- Test the prompt generation to ensure DAG context is correctly serialized for the LLM.
