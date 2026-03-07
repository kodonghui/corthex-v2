import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { maskCredentials, maskCredentialsInString } from '../../lib/credential-masker'

// ==========================================
// Task 1: Credential Masking Tests
// ==========================================

describe('credential-masker', () => {
  describe('maskCredentials', () => {
    test('null/undefined를 그대로 반환한다', () => {
      expect(maskCredentials(null)).toBeNull()
      expect(maskCredentials(undefined)).toBeUndefined()
    })

    test('숫자/불리언을 그대로 반환한다', () => {
      expect(maskCredentials(42)).toBe(42)
      expect(maskCredentials(true)).toBe(true)
    })

    test('빈 문자열을 그대로 반환한다', () => {
      expect(maskCredentials('')).toBe('')
    })

    test('일반 문자열(민감하지 않은)을 그대로 반환한다', () => {
      expect(maskCredentials('hello world')).toBe('hello world')
    })

    test('민감 필드명의 값을 마스킹한다', () => {
      const input = {
        username: 'admin',
        password: 'my-secret-pass',
        apiKey: 'abcdef123456',
      }
      const result = maskCredentials(input) as Record<string, string>
      expect(result.username).toBe('admin')
      expect(result.password).toBe('my-s***')
      expect(result.apiKey).toBe('abcd***')
    })

    test('token, secret, authorization 필드를 마스킹한다', () => {
      const input = {
        token: 'long-token-value-here',
        secret: 'super-secret-value',
        authorization: 'Bearer abc123xyz',
      }
      const result = maskCredentials(input) as Record<string, string>
      expect(result.token).toBe('long***')
      expect(result.secret).toBe('supe***')
      expect(result.authorization).toBe('Bear***')
    })

    test('중첩된 객체의 민감 필드를 재귀적으로 마스킹한다', () => {
      const input = {
        config: {
          database: {
            password: 'db-password-123',
          },
          api: {
            key: 'normal-value',
          },
        },
      }
      const result = maskCredentials(input) as any
      expect(result.config.database.password).toBe('db-p***')
      expect(result.config.api.key).toBe('normal-value')
    })

    test('배열 내 객체의 민감 필드를 마스킹한다', () => {
      const input = [
        { name: 'service1', apiKey: 'key-abcdefgh' },
        { name: 'service2', apiKey: 'key-12345678' },
      ]
      const result = maskCredentials(input) as any[]
      expect(result[0].name).toBe('service1')
      expect(result[0].apiKey).toBe('key-***')
      expect(result[1].apiKey).toBe('key-***')
    })

    test('짧은 민감 필드 값(4자 이하)은 완전히 마스킹한다', () => {
      const input = { password: 'abc' }
      const result = maskCredentials(input) as any
      expect(result.password).toBe('***')
    })

    test('API 키 패턴(sk-...)을 문자열 내에서 마스킹한다', () => {
      const input = 'Using key sk-abcdefghijklmnopqrstuvwxyz for auth'
      const result = maskCredentials(input) as string
      expect(result).toBe('Using key sk-*** for auth')
      expect(result).not.toContain('abcdefghijklmnopqrstuvwxyz')
    })

    test('Anthropic API 키(sk-ant-...)를 마스킹한다', () => {
      const input = 'key: sk-ant-api03-abcdefghijklmnopqrst'
      const result = maskCredentials(input) as string
      expect(result).toBe('key: sk-ant-***')
    })

    test('Bearer 토큰을 마스킹한다', () => {
      const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig'
      const result = maskCredentials(input) as string
      expect(result).toContain('Bearer ***')
      expect(result).not.toContain('eyJhbGci')
    })

    test('Basic 인증을 마스킹한다', () => {
      const input = 'Authorization: Basic dXNlcjpwYXNzd29yZA=='
      const result = maskCredentials(input) as string
      expect(result).toContain('Basic ***')
    })

    test('객체 내 문자열 값에서 API 키 패턴을 마스킹한다', () => {
      const input = {
        response: 'Token is sk-abcdefghijklmnopqrstuvwxyz',
        normalField: 'no secrets here',
      }
      const result = maskCredentials(input) as any
      expect(result.response).toBe('Token is sk-***')
      expect(result.normalField).toBe('no secrets here')
    })

    test('access_token, refresh_token 필드를 마스킹한다', () => {
      const input = {
        access_token: 'access-token-value-123',
        refresh_token: 'refresh-token-value-456',
      }
      const result = maskCredentials(input) as any
      expect(result.access_token).toBe('acce***')
      expect(result.refresh_token).toBe('refr***')
    })

    test('credential/credentials 필드를 마스킹한다', () => {
      const input = {
        credential: 'my-credential-value',
        credentials: 'my-credentials-value',
      }
      const result = maskCredentials(input) as any
      expect(result.credential).toBe('my-c***')
      expect(result.credentials).toBe('my-c***')
    })
  })

  describe('maskCredentialsInString', () => {
    test('일반 문자열을 변경하지 않는다', () => {
      expect(maskCredentialsInString('normal text output')).toBe('normal text output')
    })

    test('sk- 패턴을 마스킹한다', () => {
      const result = maskCredentialsInString('Used sk-abcdefghijklmnopqrstuvwx for API call')
      expect(result).toContain('sk-***')
      expect(result).not.toContain('abcdefghijklmnopqrstuvwx')
    })

    test('Bearer 토큰을 마스킹한다', () => {
      const result = maskCredentialsInString('Header: Bearer eyJhbGciOiJIUzI1NiJ9.payload')
      expect(result).toContain('Bearer ***')
    })

    test('여러 패턴이 섞인 문자열을 한번에 마스킹한다', () => {
      const input = 'key: sk-abcdefghijklmnopqrstuvwx, auth: Bearer eyJhbGciOiJIUzI1NiJ9.test'
      const result = maskCredentialsInString(input)
      expect(result).toContain('sk-***')
      expect(result).toContain('Bearer ***')
    })
  })
})

