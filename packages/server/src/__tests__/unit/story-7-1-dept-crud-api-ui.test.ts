import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

// __tests__/unit/ -> src/ -> server/ -> packages/ -> repo root
const REPO_ROOT = join(import.meta.dir, '../../../../..')

const ROUTE_PATH = join(REPO_ROOT, 'packages/server/src/routes/admin/departments.ts')
const routeSource = readFileSync(ROUTE_PATH, 'utf8')

const SERVICE_PATH = join(REPO_ROOT, 'packages/server/src/services/organization.ts')
const serviceSource = readFileSync(SERVICE_PATH, 'utf8')

describe('Story 7.1: 부서 CRUD API — 응답 형식 통일 (CLAUDE.md)', () => {
  test('GET /departments — { success: true, data }', () => {
    expect(routeSource).toContain('c.json({ success: true, data: result })')
  })

  test('GET /departments/tree — { success: true, data }', () => {
    expect(routeSource).toContain('c.json({ success: true, data: tree })')
  })

  test('GET /departments/:id — { success: true, data }', () => {
    expect(routeSource).toContain('c.json({ success: true, data: dept })')
  })

  test('POST /departments — { success: true, data } + 201', () => {
    expect(routeSource).toContain('c.json({ success: true, data: result.data }, 201)')
  })

  test('PATCH /departments/:id — { success: true, data }', () => {
    expect(routeSource).toContain('c.json({ success: true, data: result.data })')
  })

  test('DELETE 핸들러 응답에 success: true 포함', () => {
    // Find the delete handler section
    const deleteSection = routeSource.split("departmentsRoute.delete('/departments/:id'")[1]
    expect(deleteSection).toBeDefined()
    expect(deleteSection).toContain('success: true')
  })

  test('{ data: ... } (success 없는) 응답이 없어야 함', () => {
    // All c.json calls should include 'success: true'
    const jsonCalls = routeSource.match(/c\.json\(\{[^}]+\}/g) || []
    for (const call of jsonCalls) {
      if (call.includes('data:')) {
        expect(call).toContain('success: true')
      }
    }
  })
})

describe('Story 7.1: 부서 서비스 — 비즈니스 규칙', () => {
  test('이름 유니크 검증 (DEPT_002)', () => {
    expect(serviceSource).toContain("code: 'DEPT_002'")
  })

  test('삭제 시 소속 에이전트 확인 (DEPT_003)', () => {
    expect(serviceSource).toContain("code: 'DEPT_003'")
  })

  test('cascade 분석 존재', () => {
    expect(serviceSource).toContain('export async function analyzeCascade(')
  })

  test('cascade 실행 — 에이전트 미할당 처리 (departmentId: null)', () => {
    expect(serviceSource).toContain('departmentId: null')
  })

  test('soft delete (isActive: false)', () => {
    expect(serviceSource).toContain('isActive: false')
  })

  test('tenant 격리 적용', () => {
    expect(serviceSource).toContain('withTenant(departments.companyId,')
  })
})

describe('Story 7.1: Admin UI 페이지', () => {
  const uiPath = join(REPO_ROOT, 'packages/app/src/pages/departments.tsx')
  let uiSource: string

  try {
    uiSource = readFileSync(uiPath, 'utf8')
  } catch {
    uiSource = ''
  }

  test('departments.tsx 파일 존재', () => {
    expect(uiSource.length).toBeGreaterThan(0)
  })

  test('DepartmentsPage export', () => {
    expect(uiSource).toContain('export function DepartmentsPage()')
  })

  test('TanStack Query — admin-departments queryKey', () => {
    expect(uiSource).toContain("queryKey: ['admin-departments']")
  })

  test('CRUD 뮤테이션 — create, update, delete', () => {
    expect(uiSource).toContain("api.post('/admin/departments'")
    expect(uiSource).toContain("api.patch(`/admin/departments/")
    expect(uiSource).toContain("api.delete(`/admin/departments/")
  })

  test('cascade-analysis API 호출', () => {
    expect(uiSource).toContain('cascade-analysis')
  })

  test('Modal 사용 — 생성, 편집', () => {
    expect(uiSource).toContain('title="부서 생성"')
    expect(uiSource).toContain('title="부서 편집"')
  })

  test('toast 피드백', () => {
    expect(uiSource).toContain('toast.success')
    expect(uiSource).toContain('toast.error')
  })

  test('쿼리 무효화로 목록 갱신', () => {
    expect(uiSource).toContain("invalidateQueries({ queryKey: ['admin-departments'] })")
  })
})

