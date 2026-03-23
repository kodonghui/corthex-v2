# Part 3: Motion (motiondivision/motion) -- Deep Dive for Corthex v2

> **Library**: [Motion](https://motion.dev/) (formerly Framer Motion)
> **Version**: 12.38.0 (latest, March 2026)
> **License**: MIT
> **Repo**: [github.com/motiondivision/motion](https://github.com/motiondivision/motion)
> **Import**: `motion/react` (not `framer-motion`)

---

## Phase A: Repository & Architecture Analysis

### A1. Animation Engine -- Hybrid Architecture

Motion v12 uses a **hybrid animation engine** that intelligently selects the optimal rendering path for each animation:

| Engine | Class | When Used | Thread |
|--------|-------|-----------|--------|
| **NativeAnimation** | Web Animations API | Simple keyframe transitions (opacity, transform, color) | Compositor (off-main-thread) |
| **JSAnimation** | requestAnimationFrame | Spring physics, interruptible keyframes, gesture tracking | Main thread |
| **AsyncMotionValueAnimation** | Orchestration layer | Coordinates between Native/JS engines | Main thread (scheduling only) |

**How the engine decides:**

```
animation request
  |
  ├── Is it a spring? ──────────────> JSAnimation (rAF loop)
  ├── Is it interruptible mid-flight? > JSAnimation (rAF loop)
  ├── Is it gesture-driven? ────────> JSAnimation (rAF loop)
  └── Simple keyframe transition? ──> NativeAnimation (WAAPI, GPU-accelerated)
```

**GPU acceleration**: Motion automatically promotes `transform` and `opacity` animations to the compositor. The WAAPI path runs at 120fps on supported displays without main-thread work. The JSAnimation path uses `requestAnimationFrame`, which is capped at the display refresh rate but runs on the main thread.

**Key insight for Corthex**: Most of our UI transitions (fade, slide, scale) will use the NativeAnimation path, meaning near-zero main-thread cost. Only spring-based and gesture-driven animations will fall back to JS.

### A2. Spring Physics -- Damped Harmonic Oscillator

Motion's spring system models a **damped harmonic oscillator** with the equation:

```
F = -kx - cv + F_external

where:
  x = displacement from equilibrium
  k = stiffness (spring constant)
  c = damping coefficient
  v = velocity
  m = mass
```

The ODE solved per frame:

```
m * x'' + c * x' + k * x = 0
```

**Three damping regimes:**

| Regime | Condition | Behavior |
|--------|-----------|----------|
| **Underdamped** | c^2 < 4mk | Oscillates with exponential decay (bouncy) |
| **Critically damped** | c^2 = 4mk | Returns to rest fastest, no overshoot |
| **Overdamped** | c^2 > 4mk | Returns slowly, no oscillation |

**Motion's spring parameters:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `stiffness` | 100 | Spring constant -- higher = snappier |
| `damping` | 10 | Friction -- higher = less bounce |
| `mass` | 1 | Inertia -- higher = slower, heavier feel |
| `restDelta` | 0.01 | Threshold to consider animation "at rest" |
| `restSpeed` | 0.01 | Velocity threshold for rest |

**Duration-based springs**: Motion also supports `duration` + `bounce` as an alternative API that internally converts to stiffness/damping/mass. This is more designer-friendly:

```tsx
<motion.div
  animate={{ scale: 1 }}
  transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
/>
```

### A3. MotionValue System -- React Re-render-Free Updates

The MotionValue system is Motion's performance secret. It operates **outside of React's render cycle**:

```
React Component
  |
  ├── useState/useReducer ──> triggers re-render ──> Virtual DOM diff ──> DOM update
  |
  └── useMotionValue ───────> updates DOM directly ──> NO re-render, NO VDOM diff
```

**Core hooks:**

| Hook | Purpose | Re-renders? |
|------|---------|-------------|
| `useMotionValue(initial)` | Creates a mutable value for animation | No |
| `useTransform(mv, inputRange, outputRange)` | Maps one MotionValue to another | No |
| `useSpring(mv, config)` | Applies spring physics to a MotionValue | No |
| `useVelocity(mv)` | Tracks velocity of a MotionValue | No |
| `useScroll()` | Tracks scroll progress as MotionValues | No |

**Example -- scroll-linked parallax with zero re-renders:**

```tsx
const { scrollYProgress } = useScroll()
const y = useTransform(scrollYProgress, [0, 1], [0, -200])
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0])

return <motion.div style={{ y, opacity }}>Content</motion.div>
```

Every frame, the DOM is updated directly via `element.style.transform` and `element.style.opacity` -- React never knows, never re-renders.

### A4. Layout Animations (FLIP) -- Beyond Basic FLIP

Motion's layout animation engine goes far beyond the standard FLIP (First, Last, Invert, Play) technique:

**Standard FLIP:**
1. **F**irst: Record element's current position/size
2. **L**ast: Apply the DOM change, record new position/size
3. **I**nvert: Apply transform to make element appear at its "First" position
4. **P**lay: Animate transform from inverted back to identity

**Motion's improvements over basic FLIP:**

1. **Scale distortion correction**: When animating width/height via `scaleX`/`scaleY`, child content appears distorted. Motion applies **inverse scale transforms** to all children with `layout` prop, correcting:
   - `borderRadius` (re-calculated per frame)
   - `boxShadow` (re-calculated per frame)
   - Text content (inverse scale applied)
   - Child positions (infinitely deep tree correction)

2. **`layoutId` -- Shared element transitions**: Two components with the same `layoutId` in different parts of the tree will cross-animate when one mounts and the other unmounts. Motion creates a "phantom" element that animates between the two positions.

3. **CSS hints applied automatically**:
   - `will-change: transform` during animation
   - `contain: layout` where safe
   - `transform-style: preserve-3d` removed during layout animation to prevent z-fighting

**Usage pattern:**

```tsx
// List item -> Expanded detail (shared element transition)
<motion.div layoutId={`card-${item.id}`}>
  {isExpanded ? <DetailView /> : <CardView />}
</motion.div>
```

### A5. Gestures & Variants

**Gesture system** (all gesture props):

| Prop | Trigger | Example |
|------|---------|---------|
| `whileHover` | Pointer enters element | `whileHover={{ scale: 1.05 }}` |
| `whileTap` | Primary pointer press + hold | `whileTap={{ scale: 0.95 }}` |
| `whileFocus` | Element receives focus | `whileFocus={{ borderColor: "#606C38" }}` |
| `whileDrag` | During drag gesture | `whileDrag={{ scale: 1.1 }}` |
| `whileInView` | Element enters viewport | `whileInView={{ opacity: 1 }}` |
| `drag` | Enable drag (true/"x"/"y") | `drag="x"` |

**Variants -- declarative animation orchestration:**

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,   // 80ms delay between each child
      delayChildren: 0.2,      // 200ms before first child starts
      when: "beforeChildren",  // parent animates first
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(i => (
    <motion.li key={i.id} variants={item}>{i.name}</motion.li>
  ))}
</motion.ul>
```

**Parent-child propagation**: When a parent `motion` component changes variant (e.g., from `"hidden"` to `"visible"`), all `motion` children automatically receive the same variant change without explicit props. Children only need `variants` defined -- they inherit `animate`/`initial` from parents.

**Propagation control**: `e.stopPropagation()` in `onPointerDownCapture` stops parent gesture detection. The `propagate` prop (currently only for `tap`) prevents gesture bubbling.

### A6. Bundle Optimization

**Full bundle sizes (motion v12.38.0):**

| Import Strategy | Size (gzip) | Use Case |
|----------------|-------------|----------|
| `motion` component (full) | ~34 KB | Prototyping, small apps |
| `m` + `LazyMotion` + `domAnimation` | ~4.6 KB initial | Production apps (our target) |
| `m` + `LazyMotion` + `domMax` | ~4.6 KB + lazy loaded | Full features, lazy loaded |
| `useAnimate` (mini) | ~2.3 KB | Imperative-only, no declarative API |
| `useAnimate` (hybrid) | ~17 KB | Imperative with full engine |
| `animate()` (vanilla JS) | ~2.5 KB | Non-React usage |

**LazyMotion pattern (recommended for Corthex):**

```tsx
// lib/motion-features.ts
export { domAnimation as default } from "motion/react"

// app root (layout.tsx)
import { LazyMotion } from "motion/react"

const loadFeatures = () => import("../lib/motion-features").then(m => m.default)

function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <Outlet />
    </LazyMotion>
  )
}
```

The `strict` prop throws an error if any component accidentally imports `motion` instead of `m`, preventing bundle bloat.

**Tree-shaking effectiveness by bundler:**

| Bundler | Tree-shaking | Notes |
|---------|-------------|-------|
| **Vite/Rollup** (Corthex uses Vite) | Excellent | Best results, module-level shaking |
| esbuild | Good | Slightly larger than Rollup |
| Webpack | Moderate | Pulls in more unused code |

### A7. AnimatePresence -- Exit Animation Lifecycle

AnimatePresence enables exit animations for components being unmounted from React's tree.

**Modes:**

| Mode | Behavior | Use Case |
|------|----------|----------|
| `"sync"` (default) | Enter and exit happen simultaneously | Tab content, general use |
| `"wait"` | Exit completes before enter starts | Page transitions, step wizards |
| `"popLayout"` | Exiting element removed from flow immediately; remaining items reflow while exit animation plays | List item removal |

**Lifecycle:**

```
1. Component marked for removal from React tree
2. AnimatePresence intercepts unmount
3. Component stays in DOM, exit animation plays
4. onExitComplete callback fires
5. Component actually removed from DOM
```

**Critical rule**: Direct children of `<AnimatePresence>` must have a unique `key` prop.

```tsx
<AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

