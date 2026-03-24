/**
 * Tool Sanitizer — PreToolResult hook for prompt injection detection
 * AR60: Independent — NEVER import from soul-enricher, personality-*, observation-*
 *
 * Sanitizes external tool responses (MCP, call_agent) before they reach the AI agent.
 * Detects prompt injection patterns and blocks malicious content.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SessionContext } from '../types'

// ─── Types ───────────────────────────────────────────────────────────

export interface SanitizeResult {
  content: string
  blocked: boolean
  pattern?: string
}

interface PatternDef {
  id: string
  regex: string
  flags: string
  description: string
}

interface PatternsConfig {
  version: number
  patterns: PatternDef[]
}

// ─── Compiled patterns ───────────────────────────────────────────────

const BLOCKED_MESSAGE = '[BLOCKED: suspected prompt injection in tool response]'
const CONFIG_PATH = resolve(import.meta.dir, '../../../config/tool-sanitizer-patterns.json')

let compiledPatterns: Array<{ id: string; regex: RegExp }> = []

function compilePatterns(defs: PatternDef[]): Array<{ id: string; regex: RegExp }> {
  return defs.map(p => ({
    id: p.id,
    regex: new RegExp(p.regex, p.flags),
  }))
}

/** Load patterns from JSON config file */
function loadPatternsFromFile(): PatternsConfig {
  const raw = readFileSync(CONFIG_PATH, 'utf-8')
  return JSON.parse(raw) as PatternsConfig
}

// Initialize on module load
try {
  const config = loadPatternsFromFile()
  compiledPatterns = compilePatterns(config.patterns)
} catch {
  // Fallback: empty patterns if config file missing (should not happen in prod)
  compiledPatterns = []
}

// ─── Base64 detection ────────────────────────────────────────────────

// Common prompt injection phrases to detect when base64-decoded
const BASE64_INJECTION_PHRASES = [
  'ignore previous',
  'ignore all previous',
  'disregard prior',
  'disregard previous',
  'system:',
  '<|im_start|>',
  '<|im_end|>',
  '[INST]',
  '<<SYS>>',
]

const BASE64_REGEX = /[A-Za-z0-9+/]{20,}={0,2}/g

function checkBase64Injection(text: string): string | null {
  const matches = text.match(BASE64_REGEX)
  if (!matches) return null

  for (const match of matches) {
    try {
      const decoded = atob(match).toLowerCase()
      for (const phrase of BASE64_INJECTION_PHRASES) {
        if (decoded.includes(phrase.toLowerCase())) {
          return `base64:${phrase}`
        }
      }
    } catch {
      // Not valid base64 — skip
    }
  }
  return null
}

// ─── Unicode escape detection ────────────────────────────────────────

const UNICODE_ESCAPE_REGEX = /\\u[0-9a-fA-F]{4}(?:\\u[0-9a-fA-F]{4}){3,}/g

function decodeUnicodeEscapes(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )
}

function checkUnicodeEscapeInjection(text: string): string | null {
  const matches = text.match(UNICODE_ESCAPE_REGEX)
  if (!matches) return null

  for (const match of matches) {
    const decoded = decodeUnicodeEscapes(match).toLowerCase()
    for (const phrase of BASE64_INJECTION_PHRASES) {
      if (decoded.includes(phrase.toLowerCase())) {
        return `unicode:${phrase}`
      }
    }
  }
  return null
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Sanitize tool output for prompt injection patterns.
 * Returns blocked=true with replacement message if injection detected.
 */
export function toolSanitizer(
  _ctx: SessionContext,
  _toolName: string,
  toolOutput: string,
): SanitizeResult {
  // Check compiled regex patterns
  for (const { id, regex } of compiledPatterns) {
    // Reset lastIndex for stateful regexes (flags with 'g')
    regex.lastIndex = 0
    if (regex.test(toolOutput)) {
      return { content: BLOCKED_MESSAGE, blocked: true, pattern: id }
    }
  }

  // Check base64 encoded variants
  const base64Hit = checkBase64Injection(toolOutput)
  if (base64Hit) {
    return { content: BLOCKED_MESSAGE, blocked: true, pattern: base64Hit }
  }

  // Check unicode escape variants
  const unicodeHit = checkUnicodeEscapeInjection(toolOutput)
  if (unicodeHit) {
    return { content: BLOCKED_MESSAGE, blocked: true, pattern: unicodeHit }
  }

  return { content: toolOutput, blocked: false }
}

/**
 * Reload patterns from config file at runtime.
 * Used by Admin API to hot-reload after config change.
 */
export function reloadPatterns(): { count: number } {
  const config = loadPatternsFromFile()
  compiledPatterns = compilePatterns(config.patterns)
  return { count: compiledPatterns.length }
}

/**
 * Get current loaded patterns (for Admin API GET endpoint).
 */
export function getPatterns(): PatternsConfig {
  return loadPatternsFromFile()
}

/**
 * Save patterns to config file and reload (for Admin API PUT endpoint).
 * Consolidates all config file I/O in this module (DRY — no CONFIG_PATH duplication).
 */
export function savePatterns(config: PatternsConfig): { count: number } {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8')
  return reloadPatterns()
}