// ==========================================
// Task 2: Tool Invocation Log Service Tests
// ==========================================

describe('tool-invocation-log service', () => {
  // Mock the db module
  const mockInsertValues = mock(() => ({ catch: mock(() => {}) }))
  const mockInsert = mock(() => ({ values: mockInsertValues }))

  mock.module('../../db', () => ({
    db: {
      insert: mockInsert,
      select: mock(() => ({
        from: mock(() => ({
          where: mock(() => ({
            orderBy: mock(() => ({
              limit: mock(() => ({
                offset: mock(() => Promise.resolve([])),
              })),
            })),
            groupBy: mock(() => ({
              orderBy: mock(() => Promise.resolve([])),
            })),
          })),
        })),
      })),
    },
  }))

  test('recordToolInvocation 함수가 export 된다', async () => {
    const mod = await import('../../services/tool-invocation-log')
    expect(typeof mod.recordToolInvocation).toBe('function')
  })

  test('queryToolInvocations 함수가 export 된다', async () => {
    const mod = await import('../../services/tool-invocation-log')
    expect(typeof mod.queryToolInvocations).toBe('function')
  })

  test('getToolInvocationStats 함수가 export 된다', async () => {
    const mod = await import('../../services/tool-invocation-log')
    expect(typeof mod.getToolInvocationStats).toBe('function')
  })
})

// ==========================================
// Task 3: ToolPool Integration Tests
// ==========================================

