/**
 * Prompt Guard Service -- FR55: 프롬프트 인젝션 방어
 * 입력 검증 + 패턴 탐지 서비스
 * - 프롬프트 인젝션 시도 탐지 (severity별 분류)
 * - 민감도 레벨: strict / moderate / permissive
 * - 화이트리스트 컨텍스트 감지 (보안 기술 토론 허용)
 * - 한국어 패턴 지원
 */

// === Types ===

export type SensitivityLevel = 'strict' | 'moderate' | 'permissive'
export type ThreatSeverity = 'critical' | 'major' | 'minor'

export interface Threat {
  severity: ThreatSeverity
  pattern: string
  matchedText: string
  category: 'injection' | 'extraction' | 'hijacking'
}

export interface ScanResult {
  safe: boolean
  threats: Threat[]
  whitelisted: boolean
  sensitivityLevel: SensitivityLevel
}

// === Injection Patterns ===

interface InjectionPattern {
  regex: RegExp
  severity: ThreatSeverity
  category: Threat['category']
  description: string
}

const INJECTION_PATTERNS: InjectionPattern[] = [
  // Critical: Direct instruction override
  { regex: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|directives?)/i, severity: 'critical', category: 'injection', description: 'ignore previous instructions' },
  { regex: /disregard\s+(all\s+)?(above|previous|prior|earlier)\s*(instructions?|prompts?|context)?/i, severity: 'critical', category: 'injection', description: 'disregard instructions' },
  { regex: /override\s+(the\s+)?system\s+prompt/i, severity: 'critical', category: 'injection', description: 'override system prompt' },
  { regex: /forget\s+(all\s+)?(your\s+)?(previous|prior|earlier)\s+(instructions?|rules?)/i, severity: 'critical', category: 'injection', description: 'forget instructions' },
  { regex: /do\s+not\s+follow\s+(your\s+)?(previous|original|initial)\s+(instructions?|rules?)/i, severity: 'critical', category: 'injection', description: 'do not follow instructions' },

  // Critical: System prompt extraction
  { regex: /repeat\s+(your\s+)?system\s+prompt/i, severity: 'critical', category: 'extraction', description: 'repeat system prompt' },
  { regex: /show\s+(me\s+)?your\s+(system\s+)?(instructions?|prompt|rules?|directives?)/i, severity: 'critical', category: 'extraction', description: 'show instructions' },
  { regex: /what\s+(is|are)\s+(your\s+)?system\s+(prompt|instructions?|rules?)/i, severity: 'critical', category: 'extraction', description: 'what is system prompt' },
  { regex: /print\s+(your\s+)?(system\s+)?(prompt|instructions?|configuration)/i, severity: 'critical', category: 'extraction', description: 'print system prompt' },
  { regex: /output\s+(your\s+)?(entire\s+)?(system\s+)?(prompt|instructions?)/i, severity: 'critical', category: 'extraction', description: 'output system prompt' },

  // Critical: Role hijacking (strong)
  { regex: /you\s+are\s+now\s+(a|an|the)\s+/i, severity: 'critical', category: 'hijacking', description: 'you are now a...' },
  { regex: /act\s+as\s+if\s+you\s+have\s+no\s+restrictions/i, severity: 'critical', category: 'hijacking', description: 'no restrictions' },
  { regex: /\bDAN\s+mode\b/i, severity: 'critical', category: 'hijacking', description: 'DAN mode' },
  { regex: /\bjailbreak\b/i, severity: 'critical', category: 'hijacking', description: 'jailbreak' },
  { regex: /enter\s+(developer|debug|god|admin)\s+mode/i, severity: 'critical', category: 'hijacking', description: 'enter special mode' },
  { regex: /switch\s+to\s+(unrestricted|unfiltered)\s+mode/i, severity: 'critical', category: 'hijacking', description: 'switch to unrestricted' },

  // Critical: Korean patterns
  { regex: /이전\s*(지시|명령|프롬프트|규칙).*무시/i, severity: 'critical', category: 'injection', description: '이전 지시 무시' },
  { regex: /시스템\s*프롬프트.*보여/i, severity: 'critical', category: 'extraction', description: '시스템 프롬프트 보여줘' },
  { regex: /시스템\s*프롬프트.*출력/i, severity: 'critical', category: 'extraction', description: '시스템 프롬프트 출력' },
  { regex: /시스템\s*프롬프트.*알려/i, severity: 'critical', category: 'extraction', description: '시스템 프롬프트 알려줘' },
  { regex: /너는?\s*이제부터/i, severity: 'critical', category: 'hijacking', description: '너는 이제부터' },
  { regex: /지금부터\s*넌?\s+.{2,}/i, severity: 'critical', category: 'hijacking', description: '지금부터 넌' },

  // Major: Role hijacking (moderate)
  { regex: /pretend\s+(you\s+are|to\s+be)\s+/i, severity: 'major', category: 'hijacking', description: 'pretend you are' },
  { regex: /roleplay\s+as\s+/i, severity: 'major', category: 'hijacking', description: 'roleplay as' },
  { regex: /\bact\s+as\s+(?!a\s+team)/i, severity: 'major', category: 'hijacking', description: 'act as' },
  { regex: /당신은\s*이제/i, severity: 'major', category: 'hijacking', description: '당신은 이제' },
  { regex: /역할을?\s*바꿔/i, severity: 'major', category: 'hijacking', description: '역할 바꿔' },

  // Minor: Indirect manipulation
  { regex: /bypass\s+(your\s+)?(safety|content)\s+(filters?|restrictions?)/i, severity: 'minor', category: 'injection', description: 'bypass safety' },
  { regex: /제한.*해제/i, severity: 'minor', category: 'injection', description: '제한 해제' },
]

