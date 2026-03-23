# CORTHEX v3 — Theme Accessibility Audit

**Phase:** 4-Themes, Step 4-2
**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 4 Themes)
**Input:** Archetypal Themes (Step 4-1), Design Tokens (Phase 3, Step 3-1), Accessibility Compliance Plugin, WCAG 2.1 AA Standard
**Target Grade:** B (avg >= 7.0)

---

## Audit Methodology

### Standards Applied
- **WCAG 2.1 Level AA** — the compliance target for all CORTHEX themes
- **WCAG 2.2** enhanced requirements noted where applicable (focus appearance, target size)

### Contrast Calculation — Piecewise sRGB Linearization
All contrast ratios calculated using the **correct WCAG piecewise sRGB formula** (not the simplified gamma-2.2 approximation):

```
For each channel C in {R, G, B}:
  sRGB = C / 255
  if sRGB <= 0.04045:
    linear = sRGB / 12.92
  else:
    linear = ((sRGB + 0.055) / 1.055) ^ 2.4

L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear

Contrast Ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

All ratios verified by Python script using this exact formula. No approximations.

### Pass/Fail Criteria

| Criterion | WCAG SC | Threshold |
|-----------|---------|-----------|
| Normal text contrast (< 18pt / < 14pt bold) | 1.4.3 AA | >= 4.5:1 |
| Large text contrast (>= 18pt / >= 14pt bold) | 1.4.3 AA | >= 3.0:1 |
| UI component boundary contrast | 1.4.11 AA | >= 3.0:1 |
| Focus indicator contrast | 1.4.11 AA | >= 3.0:1 |
| Non-text contrast (icons, graphs) | 1.4.11 AA | >= 3.0:1 |

---

## Theme 1: "Sovereign Command" (Ruler + Emperor)

### 1.1 Text Contrast Ratios

| Pair | Foreground | Background | Ratio | Req | Result |
|------|-----------|-----------|-------|-----|--------|
| Primary text on bg | `#e4e4e7` on `#18181b` | — | **13.96:1** | 4.5:1 | PASS |
| Primary text on surface | `#e4e4e7` on `#27272a` | — | **11.74:1** | 4.5:1 | PASS |
| Secondary text on bg | `#a1a1aa` on `#18181b` | — | **6.91:1** | 4.5:1 | PASS |
| Secondary text on surface | `#a1a1aa` on `#27272a` | — | **5.81:1** | 4.5:1 | PASS |
| Tertiary text on bg | `#8d8d96` on `#18181b` | — | **5.38:1** | 4.5:1 | PASS |
| Tertiary text on surface | `#8d8d96` on `#27272a` | — | **4.53:1** | 4.5:1 | PASS |
| Disabled text on bg | `#52525b` on `#18181b` | — | **2.29:1** | N/A | N/A (decorative) |
| Text on accent (dark on gold) | `#18181b` on `#eab308` | — | **9.24:1** | 4.5:1 | PASS |
| Text on accent hover | `#18181b` on `#ca8a04` | — | **6.03:1** | 4.5:1 | PASS |
| Chrome text on chrome | `#d4d4d8` on `#09090b` | — | **13.46:1** | 4.5:1 | PASS |
| Accent on bg | `#eab308` on `#18181b` | — | **9.24:1** | 4.5:1 | PASS |
| Accent secondary on bg | `#c97c15` on `#18181b` | — | **5.38:1** | 4.5:1 | PASS |
| Accent secondary on surface | `#c97c15` on `#27272a` | — | **4.52:1** | 4.5:1 | PASS |

### 1.2 Semantic Color Contrast

| Semantic | Hex | On `#18181b` bg | On `#27272a` surface | Result |
|----------|-----|----------------|---------------------|--------|
| Success | `#22c55e` | **7.78:1** | **6.54:1** | PASS |
| Warning | `#f59e0b` | **8.25:1** | **6.94:1** | PASS |
| Error | `#f87171` | **6.40:1** | **5.38:1** | PASS |
| Info | `#60a5fa` | **6.97:1** | **5.86:1** | PASS |
| Handoff | `#c084fc` | **6.70:1** | **5.64:1** | PASS |

