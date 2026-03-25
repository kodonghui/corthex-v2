# CORTHEX Design System — Command Theme (Dark)

> Source of truth for all Stitch 2 screen generation.
> Every screen MUST follow these rules exactly. No deviations.

---

## 1. Visual Identity

**Product**: CORTHEX — AI Virtual Office Management Platform
**Personality**: Mission control room. Precise. Powerful. Quiet confidence.
**References**: Linear (information density), Supabase (dark developer UI), Retool (admin panel density)
**NOT this**: Playful, bubbly, marketing-heavy, lots of whitespace

---

## 2. Color Palette (exact hex — no substitutions)

### Primary Colors
| Token | Hex | Where to use |
|-------|-----|-------------|
| `bg` | `#0C0A09` | Page background, main canvas, sidebar bg |
| `surface` | `#1C1917` | Cards, panels, modal bg, topbar bg |
| `elevated` | `#292524` | Nested cards, input bg, hover row bg, dropdown bg |
| `border` | `#44403C` | Card borders, table dividers, input borders |
| `border-strong` | `#57534E` | Focus rings, active borders, selected item borders |

### Accent Colors
| Token | Hex | Where to use |
|-------|-----|-------------|
| `accent` | `#CA8A04` | Primary CTA, active nav, progress bars, chart main |
| `accent-hover` | `#D97706` | Button hover, link hover |
| `accent-deep` | `#A16207` | Pressed state, active toggle |
| `accent-muted` | `#CA8A0419` | Subtle highlight bg (10% opacity gold) |

### Text Colors
| Token | Hex | Where to use |
|-------|-----|-------------|
| `text-primary` | `#FAFAF9` | Headings, body text, table cell text |
| `text-secondary` | `#A8A29E` | Descriptions, helper text, timestamps, labels |
| `text-disabled` | `#57534E` | Placeholder text, disabled controls |
| `text-on-accent` | `#0C0A09` | Text on gold buttons (dark on gold) |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Online dot, success toast, positive delta |
| `warning` | `#EAB308` | Warning badge, caution toast, pending status |
| `error` | `#EF4444` | Error toast, failed status, destructive button |
| `info` | `#3B82F6` | Info badge, link color, informational toast |

### Chart Colors (ordered for data visualization)
| Series | Hex | Usage |
|--------|-----|-------|
| Series 1 | `#CA8A04` | Primary metric (gold) |
| Series 2 | `#3B82F6` | Secondary metric (blue) |
| Series 3 | `#22C55E` | Tertiary metric (green) |
| Series 4 | `#A78BFA` | Quaternary metric (purple) |
| Series 5 | `#F97316` | Quinary metric (orange) |
| Grid lines | `#44403C` at 40% opacity | Chart grid |

---

## 3. Typography

### Font Families
- **All text**: DM Sans (heading AND body — single font family for power tool consistency)
- **Code/Numbers**: JetBrains Mono (IDs, timestamps, costs, code blocks, metrics)
- **Korean fallback**: Pretendard, Apple SD Gothic Neo

### Size Scale
| Name | Size | Line Height | Weight | Usage |
|------|------|------------|--------|-------|
| `4xl` | 36px | 40px | 700 | Page title (rare) |
| `3xl` | 30px | 36px | 700 | Section title |
| `2xl` | 24px | 32px | 700 | Card group title |
| `xl` | 20px | 28px | 600 | Card title |
| `lg` | 18px | 28px | 600 | Subtitle |
| `base` | 16px | 24px | 400 | Body text |
| `sm` | 14px | 20px | 400-500 | Table cells, form labels |
| `xs` | 12px | 16px | 500-700 | Badges, captions, timestamps |
| `2xs` | 10px | 14px | 700 | Uppercase tracking-widest labels, status pills |

### Rules
- Section headers: 10px, uppercase, tracking-widest (0.1em), `#A8A29E`, font-weight 700
- Numbers/costs: JetBrains Mono always (e.g., "$12,450", "24", "98%")
- Large stat numbers: 30-36px, JetBrains Mono, 700 weight, `#FAFAF9`

---

## 4. App Shell (SHARED — do NOT generate in pages)

