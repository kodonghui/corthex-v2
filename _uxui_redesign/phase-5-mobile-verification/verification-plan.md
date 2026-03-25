# Phase 5: Mobile Verification Plan

## 5-1: Visual Verification (Playwright 390x844)
- Navigate to every page at 390x844 viewport
- Screenshot each page
- Verify: no horizontal scroll, no overflow, no clipped content
- Verify: mobile top bar visible (hamburger + title)
- Verify: cards stack vertically
- Verify: tables convert to cards or scroll horizontally

## 5-2: E2E Functional Test
- Login flow on mobile
- Navigation: hamburger → sidebar → page navigation
- CRUD: create/edit/delete on mobile
- Forms: input focus doesn't zoom (16px font)
- Touch targets: all buttons clickable (44px min)
- Scroll: vertical scroll works, no horizontal scroll

## 5-3: Accessibility
- Touch targets >= 44px (WCAG 2.5.8)
- Focus visible on keyboard nav
- prefers-reduced-motion respected
- Contrast ratios (WCAG 2.1 AA)
- Screen reader landmarks

## Pages to Test (Priority)
### App (top 10)
1. /login
2. /hub
3. /dashboard
4. /chat
5. /agents
6. /jobs
7. /settings
8. /departments
9. /costs
10. /notifications

### Admin (top 10)
1. /admin/login
2. /admin/ (dashboard)
3. /admin/companies
4. /admin/users
5. /admin/agents
6. /admin/costs
7. /admin/monitoring
8. /admin/settings
9. /admin/onboarding
10. /admin/api-keys
