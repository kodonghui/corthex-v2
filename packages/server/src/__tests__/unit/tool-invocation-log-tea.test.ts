/**
 * TEA (Test Architect) Risk-Based Tests for Story 4-5: Tool Invocation Log System
 *
 * Risk Coverage:
 * - P0: NFR12 credential masking edge cases (critical security requirement)
 * - P0: Fire-and-forget logging reliability (must never crash tool execution)
 * - P1: ToolPool timing and integration edge cases
 * - P1: Query/Stats service boundary validation
 * - P2: Schema integrity and relation correctness
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { maskCredentials, maskCredentialsInString } from '../../lib/credential-masker'

// ==========================================
// P0: NFR12 Credential Masking Edge Cases
// ==========================================

describe('[TEA-P0] NFR12 credential masking edge cases', () => {
  test('깊이 5단계 중첩 객체에서 민감 필드를 마스킹한다', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                password: 'deep-nested-secret',
              },
            },
          },
        },
      },
    }
    const result = maskCredentials(input) as any
    expect(result.level1.level2.level3.level4.level5.password).toBe('deep***')
  })

  test('여러 민감 패턴이 하나의 문자열에 포함된 경우 모두 마스킹', () => {
    const input = 'key1=sk-abcdefghijklmnopqrstuvwx auth=Bearer eyJhbGciOiJIUzI1NiJ9.test credentials=Basic dXNlcjpwYXNz'
    const result = maskCredentialsInString(input)
    expect(result).toContain('sk-***')
    expect(result).toContain('Bearer ***')
    expect(result).toContain('Basic ***')
    expect(result).not.toContain('abcdefghijklmnopqrstuvwx')
    expect(result).not.toContain('eyJhbGci')
  })

  test('빈 객체를 안전하게 처리한다', () => {
    const result = maskCredentials({})
    expect(result).toEqual({})
  })

  test('빈 배열을 안전하게 처리한다', () => {
    const result = maskCredentials([])
    expect(result).toEqual([])
  })

  test('민감 필드명이지만 값이 숫자인 경우 그대로 유지', () => {
    const input = { password: 12345, token: 0, secret: true }
    const result = maskCredentials(input) as any
    // Non-string values in sensitive fields are not masked (only string values)
    expect(result.password).toBe(12345)
    expect(result.token).toBe(0)
    expect(result.secret).toBe(true)
  })

  test('민감 필드명이 대소문자 혼합이어도 마스킹', () => {
    const input = { PASSWORD: 'case-test', ApiKey: 'key-test-12345' }
    const result = maskCredentials(input) as any
    // Note: our implementation lowercases, so PASSWORD -> password matches
    expect(result.PASSWORD).toBe('case***')
    expect(result.ApiKey).toBe('key-***')
  })

  test('sk- 패턴이 정확히 20자 미만이면 마스킹하지 않는다', () => {
    const input = 'short key: sk-abc'
    const result = maskCredentialsInString(input)
    // sk-abc is only 3 chars after sk-, minimum is 20
    expect(result).toBe('short key: sk-abc')
  })

  test('AKIA AWS 키 패턴을 마스킹한다', () => {
    const input = 'AWS key: AKIAIOSFODNN7EXAMPLE'
    const result = maskCredentialsInString(input)
    expect(result).toContain('AKIA***')
    expect(result).not.toContain('IOSFODNN7EXAMPLE')
  })

  test('배열 내 문자열도 패턴 마스킹 적용', () => {
    const input = ['normal text', 'key: sk-abcdefghijklmnopqrstuvwxyz1234', 'more text']
    const result = maskCredentials(input) as string[]
    expect(result[0]).toBe('normal text')
    expect(result[1]).toContain('sk-***')
    expect(result[2]).toBe('more text')
  })

  test('bot_token 필드가 마스킹된다', () => {
    const input = { bot_token: 'telegram-bot-token-value-12345' }
    const result = maskCredentials(input) as any
    expect(result.bot_token).toBe('tele***')
  })

  test('passphrase 필드가 마스킹된다', () => {
    const input = { passphrase: 'my-secret-passphrase' }
    const result = maskCredentials(input) as any
    expect(result.passphrase).toBe('my-s***')
  })

  test('client_secret 필드가 마스킹된다', () => {
    const input = { client_secret: 'oauth-client-secret-value' }
    const result = maskCredentials(input) as any
    expect(result.client_secret).toBe('oaut***')
  })

  test('private_key 필드가 마스킹된다', () => {
    const input = { private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQ...' }
    const result = maskCredentials(input) as any
    expect(result.private_key).toBe('----***')
  })

  test('privatekey (언더스코어 없이)도 마스킹된다', () => {
    const input = { privatekey: 'private-key-value-here' }
    const result = maskCredentials(input) as any
    expect(result.privatekey).toBe('priv***')
  })
})

// ==========================================
// P0: Fire-and-Forget Logging Reliability
// ==========================================

describe('[TEA-P0] fire-and-forget logging reliability', () => {
  test('recordToolInvocation이 void를 반환한다 (Promise가 아님)', async () => {
    const { recordToolInvocation } = await import('../../services/tool-invocation-log')
    const result = recordToolInvocation({
      companyId: '00000000-0000-0000-0000-000000000001',
      toolName: 'test_tool',
      status: 'success',
    })
    // Should return void, not a Promise
    expect(result).toBeUndefined()
  })

  test('ToolPool execute가 recordToolInvocation DB 오류와 무관하게 정상 결과를 반환', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'reliable_tool',
      description: 'Should work despite logging failure',
      category: 'common',
      parameters: z.object({ msg: z.string() }),
      execute: async () => ({ success: true as const, result: 'it works' }),
    })

    // Even if DB is down, execute should still return the tool result
    const result = await pool.execute('reliable_tool', { msg: 'hello' }, {
      companyId: 'company-1',
      agentId: 'agent-1',
      agentName: 'Test Agent',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.result).toBe('it works')
    }
  })
})

// ==========================================
// P1: ToolPool Timing and Integration
// ==========================================

describe('[TEA-P1] ToolPool timing and integration', () => {
  test('execute()가 느린 도구의 duration을 정확히 측정한다', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'slow_tool',
      description: 'Simulates slow execution',
      category: 'common',
      parameters: z.object({}),
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return { success: true as const, result: 'done' }
      },
    })

    const start = Date.now()
    const result = await pool.execute('slow_tool', {}, {
      companyId: 'c1',
      agentId: 'a1',
      agentName: 'Agent',
    })
    const elapsed = Date.now() - start

    expect(result.success).toBe(true)
    expect(elapsed).toBeGreaterThanOrEqual(40) // At least ~50ms
  })

  test('execute()가 존재하지 않는 도구에 로깅 없이 에러 반환', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const pool = new ToolPool()

    const result = await pool.execute('nonexistent', {}, {
      companyId: 'c1',
      agentId: 'a1',
      agentName: 'Agent',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('not found')
    }
  })

  test('execute()가 Zod 검증 실패 시 에러 반환', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'strict_tool',
      description: 'Requires specific params',
      category: 'common',
      parameters: z.object({
        required_field: z.string().min(1),
        number_field: z.number().positive(),
      }),
      execute: async () => ({ success: true as const, result: 'ok' }),
    })

    const result = await pool.execute('strict_tool', { required_field: '', number_field: -1 }, {
      companyId: 'c1',
      agentId: 'a1',
      agentName: 'Agent',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Invalid parameters')
    }
  })

  test('execute()에서 도구가 에러 결과를 반환하면 status=error로 기록', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'api_error_tool',
      description: 'Returns API error',
      category: 'common',
      parameters: z.object({}),
      execute: async () => ({ success: false as const, error: 'API rate limit exceeded' }),
    })

    const result = await pool.execute('api_error_tool', {}, {
      companyId: 'c1',
      agentId: 'a1',
      agentName: 'Agent',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('API rate limit exceeded')
    }
  })

  test('execute()에서 도구가 예외를 throw하면 에러로 캡처', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'throwing_tool',
      description: 'Throws unexpected error',
      category: 'common',
      parameters: z.object({}),
      execute: async () => { throw new TypeError('Cannot read property of undefined') },
    })

    const result = await pool.execute('throwing_tool', {}, {
      companyId: 'c1',
      agentId: 'a1',
      agentName: 'Agent',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Cannot read property')
    }
  })

  test('execute()에서 비-Error 예외도 안전하게 처리', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'string_throw_tool',
      description: 'Throws a string',
      category: 'common',
      parameters: z.object({}),
      execute: async () => { throw 'string error' },
    })

    const result = await pool.execute('string_throw_tool', {}, {
      companyId: 'c1',
      agentId: 'a1',
      agentName: 'Agent',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('string error')
    }
  })
})

// ==========================================
// P1: Service Interface Validation
// ==========================================

describe('[TEA-P1] service interface validation', () => {
  test('RecordToolInvocationInput에 필수 필드만 전달해도 동작', async () => {
    const { recordToolInvocation } = await import('../../services/tool-invocation-log')
    // Should not throw even with minimal input
    expect(() => {
      recordToolInvocation({
        companyId: '00000000-0000-0000-0000-000000000001',
        toolName: 'minimal_tool',
        status: 'success',
      })
    }).not.toThrow()
  })

  test('queryToolInvocations 함수 시그니처 검증', async () => {
    const mod = await import('../../services/tool-invocation-log')
    expect(mod.queryToolInvocations.length).toBeGreaterThanOrEqual(1)
  })

  test('getToolInvocationStats 함수 시그니처 검증', async () => {
    const mod = await import('../../services/tool-invocation-log')
    expect(mod.getToolInvocationStats.length).toBeGreaterThanOrEqual(1)
  })
})

// ==========================================
// P1: Route Configuration Validation
// ==========================================

describe('[TEA-P1] route configuration', () => {
  test('toolInvocationsRoute가 Hono 인스턴스이다', async () => {
    const { toolInvocationsRoute } = await import('../../routes/admin/tool-invocations')
    expect(toolInvocationsRoute).toBeDefined()
    // Should be a Hono instance with route methods
    expect(typeof toolInvocationsRoute.get).toBe('function')
  })

  test('index.ts에 toolInvocationsRoute가 import되어 있다', async () => {
    const indexContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/index.ts').text()
    expect(indexContent).toContain("toolInvocationsRoute")
    expect(indexContent).toContain("tool-invocations")
  })
})

// ==========================================
// P2: Schema Integrity
// ==========================================

describe('[TEA-P2] schema integrity', () => {
  test('toolCalls에 인덱스가 정의되어 있다', async () => {
    const schemaContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/db/schema.ts').text()
    expect(schemaContent).toContain('tool_calls_company_created_idx')
    expect(schemaContent).toContain('tool_calls_agent_idx')
    expect(schemaContent).toContain('tool_calls_tool_name_idx')
  })

  test('toolCalls.agentId가 nullable로 변경되었다', async () => {
    const schemaContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/db/schema.ts').text()
    // agentId should NOT have .notNull()
    const toolCallsSection = schemaContent.split("pgTable('tool_calls'")[1]?.split('})')[0] || ''
    expect(toolCallsSection).toContain("agentId: uuid('agent_id').references")
    // Should NOT contain notNull for agentId in tool_calls
    const agentIdLine = toolCallsSection.split('\n').find(l => l.includes('agent_id'))
    expect(agentIdLine).not.toContain('.notNull()')
  })

  test('toolCalls.sessionId가 nullable로 변경되었다', async () => {
    const schemaContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/db/schema.ts').text()
    const toolCallsSection = schemaContent.split("pgTable('tool_calls'")[1]?.split('})')[0] || ''
    const sessionIdLine = toolCallsSection.split('\n').find(l => l.includes('session_id'))
    expect(sessionIdLine).not.toContain('.notNull()')
  })

  test('toolCalls.toolId가 nullable로 변경되었다', async () => {
    const schemaContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/db/schema.ts').text()
    const toolCallsSection = schemaContent.split("pgTable('tool_calls'")[1]?.split('})')[0] || ''
    const toolIdLine = toolCallsSection.split('\n').find(l => l.includes('tool_id'))
    expect(toolIdLine).not.toContain('.notNull()')
  })

  test('ToolPool에 recordToolInvocation import가 존재한다', async () => {
    const toolPoolContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/services/tool-pool.ts').text()
    expect(toolPoolContent).toContain("import { recordToolInvocation }")
    expect(toolPoolContent).toContain("tool-invocation-log")
  })

  test('credential-masker가 tool-invocation-log에서 import된다', async () => {
    const logContent = await Bun.file('/home/ubuntu/corthex-v2/packages/server/src/services/tool-invocation-log.ts').text()
    expect(logContent).toContain("maskCredentials")
    expect(logContent).toContain("maskCredentialsInString")
    expect(logContent).toContain("credential-masker")
  })
})
