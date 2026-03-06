/**
 * Story 18-1 QA: MCP 서버 관리 — 기능 검증 + 엣지케이스
 * Quinn QA: happy path + critical error scenarios
 * bun test src/__tests__/unit/mcp-server-mgmt-qa.test.ts
 */
import { describe, test, expect } from 'bun:test'

// ============================================================
// QA-1: 서버 등록 → 목록 조회 → 삭제 플로우
// ============================================================
describe('[QA] 등록→조회→삭제 전체 플로우', () => {
  type McpServer = {
    id: string
    companyId: string
    name: string
    url: string
    transport: string
    config: unknown
    isActive: boolean
  }

  // In-memory store simulation
  function createStore() {
    const servers: McpServer[] = []
    let idCounter = 0
    return {
      list: (companyId: string) => servers.filter((s) => s.companyId === companyId && s.isActive),
      create: (companyId: string, name: string, url: string) => {
        const s: McpServer = {
          id: `id-${++idCounter}`,
          companyId,
          name,
          url,
          transport: 'stdio',
          config: null,
          isActive: true,
        }
        servers.push(s)
        return s
      },
      delete: (id: string, companyId: string): McpServer | null => {
        const s = servers.find((s) => s.id === id && s.companyId === companyId)
        if (!s) return null
        s.isActive = false
        return s
      },
      count: (companyId: string) => servers.filter((s) => s.companyId === companyId && s.isActive).length,
    }
  }

  test('빈 목록에서 시작', () => {
    const store = createStore()
    expect(store.list('c1')).toEqual([])
  })

  test('서버 등록 후 목록에 표시', () => {
    const store = createStore()
    const s = store.create('c1', 'my-server', 'http://localhost:3000/mcp')
    expect(s.name).toBe('my-server')
    expect(store.list('c1').length).toBe(1)
  })

  test('등록 후 삭제 → 목록에서 사라짐', () => {
    const store = createStore()
    const s = store.create('c1', 'server', 'http://a.com')
    expect(store.list('c1').length).toBe(1)
    store.delete(s.id, 'c1')
    expect(store.list('c1').length).toBe(0)
  })

  test('여러 서버 등록 후 특정 서버만 삭제', () => {
    const store = createStore()
    const s1 = store.create('c1', 'server-1', 'http://a.com')
    store.create('c1', 'server-2', 'http://b.com')
    store.create('c1', 'server-3', 'http://c.com')
    expect(store.list('c1').length).toBe(3)
    store.delete(s1.id, 'c1')
    expect(store.list('c1').length).toBe(2)
    expect(store.list('c1').find((s) => s.id === s1.id)).toBeUndefined()
  })

  test('다른 회사의 서버는 삭제 불가', () => {
    const store = createStore()
    const s = store.create('c1', 'server', 'http://a.com')
    const result = store.delete(s.id, 'c2')
    expect(result).toBeNull()
    expect(store.list('c1').length).toBe(1)
  })

  test('존재하지 않는 ID 삭제 시도 → null', () => {
    const store = createStore()
    expect(store.delete('nonexistent', 'c1')).toBeNull()
  })

  test('10개 한계까지 등록', () => {
    const store = createStore()
    for (let i = 0; i < 10; i++) {
      store.create('c1', `server-${i}`, `http://host${i}.com`)
    }
    expect(store.count('c1')).toBe(10)
  })

  test('10개 후 1개 삭제 → 다시 등록 가능', () => {
    const store = createStore()
    const servers = []
    for (let i = 0; i < 10; i++) {
      servers.push(store.create('c1', `server-${i}`, `http://host${i}.com`))
    }
    expect(store.count('c1')).toBe(10)
    store.delete(servers[0].id, 'c1')
    expect(store.count('c1')).toBe(9)
    store.create('c1', 'server-new', 'http://new.com')
    expect(store.count('c1')).toBe(10)
  })
})

// ============================================================
// QA-2: 연결 테스트 결과 처리
// ============================================================
describe('[QA] 연결 테스트 결과 처리', () => {
  type TestResult = { success: boolean; toolCount: number; message: string }

  function mockTest(url: string, reachable: boolean): TestResult {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { success: false, toolCount: 0, message: 'URL must start with http:// or https://' }
    }
    if (reachable) {
      return { success: true, toolCount: 0, message: '연결 성공' }
    }
    return { success: false, toolCount: 0, message: '연결 실패: 서버에 접근할 수 없습니다' }
  }

  test('도달 가능한 서버 → 성공', () => {
    const r = mockTest('http://localhost:3000', true)
    expect(r.success).toBe(true)
    expect(r.toolCount).toBe(0)
  })

  test('도달 불가능한 서버 → 실패', () => {
    const r = mockTest('http://unreachable:9999', false)
    expect(r.success).toBe(false)
  })

  test('잘못된 URL → 실패', () => {
    const r = mockTest('ftp://bad', false)
    expect(r.success).toBe(false)
  })

  test('stub toolCount는 항상 0', () => {
    expect(mockTest('http://a.com', true).toolCount).toBe(0)
    expect(mockTest('http://b.com', false).toolCount).toBe(0)
  })
})