### Sidebar (left, 280px desktop / overlay mobile)
```
┌──────────────────────┐
│ [Hexagon] CORTHEX    │  ← brand: icon #CA8A04, text #FAFAF9 bold
│ Management Platform  │  ← subtitle: 10px #A8A29E mono
├──────────────────────┤
│ COMMAND              │  ← section label: 10px uppercase #A8A29E
│  Dashboard      📊   │  ← LayoutDashboard icon
│  Hub            🖥️   │  ← Terminal icon
│  NEXUS          🔗   │  ← Network icon
│  Chat           💬   │  ← MessageSquare icon
│                      │
│ ORGANIZATION         │
│  Agents         🤖   │  ← Bot icon
│  Departments    🏢   │  ← Building2 icon
│  Jobs           ⏱️   │  ← Clock icon
│  Tiers          📑   │  ← Layers icon
│  Reports        📄   │  ← FileText icon
│                      │
│ TOOLS                │
│  Workflows      ⬡    │  ← Hexagon icon
│  Marketing      🔀   │  ← GitBranch icon
│  Approval       ✓    │  ← UserCheck icon
│  SNS            📤   │  ← Share2 icon
│  Trading        📈   │  ← TrendingUp icon
│  Messenger      ✉️   │  ← Send icon
│  Library        📖   │  ← BookOpen icon
│  AGORA          👥   │  ← Users icon
│  Memories       🧠   │  ← Brain icon
│  Files          📁   │  ← FolderOpen icon
│                      │
│ SYSTEM               │
│  Costs          💲   │  ← DollarSign icon
│  Performance    📊   │  ← BarChart3 icon
│  Activity Log   📜   │  ← History icon
│  Ops Log        🛡️   │  ← Shield icon
│  Classified     🔒   │  ← Lock icon
│  Settings       ⚙️   │  ← Settings icon
├──────────────────────┤
│ [Switch to Admin]    │  ← text #A8A29E, bg white/10
│ [Avatar] User Name   │  ← avatar bg #CA8A04, name white
│   Role  [Logout]     │  ← role #A8A29E, logout hover:red
│ #build-number        │  ← 10px #A8A29E/50 mono
└──────────────────────┘
```

- Background: `#0C0A09`
- Active item: bg `#CA8A0426`, text `#FAFAF9`, font-medium
- Inactive item: text `#A8A29E`, hover bg `#CA8A0419`
- Section dividers: border-top `#1C1917` between groups
- Collapse: 64px wide, icons only, tooltip on hover

### Top Bar (56px, sticky)
```
┌─────────────────────────────────────────────────────────────┐
│ CORTHEX > Dashboard        [🔍 Search... Ctrl+K] [🔔] [👤] │
└─────────────────────────────────────────────────────────────┘
```
- Background: `#1C1917` at 90% opacity + backdrop-blur-md
- Breadcrumbs: "CORTHEX" in `#A8A29E` clickable, ">" divider `#57534E`, page name in `#FAFAF9` bold
- Search: bg `#292524`, border `#44403C`, placeholder `#57534E`, width 256px
- Notification bell: `#A8A29E`, unread dot `#22C55E` (8px)
- Border bottom: 1px `#44403C`

---

## 5. Component Styles

### Cards
```css
background: #1C1917;
border: 1px solid #44403C;
border-radius: 8px;
padding: 20px;
transition: border-color 200ms ease;
/* hover: border-color #CA8A04 at 50% */
```

### Stat Cards (used on dashboard/hub)
- Layout: icon + badge top row, large number middle, label bottom
- Icon: Lucide, 24px, `#CA8A04`
- Badge: 10px bold uppercase pill (e.g., "ONLINE" green, "+12% WK" amber, "MTD" gray)
- Number: 30px JetBrains Mono bold `#FAFAF9`
- Label: 10px uppercase tracking-widest `#57534E`

### Buttons
| Variant | BG | Text | Border | Hover BG |
|---------|-----|------|--------|----------|
| Primary | `#CA8A04` | `#0C0A09` | none | `#D97706` |
| Secondary | transparent | `#FAFAF9` | 1px `#44403C` | `#292524` |
| Ghost | transparent | `#A8A29E` | none | `#292524` |
| Destructive | `#EF4444` | `#FFFFFF` | none | `#DC2626` |
- All: rounded-lg (8px), px-4 py-2, font-medium, cursor-pointer, transition 200ms
- Active: scale(0.98)

