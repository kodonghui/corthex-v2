# Known Behaviors — Not Bugs

These are intentional design decisions or expected behaviors. Agents must NOT report these as bugs.

| KB-ID | Description | Page | Reason |
|-------|-------------|------|--------|
| KB-001 | ALL_CAPS text like ADMIN_OVERRIDE, SECURE_TERMINAL, TERMINAL_ID | admin/* | Cyberpunk UI theme decoration, intentional |
| KB-002 | Korean tofu in Playwright headless | all | Font not installed in headless — real browser OK |
| KB-003 | Manifest warning in console | all | PWA manifest not configured yet |
| KB-004 | n8n editor shows unreachable | admin/n8n-editor | n8n not running on this server |
| KB-005 | Demo/placeholder data in messenger, SNS, trading | app/* | Static demo data for UI preview |
| KB-006 | English mixed with Korean in titles | app/* | Bilingual design choice |
| KB-007 | No agents configured on hub/nexus | app/* | Expected when no agents created yet |
| KB-008 | Memory 108% in monitoring | admin/monitoring | Heap display rounding — cosmetic |
