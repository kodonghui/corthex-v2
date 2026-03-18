# CRITIC-UX-PERF: Full Codebase Audit Report

## Score: 6.5/10

---

## 1. Design Token Consistency

### 1A. Theme System Architecture

The app defines CSS custom properties in `packages/app/src/index.css` as `--color-corthex-*` tokens (accent, bg, surface, elevated, border, text-primary, text-secondary, etc.) with 5 theme variants in `packages/app/src/styles/themes.css`. This is a well-structured approach.

However, **almost no component or page actually uses these tokens**.

- issue: [DESIGN] **Design tokens defined but unused across entire codebase.** `--color-corthex-accent`, `--color-corthex-bg`, `--color-corthex-surface`, `--color-corthex-text-primary` etc. are defined in index.css but only 6 references exist in the entire components/ directory (all in `theme-selector.tsx`) and **zero** references in any page file. Instead, 194 hardcoded color instances (`bg-[#...]`, `text-[#...]`, `border-[#...]`) are used across 58 component files, and additional hardcoded colors exist across page files. This means **theme switching has no effect on the actual UI** beyond the sidebar and topbar.
  - `packages/app/src/index.css`:8-32 (token definitions)
  - `packages/app/src/components/layout.tsx`:105 (hardcoded `bg-[#faf8f5] text-[#1a1a1a]`)
  - `packages/app/src/components/sidebar.tsx`:117 (hardcoded `bg-[#283618]`)

