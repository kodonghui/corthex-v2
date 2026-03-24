# OWASP Prompt Injection Expansion Plan

> Sprint 3 preparation — 55 patterns across 6 attack categories

## Pattern Categories

### 1. Direct Injection (15 patterns)

| ID | Regex Draft | Description | Risk |
|----|------------|-------------|------|
| DI-01 | `ignore\s+(all\s+)?previous` | Instruction override — "ignore previous" | Critical |
| DI-02 | `disregard\s+(all\s+)?(prior\|previous\|above)` | Instruction disregard — "disregard prior" | Critical |
| DI-03 | `forget\s+(all\s+)?(your\s+)?(previous\|prior\|above)` | Memory wipe — "forget all previous" | Critical |
| DI-04 | `new\s+instructions?\s*:` | New instruction injection — "new instructions:" | High |
| DI-05 | `you\s+are\s+now\s+(a\|an\|the)` | Role reassignment — "you are now a" | High |
| DI-06 | `override\s+(all\s+)?(system\|safety)\s+(prompt\|instructions?\|rules?)` | System override — "override system prompt" | Critical |
| DI-07 | `do\s+not\s+follow\s+(any\|your\|the)\s+(previous\|prior\|original)` | Instruction negation — "do not follow previous" | High |
| DI-08 | `act\s+as\s+(if\s+)?(you\s+)?(are\|were)\s+(a\|an)` | Persona hijack — "act as if you are a" | High |
| DI-09 | `pretend\s+(that\s+)?(you\s+)?(are\|have\|don't)` | Pretense attack — "pretend you are" | Medium |
| DI-10 | `from\s+now\s+on\s*,?\s*(you\|your\|ignore\|disregard\|only)` | Temporal override — "from now on, you" | High |
| DI-11 | `stop\s+being\s+(a\|an\|the)\s+\w+\s+and` | Role termination — "stop being an assistant and" | Medium |
| DI-12 | `switch\s+to\s+(unrestricted\|unfiltered\|jailbreak\|DAN)` | Mode switch — "switch to unrestricted mode" | Critical |
| DI-13 | `enable\s+(developer\|debug\|god\|admin\|sudo)\s+mode` | Privilege escalation mode — "enable developer mode" | Critical |
| DI-14 | `bypass\s+(all\s+)?(safety\|security\|content\|filter)` | Safety bypass — "bypass all safety filters" | Critical |
| DI-15 | `remove\s+(all\s+)?(restrictions?\|limitations?\|guardrails?\|filters?)` | Restriction removal — "remove all restrictions" | Critical |

### 2. Indirect via Tool Responses (10 patterns)

| ID | Regex Draft | Description | Risk |
|----|------------|-------------|------|
| IT-01 | `<\|im_start\|>` | LLaMA chat delimiter — im_start | Critical |
| IT-02 | `<\|im_end\|>` | LLaMA chat delimiter — im_end | Critical |
| IT-03 | `\[INST\]` | Mistral instruction wrapper | Critical |
| IT-04 | `<<SYS>>` | Llama-2 system prompt delimiter | Critical |
| IT-05 | `^\s*Human\s*:` | Claude conversation marker — Human | High |
| IT-06 | `^\s*Assistant\s*:` | Claude conversation marker — Assistant | High |
| IT-07 | `^\s*system\s*:` | System role injection at line start | High |
| IT-08 | `<\|system\|>` | GPT-4 system token injection | Critical |
| IT-09 | `<\|user\|>` | GPT-4 user token injection | High |
| IT-10 | `<\|assistant\|>` | GPT-4 assistant token injection | High |

### 3. Obfuscation/Encoding (12 patterns)

