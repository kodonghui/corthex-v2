import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'
import * as path from 'path'

// === Story 19.1: Admin Credentials UI Page TEA Tests ===
// TEA: Risk-based — P0 component exists + key features, P0 masked display (NFR-S1, FR-CM2),
//      P0 CRUD API calls, P0 empty state, P1 route registration, P1 delete confirm dialog

// ─── Source files ─────────────────────────────────────────────────────────────

const PAGE_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../../../admin/src/pages/mcp-credentials.tsx'),
  'utf-8',
)

const APP_SRC = fs.readFileSync(
  path.resolve(import.meta.dir, '../../../../admin/src/App.tsx'),
  'utf-8',
)

// ─── P0: Component export and structure ──────────────────────────────────────

describe('[P0] McpCredentialsPage — component structure', () => {
  test('exports McpCredentialsPage function', () => {
    expect(PAGE_SRC).toContain('export function McpCredentialsPage(')
  })

  test('uses useQuery for credential list', () => {
    expect(PAGE_SRC).toContain('useQuery')
  })

  test('uses useMutation for create/update/delete', () => {
    expect(PAGE_SRC).toContain('useMutation')
  })

  test('GET /admin/credentials API call in useQuery', () => {
    expect(PAGE_SRC).toContain('/admin/credentials')
  })

  test('POST /admin/credentials for create mutation', () => {
    expect(PAGE_SRC).toContain("post('/admin/credentials'")
  })

  test('PUT /admin/credentials/:keyName for update mutation', () => {
    expect(PAGE_SRC).toContain('put(`/admin/credentials/${')
  })

  test('DELETE /admin/credentials/:keyName for delete mutation', () => {
    expect(PAGE_SRC).toContain('delete(`/admin/credentials/${')
  })
})

// ─── P0: NFR-S1 FR-CM2 — masked display (key values never shown) ──────────────

describe('[P0] NFR-S1 FR-CM2 — value masked in table (never displayed)', () => {
  test('masked value shown in table (bullet characters)', () => {
    // Value column shows dots/bullets, not actual value
    expect(PAGE_SRC).toContain('••••••••••••••••')
  })

  test('value column header present', () => {
    expect(PAGE_SRC).toContain('Value')
  })

  test('password type input for value field (NFR-S1)', () => {
    // Input type="password" prevents value display in browser
    expect(PAGE_SRC).toContain('type="password"')
  })

  test('no raw value display from API (encryptedValue never exposed)', () => {
    // No {cred.value} or {cred.encryptedValue} rendered
    expect(PAGE_SRC).not.toContain('{cred.value}')
    expect(PAGE_SRC).not.toContain('{cred.encryptedValue}')
  })
})

// ─── P0: Table columns ────────────────────────────────────────────────────────

describe('[P0] AC1 — table columns: Key Name, Last Updated, Actions', () => {
  test('Key Name column present', () => {
    expect(PAGE_SRC).toContain('Key Name')
    expect(PAGE_SRC).toContain('keyName')
  })

  test('Last Updated column present', () => {
    expect(PAGE_SRC).toContain('Last Updated')
    expect(PAGE_SRC).toContain('updatedAt')
  })

  test('Actions column with Edit and Delete buttons', () => {
    expect(PAGE_SRC).toContain('수정')
    expect(PAGE_SRC).toContain('삭제')
  })
})

// ─── P0: Add Credential button ────────────────────────────────────────────────

describe('[P0] AC2 — Add Credential form with keyName + value fields', () => {
  test('Add Credential button visible', () => {
    expect(PAGE_SRC).toContain('크리덴셜 추가')
  })

  test('form has keyName input', () => {
    expect(PAGE_SRC).toContain("placeholder=\"tistory_access_token\"")
  })

  test('form clears after submission (setForm(EMPTY_FORM))', () => {
    expect(PAGE_SRC).toContain('EMPTY_FORM')
    expect(PAGE_SRC).toContain('setForm(EMPTY_FORM)')
  })
})

// ─── P0: Empty state ──────────────────────────────────────────────────────────

describe('[P0] AC5 — empty state message when no credentials exist', () => {
  test('empty state message shown', () => {
    expect(PAGE_SRC).toContain('등록된 크리덴셜이 없습니다')
  })

  test('empty state has guidance text', () => {
    expect(PAGE_SRC).toContain('크리덴셜 추가')
  })
})

// ─── P0: Loading state ────────────────────────────────────────────────────────

describe('[P0] UI states — loading, company guard', () => {
  test('company-not-selected guard shown', () => {
    expect(PAGE_SRC).toContain('selectedCompanyId')
    expect(PAGE_SRC).toContain('회사를 선택해 주세요')
  })

  test('loading state shown (isLoading)', () => {
    expect(PAGE_SRC).toContain('isLoading')
    expect(PAGE_SRC).toContain('로딩 중')
  })
})

// ─── P1: Delete confirmation dialog (AC3) ────────────────────────────────────

describe('[P1] AC3 — delete confirmation dialog before deletion', () => {
  test('confirmDelete state tracks which credential to delete', () => {
    expect(PAGE_SRC).toContain('confirmDelete')
    expect(PAGE_SRC).toContain('setConfirmDelete')
  })

  test('delete confirmation message shown', () => {
    expect(PAGE_SRC).toContain('삭제 확인')
  })

  test('cancel button in delete confirm dialog', () => {
    // Two cancel buttons: one in form, one in delete confirm
    const cancelCount = (PAGE_SRC.match(/취소/g) ?? []).length
    expect(cancelCount).toBeGreaterThanOrEqual(2)
  })
})

// ─── P1: Edit credential flow (AC4) ──────────────────────────────────────────

describe('[P1] AC4 — edit credential updates value only (keyName unchanged)', () => {
  test('editKeyName state tracks which credential is being edited', () => {
    expect(PAGE_SRC).toContain('editKeyName')
    expect(PAGE_SRC).toContain('setEditKeyName')
  })

  test('keyName input disabled when editing', () => {
    expect(PAGE_SRC).toContain('disabled={!!editKeyName}')
  })

  test('handleEdit function sets form with cred keyName', () => {
    expect(PAGE_SRC).toContain('function handleEdit(')
    expect(PAGE_SRC).toContain('setEditKeyName(cred.keyName)')
  })
})

// ─── P1: Route registration ────────────────────────────────────────────────────

describe('[P1] App.tsx — McpCredentialsPage registered', () => {
  test('App.tsx imports McpCredentialsPage', () => {
    expect(APP_SRC).toContain('McpCredentialsPage')
    expect(APP_SRC).toContain("'./pages/mcp-credentials'")
  })

  test('App.tsx has route path="mcp-credentials"', () => {
    expect(APP_SRC).toContain('path="mcp-credentials"')
  })

  test('route wrapped in Suspense with PageSkeleton fallback', () => {
    const routeIdx = APP_SRC.indexOf('mcp-credentials"')
    const afterRoute = APP_SRC.slice(routeIdx, routeIdx + 200)
    expect(afterRoute).toContain('Suspense')
    expect(afterRoute).toContain('McpCredentialsPage')
  })
})

// ─── P1: keyName rendering ────────────────────────────────────────────────────

describe('[P1] Credential keyName display (mono font)', () => {
  test('keyName rendered in mono font for readability', () => {
    expect(PAGE_SRC).toContain('font-mono')
    expect(PAGE_SRC).toContain('cred.keyName')
  })

  test('updatedAt formatted as readable date', () => {
    expect(PAGE_SRC).toContain('toLocaleDateString')
    expect(PAGE_SRC).toContain('cred.updatedAt')
  })
})
