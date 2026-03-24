/**
 * Story 23.4 — Page Consolidation 14→6 Groups with Route Redirects
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { routeGroups, routeRedirects, getRouteGroup, getRedirectTarget } from '../lib/route-groups'

const appSource = readFileSync(resolve(__dirname, '../App.tsx'), 'utf-8')

// ── Route Groups ────────────────────────────────────
describe('Page Consolidation: Route Groups', () => {
  test('exactly 6 route groups defined', () => {
    expect(routeGroups.length).toBe(6)
  })

  test('group IDs match expected set', () => {
    const ids = routeGroups.map((g) => g.id)
    expect(ids).toContain('hub')
    expect(ids).toContain('workspace')
    expect(ids).toContain('library')
    expect(ids).toContain('argos')
    expect(ids).toContain('activity')
    expect(ids).toContain('settings')
  })

  test('hub group contains dashboard and hub', () => {
    const hub = routeGroups.find((g) => g.id === 'hub')!
    expect(hub.paths).toContain('/hub')
    expect(hub.paths).toContain('/dashboard')
  })

  test('workspace group contains chat, agents, departments, tiers', () => {
    const ws = routeGroups.find((g) => g.id === 'workspace')!
    expect(ws.paths).toContain('/chat')
    expect(ws.paths).toContain('/agents')
    expect(ws.paths).toContain('/departments')
    expect(ws.paths).toContain('/tiers')
  })

  test('library group contains knowledge, files', () => {
    const lib = routeGroups.find((g) => g.id === 'library')!
    expect(lib.paths).toContain('/knowledge')
    expect(lib.paths).toContain('/files')
  })

  test('argos group contains jobs, workflows', () => {
    const argos = routeGroups.find((g) => g.id === 'argos')!
    expect(argos.paths).toContain('/jobs')
    expect(argos.paths).toContain('/n8n-workflows')
  })

  test('activity group contains logs, costs, notifications', () => {
    const act = routeGroups.find((g) => g.id === 'activity')!
    expect(act.paths).toContain('/activity-log')
    expect(act.paths).toContain('/costs')
    expect(act.paths).toContain('/notifications')
  })
})

// ── Route Redirects ─────────────────────────────────
describe('Page Consolidation: Route Redirects', () => {
  test('command-center redirects to hub', () => {
    expect(routeRedirects['/command-center']).toBe('/hub')
  })

  test('org redirects to nexus', () => {
    expect(routeRedirects['/org']).toBe('/nexus')
  })

  test('cron redirects to jobs', () => {
    expect(routeRedirects['/cron']).toBe('/jobs')
  })

  test('argos redirects to jobs', () => {
    expect(routeRedirects['/argos']).toBe('/jobs')
  })

  test('workflows redirects to n8n-workflows', () => {
    expect(routeRedirects['/workflows']).toBe('/n8n-workflows')
  })

  test('home redirects to hub', () => {
    expect(routeRedirects['/home']).toBe('/hub')
  })
})

// ── Helper functions ────────────────────────────────
describe('Page Consolidation: Helper Functions', () => {
  test('getRouteGroup returns correct group', () => {
    expect(getRouteGroup('/hub')).toBe('hub')
    expect(getRouteGroup('/chat')).toBe('workspace')
    expect(getRouteGroup('/knowledge')).toBe('library')
    expect(getRouteGroup('/jobs')).toBe('argos')
    expect(getRouteGroup('/costs')).toBe('activity')
    expect(getRouteGroup('/settings')).toBe('settings')
  })

  test('getRouteGroup returns null for unknown path', () => {
    expect(getRouteGroup('/unknown')).toBeNull()
  })

  test('getRedirectTarget returns target for legacy path', () => {
    expect(getRedirectTarget('/command-center')).toBe('/hub')
  })

  test('getRedirectTarget returns null for non-redirect path', () => {
    expect(getRedirectTarget('/hub')).toBeNull()
  })
})

// ── App.tsx route structure ─────────────────────────
describe('Page Consolidation: App Routes', () => {
  test('App.tsx has GROUP 1-6 comments', () => {
    expect(appSource).toContain('GROUP 1: Hub')
    expect(appSource).toContain('GROUP 2: Workspace')
    expect(appSource).toContain('GROUP 3: Library')
    expect(appSource).toContain('GROUP 4: ARGOS')
    expect(appSource).toContain('GROUP 5: Activity')
    expect(appSource).toContain('GROUP 6: Settings')
  })

  test('App.tsx has REDIRECTS section', () => {
    expect(appSource).toContain('REDIRECTS: Legacy paths')
  })

  test('all redirects use Navigate with replace', () => {
    const redirectLines = appSource.split('\n').filter((l) => l.includes('Navigate to='))
    for (const line of redirectLines) {
      expect(line).toContain('replace')
    }
  })
})
