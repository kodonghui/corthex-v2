# Party Mode — prompt-03-dashboard — Round 2 (Adversarial)

## Expert Panel (All 7 Experts — Adversarial Mode)

### Mary (📊 Business Analyst)
"New observation: the prompt says 'Total commands today' for task status, but the backend `getSummary()` uses a 'today' time window based on UTC. The CEO in Korea (KST = UTC+9) might see confusing numbers if 'today' resets at 9 AM KST. This is a backend issue, not a prompt issue — but the prompt should say 'today' without specifying timezone mechanics."

**New observation:** Timezone handling is a backend concern, prompt is fine as-is. No fix needed.

### Winston (🏗️ Architect)
"New observation: the prompt mentions `PUT /dashboard/quick-actions` for customization but doesn't describe the customization UI. The current code has `updateQuickActions` — but where does the CEO actually configure these? The prompt says 'customizable via settings' but there's no settings page prompt yet. For now, the prompt correctly describes the read-only display. The editing UI would be in Admin or a future settings page."

**New observation:** Quick action editing UI location unclear (acceptable — it's in Admin settings)

### Sally (🎨 UX Designer)
"New observation: the prompt describes 5 data sections but doesn't specify their **relative importance** for layout. On a dashboard, the KPI cards and budget bar are the most critical. The usage chart and satisfaction chart are secondary. Quick actions bridge both. This hierarchy helps Lovable decide visual weight."

**New observation:** Visual weight hierarchy for dashboard sections not specified

### John (📋 Product Manager)
"New observation: the prompt doesn't mention what happens when the CEO **clicks on a KPI card**. In many dashboards, clicking a card navigates to a detail page. The current code doesn't implement click-through on cards — they're display-only. The prompt should confirm this to prevent Lovable from adding navigation."

**New observation:** KPI cards are display-only (no click-through navigation)

### Quinn (🧪 QA Engineer)
"New observation: what happens when the budget is $0 or unset? The code uses `isDefaultBudget` and defaults to $500. The prompt covers this. What about when cost data is unavailable (e.g., new company with no usage)? The cost card should show $0.00, which is covered by 'shows zeros'. Good."

**New observation:** Zero-state already covered. No fix needed.

### Amelia (💻 Developer)
"New observation: the prompt mentions 'provider breakdown' in the cost card. The types show `byProvider: { provider: LLMProviderName; costUsd: number }[]`. The provider names are 'anthropic', 'openai', 'google' — the prompt should clarify these are displayed as friendly names (e.g., 'Anthropic', 'OpenAI', 'Google') not raw keys."

**New observation:** Provider names should display as friendly names

### Bob (🏃 Scrum Master)
"New observation: with only 8 user actions, this is the simplest of the three pages — which is correct for a dashboard. The action hierarchy is clear. One note: the prompt says 'Execute a quick action' as primary, but for a pure dashboard, 'Scan KPIs' should be the only truly primary action. Quick actions are a convenience feature."

**New observation:** Quick actions might be secondary, not primary — debatable

## Checklist
| Check | Status |
|-------|--------|
| Zero visual specs (colors, fonts, sizes, layout ratios)? | ✅ PASS |
| v2 features only (no v1 references)? | ✅ PASS |
| Schema match (types align with shared/types.ts)? | ✅ PASS |
| Handler match (API endpoints described correctly)? | ✅ PASS |
| Edge cases (empty, loading, error states)? | ✅ PASS |
| Enough context for Lovable to design independently? | ✅ PASS |

## Issues Summary
| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 6 | Visual weight hierarchy for sections | Minor | Fix |
| 7 | KPI cards are display-only (no navigation) | Minor | Fix |
| 8 | Provider friendly names | Minor | Fix |
| 9 | Quick action priority level | Minor | Acceptable as-is |
| 10 | Timezone mechanics | None | No change (backend) |

## Actions Taken
- Fixed issue 6: Added section importance note
- Fixed issue 7: Added display-only note to KPI cards
- Fixed issue 8: Added friendly name note for providers

## Score: 8.5/10 → PASS
