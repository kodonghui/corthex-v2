# Party Mode Round 3 — Forensic Review
## design-07-agents.md

### Forensic Verification

**Source Code Cross-Check:**
- agents.tsx (746 lines): All UI sections verified against render output (lines 255-743) ✓
- Type definitions (lines 8-26): Agent, Department, SoulTemplate types match ✓
- TIER_OPTIONS (lines 27-31): 3 tiers with defaults verified ✓
- MODEL_OPTIONS (lines 33-40): 6 models verified ✓
- STATUS_LABELS/COLORS (lines 42-54): 4 statuses verified ✓
- inputCls/selectCls (lines 62-63): Shared class strings documented ✓
- renderMarkdown (lines 66-87): HTML rendering rules documented ✓
- Create mutation (lines 165-174): Endpoint and invalidation verified ✓
- Update mutation (lines 176-188): Server response refresh pattern verified ✓
- Deactivate mutation (lines 190-199): Soft delete confirmed ✓

**Design Token Mapping:**
- bg-zinc-900 → bg-slate-900 ✓
- dark:bg-zinc-800 → bg-slate-800 ✓
- border-zinc-200/700/800 → border-slate-700 ✓
- text-zinc-100/300/400/500/900 → text-slate-50/300/400 ✓
- indigo-600 → blue-600 ✓

**Missing Elements Check:**
- Secretary badge (isSecretary field): Available in data but not rendered in table — consistent with source ✓
- allowedTools display in tools tab: Tags/chips rendering documented ✓
- Soul template marketplace link: Not in this page — correct ✓
- Company selection prerequisite: Documented ("회사를 선택하세요") ✓
- Toast notifications: Referenced via addToast pattern ✓

**Completeness Score:**
| Section | Score |
|---------|-------|
| Layout ASCII | 10/10 |
| Component Breakdown | 9/10 |
| Tailwind Classes | 9/10 |
| Interactions | 10/10 |
| Responsive | 9/10 |
| Animations | 8/10 |
| Accessibility | 8/10 |
| data-testid Map | 10/10 |

### Final Score: 9.1/10 — PASS
Spec is comprehensive and ready for implementation.