---

## Phase B: Corthex v2 Current State Audit

### B1. Current Animation Inventory

**What Corthex v2 currently uses for animation:**

| Mechanism | Count | Examples |
|-----------|-------|---------|
| Tailwind `transition-colors` | ~50+ instances | Hover states on buttons, nav links, cards |
| Tailwind `transition-all` | ~15 instances | Focus rings, sidebar, active states |
| Tailwind `animate-pulse` | ~12 instances | Status dots, loading states, unread indicators |
| Tailwind `animate-spin` | ~8 instances | Loader2 icons during async operations |
| Tailwind `animate-bounce` | 3 instances | Typing indicator dots in chat |
| CSS `@keyframes` | 5 custom | `slide-in`, `slideInRight`, `slide-up`, `cursor-blink`, `pulse-dot` |
| Inline `setTimeout` | 1 instance | Sidebar close animation (200ms manual delay) |
| CSS `duration-*` classes | ~5 instances | `duration-200`, `duration-300`, `duration-500` |

**What is NOT animated (missed opportunities):**

| Area | Current | Opportunity |
|------|---------|-------------|
| Page transitions | Hard cut (instant) | Fade/slide between routes |
| Dashboard KPI cards | Static render | Staggered entrance, number countup |
| Notification list | Static render | Stagger entrance, slide-in new items |
| Agent cards/list | Static render | Stagger entrance, status change pulse |
| Sidebar mobile | setTimeout-based open/close | Spring-based slide with backdrop fade |
| Modal/dialog open | Instant appear | Scale+fade entrance, backdrop blur |
| Toast notifications | CSS-only (sonner) | Enhanced with AnimatePresence |
| Detail panels | Instant appear/hide | Slide-in from right |
| Skeleton loaders | `animate-pulse` only | Shimmer + fade-to-content |
| Chart data | Static SVG | Animated path drawing |

