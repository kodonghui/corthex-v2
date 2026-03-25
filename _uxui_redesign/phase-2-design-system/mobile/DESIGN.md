# CORTHEX Mobile Design System — Command Theme (Dark)

> Source of truth for Stitch 2 APP mode screen generation.
> Every screen MUST follow these rules exactly. Mobile-first. No desktop patterns.

---

## 1. Visual Identity

**Product**: CORTHEX — AI Virtual Office Management Mobile App
**Personality**: Sleek mission control in your pocket. Fast. Focused. One-hand friendly.
**References**: Toss (Korean mobile UX), Linear mobile (dark mode), Notion mobile (navigation), Slack mobile (bottom tabs)
**NOT this**: Desktop shrunken to fit, horizontal scrolling, tiny text, cluttered

---

## 2. Color Palette (exact hex — same as desktop theme system)

### Primary Colors
| Token | Hex | Mobile Usage |
|-------|-----|-------------|
| `bg` | `#0C0A09` | Full-screen background |
| `surface` | `#1C1917` | Cards, bottom sheets, modals |
| `elevated` | `#292524` | Input fields, nested cards, list items |
| `border` | `#44403C` | Card outlines, dividers |
| `border-strong` | `#57534E` | Active input borders |

### Accent Colors
| Token | Hex | Mobile Usage |
|-------|-----|-------------|
| `accent` | `#CA8A04` | FAB, active bottom tab, CTA buttons |
| `accent-hover` | `#D97706` | Button press state |
| `accent-deep` | `#A16207` | Toggle active |
| `accent-muted` | `#CA8A0419` | Selected list item bg |

### Text Colors
| Token | Hex | Mobile Usage |
|-------|-----|-------------|
| `text-primary` | `#FAFAF9` | Headings, body, list items |
| `text-secondary` | `#A8A29E` | Captions, timestamps, subtitles |
| `text-disabled` | `#57534E` | Placeholders, disabled |
| `text-on-accent` | `#0C0A09` | Text on gold buttons |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Online status dot, success state |
| `warning` | `#EAB308` | Warning badge |
| `error` | `#EF4444` | Error state, destructive actions |
| `info` | `#3B82F6` | Info badge, links |

---

## 3. Typography (Mobile-Optimized Scale)

### Font Families
- **All text**: DM Sans (single family for consistency)
- **Numbers/Code**: JetBrains Mono
- **Korean fallback**: Pretendard, Apple SD Gothic Neo

### Mobile Size Scale
| Name | Size | Line Height | Weight | Mobile Usage |
|------|------|------------|--------|-------------|
| `page-title` | 24px | 32px | 700 | Top of screen, below status bar |
| `section` | 18px | 24px | 600 | Section headers in scrollable content |
| `card-title` | 16px | 22px | 600 | Card headings, list item primary |
| `body` | 14px | 20px | 400 | Body text, descriptions |
| `caption` | 12px | 16px | 400-500 | Timestamps, badges, bottom tab labels |
| `overline` | 10px | 14px | 700 | Section labels (UPPERCASE, tracking-wide) |

### Rules
- NO text smaller than 12px on mobile
- Numbers always JetBrains Mono (costs, stats, IDs)
- Section labels: 10px, UPPERCASE, tracking-widest, `#A8A29E`
- Max line width: ~60 characters for readability

---

## 4. Mobile App Shell

### Status Bar Area
```
┌─────────────────────────────────┐
│  [safe-area-inset-top padding]  │  ← transparent, matches bg color
└─────────────────────────────────┘
```

### Top Navigation Bar (48px height)
```
┌─────────────────────────────────┐
│ ← Back   Page Title    [⋮] [🔔]│  ← 48px height
└─────────────────────────────────┘
```
- Left: Back arrow (if nested) OR hamburger menu
- Center: Page title (16px semibold)
- Right: Action icons (max 2)
- Background: `surface` with bottom border

### Content Area (scrollable)
```
┌─────────────────────────────────┐
│                                 │
│  [Full-width scrollable         │
│   content area]                 │
│                                 │
│  padding: 16px horizontal       │
│  gap: 12px between cards        │
│                                 │
└─────────────────────────────────┘
```

### Bottom Navigation Bar (56px + safe-area)
```
┌─────────────────────────────────┐
│  🏠     📊     💬     👤     ⚙  │  ← 5 tabs max
│  Hub   Dash   Chat  Agents  More│  ← 10px labels
├─────────────────────────────────┤
│  [safe-area-inset-bottom]       │  ← matches bg
└─────────────────────────────────┘
```
- Active tab: icon filled + accent color label
- Inactive tab: icon outline + text-secondary
- Icon size: 24px
- Label: 10px, centered below icon
- Background: `surface` with top border
- Tab items: Hub, Dashboard, Chat, Agents, More (expandable)

