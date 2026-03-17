# Phase 0: Project Auto-Detection — CORTHEX v2

## Build System
- **Package Manager**: Bun
- **Monorepo**: Turborepo (packages: server, app, admin, ui, shared, landing)
- **TypeScript**: 5.7, tsconfig.json at root + each package

## Frontend
### App (packages/app) — port 5174
- React 19 + Vite 6 + React Router 7
- Entry: src/main.tsx → src/App.tsx
- Layout: src/components/layout.tsx + sidebar.tsx
- Pages: src/pages/ (31 files)
- State: Zustand (auth-store.ts)
- Icons: lucide-react

### Admin (packages/admin) — port 5173, basename /admin
- React 19 + Vite 6 + React Router 7
- Entry: src/main.tsx → src/App.tsx
- Layout: src/components/layout.tsx + sidebar.tsx
- Pages: src/pages/ (26 files)
- State: Zustand (auth-store.ts)

## Design Tokens (Natural Organic / Sovereign Sage)
- Background: #faf8f5 (cream)
- Sidebar: #283618 (olive dark)
- Accent: #606c38 → #5a7247 (olive green)
- Text: #1a1a1a (primary), #6b705c (muted)
- Border: #e5e1d3 (sand)
- Font: Inter, Pretendard, Apple SD Gothic Neo
- Mono: JetBrains Mono, Fira Code

## Admin Routes (26)
/, /companies, /users, /employees, /departments, /agents, /credentials, /tools, /costs,
/report-lines, /soul-templates, /monitoring, /org-chart, /nexus, /org-templates,
/workflows, /template-market, /agent-marketplace, /api-keys, /agent-reports,
/mcp-servers, /mcp-access, /mcp-credentials, /settings, /onboarding, /login

## App Routes (24+ protected)
/hub, /chat, /dashboard, /nexus, /agents, /departments, /jobs, /tiers, /reports,
/workflows, /sketchvibe, /sns, /trading, /messenger, /knowledge, /agora, /files,
/costs, /performance, /activity-log, /ops-log, /classified, /settings, /notifications

## Auth
- Admin: localStorage corthex_admin_token, POST /admin/auth/login {username, password}
- App: localStorage corthex_token, POST /auth/login {email, password}
- Protected routes via <ProtectedRoute> HOC

## Test Runner
- bun:test (packages/server/src/__tests__/)

## MCP
- Stitch: HTTP (stitch.googleapis.com/mcp)
- Playwright: stdio (npx @playwright/mcp --headless)
