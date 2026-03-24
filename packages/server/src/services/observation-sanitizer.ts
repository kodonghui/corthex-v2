/**
 * MEM-6 4-Layer Observation Sanitization (Story 28.2)
 *
 * INDEPENDENT chain — AR60: zero imports from PER-1 (soul-enricher, personality-*)
 * or TOOLSANITIZE (tool-sanitizer.ts).
 *
 * Key difference from TOOLSANITIZE: MEM-6 FLAGS content but still stores it.
 * Flagged observations are excluded from reflection cron processing.
 */

export interface SanitizeObservationResult {
  content: string
  flagged: boolean
  truncated: boolean
  controlCharsRemoved: number
  matchedPatterns: string[]
}

/** Minimum 12 observation-specific threat patterns */
const OBSERVATION_MALICIOUS_PATTERNS = [
  { id: 'obs-system-override', regex: /^system\s*:/im },
  { id: 'obs-ignore-prior', regex: /ignore\s+(all\s+)?previous/i },
  { id: 'obs-role-change', regex: /you\s+are\s+now\s+(a|an|the)/i },
  { id: 'obs-disregard', regex: /disregard\s+(all\s+)?(prior|previous|above)/i },
  { id: 'obs-new-instructions', regex: /new\s+instructions?\s*:/i },
  { id: 'obs-forget-prior', regex: /forget\s+(all\s+)?(your\s+)?(previous|prior)/i },
  { id: 'obs-llm-delimiter', regex: /<\|im_start\|>|<\|im_end\|>|<<SYS>>|\[INST\]/i },
  { id: 'obs-xml-injection', regex: /<\/?(?:system|instruction|prompt|tool_result)>/i },
  { id: 'obs-base64-payload', regex: /[A-Za-z0-9+/]{40,}={0,2}/ },
  { id: 'obs-data-exfil', regex: /(?:fetch|curl|wget|http:\/\/|https:\/\/)\s*(?:attacker|evil|hack)/i },
  { id: 'obs-memory-poison', regex: /(?:remember|memorize|store)\s+(?:that|this)\s*:?\s*(?:ignore|override|bypass)/i },
  { id: 'obs-reflection-poison', regex: /(?:when\s+reflecting|during\s+reflection|in\s+your\s+memory)\s*[,:]\s*(?:ignore|delete|override)/i },
] as const

const MAX_OBSERVATION_BYTES = 10240

export function sanitizeObservation(content: string): SanitizeObservationResult {
  let flagged = false
  let truncated = false
  const matchedPatterns: string[] = []

  // Layer 1: Size limit — 10KB cap (DB CHECK also enforces)
  if (content.length > MAX_OBSERVATION_BYTES) {
    content = content.slice(0, MAX_OBSERVATION_BYTES)
    truncated = true
  }

  // Layer 2: Control character strip — \x00-\x1F except \n (0x0A) and \t (0x09)
  const cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
  const controlCharsRemoved = content.length - cleaned.length
  content = cleaned

  // Layer 3: Prompt hardening — content will be wrapped in <observation> tags
  // during reflection LLM call (Story 28.4). No modification here at storage time.

  // Layer 4: Content classification — keyword blocklist + regex pattern matching
  for (const pattern of OBSERVATION_MALICIOUS_PATTERNS) {
    if (pattern.regex.test(content)) {
      flagged = true
      matchedPatterns.push(pattern.id)
    }
  }

  return { content, flagged, truncated, controlCharsRemoved, matchedPatterns }
}
