// Local shim replacing @subframe/core dependency
// These legacy ui/ components are NOT used by the main app (which uses @corthex/ui)
// This shim provides the minimum API surface needed to keep them compiling

import React from 'react'

// Icon wrapper — simple span
export function IconWrapper({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) {
  return React.createElement('span', { className, ...props }, children)
}

// Feather icon stubs — these legacy components reference Feather icons from subframe
function createIconStub(name: string) {
  return function FeatherIcon(props: React.SVGAttributes<SVGElement>) {
    return React.createElement('svg', { ...props, 'data-icon': name, width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 })
  }
}

export const FeatherCheck = createIconStub('check')
export const FeatherChevronDown = createIconStub('chevron-down')
export const FeatherChevronRight = createIconStub('chevron-right')
export const FeatherCircleDashed = createIconStub('circle-dashed')
export const FeatherStar = createIconStub('star')
export const FeatherFile = createIconStub('file')
export const FeatherFolder = createIconStub('folder')
export const FeatherClipboard = createIconStub('clipboard')
export const FeatherInfo = createIconStub('info')
export const FeatherPlus = createIconStub('plus')
export const FeatherLogOut = createIconStub('log-out')
export const FeatherSettings = createIconStub('settings')
export const FeatherUser = createIconStub('user')

// FullScreenDialog — simple portal-like wrapper
export const FullScreenDialog = {
  Root: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }>(
    function Root({ children, ...props }, ref) {
      return React.createElement('div', { ref, ...props }, children)
    }
  ),
}

// twClassNames creator — returns the function from utils
export function createTwClassNames(_classes: string[]) {
  return function twClassNames(...args: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
    return args
      .map((v) => {
        if (!v) return ''
        if (typeof v === 'string') return v
        if (typeof v === 'object') return Object.entries(v).filter(([, val]) => val).map(([key]) => key).join(' ')
        return ''
      })
      .filter(Boolean)
      .join(' ')
  }
}

// Chart components — stubs for unused chart wrappers
export const BarChart = { Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })) }
export const LineChart = { Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })) }
export const AreaChart = { Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })) }
export const PieChart = { Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })) }

// Calendar stub
export const Calendar = { Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })) }

// Select trigger
export const Select = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Trigger: React.forwardRef<HTMLButtonElement>((p, r) => React.createElement('button', { ref: r, ...p })),
  Content: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Item: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Dialog
export const Dialog = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Content: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Drawer
export const Drawer = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Content: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Loader
export const Loader = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Slider
export const Slider = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Switch
export const Switch = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Table
export const Table = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Accordion
export const Accordion = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Item: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// RadioGroup
export const RadioGroup = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Item: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// ToggleGroup
export const ToggleGroup = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Item: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Tooltip
export const Tooltip = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Content: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// ContextMenu
export const ContextMenu = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Content: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Item: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// DropdownMenu
export const DropdownMenu = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Content: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Item: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Button
export const Button = {
  Root: React.forwardRef<HTMLButtonElement>((p, r) => React.createElement('button', { ref: r, ...p })),
}

// Badge
export const Badge = {
  Root: React.forwardRef<HTMLSpanElement>((p, r) => React.createElement('span', { ref: r, ...p })),
}

// Progress
export const Progress = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// Checkbox
export const Checkbox = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}

// TextField
export const TextField = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
  Input: React.forwardRef<HTMLInputElement>((p, r) => React.createElement('input', { ref: r, ...p })),
}

// TextArea
export const TextArea = {
  Root: React.forwardRef<HTMLDivElement>((p, r) => React.createElement('div', { ref: r, ...p })),
}