### B2. Existing Animation Libraries

From `packages/app/package.json`:
- **No dedicated animation library installed**
- Relies entirely on Tailwind CSS utilities + 5 custom `@keyframes`
- `sonner` (toast library) has its own basic animations
- `@xyflow/react` has internal animations for the NEXUS canvas

### B3. Design Tokens Already Defined

From `packages/app/src/index.css`:

```css
/* Already defined animation tokens */
--animate-slide-in: slide-in 200ms ease-out;
--animate-slide-up: slide-up 200ms ease-out;
--animate-cursor-blink: cursor-blink 1s step-end infinite;
--animate-pulse-dot: pulse-dot 2s ease-in-out infinite;
```

These are CSS-only. Motion will replace the JS-driven animations and add new capabilities CSS cannot provide (springs, exit animations, layout animations, gesture-driven animations).

---

## Phase C: Integration Design -- 6 Deliverables

### Deliverable 1: `motion-system.ts` -- Corthex Animation Constants

```typescript
// packages/app/src/lib/motion-system.ts

/**
 * CORTHEX v2 Animation System
 * Design: Natural Organic theme -- premium, deliberate motion
 * Philosophy: Animations should feel like natural movement, never jarring
 */

// ─── Duration Tokens ───

export const duration = {
  /** Micro-interactions: button press, toggle, icon change */
  instant: 0.1,
  /** Fast feedback: hover effects, small transitions */
  fast: 0.15,
  /** Standard transitions: most UI elements */
  normal: 0.3,
  /** Deliberate motion: panels, modals, page transitions */
  slow: 0.5,
  /** Dramatic entrance: hero elements, first-load animations */
  dramatic: 0.8,
} as const

// ─── Easing Curves (Natural Organic -- slow→fast→slow) ───

export const easing = {
  /** Standard ease -- smooth, natural deceleration */
  standard: [0.25, 0.1, 0.25, 1.0] as const,
  /** Entrance -- element arriving on screen, decelerates */
  enter: [0.0, 0.0, 0.2, 1.0] as const,
  /** Exit -- element leaving screen, accelerates away */
  exit: [0.4, 0.0, 1.0, 1.0] as const,
  /** Emphasis -- slight overshoot for premium feel */
  emphasis: [0.175, 0.885, 0.32, 1.075] as const,
  /** Sharp -- quick, decisive motion for toggles/switches */
  sharp: [0.4, 0.0, 0.6, 1.0] as const,
} as const

// ─── Spring Presets ───

export const spring = {
  /** Bouncy -- playful, noticeable overshoot. For: toggles, fun interactions */
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15, mass: 1 },
  /** Smooth -- gentle, premium feel. For: page transitions, panels */
  smooth: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1 },
  /** Stiff -- snappy, responsive. For: dropdown, tooltip, popover */
  stiff: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 1 },
  /** Heavy -- slow, weighty. For: modal, full-screen overlays */
  heavy: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 2 },
  /** Micro -- barely perceptible. For: subtle scale on hover */
  micro: { type: 'spring' as const, stiffness: 600, damping: 35, mass: 0.5 },
} as const

// ─── Standard Transition Presets ───

export const transition = {
  /** Default tween for most elements */
  default: { duration: duration.normal, ease: easing.standard },
  /** Fast feedback transition */
  fast: { duration: duration.fast, ease: easing.standard },
  /** Slow, deliberate transition */
  slow: { duration: duration.slow, ease: easing.enter },
  /** Exit transition */
  exit: { duration: duration.fast, ease: easing.exit },
} as const

// ─── Variant Libraries ───

/** Fade in from transparent */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transition.default,
}

/** Slide up from below (common entrance) */
export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

/** Slide in from left (sidebar, panels) */
export const slideLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
}

/** Slide in from right (detail panels) */
export const slideRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
}

/** Scale up from center (modals, popups) */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

/** Staggered list container */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

/** Staggered list item */
export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easing.enter },
  },
}

// ─── Theme-Specific Effects ───

/** Olive accent glow pulse (for active/selected states) */
export const oliveGlow = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(96, 108, 56, 0)',
      '0 0 0 8px rgba(96, 108, 56, 0.15)',
      '0 0 0 0 rgba(96, 108, 56, 0)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/** Status dot pulse */
export const statusPulse = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [1, 0.6, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

// ─── Reduced Motion Fallbacks ───

/** Use as transition when prefers-reduced-motion is active */
export const reducedMotionTransition = {
  duration: 0,
}

/** Helper to get appropriate transition based on motion preference */
export function getTransition(
  preferred: typeof transition[keyof typeof transition],
  reducedMotion: boolean,
) {
  return reducedMotion ? reducedMotionTransition : preferred
}
```

---

### Deliverable 2: Reusable Animation Components

```tsx
// packages/app/src/components/motion/fade-in.tsx

import { type ReactNode } from 'react'
import { m, type HTMLMotionProps } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { duration, easing } from '../../lib/motion-system'

type FadeInProps = HTMLMotionProps<'div'> & {
  children: ReactNode
  /** Delay before animation starts (seconds) */
  delay?: number
  /** Animation duration (seconds) */
  dur?: number
  /** Direction to fade in from */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Distance to travel (pixels) */
  distance?: number
}

export function FadeIn({
  children,
  delay = 0,
  dur = duration.normal,
  direction = 'none',
  distance = 20,
  ...props
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()

  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  if (shouldReduceMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  }

  return (
    <m.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: dur,
        delay,
        ease: easing.enter,
      }}
      {...props}
    >
      {children}
    </m.div>
  )
}
```

