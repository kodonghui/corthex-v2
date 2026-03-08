/**
 * Prompt Guard Middleware -- FR55: 프롬프트 인젝션 방어 미들웨어
 * commands.ts POST 엔드포인트에 적용하여 입력 검증
 * - Zod 검증 후, 비즈니스 로직 전에 실행
 * - 차단 시 403 응답 + 감사 로그 기록
 * - 회사 설정에서 민감도 레벨 조회
 */

import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types'
import { scanInput, getHighestSeverity, type SensitivityLevel } from '../services/prompt-guard'
import { createAuditLog, AUDIT_ACTIONS } from '../services/audit-log'
import { getPromptGuardSettings } from '../services/prompt-guard-settings'

/**
 * Hono middleware: scans POST body text for prompt injection patterns.
 * Expects body to have a `text` field (validated by Zod before this middleware).
 */
export const promptGuardMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Only check POST requests with body
  if (c.req.method !== 'POST') {
    return next()
  }

  // Read body text — use parseBody for compatibility with Hono's body caching
  // After zValidator, the body is already parsed; re-read safely
  let text: string | undefined
  try {
    const body = await c.req.json() as { text?: string }
    text = body?.text
  } catch {
    // If body can't be parsed, let other middleware handle it
    return next()
  }
  if (!text || typeof text !== 'string') {
    return next()
  }

  // Get tenant context for company settings
  const tenant = c.get('tenant')
  const settings = await getPromptGuardSettings(tenant.companyId)

  if (!settings.enabled) {
    return next()
  }

  // Scan input
  const result = scanInput(text, settings.sensitivityLevel)

  // If threats found, log them (even if whitelisted)
  if (result.threats.length > 0) {
    const severity = getHighestSeverity(result.threats)

    // Log the attempt (fire-and-forget, don't block on audit log failure)
    createAuditLog({
      companyId: tenant.companyId,
      actorType: 'user',
      actorId: tenant.userId,
      action: result.safe
        ? AUDIT_ACTIONS.SECURITY_INJECTION_ATTEMPT
        : AUDIT_ACTIONS.SECURITY_INPUT_BLOCKED,
      targetType: 'command',
      metadata: {
        severity,
        threats: result.threats.map((t) => ({
          severity: t.severity,
          pattern: t.pattern,
          category: t.category,
        })),
        sensitivityLevel: result.sensitivityLevel,
        whitelisted: result.whitelisted,
        inputLength: text.length,
        inputPreview: text.slice(0, 200),
      },
    }).catch(() => {
      // Audit log failure should not block the request
    })
  }

  // If not safe, block the request
  if (!result.safe) {
    return c.json(
      {
        success: false,
        error: {
          code: 'PROMPT_INJECTION_BLOCKED',
          message: '보안 정책에 의해 차단된 입력입니다. 프롬프트 인젝션 시도가 감지되었습니다.',
        },
      },
      403,
    )
  }

  return next()
}
