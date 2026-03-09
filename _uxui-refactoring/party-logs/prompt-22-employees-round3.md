# Party Mode Round 3 — Forensic Review
## Page: 22-employees (직원 관리)

### Lens: Line-by-line verification against source code.

### Source Files Verified
- `packages/admin/src/pages/employees.tsx` (675 lines)

### Verification Checklist

| Prompt Claim | Code Evidence | Status |
|---|---|---|
| Employee has id, username, name, email, isActive, createdAt, departments | Employee type lines 9-17 | ✅ |
| Pagination with page, limit, total, totalPages | EmployeeListResponse type lines 19-22 | ✅ |
| Create returns employee + initialPassword + departments | CreateResponse type lines 24-26 | ✅ |
| Reset password returns newPassword | ResetPasswordResponse type lines 28-30 | ✅ |
| Search with debounce (300ms) | handleSearchChange lines 60-67 | ✅ |
| Active status filter (all/true/false) | activeFilter state line 42, buttons lines 201-233 | ✅ |
| Department filter | departmentFilter state line 41, buttons lines 237-261 | ✅ |
| Employee table with name, username, email, departments, status, actions | Table columns lines 289-368 | ✅ |
| Department badges per employee | Lines 307-317 | ✅ |
| "미배정" for no departments | Line 316 | ✅ |
| Pagination controls with ellipsis | Lines 373-419 | ✅ |
| Invite modal with username, name, email, departmentIds | inviteForm state line 53, modal lines 425-511 | ✅ |
| Department checkbox list in invite | Lines 477-491 | ✅ |
| Edit modal with name, email, departmentIds | editForm state line 56, modal lines 515-601 | ✅ |
| Username readonly in edit | Line 540-543 | ✅ |
| Password display modal | passwordModal state line 50, modal lines 604-636 | ✅ |
| Password shown after invite | onSuccess sets passwordModal line 103 | ✅ |
| Password shown after reset | onSuccess sets passwordModal line 152 | ✅ |
| Copy password to clipboard | copyPassword function lines 167-171 | ✅ |
| Deactivate confirmation | ConfirmDialog lines 639-647 | ✅ |
| Reactivate confirmation | ConfirmDialog lines 649-657 | ✅ |
| Reset password confirmation | ConfirmDialog lines 659-672 | ✅ |
| Reactivate mutation | reactivateMutation lines 133-144 | ✅ |
| Empty state with invite button action | EmptyState lines 271-283 | ✅ |
| Page resets on filter change | setPage(1) throughout filter handlers | ✅ |

### Issues Found

**No discrepancies found.** All 25 claims are traceable to code. This is the most complete and accurate prompt.

### Final Score: 9/10 — PASS

Perfect code-to-prompt alignment. All features documented, nothing invented.