describe('Story 7.1: 라우트 & 네비게이션 등록', () => {
  test('App.tsx에 /departments 라우트', () => {
    const appPath = join(REPO_ROOT, 'packages/app/src/App.tsx')
    const appSource = readFileSync(appPath, 'utf8')
    expect(appSource).toContain('path="departments"')
    expect(appSource).toContain("import('./pages/departments')")
  })

  test('사이드바에 부서 관리 메뉴', () => {
    const sidebarPath = join(REPO_ROOT, 'packages/app/src/components/sidebar.tsx')
    const sidebarSource = readFileSync(sidebarPath, 'utf8')
    expect(sidebarSource).toContain("to: '/departments'")
    expect(sidebarSource).toContain("label: '부서 관리'")
  })
})

// ============================================================
// TEA: Risk-Based Expanded Coverage (Stage 3)
// ============================================================

describe('Story 7.1 TEA: 라우트 — 미들웨어 & 밸리데이션', () => {
  test('authMiddleware + adminOnly + tenantMiddleware 체인 적용', () => {
    expect(routeSource).toContain("departmentsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)")
  })

  test('POST 엔드포인트에 Zod createDepartmentSchema 밸리데이션', () => {
    expect(routeSource).toContain("zValidator('json', createDepartmentSchema)")
    // Verify it's on the POST route
    const postLine = routeSource.split('\n').find(l => l.includes("departmentsRoute.post(") && l.includes('createDepartmentSchema'))
    expect(postLine).toBeDefined()
  })

  test('PATCH 엔드포인트에 Zod updateDepartmentSchema 밸리데이션', () => {
    expect(routeSource).toContain("zValidator('json', updateDepartmentSchema)")
    const patchLine = routeSource.split('\n').find(l => l.includes("departmentsRoute.patch(") && l.includes('updateDepartmentSchema'))
    expect(patchLine).toBeDefined()
  })

  test('createDepartmentSchema — name 필수 1~100자', () => {
    expect(routeSource).toContain("name: z.string().min(1).max(100)")
  })

  test('updateDepartmentSchema — name 선택, description nullable', () => {
    expect(routeSource).toContain("name: z.string().min(1).max(100).optional()")
    expect(routeSource).toContain("description: z.string().nullable().optional()")
  })

  test('DELETE mode 밸리데이션 — force/wait_completion만 허용 (CASCADE_003)', () => {
    expect(routeSource).toContain("'force', 'wait_completion'")
    expect(routeSource).toContain("CASCADE_003")
  })

  test('GET /departments/:id — 404 에러 처리 (DEPT_001)', () => {
    expect(routeSource).toContain("DEPT_001")
  })

  test('cascade-analysis 라우트가 :id 라우트보다 먼저 정의 (라우트 순서)', () => {
    const cascadeIdx = routeSource.indexOf("'/departments/:id/cascade-analysis'")
    const idIdx = routeSource.indexOf("departmentsRoute.get('/departments/:id',")
    // The generic :id route (without cascade-analysis) should be after cascade-analysis
    // Find the standalone :id GET route
    const idGetIdx = routeSource.indexOf("departmentsRoute.get('/departments/:id'", cascadeIdx + 1)
    expect(cascadeIdx).toBeGreaterThan(-1)
    expect(idGetIdx).toBeGreaterThan(cascadeIdx)
  })
})

