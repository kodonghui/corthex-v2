/**
 * Story 23.16 — State Management Migration Tests (Zustand 5 + React Query 5)
 */
import { describe, test, expect, beforeEach } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const appSrc = resolve(__dirname, '..')

describe('State Management: Zustand Stores', () => {
  // ── ui-store ──
  test('ui-store exists and exports useUiStore', () => {
    const src = readFileSync(resolve(appSrc, 'stores/ui-store.ts'), 'utf-8')
    expect(src).toContain('export const useUiStore')
    expect(src).toContain("from 'zustand'")
  })

  test('ui-store has sidebar, mobile, command palette state', () => {
    const src = readFileSync(resolve(appSrc, 'stores/ui-store.ts'), 'utf-8')
    expect(src).toContain('sidebarCollapsed')
    expect(src).toContain('mobileMenuOpen')
    expect(src).toContain('commandPaletteOpen')
  })

  test('ui-store uses persist middleware', () => {
    const src = readFileSync(resolve(appSrc, 'stores/ui-store.ts'), 'utf-8')
    expect(src).toContain("from 'zustand/middleware'")
    expect(src).toContain('persist(')
    expect(src).toContain("name: 'corthex-ui'")
  })

  test('ui-store has toggle and set actions', () => {
    const src = readFileSync(resolve(appSrc, 'stores/ui-store.ts'), 'utf-8')
    expect(src).toContain('toggleSidebar')
    expect(src).toContain('setSidebarCollapsed')
    expect(src).toContain('setMobileMenuOpen')
    expect(src).toContain('setCommandPaletteOpen')
  })

  // ── ui-store runtime tests ──
  test('ui-store: toggleSidebar flips state', async () => {
    const { useUiStore } = await import('../stores/ui-store')
    useUiStore.setState({ sidebarCollapsed: false })
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })

  test('ui-store: setMobileMenuOpen', async () => {
    const { useUiStore } = await import('../stores/ui-store')
    useUiStore.getState().setMobileMenuOpen(true)
    expect(useUiStore.getState().mobileMenuOpen).toBe(true)
    useUiStore.getState().setMobileMenuOpen(false)
    expect(useUiStore.getState().mobileMenuOpen).toBe(false)
  })

  test('ui-store: setCommandPaletteOpen', async () => {
    const { useUiStore } = await import('../stores/ui-store')
    useUiStore.getState().setCommandPaletteOpen(true)
    expect(useUiStore.getState().commandPaletteOpen).toBe(true)
  })

  // ── Existing stores use Zustand v5 patterns ──
  test('auth-store uses zustand create()', () => {
    const src = readFileSync(resolve(appSrc, 'stores/auth-store.ts'), 'utf-8')
    expect(src).toContain("from 'zustand'")
    expect(src).toContain('create<')
  })

  test('notification-store uses zustand create()', () => {
    const src = readFileSync(resolve(appSrc, 'stores/notification-store.ts'), 'utf-8')
    expect(src).toContain("from 'zustand'")
    expect(src).toContain('create<')
  })
})

describe('State Management: React Query Provider', () => {
  test('App.tsx has QueryClient with default options', () => {
    const src = readFileSync(resolve(appSrc, 'App.tsx'), 'utf-8')
    expect(src).toContain('new QueryClient({')
    expect(src).toContain('defaultOptions')
    expect(src).toContain('staleTime')
    expect(src).toContain('gcTime')
    expect(src).toContain('refetchOnWindowFocus: false')
  })

  test('App.tsx has QueryClientProvider', () => {
    const src = readFileSync(resolve(appSrc, 'App.tsx'), 'utf-8')
    expect(src).toContain('QueryClientProvider')
  })
})

describe('State Management: Query Hooks', () => {
  // ── useAgents ──
  test('useAgents hook exists with proper query keys', () => {
    const src = readFileSync(resolve(appSrc, 'hooks/queries/use-agents.ts'), 'utf-8')
    expect(src).toContain('export function useAgents')
    expect(src).toContain('agentKeys')
    expect(src).toContain('queryKey:')
    expect(src).toContain('queryFn:')
    expect(src).toContain('staleTime')
    expect(src).toContain('gcTime')
  })

  test('useAgent hook for single agent', () => {
    const src = readFileSync(resolve(appSrc, 'hooks/queries/use-agents.ts'), 'utf-8')
    expect(src).toContain('export function useAgent')
    expect(src).toContain('enabled: !!id')
  })

  test('agentKeys has hierarchical key factory', () => {
    const src = readFileSync(resolve(appSrc, 'hooks/queries/use-agents.ts'), 'utf-8')
    expect(src).toContain("all: ['agents']")
    expect(src).toContain('lists:')
    expect(src).toContain('details:')
    expect(src).toContain('detail:')
  })

  // ── useDepartments ──
  test('useDepartments hook exists with proper query keys', () => {
    const src = readFileSync(resolve(appSrc, 'hooks/queries/use-departments.ts'), 'utf-8')
    expect(src).toContain('export function useDepartments')
    expect(src).toContain('departmentKeys')
    expect(src).toContain('queryKey:')
    expect(src).toContain('queryFn:')
    expect(src).toContain('staleTime')
  })

  test('useDepartmentTree hook for hierarchical data', () => {
    const src = readFileSync(resolve(appSrc, 'hooks/queries/use-departments.ts'), 'utf-8')
    expect(src).toContain('export function useDepartmentTree')
    expect(src).toContain("tree:")
  })

  test('departmentKeys has hierarchical key factory', () => {
    const src = readFileSync(resolve(appSrc, 'hooks/queries/use-departments.ts'), 'utf-8')
    expect(src).toContain("all: ['departments']")
    expect(src).toContain('lists:')
    expect(src).toContain('details:')
    expect(src).toContain('tree:')
  })
})