### 1.3 UI Component Contrast (WCAG 1.4.11)

| Component | Color | Against | Ratio | Req | Result |
|-----------|-------|---------|-------|-----|--------|
| Input border | `#71717a` | `#27272a` surface | **3.08:1** | 3.0:1 | PASS |
| Input border | `#71717a` | `#18181b` bg | **3.67:1** | 3.0:1 | PASS |
| Focus ring on bg | `#eab308` | `#18181b` | **9.24:1** | 3.0:1 | PASS |
| Focus ring on surface | `#eab308` | `#27272a` | **7.77:1** | 3.0:1 | PASS |
| Focus ring on chrome | `#eab308` | `#09090b` | **10.37:1** | 3.0:1 | PASS |
| Card border (decorative) | `#3f3f46` | `#18181b` | **1.70:1** | N/A | N/A (decorative — shadow provides z-order) |

### 1.4 Focus Indicators

| Context | Indicator | Color | Against | Ratio | Result |
|---------|-----------|-------|---------|-------|--------|
| Light bg elements | 2px ring | `#eab308` | `#18181b` | **9.24:1** | PASS |
| Surface elements | 2px ring | `#eab308` | `#27272a` | **7.77:1** | PASS |
| Chrome elements | 2px ring | `#eab308` | `#09090b` | **10.37:1** | PASS |
| Ring offset | 2px gap | — | — | — | Visible gap |

### 1.5 Color-Not-Sole-Information (WCAG 1.4.1)

| Context | Color Used | Additional Indicator | Result |
|---------|-----------|---------------------|--------|
| Success status | `#22c55e` | `CheckCircle` icon + "Online" text | PASS |
| Error status | `#f87171` | `AlertCircle` icon + error message text | PASS |
| Warning status | `#f59e0b` | `AlertTriangle` icon + warning text | PASS |
| Active nav | Gold tint bg | `aria-current="page"` + bg highlight + bold text | PASS |
| Chart series | 6 colors | Pattern fills required for >3 series | PASS |

### 1.6 Reduced Motion

All animations follow the global `prefers-reduced-motion` override (§5.4 of design tokens). **PASS.**

### 1.7 Touch Targets (WCAG 2.5.8)

Shared spacing tokens apply (all themes use identical layout dimensions). **PASS.**

| Element | Size | Requirement (AA) | Result |
|---------|------|------------------|--------|
| Buttons | 44px height | >= 44px | PASS |
| Nav items (desktop) | 36px height | >= 24px (AA) | PASS |
| Nav items (mobile) | 44px height | >= 44px | PASS |
| Bottom nav tabs | 56px height | >= 44px | PASS |

### 1.8 Forced Colors (Windows High Contrast)

Shared forced-colors fallbacks apply. **PASS.**

### Theme 1 Verdict

| Criterion | Status |
|-----------|--------|
| Text contrast | **PASS** |
| Semantic contrast | **PASS** |
| UI component contrast | **PASS** |
| Focus indicators | **PASS** |
| Color-not-sole-info | **PASS** |
| Reduced motion | **PASS** |
| Touch targets | **PASS** |
| Forced colors | **PASS** |

**Overall: FULL PASS**

---

## Theme 2: "Guardian Harmony" (Caregiver + Temperance)

### 2.1 Text Contrast Ratios