### Inputs & Forms
- Background: `#292524`
- Border: 1px `#44403C`
- Text: `#FAFAF9`, placeholder: `#57534E`
- Focus: border `#CA8A04`, box-shadow 0 0 0 1px `#CA8A04`
- Label: 14px 500 `#FAFAF9`, margin-bottom 4px
- Help text: 12px `#A8A29E`
- Error state: border `#EF4444`, help text `#EF4444`

### Select / Dropdown
- Trigger: same as input + chevron-down icon right
- Dropdown panel: bg `#1C1917`, border `#44403C`, rounded-lg, shadow-lg, z-50
- Option: px-3 py-2, hover bg `#292524`, selected bg `#CA8A0419` + text `#CA8A04`

### Tabs
- Container: border-bottom 1px `#44403C`
- Active tab: text `#FAFAF9`, border-bottom 2px `#CA8A04`, font-medium
- Inactive tab: text `#A8A29E`, hover text `#FAFAF9`
- Tab padding: px-4 py-3

### Tables
- Header row: bg transparent, text 10px uppercase tracking-widest `#57534E`, border-bottom `#44403C`
- Body rows: text `#FAFAF9` sm, hover bg `#292524`
- Dividers: border-bottom `#44403C` at 10% opacity
- Sticky header: bg `#0C0A09`
- Sortable: header click, arrow indicator

### Modals / Dialogs
- Overlay: bg black at 50% opacity + backdrop-blur-sm
- Modal: bg `#1C1917`, border `#44403C`, rounded-xl (16px), max-width 500px, p-6
- Title: 20px 600 `#FAFAF9`
- Close button: top-right, ghost style, X icon
- Footer: border-top `#44403C`, pt-4, buttons right-aligned

### Toast / Notifications
- Container: fixed bottom-right, z-50
- Toast: bg `#1C1917`, border `#44403C`, rounded-lg, p-4, shadow-xl
- Types: left border 3px — success `#22C55E`, error `#EF4444`, warning `#EAB308`, info `#3B82F6`
- Title: 14px 600 `#FAFAF9`, message: 14px `#A8A29E`
- Auto-dismiss: 5 seconds

### Badges / Pills
| Variant | BG | Text |
|---------|-----|------|
| Success | `#22C55E` at 10% | `#22C55E` |
| Warning | `#EAB308` at 10% | `#EAB308` |
| Error | `#EF4444` at 10% | `#EF4444` |
| Info | `#3B82F6` at 10% | `#3B82F6` |
| Neutral | `#44403C` at 50% | `#A8A29E` |
- All: 10px bold uppercase, px-2 py-0.5, rounded

### Toggle / Switch
- Off: bg `#44403C`, thumb `#A8A29E`
- On: bg `#CA8A04`, thumb `#0C0A09`
- Size: 44px wide, 24px tall (meets 44px touch target)

### Loading / Skeleton
- Skeleton: bg `#292524`, rounded, animate-pulse
- Spinner: `#CA8A04` border-2, border-t transparent, animate-spin, 20px

### Empty State
- Centered in content area
- Large icon (48px) in `#57534E`
- Heading: 18px 600 `#FAFAF9`
- Description: 14px `#A8A29E`
- CTA button (primary)

### Avatar
- Sizes: 24px (xs), 32px (sm), 40px (md), 64px (lg)
- Default: bg `#CA8A04`, text `#0C0A09`, font-bold, first initial
- Border: 2px `#0C0A09` (for stacking)
- Status dot: 8px circle, positioned bottom-right, border 2px `#0C0A09`

---

## 6. Page Layout Patterns

