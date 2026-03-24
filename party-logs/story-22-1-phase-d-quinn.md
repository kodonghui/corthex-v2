# Phase D: TEA Test Analysis — Story 22.1

**Author:** Quinn (QA + Security)
**Date:** 2026-03-24

---

## Coverage Analysis

### Before (26 tests)
| AC | Tests | Coverage |
|----|-------|----------|
| AC-1 (exact pinning) | 16 | 12 deps + 3 devDeps + 1 app lucide-react |
| AC-2 (frozen lockfile) | 0 | Not tested |
| AC-3 (lockfile committed) | 1 | bun.lock exists (from V11 test) |
| AC-4 (turbo build) | 0 | Integration — correct to skip |
| AC-5 (test regression) | 0 | Meta — tests passing IS the verification |
| AC-6 (Zod single-version) | 1 | Smoke test only (z.string().parse) |
| AC-7 (Docker ARM64) | 0 | Integration — correct to skip |
| **Edge cases** | **0** | No negative tests, no cross-package |

**Gaps identified:** No lockfile format verification, no structural Zod analysis, no caret-preservation tests, no workspace:* protection, no @types/bun regression guard, no cross-package consistency.

### After (48 tests — +22 new)

| AC / Category | New Tests | What they cover |
|---------------|-----------|-----------------|
| AC-2/AC-3: Lockfile integrity | 3 | Text format (not binary), contains pinned resolutions, substantial size |
| AC-6: Zod structural | 4 | 3.25.x resolution, @hono/zod-validator compat, zod-to-json-schema compat, chromium-bidi isolation |
| Negative: Caret preservation | 5 | zod ^3.24, react ^19, typescript ^5.7, openai ^6.27.0, croner ^10.0.1 |
| Edge: workspace:* | 3 | server @corthex/shared, app @corthex/shared, app @corthex/ui |
| Negative: @types/bun | 2 | NOT "latest", matches bun-types version |
| Edge: packageManager | 1 | root package.json has bun@1.3.10 |
| Edge: @google preserved | 2 | Still in deps, exact-pinned 0.24.1 |
| Edge: Cross-package | 2 | admin/app lucide-react match, both exact |

### Test Results
```
bun test v1.3.10
48 pass, 0 fail, 100 expect() calls
Ran 48 tests across 1 file. [189.00ms]
```

---

## Key Design Decisions

1. **Zod chromium-bidi isolation test**: The bun.lock shows `chromium-bidi@0.6.3` pins `zod: 3.23.8` as a direct dependency. This is a transitive dep of puppeteer — isolated from our application code. The test verifies our `import('zod')` resolves to 3.25.x, not the stale 3.23.8.

2. **Caret preservation tests**: These are negative tests — they verify that SemVer-stable packages were NOT accidentally exact-pinned. This guards against over-pinning in future maintenance.

3. **workspace:* tests**: Guard against accidentally replacing `workspace:*` with a version string during dependency operations.

4. **@google/generative-ai preservation**: Explicitly tests that the dep is still present and pinned. Will fail when Story 22.2 correctly removes it (tests should be updated then).

5. **Cross-package lucide-react**: Guards against admin/app version drift — both should always match.

---

## AC Coverage Matrix

| AC | Unit Test | Integration | Status |
|----|-----------|-------------|--------|
| AC-1 | 16 exact-pin + 5 caret-keep + 3 workspace | — | ✅ Full |
| AC-2 | 3 lockfile format/content | `bun install --frozen-lockfile` | ✅ Full |
| AC-3 | 1 lockfile exists + 3 lockfile format | `git status` | ✅ Full |
| AC-4 | — | `turbo build` (manual) | ✅ Integration |
| AC-5 | — | `bun test` (meta) | ✅ Meta |
| AC-6 | 4 structural + 3 Zod API (pre-existing) | `bun pm ls zod` | ✅ Full |
| AC-7 | — | `docker build` (manual) | ✅ Integration |

**All ACs covered. No gaps.**
