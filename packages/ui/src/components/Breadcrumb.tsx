/**
 * Breadcrumb — Auto-generated from current route with clickable segments.
 */
import { cn } from '../utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Max items to show before truncating (default 4) */
  maxItems?: number
  /** Click handler for navigation */
  onNavigate?: (href: string) => void
  className?: string
}

/**
 * Generate breadcrumb items from a URL pathname.
 * e.g. "/agents/123/edit" → [{ label: "Home", href: "/" }, { label: "Agents", href: "/agents" }, ...]
 */
export function breadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    items.push({ label, href: currentPath })
  }

  // Last item has no href (current page)
  if (items.length > 1) {
    items[items.length - 1] = { ...items[items.length - 1], href: undefined }
  }

  return items
}

export function Breadcrumb({ items, maxItems = 4, onNavigate, className }: BreadcrumbProps) {
  let displayItems = items

  if (items.length > maxItems) {
    displayItems = [
      items[0],
      { label: '...', href: undefined },
      ...items.slice(-(maxItems - 2)),
    ]
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      <ol className="flex items-center gap-1.5">
        {displayItems.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="w-3.5 h-3.5 text-[#a3a08e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            )}
            {item.href && onNavigate ? (
              <button
                onClick={() => onNavigate(item.href!)}
                className="text-[#6b705c] hover:text-[#283618] transition-colors truncate max-w-[120px]"
              >
                {item.label}
              </button>
            ) : (
              <span className={cn(
                'truncate max-w-[160px]',
                item.href ? 'text-[#6b705c]' : 'text-[#1a1a1a] font-medium',
              )}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
