# Phase 7-2: Routing Plan

> Audit date: 2026-03-15
> Source: App.tsx (29 lazy routes), sidebar.tsx (4 nav sections, 28 items), web-stitch-prompt.md (9 Stitch screens)

---

## 1. Current Routes to Stitch Screen Mapping

| Current Route | Page Component | Stitch Screen | Notes |
|---|---|---|---|
| `/login` | LoginPage | -- | Outside layout, no Stitch screen |
| `/onboarding` | OnboardingPage | -- | Outside layout, no Stitch screen |
| `/` (index) | HomePage | -- | No Stitch screen; redirect to `/hub` after redesign (see Section 4) |
| `/hub` | HubPage | **Screen 2: Hub Page** | AI command center + tracker panel |
| `/chat` | ChatPage | **Screen 3: Chat Page** | Conversation interface |
| `/dashboard` | DashboardPage | **Screen 4: Dashboard Page** | Ops overview with charts |
| `/agents` | AgentsPage | **Screen 5: Agents List + Detail** | CRUD agent management |
| `/departments` | DepartmentsPage | **Screen 6: Departments List + Detail** | CRUD department management |
| `/jobs` | JobsPage | **Screen 7: Jobs / ARGOS List** | Merged Jobs + ARGOS view |
| `/settings` | SettingsPage | **Screen 8: Settings Page** | 5-tab settings |
| `/nexus` | NexusPage | **Screen 9: NEXUS Page** | Canvas with collapsed sidebar |
| -- (shell) | Layout | **Screen 1: App Shell** | Sidebar + TopBar wrapper |
| `/command-center` | CommandCenterPage | -- | No Stitch screen |
| `/reports` | ReportsPage | -- | No Stitch screen |
| `/reports/:id` | ReportsPage | -- | No Stitch screen |
| `/sns` | SnsPage | -- | No Stitch screen |
| `/messenger` | MessengerPage | -- | No Stitch screen |
| `/trading` | TradingPage | -- | No Stitch screen |
| `/files` | FilesPage | -- | No Stitch screen |
| `/org` | OrgPage | -- | No Stitch screen |
| `/ops-log` | OpsLogPage | -- | No Stitch screen |
| `/notifications` | NotificationsPage | -- | No Stitch screen |
| `/activity-log` | ActivityLogPage | -- | No Stitch screen |
| `/costs` | CostsPage | -- | No Stitch screen |
| `/cron` | CronBasePage | -- | No Stitch screen (merged into Jobs/ARGOS) |
| `/argos` | ArgosPage | -- | No Stitch screen (merged into Jobs/ARGOS) |
| `/agora` | AgoraPage | -- | No Stitch screen |
| `/classified` | ClassifiedPage | -- | No Stitch screen |
| `/knowledge` | KnowledgePage | -- | No Stitch screen |
| `/performance` | PerformancePage | -- | No Stitch screen |
| `/tiers` | TiersPage | -- | No Stitch screen |

**Summary**: 9 Stitch screens cover 9 routes (shell + 8 pages). 19 routes have no Stitch screen.

---

## 2. Nav Reorganization: Current vs Stitch Design

### Current Sidebar (4 sections, 28 items)

| Section | Items |
|---|---|
| (unnamed) | 홈, 허브, 사령관실 |
| 업무 | 채팅, 전략실, AGORA 토론, 야간작업, 보고서, 파일 |
| 운영 | 조직도, 부서 관리, 에이전트 관리, 계층 관리, SNS, 메신저, 작전현황, 비용 분석, 통신로그, 작전일지, 기밀문서, 전력분석, 정보국, 크론기지, ARGOS, NEXUS |
| 시스템 | 알림, 설정 |

### Stitch Screen 1 Sidebar (4 sections, 24 items)

| Section | Items (Stitch label) | Route |
|---|---|---|
| **COMMAND** | Dashboard | `/dashboard` |
| | Hub | `/hub` |
| | NEXUS | `/nexus` |
| | Chat | `/chat` |
| **ORGANIZATION** | Agents | `/agents` |
| | Departments | `/departments` |
| | Jobs | `/jobs` |
| | Reports | `/reports` |
| **TOOLS** | SNS | `/sns` |
| | Trading | `/trading` |
| | Messenger | `/messenger` |
| | Library | `/knowledge` |
| | Agora | `/agora` |
| | Files | `/files` |
| **SYSTEM** | Costs | `/costs` |
| | Performance | `/performance` |
| | Activity Log | `/activity-log` |
| | Tiers | `/tiers` |
| | Ops Log | `/ops-log` |
| | Classified | `/classified` |
| | Settings | `/settings` |

