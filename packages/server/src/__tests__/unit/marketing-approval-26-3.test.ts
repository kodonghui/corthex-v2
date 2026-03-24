import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 26.3: Human Approval & Multi-Platform Posting
 * References: FR-MKT2, FR-MKT3, NFR-P17
 *
 * Tests verify:
 * (1) Approval service types & functions (FR-MKT3)
 * (2) Multi-platform posting with partial failure (FR-MKT2)
 * (3) Performance targets (NFR-P17)
 * (4) Workspace routes for CEO approval flow
 * (5) CEO app approval UI page
 * (6) EventBus notifications
 */

const readSrc = (relPath: string) =>
  fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')

// === FR-MKT3: Approval Service ===

describe('26.3: FR-MKT3 — Marketing approval service', () => {
  test('marketing-approval.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/marketing-approval.ts')).toBe(true)
  })

  test('exports ApprovalStatus type (pending | approved | rejected)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain("export type ApprovalStatus = 'pending' | 'approved' | 'rejected'")
  })

  test('exports ApprovalChannel type (web | slack | telegram)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain("export type ApprovalChannel = 'web' | 'slack' | 'telegram'")
  })

  test('exports PostingPlatform type (5 platforms)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain("export type PostingPlatform = 'instagram' | 'tiktok' | 'youtube_shorts' | 'linkedin' | 'x'")
  })

  test('exports MarketingContent interface with card_news | short_form types', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export interface MarketingContent')
    expect(src).toContain("'card_news' | 'short_form'")
    expect(src).toContain('mediaUrl')
    expect(src).toContain('thumbnailUrl')
  })

  test('exports ApprovalRequest interface', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export interface ApprovalRequest')
    expect(src).toContain('companyId')
    expect(src).toContain('contents: MarketingContent[]')
    expect(src).toContain('status: ApprovalStatus')
    expect(src).toContain('approvalChannel')
    expect(src).toContain('rejectedReason')
    expect(src).toContain('resolvedAt')
  })

  test('exports PlatformPostResult interface', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export interface PlatformPostResult')
    expect(src).toContain('platform: PostingPlatform')
    expect(src).toContain('durationMs: number')
  })

  test('exports PostingResult interface with success/failed counts', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export interface PostingResult')
    expect(src).toContain('totalSuccess: number')
    expect(src).toContain('totalFailed: number')
    expect(src).toContain('totalDurationMs: number')
  })
})

// === FR-MKT3: Approval Functions ===

describe('26.3: FR-MKT3 — Approval functions', () => {
  test('getPendingApprovals filters by status=pending', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function getPendingApprovals')
    expect(src).toContain("a.status === 'pending'")
  })

  test('getApprovalHistory returns paginated results', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function getApprovalHistory')
    expect(src).toContain('limit')
    expect(src).toContain('offset')
    expect(src).toContain('sorted.slice(offset, offset + limit)')
  })

  test('createApprovalRequest stores in JSONB approvals array', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function createApprovalRequest')
    expect(src).toContain("'{marketing,approvals}'")
    expect(src).toContain('crypto.randomUUID()')
  })

  test('createApprovalRequest emits notification event', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain("eventBus.emit('notification'")
    expect(src).toContain('marketing_approval')
    expect(src).toContain('마케팅 콘텐츠 승인 요청')
  })

  test('approveContent calls updateApprovalStatus with approved', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function approveContent')
    expect(src).toContain("'approved'")
  })

  test('rejectContent calls updateApprovalStatus with rejected + reason', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function rejectContent')
    expect(src).toContain("'rejected'")
    expect(src).toContain('reason')
  })

  test('updateApprovalStatus writes back full approvals array', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('async function updateApprovalStatus')
    expect(src).toContain('approvals[idx] = updated')
    expect(src).toContain("'{marketing,approvals}'")
  })

  test('getApprovalById returns single approval by ID', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function getApprovalById')
    expect(src).toContain('a.id === approvalId')
  })

  test('approval supports web, slack, telegram channels (FR-MKT3)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('approvalChannel: channel')
    expect(src).toContain("channel: ApprovalChannel")
  })
})