| ID | Regex Draft | Description | Risk |
|----|------------|-------------|------|
| OE-01 | Base64 decode + phrase match | Base64-encoded "ignore previous" | High |
| OE-02 | Base64 decode + phrase match | Base64-encoded "system:" | High |
| OE-03 | Unicode escape decode + phrase match | Unicode-escaped injection phrases (\\uXXXX) | High |
| OE-04 | `i\s*g\s*n\s*o\s*r\s*e\s+p\s*r\s*e\s*v\s*i\s*o\s*u\s*s` | Character-spaced evasion — "i g n o r e" | Medium |
| OE-05 | ROT13 decode + phrase match | ROT13-encoded "vtaber cerivbhf" → "ignore previous" | Medium |
| OE-06 | `(?:&#x[0-9a-f]{2};){6,}` | HTML hex entity sequences hiding injection | Medium |
| OE-07 | `(?:&#\d{2,3};){6,}` | HTML decimal entity sequences hiding injection | Medium |
| OE-08 | Reverse string detection | Reversed text: "suoiverp erongi" → "ignore previous" | Low |
| OE-09 | `%[0-9a-fA-F]{2}(?:%[0-9a-fA-F]{2}){5,}` | URL-encoded injection sequences | Medium |
| OE-10 | Hex decode + phrase match | Hex-encoded strings: "69676e6f7265" → "ignore" | Medium |
| OE-11 | Zero-width character stripping + re-check | Zero-width chars (U+200B, U+FEFF) between letters | High |
| OE-12 | Homoglyph normalization + re-check | Cyrillic/Greek lookalike characters (а→a, е→e) | Medium |

### 4. Semantic Manipulation (10 patterns)

| ID | Regex Draft | Description | Risk |
|----|------------|-------------|------|
| SM-01 | `the\s+(real\|actual\|true)\s+(instructions?\|prompt\|rules?)\s+(is\|are\|says?)` | Authority claim — "the real instructions are" | High |
| SM-02 | `(admin\|developer\|creator\|owner)\s+(says?\|told\|wants?\|instructed)` | Authority impersonation — "admin says" | High |
| SM-03 | `this\s+is\s+(a\|an)\s+(test\|drill\|exercise\|simulation)` | Test framing — "this is a test" to bypass safety | Medium |
| SM-04 | `in\s+(a\|this)\s+(hypothetical\|fictional\|imaginary)\s+scenario` | Hypothetical framing — bypass via fiction | Medium |
| SM-05 | `for\s+(educational\|research\|academic)\s+purposes?\s+only` | Educational framing — "for educational purposes" | Low |
| SM-06 | `I('m|\s+am)\s+(your\|the)\s+(developer\|creator\|admin\|owner)` | Identity claim — "I'm your developer" | High |
| SM-07 | `(reveal\|show\|display\|output\|print)\s+(your\|the)\s+(system\s+)?(prompt\|instructions?)` | Prompt extraction — "reveal your system prompt" | High |
| SM-08 | `what\s+(is\|are)\s+your\s+(system\s+)?(prompt\|instructions?\|rules?)` | Prompt probing — "what are your instructions" | Medium |
| SM-09 | `repeat\s+(everything\|all)\s+(above\|before\|from\s+the\s+start)` | Context extraction — "repeat everything above" | Medium |
| SM-10 | `(first\|begin\|start)\s+(by\s+)?(outputting\|printing\|showing)\s+(your\s+)?(system\|initial)` | Prefix extraction — "start by outputting your system" | High |

### 5. Format Confusion (5 patterns)