### Items Removed from Stitch Nav (exist in current, absent in Stitch design)

| Current Item | Current Route | Disposition |
|---|---|---|
| 홈 (Home) | `/` | **Remove from nav**. Redirect `/` to `/hub`. Hub is the new default landing. |
| 사령관실 (Command Center) | `/command-center` | **Remove from nav**. Functionality absorbed by Hub. Route kept for backward compat (redirect to `/hub`). |
| 조직도 (Org Chart) | `/org` | **Remove from nav**. Functionality lives in NEXUS. Route kept, redirect to `/nexus`. |
| 크론기지 (Cron Base) | `/cron` | **Remove from nav**. Merged into Jobs/ARGOS (Screen 7). Route kept, redirect to `/jobs`. |
| ARGOS | `/argos` | **Remove from nav**. Merged into Jobs/ARGOS (Screen 7). Route kept, redirect to `/jobs`. |
| 알림 (Notifications) | `/notifications` | **Remove from nav**. Accessible via TopBar bell icon. Route kept. |

### Items Renamed in Stitch Nav

| Current Label | Stitch Label | Route |
|---|---|---|
| 정보국 (Library) | Library | `/knowledge` |
| 야간작업 (Jobs) | Jobs | `/jobs` |
| 작전현황 (Dashboard) | Dashboard | `/dashboard` |
| 전략실 (Trading) | Trading | `/trading` |
| 통신로그 (Activity Log) | Activity Log | `/activity-log` |
| 작전일지 (Ops Log) | Ops Log | `/ops-log` |
| 기밀문서 (Classified) | Classified | `/classified` |
| 전력분석 (Performance) | Performance | `/performance` |
| 계층 관리 (Tiers) | Tiers | `/tiers` |

> Note: Korean labels will be kept in the UI. The Stitch design uses English section headers (COMMAND, ORGANIZATION, TOOLS, SYSTEM) with Korean item labels.

---

## 3. New Nav Section Structure

```typescript
// New sidebar nav structure matching Stitch Screen 1
const navSections: NavSection[] = [
  {
    label: 'COMMAND',
    items: [
      { to: '/dashboard', label: '작전현황', icon: 'LayoutDashboard' },
      { to: '/hub', label: '허브', icon: 'Terminal' },
      { to: '/nexus', label: 'NEXUS', icon: 'Network' },
      { to: '/chat', label: '채팅', icon: 'MessageSquare' },
    ],
  },
  {
    label: 'ORGANIZATION',
    items: [
      { to: '/agents', label: '에이전트', icon: 'Bot' },
      { to: '/departments', label: '부서', icon: 'Building2' },
      { to: '/jobs', label: '작업', icon: 'Clock' },
      { to: '/reports', label: '보고서', icon: 'FileText' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/sns', label: 'SNS', icon: 'Share2' },
      { to: '/trading', label: '전략실', icon: 'TrendingUp' },
      { to: '/messenger', label: '메신저', icon: 'Send' },
      { to: '/knowledge', label: '정보국', icon: 'BookOpen' },
      { to: '/agora', label: 'AGORA', icon: 'Users' },
      { to: '/files', label: '파일', icon: 'FolderOpen' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/costs', label: '비용 분석', icon: 'DollarSign' },
      { to: '/performance', label: '전력분석', icon: 'Activity' },
      { to: '/activity-log', label: '통신로그', icon: 'History' },
      { to: '/tiers', label: '계층 관리', icon: 'Layers' },
      { to: '/ops-log', label: '작전일지', icon: 'Shield' },
      { to: '/classified', label: '기밀문서', icon: 'Lock' },
      { to: '/settings', label: '설정', icon: 'Settings' },
    ],
  },
]
```

**Key changes from current sidebar**:
- Emoji icons replaced with Lucide icon names (match Stitch spec)
- 28 items reduced to 24 (6 removed/merged)
- 4 sections renamed: (unnamed)/업무/운영/시스템 -> COMMAND/ORGANIZATION/TOOLS/SYSTEM
- NEXUS promoted from 운영 to COMMAND
- Dashboard promoted from 운영 to COMMAND
- Agents/Departments promoted from 운영 to ORGANIZATION

---

## 4. Routes with No Stitch Screen (Keep As-Is)

These routes have no Stitch-generated screen. They keep their current page components and receive only the design-system token updates (colors, typography, spacing) from Phase 7-1.