```tsx
// packages/app/src/components/motion/slide-in.tsx

import { type ReactNode } from 'react'
import { m } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { spring } from '../../lib/motion-system'

type SlideInProps = {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  /** Distance in pixels */
  distance?: number
  /** Delay in seconds */
  delay?: number
  className?: string
}

const offsets = {
  up: (d: number) => ({ y: d }),
  down: (d: number) => ({ y: -d }),
  left: (d: number) => ({ x: -d }),
  right: (d: number) => ({ x: d }),
}

export function SlideIn({
  children,
  direction = 'up',
  distance = 30,
  delay = 0,
  className,
}: SlideInProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, ...offsets[direction](distance) }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...offsets[direction](distance / 2) }}
      transition={{
        ...spring.smooth,
        delay,
      }}
    >
      {children}
    </m.div>
  )
}
```

```tsx
// packages/app/src/components/motion/stagger-list.tsx

import { type ReactNode } from 'react'
import { m } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { duration, easing } from '../../lib/motion-system'

type StaggerListProps = {
  children: ReactNode
  /** Delay between each child (seconds) */
  stagger?: number
  /** Initial delay before first child (seconds) */
  delayStart?: number
  className?: string
}

const containerVariants = (stagger: number, delayStart: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delayStart,
    },
  },
})

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.enter,
    },
  },
}

export function StaggerList({
  children,
  stagger = 0.06,
  delayStart = 0.1,
  className,
}: StaggerListProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      className={className}
      variants={containerVariants(stagger, delayStart)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </m.div>
  )
}

/** Wrap each item in a StaggerList with this */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <m.div className={className} variants={staggerItemVariants}>
      {children}
    </m.div>
  )
}
```

```tsx
// packages/app/src/components/motion/number-ticker.tsx

import { useEffect, useRef, useState } from 'react'
import {
  useMotionValue,
  useTransform,
  useSpring,
  m,
  useReducedMotion,
} from 'motion/react'

type NumberTickerProps = {
  /** Target number to animate to */
  value: number
  /** Number of decimal places */
  decimals?: number
  /** Prefix string (e.g., "$") */
  prefix?: string
  /** Suffix string (e.g., "%") */
  suffix?: string
  /** Animation duration in seconds */
  dur?: number
  /** Spring stiffness */
  stiffness?: number
  /** Spring damping */
  damping?: number
  className?: string
}

export function NumberTicker({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  dur = 1.5,
  stiffness = 100,
  damping = 30,
  className,
}: NumberTickerProps) {
  const shouldReduceMotion = useReducedMotion()
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness,
    damping,
    mass: 1,
  })
  const [displayValue, setDisplayValue] = useState('0')
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Drive the motion value to target
    motionValue.set(shouldReduceMotion ? value : 0)
    if (!shouldReduceMotion) {
      // Small delay then animate
      const timer = setTimeout(() => motionValue.set(value), 100)
      return () => clearTimeout(timer)
    }
  }, [value, motionValue, shouldReduceMotion])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setDisplayValue(latest.toFixed(decimals))
      })
    })
    return () => {
      unsubscribe()
      cancelAnimationFrame(rafRef.current)
    }
  }, [springValue, decimals])

  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {prefix}{value.toFixed(decimals)}{suffix}
      </span>
    )
  }

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
```

```tsx
// packages/app/src/components/motion/page-transition.tsx

import { type ReactNode } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { duration, easing } from '../../lib/motion-system'

type PageTransitionProps = {
  children: ReactNode
  /** Animation mode */
  mode?: 'wait' | 'sync' | 'popLayout'
}

export function PageTransition({ children, mode = 'wait' }: PageTransitionProps) {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode={mode}>
      <m.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: duration.fast,
          ease: easing.standard,
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
```

```tsx
// packages/app/src/hooks/use-scroll-reveal.ts

import { useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

type ScrollRevealOptions = {
  /** Trigger once or every time element enters viewport */
  once?: boolean
  /** Viewport margin (e.g., "-100px" to trigger 100px before entering) */
  margin?: string
  /** Threshold (0-1) of element visibility required */
  amount?: number | 'some' | 'all'
}

/**
 * Hook that returns a ref and boolean for viewport-triggered animations.
 *
 * Usage:
 * ```tsx
 * const { ref, isInView } = useScrollReveal()
 * return (
 *   <m.div
 *     ref={ref}
 *     initial={{ opacity: 0, y: 20 }}
 *     animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
 *   />
 * )
 * ```
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { once = true, margin = '-50px', amount = 0.3 } = options
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin, amount })

  return {
    ref,
    isInView: shouldReduceMotion ? true : isInView,
  }
}
```

```tsx
// packages/app/src/hooks/use-pulse.ts

import { useReducedMotion } from 'motion/react'

/**
 * Returns animation props for a pulsing status dot.
 * Applies to any motion element for a breathing/pulse effect.
 *
 * Usage:
 * ```tsx
 * const pulseProps = usePulse({ color: '#606C38' })
 * return <m.span className="w-2 h-2 rounded-full bg-[#606C38]" {...pulseProps} />
 * ```
 */
export function usePulse(options: {
  /** Duration of one full pulse cycle (seconds) */
  duration?: number
  /** Min/max scale range */
  scaleRange?: [number, number]
} = {}) {
  const { duration: dur = 2, scaleRange = [1, 1.4] } = options
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return {}
  }

  return {
    animate: {
      scale: [scaleRange[0], scaleRange[1], scaleRange[0]],
      opacity: [1, 0.6, 1],
    },
    transition: {
      duration: dur,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }
}
```

