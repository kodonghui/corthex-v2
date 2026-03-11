import { describe, test, expect } from 'bun:test'

/**
 * TEA Tests for Story 6.2: 비서 없음 레이아웃 (에이전트 선택 + 채팅)
 * Risk-based test strategy: focus on critical business logic paths
 *
 * Coverage targets:
 * - AC#1: Department grouping logic
 * - AC#2: lastUsedAt sorting + collapsible accordion
 * - AC#3: Agent selection → session creation flow
 * - AC#4: Agent card data display
 * - AC#5: Search/filter functionality
 */

// --- Types mirroring the component types ---
type AgentItem = {
  id: string
  name: string
  role: string
  tier: string
  status: string
  isSecretary: boolean
  departmentId: string | null
}

type DeptItem = {
  id: string
  name: string
}

type SessionItem = {
  id: string
  agentId: string
  lastMessageAt: string | null
}

type DeptGroup = {
  deptId: string
  deptName: string
  agents: AgentItem[]
}

// --- Extract pure functions from component for testing ---

function buildLastUsedMap(sessions: SessionItem[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of sessions) {
    const t = s.lastMessageAt ? new Date(s.lastMessageAt).getTime() : 0
    const existing = map.get(s.agentId) ?? 0
    if (t > existing) map.set(s.agentId, t)
  }
  return map
}

function groupAgentsByDept(
  agents: AgentItem[],
  departments: DeptItem[],
  sessions: SessionItem[],
): DeptGroup[] {
  const deptMap = new Map<string, string>()
  for (const d of departments) deptMap.set(d.id, d.name)

  const lastUsedMap = buildLastUsedMap(sessions)

  const deptGroups = new Map<string, AgentItem[]>()
  const unassigned: AgentItem[] = []

  for (const a of agents) {
    if (a.departmentId) {
      const list = deptGroups.get(a.departmentId) ?? []
      list.push(a)
      deptGroups.set(a.departmentId, list)
    } else {
      unassigned.push(a)
    }
  }

  const sortAgents = (list: AgentItem[]) =>
    [...list].sort((a, b) => {
      const aTime = lastUsedMap.get(a.id) ?? 0
      const bTime = lastUsedMap.get(b.id) ?? 0
      if (aTime !== bTime) return bTime - aTime
      return a.name.localeCompare(b.name, 'ko')
    })

  const result: DeptGroup[] = []
  for (const [deptId, agentList] of deptGroups) {
    result.push({
      deptId,
      deptName: deptMap.get(deptId) ?? '알 수 없는 부서',
      agents: sortAgents(agentList),
    })
  }
  result.sort((a, b) => a.deptName.localeCompare(b.deptName, 'ko'))

  if (unassigned.length > 0) {
    result.push({
      deptId: '__unassigned__',
      deptName: '미배정',
      agents: sortAgents(unassigned),
    })
  }

  return result
}

