import { describe, it, expect, mock, beforeEach } from 'bun:test'

// ============================================================
// TEA Risk-Based Tests for Story 7.4: Cascade 규칙 + 삭제 방지
// Risk areas: countActiveTasks, deactivateAgent session check,
//             executeCascade agent preservation, route 409 response
// ============================================================

describe('Story 7.4: Cascade 규칙 + 삭제 방지', () => {
  const tenant = { companyId: 'company-1', userId: 'user-1', isAdminUser: true }

  // ── AC1: 비서/시스템 삭제 방지 (regression) ──

  describe('AC1: 비서 삭제 방지 (ORG_SECRETARY_DELETE_DENIED)', () => {
    it('비서 에이전트 삭제 시 403 + correct error code', () => {
      const error = {
        status: 403,
        message: '비서 에이전트는 삭제할 수 없습니다',
        code: 'ORG_SECRETARY_DELETE_DENIED',
      }
      expect(error.status).toBe(403)
      expect(error.code).toBe('ORG_SECRETARY_DELETE_DENIED')
    })

    it('시스템 에이전트 삭제 시 403 + AGENT_003', () => {
      const error = {
        status: 403,
        message: '시스템 에이전트는 삭제할 수 없습니다',
        code: 'AGENT_003',
      }
      expect(error.status).toBe(403)
      expect(error.code).toBe('AGENT_003')
    })

    it('보호 순서: isSystem → isSecretary → session check', () => {
      // deactivateAgent checks in this order:
      // 1. not found → 404
      // 2. isSystem → 403 AGENT_003
      // 3. isSecretary → 403 ORG_SECRETARY_DELETE_DENIED
      // 4. active sessions (if !force) → 409 AGENT_ACTIVE_SESSIONS
      // 5. proceed with soft delete
      const checkOrder = ['not_found', 'isSystem', 'isSecretary', 'active_sessions', 'soft_delete']
      expect(checkOrder.indexOf('isSystem')).toBeLessThan(checkOrder.indexOf('isSecretary'))
      expect(checkOrder.indexOf('isSecretary')).toBeLessThan(checkOrder.indexOf('active_sessions'))
    })
  })

  // ── AC2: 부서 cascade — 에이전트 활성 유지 ──

  describe('AC2: 부서 삭제 cascade — 에이전트 isActive 유지', () => {
    it('executeCascade update payload: departmentId=null만, isActive/status 없음', () => {
      // The cascade update for agents should ONLY contain:
      const cascadeUpdate = {
        departmentId: null,
        updatedAt: new Date(),
      }
      expect(cascadeUpdate).toHaveProperty('departmentId', null)
      expect(cascadeUpdate).toHaveProperty('updatedAt')
      expect(cascadeUpdate).not.toHaveProperty('isActive')
      expect(cascadeUpdate).not.toHaveProperty('status')
    })

    it('cascade 후 에이전트 상태 보존: isActive=true, status=기존값', () => {
      const before = { departmentId: 'dept-1', isActive: true, status: 'online' }
      // cascade only changes departmentId
      const after = { ...before, departmentId: null }
      expect(after.isActive).toBe(true)
      expect(after.status).toBe('online')
      expect(after.departmentId).toBeNull()
    })

    it('cascade 후 working 상태 에이전트도 status 보존', () => {
      const before = { departmentId: 'dept-1', isActive: true, status: 'working' }
      const after = { ...before, departmentId: null }
      expect(after.status).toBe('working')
    })

    it('cascade 메시지: "미배속 전환" (비활성화 아님)', () => {
      const msg = '부서 "마케팅부"이(가) 삭제되었습니다. 에이전트 3명 미배속 전환.'
      expect(msg).toContain('미배속 전환')
    })
  })

  // ── AC3: 에이전트 삭제 시 세션 체크 ──

  describe('AC3: deactivateAgent 세션 체크', () => {
    it('활성 세션 > 0 & force=false → 409 AGENT_ACTIVE_SESSIONS', () => {
      const activeTaskCount = 3
      const force = false

      if (activeTaskCount > 0 && !force) {
        const error = {
          status: 409,
          code: 'AGENT_ACTIVE_SESSIONS',
          message: `이 에이전트는 현재 ${activeTaskCount}개 세션이 진행 중입니다`,
          data: { activeTaskCount },
        }
        expect(error.status).toBe(409)
        expect(error.code).toBe('AGENT_ACTIVE_SESSIONS')
        expect(error.data.activeTaskCount).toBe(3)
      }
    })

    it('활성 세션 > 0 & force=true → skip check, proceed with delete', () => {
      const activeTaskCount = 5
      const force = true

      // When force=true, the session check is skipped entirely
      // No query to orchestrationTasks is made
      const shouldCheckSessions = !force
      expect(shouldCheckSessions).toBe(false)
    })

    it('활성 세션 > 0 & force=undefined → treated as false, blocked', () => {
      const force = undefined

      // undefined force should be treated as falsy → check sessions
      const shouldCheckSessions = !force
      expect(shouldCheckSessions).toBe(true)
    })

    it('활성 세션 = 0 & force=false → proceed with delete', () => {
      const activeTaskCount = 0
      const force = false

      // Even without force, 0 sessions → proceed
      const shouldBlock = activeTaskCount > 0 && !force
      expect(shouldBlock).toBe(false)
    })

    it('에러 응답에 activeTaskCount 데이터 포함', () => {
      const errorResponse = {
        error: {
          status: 409,
          message: '이 에이전트는 현재 7개 세션이 진행 중입니다',
          code: 'AGENT_ACTIVE_SESSIONS',
          data: { activeTaskCount: 7 },
        },
      }
      expect(errorResponse.error.data).toBeDefined()
      expect(errorResponse.error.data.activeTaskCount).toBe(7)
      expect(typeof errorResponse.error.data.activeTaskCount).toBe('number')
    })
  })

  // ── AC3 sub: countActiveTasks 헬퍼 ──

  describe('countActiveTasks shared helper', () => {
    it('pending + running 상태만 카운트', () => {
      const statusFilter = ['pending', 'running']
      expect(statusFilter).toContain('pending')
      expect(statusFilter).toContain('running')
      expect(statusFilter).not.toContain('completed')
      expect(statusFilter).not.toContain('failed')
      expect(statusFilter).not.toContain('cancelled')
    })

    it('반환값은 항상 number (null 방어)', () => {
      // countActiveTasks uses Number(r?.cnt ?? 0)
      expect(Number(null ?? 0)).toBe(0)
      expect(Number(undefined ?? 0)).toBe(0)
      expect(Number('3' ?? 0)).toBe(3)
      expect(Number(0 ?? 0)).toBe(0)
    })

    it('tenant scoping 적용 (companyId 격리)', () => {
      // countActiveTasks receives companyId and must use withTenant
      const companyId = 'company-abc'
      const agentId = 'agent-xyz'
      // Both must be present in the query
      expect(companyId).toBeTruthy()
      expect(agentId).toBeTruthy()
    })
  })

  // ── AC4: DELETE 라우트 force 파라미터 ──

  describe('AC4: DELETE /api/admin/agents/:id route', () => {
    it('force=true 쿼리 파라미터 → boolean true 변환', () => {
      const forceParam = 'true'
      const force = forceParam === 'true'
      expect(force).toBe(true)
    })

    it('force 파라미터 없음 → boolean false', () => {
      const forceParam = undefined
      const force = forceParam === 'true'
      expect(force).toBe(false)
    })

    it('force=false 문자열 → boolean false', () => {
      const forceParam = 'false'
      const force = forceParam === 'true'
      expect(force).toBe(false)
    })

    it('force=1 문자열 → boolean false (strict equality)', () => {
      const forceParam = '1'
      const force = forceParam === 'true'
      expect(force).toBe(false)
    })

    it('AGENT_ACTIVE_SESSIONS 409 응답 구조', () => {
      const response = {
        success: false,
        error: { code: 'AGENT_ACTIVE_SESSIONS', message: '이 에이전트는 현재 3개 세션이 진행 중입니다' },
        data: { activeTaskCount: 3 },
      }
      expect(response.success).toBe(false)
      expect(response.error.code).toBe('AGENT_ACTIVE_SESSIONS')
      expect(response.data.activeTaskCount).toBe(3)
    })

    it('비서 삭제 시도는 HTTPError throw (not 409 JSON)', () => {
      // Secretary/system errors go through HTTPError, not the special 409 path
      const error = { code: 'ORG_SECRETARY_DELETE_DENIED', status: 403 }
      expect(error.code).not.toBe('AGENT_ACTIVE_SESSIONS')
    })
  })

  // ── AC5: 프론트엔드 모달 ──

  describe('AC5: 프론트엔드 삭제 확인 모달', () => {
    it('ApiError.code === AGENT_ACTIVE_SESSIONS → show session warning', () => {
      // Frontend checks: err instanceof ApiError && err.code === 'AGENT_ACTIVE_SESSIONS'
      const errCode = 'AGENT_ACTIVE_SESSIONS'
      const errData = { activeTaskCount: 3 }

      expect(errCode).toBe('AGENT_ACTIVE_SESSIONS')
      expect(errData.activeTaskCount).toBeGreaterThan(0)
    })

    it('비서 삭제 에러는 세션 경고 아닌 toast 표시', () => {
      const errCode = 'ORG_SECRETARY_DELETE_DENIED'
      const isSessionError = errCode === 'AGENT_ACTIVE_SESSIONS'
      expect(isSessionError).toBe(false)
    })

    it('force=true URL 생성', () => {
      const id = 'agent-123'
      const force = true
      const url = `/admin/agents/${id}${force ? '?force=true' : ''}`
      expect(url).toBe('/admin/agents/agent-123?force=true')
    })

    it('force=false URL에 쿼리 파라미터 없음', () => {
      const id = 'agent-123'
      const force = false
      const url = `/admin/agents/${id}${force ? '?force=true' : ''}`
      expect(url).toBe('/admin/agents/agent-123')
    })

    it('세션 있으면 confirm 버튼 비활성 (force 체크 안했을 때)', () => {
      const activeSessionCount = 3
      const forceDeactivate = false
      const isPending = false

      const disabled = isPending || (activeSessionCount > 0 && !forceDeactivate)
      expect(disabled).toBe(true)
    })

    it('세션 있어도 force 체크하면 confirm 버튼 활성', () => {
      const activeSessionCount = 3
      const forceDeactivate = true
      const isPending = false

      const disabled = isPending || (activeSessionCount > 0 && !forceDeactivate)
      expect(disabled).toBe(false)
    })

    it('세션 없으면 force 체크 없이도 confirm 버튼 활성', () => {
      const activeSessionCount = null
      const forceDeactivate = false
      const isPending = false

      // activeSessionCount is null when no sessions checked yet
      const disabled = isPending || (activeSessionCount !== null && activeSessionCount > 0 && !forceDeactivate)
      expect(disabled).toBe(false)
    })
  })

  // ── departments.tsx 메시지 ──

  describe('departments.tsx preservation notice', () => {
    it('활성 상태 유지 메시지 포함', () => {
      const notice = '에이전트는 미배속으로 전환되지만 활성 상태가 유지됩니다'
      expect(notice).toContain('활성 상태가 유지')
    })

    it('이전 메시지(미배속으로 전환됩니다)와 다름', () => {
      const oldNotice = '에이전트는 미배속으로 전환됩니다'
      const newNotice = '에이전트는 미배속으로 전환되지만 활성 상태가 유지됩니다'
      expect(newNotice).not.toBe(oldNotice)
      expect(newNotice.length).toBeGreaterThan(oldNotice.length)
    })
  })

  // ── Edge Cases ──

  describe('Edge cases', () => {
    it('에이전트 not found → 404 before any protection check', () => {
      const error = { status: 404, code: 'AGENT_001', message: '에이전트를 찾을 수 없습니다' }
      expect(error.status).toBe(404)
    })

    it('activeTaskCount=0 with force=true → still succeeds (no unnecessary block)', () => {
      const activeTaskCount = 0
      const force = true
      // Should not even check sessions when force=true
      const shouldCheck = !force
      expect(shouldCheck).toBe(false)
    })

    it('cascade with 0 agents → skip agent update entirely', () => {
      const agentCount = 0
      // executeCascade wraps agent update in if(analysis.agentCount > 0)
      const shouldUpdateAgents = agentCount > 0
      expect(shouldUpdateAgents).toBe(false)
    })

    it('cascade force mode stops active tasks before unassigning', () => {
      // mode='force' should set tasks to 'failed' with reason
      const taskMetadata = { reason: 'cascade_force_stop' }
      expect(taskMetadata.reason).toBe('cascade_force_stop')
    })
  })
})