| Pair | Foreground | Background | Ratio | Req | Result |
|------|-----------|-----------|-------|-----|--------|
| Primary text on bg | `#0f172a` on `#f0f9ff` | — | **16.75:1** | 4.5:1 | PASS |
| Primary text on surface | `#0f172a` on `#e0f2fe` | — | **15.56:1** | 4.5:1 | PASS |
| Secondary text on bg | `#475569` on `#f0f9ff` | — | **7.11:1** | 4.5:1 | PASS |
| Secondary text on surface | `#475569` on `#e0f2fe` | — | **6.60:1** | 4.5:1 | PASS |
| Tertiary text on bg | `#5e6e85` on `#f0f9ff` | — | **4.87:1** | 4.5:1 | PASS |
| Tertiary text on surface | `#5e6e85` on `#e0f2fe` | — | **4.52:1** | 4.5:1 | PASS |
| Disabled text on bg | `#94a3b8` on `#f0f9ff` | — | **2.68:1** | N/A | N/A (decorative) |
| White on accent (blue btn) | `#ffffff` on `#2563eb` | — | **5.17:1** | 4.5:1 | PASS |
| White on accent hover | `#ffffff` on `#1d4ed8` | — | **6.70:1** | 4.5:1 | PASS |
| Chrome text on chrome | `#bfdbfe` on `#1e3a5f` | — | **8.10:1** | 4.5:1 | PASS |
| Accent on bg | `#2563eb` on `#f0f9ff` | — | **4.85:1** | 4.5:1 | PASS |
| Accent secondary on bg | `#b25000` on `#f0f9ff` | — | **4.88:1** | 4.5:1 | PASS |
| Accent secondary on surface | `#b25000` on `#e0f2fe` | — | **4.53:1** | 4.5:1 | PASS |

### 2.2 Semantic Color Contrast

| Semantic | Hex | On `#f0f9ff` bg | On `#e0f2fe` surface | Result |
|----------|-----|----------------|---------------------|--------|
| Success | `#127d3a` | **4.90:1** | **4.55:1** | PASS |
| Warning | `#b15006` | **4.90:1** | **4.55:1** | PASS |
| Error | `#d51f1f` | **4.87:1** | **4.52:1** | PASS |
| Info | `#2563eb` | **4.85:1** | **4.50:1** | PASS |
| Handoff | `#7c3aed` | **5.35:1** | **4.97:1** | PASS |

### 2.3 UI Component Contrast (WCAG 1.4.11)

| Component | Color | Against | Ratio | Req | Result |
|-----------|-------|---------|-------|-----|--------|
| Input border | `#6b7280` | `#e0f2fe` surface | **4.21:1** | 3.0:1 | PASS |
| Input border | `#6b7280` | `#f0f9ff` bg | **4.54:1** | 3.0:1 | PASS |
| Focus ring on bg | `#2563eb` | `#f0f9ff` | **4.85:1** | 3.0:1 | PASS |
| Focus ring on surface | `#2563eb` | `#e0f2fe` | **4.50:1** | 3.0:1 | PASS |
| Focus ring on chrome | `#93c5fd` | `#1e3a5f` | **6.38:1** | 3.0:1 | PASS |
| Card border (decorative) | `#bfdbfe` | `#f0f9ff` | **1.34:1** | N/A | N/A (decorative) |

### 2.4 Focus Indicators

| Context | Color | Against | Ratio | Result |
|---------|-------|---------|-------|--------|
| On bg | `#2563eb` | `#f0f9ff` | **4.85:1** | PASS |
| On surface | `#2563eb` | `#e0f2fe` | **4.50:1** | PASS |
| On chrome | `#93c5fd` | `#1e3a5f` | **6.38:1** | PASS |

### 2.5 Color-Not-Sole-Information

| Context | Additional Indicator | Result |
|---------|---------------------|--------|
| Success status | `CheckCircle` icon + text | PASS |
| Error status | `AlertCircle` icon + text | PASS |
| Warning status | `AlertTriangle` icon + text | PASS |
| Active nav | bg highlight + `aria-current` + bold | PASS |
| Guidance badge (gold) | `Lightbulb` icon + text label | PASS |
| Chart series | Pattern fills for >3 series | PASS |

### 2.6–2.8 Reduced Motion / Touch Targets / Forced Colors

Shared tokens and CSS. **PASS** (all three).

### Theme 2 Verdict

| Criterion | Status |
|-----------|--------|
| Text contrast | **PASS** |
| Semantic contrast | **PASS** |
| UI component contrast | **PASS** |
| Focus indicators | **PASS** |
| Color-not-sole-info | **PASS** |
| Reduced motion | **PASS** |
| Touch targets | **PASS** |
| Forced colors | **PASS** |

**Overall: FULL PASS**

---

## Theme 3: "Obsidian Forge" (Creator + Magician)

### 3.1 Text Contrast Ratios