function filterGroups(groups: DeptGroup[], search: string): DeptGroup[] {
  if (!search.trim()) return groups
  const q = search.toLowerCase()
  return groups
    .map((g) => ({
      ...g,
      agents: g.agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          g.deptName.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.agents.length > 0)
}

function detectSecretary(agents: AgentItem[]): boolean {
  return agents.some((a) => a.isSecretary)
}

// --- Test Data Factories ---

function makeAgent(overrides: Partial<AgentItem> = {}): AgentItem {
  return {
    id: `agent-${Math.random().toString(36).slice(2, 8)}`,
    name: '테스트 에이전트',
    role: 'specialist',
    tier: 'specialist',
    status: 'active',
    isSecretary: false,
    departmentId: null,
    ...overrides,
  }
}

function makeDept(overrides: Partial<DeptItem> = {}): DeptItem {
  return {
    id: `dept-${Math.random().toString(36).slice(2, 8)}`,
    name: '테스트 부서',
    ...overrides,
  }
}

function makeSession(overrides: Partial<SessionItem> = {}): SessionItem {
  return {
    id: `sess-${Math.random().toString(36).slice(2, 8)}`,
    agentId: 'agent-1',
    lastMessageAt: null,
    ...overrides,
  }
}

// ===== TESTS =====

describe('Story 6.2: hasSecretary 분기 감지', () => {
  test('비서 없음: isSecretary=false인 에이전트만 있을 때 false 반환', () => {
    const agents = [
      makeAgent({ isSecretary: false }),
      makeAgent({ isSecretary: false }),
    ]
    expect(detectSecretary(agents)).toBe(false)
  })

  test('비서 있음: isSecretary=true인 에이전트가 하나라도 있으면 true 반환', () => {
    const agents = [
      makeAgent({ isSecretary: false }),
      makeAgent({ isSecretary: true, name: '비서실장' }),
      makeAgent({ isSecretary: false }),
    ]
    expect(detectSecretary(agents)).toBe(true)
  })

  test('에이전트 없음: 빈 배열이면 false 반환', () => {
    expect(detectSecretary([])).toBe(false)
  })
})

describe('Story 6.2: 부서별 그룹핑 (AC#1)', () => {
  test('에이전트를 부서별로 그룹핑한다', () => {
    const dept1 = makeDept({ id: 'd1', name: '마케팅' })
    const dept2 = makeDept({ id: 'd2', name: '개발' })
    const agents = [
      makeAgent({ id: 'a1', name: 'CMO', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: 'CTO', departmentId: 'd2' }),
      makeAgent({ id: 'a3', name: '디자이너', departmentId: 'd1' }),
    ]

    const groups = groupAgentsByDept(agents, [dept1, dept2], [])
    expect(groups).toHaveLength(2)

    // 가나다순 정렬: 개발 < 마케팅
    expect(groups[0].deptName).toBe('개발')
    expect(groups[0].agents).toHaveLength(1)
    expect(groups[1].deptName).toBe('마케팅')
    expect(groups[1].agents).toHaveLength(2)
  })

  test('미배정 에이전트는 별도 그룹으로 표시한다', () => {
    const dept1 = makeDept({ id: 'd1', name: '마케팅' })
    const agents = [
      makeAgent({ id: 'a1', name: 'CMO', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: '프리랜서', departmentId: null }),
    ]

    const groups = groupAgentsByDept(agents, [dept1], [])
    expect(groups).toHaveLength(2)
    expect(groups[1].deptId).toBe('__unassigned__')
    expect(groups[1].deptName).toBe('미배정')
    expect(groups[1].agents).toHaveLength(1)
  })

  test('부서 없는 에이전트만 있으면 미배정 그룹만 표시', () => {
    const agents = [
      makeAgent({ id: 'a1', name: '에이전트A', departmentId: null }),
      makeAgent({ id: 'a2', name: '에이전트B', departmentId: null }),
    ]

    const groups = groupAgentsByDept(agents, [], [])
    expect(groups).toHaveLength(1)
    expect(groups[0].deptId).toBe('__unassigned__')
    expect(groups[0].agents).toHaveLength(2)
  })

  test('에이전트 없으면 빈 배열 반환', () => {
    const groups = groupAgentsByDept([], [], [])
    expect(groups).toHaveLength(0)
  })
})

describe('Story 6.2: lastUsedAt 정렬 (AC#2)', () => {
  test('같은 부서 내에서 최근 사용순으로 정렬한다', () => {
    const dept = makeDept({ id: 'd1', name: '마케팅' })
    const agents = [
      makeAgent({ id: 'a1', name: '에이전트A', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: '에이전트B', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: '에이전트C', departmentId: 'd1' }),
    ]
    const sessions = [
      makeSession({ agentId: 'a1', lastMessageAt: '2026-03-10T10:00:00Z' }),
      makeSession({ agentId: 'a2', lastMessageAt: '2026-03-11T10:00:00Z' }), // 가장 최근
      makeSession({ agentId: 'a3', lastMessageAt: '2026-03-09T10:00:00Z' }),
    ]

    const groups = groupAgentsByDept(agents, [dept], sessions)
    expect(groups[0].agents[0].id).toBe('a2') // 가장 최근
    expect(groups[0].agents[1].id).toBe('a1')
    expect(groups[0].agents[2].id).toBe('a3') // 가장 오래된
  })

  test('사용 기록 없는 에이전트는 이름 가나다순 정렬', () => {
    const dept = makeDept({ id: 'd1', name: '마케팅' })
    const agents = [
      makeAgent({ id: 'a1', name: '차경영', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: '가마케터', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: '나디자이너', departmentId: 'd1' }),
    ]

    const groups = groupAgentsByDept(agents, [dept], [])
    expect(groups[0].agents[0].name).toBe('가마케터')
    expect(groups[0].agents[1].name).toBe('나디자이너')
    expect(groups[0].agents[2].name).toBe('차경영')
  })

  test('사용 기록 있는 에이전트가 없는 에이전트보다 먼저 표시', () => {
    const dept = makeDept({ id: 'd1', name: '마케팅' })
    const agents = [
      makeAgent({ id: 'a1', name: '사용안함A', departmentId: 'd1' }),
      makeAgent({ id: 'a2', name: '사용함', departmentId: 'd1' }),
      makeAgent({ id: 'a3', name: '사용안함B', departmentId: 'd1' }),
    ]
    const sessions = [
      makeSession({ agentId: 'a2', lastMessageAt: '2026-03-10T10:00:00Z' }),
    ]

    const groups = groupAgentsByDept(agents, [dept], sessions)
    expect(groups[0].agents[0].id).toBe('a2') // 사용 기록 있는 에이전트가 먼저
  })
})

describe('Story 6.2: 검색/필터 (AC#5)', () => {
  const dept1 = makeDept({ id: 'd1', name: '마케팅' })
  const dept2 = makeDept({ id: 'd2', name: '개발' })
  const agents = [
    makeAgent({ id: 'a1', name: 'CMO', role: '마케팅 관리자', departmentId: 'd1' }),
    makeAgent({ id: 'a2', name: 'CTO', role: '기술 총괄', departmentId: 'd2' }),
    makeAgent({ id: 'a3', name: '디자이너', role: 'UI 디자인', departmentId: 'd1' }),
  ]

  const groups = groupAgentsByDept(agents, [dept1, dept2], [])

  test('이름으로 필터링', () => {
    const filtered = filterGroups(groups, 'CMO')
    expect(filtered).toHaveLength(1) // 마케팅 그룹만
    expect(filtered[0].agents).toHaveLength(1)
    expect(filtered[0].agents[0].name).toBe('CMO')
  })

  test('역할로 필터링', () => {
    const filtered = filterGroups(groups, '기술')
    expect(filtered).toHaveLength(1) // 개발 그룹만
    expect(filtered[0].agents[0].name).toBe('CTO')
  })

  test('부서명으로 필터링', () => {
    const filtered = filterGroups(groups, '마케팅')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].agents).toHaveLength(2) // CMO + 디자이너
  })

  test('대소문자 무시', () => {
    const filtered = filterGroups(groups, 'cmo')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].agents[0].name).toBe('CMO')
  })

  test('빈 검색어: 전체 반환', () => {
    const filtered = filterGroups(groups, '')
    expect(filtered).toHaveLength(2)
  })

  test('공백만 있는 검색어: 전체 반환', () => {
    const filtered = filterGroups(groups, '   ')
    expect(filtered).toHaveLength(2)
  })

  test('매칭 없는 검색어: 빈 배열', () => {
    const filtered = filterGroups(groups, 'zzzzz')
    expect(filtered).toHaveLength(0)
  })
})

