# Fix Summary: Product Brief Step 03 — Post-Critic Review
> Applied: 2026-03-14 | Writer: BMAD Writer

---

## Issues Fixed: 11 total (1 Critical + 4 High + 3 Medium + 3 Low)

---

### CRITICAL FIX 1: `read_web_page` URL parameter bug — removed Jina prefix

**Critics:** Both (Critic-A Issue 5/Mary, Critic-B A1)
**Original problem:** Journey 2 showed `read_web_page(url: "https://r.jina.ai/https://samsung.com/ai")`. The tool internally prepends `r.jina.ai/` to the passed URL — passing the Jina-prefixed URL would double-prefix it (`r.jina.ai/r.jina.ai/...`) and return a 404 or unexpected content.
**Fix applied:**
- Changed to `read_web_page(url: "https://samsung.com/ai")`
- Added inline comment: `[Tool internally prepends r.jina.ai/ — agent passes raw target URL only]`
- This prevents implementers from building the wrong API contract for the `read_web_page` handler

---

### HIGH FIX 2: Added CEO 김대표 persona (PRD primary persona)

**Critics:** Both (Critic-A Issue 1/John cross-talk B1, Critic-B B1)
**Original problem:** PRD's #1 primary persona (CEO 김대표, 1인 사업가) was absent. 김지은 covered Admin setup but not the solo-operator who IS admin + Hub user + report consumer simultaneously.
**Fix applied:**
- Added **Persona 5: CEO 김대표** as a distinct full persona with:
  - Background: 1인 사업가, non-developer, replaces a full team with 1–3 agents
  - Pain: agents produce raw markdown, not finished deliverables; manual copy-paste gap costs 1–2 hours/day
  - Value: `save_report` → branded PDF in email inbox, `publish_*` → autonomous blog/X posting, Notion MCP → auto-indexed workspace
  - Aha! Moment: Wakes up to a formatted PDF report already sent to investors by his agent at 7am (ARGOS-scheduled)
  - PRD note: CEO 김대표 is the primary validation that the end-to-end pipeline delivers polished no-touch output
- Added explicit PRD mapping note connecting him to PRD primary persona

---

### HIGH FIX 3: Added 팀장 박과장 persona (PRD standalone persona)

**Critics:** Both (Critic-A Issue 2/John cross-talk, Critic-B B1 addendum)
**Original problem:** 팀장 박과장 (team manager, 10+ Human staff) was absent. His Tool Integration story (per-department tool governance, cost control for $200/month X API) had no persona to anchor product stories.
**Fix applied:**
- Added **Persona 6: 팀장 박과장** as a distinct full persona with:
  - Background: Dept manager, 10+ Human role team members, accountable for tool costs and security
  - Pain: No governance layer — any agent could get $200/month X API access without approval; no dept isolation; no audit trail
  - What he wants: per-department tool access matrix, cost visibility, manager approval workflow for expensive tools
  - Tool Integration stories: per-dept access control, usage audit log, X API cost gating, credential isolation by dept
  - Aha! Moment: Admin audit log shows exactly which agents published what to which platforms in the past 30 days

---

### HIGH FIX 4: 이수진 RBAC violation — `/admin/reports` → `/reports`

**Critics:** Both (Critic-A cross-talk Q2, Critic-B Q2)
**Original problem:** 이수진's touchpoints listed `/admin/reports` as her reports URL. 이수진 has `Human` role — Human role users cannot access `/admin/` routes per PRD RBAC table.
**Fix applied:**
- Changed to `/reports` (Human-accessible non-admin route)
- Added parenthetical: `(Human-accessible non-admin route)` to make the RBAC intent explicit
- Architecture phase must ensure the `/reports` route exists with Human-role read permissions separate from admin routes

---

### HIGH FIX 5: Split credential setup journey — separated external token acquisition from CORTHEX paste

**Critics:** Both (Critic-A Issue 3/Sally, Critic-B Q1)
**Original problem:** Setup path table showed "Credential Setup: 5 min" conflating (a) external platform OAuth app creation and token generation (15–60 min per platform, entirely outside CORTHEX) with (b) pasting the token into CORTHEX credentials UI (5 min actual CORTHEX time). First-time users setting up Instagram Graph API + X API would spend 1–2 hours in external consoles and feel the product lied to them about a "5-minute setup."
**Fix applied:**
- Split into two separate table rows:
  - **Platform Token Acquisition** — external, one-time per platform; 15–60 min; documents that X API Basic requires $200/month developer plan; entirely outside CORTHEX
  - **Credential Paste** — Admin → Credentials → Add → paste pre-obtained tokens; 5 min; masked display, audit-logged
- Updated total time note: "Total CORTHEX onboarding time: ~15–20 minutes in-app. Platform token acquisition (external, one-time): 15–60 min per platform."

