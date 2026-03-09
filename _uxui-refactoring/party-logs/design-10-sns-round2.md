# Party Mode — Round 2 (Adversarial) — 10-sns Design Spec

## Re-read spec and challenge assumptions

### Critical Examination

1. **Platform differentiation is weak** — The spec uses text labels ("인스타그램") but 6 platforms need quick visual scanning. Solution: Add platform emoji prefixes or small colored dots. This is NOT blocking but reduces scan speed.

2. **A/B test UX flow is buried** — Variant creation, metrics input, and results comparison are all crammed into the detail view bottom. For a feature this complex, it deserves clearer visual hierarchy or a dedicated sub-section.

3. **Card news carousel navigation** — Keyboard navigation not mentioned. Left/right arrow keys should work for carousel.

4. **Queue tab batch scheduling UX** — The datetime-local input inline with batch actions is cramped on mobile. Consider a popover or mini-modal for batch scheduling.

5. **Stats tab lacks interactivity** — Period selector only has 3 options (7/30/90 days). Custom date range would be more useful for business users.

### New Issues from Adversarial Lens

1. **Image loading states** — Gallery view and card news carousel show images but no loading/error states for broken image URLs. Need placeholder and error fallbacks.

2. **AI generation loading** — When AI generates content (can take 30-60s), only "AI 생성 중..." text is shown. Need a more engaging loading state with estimated time.

### Previously Identified Issues — Status Check
- Platform icons: Still valid, added to recommendations
- Error state handling: Still valid, needs attention

## Round 2 Score: 8.0/10

### Issues Found (2 new):
1. **Medium** — Image loading/error fallback states not specified
2. **Minor** — AI generation loading could be more engaging (spinner + progress text)

### Verdict: PASS
No blocking issues. All issues are UX refinements that don't affect core functionality.