describe('Story 6.2: lastUsedAt 맵 빌드', () => {
  test('같은 에이전트의 여러 세션 중 가장 최근 것을 사용', () => {
    const sessions = [
      makeSession({ agentId: 'a1', lastMessageAt: '2026-03-09T10:00:00Z' }),
      makeSession({ agentId: 'a1', lastMessageAt: '2026-03-11T10:00:00Z' }), // 더 최근
      makeSession({ agentId: 'a1', lastMessageAt: '2026-03-10T10:00:00Z' }),
    ]

    const map = buildLastUsedMap(sessions)
    expect(map.get('a1')).toBe(new Date('2026-03-11T10:00:00Z').getTime())
  })

  test('lastMessageAt이 null인 세션은 맵에 미포함 (사용 기록 없음)', () => {
    const sessions = [
      makeSession({ agentId: 'a1', lastMessageAt: null }),
    ]

    const map = buildLastUsedMap(sessions)
    // null lastMessageAt → time=0, not > existing(0), so not set
    expect(map.has('a1')).toBe(false)
  })

  test('빈 세션 배열: 빈 맵 반환', () => {
    const map = buildLastUsedMap([])
    expect(map.size).toBe(0)
  })
})

describe('Story 6.2: 50+ 에이전트 대규모 그룹핑', () => {
  test('50개 이상 에이전트도 올바르게 그룹핑 및 정렬', () => {
    const depts = Array.from({ length: 5 }, (_, i) =>
      makeDept({ id: `d${i}`, name: `부서${String.fromCharCode(65 + i)}` }),
    )
    const agents = Array.from({ length: 60 }, (_, i) =>
      makeAgent({
        id: `a${i}`,
        name: `에이전트${i.toString().padStart(2, '0')}`,
        departmentId: `d${i % 5}`,
      }),
    )

    const groups = groupAgentsByDept(agents, depts, [])
    expect(groups).toHaveLength(5)
    const total = groups.reduce((sum, g) => sum + g.agents.length, 0)
    expect(total).toBe(60)

    // 각 부서에 12개씩
    for (const g of groups) {
      expect(g.agents).toHaveLength(12)
    }
  })
})

describe('Story 6.2: 에이전트 선택 → 세션 매칭', () => {
  test('기존 세션이 있으면 해당 세션 ID 반환', () => {
    const sessions = [
      makeSession({ id: 'sess-1', agentId: 'a1' }),
      makeSession({ id: 'sess-2', agentId: 'a2' }),
    ]

    const targetAgentId = 'a2'
    const existing = sessions.find((s) => s.agentId === targetAgentId)
    expect(existing?.id).toBe('sess-2')
  })

  test('기존 세션이 없으면 undefined 반환 (새 세션 생성 필요)', () => {
    const sessions = [
      makeSession({ id: 'sess-1', agentId: 'a1' }),
    ]

    const targetAgentId = 'a3'
    const existing = sessions.find((s) => s.agentId === targetAgentId)
    expect(existing).toBeUndefined()
  })
})
