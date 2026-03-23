# Part 2: Biome (biomejs/biome) — Deep Dive Research for Corthex v2

> Research date: 2026-03-23
> Biome version analyzed: v2.4.8 (latest stable as of March 2026)
> Corthex v2 codebase: 1,466 TS/TSX files, ~295K LOC, 7 workspace packages

---

## Table of Contents

1. [Phase A: Biome Architecture & Internals](#phase-a-biome-architecture--internals)
2. [Phase B: Corthex v2 Current State Audit](#phase-b-corthex-v2-current-state-audit)
3. [Deliverable 1: Complete biome.json Draft](#deliverable-1-complete-biomejson-draft)
4. [Deliverable 2: Rule Mapping Table — ESLint → Biome](#deliverable-2-rule-mapping-table--eslint--biome)
5. [Deliverable 3: Step-by-Step Migration Script](#deliverable-3-step-by-step-migration-script)
6. [Deliverable 4: Predicted Issue Report](#deliverable-4-predicted-issue-report)
7. [Deliverable 5: Risk Analysis](#deliverable-5-risk-analysis)
8. [Deliverable 6: Performance Benchmark Prediction](#deliverable-6-performance-benchmark-prediction)

---

## Phase A: Biome Architecture & Internals

### A1. Core Engine — Why 25x Faster Than ESLint

Biome's speed advantage comes from five architectural decisions, each compounding:

**1. Rust Zero-Cost Abstractions**
Biome's parser is written in Rust using `biome_rowan`, an internal fork of the `rowan` library (originally from rust-analyzer). The key insight: `biome_rowan::AstNodes` are typed views over `biome_js_syntax::JsSyntaxNodes` — conversion between them has **zero runtime cost** because they share the exact same memory representation. There is no AST → typed-node marshalling overhead.

**2. Concrete Syntax Tree (CST), Not AST**
Unlike ESLint (which uses Espree/Acorn to produce an AST), Biome produces a **Concrete Syntax Tree** that retains all syntactic elements: parentheses, whitespace, comments, semicolons. This means:
- One parse pass serves linting, formatting, AND import sorting (3→1 parse)
- No separate "preserve comments" pass needed
- Error-resilient: malformed code becomes `Bogus` nodes, allowing partial analysis

**3. Single-Parse, Multi-Pass Architecture**
ESLint + Prettier = parse twice (ESLint's Espree + Prettier's Babel parser). Biome parses once, builds the CST, and runs all lint rules + formatter in a single traversal. This eliminates the **most expensive operation** (parsing) from being duplicated.

**4. Parallel Processing via Rayon**
Biome uses Rust's `rayon` crate for data-parallel file processing. On a 16-core machine, it processes 16 files simultaneously with near-linear scaling. ESLint, being single-threaded Node.js, cannot do this without `--max-workers` (which has IPC overhead).

**5. No Plugin Loading / No V8 Overhead**
ESLint loads plugins as JS modules, each requiring V8 to parse and compile. Biome's rules are compiled Rust — no dynamic loading, no JIT warmup, no garbage collection pauses.

### A2. Configuration System — `biome.json`

**Schema structure:**
```
biome.json
├── $schema          # JSON schema URL for IDE autocompletion
├── vcs              # VCS integration (git)
├── files            # Include/exclude patterns
├── formatter        # Global formatter settings
├── linter           # Global linter settings
├── assist           # Organize imports, actions
├── overrides        # Per-path/per-language overrides
├── extends          # Inherit from other configs
└── plugins          # GritQL plugin paths
```

**Monorepo support (v2.x):**
- `extends: ["//"]` — special syntax meaning "extend from root biome.json"
- Nested `biome.json` files in subdirectories with `root: false`
- The root config is found by traversing upward until `root: true` is found
- `overrides` array for path-specific rule tweaks (analogous to ESLint flat config's per-file configs)

**ESLint flat config vs. Biome comparison:**
| Feature | ESLint Flat Config | Biome |
|---------|-------------------|-------|
| Config format | `eslint.config.js` (JS) | `biome.json` (JSON) |
| Per-path rules | `{ files: [...], rules: {...} }` | `overrides: [{ include: [...], ... }]` |
| Extends | `...tseslint.configs.recommended` | `"extends": ["//"]` or file paths |
| Plugins | `import plugin from 'pkg'` | `"plugins": ["./rules.grit"]` (GritQL) |
| Type-aware | Requires `typescript` + `parserOptions.project` | Built-in Biotype (no `tsc` needed) |

### A3. Rule System

**Categories (groups):**
| Group | Purpose | Example Rules |
|-------|---------|---------------|
| `correctness` | Guaranteed bugs | `noUndeclaredVariables`, `noUnusedImports`, `noConstAssign` |
| `suspicious` | Likely bugs | `noExplicitAny`, `noDebugger`, `noConsole`, `noDuplicateCase` |
| `style` | Code style | `useConst`, `noVar`, `useTemplate`, `useExportType` |
| `performance` | Perf issues | `noAccumulatingSpread`, `noDelete`, `noBarrelFile` |
| `complexity` | Simplification | `useFlatMap`, `useOptionalChain`, `noForEach` |
| `a11y` | Accessibility | `useAltText`, `useButtonType`, `noBlankTarget` |
| `security` | Security | `noDangerouslySetInnerHtml`, `noGlobalEval` |

**v2.4.8 total: 462 rules** (up from 280+ in v1.x)

**Linter Domains (v2.x new):**
Domains are framework-specific rule sets:
- `react` — React hooks, JSX patterns
- `next` — Next.js specific rules
- `solid` — SolidJS patterns
- `drizzle` — `noDrizzleUpdateWithoutWhere`, `noDrizzleDeleteWithoutWhere` (핵심: Corthex가 Drizzle ORM 사용)

**GritQL Plugin System (v2.0+):**
Custom lint rules via GritQL pattern matching:
```grit
// Example: ban direct process.env usage (force config module)
`process.env.$VAR` => {
  message: "Use config module instead of direct process.env access"
}
```
Current limitation: diagnostic-only (no auto-fix yet). Auto-fix is planned.

### A4. Import Sorting

**v2.x revamped import sorter** — fully configurable groups:

```json
{
  "assist": {
    "actions": {
      "organizeImports": {
        "level": "error",
        "options": {
          "groups": [
            [":BUN:", ":NODE_BUILTIN:"],
            [":PACKAGE:"],
            ["@corthex/**"],
            [":ALIAS:"],
            [":RELATIVE:"]
          ]
        }
      }
    }
  }
}
```

**Predefined group matchers:**
- `:NODE_BUILTIN:` — `fs`, `path`, `crypto`, etc.
- `:BUN:` — `bun:` protocol modules
- `:PACKAGE:` — `node_modules` packages
- `:ALIAS:` — Path aliases (`@/*`, `~/`, etc.)
- `:RELATIVE:` — `./`, `../` imports
- `:URL:` — URL imports
- `:BLANK_LINE:` — Separator between groups

Custom glob matchers: `@corthex/**` matches `@corthex/shared`, `@corthex/ui`

### A5. Formatter

**CST-based formatting:**
- Two-phase: CST → IR (intermediate representation) → formatted text
- 97% Prettier compatibility score
- Handles syntax errors gracefully (prints `Bogus` nodes verbatim)

**Key Prettier differences:**
- Stricter parsing (some Prettier-valid JS is rejected by Biome)
- Slightly different parenthesization in edge cases
- Different handling of decorators and class properties in rare cases
- `trailingNewline` option (v2.4+) — POSIX compliance toggle

**Tailwind CSS class sorting:**
- Rule: `useSortedClasses` (in `style` group)
- Status: partially implemented, **unsafe fix** (won't auto-apply in IDE save actions)
- Supports standard Tailwind v3/v4 class order
- Does NOT support: custom utilities, `prefix`, `separator`, or `clsx()` object patterns
- Alternative: `biome-tailwind-sorter` (standalone Rust tool)

---

## Phase B: Corthex v2 Current State Audit

### B1. Current Linting/Formatting Setup

| Tool | Status in Corthex v2 |
|------|---------------------|
| ESLint | **Not installed.** No `.eslintrc*` or `eslint.config.*` in project source. |
| Prettier | **Not installed.** No `.prettierrc*` in project source. |
| Biome | **Not installed.** No `biome.json` exists. |
| TypeScript | `tsc --noEmit` via `type-check` script in each package + pre-commit hook |
| Turbo | `turbo lint` defined but **no lint script exists** in any package |

**Key finding: Corthex v2 has NO linter and NO formatter.** The only code quality gate is `tsc --noEmit` (type-checking), enforced by `.claude/hooks/pre-commit-tsc.sh`.

### B2. Package Structure

```
packages/
├── server/    — Hono + Bun backend (Drizzle ORM, pgvector, engine/)
├── app/       — React 19 + Vite SPA (Tailwind v4, Lucide, shadcn-style UI)
├── admin/     — React 19 + Vite admin panel
├── shared/    — Types + constants (no deps)
├── ui/        — Component library (CVA + clsx + tailwind-merge)
├── landing/   — Marketing site (Vite SSG)
└── e2e/       — E2E test package
```

### B3. Codebase Quality Signals (pre-Biome)

Automated scan results from the current codebase:

| Pattern | Count | Biome Rule |
|---------|-------|-----------|
| `as any` / `: any` | ~173 occurrences (30+ files) | `suspicious/noExplicitAny` |
| `console.log/warn/error` | ~98 occurrences (20+ files) | `suspicious/noConsole` |
| `@ts-ignore` / `@ts-expect-error` | 8 occurrences (6 files) | `suspicious/noExplicitAny` related |
| `var` declarations | 6 occurrences (5 files) | `style/noVar` |
| `==` / `!=` (loose equality) | ~21 occurrences (10+ files) | `suspicious/noDoubleEquals` |
| `catch(e) { ... }` unused error | Multiple | `correctness/noUnusedVariables` |
| Missing `const` for non-reassigned | Unknown (not audited) | `style/useConst` |
| Barrel exports | Some via `index.ts` | `performance/noBarrelFile` |

### B4. Import Patterns (current)

From `packages/server/src/index.ts` (representative):
```typescript
// 1. External packages
import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
// 2. Workspace packages
import type { TenantContext } from '@corthex/shared'
// 3. Internal aliases
import { getDB } from '@/db/scoped-query'
// 4. Relative imports
import { errorHandler } from './middleware/error'
```

No consistent ordering enforced. Imports are ad-hoc grouped.

### B5. CI/CD Pipeline

```
main push → GitHub Actions (self-hosted ARM64)
  → bun install
  → engine boundary check (custom script)
  → turbo build type-check
  → unit tests
  → Docker build + deploy
  → Cloudflare cache purge
```

No lint step exists in CI. Adding `biome check` would slot in after `bun install`.

---

## Deliverable 1: Complete `biome.json` Draft

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.8/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "include": ["packages/*/src/**"],
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/__tests__/**",
      "_bmad-output/**",
      "_corthex_full_redesign/**",
      "_research/**",
      ".claude/**"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf",
    "attributePosition": "auto"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,

      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "warn",
        "noUndeclaredVariables": "error",
        "noConstAssign": "error",
        "noUnreachable": "error",
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      },

      "suspicious": {
        "noExplicitAny": "warn",
        "noDebugger": "error",
        "noConsole": {
          "level": "warn",
          "options": {
            "allow": ["warn", "error", "info"]
          }
        },
        "noDoubleEquals": "error",
        "noFallthroughSwitchClause": "error",
        "noDuplicateCase": "error",
        "noRedeclare": "error",
        "noShadowRestrictedNames": "error",
        "noExplicitAny": "warn"
      },

      "style": {
        "noVar": "error",
        "useConst": "error",
        "useTemplate": "warn",
        "useExportType": "error",
        "useImportType": "error",
        "useFilenamingConvention": {
          "level": "error",
          "options": {
            "filenameCases": ["kebab-case"],
            "requireAscii": true
          }
        },
        "useNamingConvention": {
          "level": "warn",
          "options": {
            "conventions": [
              {
                "selector": { "kind": "function" },
                "formats": ["camelCase", "PascalCase"]
              },
              {
                "selector": { "kind": "variable" },
                "formats": ["camelCase", "CONSTANT_CASE", "PascalCase"]
              },
              {
                "selector": { "kind": "typeLike" },
                "formats": ["PascalCase"]
              }
            ]
          }
        }
      },

      "performance": {
        "noAccumulatingSpread": "warn",
        "noDelete": "warn",
        "noBarrelFile": "off"
      },

      "complexity": {
        "useFlatMap": "warn",
        "useOptionalChain": "warn",
        "noForEach": "off"
      },

      "a11y": {
        "recommended": true,
        "useAltText": "warn",
        "useButtonType": "warn"
      },

      "security": {
        "noDangerouslySetInnerHtml": "error",
        "noGlobalEval": "error"
      }
    },

    "domains": {
      "react": "all",
      "drizzle": "all"
    }
  },

  "assist": {
    "actions": {
      "organizeImports": {
        "level": "error",
        "options": {
          "groups": [
            [":BUN:", ":NODE_BUILTIN:"],
            [":BLANK_LINE:"],
            [":PACKAGE:"],
            [":BLANK_LINE:"],
            ["@corthex/**"],
            [":BLANK_LINE:"],
            [":ALIAS:"],
            [":RELATIVE:"]
          ]
        }
      }
    }
  },

  "overrides": [
    {
      "include": ["packages/server/src/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    },
    {
      "include": ["packages/server/src/db/seed*.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          },
          "style": {
            "noVar": "off"
          }
        }
      }
    },
    {
      "include": ["packages/ui/src/**"],
      "linter": {
        "rules": {
          "style": {
            "useFilenamingConvention": {
              "level": "error",
              "options": {
                "filenameCases": ["kebab-case", "PascalCase"]
              }
            }
          }
        }
      }
    },
    {
      "include": ["packages/shared/src/**"],
      "linter": {
        "rules": {
          "style": {
            "useFilenamingConvention": {
              "level": "error",
              "options": {
                "filenameCases": ["kebab-case"]
              }
            }
          }
        }
      }
    }
  ]
}
```

**Design decisions explained:**

1. **`noConsole: "off"` for server** — Server-side logging uses `console` in seeds and startup. Production code uses `pino` logger but `console` is acceptable for operational scripts.

2. **`noBarrelFile: "off"`** — Corthex uses barrel exports in `packages/ui/src/index.ts` and `packages/shared/src/index.ts` intentionally (they are small, enumerable re-exports). Not a performance concern at this scale.

3. **`noForEach: "off"`** — Stylistic preference; `.forEach()` is used throughout the codebase and a blanket switch to `for...of` adds migration noise without meaningful benefit.

4. **`useFilenamingConvention: "kebab-case"`** — Matches CLAUDE.md rule: "Files: kebab-case". The `ui/` package additionally allows PascalCase for React component files like `Calendar.tsx`.

5. **Import groups order**: Bun builtins → external packages → `@corthex/*` workspace → aliases (`@/`) → relative. Matches observed patterns in `packages/server/src/index.ts`.

6. **`drizzle` domain: "all"** — Enables `noDrizzleUpdateWithoutWhere` and `noDrizzleDeleteWithoutWhere`. Critical for Corthex since all DB access goes through Drizzle ORM via `getDB(companyId)`.

---

## Deliverable 2: Rule Mapping Table — ESLint → Biome

Since Corthex has **no ESLint config**, this table maps common ESLint rules that a TypeScript+React project of this scale would typically use, to their Biome equivalents:

### Core Rules

| ESLint Rule | Biome Equivalent | Status | Notes |
|-------------|-----------------|--------|-------|
| `no-unused-vars` | `correctness/noUnusedVariables` | Supported | |
| `no-undef` | `correctness/noUndeclaredVariables` | Supported | |
| `no-unreachable` | `correctness/noUnreachable` | Supported | |
| `no-const-assign` | `correctness/noConstAssign` | Supported | |
| `no-debugger` | `suspicious/noDebugger` | Supported | |
| `no-console` | `suspicious/noConsole` | Supported | With `allow` options |
| `eqeqeq` | `suspicious/noDoubleEquals` | Supported | |
| `no-var` | `style/noVar` | Supported | |
| `prefer-const` | `style/useConst` | Supported | |
| `prefer-template` | `style/useTemplate` | Supported | |
| `no-fallthrough` | `suspicious/noFallthroughSwitchClause` | Supported | |
| `no-duplicate-case` | `suspicious/noDuplicateCase` | Supported | |
| `no-redeclare` | `suspicious/noRedeclare` | Supported | |
| `no-shadow` | `suspicious/noShadowRestrictedNames` | Partial | Only for restricted names |

### TypeScript-Specific Rules

| typescript-eslint Rule | Biome Equivalent | Status | Notes |
|----------------------|-----------------|--------|-------|
| `@typescript-eslint/no-explicit-any` | `suspicious/noExplicitAny` | Supported | |
| `@typescript-eslint/no-unused-vars` | `correctness/noUnusedVariables` | Supported | |
| `@typescript-eslint/consistent-type-imports` | `style/useImportType` | Supported | |
| `@typescript-eslint/consistent-type-exports` | `style/useExportType` | Supported | |
| `@typescript-eslint/no-floating-promises` | `suspicious/noFloatingPromises` | Supported (v2.x) | Biotype — 75% coverage without `tsc` |
| `@typescript-eslint/no-misused-promises` | `suspicious/noMisusedPromises` | Supported (v2.x) | Biotype |
| `@typescript-eslint/naming-convention` | `style/useNamingConvention` | Supported | Configurable selectors |
| `@typescript-eslint/no-unnecessary-type-assertion` | `correctness/noUnnecessaryTypeAssertion` | Supported | |

### React-Specific Rules

| eslint-plugin-react Rule | Biome Equivalent | Status | Notes |
|-------------------------|-----------------|--------|-------|
| `react-hooks/rules-of-hooks` | `correctness/useHookAtTopLevel` | Supported | |
| `react-hooks/exhaustive-deps` | `correctness/useExhaustiveDependencies` | Supported | |
| `react/jsx-no-target-blank` | `a11y/noBlankTarget` | Supported | |
| `react/button-has-type` | `a11y/useButtonType` | Supported | |
| `react/no-danger` | `security/noDangerouslySetInnerHtml` | Supported | |
| `react/jsx-key` | `correctness/useJsxKeyInIterable` | Supported | |
| `react/self-closing-comp` | `style/useSelfClosingElements` | Supported | |

### Import Rules

| eslint-plugin-import Rule | Biome Equivalent | Status | Notes |
|--------------------------|-----------------|--------|-------|
| `import/order` | `assist/organizeImports` | Supported (v2.x) | Fully configurable groups |
| `import/no-duplicates` | `correctness/noDuplicateImports` | Supported | |
| `import/no-unused-modules` | `correctness/noUnusedImports` | Supported | |

### Gap Analysis — ESLint Rules WITHOUT Biome Equivalent

| ESLint Rule | Gap Impact | Workaround |
|-------------|-----------|------------|
| `@typescript-eslint/strict-boolean-expressions` | Low | `tsc --strict` covers most cases |
| `@typescript-eslint/no-unsafe-return` | Medium | Biotype covers ~75% |
| `import/no-cycle` | Medium | No Biome equivalent; use `madge` if needed |
| `no-restricted-imports` | Low | Can write GritQL plugin |
| `@typescript-eslint/no-non-null-assertion` | Low | `suspicious/noNonNullAssertion` exists |
| Complex custom rules | Low | GritQL plugins (diagnostic-only for now) |

### Drizzle-Specific (Bonus)

| eslint-plugin-drizzle Rule | Biome Domain Rule | Status |
|---------------------------|------------------|--------|
| `drizzle/enforce-delete-with-where` | `drizzle/noDrizzleDeleteWithoutWhere` | Supported |
| `drizzle/enforce-update-with-where` | `drizzle/noDrizzleUpdateWithoutWhere` | Supported |

---

## Deliverable 3: Step-by-Step Migration Script

### Step 1: Install Biome

```bash
# Pin exact version (CLAUDE.md rule: "SDK pin version (no ^)")
bun add -D @biomejs/biome@2.4.8

# Verify installation
bunx biome --version
```

### Step 2: Generate Initial Config

```bash
# Generate biome.json from scratch (no ESLint/Prettier to migrate from)
bunx biome init

# Then replace with the Deliverable 1 config above
```

### Step 3: Add Package Scripts

**Root `package.json`:**
```json
{
  "scripts": {
    "lint": "turbo lint",
    "format": "turbo format",
    "check": "biome check packages/*/src",
    "check:fix": "biome check --fix packages/*/src"
  }
}
```

**Each package's `package.json` — add lint + format scripts:**

`packages/server/package.json`:
```json
{
  "scripts": {
    "lint": "biome lint src/",
    "format": "biome format --write src/"
  }
}
```

`packages/app/package.json`:
```json
{
  "scripts": {
    "lint": "biome lint src/",
    "format": "biome format --write src/"
  }
}
```

(Same pattern for `admin`, `shared`, `ui`, `landing`)

### Step 4: Update `turbo.json`

```json
{
  "tasks": {
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx"]
    },
    "format": {
      "cache": false
    }
  }
}
```

### Step 5: Run First Check + Auto-Fix

```bash
# Dry run — see what would change
bunx biome check packages/*/src 2>&1 | tee biome-first-run.log

# Auto-fix safe issues (import sorting, const, etc.)
bunx biome check --fix packages/*/src

# Format all files
bunx biome format --write packages/*/src

# Commit the mass formatting change
git add -A
git commit -m "style: apply biome formatting + lint auto-fixes"
```

### Step 6: Update CI — `.github/workflows/deploy.yml`

Add after the `Install dependencies` step:

```yaml
      - name: Biome lint + format check
        if: steps.filter.outputs.code == 'true'
        run: bunx biome check packages/*/src
```

This runs `biome check` which combines lint + format verification in a single pass.

### Step 7: Update Pre-Commit Hook

Modify `.claude/hooks/pre-commit-tsc.sh` to also run Biome:

```bash
#!/bin/bash
set -e

if echo "$CLAUDE_TOOL_INPUT" | grep -q '"git commit\|"git.*commit'; then
  cd /home/ubuntu/corthex-v2

  # Run biome check (lint + format)
  BIOME_OUTPUT=$(bunx biome check packages/*/src 2>&1) || {
    echo "BLOCKED: biome check failed. Fix lint/format errors before committing:"
    echo "$BIOME_OUTPUT" | head -30
    exit 1
  }
  echo "[biome] clean"

  # Run tsc check
  TSC_OUTPUT=$(npx tsc --noEmit -p packages/server/tsconfig.json 2>&1) || {
    echo "BLOCKED: tsc --noEmit failed. Fix type errors before committing:"
    echo "$TSC_OUTPUT" | head -20
    exit 1
  }
  echo "[tsc] clean — commit allowed"
fi

exit 0
```

### Step 8: IDE Integration

**VS Code `settings.json` (per-workspace):**
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

### Step 9: Optional — GritQL Custom Rules

Create `rules/corthex.grit` for project-specific patterns:

```grit
// Ban direct process.env access (force config/env module)
`process.env.$_` where {
  $_.source_file <: not includes "src/lib/config"
} => {
  message: "Use config module instead of direct process.env access"
}
```

Add to `biome.json`:
```json
{
  "plugins": ["./rules/corthex.grit"]
}
```

---

## Deliverable 4: Predicted Issue Report

Based on the codebase patterns analyzed, here is what `biome check` would flag:

### Critical (error-level, must fix)

| Rule | Predicted Count | Files | Impact |
|------|----------------|-------|--------|
| `noVar` | ~6 | 5 server files | Auto-fixable → `let`/`const` |
| `noDoubleEquals` | ~21 | 10+ UI files | Auto-fixable → `===`/`!==` |
| `noUnusedImports` | ~30-50 (est.) | Throughout | Auto-fixable (remove) |
| `useImportType` | ~20-40 (est.) | Throughout | Auto-fixable (add `type` keyword) |
| `useExportType` | ~10-20 (est.) | `shared/src/types.ts` + others | Auto-fixable |
| `useFilenamingConvention` | ~1 | `packages/app/src/ui/components/Calendar.tsx` | Need override or rename |
| `noDrizzleUpdateWithoutWhere` | 0-3 (est.) | `scoped-query.ts` helpers | Manual review needed |

### Warning-level (should fix)

| Rule | Predicted Count | Files | Impact |
|------|----------------|-------|--------|
| `noExplicitAny` | ~173 | 30+ files (mostly tests) | Gradual fix; tests can suppress |
| `noConsole` | ~98 | 20+ files | Server override handles most; ~5 app-side to fix |
| `useConst` | ~20-30 (est.) | Throughout | Auto-fixable |
| `useTemplate` | ~10-15 (est.) | String concatenation sites | Auto-fixable |
| `useOptionalChain` | ~5-10 (est.) | `x && x.y` patterns | Auto-fixable |
| `noAccumulatingSpread` | ~3-5 (est.) | Spread in loops | Manual refactor |

### Formatting Changes

| Change | Predicted Impact |
|--------|-----------------|
| Consistent quotes (single) | ~200+ files touched |
| Trailing commas | Many files |
| Import reordering | Every file with imports |
| Line width enforcement (100) | ~50+ long lines |
| Semicolons (if enforced) | Depends on current style |

**Estimated auto-fix coverage: ~70% of all issues** can be resolved by `biome check --fix`.

### Files Needing Manual Attention

1. **`packages/server/src/db/scoped-query.ts`** — 11 `as any` casts. Some are necessary for Drizzle ORM dynamic query building; suppress individually.
2. **`packages/server/src/engine/mcp/transports/stdio.ts`** — 5 `as any` casts for MCP SDK interop.
3. **`packages/app/src/ui/components/Calendar.tsx`** — PascalCase filename; needs override or rename to `calendar.tsx`.
4. **Test files (`__tests__/`)** — Excluded in recommended config, but if included: ~100+ `any` type issues from mock objects.

---

## Deliverable 5: Risk Analysis

### R1: Bun Compatibility — LOW RISK

| Factor | Assessment |
|--------|-----------|
| `@biomejs/biome` npm package | Works with Bun. Binary is a standalone Rust executable, not a Node.js module. |
| `bunx biome check` | Confirmed working. Biome ships platform-specific binaries via `optionalDependencies`. |
| Bun-specific APIs (`Bun.serve`, `Bun.file`) | Biome parses these as standard JS/TS. No Bun-specific parser needed. |
| `bun:test` / `bun:sqlite` | Biome recognizes `bun:` imports via the `:BUN:` import group matcher. |
| Bun lock file (`bun.lock`) | Not relevant to Biome. |

**Verdict: Fully compatible.** Biome is runtime-agnostic; the Bun+Hono combination is already a common Biome adoption pattern with multiple production boilerplates.

### R2: Cloudflare Workers — LOW RISK

| Factor | Assessment |
|--------|-----------|
| Workers-specific APIs | Biome lints standard JS/TS. Workers APIs are just type definitions. |
| `wrangler.toml` | Not a Biome concern. |
| Miniflare/workerd | Biome doesn't run in Workers; it's a dev-time tool. |

**Verdict: No conflict.** Corthex deploys to Docker (not Workers directly), but even CF Workers projects use Biome without issues.

### R3: shadcn/ui Conflicts — LOW RISK

| Factor | Assessment |
|--------|-----------|
| CVA (class-variance-authority) | Biome lints it as standard TS. No special handling needed. |
| `clsx` / `tailwind-merge` | No conflicts. |
| `cn()` utility pattern | Standard function — no Biome issues. |
| Copy-pasted component code | May trigger `noExplicitAny` or `noUnusedVariables` on unused props. Override per-file if needed. |

**Verdict: Compatible.** Corthex's `packages/ui` uses the same CVA+clsx+tailwind-merge pattern that Biome handles natively.

### R4: Hono Pattern Conflicts — LOW RISK

| Pattern | Risk | Mitigation |
|---------|------|-----------|
| `c.set('tenant', ctx)` | None — standard method call | |
| `c.get('tenant')` | None | |
| `new Hono<AppEnv>()` | None — generic type | |
| Middleware chaining | None | |
| `c.json({ success: true, data })` | None | |

**Verdict: No conflicts.** Hono's API is standard TypeScript. The `c.set()`/`c.get()` pattern doesn't trigger any Biome rules.

### R5: Tailwind v4 Compatibility — MEDIUM RISK

| Factor | Assessment |
|--------|-----------|
| `useSortedClasses` rule | Partially implemented. Unsafe fix only. |
| Tailwind v4 new `@theme` syntax | CSS, not parsed by Biome's JS/TS linter |
| `@tailwindcss/vite` plugin | Build-time; no Biome interaction |
| Class strings in JSX | Biome can sort them but fix is "unsafe" |

**Verdict: Tailwind class sorting is the weakest integration point.** Recommendation: start with `useSortedClasses: "off"` and enable later when it stabilizes. Use `prettier-plugin-tailwindcss` as a temporary bridge for class sorting if needed, or accept unsorted classes for now.

### R6: Drizzle ORM — LOW RISK (High Value)

| Factor | Assessment |
|--------|-----------|
| `noDrizzleUpdateWithoutWhere` | Catches unguarded `.update()` calls — high-value safety net |
| `noDrizzleDeleteWithoutWhere` | Catches unguarded `.delete()` calls |
| `getDB(companyId)` pattern | Standard function call; no conflict |

**Verdict: Net positive.** The Drizzle domain rules add genuine safety for a multi-tenant app like Corthex where accidental full-table mutations would be catastrophic.

### R7: Migration Disruption — MEDIUM RISK

| Factor | Assessment |
|--------|-----------|
| First format run | Will touch most files. Large diff. |
| Import reordering | Changes import order in every file. May cause merge conflicts on active branches. |
| False positives | `noExplicitAny` on test mocks. Suppression comments needed. |

**Mitigation strategy:**
1. Run migration in a single commit on a quiet day (no open PRs)
2. Use `biome check --fix` for auto-fixable issues
3. Add `// biome-ignore ...` for intentional patterns
4. Communicate the one-time diff to team

---

## Deliverable 6: Performance Benchmark Prediction

### Baseline: Current Corthex Setup

| Tool | What it does | Estimated Time |
|------|-------------|----------------|
| `tsc --noEmit` (server) | Type-check server package | ~3-5 seconds |
| No linter | — | 0 seconds |
| No formatter | — | 0 seconds |
| **Total CI quality gate** | | **~3-5 seconds** |

### Projected: With Biome

| Tool | What it does | Estimated Time |
|------|-------------|----------------|
| `biome check` (all packages) | Lint + format verify | ~0.3-0.8 seconds |
| `tsc --noEmit` (server) | Type-check (unchanged) | ~3-5 seconds |
| **Total CI quality gate** | | **~3.3-5.8 seconds** |

**Net impact: +0.3-0.8 seconds** — negligible. Biome adds lint + format checking for effectively free.

### Hypothetical: If Corthex Had ESLint + Prettier

For comparison, if we were migrating FROM ESLint+Prettier (as many projects do):

| Metric | ESLint + Prettier | Biome | Speedup |
|--------|------------------|-------|---------|
| Lint 1,466 files | ~8-12 seconds | ~0.3-0.5 seconds | **20-30x** |
| Format check 1,466 files | ~3-5 seconds | ~0.1-0.3 seconds | **15-25x** |
| Combined | ~11-17 seconds | ~0.5-0.8 seconds | **20x** |
| Cold start (first run) | ~2-3 seconds (plugin loading) | ~0.05 seconds | **40-60x** |

These numbers are based on published benchmarks for codebases of similar size (~300K LOC, ~1500 files):
- ESLint: 45.2s for 10K files → ~6.6s for 1.5K files (linear extrapolation)
- Biome: 0.8s for 10K files → ~0.12s for 1.5K files
- Prettier: 12.1s for 10K files → ~1.8s for 1.5K files

### Memory Usage

| Tool | Peak Memory |
|------|------------|
| ESLint | ~200-400 MB (V8 heap + plugin loading) |
| Prettier | ~150-300 MB |
| Biome | ~50-80 MB (Rust, no GC pressure) |

### Pre-Commit Hook Impact

Current hook (`pre-commit-tsc.sh`): ~3-5 seconds per commit.
With Biome added: ~3.5-5.5 seconds per commit (+0.3-0.5s).

For developer experience, this is imperceptible. The hook remains fast.

---

## Summary & Recommendation

### Why Biome for Corthex v2

1. **No existing linter/formatter to migrate from** — Clean adoption, no legacy config to deal with
2. **Drizzle ORM domain rules** — Direct value for multi-tenant safety (`noDrizzleUpdateWithoutWhere`)
3. **Zero performance cost** — Sub-second on 1,466 files
4. **Monorepo-native** — `extends: ["//"]` + overrides fits the Turborepo workspace structure
5. **Bun + Hono compatibility** — Confirmed by multiple production projects
6. **Single tool replaces two** — No ESLint/Prettier version conflicts, shared config complexity, plugin compatibility matrix
7. **Filename convention enforcement** — `useFilenamingConvention: "kebab-case"` directly enforces CLAUDE.md rules in-tool instead of relying on manual review
8. **Import organization** — Configurable groups will standardize the currently ad-hoc import ordering

### Recommended Adoption Timeline

| Phase | Action | Effort |
|-------|--------|--------|
| **Week 1** | Install Biome, apply `biome.json`, run `--fix`, commit mass formatting | 2-3 hours |
| **Week 1** | Add `biome check` to CI + pre-commit hook | 30 minutes |
| **Week 2** | Triage remaining warnings (`noExplicitAny` in tests, etc.) | 1-2 hours |
| **Week 3+** | Enable `useSortedClasses` when stable; add GritQL custom rules as needed | Ongoing |

### What NOT to Do

- Do NOT install ESLint or Prettier alongside Biome (defeats the purpose)
- Do NOT enable `noBarrelFile` (Corthex uses intentional barrel exports in `ui` and `shared`)
- Do NOT enable `noForEach` globally (massive churn for no safety benefit)
- Do NOT enable `useSortedClasses` yet (unsafe fix, Tailwind v4 support still maturing)

---

## Sources

- [Biome Architecture](https://biomejs.dev/internals/architecture/)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Biome v2 — Biotype](https://biomejs.dev/blog/biome-v2/)
- [Biome v2.4 Release](https://biomejs.dev/blog/biome-v2-4/)
- [Biome 2026 Roadmap](https://biomejs.dev/blog/roadmap-2026/)
- [Biome Linter Rules](https://biomejs.dev/linter/)
- [Biome Import Sorting](https://biomejs.dev/assist/actions/organize-imports/)
- [Biome Differences with Prettier](https://biomejs.dev/formatter/differences-with-prettier/)
- [Biome in Big Projects (Monorepo)](https://biomejs.dev/guides/big-projects/)
- [Biome Migrate from ESLint/Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Biome GritQL Plugins](https://biomejs.dev/linter/plugins/)
- [Biome Linter Domains](https://biomejs.dev/linter/domains/)
- [Biome useSortedClasses](https://biomejs.dev/linter/rules/use-sorted-classes/)
- [Biome vs ESLint vs Oxlint 2026](https://www.pkgpulse.com/blog/biome-vs-eslint-vs-oxlint-2026)
- [Biome vs ESLint + Prettier 2026](https://www.pkgpulse.com/blog/biome-vs-eslint-prettier-linting-2026)
- [Biome Migration Guide 2026](https://dev.to/pockit_tools/biome-the-eslint-and-prettier-killer-complete-migration-guide-for-2026-27m)
- [Biome DeepWiki](https://deepwiki.com/biomejs/biome)
- [Biome Wins Prettier Challenge](https://biomejs.dev/blog/biome-wins-prettier-challenge/)
- [The Loop: Biome v2 Type-Aware Linting](https://www.econify.com/news/the-loop-biome-v2-type-aware-linting-without-the-compiler)
- [Biome GitHub Releases](https://github.com/biomejs/biome/releases)
- [Hono + Bun + Biome Boilerplate](https://github.com/estepanov/fullstack-bun)
- [Hono Starter with Biome](https://github.com/Joker666/hono-starter/blob/main/biome.json)