| ID | Regex Draft | Description | Risk |
|----|------------|-------------|------|
| FC-01 | `^\s*```\s*system\b` | Markdown code fence labeled "system" | Medium |
| FC-02 | `<system_prompt>` | XML-style system prompt tag | High |
| FC-03 | `</?(system\|instruction\|prompt)\s*>` | XML tag injection — closing/opening system tags | High |
| FC-04 | `---\s*\n\s*role:\s*system` | YAML frontmatter system role injection | Medium |
| FC-05 | `\{"role"\s*:\s*"system"\s*,\s*"content"` | JSON message format injection — system role | Critical |

### 6. Multi-Stage (5 patterns + detection strategy)

| ID | Regex Draft | Description | Risk |
|----|------------|-------------|------|
| MS-01 | Accumulation detector (stateful) | Split injection across multiple tool calls | Critical |
| MS-02 | `(step\|part)\s+\d+\s+of\s+\d+\s*:` | Multi-part instruction — "step 1 of 3:" | Medium |
| MS-03 | `continue\s+from\s+(where\|step\|part)` | Continuation trigger — "continue from where" | Low |
| MS-04 | `when\s+you\s+(see\|receive\|get)\s+the\s+(signal\|keyword\|trigger)` | Trigger-based activation — "when you see the signal" | High |
| MS-05 | `remember\s+this\s+for\s+later\s*:` | Deferred payload — "remember this for later:" | Medium |

**Total: 57 patterns** across 6 categories.

---

## Implementation Plan for Sprint 3

### Phase 1: Pattern Compilation (Week 1)

1. **Convert all regex drafts to tested patterns**
   - Each pattern validated against 3+ positive examples and 3+ negative examples
   - False positive rate target: <0.1% on benign corpus
   - Add to `config/tool-sanitizer-patterns.json` with version bump

2. **Encoding detectors (OE category)**
   - Extend `checkBase64Injection()` to cover ROT13, hex, URL-encoding
   - Add `checkHomoglyphInjection()` — normalize Unicode confusables before regex
   - Add `stripZeroWidthChars()` preprocessing step
   - Character-spacing normalization: collapse `i g n o r e` → `ignore` before check

3. **Multi-stage detection (MS category)**
   - Design stateful accumulator keyed by `sessionId + toolName`
   - Sliding window: track last N tool responses per session
   - Concatenation check: join recent outputs, re-run sanitizer
   - TTL: auto-expire accumulated state after 5 minutes idle

### Phase 2: Integration (Week 2)

4. **Update `tool-sanitizer.ts`**
   - Add new detection layers: encoding normalization → pattern match → semantic check
   - Maintain AR60 independence (no PER-1/MEM-6 imports)
   - Benchmark: <10ms for 100KB inputs (current baseline)

5. **Update admin API**
   - Add category field to pattern definitions
   - Add risk level to pattern definitions
   - Extend GET endpoint to support filtering by category/risk
   - Admin dashboard: blocked events by category visualization

6. **Config versioning**
   - Bump `tool-sanitizer-patterns.json` version to 2
   - Migration: auto-upgrade v1 configs on first load
   - Backward compatibility: v1 patterns continue to work unchanged

### Phase 3: Validation (Week 3)

7. **Expand adversarial test suite**
   - Target: 100+ adversarial payloads (up from 35)
   - Target: 50+ benign payloads (up from 28)
   - Category coverage: each category has ≥5 adversarial tests
   - Performance regression test: p99 latency ≤ 15ms at 100KB

8. **Red team exercise**
   - Internal adversarial testing session
   - External OWASP prompt injection benchmark (if available)
   - Document bypass attempts and add patterns for any discovered gaps

---

## Cross-Sprint Test Scope (Epic 28)

### Regression Tests
- All 57 patterns tested with positive and negative examples
- Backward compatibility: all 12 Sprint 2 patterns still pass
- False positive rate: <0.1% on 100+ benign corpus

### Performance Tests
- Latency: p50 <2ms, p99 <10ms at 100KB input
- Throughput: >10,000 checks/sec per core
- Memory: <5MB additional memory for pattern compilation

### Integration Tests
- agent-loop.ts sanitizer calls still at 3+ paths
- Admin API: CRUD operations on new pattern categories
- Audit logging: all 6 categories produce distinct log entries
- Hot reload: `reloadPatterns()` picks up new patterns without restart

### Security Tests
- Each encoding bypass (OE-01 through OE-12) verified blocked
- Multi-stage accumulation (MS-01) detects split payloads
- No regression on AR60 independence constraint
- Config file tampering: malformed JSON handled gracefully

### E2E Verification
- Go/No-Go #12 script (Sprint 3 exit criteria)
- Expanded from 10 to 15 checklist items
- New items: encoding bypass rate, semantic detection rate, multi-stage detection