// === FR-MKT2: Multi-Platform Posting ===

describe('26.3: FR-MKT2 — Multi-platform posting', () => {
  test('postToMultiplePlatforms uses Promise.allSettled for partial failure', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export async function postToMultiplePlatforms')
    expect(src).toContain('Promise.allSettled')
  })

  test('postToPlatform sends to n8n webhook endpoint', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('async function postToPlatform')
    expect(src).toContain('/webhook/marketing/post/')
  })

  test('postToPlatform uses AbortController for timeout', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('AbortController')
    expect(src).toContain('controller.abort()')
    expect(src).toContain('clearTimeout(timeout)')
  })

  test('partial failure notifies admin with failed platforms', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('marketing_posting_partial_failure')
    expect(src).toContain('일부 플랫폼 게시 실패')
    expect(src).toContain('failedPlatforms')
  })

  test('allSettled rejection uses platforms[i] not hardcoded fallback (John LOW #3)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('platform: platforms[i]')
    expect(src).not.toContain("platform: 'instagram', // fallback")
  })

  test('tracks duration per platform and total', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('durationMs: Date.now() - platformStart')
    expect(src).toContain('totalDurationMs: Date.now() - startTime')
  })
})

// === NFR-P17: Performance Targets ===

describe('26.3: NFR-P17 — Performance targets', () => {
  test('PERFORMANCE_TARGETS exported with correct values', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('export const PERFORMANCE_TARGETS')
    expect(src).toContain('imageGenerationMaxMs')
    expect(src).toContain('videoGenerationMaxMs')
    expect(src).toContain('postingMaxMs')
  })

  test('image generation ≤ 2min (120000ms)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('2 * 60 * 1000')
  })

  test('video generation ≤ 10min (600000ms)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('10 * 60 * 1000')
  })

  test('posting ≤ 30s per platform (30000ms)', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('30 * 1000')
    expect(src).toContain('PERFORMANCE_TARGETS.postingMaxMs')
  })
})

// === Workspace Routes ===

describe('26.3: Workspace routes — Marketing approval', () => {
  test('marketing-approval route file exists', () => {
    expect(fs.existsSync('packages/server/src/routes/workspace/marketing-approval.ts')).toBe(true)
  })

  test('GET /marketing/approvals/pending — pending queue', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("marketingApprovalRoute.get('/marketing/approvals/pending'")
    expect(src).toContain('getPendingApprovals')
  })

  test('GET /marketing/approvals/history — history with pagination', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("marketingApprovalRoute.get('/marketing/approvals/history'")
    expect(src).toContain('getApprovalHistory')
    expect(src).toContain('limit')
    expect(src).toContain('offset')
  })

  test('POST /marketing/approvals/:id/approve — approve content', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("'/marketing/approvals/:id/approve'")
    expect(src).toContain('approveContent')
    expect(src).toContain("zValidator('json', approveSchema)")
  })

  test('POST /marketing/approvals/:id/reject — reject content', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("'/marketing/approvals/:id/reject'")
    expect(src).toContain('rejectContent')
    expect(src).toContain("zValidator('json', rejectSchema)")
  })

  test('POST /marketing/approvals/:id/post — multi-platform post', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("'/marketing/approvals/:id/post'")
    expect(src).toContain('postToMultiplePlatforms')
    expect(src).toContain("zValidator('json', postSchema)")
  })

  test('routes use authMiddleware', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain('authMiddleware')
  })

  test('approve/reject schemas validate channel enum', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("z.enum(['web', 'slack', 'telegram'])")
  })

  test('post schema validates platform enum', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain("z.enum(['instagram', 'tiktok', 'youtube_shorts', 'linkedin', 'x'])")
  })

  test('approve/reject returns 404 APPROVAL_NOT_FOUND on missing', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain('APPROVAL_NOT_FOUND')
    expect(src).toContain('승인 요청을 찾을 수 없습니다')
  })

  test('post endpoint checks approval status before posting (John MEDIUM #2)', () => {
    const src = readSrc('routes/workspace/marketing-approval.ts')
    expect(src).toContain('getApprovalById')
    expect(src).toContain('APPROVAL_NOT_APPROVED')
    expect(src).toContain("approval.status !== 'approved'")
  })

  test('route registered in index.ts', () => {
    const src = readSrc('index.ts')
    expect(src).toContain('marketingApprovalRoute')
    expect(src).toContain("app.route('/api/workspace', marketingApprovalRoute)")
  })
})

