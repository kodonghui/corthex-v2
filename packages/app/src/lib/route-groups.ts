/**
 * Route Groups — Consolidation of 30+ pages into 6 logical groups.
 * Used by sidebar navigation and route configuration.
 */

export type RouteGroup = 'hub' | 'workspace' | 'library' | 'argos' | 'activity' | 'settings'

export interface RouteGroupConfig {
  id: RouteGroup
  label: string
  labelKo: string
  paths: string[]
}

export const routeGroups: RouteGroupConfig[] = [
  {
    id: 'hub',
    label: 'Hub',
    labelKo: '허브',
    paths: ['/hub', '/dashboard'],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    labelKo: '워크스페이스',
    paths: ['/chat', '/agents', '/departments', '/tiers', '/nexus', '/agora', '/memories', '/messenger'],
  },
  {
    id: 'library',
    label: 'Library',
    labelKo: '라이브러리',
    paths: ['/knowledge', '/files', '/classified', '/reports'],
  },
  {
    id: 'argos',
    label: 'ARGOS',
    labelKo: '아르고스',
    paths: ['/jobs', '/n8n-workflows', '/marketing-pipeline', '/marketing-approval'],
  },
  {
    id: 'activity',
    label: 'Activity',
    labelKo: '활동',
    paths: ['/activity-log', '/ops-log', '/notifications', '/costs', '/performance', '/sns', '/trading'],
  },
  {
    id: 'settings',
    label: 'Settings',
    labelKo: '설정',
    paths: ['/settings'],
  },
]

/** Old paths that should redirect to new canonical paths */
export const routeRedirects: Record<string, string> = {
  '/command-center': '/hub',
  '/org': '/nexus',
  '/cron': '/jobs',
  '/argos': '/jobs',
  '/workflows': '/n8n-workflows',
  '/home': '/hub',
}

/** Find which group a path belongs to */
export function getRouteGroup(path: string): RouteGroup | null {
  const normalized = '/' + path.split('/').filter(Boolean)[0]
  for (const group of routeGroups) {
    if (group.paths.includes(normalized)) return group.id
  }
  return null
}

/** Get the redirect target for a legacy path, or null */
export function getRedirectTarget(path: string): string | null {
  return routeRedirects[path] ?? null
}
