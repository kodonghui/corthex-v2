# Party Mode Round 2 (Adversarial) — 09-credentials

## Experts: All 7

### Adversarial Observations

- **Mary**: "'Password/masked input' — functional behavior description, not visual. Acceptable."
- **Winston**: "Schema fully matched. encryptedToken never exposed. JSONB credentials correctly simplified to single key input."
- **Sally**: "'Uppercase label' = data formatting, 'monospace font' = functional. Both acceptable."
- **John**: "$220/month Claude Max is product context, not a feature. Helps Lovable understand purpose."
- **Quinn**: "Switching employees should reset open forms. Code does this. Prompt should mention."
- **Bob**: "Backend auth middleware difference between CLI and API keys — implementation detail, not wireframe relevant."
- **Amelia**: "API key form simplified to single 'key' field. Matches current implementation. Some providers may need more fields in future but current code is single-field."

### Checklist
- [x] Zero visual specs? — Yes
- [x] v2 features only? — Yes
- [x] Schema match? — Yes
- [x] Handler match? — Yes
- [x] Edge cases? — Fixed: employee switching resets forms
- [x] Enough context? — Yes

### Fixes Applied
1. Added note about employee switching resetting open forms

### Verdict: PASS (moving to Round 3)
