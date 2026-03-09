# Party Mode Round 2 — Adversarial Review
## Pages: 20-tools, 21-users, 22-employees, 23-monitoring, 24-home (batch)

### Lens: All 7 experts adopt adversarial stances, actively looking for contradictions.

### Issues Found

**Issue 1 (Medium): 20-tools — `writing-mode-vertical-lr` is not a standard Tailwind class**
- Raised by: Amelia (Developer)
- The spec uses `writing-mode-vertical-lr` but Tailwind doesn't have this as a utility class. Needs arbitrary value syntax `[writing-mode:vertical-lr]` or custom CSS.
- Quinn: "This would cause a build-time warning or be silently ignored."
- **Resolution: Fixed** — Updated to `[writing-mode:vertical-lr]` with a comment noting the requirement.

**Issue 2 (Medium): Toast API call signature inconsistency**
- Raised by: Winston (Architect)
- In 20-tools spec section 5 and 21-users spec section 5, the `addToast` call used positional params `addToast('msg', 'success')` but the actual API is `addToast({ type: 'success', message: 'msg' })` (object param).
- **Resolution: Fixed** — Updated both specs to use correct object param syntax.

**Issue 3 (Medium): 24-home — SPA navigation uses `<a href>` instead of `navigate()`**
- Raised by: Amelia
- The home page uses React Router's `useNavigate()` hook for all navigation. But the spec used `<a href="/jobs">` and `<a href="/chat">` tags which would cause full page reloads in an SPA.
- Winston: "This breaks the SPA experience and resets all React state."
- **Resolution: Fixed** — Changed all `<a href>` to `<div onClick={() => navigate(...)}>` or `<button onClick>` patterns.

**Issue 4 (Minor): 20-tools — Spec changes checkboxes from `<input>` to `<button>`**
- Raised by: Quinn (QA)
- The current code uses native `<input type="checkbox">` but the spec proposes `<button>` elements. This is a deliberate design improvement but should be noted as a change.
- Sally: "Button-based checkboxes give better visual control and match the design system."
- **Resolution: Acceptable** — This is an intentional design decision, well-documented in the spec.

**Issue 5 (Minor): 22-employees — ConfirmDialog description text slightly differs from code**
- Raised by: Quinn
- Spec: "이 직원은 더 이상 로그인할 수 없습니다." vs Code: "이 직원을 비활성화하면 더 이상 로그인할 수 없습니다."
- **Resolution: Acceptable** — Minor wording variation. The implementation will use the spec text as the target design.

**Issue 6 (Minor): Cross-page consistency — container max-widths differ**
- Raised by: Bob (Scrum Master)
- 20-tools: `max-w-[1400px]`, 21-users: `max-w-5xl` (1024px), 22-employees: `max-w-6xl` (1152px), 23-monitoring: `max-w-4xl` (896px), 24-home: `max-w-4xl`
- Sally: "Different max-widths are appropriate: tools has a wide matrix, monitoring is compact, employees has a wider table with more columns."
- **Resolution: Acceptable** — Each page has a different content density justifying different max-widths.

### Round 1 Fixes Verification

| R1 Issue | Verified Fixed? |
|----------|----------------|
| Save button dynamic text | ✅ Present in updated spec |
| RecentNotifications null render | ✅ Updated correctly |

### Score: 8.5/10 — PASS

All 3 medium issues fixed. Remaining minor issues are acceptable design decisions.