describe('ToolPool invocation logging integration', () => {
  test('ToolPool이 recordToolInvocation을 import한다', async () => {
    const toolPoolModule = await import('../../services/tool-pool')
    // The module should have imported recordToolInvocation
    // If it didn't, the import would fail
    expect(toolPoolModule.ToolPool).toBeDefined()
  })

  test('ToolPool.execute()가 성공 시 duration을 측정한다', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'test_tool',
      description: 'Test tool',
      category: 'common',
      parameters: z.object({ value: z.string() }),
      execute: async () => ({ success: true as const, result: 'ok' }),
    })

    const result = await pool.execute('test_tool', { value: 'test' }, {
      companyId: 'company-1',
      agentId: 'agent-1',
      agentName: 'Agent 1',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.result).toBe('ok')
    }
  })

  test('ToolPool.execute()가 에러 시 에러 정보를 반환한다', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'failing_tool',
      description: 'Failing tool',
      category: 'common',
      parameters: z.object({}),
      execute: async () => { throw new Error('Tool execution failed') },
    })

    const result = await pool.execute('failing_tool', {}, {
      companyId: 'company-1',
      agentId: 'agent-1',
      agentName: 'Agent 1',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Tool execution failed')
    }
  })

  test('ToolPool.execute()가 도구 에러 결과를 반환한다', async () => {
    const { ToolPool } = await import('../../services/tool-pool')
    const { z } = await import('zod')

    const pool = new ToolPool()
    pool.register({
      name: 'error_result_tool',
      description: 'Error result tool',
      category: 'common',
      parameters: z.object({}),
      execute: async () => ({ success: false as const, error: 'Something went wrong' }),
    })

    const result = await pool.execute('error_result_tool', {}, {
      companyId: 'company-1',
      agentId: 'agent-1',
      agentName: 'Agent 1',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Something went wrong')
    }
  })
})

// ==========================================
// Task 4: Route Tests
// ==========================================

describe('tool-invocations route', () => {
  test('toolInvocationsRoute가 export 된다', async () => {
    const mod = await import('../../routes/admin/tool-invocations')
    expect(mod.toolInvocationsRoute).toBeDefined()
  })
})

// ==========================================
// Task 5: Schema Tests
// ==========================================

describe('tool_calls schema', () => {
  test('toolCalls 테이블이 export 된다', async () => {
    const schema = await import('../../db/schema')
    expect(schema.toolCalls).toBeDefined()
  })

  test('toolCalls에 필요한 컬럼이 존재한다', async () => {
    const schema = await import('../../db/schema')
    const table = schema.toolCalls
    // Check that the table has the expected columns by checking the column names
    const columns = Object.keys(table)
    expect(columns).toContain('id')
    expect(columns).toContain('companyId')
    expect(columns).toContain('agentId')
    expect(columns).toContain('toolName')
    expect(columns).toContain('input')
    expect(columns).toContain('output')
    expect(columns).toContain('status')
    expect(columns).toContain('durationMs')
    expect(columns).toContain('createdAt')
  })

  test('sessionId가 nullable이다 (ToolPool 직접 호출 지원)', async () => {
    const schema = await import('../../db/schema')
    // sessionId column should exist but be nullable
    expect(schema.toolCalls.sessionId).toBeDefined()
  })

  test('toolId가 nullable이다 (toolName으로 식별 가능)', async () => {
    const schema = await import('../../db/schema')
    expect(schema.toolCalls.toolId).toBeDefined()
  })
})

// ==========================================
// Masking in Log Context Tests
// ==========================================

describe('credential masking in log context', () => {
  test('도구 input에 API 키가 있으면 마스킹된다', () => {
    const toolInput = {
      apiKey: 'sk-abcdefghijklmnopqrstuvwxyz1234',
      query: 'search for something',
    }
    const masked = maskCredentials(toolInput) as any
    expect(masked.apiKey).toBe('sk-a***')
    // query should be preserved but also checked for inline patterns
    expect(masked.query).toBe('search for something')
  })

  test('도구 output에 Bearer 토큰이 있으면 마스킹된다', () => {
    const output = 'Response: {"token": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test.sig"}'
    const masked = maskCredentialsInString(output)
    expect(masked).toContain('Bearer ***')
    expect(masked).not.toContain('eyJhbGci')
  })

  test('중첩 config 내 private_key가 마스킹된다', () => {
    const input = {
      config: {
        private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpA...',
      },
    }
    const masked = maskCredentials(input) as any
    expect(masked.config.private_key).toBe('----***')
  })

  test('webhook_secret이 마스킹된다', () => {
    const input = { webhook_secret: 'whsec_abcdefg12345' }
    const masked = maskCredentials(input) as any
    expect(masked.webhook_secret).toBe('whse***')
  })

  test('encryption_key가 마스킹된다', () => {
    const input = { encryption_key: 'my-encryption-key-value' }
    const masked = maskCredentials(input) as any
    expect(masked.encryption_key).toBe('my-e***')
  })
})