describe('Story 7.1 TEA: 서비스 — Cascade 로직 상세', () => {
  test('executeCascade — mode 미지정 시 활성 작업 있으면 409 (CASCADE_001)', () => {
    expect(serviceSource).toContain("code: 'CASCADE_001'")
  })

  test('executeCascade — wait_completion 모드에서 pending 반환', () => {
    expect(serviceSource).toContain("status: 'pending'")
    expect(serviceSource).toContain("mode === 'wait_completion'")
  })

  test('executeCascade — force 모드에서 작업 강제 중단 (failed 상태 전환)', () => {
    expect(serviceSource).toContain("status: 'failed'")
    expect(serviceSource).toContain("reason: 'cascade_force_stop'")
  })

  test('analyzeCascade — 비활성 부서 분석 시 CASCADE_002 에러', () => {
    expect(serviceSource).toContain("code: 'CASCADE_002'")
    expect(serviceSource).toContain('이미 비활성화된 부서입니다')
  })

  test('executeCascade — 에이전트 status offline 전환', () => {
    // Within executeCascade, agents should be set to offline
    const cascadeSection = serviceSource.split('export async function executeCascade')[1]
    expect(cascadeSection).toContain("status: 'offline'")
  })

  test('updateDepartment — 이름 중복 검사 시 자기 자신 제외 (ne)', () => {
    expect(serviceSource).toContain('ne(departments.id, departmentId)')
  })

  test('updateDepartment — 부서 미존재 시 DEPT_001', () => {
    const updateSection = serviceSource.split('export async function updateDepartment')[1]?.split('export async function')[0]
    expect(updateSection).toContain("code: 'DEPT_001'")
  })

  test('deleteDepartment — 소속 에이전트 수 count 쿼리', () => {
    const deleteSection = serviceSource.split('export async function deleteDepartment')[1]?.split('export async function')[0]
    expect(deleteSection).toContain('agentCount: count()')
  })

  test('감사 로그 — CRUD + cascade 모두 audit log 기록', () => {
    expect(serviceSource).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_CREATE')
    expect(serviceSource).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_UPDATE')
    expect(serviceSource).toContain('AUDIT_ACTIONS.ORG_DEPARTMENT_DELETE')
    expect(serviceSource).toContain('AUDIT_ACTIONS.ORG_CASCADE_EXECUTE')
  })
})

describe('Story 7.1 TEA: UI — 에러 처리 & UX 패턴', () => {
  const uiPath = join(REPO_ROOT, 'packages/app/src/pages/departments.tsx')
  const uiSource = readFileSync(uiPath, 'utf8')

  test('로딩 상태 — Skeleton 렌더링', () => {
    expect(uiSource).toContain('isLoading')
    expect(uiSource).toContain('<Skeleton')
  })

  test('에러 상태 — 재시도 버튼', () => {
    expect(uiSource).toContain('isError')
    expect(uiSource).toContain('refetch()')
    expect(uiSource).toContain('다시 시도')
  })

  test('빈 상태 — EmptyState 컴포넌트', () => {
    expect(uiSource).toContain('<EmptyState')
    expect(uiSource).toContain('부서가 없습니다')
  })

  test('활성/비활성 부서 분리 렌더링', () => {
    expect(uiSource).toContain('activeDepts')
    expect(uiSource).toContain('inactiveDepts')
    expect(uiSource).toContain('비활성 부서')
  })

  test('삭제 시 mode=force 파라미터 전달', () => {
    expect(uiSource).toContain('mode=force')
  })

  test('cascade 분석 쿼리 — deleteDept 있을 때만 활성화 (enabled)', () => {
    expect(uiSource).toContain('enabled: !!deleteDept')
  })

  test('폼 입력값 밸리데이션 — 부서명 빈값/100자 초과', () => {
    expect(uiSource).toContain('부서명을 입력하세요')
    expect(uiSource).toContain('100자 이내')
  })

  test('편집 모달 — 기존 값 프리필 (initialData)', () => {
    expect(uiSource).toContain('initialData={{ name: editDept.name')
  })

  test('뮤테이션 isPending으로 중복 제출 방지', () => {
    expect(uiSource).toContain('createMutation.isPending')
    expect(uiSource).toContain('updateMutation.isPending')
    expect(uiSource).toContain('deleteMutation.isPending')
  })

  test('삭제 버튼에 destructive variant 사용', () => {
    expect(uiSource).toContain('variant="destructive"')
  })

  test('접근성 — aria-label 적용', () => {
    expect(uiSource).toContain('aria-label')
  })

  test('Badge로 활성/비활성 상태 표시', () => {
    expect(uiSource).toContain('<Badge variant="success">활성</Badge>')
    expect(uiSource).toContain('<Badge variant="default">비활성</Badge>')
  })
})