// === Whitelist Keywords ===

const WHITELIST_KEYWORDS = [
  // Security technical discussion
  'owasp', 'cve-', 'vulnerability', 'security audit', 'penetration test',
  'pentest', 'security review', 'threat model', 'security assessment',
  'code review', 'static analysis', 'dynamic analysis',
  // Korean security terms
  '보안 취약점', '보안 분석', '보안 점검', '보안 감사',
  '프롬프트 인젝션 방어', '프롬프트 인젝션 대응', '인젝션 공격 방지',
  '보안 테스트', '취약점 분석', '보안 대책',
  // Educational
  'how to prevent', 'how to defend', 'how to protect',
  '방어 방법', '대응 방안', '보호 방법',
]

// === Core Functions ===

/**
 * Check if the input text contains whitelisted security discussion context.
 */
function isWhitelistedContext(text: string): boolean {
  const lower = text.toLowerCase()
  return WHITELIST_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

/**
 * Determine which severities should trigger blocking based on sensitivity level.
 * - strict: block critical + major + minor
 * - moderate: block critical + major, warn on minor
 * - permissive: block critical, warn on major + minor
 */
function shouldBlock(severity: ThreatSeverity, level: SensitivityLevel): boolean {
  if (severity === 'critical') return true
  if (severity === 'major') return level !== 'permissive'
  // minor
  return level === 'strict'
}

/**
 * Scan user input text for prompt injection patterns.
 * Returns scan result with threats found and whether input is safe.
 */
export function scanInput(text: string, level: SensitivityLevel = 'moderate'): ScanResult {
  const threats: Threat[] = []
  const whitelisted = isWhitelistedContext(text)

  for (const pattern of INJECTION_PATTERNS) {
    const match = pattern.regex.exec(text)
    if (match) {
      threats.push({
        severity: pattern.severity,
        pattern: pattern.description,
        matchedText: match[0].slice(0, 100), // Truncate for safety
        category: pattern.category,
      })
    }
  }

  // If whitelisted context detected, don't block (but still report threats for audit)
  if (whitelisted && threats.length > 0) {
    return { safe: true, threats, whitelisted: true, sensitivityLevel: level }
  }

  // Determine if any threat should block based on sensitivity level
  const blocked = threats.some((t) => shouldBlock(t.severity, level))

  return {
    safe: !blocked,
    threats,
    whitelisted: false,
    sensitivityLevel: level,
  }
}

/**
 * Get the highest severity among threats.
 */
export function getHighestSeverity(threats: Threat[]): ThreatSeverity | null {
  if (threats.length === 0) return null
  if (threats.some((t) => t.severity === 'critical')) return 'critical'
  if (threats.some((t) => t.severity === 'major')) return 'major'
  return 'minor'
}