| Route | Page | Strategy |
|---|---|---|
| `/login` | LoginPage | Keep. Apply design tokens only. |
| `/onboarding` | OnboardingPage | Keep. Apply design tokens only. |
| `/reports` | ReportsPage | Keep. Apply design tokens only. |
| `/reports/:id` | ReportsPage | Keep. Apply design tokens only. |
| `/sns` | SnsPage | Keep. Apply design tokens only. |
| `/messenger` | MessengerPage | Keep. Apply design tokens only. |
| `/trading` | TradingPage | Keep. Apply design tokens only. |
| `/files` | FilesPage | Keep. Apply design tokens only. |
| `/ops-log` | OpsLogPage | Keep. Apply design tokens only. |
| `/activity-log` | ActivityLogPage | Keep. Apply design tokens only. |
| `/costs` | CostsPage | Keep. Apply design tokens only. |
| `/agora` | AgoraPage | Keep. Apply design tokens only. |
| `/classified` | ClassifiedPage | Keep. Apply design tokens only. |
| `/knowledge` | KnowledgePage | Keep. Apply design tokens only. |
| `/performance` | PerformancePage | Keep. Apply design tokens only. |
| `/tiers` | TiersPage | Keep. Apply design tokens only. |
| `/notifications` | NotificationsPage | Keep (TopBar bell links here). Apply design tokens only. |

### Redirect Routes (new)

| Route | Redirect To | Reason |
|---|---|---|
| `/` (index) | `/hub` | Hub is new default landing |
| `/command-center` | `/hub` | Absorbed by Hub |
| `/org` | `/nexus` | Absorbed by NEXUS |
| `/cron` | `/jobs` | Merged into Jobs/ARGOS |
| `/argos` | `/jobs` | Merged into Jobs/ARGOS |

After redirects are in place, the following pages can be deleted in a later cleanup:
- `pages/home.tsx` (replaced by redirect)
- `pages/command-center.tsx` (replaced by redirect)
- `pages/org.tsx` (replaced by redirect)
- `pages/cron-base.tsx` (replaced by redirect)
- `pages/argos.tsx` (replaced by redirect)

---

## 5. Lazy Loading Strategy

### Current State
All 29 page components already use `React.lazy()`. This is correct.

### Recommended Strategy

**Tier 1 — Eager (no lazy)**: None. All pages should remain lazy. The App Shell (Layout + Sidebar + TopBar) is already eagerly loaded.

**Tier 2 — Prefetch on shell mount (high-traffic pages)**:
These pages should be prefetched after the shell renders (idle callback or `requestIdleCallback`):

| Route | Reason |
|---|---|
| `/hub` | Default landing, loaded on every session |
| `/dashboard` | First COMMAND item, frequent access |
| `/chat` | High-interaction page |

Implementation:
```typescript
// In Layout.tsx, after mount:
useEffect(() => {
  const idle = requestIdleCallback(() => {
    import('./pages/hub')
    import('./pages/dashboard')
    import('./pages/chat')
  })
  return () => cancelIdleCallback(idle)
}, [])
```

**Tier 3 — Lazy on navigation (default)**:
All other pages load on first navigation. This is the current behavior and requires no change.

| Pages |
|---|
| agents, departments, jobs, reports, sns, trading, messenger, knowledge, agora, files, costs, performance, activity-log, tiers, ops-log, classified, settings, notifications, nexus, login, onboarding |

**Tier 4 — Heavy components within pages (code-split sub-chunks)**:
These should use secondary lazy boundaries inside their page component:

| Page | Heavy Component | Reason |
|---|---|---|
| `/nexus` | React Flow canvas | ~150KB library, only Chrome users |
| `/hub` | Markdown renderer | Only needed when viewing agent output |
| `/trading` | Chart library | Only needed when viewing charts |

### Suspense Fallback

Replace current `PageSkeleton` (generic 4-line skeleton) with route-aware skeletons:

| Route Group | Skeleton Pattern |
|---|---|
| Hub, Chat | Message-stream skeleton (avatar + lines) |
| Dashboard | Grid of card skeletons |
| Agents, Departments | Table skeleton (header + rows) |
| Settings | Form skeleton (labels + inputs) |
| NEXUS | Full-bleed canvas placeholder |
| Default | Current PageSkeleton (keep as fallback) |

---

## Implementation Order

1. **7-2a**: Replace Layout/Sidebar with Stitch App Shell (Screen 1)
2. **7-2b**: Update `navSections` to new 4-section structure (this doc, Section 3)
3. **7-2c**: Add redirect routes (`/` -> `/hub`, `/command-center` -> `/hub`, etc.)
4. **7-2d**: Replace page components with Stitch screens (Hub, Chat, Dashboard, Agents, Departments, Jobs, Settings, NEXUS) — one at a time
5. **7-2e**: Add prefetch for Tier 2 pages
6. **7-2f**: Add route-aware skeleton components
7. **7-2g**: Delete orphaned pages (home, command-center, org, cron-base, argos)
