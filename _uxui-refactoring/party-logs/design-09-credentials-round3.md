# Party Mode Round 3 — Forensic Review
## design-09-credentials.md

### Forensic Verification

**Source Code Cross-Check:**
- credentials.tsx (407 lines): All UI sections verified against render (lines 92-406) ✓
- Type definitions (lines 7-9): User, CliCredential, ApiKey types ✓
- addTokenMutation (lines 46-56): POST endpoint and payload verified ✓
- deactivateTokenMutation (lines 58-65): DELETE endpoint verified ✓
- addApiKeyMutation (lines 67-77): POST with credentials object verified ✓
- deleteApiKeyMutation (lines 79-86): DELETE endpoint verified ✓
- User list rendering (lines 119-141): Selection state and display verified ✓
- Guide banner (lines 99-113): Content verified verbatim ✓
- CLI token list (lines 224-265): Status pills, deactivate button verified ✓
- API key list (lines 363-398): Provider badge, delete button verified ✓

**Design Token Mapping:**
- All zinc → slate ✓
- bg-amber-50/border-amber-200 → bg-amber-900/10/border-amber-800 (dark mode) ✓
- indigo → blue for selection and buttons ✓
- Green/red status pills consistent ✓
- Blue provider badges consistent ✓

**Missing Elements Check:**
- Company selection prerequisite: Documented ✓
- Toast notifications on all 4 mutations: Referenced ✓
- Form reset on employee switch: Documented in interactions ✓
- Error display below forms: `text-sm text-red-500` documented ✓
- Date formatting: `new Date().toLocaleDateString('ko')` noted ✓

**Backend Credential Vault Cross-Check:**
- 12 providers in backend (credential-vault.ts): Only 4 shown in frontend — correct per source ✓
- AES-256-GCM encryption: Not visible to frontend — correctly excluded ✓
- Audit logging on all operations: Backend concern — excluded ✓
- Scope priority (user > company): Backend logic — excluded ✓

**Completeness Score:**
| Section | Score |
|---------|-------|
| Layout ASCII | 10/10 |
| Component Breakdown | 9/10 |
| Tailwind Classes | 9/10 |
| Interactions | 9/10 |
| Responsive | 8/10 |
| Animations | 8/10 |
| Accessibility | 9/10 |
| data-testid Map | 10/10 |

### Final Score: 9.0/10 — PASS
Spec is comprehensive and implementation-ready. Minor note: future iteration should expand API key form to support provider-specific fields (KIS needs 3 fields, SMTP needs 5 fields).
