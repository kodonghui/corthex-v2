---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-03-07'
story: '6-5-websocket-realtime-dashboard-refresh'
---

# TEA Automation Summary -- Story 6-5

## Stack & Framework

- Stack: fullstack (server: Bun+Hono, app: React+Vite)
- Test Framework: bun:test
- Mode: BMad-Integrated

## Coverage Plan

| AC | Priority | Test Level | Tests |
|----|----------|-----------|-------|
| AC1 (Dashboard WS refresh) | P0 | Unit | Dashboard invalidation mapping (3 channels) |
| AC2 (Activity WS refresh) | P0 | Unit | Tab invalidation mapping (4 tabs) |
| AC3 (Status indicator) | P1 | Unit | Display logic (connected/disconnected/attempt count) |
| AC4 (Exponential backoff) | P0 | Unit | Backoff sequence + bounds |
| AC5 (Cost channel) | P0 | Unit+Integration | Subscription, eventBus emit, bridge, tenant isolation |
| AC6 (useDashboardWs) | P0 | Unit | Channel-to-key mapping |
| AC7 (useActivityWs) | P0 | Unit | Tab-to-key mapping |
| AC8 (Build) | P0 | Build | turbo build 3/3 |

## Test Files Generated

### Server (packages/server/src/__tests__/unit/)

| File | Tests | Priority | Coverage |
|------|-------|----------|----------|
| ws-realtime-dashboard.test.ts | 7 | P0 | cost channel subscription, eventBus emit, bridge, channel completeness |
| ws-realtime-dashboard-tea.test.ts | 14 | P0-P1 | cost subscription isolation, eventBus payload structure, broadcastToCompany dispatch, channel edge cases |

### App (packages/app/src/__tests__/)

| File | Tests | Priority | Coverage |
|------|-------|----------|----------|
| ws-realtime.test.ts | 33 | P0-P1 | Backoff logic, channel mappings, tab invalidation, status indicator, listener dispatch, message parsing |
| ws-realtime-tea.test.ts | 25 | P0-P2 | Backoff edge cases, invalidation completeness, display logic, listener management, message parsing, reconnection state |

## Results

| Package | Tests | Pass | Fail |
|---------|-------|------|------|
| server (TEA) | 21 | 21 | 0 |
| app (TEA) | 58 | 58 | 0 |
| **Total new** | **79** | **79** | **0** |

## Risk Coverage

- **P0 (Critical)**: cost channel end-to-end (subscription → emit → bridge → dispatch), tenant isolation, backoff bounds
- **P1 (Important)**: idempotent subscriptions, display logic variants, listener management safety
- **P2 (Edge cases)**: reconnection state transitions, message parsing edge cases