| Pair | Foreground | Background | Ratio | Req | Result |
|------|-----------|-----------|-------|-----|--------|
| Primary text on bg | `#e2e8f0` on `#0f172a` | — | **14.48:1** | 4.5:1 | PASS |
| Primary text on surface | `#e2e8f0` on `#1e1b4b` | — | **12.97:1** | 4.5:1 | PASS |
| Secondary text on bg | `#94a3b8` on `#0f172a` | — | **6.96:1** | 4.5:1 | PASS |
| Secondary text on surface | `#94a3b8` on `#1e1b4b` | — | **6.24:1** | 4.5:1 | PASS |
| Tertiary text on bg | `#7a8aa1` on `#0f172a` | — | **5.08:1** | 4.5:1 | PASS |
| Tertiary text on surface | `#7a8aa1` on `#1e1b4b` | — | **4.55:1** | 4.5:1 | PASS |
| Disabled text on bg | `#475569` on `#0f172a` | — | **2.37:1** | N/A | N/A (decorative) |
| Dark text on accent (btn) | `#0f172a` on `#a855f7` | — | **4.51:1** | 4.5:1 | PASS |
| Dark text on accent hover | `#0f172a` on `#b97cf8` | — | **6.21:1** | 4.5:1 | PASS |
| Chrome text on chrome | `#c4b5fd` on `#0c0a1e` | — | **10.55:1** | 4.5:1 | PASS |
| Accent on bg | `#a855f7` on `#0f172a` | — | **4.51:1** | 4.5:1 | PASS |
| Accent secondary on bg | `#c084fc` on `#0f172a` | — | **6.76:1** | 4.5:1 | PASS |
| Accent secondary on surface | `#c084fc` on `#1e1b4b` | — | **6.05:1** | 4.5:1 | PASS |

> **Note:** Obsidian Forge uses **dark text on bright accent** (like Stellar Horizon uses dark text on cyan). The bright `#a855f7` violet creates an excellent dark-text contrast (4.51:1) whereas white-on-accent would fail (3.96:1). Hover brightens to `#b97cf8` for even better contrast (6.21:1).

### 3.2 Semantic Color Contrast

| Semantic | Hex | On `#0f172a` bg | On `#1e1b4b` surface | Result |
|----------|-----|----------------|---------------------|--------|
| Success | `#4ade80` | **10.25:1** | **9.17:1** | PASS |
| Warning | `#fbbf24` | **10.69:1** | **9.58:1** | PASS |
| Error | `#f87171` | **6.45:1** | **5.78:1** | PASS |
| Info | `#60a5fa` | **7.02:1** | **6.29:1** | PASS |
| Handoff | `#c084fc` | **6.76:1** | **6.05:1** | PASS |

### 3.3 UI Component Contrast (WCAG 1.4.11)

| Component | Color | Against | Ratio | Req | Result |
|-----------|-------|---------|-------|-----|--------|
| Input border | `#6366f1` | `#1e1b4b` surface | **3.58:1** | 3.0:1 | PASS |
| Input border | `#6366f1` | `#0f172a` bg | **4.00:1** | 3.0:1 | PASS |
| Focus ring on bg | `#c084fc` | `#0f172a` | **6.76:1** | 3.0:1 | PASS |
| Focus ring on surface | `#c084fc` | `#1e1b4b` | **6.05:1** | 3.0:1 | PASS |
| Focus ring on chrome | `#c4b5fd` | `#0c0a1e` | **10.55:1** | 3.0:1 | PASS |
| Card border (decorative) | `#312e81` | `#0f172a` | **1.76:1** | N/A | N/A (decorative — shadow provides z-order) |

