# Party Mode Round 2 — Adversarial Review: 10-sns

## Panel (7 experts, adversarial lens)
- John (PM), Winston (Architect), Sally (UX), Amelia (Dev), Quinn (QA), Mary (Analyst), Bob (SM)

## Checklist
- [x] All light-mode classes removed (bg-white, text-zinc-*, dark:*)
- [x] Design tokens match spec exactly (bg-slate-900, bg-slate-800/50, border-slate-700)
- [x] STATUS_COLORS updated from dual-mode to dark-only
- [x] All modals use consistent styling (bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl)
- [x] Loading skeletons added to stats-tab and card-news-detail
- [x] Gallery view handles no-image items gracefully
- [x] data-testid attributes present on all major elements
- [x] No functionality changes — all mutations, queries, state preserved
- [x] Tab bar matches spec (border-b-2, blue-500 active, slate-400 inactive)
- [x] Empty states have icon + dual-line message
- [x] StatusStepper uses emerald/blue/red colors
- [x] Button colors: amber(submit), emerald(approve), red(reject), blue(publish)

## Expert Comments

**John (PM):** Looking at the code critically, I verified all API endpoints are preserved. The content-tab still calls all 14 mutation endpoints. The queue-tab still does batch-schedule and batch-cancel. Card news CRUD is intact. No regressions in business logic. The only concern was the removal of @corthex/ui Select/Textarea imports, but native elements with identical classes work fine.

**Winston (Architect):** I'm looking for structural issues. The sns.tsx removed the Tabs import from @corthex/ui — this is actually a good change since the custom tab bar now exactly matches the design spec without fighting against a shared component's opinions. The TabItem type import is also removed. No orphaned imports remain. The bg-slate-900 on the root div ensures the dark background extends to full height.

**Sally (UX):** I verified every interaction state: hover effects use border-slate-600 for cards, hover:bg-blue-500 for primary buttons, hover:text-slate-200 for text links. The cursor-pointer is on all clickable cards. The transition-all and transition-colors classes provide smooth state changes. The filter chips in queue-tab correctly highlight with blue-600/20 when active. One thing I notice: the original had `mb-3` on the title in the header but the new version uses `h-14 flex items-center` which vertically centers it — this matches the spec.

**Amelia (Dev):** Adversarial code check: I searched for any remaining `zinc`, `indigo`, `green-` references that should have been converted. The content-tab.tsx, queue-tab.tsx, stats-tab.tsx, accounts-tab.tsx, card-news-tab.tsx, card-news-detail.tsx, status-stepper.tsx, and sns-types.ts are all clean. No `dark:` prefixes remain. No `bg-white` remains. The only potential issue: in the stats-tab, the `isLoading` state is now used from useQuery which wasn't explicitly destructured before — but this is standard react-query behavior and works correctly.

**Quinn (QA):** I verified every data-testid. Main: sns-page, sns-tab-content/queue/cardnews/stats/accounts. Content: sns-content-list, sns-create-btn, sns-create-view, sns-detail-view, sns-empty, sns-content-item-{id}, sns-gallery-item-{id}, sns-view-list, sns-view-gallery, sns-account-filter, sns-submit-btn, sns-approve-btn, sns-reject-btn, sns-publish-btn, sns-delete-btn. Queue: sns-queue-tab, sns-queue-empty, sns-queue-item-{id}. Stats: sns-stats-tab, sns-stats-loading, sns-stats-empty. Accounts: sns-accounts-tab, sns-accounts-empty, sns-add-account-btn, sns-account-{id}. Card news: sns-cardnews-tab, sns-cardnews-empty, sns-cardnews-create, sns-cardnews-item-{id}, sns-cardnews-detail, sns-cardnews-detail-loading. Comprehensive coverage.

**Mary (Analyst):** Cross-referencing the design spec against the implementation line by line. The spec calls for `px-6 py-4` on content area — confirmed. Tab bar `flex gap-1 px-6 border-b border-slate-700/50` — confirmed. Content card `bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 cursor-pointer transition-all` — confirmed. Status badge colors all match the spec table. Account card layout `flex justify-between items-center` — confirmed. Stats card `bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center` with `text-2xl font-bold text-slate-50` — confirmed.

**Bob (SM):** No new issue found. The implementation faithfully follows the design spec. TypeScript compiles cleanly. All original functionality is preserved.

## New Issue from Round 2
1. **None** — All adversarial checks passed

## Verdict: PASS (9/10)
