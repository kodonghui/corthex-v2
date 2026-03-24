/**
 * Story 23.18 — Dashboard & Hub Page Redesign Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const hubDashboardPath = resolve(__dirname, '..', 'components/hub/hub-dashboard.tsx')

describe('Hub Dashboard Redesign', () => {
  const src = readFileSync(hubDashboardPath, 'utf-8')

  // ── Component export ──
  test('HubDashboard is exported', () => {
    expect(src).toContain('export function HubDashboard')
  })

  // ── Welcome header ──
  test('has welcome header with greeting', () => {
    expect(src).toContain('data-testid="hub-welcome-header"')
    expect(src).toContain('getGreeting')
    expect(src).toContain('Good morning')
    expect(src).toContain('Good afternoon')
    expect(src).toContain('Good evening')
  })

  test('shows welcome back message', () => {
    expect(src).toContain("Welcome back. Here's what's happening today.")
  })

  // ── Stats cards ──
  test('has stats cards section', () => {
    expect(src).toContain('data-testid="hub-stats-cards"')
    expect(src).toContain('function StatsCard')
  })

  test('shows agents online stat', () => {
    expect(src).toContain('Agents Online')
    expect(src).toContain('summary.agents.active')
  })

  test('shows active tasks stat', () => {
    expect(src).toContain('Active Tasks')
    expect(src).toContain('summary.tasks.inProgress')
  })

  test('shows recent handoffs stat', () => {
    expect(src).toContain('Recent Handoffs')
  })

  test('shows cost today stat', () => {
    expect(src).toContain('Cost Today')
    expect(src).toContain('todayUsd')
  })

  // ── Activity feed ──
  test('has recent activity feed', () => {
    expect(src).toContain('data-testid="hub-activity-feed"')
    expect(src).toContain('Recent Activity')
    expect(src).toContain('ActivityFeedItem')
  })

  test('activity feed has time ago', () => {
    expect(src).toContain('function getTimeAgo')
    expect(src).toContain('just now')
    expect(src).toContain('ago')
  })

  test('activity feed links to activity log', () => {
    expect(src).toContain('/activity-log')
    expect(src).toContain('View all')
  })

  // ── Quick actions ──
  test('has quick actions section', () => {
    expect(src).toContain('data-testid="hub-quick-actions"')
    expect(src).toContain('Quick Actions')
  })

  test('quick action: New Conversation', () => {
    expect(src).toContain('New Conversation')
    expect(src).toContain("'/chat'")
  })

  test('quick action: View Agents', () => {
    expect(src).toContain('View Agents')
    expect(src).toContain("'/agents'")
  })

  test('quick action: Organization', () => {
    expect(src).toContain('Organization')
    expect(src).toContain("'/nexus'")
  })

  // ── Responsive grid ──
  test('uses responsive grid layout', () => {
    expect(src).toContain('grid-cols-2 md:grid-cols-4')
    expect(src).toContain('grid-cols-1 lg:grid-cols-3')
    expect(src).toContain('lg:col-span-2')
  })

  // ── Loading skeleton ──
  test('has loading skeleton', () => {
    expect(src).toContain('data-testid="hub-stats-skeleton"')
    expect(src).toContain('animate-pulse')
  })

  // ── Natural Organic theme ──
  test('uses Natural Organic theme colors', () => {
    expect(src).toContain('#283618') // dark olive
    expect(src).toContain('#5a7247') // olive
    expect(src).toContain('#6b705c') // muted
    expect(src).toContain('#e5e1d3') // sand
    expect(src).toContain('#faf8f5') // cream bg
  })

  // ── Uses DashboardSummary type ──
  test('fetches dashboard summary data', () => {
    expect(src).toContain('DashboardSummary')
    expect(src).toContain("['dashboard-summary']")
    expect(src).toContain('/workspace/dashboard/summary')
  })

  // ── data-testid ──
  test('has data-testid for main component', () => {
    expect(src).toContain('data-testid="hub-dashboard"')
  })
})
