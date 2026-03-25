# Mobile Benchmark Analysis — CORTHEX v2

## Screenshot Analysis (3 core + 13 supplementary)

### 1. Toss (toss.im) — Relevance: 5/5
- **Layout**: Full-width hero, centered content, minimal header
- **Nav**: Compact top bar (logo left + CTA + hamburger right)
- **Typography**: Large bold headings (30px+), generous line-height
- **Spacing**: Airy — 32px+ section gaps, 16px padding
- **CTA**: Pill-shaped buttons, high contrast, App Store + Play Store side-by-side
- **Mobile pattern**: Bottom-first design, card scroll, safe-area respect
- **Key takeaway**: Korean fintech mobile gold standard. Clean, confident, no clutter.

### 2. Linear (linear.app) — Relevance: 5/5
- **Layout**: Full-width, app preview embedded below fold
- **Nav**: Logo + Login + Sign up + hamburger (4 items max)
- **Typography**: Bold serif-like headings, subtle body text
- **Color**: Full dark mode, minimal accent usage
- **Spacing**: Dense information below fold, airy hero
- **Mobile pattern**: App screenshot dominates viewport, text above
- **Key takeaway**: Dark mode done right. Content-first, not chrome-first.

### 3. Notion (notion.com) — Relevance: 4/5
- **Layout**: Centered hero, mascot illustrations, stacked CTAs
- **Nav**: Logo + CTA + hamburger (ultra-minimal)
- **Typography**: Bold rounded headings, playful personality
- **Spacing**: Very generous — hero takes full viewport
- **CTA**: Full-width primary button + secondary button stacked
- **Mobile pattern**: Horizontal scroll carousels for features, tab-style content
- **Key takeaway**: Mobile-native feeling despite being web. Horizontal swipe patterns.

### 4. Vercel — Login page pattern
- **Layout**: Centered form, stacked OAuth buttons
- **Typography**: Clean, bold heading, regular body
- **Key takeaway**: Simple mobile forms — full-width inputs, stacked buttons

---

## Cross-Site Pattern Synthesis

### TOP 5 Mobile Patterns to Adopt

1. **Bottom Navigation Bar** (Toss, Slack, Discord)
   - 4-5 items max with icons + labels
   - Active state: filled icon + accent color
   - Safe area padding for notch devices
   - **Decision: Adopt for CORTHEX app (bottom tab bar)**

2. **Hamburger → Sheet Menu** (Linear, Notion, Toss)
   - Full-screen or bottom-sheet slide-up
   - Not sidebar slide-in (desktop pattern)
   - Grouped menu items with section headers
   - **Decision: Replace current slide-in sidebar with bottom sheet**

3. **Card-Based Content Layout** (All sites)
   - Full-width cards with 16px horizontal padding
   - Rounded corners (12-16px)
   - Subtle shadow or border for elevation
   - Stacked vertically, never side-by-side on mobile
   - **Decision: All dashboard widgets → full-width stacked cards**

4. **Swipe/Horizontal Scroll** (Notion, Monday, Toss)
   - Feature cards in horizontal scroll container
   - Peek next card (show 20px of next item)
   - Dot indicators or scroll snap
   - **Decision: Use for agent cards, department cards, stat overview**

5. **Floating Action Button (FAB)** (Slack, Notion)
   - Bottom-right, 56px diameter
   - Primary action (new message, new agent, etc.)
   - Shadow for elevation over content
   - **Decision: Add FAB for primary action per page**

### TOP 3 Anti-Patterns to Avoid

1. **Desktop sidebar on mobile** — Forces horizontal scroll, wastes space
2. **Multi-column grid on small screens** — Cards become unreadable
3. **Fixed/absolute positioned elements without safe-area** — Content hidden behind notch/home indicator

---

## Mobile-Specific Design Tokens (derived from analysis)

### Spacing
- Page padding: 16px (horizontal)
- Card gap: 12px
- Section gap: 24px
- Bottom nav height: 64px (+ safe-area-inset-bottom)

### Typography (mobile-optimized)
- Page title: 24px bold (not 36px)
- Section title: 18px semibold
- Card title: 16px semibold
- Body: 14px regular
- Caption: 12px regular

### Touch Targets
- Minimum: 44x44px (WCAG 2.5.8)
- Recommended: 48x48px for primary actions
- Tap spacing: 8px between targets

### Bottom Navigation
- Height: 56px + safe-area
- Items: 4-5 max
- Icon: 24px, Label: 10px
- Active: accent color, Inactive: text-secondary