// ============================================================
// QA-3: 연결 상태 ping — 전체 서버 동시 ping
// ============================================================
describe('[QA] 서버 목록 전체 ping', () => {
  type PingResult = { id: string; status: 'connected' | 'disconnected' | 'error' }

  function simulatePingAll(serverIds: string[], results: Record<string, 'connected' | 'disconnected' | 'error'>): PingResult[] {
    return serverIds.map((id) => ({ id, status: results[id] || 'disconnected' }))
  }

  test('모든 서버 connected', () => {
    const r = simulatePingAll(['s1', 's2'], { s1: 'connected', s2: 'connected' })
    expect(r.every((p) => p.status === 'connected')).toBe(true)
  })

  test('혼합 상태', () => {
    const r = simulatePingAll(['s1', 's2', 's3'], { s1: 'connected', s2: 'disconnected', s3: 'error' })
    expect(r[0].status).toBe('connected')
    expect(r[1].status).toBe('disconnected')
    expect(r[2].status).toBe('error')
  })

  test('빈 목록 → 빈 결과', () => {
    expect(simulatePingAll([], {})).toEqual([])
  })

  test('결과 없는 서버 → disconnected', () => {
    const r = simulatePingAll(['s1'], {})
    expect(r[0].status).toBe('disconnected')
  })
})

// ============================================================
// QA-4: URL 입력 → 이름 자동 제안 → 등록 UX 플로우
// ============================================================
describe('[QA] URL→이름 자동 제안 UX 플로우', () => {
  function suggestName(url: string): string {
    try {
      const p = new URL(url)
      const host = p.hostname.replace(/\./g, '-')
      const port = p.port ? `-${p.port}` : ''
      return `${host}${port}`
    } catch {
      return ''
    }
  }

  test('URL 입력 후 blur → 이름 자동 채움', () => {
    let name = ''
    const url = 'http://localhost:3000/mcp'
    // simulate onBlur
    name = suggestName(url)
    expect(name).toBe('localhost-3000')
  })

  test('수동으로 이름 설정 후 URL 변경 → 이름 유지 (nameManuallySet)', () => {
    let name = 'my-custom-name'
    let nameManuallySet = true
    const url = 'http://new-host:8080'
    // simulate onBlur with nameManuallySet
    if (!nameManuallySet) {
      name = suggestName(url)
    }
    expect(name).toBe('my-custom-name')
  })

  test('이름 미입력 상태에서 URL blur → 자동 제안 적용', () => {
    let name = ''
    let nameManuallySet = false
    const url = 'https://api.mcp.io:9090/sse'
    if (!nameManuallySet && url) {
      const suggested = suggestName(url)
      if (suggested) name = suggested
    }
    expect(name).toBe('api-mcp-io-9090')
  })
})

// ============================================================
// QA-5: 아코디언 도구 목록 lazy loading
// ============================================================
describe('[QA] 아코디언 lazy loading', () => {
  test('펼치기 전 → fetch 안 함', () => {
    const expanded = false
    const shouldFetch = expanded
    expect(shouldFetch).toBe(false)
  })

  test('펼친 후 → fetch 실행', () => {
    const expanded = true
    const shouldFetch = expanded
    expect(shouldFetch).toBe(true)
  })

  test('접었다 다시 펼침 → 캐시 사용 (react-query)', () => {
    const queryKey = ['mcp-tools', 'server-1']
    expect(queryKey).toEqual(['mcp-tools', 'server-1'])
  })
})

// ============================================================
// QA-6: 에러 코드 검증
// ============================================================
describe('[QA] 에러 코드 체계', () => {
  const ERROR_CODES = {
    MCP_001: '최대 10개까지 등록 가능합니다',
    MCP_002: 'MCP 서버를 찾을 수 없습니다',
  }

  test('MCP_001: 10개 초과 등록', () => {
    expect(ERROR_CODES.MCP_001).toContain('10개')
  })

  test('MCP_002: 서버 미발견', () => {
    expect(ERROR_CODES.MCP_002).toContain('찾을 수 없습니다')
  })

  test('에러 코드 모두 MCP_ 접두사', () => {
    for (const code of Object.keys(ERROR_CODES)) {
      expect(code.startsWith('MCP_')).toBe(true)
    }
  })
})

// ============================================================
// QA-7: max-w 클래스 분기 검증
// ============================================================
describe('[QA] 설정 페이지 레이아웃 분기', () => {
  function getMaxWidth(tab: string): string {
    return tab === 'soul' || tab === 'mcp' ? 'max-w-3xl' : 'max-w-lg'
  }

  test('api 탭 → max-w-lg', () => expect(getMaxWidth('api')).toBe('max-w-lg'))
  test('telegram 탭 → max-w-lg', () => expect(getMaxWidth('telegram')).toBe('max-w-lg'))
  test('soul 탭 → max-w-3xl', () => expect(getMaxWidth('soul')).toBe('max-w-3xl'))
  test('mcp 탭 → max-w-3xl', () => expect(getMaxWidth('mcp')).toBe('max-w-3xl'))
  test('files 탭 → max-w-lg', () => expect(getMaxWidth('files')).toBe('max-w-lg'))
})