### Floating Action Button (FAB)
```
Position: bottom-right, 16px from edge, 16px above bottom nav
Size: 56x56px
Shape: Circle
Color: accent (#CA8A04)
Icon: white 24px (context-dependent: + for create, ✏ for compose)
Shadow: 0 4px 12px rgba(0,0,0,0.4)
```

---

## 5. Component Patterns (Mobile-First)

### Cards (full-width)
```
┌─────────────────────────────────┐
│ Card Title              [badge] │  ← 16px semibold
│ Description text here...        │  ← 14px, text-secondary
│                                 │
│ ┌─────┐ ┌─────┐ ┌─────┐       │  ← stat chips inline
│ │ 24  │ │ 3.2k│ │ 95% │       │
│ │users│ │cost │ │uptime│       │
│ └─────┘ └─────┘ └─────┘       │
└─────────────────────────────────┘
Padding: 16px
Border-radius: 12px
Background: surface
Border: 1px solid border
```

### List Items (swipeable)
```
┌─────────────────────────────────┐
│ [Avatar] Title            [→]   │  ← 52px height min
│          Subtitle · timestamp   │
└─────────────────────────────────┘
Left swipe: Delete (red)
Right swipe: Archive (accent)
Padding: 12px 16px
Divider: 1px border at bottom, indented 60px from left
```

### Bottom Sheet (modal replacement)
```
┌─────────────────────────────────┐
│            ═══                  │  ← drag handle (40x4px, border-strong)
│                                 │
│  Sheet Title          [Close X] │
│  ─────────────────────────────  │
│                                 │
│  Content area (scrollable)      │
│                                 │
│  [Primary Button — Full Width]  │
│  [Secondary — Full Width]       │
│                                 │
│  [safe-area-inset-bottom]       │
└─────────────────────────────────┘
Background: surface
Border-radius: 16px 16px 0 0 (top corners only)
Max height: 90vh
Backdrop: black/50 with backdrop-blur
```

### Form Inputs
```
┌─────────────────────────────────┐
│ Label                           │  ← 12px, text-secondary
│ ┌─────────────────────────────┐ │
│ │ Placeholder text...         │ │  ← 16px (prevents zoom on iOS)
│ └─────────────────────────────┘ │
│ Helper text or error            │  ← 12px
└─────────────────────────────────┘
Height: 48px (touch-friendly)
Font-size: 16px (CRITICAL: prevents iOS auto-zoom)
Border-radius: 8px
Background: elevated
Border: 1px solid border → border-strong on focus
```

### Buttons
```
Primary:   accent bg, text-on-accent, 48px height, full-width on mobile
Secondary: transparent bg, accent border, accent text, 48px height
Danger:    error bg, white text, 48px height
Ghost:     transparent bg, text-primary, 44px min height

All: border-radius 8px, font-weight 600, font-size 14px
Active state: scale(0.97) + darken 10%
```

### Tables → Cards on Mobile
Desktop tables MUST transform to card lists on mobile:
```
Desktop:
| Name | Status | Cost | Actions |

Mobile:
┌─────────────────────────────────┐
│ Name                   [Status] │
│ Cost: $1,234                    │
│ [Edit] [Delete]                 │
└─────────────────────────────────┘
```

---

## 6. Layout Patterns

### Pattern 1: Stats Overview (Dashboard, Hub)
```
┌─────────────────────────────────┐
│  Total Agents    ▲ 12%          │  ← horizontal scroll stat cards
│  24                             │
└─────────────────────────────────┘
← swipe for more stats →

┌─────────────────────────────────┐
│ RECENT ACTIVITY                 │
│ ┌───────────────────────────── │
│ │ [avatar] Agent completed job │
│ │          2 min ago           │
│ ├───────────────────────────── │
│ │ [avatar] New employee added  │
│ │          5 min ago           │
│ └───────────────────────────── │
└─────────────────────────────────┘
```

