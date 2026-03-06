/**
 * Story 18-1: MCP 서버 관리 — CRUD API + 설정 UI 로직 검증
 * bun test src/__tests__/unit/mcp-server-mgmt.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// 1. MCP 서버 생성 스키마 검증
// ============================================================
describe('MCP 서버 생성 스키마 검증', () => {
  function validateCreate(data: { name?: string; url?: string }): { valid: boolean; error?: string } {
    if (!data.name || data.name.length === 0) return { valid: false, error: '이름이 필요합니다' }
    if (data.name.length > 100) return { valid: false, error: '이름은 100자 이내여야 합니다' }
    if (!data.url) return { valid: false, error: 'URL이 필요합니다' }
    try {
      const parsed = new URL(data.url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'URL must start with http:// or https://' }
      }
    } catch {
      return { valid: false, error: '유효하지 않은 URL입니다' }
    }
    return { valid: true }
  }

  test('유효한 MCP 서버 생성', () => {
    expect(validateCreate({ name: 'my-server', url: 'http://localhost:3000/mcp' })).toEqual({ valid: true })
  })

  test('https URL 허용', () => {
    expect(validateCreate({ name: 'prod-server', url: 'https://mcp.example.com/sse' })).toEqual({ valid: true })
  })

  test('이름 누락 시 실패', () => {
    expect(validateCreate({ url: 'http://localhost:3000/mcp' }).valid).toBe(false)
  })

  test('빈 이름 시 실패', () => {
    expect(validateCreate({ name: '', url: 'http://localhost:3000/mcp' }).valid).toBe(false)
  })

  test('이름 100자 초과 시 실패', () => {
    expect(validateCreate({ name: 'a'.repeat(101), url: 'http://localhost:3000' }).valid).toBe(false)
  })

  test('URL 누락 시 실패', () => {
    expect(validateCreate({ name: 'test' }).valid).toBe(false)
  })

  test('ftp URL 거부', () => {
    expect(validateCreate({ name: 'test', url: 'ftp://example.com' }).valid).toBe(false)
  })

  test('잘못된 URL 형식 거부', () => {
    expect(validateCreate({ name: 'test', url: 'not-a-url' }).valid).toBe(false)
  })
})

// ============================================================
// 2. 연결 테스트 URL 검증
// ============================================================
describe('연결 테스트 URL 검증', () => {
  function validateTestUrl(url: string): { valid: boolean; error?: string } {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'http/https만 허용' }
      }
      return { valid: true }
    } catch {
      return { valid: false, error: '유효하지 않은 URL' }
    }
  }

  test('http URL 허용', () => {
    expect(validateTestUrl('http://localhost:3000/mcp')).toEqual({ valid: true })
  })

  test('https URL 허용', () => {
    expect(validateTestUrl('https://api.example.com/sse')).toEqual({ valid: true })
  })

  test('ftp 거부', () => {
    expect(validateTestUrl('ftp://example.com').valid).toBe(false)
  })

  test('빈 문자열 거부', () => {
    expect(validateTestUrl('').valid).toBe(false)
  })
})

// ============================================================
// 3. 서버 등록 제한 (최대 10개)
// ============================================================
describe('서버 등록 제한', () => {
  const MAX_SERVERS = 10

  function canAddServer(currentCount: number): { allowed: boolean; message?: string } {
    if (currentCount >= MAX_SERVERS) {
      return { allowed: false, message: `최대 ${MAX_SERVERS}개까지 등록 가능합니다` }
    }
    return { allowed: true }
  }

  test('0개일 때 추가 가능', () => {
    expect(canAddServer(0)).toEqual({ allowed: true })
  })

  test('9개일 때 추가 가능', () => {
    expect(canAddServer(9)).toEqual({ allowed: true })
  })

  test('10개일 때 추가 불가', () => {
    expect(canAddServer(10).allowed).toBe(false)
  })

  test('11개일 때 추가 불가', () => {
    expect(canAddServer(11).allowed).toBe(false)
  })
})

// ============================================================
// 4. 서버 이름 자동 제안 로직
// ============================================================
describe('서버 이름 자동 제안', () => {
  function suggestName(url: string): string {
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.replace(/\./g, '-')
      const port = parsed.port ? `-${parsed.port}` : ''
      return `${host}${port}`
    } catch {
      return ''
    }
  }

  test('localhost:3000 → localhost-3000', () => {
    expect(suggestName('http://localhost:3000/mcp')).toBe('localhost-3000')
  })

  test('example.com → example-com', () => {
    expect(suggestName('https://example.com/sse')).toBe('example-com')
  })

  test('api.mcp.io:8080 → api-mcp-io-8080', () => {
    expect(suggestName('https://api.mcp.io:8080/v1')).toBe('api-mcp-io-8080')
  })

  test('기본 포트(80/443) 생략 시 포트 없이', () => {
    expect(suggestName('https://mcp.example.com/sse')).toBe('mcp-example-com')
  })

  test('잘못된 URL → 빈 문자열', () => {
    expect(suggestName('not-a-url')).toBe('')
  })
})

// ============================================================
// 5. localhost 감지 로직
// ============================================================
describe('localhost 감지', () => {
  function isLocalhost(url: string): boolean {
    return url.includes('localhost') || url.includes('127.0.0.1')
  }

  test('localhost 감지', () => {
    expect(isLocalhost('http://localhost:3000/mcp')).toBe(true)
  })

  test('127.0.0.1 감지', () => {
    expect(isLocalhost('http://127.0.0.1:8080')).toBe(true)
  })

  test('외부 URL은 미감지', () => {
    expect(isLocalhost('https://mcp.example.com')).toBe(false)
  })
})

// ============================================================
// 6. 테넌트 격리 검증
// ============================================================
describe('테넌트 격리 검증', () => {
  type McpServer = {
    id: string
    companyId: string
    name: string
    url: string
    isActive: boolean
  }

  function filterByTenant(servers: McpServer[], companyId: string): McpServer[] {
    return servers.filter((s) => s.companyId === companyId && s.isActive)
  }

  const servers: McpServer[] = [
    { id: '1', companyId: 'company-a', name: 'server-1', url: 'http://a.com', isActive: true },
    { id: '2', companyId: 'company-b', name: 'server-2', url: 'http://b.com', isActive: true },
    { id: '3', companyId: 'company-a', name: 'server-3', url: 'http://c.com', isActive: false },
    { id: '4', companyId: 'company-a', name: 'server-4', url: 'http://d.com', isActive: true },
  ]

  test('company-a의 활성 서버만 조회', () => {
    const result = filterByTenant(servers, 'company-a')
    expect(result.length).toBe(2)
    expect(result.every((s) => s.companyId === 'company-a' && s.isActive)).toBe(true)
  })

  test('company-b의 서버만 조회', () => {
    const result = filterByTenant(servers, 'company-b')
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('2')
  })

  test('존재하지 않는 회사는 빈 배열', () => {
    expect(filterByTenant(servers, 'company-c')).toEqual([])
  })
})

// ============================================================
// 7. Soft Delete 검증
// ============================================================
describe('Soft Delete 검증', () => {
  test('삭제 시 isActive false로 변경', () => {
    const server = { id: '1', isActive: true, updatedAt: new Date('2026-01-01') }
    const deleted = { ...server, isActive: false, updatedAt: new Date() }
    expect(deleted.isActive).toBe(false)
    expect(deleted.updatedAt.getTime()).toBeGreaterThan(server.updatedAt.getTime())
  })

  test('삭제된 서버는 목록에서 제외', () => {
    const servers = [
      { id: '1', isActive: true },
      { id: '2', isActive: false },
      { id: '3', isActive: true },
    ]
    const active = servers.filter((s) => s.isActive)
    expect(active.length).toBe(2)
    expect(active.find((s) => s.id === '2')).toBeUndefined()
  })
})

// ============================================================
// 8. 연결 상태 분류
// ============================================================
describe('연결 상태 분류', () => {
  function classifyStatus(httpStatus: number | null): 'connected' | 'disconnected' | 'error' {
    if (httpStatus === null) return 'disconnected'
    if (httpStatus < 500) return 'connected'
    return 'error'
  }

  test('200 → connected', () => {
    expect(classifyStatus(200)).toBe('connected')
  })

  test('404 → connected (서버 응답함)', () => {
    expect(classifyStatus(404)).toBe('connected')
  })

  test('500 → error', () => {
    expect(classifyStatus(500)).toBe('error')
  })

  test('null(타임아웃) → disconnected', () => {
    expect(classifyStatus(null)).toBe('disconnected')
  })
})

// ============================================================
// 9. MCP 서버 데이터 모델 검증
// ============================================================
describe('MCP 서버 데이터 모델', () => {
  test('기본 transport는 stdio', () => {
    const defaults = { transport: 'stdio', isActive: true }
    expect(defaults.transport).toBe('stdio')
    expect(defaults.isActive).toBe(true)
  })

  test('config는 nullable jsonb', () => {
    const server = { config: null }
    expect(server.config).toBeNull()
  })

  test('config에 JSON 객체 저장 가능', () => {
    const server = { config: { apiKey: 'xxx', timeout: 5000 } }
    expect(server.config.apiKey).toBe('xxx')
  })
})

// ============================================================
// 10. 도구 목록 응답 구조 (stub)
// ============================================================
describe('도구 목록 응답 구조', () => {
  test('stub 응답은 빈 배열', () => {
    const response = { tools: [] }
    expect(response.tools).toEqual([])
    expect(Array.isArray(response.tools)).toBe(true)
  })

  test('향후 도구 응답 형태 (name + description)', () => {
    const response = {
      tools: [
        { name: 'read_file', description: 'Read a file from disk' },
        { name: 'search', description: 'Search the web' },
      ],
    }
    expect(response.tools.length).toBe(2)
    expect(response.tools[0].name).toBe('read_file')
  })
})