---

### Deliverable 3: shadcn/ui Integration Patterns

Corthex v2 uses `@corthex/ui` (a custom UI package with Modal, Button, Input, etc.). Here are patterns for integrating Motion with these components.

**Pattern 1: Dialog/Sheet with AnimatePresence Enter/Exit**

```tsx
// Integration with @corthex/ui Modal component
// Wrap the Modal's inner content with motion

import { AnimatePresence, m } from 'motion/react'
import { spring, duration, easing } from '../../lib/motion-system'

type AnimatedModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function AnimatedModal({ isOpen, onClose, children, title }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
            onClick={onClose}
          />
          {/* Modal content */}
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <m.div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-auto border border-[#e5e1d3]"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={spring.stiff}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="px-6 pt-6 pb-4 border-b border-[#e5e1d3]">
                  <h2 className="text-xl font-bold text-[#283618]">{title}</h2>
                </div>
              )}
              <div className="p-6">{children}</div>
            </m.div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Pattern 2: Accordion with Height Auto Animation**

```tsx
import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { spring } from '../../lib/motion-system'

type AccordionItemProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[#e5e1d3]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-[#f5f0e8]/50 transition-colors"
      >
        <span className="text-sm font-medium text-[#1a1a1a]">{title}</span>
        <m.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={spring.micro}
        >
          <ChevronDown className="w-4 h-4 text-[#6b705c]" />
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-2 pb-4 text-sm text-[#6b705c]">
              {children}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Pattern 3: Tabs Content Transition**

```tsx
import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { duration, easing } from '../../lib/motion-system'

type Tab = { key: string; label: string; content: React.ReactNode }

export function AnimatedTabs({ tabs }: { tabs: Tab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? '')
  const activeIndex = tabs.findIndex(t => t.key === activeKey)
  const [prevIndex, setPrevIndex] = useState(0)
  const direction = activeIndex >= prevIndex ? 1 : -1

  const handleTabChange = (key: string) => {
    setPrevIndex(activeIndex)
    setActiveKey(key)
  }

  const activeTab = tabs.find(t => t.key === activeKey)

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 border-b border-[#e5e1d3] relative">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeKey === tab.key
                ? 'text-[#283618]'
                : 'text-[#6b705c] hover:text-[#1a1a1a]'
            }`}
          >
            {tab.label}
            {activeKey === tab.key && (
              <m.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#606C38]"
                layoutId="tab-indicator"
                transition={spring.stiff}
              />
            )}
          </button>
        ))}
      </div>
      {/* Tab content with exit/enter animation */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={activeKey}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: duration.fast, ease: easing.standard }}
            className="py-4"
          >
            {activeTab?.content}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
```

**Pattern 4: Toast Slide + Auto-Dismiss (Enhanced Sonner Integration)**

```tsx
// Enhancing existing sonner toasts with motion wrapper
import { m, AnimatePresence } from 'motion/react'
import { spring } from '../../lib/motion-system'

type AnimatedToastProps = {
  isVisible: boolean
  children: React.ReactNode
  position?: 'top' | 'bottom'
}

export function AnimatedToast({
  isVisible,
  children,
  position = 'bottom',
}: AnimatedToastProps) {
  const y = position === 'top' ? -60 : 60

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0, y, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: y / 2, scale: 0.98 }}
          transition={spring.stiff}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  )
}
```

**Pattern 5: Tooltip/Popover Scale+Fade**

```tsx
import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { spring } from '../../lib/motion-system'

type AnimatedTooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
}

export function AnimatedTooltip({ content, children }: AnimatedTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <m.div
            className="absolute z-50 bottom-full left-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[#283618] text-white text-xs font-medium whitespace-nowrap shadow-lg"
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: 4 }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: 2 }}
            transition={spring.micro}
          >
            {content}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#283618]" />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

### Deliverable 4: Top 5 Highest-Impact Pages -- Before/After

#### 1. Dashboard -- KPI Card Stagger Entrance + Number Countup

**Before** (current `dashboard.tsx` lines 440-481):
```tsx
{/* Static, instant render */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
  <KpiCard label="Total Agents" value={String(summary.agents.total)} icon={<Bot />} />
  <KpiCard label="Active Tasks" value={String(summary.tasks.inProgress)} icon={<Zap />} />
  {/* ...more cards */}
</section>
```

**After** (with Motion):
```tsx
import { m } from 'motion/react'
import { StaggerList, StaggerItem } from '../components/motion/stagger-list'
import { NumberTicker } from '../components/motion/number-ticker'

<StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
  <StaggerItem>
    <KpiCard
      label="Total Agents"
      value={<NumberTicker value={summary.agents.total} />}
      icon={<Bot className="w-5 h-5" />}
      trend={summary.agents.active > 0 ? 'up' : 'neutral'}
      trendLabel={`${summary.agents.active} active`}
    />
  </StaggerItem>
  <StaggerItem>
    <KpiCard
      label="Active Tasks"
      value={<NumberTicker value={summary.tasks.inProgress} />}
      icon={<Zap className="w-5 h-5" />}
      trend={summary.tasks.inProgress > 0 ? 'up' : 'neutral'}
      trendLabel={`${summary.tasks.total} total`}
    />
  </StaggerItem>
  {/* ...more cards -- each with NumberTicker and StaggerItem */}
</StaggerList>
```

KpiCard `value` prop type would change from `string` to `React.ReactNode` to accept `NumberTicker`.

#### 2. Layout -- Mobile Sidebar Spring Animation