### Pattern 2: List + Detail (Agents, Employees, Jobs)
```
List view (default):
┌─────────────────────────────────┐
│ Search...                  [🔍] │
│ ┌─ Filter chips ──────────────┐ │
│ │ All  Active  Pending  Idle  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌───────────────────────────── │
│ │ [icon] Agent Name    Active │ │
│ │        Tier 3 · Dept: Sales │ │
│ ├───────────────────────────── │
│ │ [icon] Agent Name    Idle   │ │
│ │        Tier 2 · Dept: Dev   │ │
│ └───────────────────────────── │
└─────────────────────────────────┘

Detail view (tap item → full screen push):
┌─────────────────────────────────┐
│ ← Back    Agent Name       [⋮] │
│                                 │
│  [Large avatar/icon center]     │
│  Agent Name                     │
│  Active · Tier 3                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Overview  Tasks  History    │ │  ← tab bar
│ └─────────────────────────────┘ │
│                                 │
│ [Tab content scrollable]        │
└─────────────────────────────────┘
```

### Pattern 3: Chat/Messenger
```
┌─────────────────────────────────┐
│ ← Back    Chat Room        [⋮] │
│                                 │
│  [Messages scrollable area]     │
│                                 │
│  ┌─ them ────────────────────┐  │
│  │ Message bubble            │  │
│  └───────────────────────────┘  │
│                                 │
│         ┌── you ─────────────┐  │
│         │ Message bubble     │  │
│         └────────────────────┘  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [+] Type a message...  [→] │ │  ← input bar, 48px
│ └─────────────────────────────┘ │
│ [safe-area-inset-bottom]        │
└─────────────────────────────────┘
```

### Pattern 4: Settings (grouped list)
```
┌─────────────────────────────────┐
│ Settings                        │
│                                 │
│ APPEARANCE                      │  ← overline section label
│ ┌───────────────────────────── │
│ │ Theme              Command → │ │
│ ├───────────────────────────── │
│ │ Language           한국어   → │ │
│ └───────────────────────────── │
│                                 │
│ NOTIFICATIONS                   │
│ ┌───────────────────────────── │
│ │ Push Notifications    [  ○] │ │  ← toggle switch
│ ├───────────────────────────── │
│ │ Email Alerts          [○  ] │ │
│ └───────────────────────────── │
└─────────────────────────────────┘
```

### Pattern 5: Form / Create (full screen)
```
┌─────────────────────────────────┐
│ Cancel    Create Agent    Save  │  ← sticky header
│ ─────────────────────────────── │
│                                 │
│ Name                            │
│ ┌─────────────────────────────┐ │
│ │                             │ │  ← 48px input
│ └─────────────────────────────┘ │
│                                 │
│ Department                      │
│ ┌─────────────────────────────┐ │
│ │ Select...               ▾  │ │  ← opens bottom sheet
│ └─────────────────────────────┘ │
│                                 │
│ Description                     │
│ ┌─────────────────────────────┐ │
│ │                             │ │  ← textarea, 120px
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      Create Agent           │ │  ← primary button, sticky bottom
│ └─────────────────────────────┘ │
│ [safe-area-inset-bottom]        │
└─────────────────────────────────┘
```

---

## 7. Animations & Transitions

### Mobile-Specific
- Page transition: slide-left (push) / slide-right (pop), 250ms ease
- Bottom sheet: slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1)
- Tab switch: crossfade 150ms
- Card tap: scale(0.97) 50ms → scale(1) 100ms
- Pull-to-refresh: rubber-band physics
- Swipe-to-delete: translateX with snap

### Respect prefers-reduced-motion
All animations disabled when user prefers reduced motion.

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile S | 320px | Minimum supported. Single column. |
| Mobile M | 375px | Default mobile. Single column. |
| Mobile L | 414px | Single column, slightly more padding. |
| Tablet | 768px | Two-column cards. Side panel possible. |

### Rules
- **Mobile (< 768px)**: Single column, bottom nav, full-width cards, bottom sheets
- **Tablet (>= 768px)**: May show 2-column, sidebar can appear, modals instead of sheets
- All screens MUST work at 320px minimum width
- Safe area insets MUST be respected (notch, home indicator)

---

## 9. Generation Rules for Stitch 2

1. **MOBILE APP SCREENS ONLY** — Generate as mobile app screens (390x844 viewport)
2. **NO sidebar** — Bottom navigation handles all navigation
3. **NO desktop top bar** — Use mobile top navigation bar (48px)
4. **CONTENT AREA ONLY** — Do not generate bottom nav or status bar (shared shell)
5. **Full-width cards** — No multi-column layouts on mobile
6. **Touch-friendly** — All interactive elements minimum 44x44px
7. **16px font minimum for inputs** — Prevents iOS zoom
8. **Safe area padding** — env(safe-area-inset-*) where applicable
9. **Single scroll direction** — Vertical main scroll, horizontal only for carousels
10. **Bottom-anchored actions** — Primary buttons stick to bottom on forms
