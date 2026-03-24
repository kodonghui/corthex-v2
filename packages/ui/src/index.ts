// @corthex/ui — 공유 UI 컴포넌트
export { cn } from './utils'
export { tokens, colors, typography, spacing, borders, shadows, transitions, layout, tokensToCssProperties } from './tokens/design-tokens'
export type { DesignTokens } from './tokens/design-tokens'
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'
export { Card, CardHeader, CardContent, CardFooter } from './card'
export { Badge } from './badge'
export { Input } from './input'
export { Skeleton, SkeletonCard, SkeletonTable } from './skeleton'
export { StatusDot } from './status-dot'
export { EmptyState } from './empty-state'
export { Avatar } from './avatar'
export { Spinner } from './spinner'
export { Modal } from './modal'
export { ConfirmDialog } from './confirm-dialog'
export { toast, ToastProvider } from './toast'
export { Tabs } from './tabs'
export type { TabItem, TabsProps } from './tabs'
export { Toggle } from './toggle'
export type { ToggleProps } from './toggle'
export { Textarea } from './textarea'
export type { TextareaProps } from './textarea'
export { Select } from './select'
export type { SelectOption, SelectProps } from './select'
export { FilterChip } from './filter-chip'
export type { FilterChipProps } from './filter-chip'
export { TimelineGroup } from './timeline'
export type { TimelineItem, TimelineGroupProps } from './timeline'
export { ProgressBar } from './progress-bar'
export type { ProgressBarProps } from './progress-bar'

// Layouts
export { StackLayout, SplitLayout, SplitLayoutSide, SplitLayoutMain, GridLayout, DashboardLayout, DashboardWidget } from './layouts'
export type { StackLayoutProps, SplitLayoutProps, GridLayoutProps, DashboardLayoutProps, DashboardWidgetProps } from './layouts'

// Accessibility
export {
  createFocusTrap, focusRingClasses, skipToContentId, getSkipToContentProps,
  liveRegion, describedBy, labelledBy, visuallyHidden, controls, expandable, busy, ariaId, announce,
  hexToRgb, relativeLuminance, contrastRatio, meetsWcagAA, meetsWcagAAA,
  motionSafeClasses, prefersReducedMotion, getTransitionDuration, reducedMotionCSS,
} from './a11y'
export type { FocusTrapOptions } from './a11y'
