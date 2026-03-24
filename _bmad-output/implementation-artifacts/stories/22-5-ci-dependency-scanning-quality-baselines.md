# Story 22.5: CI Dependency Scanning & Quality Baselines

Status: ready-for-dev

## Story

As a platform operator,
I want automated vulnerability scanning and quality measurement baselines,
So that security vulnerabilities are caught in CI and v3 quality can be measured against v2.

## Acceptance Criteria

1. **AC-1: `bun audit` in CI pipeline**
   **Given** CI pipeline (`ci.yml` on PR, `deploy.yml` on push) currently has no dependency scanning
   **When** `bun audit` step is added to both workflows
   **Then** Critical and High CVE findings cause the CI step to fail (exit code 1)
   **And** Moderate and Low findings are logged but do NOT fail the build
   **And** known unfixable transitive vulnerabilities can be excluded via `.github/audit-allowlist.txt` (reviewed quarterly)
   **And** the audit step runs after `bun install` and before `build`
   **And** matching critical/high lines are emitted as `::error::` GitHub annotations for PR check visibility

2. **AC-2: Dependabot configuration**
   **Given** no `.github/dependabot.yml` exists
   **When** Dependabot is configured
   **Then** `.github/dependabot.yml` watches `npm` ecosystem for the root `package.json`
   **And** weekly schedule on Mondays
   **And** PRs are auto-created for vulnerable dependencies
   **And** labels include `dependencies` and `security`

3. **AC-3: Quality baseline document (NFR-O4)**
   **Given** v3 needs a measurable quality baseline from v2 production
   **When** `_bmad-output/test-artifacts/quality-baseline.md` is created
   **Then** it contains 10 representative prompts covering key API domains (chat, knowledge search, agent routing, department queries, SNS, notifications, dashboard stats, file upload, job management, settings)
   **And** each prompt includes: input, expected behavior description, API endpoint(s) involved, and success criteria
   **And** the document is structured for Sprint 1+ A/B blind comparison

4. **AC-4: Routing scenarios document (NFR-O5)**
   **Given** secretary routing needs predefined test scenarios
   **When** `_bmad-output/test-artifacts/routing-scenarios.md` is created
   **Then** it contains 10 routing scenarios as specified: direct dept request, ambiguous request, cross-dept, out-of-scope, follow-up, multi-step, bilingual (Korean+English), abbreviation, typo, concurrent
   **And** each scenario includes: user input, expected department/agent routing, rationale
   **And** pass threshold documented: 8/10+ = pass (per NFR-O5)

5. **AC-5: Baseline files committed**
   **Given** quality-baseline.md and routing-scenarios.md are created
   **When** they are committed to the repository
   **Then** they are available for Sprint 1+ comparison and regression testing

## Tasks / Subtasks

