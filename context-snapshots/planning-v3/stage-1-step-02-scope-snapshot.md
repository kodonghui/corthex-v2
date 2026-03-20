# Context Snapshot — Stage 1, Step 02 Technology Stack Analysis
Date: 2026-03-20
Pipeline: /kdh-full-auto-pipeline planning (v9.0)
Project: CORTHEX v3 "OpenClaw"

---

## Step 02 Outcome

**Status**: ✅ PASS (avg 8.63/10)

| Critic | Initial | Verified | Note |
|--------|---------|----------|------|
| Winston | 8.25 ✅ | 9.00 ✅ | React 19 hallucination fix, 4-layer sanitization, Option A key shadowing |
| John | 8.65 ✅ | 8.80 ✅ | pgvector unified, CI Runner self-hosted confirmed |
| Quinn | 7.55 ✅ | 8.25 ✅ | Layer C regex current/proposed split, knowledge_context allowlist fix |

## Key Deliverables

- 6 Technology Domains fully analyzed with version matrix
- Version Matrix: PixiJS 8.17.1, @pixi/react 8.0.5, n8n 2.12.3, React 19 (already satisfied)
- Co-Residence Risk table: ~2GB idle, ~8.5GB peak, 15.5GB headroom on 24GB VPS
- 4-Layer Sanitization Architecture (Layer 0: Key Boundary, A: API Zod, B: extraVars strip, C: Template regex)
- Key Shadowing: Option A recommended (spread order reversal, DB values always win)
- Stanford Generative Agents: Observation→Reflection→Planning, Reflection cost model (Haiku ~$1.80/mo)
- AI Sprite: ComfyUI+SDXL (seed control) vs PixelBox (web) vs Universal LPC Generator
- Subframe: MCP-native, React+Tailwind, sole UXUI tool (Stitch deprecated)
- n8n Upgrade Strategy: Docker tag pin → monthly review → rollback
- pgvector: Neon managed (verify via SQL), npm ^0.2.1 client

## Fixes Applied

Total 16+ issues across 3 rounds:
- [CRITICAL] React 19 hallucination: "업그레이드 필요" → "이미 React 19" (4 package.json 코드 검증)
- pgvector version self-contradiction: unified to "Neon managed — verify via SQL"
- Layer C regex: current `[^}]+` vs proposed `\w+` separated, template audit → Step 3/4
- Key shadowing: 3-layer → 4-layer, Option A (spread reversal) recommended
- knowledge_context: 7→6 built-in vars (knowledge_context is extraVar, not built-in)
- CI Runner: confirmed self-hosted (deploy.yml:17, ci.yml:9, weekly-sdk-test.yml:14)
- memory-extractor.ts: engine/ → services/ location, E8 boundary compliance
- n8n upgrade strategy section added
- PixiJS extend() 6 modules listed
- Go/No-Go #2 vs Layer C conflict: deferred to Step 3/4

## Carry-Forward to Step 3/4

1. Layer C regex `[^}]+` → `\w+` change requires soul template DB audit first
2. Go/No-Go #2 "빈 문자열=FAIL" vs `|| ''` fallback: key-aware fallback architecture decision
3. Neon connection pooling (Quinn #5)
4. /ws/office WebSocket scaling (Quinn #6)

## Output File

`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`
Step 2 section: Technology Stack Analysis (6 domains, version matrix, co-residence, sanitization)