### Pattern A: Dashboard (stats + grid)
```
┌──────────────────────────────────────────────┐
│ Welcome header + subtitle                     │
├──────┬──────┬──────┬──────┤
│ Stat │ Stat │ Stat │ Stat │  ← grid-cols-4
├──────┴──────┴──────┴──────┤
│ ┌─────────────┐ ┌──────┐ │
│ │ Main panel  │ │ Side │ │  ← grid-cols-3, span-2 + span-1
│ │ (2/3 width) │ │panel │ │
│ └─────────────┘ └──────┘ │
│ ┌──────────────────────┐  │
│ │ Bottom panel (full)  │  │
│ └──────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Pattern B: List / Table page
```
┌──────────────────────────────────────────────┐
│ Page title + [Create] button (right)          │
├──────────────────────────────────────────────┤
│ [Search] [Filter] [Filter]       [View toggle]│
├──────────────────────────────────────────────┤
│ Table header (sticky)                         │
│ Row 1                                         │
│ Row 2                                         │
│ Row 3                                         │
│ ...                                           │
├──────────────────────────────────────────────┤
│ Pagination                                    │
└──────────────────────────────────────────────┘
```

### Pattern C: Chat / Messenger
```
┌──────────────────────────────────────────────┐
│ Agent selector / Contact list (top or left)   │
├──────────────────────────────────────────────┤
│                                               │
│  Message bubbles (scrollable)                 │
│  - User: right-aligned, bg #292524            │
│  - Agent: left-aligned, bg #1C1917            │
│  - Timestamp: 10px mono #57534E               │
│                                               │
├──────────────────────────────────────────────┤
│ [📎] [Message input...              ] [Send]  │
└──────────────────────────────────────────────┘
```

### Pattern D: Detail / Settings page
```
┌──────────────────────────────────────────────┐
│ [Tab1] [Tab2] [Tab3] [Tab4]                   │  ← tabs at top
├──────────────────────────────────────────────┤
│ Section title                                 │
│ ┌──────────────────────┐                      │
│ │ Form field           │                      │
│ │ Form field           │                      │
│ │ Form field           │                      │
│ └──────────────────────┘                      │
│                                [Cancel] [Save]│
└──────────────────────────────────────────────┘
```

### Pattern E: Canvas (NEXUS, SketchVibe)
```
┌──────────────────────────────────────────────┐
│ Toolbar: [Zoom+] [Zoom-] [Fit] [Export]       │
├──────────────────────────────────────────────┤
│                                               │
│           Full-bleed canvas area              │
│           (React Flow / Canvas API)           │
│                                               │
│                            ┌────┐             │
│                            │Mini│ ← minimap   │
│                            │map │             │
│                            └────┘             │
└──────────────────────────────────────────────┘
```

---

## 7. Animation & Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Button hover | background-color | 200ms | ease |
| Card hover | border-color | 200ms | ease |
| Modal enter | opacity + scale | 200ms | ease-out |
| Toast slide | translateY | 200ms | ease-out |
| Sidebar collapse | width | 200ms | ease |
| Tab switch | border + color | 150ms | ease |
| Skeleton pulse | opacity | 1.5s | ease-in-out infinite |
| Status dot | scale | 2s | ease-in-out infinite |

- **prefers-reduced-motion**: disable all animations except opacity fades

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile | < 768px | Single column, no sidebar (hamburger menu), full-width cards |
| Tablet | 768-1023px | Single/two column, sidebar overlay |
| Desktop | >= 1024px | Sidebar visible, multi-column grids |
| Wide | >= 1440px | Content max-width 1160px, centered |

### Mobile-specific
- Sidebar: hidden, trigger via hamburger menu (top-left)
- Top bar: shows hamburger + "CORTHEX" + notification bell
- Stat cards: grid-cols-2 (not 4)
- Tables: horizontal scroll
- Modals: full-screen on mobile

---

## 9. Absolute Rules

### DO
- Use ONLY the hex values listed in this document
- Use DM Sans for all text, JetBrains Mono for numbers/code
- Use Lucide React icons exclusively
- Keep layouts dense — power user tool, not marketing
- Generate CONTENT AREA ONLY — sidebar and topbar are shared
- Use uppercase tracking-widest for section labels
- Test all text/bg pairs for WCAG AA (4.5:1 normal, 3:1 large)

### DON'T
- Generate sidebar, topbar, or navigation inside page content
- Use Material Symbols, Heroicons, or emoji as icons
- Use colors not in this palette (no inline hex that doesn't match)
- Use rounded-full on cards or containers (only avatars, dots, pills)
- Add decorative illustrations or stock photos
- Use more than 2 shadows per card (keep it flat with borders)
- Use gradients (except for chart area fills at 20% opacity)