- issue: [DESIGN] **UI library uses indigo as accent, not the theme accent.** All 19 `@corthex/ui` components hardcode `indigo-600` / `indigo-500` as the primary accent color (Button, Input focus ring, Select focus ring, Tabs active state, Toggle, Spinner, ProgressBar, FilterChip, ConfirmDialog). The design system specifies cyan-400 for Sovereign Sage and olive-green (#606C38) for Natural Organic, but the UI library ignores both. 13 total indigo references across 12 UI component files.
  - `packages/ui/src/button.tsx`:9
  - `packages/ui/src/tabs.tsx`:28,46
  - `packages/ui/src/toggle.tsx`:33

- issue: [DESIGN] **App components use `#5a7247` (olive) as hardcoded accent instead of design tokens.** This color appears hundreds of times across components (chat-area.tsx alone has 31 instances). When the user switches themes, these olive-colored elements remain unchanged.
  - `packages/app/src/components/chat/chat-area.tsx` (31 occurrences)
  - `packages/app/src/components/agora/debate-list-panel.tsx` (9 occurrences)

### 1B. Font Consistency

- issue: [DESIGN] **Non-standard fonts used in page files.** The design system specifies Inter + JetBrains Mono (defined in `--font-ui` and `--font-mono`), but multiple pages use `fontFamily: "'Public Sans', sans-serif"` and `fontFamily: "'Noto Serif KR', serif"` via inline styles. 54+ instances across pages including agents.tsx, costs.tsx, departments.tsx, jobs.tsx, performance.tsx, tiers.tsx, reports.tsx, settings.tsx, and more. These fonts are not loaded in the HTML, likely causing font fallback flicker.
  - `packages/app/src/pages/costs.tsx`:140 (`Public Sans`)
  - `packages/app/src/pages/agents.tsx`:657 (`Public Sans`)
  - `packages/app/src/pages/settings.tsx`:174 (`Noto Serif KR`)

- issue: [DESIGN] **CodeMirror editor uses system monospace stack instead of JetBrains Mono.** The editor in `codemirror-editor.tsx` sets `fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'` instead of the project's `--font-mono` variable.
  - `packages/app/src/components/codemirror-editor.tsx`:57

### 1C. Color Palette Drift

- issue: [DESIGN] **Admin app colors.ts defines a different palette than the CSS tokens.** `packages/admin/src/lib/colors.ts` exports olive (#5a7247), cream (#faf8f5), sand (#e5e1d3), warmBrown (#463e30), terracotta (#c4622d), muted (#9c8d66). These overlap partially with the CSS tokens but are not derived from them, creating two parallel color systems.
  - `packages/admin/src/lib/colors.ts`:1-16

---

## 2. Accessibility

### 2A. ARIA and Keyboard Navigation

- issue: [A11Y] **UI library components lack ARIA attributes.** Only 2 of 19 UI components have any ARIA attributes: `ProgressBar` (`role="progressbar"`) and `Toggle` (`role="switch"`, `aria-checked`). The remaining 17 components -- including Modal, Select, Tabs, Toast, Input, Textarea -- have zero ARIA attributes.
  - `packages/ui/src/modal.tsx` -- no `role="dialog"`, no `aria-modal`, no `aria-labelledby`
  - `packages/ui/src/tabs.tsx` -- no `role="tablist"`, no `role="tab"`, no `aria-selected`
  - `packages/ui/src/toast.tsx` -- no `role="alert"`, no `aria-live="polite"`
  - `packages/ui/src/select.tsx` -- no `aria-invalid` when `error=true`
  - `packages/ui/src/input.tsx` -- no `aria-invalid` when `error=true`

- issue: [A11Y] **Modal has no focus trap.** Users can Tab out of the modal overlay into background content. No `aria-modal="true"` or focus management on open/close. The modal's backdrop click handler works, and Escape key works, but focus is not returned to the triggering element on close.
  - `packages/ui/src/modal.tsx`:13-43

- issue: [A11Y] **Toast notifications have no ARIA live region.** Toast messages appear visually but are not announced by screen readers. The toast container needs `role="status"` or `aria-live="polite"`.
  - `packages/ui/src/toast.tsx`:43

- issue: [A11Y] **Toast close button has no accessible label.** The close button uses `x` character with no `aria-label`.
  - `packages/ui/src/toast.tsx`:54-58

- issue: [A11Y] **Only 16 ARIA attribute instances across 8 component files (out of 90+ component files).** The vast majority of interactive elements -- clickable divs, icon-only buttons, expandable panels -- have no ARIA annotations.
  - `packages/app/src/components/` -- 16 total ARIA references

- praise: [A11Y] `layout.tsx` has good ARIA on the mobile sidebar overlay (`role="dialog"`, `aria-modal="true"`) and proper `aria-label` on hamburger and notification buttons. The chat area uses `role="log"` and `aria-live="polite"` on the message list. These should be the standard for the rest of the codebase.
  - `packages/app/src/components/layout.tsx`:189
  - `packages/app/src/components/chat/chat-area.tsx`:544-545

### 2B. Form Label Associations

- issue: [A11Y] **Most form inputs lack associated labels.** While 89 `<label>` or `htmlFor` references exist across pages and 32 across components, many inputs use placeholder text as the sole label (e.g., search inputs in layout.tsx, filter inputs across list pages). The UI library's `Input` and `Select` components have no built-in label slot.
  - `packages/app/src/components/layout.tsx`:158 (search input with placeholder only)

---

## 3. Performance

### 3A. Route-Level Code Splitting

- praise: [PERF] **All 31 page routes are lazy-loaded.** `packages/app/src/App.tsx` uses `React.lazy()` with dynamic imports for every page, wrapped in `Suspense` with a `PageSkeleton` fallback. This is excellent for initial load performance.
  - `packages/app/src/App.tsx`:8-38

### 3B. Bundle Splitting

- issue: [PERF] **No Vite manual chunk configuration.** Both `packages/app/vite.config.ts` and `packages/admin/vite.config.ts` use default Vite chunking with zero `build.rollupOptions.output.manualChunks` configuration. Large shared dependencies (React, TanStack Query, Zustand, Lucide icons) will be bundled into a single vendor chunk or potentially duplicated across lazy chunks. Should configure manual chunks for `react`, `@tanstack/react-query`, and especially `lucide-react` (which bundles all imported icons).
  - `packages/app/vite.config.ts`:1-30
  - `packages/admin/vite.config.ts`:1-27

### 3C. QueryClient Configuration

- issue: [PERF] **QueryClient has zero configuration.** `new QueryClient()` is called with no default options. This means TanStack Query uses its defaults: `staleTime: 0` (every query is immediately stale), `gcTime: 5 minutes`, `retry: 3`, `refetchOnWindowFocus: true`. For an app with 30+ pages making API calls, this results in unnecessary refetches on every tab switch. Should set global defaults like `staleTime: 30_000` and `retry: 1`.
  - `packages/app/src/App.tsx`:40

- nitpick: [PERF] Many hooks individually set `staleTime` (30s-60s) and `refetchInterval` (10s-30s), but these are inconsistent -- some queries have no staleTime at all. A global default would reduce this boilerplate.

### 3D. Large Component Files

- issue: [PERF] **chat-area.tsx is 918 lines with no memoization.** This single component manages messages, streaming, file uploads, debate commands, delegation chains, and WebSocket listeners. It defines inline functions (`handleSend`, `handleCancel`, `handleRetry`) that create new closures on every render. The `toolCallsByMessage` useMemo is good, but the message rendering loop creates many inline arrow functions in JSX.
  - `packages/app/src/components/chat/chat-area.tsx`:1-918

- suggestion: [PERF] Extract `ChatMessage`, `StreamingMessage`, `DelegationPanel` as separate `React.memo`'d components from `chat-area.tsx` to prevent full re-renders on every streaming token.

### 3E. Duplicate Notification Polling

- issue: [PERF] **Notification count is fetched twice.** Both `layout.tsx` and `sidebar.tsx` independently query `['notifications-count']` with `refetchInterval: 30000`. While TanStack Query deduplicates concurrent requests with the same key, having two active subscribers means the interval timer runs from both components. They share the cache correctly, but the dual subscription is unnecessary -- one component should own the query.
  - `packages/app/src/components/layout.tsx`:54-59
  - `packages/app/src/components/sidebar.tsx`:108-113

### 3F. Image Handling

- praise: [PERF] Chat attachment images use `loading="lazy"` for deferred loading. No missing `alt` attributes found in img elements (verified via regex search).
  - `packages/app/src/components/chat/chat-area.tsx`:622

---

## 4. Responsive Design

### 4A. Layout Structure

- praise: [UX] **Layout handles mobile/desktop well.** Desktop uses a permanent sidebar (`hidden lg:block`). Mobile uses an overlay drawer triggered by hamburger menu with slide-in animation. The mobile top bar is sticky with safe-area-inset handling for notched phones. Escape key closes the drawer, and route changes auto-close it.
  - `packages/app/src/components/layout.tsx`:100-204

- praise: [UX] **Sidebar is scrollable on overflow.** The nav section uses `overflow-y-auto` ensuring all 24 navigation items remain accessible even on short viewports.
  - `packages/app/src/components/sidebar.tsx`:132

### 4B. Breakpoint Issues

- issue: [UX] **Sidebar has no responsive breakpoints at all.** The sidebar component itself uses zero `md:`, `lg:`, `sm:`, or `xl:` breakpoint classes. It is always exactly `w-[280px]`. The responsive behavior is handled entirely by the parent Layout, but the sidebar content (font sizes, padding, icon sizes) never adapts.
  - `packages/app/src/components/sidebar.tsx`:117

- issue: [UX] **Fixed-width elements in pages.** Several pages use fixed pixel widths that may clip on mobile: `w-[500px]` sidebar in knowledge.tsx, `min-w-[560px]` and `min-w-[640px]` tables in activity-log.tsx. While these are inside scrollable containers, they force horizontal scrolling on mobile.
  - `packages/app/src/pages/knowledge.tsx`:546
  - `packages/app/src/pages/activity-log.tsx`:711,1005

### 4C. UI Library Responsive Support

- praise: [UX] **Tabs component supports mobile.** `overflow-x-auto snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0` enables horizontal scrolling on mobile with scroll snapping, and normalizes margins on desktop. Tab items support `shortLabel` for abbreviated mobile labels.
  - `packages/ui/src/tabs.tsx`:19

---

## 5. Component Quality (packages/ui)

### 5A. Overall Assessment

The UI library has 19 components with clean, minimal implementations. All use TypeScript with proper prop interfaces. The `cn()` utility (class-variance-authority + tailwind-merge) is used consistently.

- praise: [UX] **Consistent variant patterns.** Button, Badge, and Avatar use `cva` for variant management with sensible defaults. Skeleton has specialized variants (SkeletonCard, SkeletonTable).

- praise: [UX] **Good loading/empty states.** `EmptyState` component accepts icon, title, description, and action slots. `Skeleton`, `SkeletonCard`, `SkeletonTable` cover common loading patterns. `Spinner` has size variants.

### 5B. Missing Component Features

- issue: [UX] **Modal has no size variants.** It defaults to `max-w-lg` and consumers must override via className. A `size` prop (`sm | md | lg | xl | full`) would be more composable.
  - `packages/ui/src/modal.tsx`:31

- issue: [UX] **Input/Textarea have no `label` prop.** Consumers must manually wrap inputs in `<label>` elements. A built-in label slot (like Toggle already has) would improve both DX and accessibility.
  - `packages/ui/src/input.tsx`:7
  - `packages/ui/src/textarea.tsx`:9

- issue: [UX] **Select uses native HTML `<select>`.** While this is accessible by default, it cannot be styled consistently across browsers (especially the dropdown options). The custom chevron SVG in the data-URI is a workaround that may not render on all platforms.
  - `packages/ui/src/select.tsx`:19

- issue: [UX] **No Dropdown/Menu, Tooltip, or Popover components.** Many pages implement custom dropdown menus inline (e.g., knowledge.tsx context menu, activity-log filter popover). These lack consistent keyboard navigation and dismiss behavior.

### 5C. Toast Architecture

- issue: [PERF] **Toast uses module-level mutable state.** `_addToast` is a module-level variable reassigned on every `ToastProvider` render. This works but is fragile -- if two providers mount, the second silently overwrites the first. No deduplication by ID is supported. No `position` prop.
  - `packages/ui/src/toast.tsx`:16

---

## 6. State Management

### 6A. Zustand Stores

- praise: [UX] **Clean store separation.** 6 stores with clear responsibilities: auth, WebSocket, notifications, theme, commands, activity. No store depends on another (stores communicate via events, not imports).

- praise: [PERF] **Theme store uses `persist` middleware.** Theme preference survives page reloads via localStorage. `onRehydrateStorage` correctly re-applies the `data-theme` attribute on startup.
  - `packages/app/src/stores/theme-store.ts`:57-75

- issue: [PERF] **Auth store reads localStorage synchronously on module load.** `JSON.parse(localStorage.getItem('corthex_user') || 'null')` runs at import time, before the app renders. If localStorage contains invalid JSON, this will throw and crash the entire app. Should wrap in try/catch.
  - `packages/app/src/stores/auth-store.ts`:23

- issue: [UX] **Notification store has no persistence.** Notifications are stored only in memory and lost on page reload. The `addNotification` limit of 50 is good, but there is no connection to the server-side notifications (the layout polls `/workspace/notifications/count` separately). This creates a split-brain where the bell badge shows server count but the notification store shows in-memory-only items.
  - `packages/app/src/stores/notification-store.ts`:19-44

### 6B. WebSocket Store

- praise: [PERF] **Exponential backoff with cap.** Reconnection uses `3s * 2^attempt` capped at 30s. Close codes 1000, 4001, 4002 skip reconnection (graceful close). Server restart handling has a separate path with reset attempt counter.
  - `packages/app/src/stores/ws-store.ts`:9-14

- issue: [PERF] **WebSocket token in URL query string.** The token is passed as `?token=${token}` in the WebSocket URL. This token will appear in server access logs, proxy logs, and browser history. Should use a subprotocol header or first-message authentication pattern instead.
  - `packages/app/src/stores/ws-store.ts`:41

---

## 7. Frontend Data Flow

### 7A. API Client

- praise: [UX] **Centralized error handling.** The `api.ts` client handles 401 (auto-redirect to login with redirect param), 429 (rate limit with retryAfter), and generic errors (parsed error message with code-based localization via `getErrorMessage`). This prevents inconsistent error handling across pages.
  - `packages/app/src/lib/api.ts`:1-63

- issue: [UX] **No global error boundary.** If a component throws during render (e.g., bad API response shape, null pointer), the entire app crashes with a white screen. React 19 Error Boundaries should wrap at minimum the Layout outlet.

### 7B. TanStack Query Patterns

- praise: [PERF] **Consistent invalidation patterns.** Mutations in `use-queries.ts` correctly invalidate related query keys on success. The workflow mutations invalidate both list and detail queries.
  - `packages/app/src/hooks/use-queries.ts`:256-306

- issue: [UX] **No global error handling for queries.** No `onError` callback in any TanStack Query hook across the hooks directory. When an API call fails (e.g., network error, 500), the query silently enters error state. The UI must check `isError` / `error` individually in each component -- and many do not. No global `queryClient.setDefaultOptions({ queries: { onError: ... } })`.
  - `packages/app/src/hooks/use-queries.ts` -- 0 `onError` references

### 7C. WebSocket Integration

- praise: [UX] **Clean channel-based pub/sub.** The ws-store provides `addListener` / `removeListener` for channel-specific handlers. Components subscribe in `useEffect` cleanup patterns. The chat-area.tsx correctly listens for debate events and cleans up.
  - `packages/app/src/stores/ws-store.ts`:124-133

---

## Summary of Critical Findings

### Severity: HIGH

1. **Design tokens are dead code.** 5 theme variants are defined but the UI renders with hardcoded colors. Theme switching is cosmetic only (changes CSS variables that nothing reads). ~194 hardcoded color instances in components + uncounted instances in pages.

2. **UI library has near-zero accessibility.** Only 2 of 19 components have any ARIA attributes. Modal lacks focus trap. Toast lacks live region. Tabs lacks tab roles. This affects screen reader users across every page.

3. **Auth store can crash app on invalid localStorage.** Synchronous `JSON.parse` at module load with no try/catch.

### Severity: MEDIUM

4. **Font inconsistency.** Pages use Public Sans and Noto Serif KR via inline styles instead of the Inter/JetBrains Mono design system fonts. These fonts may not be loaded.

5. **No Vite bundle splitting config.** All vendor code goes into default chunks. Lucide icons (large) are not tree-shaken optimally.

6. **QueryClient has no global defaults.** Every tab switch triggers refetches (staleTime: 0). No global error handler.

7. **chat-area.tsx is 918 lines with no component extraction or memoization** for the most interactive view in the app.

### Severity: LOW

8. **Duplicate notification polling** in layout.tsx and sidebar.tsx.
9. **WebSocket token in URL** appears in logs.
10. **No React Error Boundary** at the app level.
11. **No Dropdown/Tooltip/Popover** in the UI library, forcing inconsistent inline implementations.

---

## Praise Summary

- praise: [PERF] Excellent route-level code splitting with all 31 pages lazy-loaded
- praise: [UX] Clean mobile sidebar overlay with animation, escape key, and route-change auto-close
- praise: [UX] Tabs component with mobile scroll snapping and short labels
- praise: [PERF] WebSocket reconnection with exponential backoff and smart toast guards
- praise: [UX] Centralized API error handling with i18n error codes
- praise: [PERF] Theme persistence via Zustand persist middleware
- praise: [UX] Chat message list with infinite scroll, connection status banners, and proper ARIA
- praise: [UX] Well-structured Zustand stores with clear separation of concerns
- praise: [PERF] Good use of useMemo/useCallback across hooks (237 instances in 59 files)
- praise: [UX] Skeleton loading components with card and table variants

---

**Score: 6.5/10.** The architecture is solid (lazy loading, Zustand stores, TanStack Query hooks, centralized API client, WebSocket pub/sub), but the design token system is effectively non-functional -- themes are defined but not consumed. The UI library is clean but accessibility-absent. Font usage contradicts the design spec. These are systemic issues that affect every page rather than isolated bugs.
