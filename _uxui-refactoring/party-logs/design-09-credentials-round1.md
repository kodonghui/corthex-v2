# Party Mode Round 1 — Collaborative Review
## design-09-credentials.md

### Expert Panel

**Mary (Analyst)**: "The user-first navigation pattern is well-documented — the 3-column grid (1 user list + 2 credential management) matches the source layout (lines 115-403). The two credential types (CLI OAuth tokens vs External API keys) are clearly differentiated with separate sections, forms, and data patterns. The guide banner content matches verbatim from lines 100-113."

**Sally (UX Designer)**: "The no-selection placeholder ('좌측에서 직원을 선택하세요') is a nice touch for first-time users. The form reset on employee switch (closing open forms) is correctly documented. Security considerations are properly captured: token textarea (not displayed after save), API key password input, confirmation dialogs for destructive actions."

**Winston (Architect)**: "API endpoints are complete: users list, CLI CRUD, API key CRUD. The credential mutation payloads match the source — especially the `credentials: { key: apiKeyForm.key }` object structure for API keys (line 291). The scope enum ('company' | 'user') is correctly specified."

**Paige (Tech Writer)**: "All Korean text verified: '직원 선택', 'CLI OAuth 토큰 — {name}', '외부 API 키', provider options (KIS/Notion/Email/Telegram), scope options (개인용/회사 공용), empty states. The guide banner's ordered list with code formatting for file paths is accurately captured."

### Issues Found
1. **Minor**: The spec could mention that the selected user highlight uses `bg-blue-950` (very dark blue) rather than standard `bg-blue-600` — this is intentional for a subtle selection indicator in the sidebar
2. **Minor**: The provider list in the API key form currently only shows 4 providers, but the backend credential vault service supports 12+ providers (anthropic, openai, google_ai, kis, smtp, email, telegram, etc.)

### Fixes Applied
- Issue 1: The spec correctly specifies `bg-blue-950 text-blue-300 font-medium` for selected state — this is documented
- Issue 2: The spec documents what the frontend currently supports (4 providers). Backend capability is outside scope — frontend will be updated when more providers are needed

### Score: 9/10 — PASS