---

### MEDIUM FIX 6: MCP Setup time corrected for non-developers

**Critics:** Critic-A Issue 3/Sally, Critic-B Q1 addendum
**Original problem:** "MCP Setup: 4 min" was unrealistic for 김지은 (non-developer). First-time Notion MCP setup requires: create Notion Internal Integration → copy token → grant page access in Notion UI — an unfamiliar 15–20 minute process for a non-developer.
**Fix applied:**
- Changed MCP Setup time to: "4 min (if Notion token ready) / ~20 min (first-time Notion setup)"
- Added parenthetical explaining the external steps: `(create Notion Internal Integration → copy token → grant page access in Notion UI — external, non-developer unfamiliar)`

---

### MEDIUM FIX 7: MCP connection test architecture note added

**Critics:** Critic-B W1
**Original problem:** 박현우's step 3 shows "verifies connection status indicator shows green" — but this requires a real-time subprocess spawn from the admin UI (SPAWN child_process + JSON-RPC tools/list). Step-02 did not define whether this is synchronous (blocking HTTP) or async (job queue + poll).
**Fix applied:**
- Added parenthetical in the MCP Setup journey row: `Architecture phase must specify: synchronous subprocess spawn vs. async job queue + poll`
- Flags this as an open architectural decision without blocking the persona spec

---

### MEDIUM FIX 8: Specialist-agent note added to Tool Assignment step

**Critics:** Critic-B W2
**Original problem:** 김지은's step 2 assigns `publish_tistory`, `publish_x`, `generate_card_news`, etc. to the Marketing Director agent. But step-02's pipeline design shows Directors orchestrate via `call_agent` — publish tools belong to specialist Publisher agents. The journey example risks implementers configuring Directors to hold publish tools directly.
**Fix applied:**
- Added note in Tool Assignment journey row: `"Note: In production, publish tools belong to specialist publisher agents, not the Director — Director delegates via call_agent (see Step-02 pipeline architecture). This journey uses a single agent for simplicity."`

---

### LOW FIX 9: 이수진 completion notification example added

**Critics:** Critic-A Issue 6/Mary, Critic-B B2
**Original problem:** 이수진's journey had no concrete output touchpoint — just "views published content summary." No example of what she receives when the pipeline completes.
**Fix applied:**
- Added: "Completion notification: After the publishing pipeline completes, she receives a Hub message from the agent: '블로그 5개, 인스타 3개 카루셀, X 스레드 5개 발행 완료 — Notion 콘텐츠 캘린더 업데이트됨.' She reviews, and that's it."

---

### LOW FIX 10: External PDF report recipient added as Tertiary Users section

**Critics:** Critic-A Issue 4/Sally, Critic-B (implicit from A2)
**Original problem:** `save_report(distribute_to: ['pdf_email'])` sends a branded PDF to external stakeholders who never log into CORTHEX. No persona existed for this recipient, meaning the requirements driving `md_to_pdf` CSS preset, Korean font embedding, and page formatting had no named user.
**Fix applied:**
- Added **Tertiary Users** section with "External Report Recipient — Board Member / Investor / Client"
- Documents: non-login stakeholder, receives branded PDF via email, judges quality by formatting/accuracy, drives `md_to_pdf` spec decisions (Pretendard font, corporate CSS, table formatting, no markdown artifacts)

---

### LOW FIX 11: save_report partial failure mode noted in Power Use journey

**Critics:** Critic-B A2
**Original problem:** Power Use journey showed `save_report(distribute_to: ['pdf_email', 'notion'])` with "Total wall time: ~4 minutes" implying atomic success — no mention of what happens if Notion MCP succeeds but send_email fails (or vice versa).
**Fix applied:**
- Added inline comment block in the journey:
  ```
  [Partial failure contract: report is saved to DB first, then distributed. If send_email fails (network error),
   agent receives partial-success response with failed channel listed. Notion save is not rolled back.
   Architecture phase must specify retry behavior — open item.]
  ```

---

### Structural Addition: PRD Persona Alignment Map

Added a PRD Alignment Map table at the end of the Target Users section showing all 5 PRD personas and their brief equivalents — covering every persona with explicit ✅/⚠️/❌ status. All 5 are now ✅.

---

## Issues NOT Fixed (deferred to Architecture phase)

| Issue | Reason |
|-------|---------|
| MCP connection test synchronous vs. async design | Flagged as open item for Architecture phase — requires load/timeout analysis |
| save_report partial failure retry behavior | Flagged as open item for Architecture phase — requires failure contract design |
| Per-department tool access control implementation | Scope item for Architecture/Epics phase — Persona 6 adds the requirement; implementation comes later |

---

*Fix count: 11 applied / 3 deferred to Architecture phase*
