# Lighthouse Performance Checklist — CORTHEX v2

## Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| FCP (First Contentful Paint) | < 2.0s | Time until first text/image renders |
| LCP (Largest Contentful Paint) | < 2.5s | Time until largest visible element renders |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability score |
| FID (First Input Delay) | < 100ms | Time until page responds to first interaction |
| TTFB (Time to First Byte) | < 800ms | Server response time |

## Bundle Size Targets

| Chunk | Target | Actual |
|-------|--------|--------|
| Initial JS (compressed) | < 200KB | TBD |
| react-vendor | < 50KB | TBD |
| query-state | < 20KB | TBD |
| charts (lazy) | < 80KB | TBD |
| codemirror (lazy) | < 100KB | TBD |
| Total CSS | < 50KB | TBD |

## Optimization Checklist

### Lazy Loading
- [x] All page routes use React.lazy()
- [x] Suspense boundaries with loading fallback (PageSkeleton)
- [x] CodeMirror editor lazy-loaded in agents page
- [x] Heavy dependencies in separate chunks (manualChunks)

### Asset Optimization
- [x] Google Fonts preconnect + dns-prefetch
- [x] Inter, JetBrains Mono, Noto Serif KR loaded with display=swap
- [x] Theme color meta tag set (#faf8f5)
- [x] Viewport meta with viewport-fit=cover

### Bundle Analysis
- [x] rollup-plugin-visualizer configured (ANALYZE=true bun run build)
- [x] Manual chunks: react-vendor, query-state, charts, codemirror

### Caching Strategy
- [x] Hashed filenames in build output (Vite default)
- [x] React Query staleTime: 30s, gcTime: 5min
- [x] Cloudflare CDN cache purge on deploy

## How to Run

```bash
# Build with bundle analysis
ANALYZE=true bun run build --filter=@corthex/app

# View bundle report
open packages/app/dist/stats.html

# Run Lighthouse (requires Chrome)
npx lighthouse http://localhost:5174 --view
```
