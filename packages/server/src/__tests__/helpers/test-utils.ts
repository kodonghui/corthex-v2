/**
 * 테스트 공통 유틸 — makeToken, api, 시드 데이터 ID
 */
import { sign } from 'hono/jwt'

export const BASE = 'http://localhost:3000/api'
export const JWT_SECRET = process.env.JWT_SECRET || 'corthex-v2-dev-secret-change-in-production'

// --- 실제 시드 데이터 (Neon DB 기준) ---
export const REAL_COMPANY_ID = '6ee92cb0-5065-4e48-8149-38f30ad8913e'
export const REAL_CEO_ID = '36137766-d4c2-4d30-ae87-313341d735a1'
export const REAL_ADMIN_ID = '25235750-3dfe-472a-aadd-1d0310929467'
export const REAL_AGENT_ID = 'c3f0e96d-e227-4b44-a723-91f06527e982' // H-비서

// --- 가짜 회사 (존재하지 않는 companyId) ---
export const FAKE_COMPANY_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
export const FAKE_USER_ID = '11111111-2222-3333-4444-555555555555'

/** JWT 토큰 생성 헬퍼 */
export async function makeToken(sub: string, companyId: string, role: 'admin' | 'user' = 'user') {
  return sign({ sub, companyId, role, exp: Math.floor(Date.now() / 1000) + 3600 }, JWT_SECRET)
}

/** 만료된 JWT 토큰 생성 */
export async function makeExpiredToken(sub: string, companyId: string, role: 'admin' | 'user' = 'user') {
  return sign({ sub, companyId, role, exp: Math.floor(Date.now() / 1000) - 3600 }, JWT_SECRET)
}

/** fetch 헬퍼 (인증 포함) */
export function api(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}

/** fetch 헬퍼 (인증 없이) */
export function apiNoAuth(path: string, options: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

/** 자주 쓰는 4종 토큰 미리 생성 */
export async function createTestTokens() {
  return {
    realCeoToken: await makeToken(REAL_CEO_ID, REAL_COMPANY_ID, 'user'),
    realAdminToken: await makeToken(REAL_ADMIN_ID, REAL_COMPANY_ID, 'admin'),
    fakeUserToken: await makeToken(FAKE_USER_ID, FAKE_COMPANY_ID, 'user'),
    fakeAdminToken: await makeToken(FAKE_USER_ID, FAKE_COMPANY_ID, 'admin'),
  }
}
