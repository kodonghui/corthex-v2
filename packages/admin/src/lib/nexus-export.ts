import { toPng, toSvg } from 'html-to-image'
import type { OrgChartData } from './elk-layout'

/**
 * Generate standardized filename: NEXUS-{companyName}-{YYYY-MM-DD}.{ext}
 */
export function generateFilename(companyName: string, ext: string): string {
  const sanitized = companyName.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 50)
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `NEXUS-${sanitized}-${date}.${ext}`
}

/**
 * Filter function to exclude Controls, MiniMap, Toolbar from export
 */
function exportFilter(node: HTMLElement): boolean {
  const cls = node.className?.toString?.() || ''
  if (cls.includes('react-flow__controls')) return false
  if (cls.includes('react-flow__minimap')) return false
  if (node.dataset?.testid === 'nexus-toolbar') return false
  return true
}

/**
 * Trigger browser download from a data URL or blob URL
 */
function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

/**
 * Export React Flow canvas as PNG (2x resolution)
 */
export async function exportToPng(element: HTMLElement, companyName: string): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    filter: exportFilter,
  })
  triggerDownload(dataUrl, generateFilename(companyName, 'png'))
}

/**
 * Export React Flow canvas as SVG
 */
export async function exportToSvg(element: HTMLElement, companyName: string): Promise<void> {
  const dataUrl = await toSvg(element, {
    backgroundColor: '#ffffff',
    filter: exportFilter,
  })
  triggerDownload(dataUrl, generateFilename(companyName, 'svg'))
}

/**
 * Export org chart data as JSON
 */
export function exportToJson(orgData: OrgChartData, companyName: string): void {
  const json = JSON.stringify(orgData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, generateFilename(companyName, 'json'))
  URL.revokeObjectURL(url)
}

/**
 * Print the canvas (window.print with print-optimized styles)
 */
export function printCanvas(): void {
  window.print()
}