**Before** (current `layout.tsx` lines 188-198):
```tsx
{/* setTimeout-based close, CSS transition only */}
{(sidebarOpen || closing) && (
  <div className="lg:hidden fixed inset-0 z-40">
    <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
         onClick={closeSidebar} />
    <div className={`absolute inset-y-0 left-0 w-[280px] transition-transform duration-200 ${closing ? '-translate-x-full' : 'translate-x-0'}`}>
      <Sidebar onNavClick={closeSidebar} />
    </div>
  </div>
)}
```

**After** (with Motion -- removes setTimeout hack entirely):
```tsx
import { AnimatePresence, m } from 'motion/react'
import { spring } from '../lib/motion-system'

<AnimatePresence>
  {sidebarOpen && (
    <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <m.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar panel */}
      <m.div
        className="absolute inset-y-0 left-0 w-[280px] shadow-xl"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={spring.smooth}
      >
        <Sidebar onNavClick={() => setSidebarOpen(false)} />
      </m.div>
    </div>
  )}
</AnimatePresence>
```

This eliminates `closing` state, `setClosing`, and the `setTimeout` entirely. The exit animation is handled declaratively.

#### 3. Notifications -- List Item Stagger + Detail Panel Slide

**Before** (current `notifications.tsx` lines 313-370):
```tsx
{/* Static list render, no entrance animation */}
{filteredNotifications.map((n) => (
  <div key={n.id} onClick={() => handleClick(n)}
       className={`group relative flex items-start gap-4 p-5 transition-all cursor-pointer`}>
    {/* ...notification content */}
  </div>
))}
```

**After** (with Motion):
```tsx
import { m, AnimatePresence } from 'motion/react'
import { staggerContainer, staggerItem } from '../../lib/motion-system'

<m.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  key={`${filter}-${activeTab}`}  // re-trigger animation on filter change
>
  {filteredNotifications.map((n) => (
    <m.div
      key={n.id}
      variants={staggerItem}
      layout
      onClick={() => handleClick(n)}
      className={`group relative flex items-start gap-4 p-5 cursor-pointer border-b border-[#e5e1d3]/10 ${
        selectedId === n.id ? 'bg-[#e5e1d3]/60' : n.isRead ? 'hover:bg-[#f5f0e8]/60' : 'bg-white/40 hover:bg-[#f5f0e8]'
      }`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      {/* ...notification content */}
      {!n.isRead && (
        <m.span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: iconStyle.dot }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </m.div>
  ))}
</m.div>

{/* Detail panel with slide animation */}
<AnimatePresence mode="wait">
  {selectedNotification && (
    <m.div
      key={selectedNotification.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="lg:w-[40%] flex flex-col bg-[#f5f3f0]/30"
    >
      {/* ...detail content */}
    </m.div>
  )}
</AnimatePresence>
```

#### 4. Agents -- Card Grid Stagger + Status Change Pulse

**Before** (current agents page -- static grid):
```tsx
{agents.map((agent) => (
  <div key={agent.id} onClick={() => selectAgent(agent)}
       className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:bg-[#f5f3f0] transition-colors">
    {/* status dot is static class */}
    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
  </div>
))}
```

**After** (with Motion):
```tsx
import { m, AnimatePresence } from 'motion/react'
import { StaggerList, StaggerItem } from '../components/motion/stagger-list'
import { usePulse } from '../hooks/use-pulse'

function AgentCard({ agent, onClick, isSelected }: { agent: Agent; onClick: () => void; isSelected: boolean }) {
  const status = statusConfig[agent.status] || statusConfig.offline
  const pulseProps = usePulse()

  return (
    <m.div
      layout
      layoutId={`agent-card-${agent.id}`}
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-sm cursor-pointer border ${
        isSelected ? 'border-[#606C38] ring-2 ring-[#606C38]/20' : 'border-[#e5e1d3]/30'
      }`}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(40,54,24,0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#283618] flex items-center justify-center text-white font-bold">
            {getInitials(agent.name, agent.nameEn)}
          </div>
          {agent.status === 'online' && (
            <m.span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4d7c0f] border-2 border-white"
              {...pulseProps}
            />
          )}
        </div>
        <div>
          <h3 className="font-bold text-[#1a1a1a]">{agent.name}</h3>
          <p className="text-xs text-[#6b705c]">{agent.role || 'Agent'}</p>
        </div>
      </div>
    </m.div>
  )
}

// In the page component:
<StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {agents.map((agent) => (
    <StaggerItem key={agent.id}>
      <AgentCard
        agent={agent}
        onClick={() => selectAgent(agent)}
        isSelected={selectedAgentId === agent.id}
      />
    </StaggerItem>
  ))}
</StaggerList>
```

#### 5. Chat -- Message Bubble Entrance + Typing Indicator

**Before** (current chat-area.tsx lines 735-743):
```tsx
{/* Static cursor blink */}
<span className="inline-block w-2 h-4 bg-[#5a7247] ml-1 animate-[blink_1s_step-end_infinite]" />

{/* CSS bounce typing indicator */}
<span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
<span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
<span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
```

**After** (with Motion):
```tsx
import { m, AnimatePresence } from 'motion/react'
import { spring } from '../../lib/motion-system'

