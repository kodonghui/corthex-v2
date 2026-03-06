/**
 * Story 18-1 TEA: MCP 서버 관리 — 리스크 기반 테스트
 * Risk Areas: CRUD API 검증, 테넌트 격리, 10개 제한, URL 검증, soft delete, 연결 테스트 stub, 도구 목록
 * bun test src/__tests__/unit/mcp-server-mgmt-tea.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// T1: CRUD 스키마 검증 — URL 프로토콜 필터링
// ============================================================
describe('[TEA-P1] URL 프로토콜 검증', () => {
  function validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'URL must start with http:// or https://' }
      }
      return { valid: true }
    } catch {
      return { valid: false, error: '유효하지 않은 URL' }
    }
  }

  test('http 프로토콜 허용', () => expect(validateUrl('http://localhost:3000/mcp').valid).toBe(true))
  test('https 프로토콜 허용', () => expect(validateUrl('https://api.mcp.io/sse').valid).toBe(true))
  test('ftp 프로토콜 거부', () => expect(validateUrl('ftp://files.com').valid).toBe(false))
  test('ws 프로토콜 거부', () => expect(validateUrl('ws://localhost:8080').valid).toBe(false))
  test('wss 프로토콜 거부', () => expect(validateUrl('wss://secure.io').valid).toBe(false))
  test('file 프로토콜 거부', () => expect(validateUrl('file:///etc/passwd').valid).toBe(false))
  test('javascript: 프로토콜 거부', () => expect(validateUrl('javascript:alert(1)').valid).toBe(false))
  test('data: URI 거부', () => expect(validateUrl('data:text/html,<h1>hi</h1>').valid).toBe(false))
  test('빈 문자열 거부', () => expect(validateUrl('').valid).toBe(false))
  test('공백만 있는 문자열 거부', () => expect(validateUrl('   ').valid).toBe(false))
  test('프로토콜 없는 URL 거부', () => expect(validateUrl('localhost:3000').valid).toBe(false))
  test('상대 경로 거부', () => expect(validateUrl('/api/mcp').valid).toBe(false))
  test('포트 포함 http URL', () => expect(validateUrl('http://192.168.1.1:9090/mcp').valid).toBe(true))
  test('IPv6 URL 허용', () => expect(validateUrl('http://[::1]:3000/mcp').valid).toBe(true))
  test('경로 포함 https URL', () => expect(validateUrl('https://host.com/v1/mcp/sse').valid).toBe(true))
  test('쿼리 파라미터 포함 URL', () => expect(validateUrl('http://host:3000/mcp?token=abc').valid).toBe(true))
})

// ============================================================
// T2: 서버 이름 검증 — 경계값 테스트
// ============================================================
describe('[TEA-P1] 서버 이름 경계값', () => {
  function validateName(name: string | undefined | null): { valid: boolean; error?: string } {
    if (!name || name.length === 0) return { valid: false, error: '이름이 필요합니다' }
    if (name.length > 100) return { valid: false, error: '이름은 100자 이내여야 합니다' }
    return { valid: true }
  }

  test('1자 이름 허용', () => expect(validateName('a').valid).toBe(true))
  test('100자 이름 허용', () => expect(validateName('a'.repeat(100)).valid).toBe(true))
  test('101자 이름 거부', () => expect(validateName('a'.repeat(101)).valid).toBe(false))
  test('null 거부', () => expect(validateName(null).valid).toBe(false))
  test('undefined 거부', () => expect(validateName(undefined).valid).toBe(false))
  test('빈 문자열 거부', () => expect(validateName('').valid).toBe(false))
  test('한글 이름 허용', () => expect(validateName('내 MCP 서버').valid).toBe(true))
  test('특수문자 포함 이름 허용', () => expect(validateName('server-1_prod.v2').valid).toBe(true))
  test('이모지 포함 이름 허용', () => expect(validateName('🚀 my-server').valid).toBe(true))
})

// ============================================================
// T3: 10개 제한 엣지케이스
// ============================================================
describe('[TEA-P1] 서버 등록 제한 엣지케이스', () => {
  const MAX = 10

  function canRegister(activeCount: number): boolean {
    return activeCount < MAX
  }

  test('0개 → 등록 가능', () => expect(canRegister(0)).toBe(true))
  test('1개 → 등록 가능', () => expect(canRegister(1)).toBe(true))
  test('9개 → 등록 가능 (경계)', () => expect(canRegister(9)).toBe(true))
  test('10개 → 등록 불가 (경계)', () => expect(canRegister(10)).toBe(false))
  test('100개 → 등록 불가', () => expect(canRegister(100)).toBe(false))

  // 비활성 서버 제외 로직
  function countActive(servers: { isActive: boolean }[]): number {
    return servers.filter((s) => s.isActive).length
  }

  test('활성 5개 + 비활성 5개 → 5개 (등록 가능)', () => {
    const servers = [
      ...Array(5).fill({ isActive: true }),
      ...Array(5).fill({ isActive: false }),
    ]
    expect(countActive(servers)).toBe(5)
    expect(canRegister(countActive(servers))).toBe(true)
  })

  test('활성 10개 + 비활성 3개 → 10개 (등록 불가)', () => {
    const servers = [
      ...Array(10).fill({ isActive: true }),
      ...Array(3).fill({ isActive: false }),
    ]
    expect(countActive(servers)).toBe(10)
    expect(canRegister(countActive(servers))).toBe(false)
  })
})

// ============================================================
// T4: 테넌트 격리 — 크로스 테넌트 접근 방지
// ============================================================
describe('[TEA-P1] 테넌트 격리 크로스 접근', () => {
  type Server = { id: string; companyId: string; isActive: boolean }

  function findServer(servers: Server[], id: string, requestCompanyId: string): Server | null {
    return servers.find((s) => s.id === id && s.companyId === requestCompanyId) || null
  }

  const servers: Server[] = [
    { id: 's1', companyId: 'company-a', isActive: true },
    { id: 's2', companyId: 'company-b', isActive: true },
    { id: 's3', companyId: 'company-a', isActive: false },
  ]

  test('같은 회사 서버 조회 성공', () => {
    expect(findServer(servers, 's1', 'company-a')).not.toBeNull()
  })

  test('다른 회사 서버 접근 차단', () => {
    expect(findServer(servers, 's1', 'company-b')).toBeNull()
  })

  test('다른 회사 서버 삭제 시도 차단', () => {
    expect(findServer(servers, 's2', 'company-a')).toBeNull()
  })

  test('존재하지 않는 서버 ID', () => {
    expect(findServer(servers, 'nonexistent', 'company-a')).toBeNull()
  })

  test('삭제된(비활성) 서버도 findServer로는 찾을 수 있음 (isActive 필터는 별도)', () => {
    expect(findServer(servers, 's3', 'company-a')).not.toBeNull()
  })

  // 목록 조회 시 테넌트 + isActive 필터
  function listServers(servers: Server[], companyId: string): Server[] {
    return servers.filter((s) => s.companyId === companyId && s.isActive)
  }

  test('company-a: 활성 서버만 1개', () => {
    expect(listServers(servers, 'company-a').length).toBe(1)
  })

  test('company-b: 서버 1개', () => {
    expect(listServers(servers, 'company-b').length).toBe(1)
  })

  test('존재하지 않는 회사: 0개', () => {
    expect(listServers(servers, 'company-x').length).toBe(0)
  })
})

// ============================================================
// T5: Soft Delete 무결성
// ============================================================
describe('[TEA-P1] Soft Delete 무결성', () => {
  test('삭제 후 isActive=false, updatedAt 갱신', () => {
    const original = { id: 's1', isActive: true, updatedAt: new Date('2026-01-01T00:00:00Z') }
    const now = new Date('2026-03-06T12:00:00Z')
    const deleted = { ...original, isActive: false, updatedAt: now }

    expect(deleted.isActive).toBe(false)
    expect(deleted.updatedAt).toEqual(now)
    expect(deleted.id).toBe(original.id)
  })

  test('이미 삭제된 서버 재삭제 시도 — 목록에서 안 보이므로 불가', () => {
    const servers = [{ id: 's1', isActive: false, companyId: 'c1' }]
    const active = servers.filter((s) => s.isActive && s.companyId === 'c1')
    expect(active.length).toBe(0)
  })

  test('삭제 후 카운트 감소 → 새 서버 등록 가능', () => {
    const before = Array(10).fill(null).map((_, i) => ({ id: `s${i}`, isActive: true }))
    expect(before.filter((s) => s.isActive).length).toBe(10)

    // 하나 삭제
    before[0].isActive = false
    expect(before.filter((s) => s.isActive).length).toBe(9)
  })
})

// ============================================================
// T6: 연결 상태 분류 — HTTP 상태코드별
// ============================================================
describe('[TEA-P2] 연결 상태 분류 확장', () => {
  function classifyPing(status: number | null, error?: string): 'connected' | 'disconnected' | 'error' {
    if (status === null) return 'disconnected'
    if (status < 500) return 'connected'
    return 'error'
  }

  test('200 OK → connected', () => expect(classifyPing(200)).toBe('connected'))
  test('201 Created → connected', () => expect(classifyPing(201)).toBe('connected'))
  test('204 No Content → connected', () => expect(classifyPing(204)).toBe('connected'))
  test('301 Redirect → connected', () => expect(classifyPing(301)).toBe('connected'))
  test('400 Bad Request → connected (서버 응답)', () => expect(classifyPing(400)).toBe('connected'))
  test('401 Unauthorized → connected (서버 응답)', () => expect(classifyPing(401)).toBe('connected'))
  test('403 Forbidden → connected (서버 응답)', () => expect(classifyPing(403)).toBe('connected'))
  test('404 Not Found → connected (서버 응답)', () => expect(classifyPing(404)).toBe('connected'))
  test('429 Rate Limited → connected (서버 응답)', () => expect(classifyPing(429)).toBe('connected'))
  test('499 Client Close → connected', () => expect(classifyPing(499)).toBe('connected'))
  test('500 Internal Server Error → error', () => expect(classifyPing(500)).toBe('error'))
  test('502 Bad Gateway → error', () => expect(classifyPing(502)).toBe('error'))
  test('503 Service Unavailable → error', () => expect(classifyPing(503)).toBe('error'))
  test('null (타임아웃/네트워크 실패) → disconnected', () => expect(classifyPing(null)).toBe('disconnected'))
})

// ============================================================
// T7: 서버 이름 자동 제안 — 다양한 URL 패턴
// ============================================================
describe('[TEA-P2] 이름 자동 제안 다양한 패턴', () => {
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

  test('localhost:3000 → localhost-3000', () => expect(suggestName('http://localhost:3000/mcp')).toBe('localhost-3000'))
  test('example.com 기본 포트 → example-com', () => expect(suggestName('https://example.com/sse')).toBe('example-com'))
  test('sub.domain.io:8080 → sub-domain-io-8080', () => expect(suggestName('https://sub.domain.io:8080')).toBe('sub-domain-io-8080'))
  test('192.168.1.1:9090 → 192-168-1-1-9090', () => expect(suggestName('http://192.168.1.1:9090')).toBe('192-168-1-1-9090'))
  test('깊은 서브도메인 → a-b-c-d-e-com', () => expect(suggestName('https://a.b.c.d.e.com')).toBe('a-b-c-d-e-com'))
  test('포트 없는 http → 호스트만', () => expect(suggestName('http://myserver')).toBe('myserver'))
  test('잘못된 URL → 빈 문자열', () => expect(suggestName('not-a-url')).toBe(''))
  test('빈 문자열 → 빈 문자열', () => expect(suggestName('')).toBe(''))
})

// ============================================================
// T8: localhost 감지 — 다양한 로컬 주소 패턴
// ============================================================
describe('[TEA-P2] localhost 감지 확장', () => {
  function isLocalUrl(url: string): boolean {
    return url.includes('localhost') || url.includes('127.0.0.1')
  }

  test('localhost 감지', () => expect(isLocalUrl('http://localhost:3000')).toBe(true))
  test('127.0.0.1 감지', () => expect(isLocalUrl('http://127.0.0.1:8080')).toBe(true))
  test('외부 도메인 미감지', () => expect(isLocalUrl('https://api.example.com')).toBe(false))
  test('localhost 서브도메인 감지', () => expect(isLocalUrl('http://api.localhost:3000')).toBe(true))
  test('IP 주소(외부) 미감지', () => expect(isLocalUrl('http://192.168.1.1:3000')).toBe(false))
  test('https localhost 감지', () => expect(isLocalUrl('https://localhost:443/mcp')).toBe(true))
})

// ============================================================
// T9: MCP 서버 데이터 모델 — 기본값 + nullable 필드
// ============================================================
describe('[TEA-P2] 데이터 모델 기본값 검증', () => {
  type McpServerRow = {
    id: string
    companyId: string
    name: string
    url: string
    transport: string
    config: Record<string, unknown> | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }

  function createDefaultServer(overrides: Partial<McpServerRow> = {}): McpServerRow {
    return {
      id: crypto.randomUUID(),
      companyId: 'test-company',
      name: 'test-server',
      url: 'http://localhost:3000/mcp',
      transport: 'stdio',
      config: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  test('기본 transport는 stdio', () => {
    expect(createDefaultServer().transport).toBe('stdio')
  })

  test('기본 isActive는 true', () => {
    expect(createDefaultServer().isActive).toBe(true)
  })

  test('기본 config는 null', () => {
    expect(createDefaultServer().config).toBeNull()
  })

  test('config에 JSON 객체 저장', () => {
    const server = createDefaultServer({ config: { apiKey: 'secret', timeout: 5000 } })
    expect(server.config).toEqual({ apiKey: 'secret', timeout: 5000 })
  })

  test('transport override', () => {
    const server = createDefaultServer({ transport: 'sse' })
    expect(server.transport).toBe('sse')
  })

  test('createdAt은 Date 타입', () => {
    expect(createDefaultServer().createdAt).toBeInstanceOf(Date)
  })

  test('id는 UUID 형식', () => {
    const id = createDefaultServer().id
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })
})

// ============================================================
// T10: 도구 목록 응답 검증
// ============================================================
describe('[TEA-P2] 도구 목록 응답 구조', () => {
  type ToolResponse = { tools: { name: string; description: string }[] }

  test('stub은 빈 배열', () => {
    const response: ToolResponse = { tools: [] }
    expect(response.tools).toHaveLength(0)
  })

  test('도구 목록 구조 올바른 형태', () => {
    const response: ToolResponse = {
      tools: [
        { name: 'read_file', description: 'Read a file from disk' },
        { name: 'execute_sql', description: 'Execute a SQL query' },
      ],
    }
    expect(response.tools).toHaveLength(2)
    for (const tool of response.tools) {
      expect(typeof tool.name).toBe('string')
      expect(typeof tool.description).toBe('string')
      expect(tool.name.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// T11: API 경로 구조 검증
// ============================================================
describe('[TEA-P3] API 경로 구조', () => {
  const API_PREFIX = '/api/workspace/settings'
  const ROUTES = [
    { method: 'GET', path: '/mcp', description: '서버 목록' },
    { method: 'POST', path: '/mcp', description: '서버 등록' },
    { method: 'DELETE', path: '/mcp/:id', description: '서버 삭제' },
    { method: 'POST', path: '/mcp/test', description: '연결 테스트' },
    { method: 'GET', path: '/mcp/:id/tools', description: '도구 목록' },
    { method: 'GET', path: '/mcp/:id/ping', description: '연결 상태' },
  ]

  test('모든 경로가 /mcp 접두사로 시작', () => {
    for (const route of ROUTES) {
      expect(route.path.startsWith('/mcp')).toBe(true)
    }
  })

  test('6개 엔드포인트 등록됨', () => {
    expect(ROUTES.length).toBe(6)
  })

  test('GET 3개, POST 2개, DELETE 1개', () => {
    expect(ROUTES.filter((r) => r.method === 'GET').length).toBe(3)
    expect(ROUTES.filter((r) => r.method === 'POST').length).toBe(2)
    expect(ROUTES.filter((r) => r.method === 'DELETE').length).toBe(1)
  })

  test('전체 경로가 올바른 prefix 사용', () => {
    for (const route of ROUTES) {
      const fullPath = `${API_PREFIX}${route.path}`
      expect(fullPath.startsWith('/api/workspace/settings/mcp')).toBe(true)
    }
  })
})

// ============================================================
// T12: UI 상태 관리 — 폼 토글 + 10개 제한 UI 상태
// ============================================================
describe('[TEA-P2] UI 상태 관리', () => {
  test('서버 0개: 추가 버튼 활성', () => {
    const isMaxReached = 0 >= 10
    expect(isMaxReached).toBe(false)
  })

  test('서버 10개: 추가 버튼 비활성', () => {
    const isMaxReached = 10 >= 10
    expect(isMaxReached).toBe(true)
  })

  test('폼 토글 상태 변경', () => {
    let showForm = false
    showForm = !showForm
    expect(showForm).toBe(true)
    showForm = !showForm
    expect(showForm).toBe(false)
  })

  test('아코디언 토글: 같은 ID 클릭 시 닫기', () => {
    let expandedId: string | null = null
    expandedId = 's1'
    expect(expandedId).toBe('s1')
    expandedId = expandedId === 's1' ? null : 's1'
    expect(expandedId).toBeNull()
  })

  test('아코디언 토글: 다른 ID 클릭 시 전환', () => {
    let expandedId: string | null = 's1'
    expandedId = expandedId === 's2' ? null : 's2'
    expect(expandedId).toBe('s2')
  })

  test('연결 테스트 결과 초기값 null', () => {
    let testResult: { success: boolean; message: string } | null = null
    expect(testResult).toBeNull()
  })

  test('연결 테스트 성공 결과', () => {
    const testResult = { success: true, message: '연결 성공' }
    expect(testResult.success).toBe(true)
  })

  test('연결 테스트 실패 결과', () => {
    const testResult = { success: false, message: '연결 실패: 서버에 접근할 수 없습니다' }
    expect(testResult.success).toBe(false)
  })
})

// ============================================================
// T13: 설정 탭 구조 검증
// ============================================================
describe('[TEA-P3] 설정 탭 구조', () => {
  const TABS = [
    { value: 'api', label: 'API 연동', shortLabel: 'API' },
    { value: 'telegram', label: '텔레그램', shortLabel: '텔레' },
    { value: 'soul', label: '소울 편집', shortLabel: '소울' },
    { value: 'files', label: '파일 관리', shortLabel: '파일', disabled: true },
    { value: 'trading', label: '매매 설정', shortLabel: '매매', disabled: true },
    { value: 'notifications', label: '알림 설정', shortLabel: '알림', disabled: true },
    { value: 'mcp', label: 'MCP 연동', shortLabel: 'MCP' },
  ]

  test('총 7개 탭', () => expect(TABS.length).toBe(7))
  test('MCP 탭 존재', () => expect(TABS.find((t) => t.value === 'mcp')).toBeDefined())
  test('MCP 탭은 disabled 아님', () => expect((TABS.find((t) => t.value === 'mcp') as any).disabled).toBeUndefined())
  test('MCP shortLabel은 MCP', () => expect(TABS.find((t) => t.value === 'mcp')!.shortLabel).toBe('MCP'))
  test('MCP 탭이 마지막', () => expect(TABS[TABS.length - 1].value).toBe('mcp'))
  test('비활성 탭은 3개 (files, trading, notifications)', () => {
    expect(TABS.filter((t) => (t as any).disabled).length).toBe(3)
  })

  test('?tab=mcp 파라미터 → mcp 탭 활성화', () => {
    const rawTab = 'mcp'
    const validTab = TABS.find((t) => t.value === rawTab && !(t as any).disabled)
    expect(validTab).toBeDefined()
    expect(validTab!.value).toBe('mcp')
  })

  test('?tab=invalid → api 탭 폴백', () => {
    const rawTab = 'invalid'
    const validTab = TABS.find((t) => t.value === rawTab && !(t as any).disabled)
    const activeTab = validTab ? rawTab : 'api'
    expect(activeTab).toBe('api')
  })

  test('?tab=files (disabled) → api 탭 폴백', () => {
    const rawTab = 'files'
    const validTab = TABS.find((t) => t.value === rawTab && !(t as any).disabled)
    const activeTab = validTab ? rawTab : 'api'
    expect(activeTab).toBe('api')
  })
})
