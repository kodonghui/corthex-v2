#!/usr/bin/env bun
/**
 * CSS Audit Tool — CORTHEX v2
 * Scans page files for design system compliance.
 *
 * Usage: bun tools/css-audit.ts [--fix]
 */

import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const PAGES_DIR = join(import.meta.dir, '../packages/app/src/pages')
const COMPONENTS_DIR = join(import.meta.dir, '../packages/app/src/components')

// Natural Organic approved hex colors
const APPROVED_COLORS = new Set([
  '#faf8f5', '#283618', '#5a7247', '#606c38', '#e5e1d3', '#d4cfc4',
  '#f5f0e8', '#f0ebe0', '#1a1a1a', '#6b705c', '#908a78', '#756e5a',
  '#a3a08e',
  '#4d7c0f', '#b45309', '#dc2626', '#c4622d', '#2563eb',
  '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#a3b18a',
  '#ffffff', '#000000',
])

// Forbidden dark-mode Tailwind classes
const FORBIDDEN_PATTERNS = [
  /text-slate-50\b/,
  /text-slate-100\b/,
  /text-slate-200\b/,
  /bg-slate-900\b/,
  /bg-slate-800\b/,
  /bg-zinc-900\b/,
  /bg-zinc-800\b/,
]

// Legacy pages that are exempt (redirects or special dark canvases)
const LEGACY_EXEMPTIONS = ['sketchvibe', 'command-center', 'cron-base', 'home.', 'session-sidebar']

function getFilesRecursive(dir: string, ext: string): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...getFilesRecursive(full, ext))
      } else if (entry.name.endsWith(ext)) {
        results.push(full)
      }
    }
  } catch { /* dir may not exist */ }
  return results
}

interface AuditResult {
  file: string
  unapprovedColors: string[]
  forbiddenClasses: string[]
}

function auditFile(filePath: string): AuditResult | null {
  const content = readFileSync(filePath, 'utf8')
  const shortPath = filePath.replace(PAGES_DIR, 'pages/').replace(COMPONENTS_DIR, 'components/')

  // Skip legacy/exempt files
  if (LEGACY_EXEMPTIONS.some(ex => shortPath.includes(ex))) return null

  const colorRegex = /#[0-9a-fA-F]{6}/g
  const unapprovedColors: string[] = []
  const matches = content.match(colorRegex) || []
  for (const match of matches) {
    if (!APPROVED_COLORS.has(match.toLowerCase())) {
      unapprovedColors.push(match)
    }
  }

  const forbiddenClasses: string[] = []
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      forbiddenClasses.push(pattern.source)
    }
  }

  if (unapprovedColors.length === 0 && forbiddenClasses.length === 0) return null

  return { file: shortPath, unapprovedColors, forbiddenClasses }
}

// Run audit
const pageFiles = getFilesRecursive(PAGES_DIR, '.tsx')
const componentFiles = getFilesRecursive(COMPONENTS_DIR, '.tsx')
const allFiles = [...pageFiles, ...componentFiles]

const issues: AuditResult[] = []
let totalColors = 0
let approvedColors = 0

for (const file of pageFiles) {
  const content = readFileSync(file, 'utf8')
  const colorMatches = content.match(/#[0-9a-fA-F]{6}/g) || []
  totalColors += colorMatches.length
  approvedColors += colorMatches.filter(c => APPROVED_COLORS.has(c.toLowerCase())).length
}

for (const file of allFiles) {
  const result = auditFile(file)
  if (result) issues.push(result)
}

const compliance = totalColors > 0 ? ((approvedColors / totalColors) * 100).toFixed(1) : '100.0'

console.log('=== CORTHEX CSS Design System Audit ===')
console.log(`Files scanned: ${allFiles.length}`)
console.log(`Color compliance (pages): ${compliance}% (${approvedColors}/${totalColors})`)
console.log(`Issues found: ${issues.length}`)
console.log()

if (issues.length > 0) {
  for (const issue of issues) {
    console.log(`❌ ${issue.file}`)
    if (issue.unapprovedColors.length > 0) {
      console.log(`   Unapproved colors: ${[...new Set(issue.unapprovedColors)].join(', ')}`)
    }
    if (issue.forbiddenClasses.length > 0) {
      console.log(`   Forbidden classes: ${issue.forbiddenClasses.join(', ')}`)
    }
  }
} else {
  console.log('✅ All files comply with Natural Organic design system')
}

process.exit(issues.length > 0 ? 1 : 0)