// Message bubble entrance
function ChatBubble({ message, isUser }: { message: Message; isUser: boolean }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring.stiff}
      className={`max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
    >
      <div className={`px-4 py-3 rounded-2xl ${
        isUser ? 'bg-[#606C38] text-white' : 'bg-white border border-[#e5e1d3]'
      }`}>
        {message.content}
      </div>
    </m.div>
  )
}

// Spring-based typing indicator (replaces CSS animate-bounce)
function TypingIndicator() {
  return (
    <m.div
      className="flex items-center gap-1 px-4 py-3"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
    >
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#6b705c]"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </m.div>
  )
}
```

---

### Deliverable 5: Performance Guardrails

#### 5.1 Max Concurrent Animations Limit

```tsx
// packages/app/src/lib/animation-limiter.ts

/**
 * Limits concurrent animations to prevent performance degradation.
 * On mobile devices, too many simultaneous animations cause jank.
 */
const MAX_CONCURRENT = {
  desktop: 20,
  mobile: 8,
} as const

let activeAnimations = 0
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export function getMaxConcurrent(): number {
  return isMobile ? MAX_CONCURRENT.mobile : MAX_CONCURRENT.desktop
}

export function canStartAnimation(): boolean {
  return activeAnimations < getMaxConcurrent()
}

export function trackAnimation() {
  activeAnimations++
  return () => { activeAnimations = Math.max(0, activeAnimations - 1) }
}

/**
 * For stagger lists: calculate appropriate stagger based on item count.
 * If too many items, reduce stagger or skip animation for off-screen items.
 */
export function getAdaptiveStagger(itemCount: number): number {
  if (itemCount <= 6) return 0.08   // 80ms between items
  if (itemCount <= 12) return 0.05  // 50ms, faster for more items
  if (itemCount <= 20) return 0.03  // 30ms
  return 0.02                       // 20ms for large lists, or consider virtualizing
}
```

#### 5.2 `prefers-reduced-motion` Full Support

Every Motion component in Deliverable 2 already includes `useReducedMotion` checks. The system-wide approach:

```tsx
// In layout.tsx (app root), wrap with MotionConfig for global reduced-motion
import { MotionConfig, useReducedMotion } from 'motion/react'

export function Layout() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion="user">
      {/* When reducedMotion="user", all motion components automatically
          check prefers-reduced-motion and skip animations when enabled.
          No need to manually check in every component. */}
      <div className="h-screen flex flex-col lg:flex-row">
        {/* ...app content */}
      </div>
    </MotionConfig>
  )
}
```

**MotionConfig `reducedMotion` options:**

| Value | Behavior |
|-------|----------|
| `"user"` | Respects OS `prefers-reduced-motion` setting |
| `"always"` | Always reduces motion (testing) |
| `"never"` | Ignores user preference (not recommended) |

With `reducedMotion="user"` at root level, **all** `m.*` components and `useSpring`/`useTransform` hooks automatically skip to final values without animation when the user has reduced motion enabled. This is a single line of code that covers the entire app.

#### 5.3 Mobile Optimization Strategy

```
┌─ Desktop (≥1024px) ──────────────────────────────────────┐
│ Full animations: springs, stagger, layout, page trans.   │
│ Max concurrent: 20                                        │
│ Stagger delays: full (60-80ms per item)                   │
│ Spring physics: full (stiffness 200-500)                  │
└──────────────────────────────────────────────────────────┘

┌─ Tablet (768-1023px) ────────────────────────────────────┐
│ Reduced stagger: 30-50ms per item                         │
│ Simpler springs: higher damping (less bouncy)             │
│ Skip layout animations on lists > 20 items                │
│ Max concurrent: 12                                        │
└──────────────────────────────────────────────────────────┘

┌─ Mobile (<768px) ────────────────────────────────────────┐
│ Essential animations only: page transitions, modals       │
│ Skip stagger on lists > 10 items                          │
│ Use CSS transitions where possible (off-main-thread)      │
│ No layout animations on card grids                        │
│ Max concurrent: 8                                         │
│ Reduce spring bouncing (higher damping)                   │
└──────────────────────────────────────────────────────────┘
```

Implementation:

```tsx
// packages/app/src/lib/responsive-motion.ts

import { spring as springPresets } from './motion-system'

export function useResponsiveMotion() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024

  return {
    /** Should this element animate? */
    shouldAnimate: (type: 'stagger' | 'layout' | 'spring' | 'essential') => {
      if (type === 'essential') return true  // always animate essential (page transitions, modals)
      if (isMobile && type === 'stagger') return false
      if (isMobile && type === 'layout') return false
      return true
    },
    /** Get appropriate spring config for current viewport */
    spring: isMobile
      ? { ...springPresets.stiff, damping: 40 }  // less bouncy on mobile
      : isTablet
        ? springPresets.smooth
        : springPresets.smooth,
    /** Get appropriate stagger delay */
    stagger: (itemCount: number) => {
      if (isMobile) return 0.02
      if (isTablet) return 0.04
      return itemCount > 12 ? 0.04 : 0.06
    },
  }
}
```

#### 5.4 React 19 Concurrent Mode Compatibility

**Status**: Motion v12+ is fully compatible with React 19. Corthex uses React 19 (`"react": "^19"` in package.json).

| Feature | Compatibility | Notes |
|---------|-------------|-------|
| React 19 | Full support | Motion v12 supports React 18 and 19 |
| React Compiler | Compatible | Auto-memoizes animation components |
| Suspense boundaries | Works | Animations work correctly with `<Suspense>` |
| Streaming SSR | Compatible | Hydration-safe (no layout shift) |
| Concurrent rendering | Safe | MotionValues bypass React reconciler |
| `use()` hook | No conflict | Motion hooks are separate from React primitives |
| `startTransition()` | Compatible | Animations don't block transitions |

**Key architectural advantage**: MotionValues update outside React's render cycle, so they are inherently concurrent-mode safe. The React Compiler can also auto-memoize component boundaries without affecting animation behavior.

**One caveat**: When using `useMotionValue` inside a component that `startTransition` wraps, the motion value update is immediate (not deferred), which is the desired behavior for animations.

---

### Deliverable 6: Bundle Size Impact Analysis

#### Current Corthex App Bundle

From `packages/app/package.json`, the current dependencies that contribute to animation:
- Tailwind CSS: 0 KB runtime (compile-time only)
- Custom `@keyframes` in `index.css`: ~0.5 KB

**Current animation JS overhead: ~0 KB**

#### Projected Bundle Impact with Motion

**Strategy: LazyMotion + `m` component + `domAnimation` features**

| Addition | Size (gzip) | When Loaded |
|----------|-------------|-------------|
| Motion core (`m` + `LazyMotion` shell) | ~4.6 KB | Initial bundle |
| `domAnimation` features | ~13 KB | Lazy-loaded after first render |
| Custom motion-system.ts | ~1.5 KB | Initial bundle |
| 7 reusable components (Deliverable 2) | ~3 KB | Tree-shaken per-page |
| `useReducedMotion` + hooks | ~0.5 KB | Included in core |
| **Total initial load increase** | **~6.1 KB** | |
| **Total lazy-loaded** | **~13 KB** | |
| **Total maximum** | **~19.1 KB** | |

#### Comparison with Alternatives

| Library | Size (gzip) | React integration | Spring physics | Layout anim | Exit anim |
|---------|-------------|-------------------|----------------|-------------|-----------|
| **Motion (LazyMotion)** | **6.1 KB initial** | Native | Yes | Yes | Yes |
| Motion (full `motion`) | ~34 KB | Native | Yes | Yes | Yes |
| GSAP | ~78 KB | Plugin | Limited | No | Manual |
| react-spring | ~22 KB | Native | Yes | No | Manual |
| anime.js | ~17 KB | Manual | No | No | No |
| CSS-only (current) | 0 KB | N/A | No | No | No |

#### Impact on Key Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Initial JS bundle (gzip) | ~180 KB* | ~186 KB | +6.1 KB (+3.4%) |
| First Contentful Paint | No impact | No impact | 0ms |
| Largest Contentful Paint | No impact | Negligible | +0-5ms |
| Time to Interactive | No impact | Negligible | +0-10ms |
| Runtime memory | Baseline | +~200 KB heap | Low |

\* Estimated current bundle size based on React 19 + React Router + Tanstack Query + Zustand + Lucide icons.

**Verdict**: The 6.1 KB initial bundle increase (~3.4%) is negligible for the animation capabilities gained. The lazy-loaded 13 KB is loaded asynchronously and does not block rendering. This is a clear win for perceived performance and user experience polish.

---

## Summary: Integration Roadmap

| Priority | Area | Effort | Impact |
|----------|------|--------|--------|
| P0 | Install `motion`, setup `LazyMotion` in layout | 30 min | Foundation |
| P0 | Create `motion-system.ts` (Deliverable 1) | 1 hour | Design system |
| P1 | Mobile sidebar spring animation (Layout) | 1 hour | High -- removes setTimeout hack |
| P1 | Dashboard KPI stagger + NumberTicker | 2 hours | High -- most visited page |
| P1 | Page transitions (PageTransition component) | 1 hour | High -- every navigation |
| P2 | Notification list stagger + detail slide | 2 hours | Medium |
| P2 | Chat bubble entrance + typing indicator | 1.5 hours | Medium |
| P2 | Agent card stagger + hover effects | 1.5 hours | Medium |
| P3 | shadcn/ui enhancements (modal, accordion, tabs) | 3 hours | Polish |
| P3 | Scroll-reveal for below-fold content | 1 hour | Polish |

**Total estimated effort**: ~15 hours for full integration.

---

## Sources

- [Motion Official Documentation](https://motion.dev/docs/react)
- [Motion GitHub Repository](https://github.com/motiondivision/motion)
- [Motion Changelog](https://motion.dev/changelog)
- [Motion Layout Animations](https://motion.dev/docs/react-layout-animations)
- [Motion Reduce Bundle Size](https://motion.dev/docs/react-reduce-bundle-size)
- [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence)
- [Motion Gestures](https://motion.dev/docs/react-gestures)
- [Motion MotionValues](https://motion.dev/docs/react-motion-value)
- [Motion useSpring](https://motion.dev/docs/react-use-spring)
- [Motion useReducedMotion](https://motion.dev/docs/react-use-reduced-motion)
- [Motion LazyMotion](https://motion.dev/docs/react-lazy-motion)
- [Motion Upgrade Guide](https://motion.dev/docs/react-upgrade-guide)
- [Motion GSAP Comparison](https://motion.dev/docs/gsap-vs-motion)
- [Framer Motion Complete Guide 2026 (inhaq)](https://inhaq.com/blog/framer-motion-complete-guide-react-nextjs-developers)
- [Best React Animation Libraries 2026 (LogRocket)](https://blog.logrocket.com/best-react-animation-libraries/)
- [GSAP vs Motion Guide 2026 (Satish Kumar)](https://satishkumar.xyz/blogs/gsap-vs-motion-guide-2026)
- [Physics Behind Spring Animations (Maxime Heckel)](https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/)
- [Inside Framer's Magic Motion (nan.fyi)](https://www.nan.fyi/magic-motion)
- [FLIP Technique (CSS-Tricks)](https://css-tricks.com/animating-layouts-with-the-flip-technique/)
- [Motion npm](https://www.npmjs.com/package/motion)
- [AnimatePresence Modes Tutorial](https://motion.dev/tutorials/react-animate-presence-modes)
- [Accessible Animations with prefers-reduced-motion (Josh Comeau)](https://www.joshwcomeau.com/react/prefers-reduced-motion/)