> **Note:** Focus ring uses `--accent-secondary` (`#c084fc`) instead of `--accent` (`#a855f7`) because `#a855f7` on surface `#1e1b4b` = 4.04:1 (passes UI 3:1 but doesn't provide maximum visibility). The lighter `#c084fc` at 6.05:1 gives clearer focus indication.

### 3.4 Focus Indicators

| Context | Color | Against | Ratio | Result |
|---------|-------|---------|-------|--------|
| On bg | `#c084fc` | `#0f172a` | **6.76:1** | PASS |
| On surface | `#c084fc` | `#1e1b4b` | **6.05:1** | PASS |
| On chrome | `#c4b5fd` | `#0c0a1e` | **10.55:1** | PASS |

### 3.5 Color-Not-Sole-Information

| Context | Additional Indicator | Result |
|---------|---------------------|--------|
| Success status | `CheckCircle` icon + text | PASS |
| Error status | `AlertCircle` icon + text | PASS |
| Warning status | `AlertTriangle` icon + text | PASS |
| Active nav | Purple tint bg + `aria-current` + bold | PASS |
| Creation progress | Pulse dot + text label | PASS |
| Chart series | Pattern fills for >3 series | PASS |

### 3.6–3.8 Reduced Motion / Touch Targets / Forced Colors

Shared tokens and CSS. **PASS** (all three).

### Theme 3 Verdict

| Criterion | Status |
|-----------|--------|
| Text contrast | **PASS** |
| Semantic contrast | **PASS** |
| UI component contrast | **PASS** |
| Focus indicators | **PASS** |
| Color-not-sole-info | **PASS** |
| Reduced motion | **PASS** |
| Touch targets | **PASS** |
| Forced colors | **PASS** |

**Overall: FULL PASS**

---

## Theme 4: "Sacred Trust" (Sage + Hierophant)

### 4.1 Text Contrast Ratios

| Pair | Foreground | Background | Ratio | Req | Result |
|------|-----------|-----------|-------|-----|--------|
| Primary text on bg | `#1c1917` on `#fafaf9` | — | **16.74:1** | 4.5:1 | PASS |
| Primary text on surface | `#1c1917` on `#f5f5f4` | — | **16.03:1** | 4.5:1 | PASS |
| Secondary text on bg | `#57534e` on `#fafaf9` | — | **7.30:1** | 4.5:1 | PASS |
| Secondary text on surface | `#57534e` on `#f5f5f4` | — | **6.99:1** | 4.5:1 | PASS |
| Tertiary text on bg | `#766f6a` on `#fafaf9` | — | **4.73:1** | 4.5:1 | PASS |
| Tertiary text on surface | `#766f6a` on `#f5f5f4` | — | **4.53:1** | 4.5:1 | PASS |
| Disabled text on bg | `#a8a29e` on `#fafaf9` | — | **2.54:1** | N/A | N/A (decorative) |
| White on accent (blue btn) | `#ffffff` on `#1d4ed8` | — | **6.70:1** | 4.5:1 | PASS |
| White on accent hover | `#ffffff` on `#1e40af` | — | **8.72:1** | 4.5:1 | PASS |
| Chrome text on chrome | `#cbd5e1` on `#1e293b` | — | **9.85:1** | 4.5:1 | PASS |
| Accent on bg | `#1d4ed8` on `#fafaf9` | — | **6.42:1** | 4.5:1 | PASS |
| Accent secondary on bg | `#b45309` on `#fafaf9` | — | **4.81:1** | 4.5:1 | PASS |
| Accent secondary on surface | `#b45309` on `#f5f5f4` | — | **4.60:1** | 4.5:1 | PASS |

### 4.2 Semantic Color Contrast

| Semantic | Hex | On `#fafaf9` bg | On `#f5f5f4` surface | Result |
|----------|-----|----------------|---------------------|--------|
| Success | `#15803d` | **4.80:1** | **4.60:1** | PASS |
| Warning | `#b45309` | **4.81:1** | **4.60:1** | PASS |
| Error | `#da2424` | **4.72:1** | **4.52:1** | PASS |
| Info | `#1d4ed8` | **6.42:1** | **6.14:1** | PASS |
| Handoff | `#7c3aed` | **5.46:1** | **5.22:1** | PASS |

### 4.3 UI Component Contrast (WCAG 1.4.11)

| Component | Color | Against | Ratio | Req | Result |
|-----------|-------|---------|-------|-----|--------|
| Input border | `#78716c` | `#f5f5f4` surface | **4.40:1** | 3.0:1 | PASS |
| Input border | `#78716c` | `#fafaf9` bg | **4.59:1** | 3.0:1 | PASS |
| Focus ring on bg | `#1d4ed8` | `#fafaf9` | **6.42:1** | 3.0:1 | PASS |
| Focus ring on surface | `#1d4ed8` | `#f5f5f4` | **6.14:1** | 3.0:1 | PASS |
| Focus ring on chrome | `#93c5fd` | `#1e293b` | **8.11:1** | 3.0:1 | PASS |
| Card border (decorative) | `#d6d3d1` | `#fafaf9` | **1.18:1** | N/A | N/A (decorative) |

### 4.4 Focus Indicators

| Context | Color | Against | Ratio | Result |
|---------|-------|---------|-------|--------|
| On bg | `#1d4ed8` | `#fafaf9` | **6.42:1** | PASS |
| On surface | `#1d4ed8` | `#f5f5f4` | **6.14:1** | PASS |
| On chrome | `#93c5fd` | `#1e293b` | **8.11:1** | PASS |

### 4.5 Color-Not-Sole-Information

| Context | Additional Indicator | Result |
|---------|---------------------|--------|
| Success status | `CheckCircle` icon + text | PASS |
| Error status | `AlertCircle` icon + text | PASS |
| Warning status | `AlertTriangle` icon + text | PASS |
| Important marker (gold) | `border-l-4` + `AlertTriangle` icon + text | PASS |
| Active nav | bg highlight + `aria-current` + bold | PASS |
| Chart series | Pattern fills for >3 series | PASS |

### 4.6–4.8 Reduced Motion / Touch Targets / Forced Colors

Shared tokens and CSS. **PASS** (all three).

### Theme 4 Verdict

| Criterion | Status |
|-----------|--------|
| Text contrast | **PASS** |
| Semantic contrast | **PASS** |
| UI component contrast | **PASS** |
| Focus indicators | **PASS** |
| Color-not-sole-info | **PASS** |
| Reduced motion | **PASS** |
| Touch targets | **PASS** |
| Forced colors | **PASS** |

**Overall: FULL PASS**

---

## Theme 5: "Stellar Horizon" (Explorer + Star)

### 5.1 Text Contrast Ratios

| Pair | Foreground | Background | Ratio | Req | Result |
|------|-----------|-----------|-------|-----|--------|
| Primary text on bg | `#e0f2fe` on `#0c1222` | — | **16.26:1** | 4.5:1 | PASS |
| Primary text on surface | `#e0f2fe` on `#162032` | — | **14.22:1** | 4.5:1 | PASS |
| Secondary text on bg | `#7dd3fc` on `#0c1222` | — | **11.19:1** | 4.5:1 | PASS |
| Secondary text on surface | `#7dd3fc` on `#162032` | — | **9.79:1** | 4.5:1 | PASS |
| Tertiary text on bg | `#38bdf8` on `#0c1222` | — | **8.71:1** | 4.5:1 | PASS |
| Tertiary text on surface | `#38bdf8` on `#162032` | — | **7.62:1** | 4.5:1 | PASS |
| Disabled text on bg | `#1e3a5f` on `#0c1222` | — | **2.02:1** | N/A | N/A (decorative) |
| Dark text on accent (btn) | `#0c1222` on `#38bdf8` | — | **8.71:1** | 4.5:1 | PASS |
| Dark text on accent hover | `#0c1222` on `#0ea5e9` | — | **6.73:1** | 4.5:1 | PASS |
| Chrome text on chrome | `#7dd3fc` on `#071528` | — | **10.98:1** | 4.5:1 | PASS |
| Accent on bg | `#38bdf8` on `#0c1222` | — | **8.71:1** | 4.5:1 | PASS |
| Accent secondary on bg | `#2dd4bf` on `#0c1222` | — | **10.03:1** | 4.5:1 | PASS |
| Accent secondary on surface | `#2dd4bf` on `#162032` | — | **8.78:1** | 4.5:1 | PASS |

### 5.2 Semantic Color Contrast

| Semantic | Hex | On `#0c1222` bg | On `#162032` surface | Result |
|----------|-----|----------------|---------------------|--------|
| Success | `#4ade80` | **10.71:1** | **9.37:1** | PASS |
| Warning | `#fbbf24` | **11.18:1** | **9.78:1** | PASS |
| Error | `#fb7185` | **6.93:1** | **6.06:1** | PASS |
| Info | `#38bdf8` | **8.71:1** | **7.62:1** | PASS |
| Handoff | `#c084fc` | **7.06:1** | **6.18:1** | PASS |

### 5.3 UI Component Contrast (WCAG 1.4.11)

| Component | Color | Against | Ratio | Req | Result |
|-----------|-------|---------|-------|-----|--------|
| Input border | `#38bdf8` | `#162032` surface | **7.62:1** | 3.0:1 | PASS |
| Input border | `#38bdf8` | `#0c1222` bg | **8.71:1** | 3.0:1 | PASS |
| Focus ring on bg | `#38bdf8` | `#0c1222` | **8.71:1** | 3.0:1 | PASS |
| Focus ring on surface | `#38bdf8` | `#162032` | **7.62:1** | 3.0:1 | PASS |
| Focus ring on chrome | `#7dd3fc` | `#071528` | **10.98:1** | 3.0:1 | PASS |

### 5.4 Focus Indicators

| Context | Color | Against | Ratio | Result |
|---------|-------|---------|-------|--------|
| On bg | `#38bdf8` | `#0c1222` | **8.71:1** | PASS |
| On surface | `#38bdf8` | `#162032` | **7.62:1** | PASS |
| On chrome | `#7dd3fc` | `#071528` | **10.98:1** | PASS |

### 5.5 Color-Not-Sole-Information

| Context | Additional Indicator | Result |
|---------|---------------------|--------|
| Success status | `CheckCircle` icon + text | PASS |
| Error status | `AlertCircle` icon + text | PASS |
| Warning status | `AlertTriangle` icon + text | PASS |
| Active nav | Cyan tint bg + `aria-current` + bold | PASS |
| Breadcrumb current | `aria-current="page"` + bold + accent color | PASS |
| Chart series | Pattern fills for >3 series | PASS |

### 5.6–5.8 Reduced Motion / Touch Targets / Forced Colors

Shared tokens and CSS. **PASS** (all three).

### Theme 5 Verdict

| Criterion | Status |
|-----------|--------|
| Text contrast | **PASS** |
| Semantic contrast | **PASS** |
| UI component contrast | **PASS** |
| Focus indicators | **PASS** |
| Color-not-sole-info | **PASS** |
| Reduced motion | **PASS** |
| Touch targets | **PASS** |
| Forced colors | **PASS** |

**Overall: FULL PASS**

---

## Cross-Theme Summary

### Pass/Fail Matrix

| Criterion | Sovereign Command | Guardian Harmony | Obsidian Forge | Sacred Trust | Stellar Horizon |
|-----------|:-:|:-:|:-:|:-:|:-:|
| **1.4.3 Text Contrast** | PASS | PASS | PASS | PASS | PASS |
| **1.4.1 Color-Not-Sole-Info** | PASS | PASS | PASS | PASS | PASS |
| **1.4.11 Non-Text Contrast** | PASS | PASS | PASS | PASS | PASS |
| **1.4.11 Focus Indicators** | PASS | PASS | PASS | PASS | PASS |
| **2.3.3 Reduced Motion** | PASS | PASS | PASS | PASS | PASS |
| **2.5.8 Touch Targets** | PASS | PASS | PASS | PASS | PASS |
| **Forced Colors** | PASS | PASS | PASS | PASS | PASS |
| **Overall** | **PASS** | **PASS** | **PASS** | **PASS** | **PASS** |

### Color Corrections Applied (vs. Initial Draft)

| # | Theme | Token | Before | After | Reason |
|---|-------|-------|--------|-------|--------|
| 1 | T1 Sovereign Command | `--text-tertiary` | `#71717a` (3.67:1) | `#8d8d96` (5.38/4.53) | Failed AA normal text |
| 2 | T1 Sovereign Command | `--accent-secondary` | `#a16207` (3.60:1) | `#c97c15` (5.38/4.52) | Failed AA normal text |
| 3 | T1 Sovereign Command | `--error` | `#ef4444` (3.96:1 srf) | `#f87171` (6.40/5.38) | Failed on surface |
| 4 | T2 Guardian Harmony | `--text-tertiary` | `#64748b` (4.46/4.15) | `#5e6e85` (4.87/4.52) | Failed on surface |
| 5 | T2 Guardian Harmony | `--accent-secondary` | `#d97706` (2.99:1!) | `#b25000` (4.88/4.53) | **Critical fail** on bg |
| 6 | T2 Guardian Harmony | `--success` | `#15803d` (4.37 srf) | `#127d3a` (4.90/4.55) | Failed on surface |
| 7 | T2 Guardian Harmony | `--warning` | `#b45309` (4.38 srf) | `#b15006` (4.90/4.55) | Failed on surface |
| 8 | T2 Guardian Harmony | `--error` | `#dc2626` (4.21 srf) | `#d51f1f` (4.87/4.52) | Failed on surface |
| 9 | T3 Obsidian Forge | `--text-tertiary` | `#64748b` (3.75/3.36) | `#7a8aa1` (5.08/4.55) | Failed on both |
| 10 | T3 Obsidian Forge | `--text-on-accent` | `#ffffff` (3.96:1!) | `#0f172a` (4.51:1) | White on `#a855f7` fails |
| 11 | T3 Obsidian Forge | `--accent-hover` | `#9333ea` | `#b97cf8` | Lighter hover for dark-text approach |
| 12 | T3 Obsidian Forge | `--focus` | `#a855f7` | `#c084fc` (6.76/6.05) | Better focus visibility |
| 13 | T4 Sacred Trust | `--text-tertiary` | `#78716c` (4.59/4.40) | `#766f6a` (4.73/4.53) | Failed on surface |
| 14 | T4 Sacred Trust | `--error` | `#dc2626` (4.43 srf) | `#da2424` (4.72/4.52) | Failed on surface |

> **Root cause:** Initial draft used simplified gamma-2.2 linearization `(C/255)^2.2` instead of the correct WCAG piecewise sRGB formula. The simplified formula systematically overestimates contrast ratios, particularly for mid-tone colors (which is exactly where tertiary text and amber accents live). All ratios above are now computed with the correct piecewise formula.

---

## Shared Accessibility Properties (All Themes)

The following accessibility features are theme-independent and verified once:

### Keyboard Navigation
- All interactive elements are focusable via Tab
- Focus order follows visual layout (left-to-right, top-to-bottom)
- Skip-to-content link as first focusable element
- Sidebar: arrow-key navigation between items
- Modal focus trap: Tab cycles within open dialog, Escape closes

### Screen Reader Landmarks
- `<nav>` — sidebar navigation
- `<main>` — content area
- `<aside>` — secondary panels
- `<header>` — topbar
- Heading hierarchy: no skipped levels, single `<h1>` per page

### ARIA Patterns
- Dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
- Live regions: `aria-live="polite"` for notifications, `aria-live="assertive"` for errors
- Status indicators: `aria-label` on icon-only elements
- Active navigation: `aria-current="page"`

### Reduced Motion (Global)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Forced Colors (Global)
```css
@media (forced-colors: active) {
  .sidebar { border-right: 1px solid ButtonText; }
  .card { border: 1px solid ButtonText; }
  .sidebar-zone-b { border-top-color: ButtonText; }
  .bottom-sheet { border-top: 2px solid ButtonText; }
  button { border: 1px solid ButtonText; }
  input, select, textarea { border: 1px solid ButtonText; }
  [data-focus-visible] { outline: 2px solid Highlight; }
}
```

### Touch Targets (Global)
| Element | Minimum Size | WCAG Level |
|---------|-------------|------------|
| Buttons | 44px height | AAA |
| Desktop nav items | 36px height | AA |
| Mobile nav items | 44px height | AAA |
| Bottom nav tabs | 56px height | AAA |
| FAB | 56px diameter | AAA |

---

*End of Theme Accessibility Audit — Phase 4-Themes, Step 4-2*