// === CEO App UI ===

describe('26.3: CEO app — Marketing Approval page', () => {
  test('marketing-approval page exists', () => {
    expect(fs.existsSync('packages/app/src/pages/marketing-approval.tsx')).toBe(true)
  })

  test('exports MarketingApprovalPage component', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('export function MarketingApprovalPage')
  })

  test('fetches pending approvals from workspace API', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('/workspace/marketing/approvals/pending')
    expect(src).toContain('refetchInterval')
  })

  test('fetches approval history', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('/workspace/marketing/approvals/history')
  })

  test('has PendingApprovalCard component', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('function PendingApprovalCard')
  })

  test('has ContentPreview for card_news and short_form', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('function ContentPreview')
    expect(src).toContain('카드뉴스')
    expect(src).toContain('숏폼 영상')
  })

  test('approve mutation sends POST to /approve', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('/approve')
    expect(src).toContain('approveMutation')
  })

  test('reject mutation with optional reason', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('/reject')
    expect(src).toContain('rejectMutation')
    expect(src).toContain('rejectReason')
  })

  test('multi-platform posting with platform selection', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('/post')
    expect(src).toContain('postMutation')
    expect(src).toContain('selectedPlatforms')
    expect(src).toContain('togglePlatform')
  })

  test('platform list includes all 5 platforms', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain("'instagram'")
    expect(src).toContain("'tiktok'")
    expect(src).toContain("'youtube_shorts'")
    expect(src).toContain("'linkedin'")
    expect(src).toContain("'x'")
  })

  test('has PostingResultDisplay showing success/failure per platform', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('function PostingResultDisplay')
    expect(src).toContain('totalSuccess')
    expect(src).toContain('totalFailed')
  })

  test('has HistoryItem component with status display', () => {
    const src = fs.readFileSync('packages/app/src/pages/marketing-approval.tsx', 'utf-8')
    expect(src).toContain('function HistoryItem')
    expect(src).toContain('STATUS_CONFIG')
  })

  test('route registered in CEO App.tsx', () => {
    const src = fs.readFileSync('packages/app/src/App.tsx', 'utf-8')
    expect(src).toContain('MarketingApprovalPage')
    expect(src).toContain('"marketing-approval"')
  })

  test('sidebar entry in CEO app', () => {
    const src = fs.readFileSync('packages/app/src/components/sidebar.tsx', 'utf-8')
    expect(src).toContain("'/marketing-approval'")
    expect(src).toContain('콘텐츠 승인')
    expect(src).toContain('UserCheck')
  })
})

// === Approval data flow ===

describe('26.3: Approval data flow', () => {
  test('createApprovalRequest uses atomic jsonb_set', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('jsonb_set')
    expect(src).toContain("COALESCE(settings, '{}'::jsonb)")
  })

  test('approval request has workflowExecutionId link', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('workflowExecutionId')
  })

  test('company.settings.marketing.approvals stores all approvals', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain("settings->'marketing'->'approvals'")
    expect(src).toContain("'{marketing,approvals}'")
  })

  test('approval history sorts by createdAt desc', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain('new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()')
  })

  test('resolvedAt set on approve or reject', () => {
    const src = readSrc('services/marketing-approval.ts')
    expect(src).toContain("resolvedAt: new Date().toISOString()")
  })
})