- [ ] Task 1: Add `bun audit` to CI workflows (AC: #1)
  - [ ] 1.1 Add audit step to `.github/workflows/ci.yml` after `bun install`, before `Build all packages`
  - [ ] 1.2 Add audit step to `.github/workflows/deploy.yml` after `Install dependencies`, before `Engine boundary check`
  - [ ] 1.3 Create `.github/audit-allowlist.txt` with known unfixable transitive CVE advisory URLs (one per line). Initial entries: fast-xml-parser advisories via @aws-sdk/client-s3 (GHSA-m7jm-9gc2-mpf2, GHSA-jmr7-xgp7-cmfj, GHSA-fj3w-jwp8-x2g3, GHSA-jp2q-39xq-3w4g, GHSA-8gc5-j5rx-235r). Comment header: `# Reviewed: 2026-03-24. Next review: 2026-06-24`
  - [ ] 1.4 Audit step script: filter out allowlisted advisories, then fail on remaining critical/high:
    ```bash
    AUDIT=$(bun audit 2>&1 || true)
    echo "$AUDIT"
    FILTERED=$(echo "$AUDIT" | grep -vFf .github/audit-allowlist.txt || true)
    HITS=$(echo "$FILTERED" | grep -E '^\s*(critical|high):' || true)
    if [ -n "$HITS" ]; then
      echo "$HITS" | while read -r line; do echo "::error::$line"; done
      exit 1
    fi
    ```
  - [ ] 1.5 Update hono to >=4.12.4 (`bun update hono`) — removes 1 high + 3 moderate (serveStatic arbitrary file access is exploitable). Run before enabling CI audit.
  - [ ] 1.6 Add `continue-on-error: false` to ensure step failure blocks the workflow

- [ ] Task 2: Configure Dependabot (AC: #2)
  - [ ] 2.1 Create `.github/dependabot.yml` with npm ecosystem, weekly Monday schedule
  - [ ] 2.2 Set `open-pull-requests-limit: 10`
  - [ ] 2.3 Add labels: `dependencies`, `security`
  - [ ] 2.4 Set directory: `/` (monorepo root)

- [ ] Task 3: Create quality baseline document (AC: #3)
  - [ ] 3.1 Create `_bmad-output/test-artifacts/quality-baseline.md`
  - [ ] 3.2 Define 10 representative prompts across key domains (include API endpoint per AC-3):
    1. Chat: "마케팅팀에 신규 캠페인 기획 요청해줘" → `POST /api/workspace/hub` (agent routing + response quality)
    2. Knowledge search: "회사 휴가 정책 알려줘" → `POST /api/workspace/hub` + `GET /api/workspace/knowledge/search` (semantic search relevance)
    3. Agent routing: "개발팀 리더에게 버그 리포트 전달해줘" → `POST /api/workspace/hub` (correct agent selection via llm-router)
    4. Department query: "현재 부서 구조 보여줘" → `GET /api/workspace/departments` + `GET /api/workspace/org-chart` (org chart data accuracy)
    5. SNS post: "트위터에 신제품 출시 공지 올려줘" → `POST /api/workspace/sns` (SNS integration)
    6. Notification: "오늘 미완료 작업 알림 보내줘" → `GET /api/workspace/notifications` (notification system)
    7. Dashboard: "이번 달 비용 현황 요약해줘" → `GET /api/workspace/dashboard` + `GET /api/admin/costs` (cost aggregation accuracy)
    8. File upload: "이 보고서 첨부해서 저장해줘" → `POST /api/workspace/files` (file handling)
    9. Job management: "매일 오전 9시에 일일 리포트 생성하는 작업 만들어줘" → `POST /api/workspace/argos` (ARGOS scheduling)
    10. Settings: "AI 모델을 claude-sonnet으로 변경해줘" → `PATCH /api/admin/company-settings` (settings modification)
  - [ ] 3.3 For each prompt: document API endpoint(s), expected behavior, success criteria
  - [ ] 3.4 Add header section explaining A/B blind comparison methodology for Sprint 1+

- [ ] Task 4: Create routing scenarios document (AC: #4)
  - [ ] 4.1 Create `_bmad-output/test-artifacts/routing-scenarios.md`
  - [ ] 4.2 Define 10 predefined routing scenarios (per NFR-O5):
    1. **Direct dept request**: "마케팅팀에 SNS 포스트 작성 요청" → Marketing dept
    2. **Ambiguous request**: "새 프로젝트 시작하고 싶어" → Clarification or default dept
    3. **Cross-dept**: "개발팀이 만든 API를 마케팅팀이 사용할 수 있게 문서화해줘" → Dev+Marketing coordination
    4. **Out-of-scope**: "오늘 서울 날씨 어때?" → Polite decline or general assistant
    5. **Follow-up**: (after marketing query) "거기서 예산은 얼마야?" → Same marketing context
    6. **Multi-step**: "HR팀에 채용 공고 올리고, 마케팅팀에 홍보 요청해줘" → Sequential routing
    7. **Bilingual**: "인사팀에 연차 신청서 제출해줘" (Korean) + "Ask the development team to review this PR" (English) → Correct dept regardless of language
    8. **Abbreviation**: "마팀에 보고서 보내줘" → Marketing (abbreviated)
    9. **Typo**: "개발팀에 벅그 리포트 보내줘" (벅그→버그) → Dev dept (typo-tolerant)
    10. **Concurrent**: Two simultaneous requests to different depts → Both routed correctly without interference
  - [ ] 4.3 For each scenario: document user input, expected routing (dept + agent), rationale
  - [ ] 4.4 Add pass threshold: 8/10+ = pass, scoring rubric (correct dept = 1pt, wrong dept = 0pt, clarification when ambiguous = 0.5pt)

- [ ] Task 5: Tests (AC: #5)
  - [ ] 5.1 Create `packages/server/src/__tests__/unit/ci-dependency-scanning.test.ts`
  - [ ] 5.2 Test CI workflow files contain `bun audit` step
  - [ ] 5.3 Test `dependabot.yml` exists with correct ecosystem and schedule
  - [ ] 5.4 Test `quality-baseline.md` exists and contains 10 prompts
  - [ ] 5.5 Test `routing-scenarios.md` exists and contains 10 scenarios
  - [ ] 5.6 Test baseline files have expected structure (headers, numbered items)

## Dev Notes

### `bun audit` Behavior

`bun audit` (v1.3.10) outputs vulnerabilities and exits with code 1 if ANY are found (regardless of severity). There's no `--level` flag like npm audit.

**Current state** (as of 2026-03-24):
```
11 vulnerabilities (1 critical, 3 high, 5 moderate, 2 low)
- fast-xml-parser (critical+high) via @aws-sdk/client-s3
- hono (high+moderate) — needs update to >=4.12.4
- esbuild (moderate) via drizzle-kit and vite
- @smithy/config-resolver (low) via @aws-sdk/client-s3
```

**Strategy for CI**: Since `bun audit` always exits 1 with any vulnerability, and some (fast-xml-parser via @aws-sdk) are transitive and unfixable, the CI step must:
1. Run `bun audit` and capture output
2. Filter out allowlisted advisory URLs (`grep -vFf .github/audit-allowlist.txt`)
3. Check remaining output for critical/high
4. Emit `::error::` annotations for GitHub PR checks UI
5. Fail only on non-allowlisted critical/high
6. Script pattern:
```bash
AUDIT=$(bun audit 2>&1 || true)
echo "$AUDIT"
FILTERED=$(echo "$AUDIT" | grep -vFf .github/audit-allowlist.txt || true)
HITS=$(echo "$FILTERED" | grep -E '^\s*(critical|high):' || true)
if [ -n "$HITS" ]; then
  echo "$HITS" | while read -r line; do echo "::error::$line"; done
  exit 1
fi
echo "Only allowlisted or moderate/low vulnerabilities — passing"
```

**Allowlist governance**: `.github/audit-allowlist.txt` contains advisory URLs (one per line) for known transitive vulnerabilities that cannot be fixed. Header comment tracks review date and next review (quarterly). Adding to allowlist requires documented justification (transitive, no direct fix available).

### Known Vulnerabilities & Remediation Path

**Will trip CI audit on first run** — these must be resolved before or alongside this story's CI integration:

- `hono` (high+moderate) — **actionable NOW**: `bun update hono` to >=4.12.4 fixes 4 vulns. Should be done as a pre-implementation step in Phase B before CI audit is enabled. Not a separate story — it's a direct dependency update.
- `fast-xml-parser` (critical+high) via `@aws-sdk/client-s3` — transitive, cannot fix directly. Monitor for AWS SDK update. Add to CI audit allowlist comment.
- `esbuild` (moderate) via `drizzle-kit` and `vite` — dev/build tools, not runtime. Lower risk. Moderate severity won't trip our critical/high filter.
- `@smithy/config-resolver` (low) via `@aws-sdk/client-s3` — transitive, low severity. Won't trip filter.

**CI audit with allowlist**: After hono update + fast-xml-parser allowlisting, CI audit will pass cleanly. Any NEW critical/high vulnerability will correctly fail the build. Allowlist is reviewed quarterly — if AWS SDK updates to fix fast-xml-parser, remove from allowlist.

### Quality Baseline Methodology (NFR-O4)

The 10 prompts are designed to cover key user interaction patterns. In Sprint 1+, the same prompts will be run against v3 and compared blind (A/B) against v2 responses. Quality is measured by:
- Response relevance (does it answer the question?)
- Action accuracy (does it call the right API/agent?)
- Response format (proper Korean, structured data)

### Routing Scenarios Methodology (NFR-O5)

The 10 scenarios test the secretary/hub routing system (`llm-router.ts`). Each scenario is scored binary (correct routing = 1, wrong = 0) except ambiguous cases (clarification = 0.5). Pass threshold: 8/10+.

### Dependabot Configuration

GitHub Dependabot is free and requires only a YAML config file. It will:
- Check npm dependencies weekly
- Auto-create PRs for vulnerable dependencies
- Label PRs for easy triage

_References: NFR-S14, NFR-O4, NFR-O5_
