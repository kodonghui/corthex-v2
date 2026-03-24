/**
 * Story 26.3: Human Approval & Multi-Platform Posting
 * References: FR-MKT2, FR-MKT3, NFR-P17
 *
 * Manages the human approval flow for AI-generated marketing content.
 * Content can be approved/rejected via CEO app web UI, Slack, or Telegram.
 * Approved content posted to multiple platforms simultaneously.
 * Partial platform failure retains successful platforms.
 */

import { db } from '../db'
import { companies } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { eventBus } from '../lib/event-bus'

// === Types ===

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ApprovalChannel = 'web' | 'slack' | 'telegram'
export type PostingPlatform = 'instagram' | 'tiktok' | 'youtube_shorts' | 'linkedin' | 'x'

export interface MarketingContent {
  id: string
  workflowExecutionId: string
  type: 'card_news' | 'short_form'
  title: string
  description: string
  mediaUrl?: string
  thumbnailUrl?: string
  generatedAt: string
}

export interface ApprovalRequest {
  id: string
  companyId: string
  contents: MarketingContent[]
  status: ApprovalStatus
  approvalChannel?: ApprovalChannel
  approvedBy?: string
  rejectedReason?: string
  createdAt: string
  resolvedAt?: string
}

export interface PlatformPostResult {
  platform: PostingPlatform
  success: boolean
  postId?: string
  error?: string
  durationMs: number
}

export interface PostingResult {
  approvalId: string
  results: PlatformPostResult[]
  totalSuccess: number
  totalFailed: number
  totalDurationMs: number
}

// === Performance targets (NFR-P17) ===

export const PERFORMANCE_TARGETS = {
  imageGenerationMaxMs: 2 * 60 * 1000,   // ≤2min
  videoGenerationMaxMs: 10 * 60 * 1000,  // ≤10min
  postingMaxMs: 30 * 1000,               // ≤30s per platform
} as const

// === Approval Management ===

/**
 * Get pending approval requests for a company.
 * Used by CEO app to display review queue.
 */
export async function getPendingApprovals(companyId: string): Promise<ApprovalRequest[]> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company?.settings) return []

  const settings = company.settings as Record<string, unknown>
  const marketing = settings.marketing as Record<string, unknown> | undefined
  const approvals = (marketing?.approvals ?? []) as ApprovalRequest[]

  return approvals.filter((a) => a.status === 'pending')
}

/**
 * Get a single approval request by ID.
 */
export async function getApprovalById(companyId: string, approvalId: string): Promise<ApprovalRequest | null> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company?.settings) return null

  const settings = company.settings as Record<string, unknown>
  const marketing = settings.marketing as Record<string, unknown> | undefined
  const approvals = (marketing?.approvals ?? []) as ApprovalRequest[]

  return approvals.find((a) => a.id === approvalId) ?? null
}

/**
 * Get all approval requests for a company (with pagination).
 */
export async function getApprovalHistory(
  companyId: string,
  limit = 20,
  offset = 0,
): Promise<{ items: ApprovalRequest[]; total: number }> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company?.settings) return { items: [], total: 0 }

  const settings = company.settings as Record<string, unknown>
  const marketing = settings.marketing as Record<string, unknown> | undefined
  const approvals = (marketing?.approvals ?? []) as ApprovalRequest[]

  // Sort by createdAt desc
  const sorted = [...approvals].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return {
    items: sorted.slice(offset, offset + limit),
    total: sorted.length,
  }
}

/**
 * Create a new approval request from n8n workflow execution.
 * Stores in company.settings.marketing.approvals JSONB array.
 */
export async function createApprovalRequest(
  companyId: string,
  contents: MarketingContent[],
  workflowExecutionId: string,
): Promise<ApprovalRequest> {
  const request: ApprovalRequest = {
    id: crypto.randomUUID(),
    companyId,
    contents,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  // Atomic append to approvals array
  await db.execute(sql`
    UPDATE companies
    SET settings = jsonb_set(
      COALESCE(settings, '{}'::jsonb) ||
      jsonb_build_object('marketing', COALESCE(settings->'marketing', '{}'::jsonb)),
      '{marketing,approvals}',
      COALESCE(settings->'marketing'->'approvals', '[]'::jsonb) || ${JSON.stringify(request)}::jsonb
    ),
    updated_at = NOW()
    WHERE id = ${companyId}
  `)

  // Emit notification event for real-time push
  eventBus.emit('notification', {
    userId: companyId,
    payload: {
      type: 'marketing_approval',
      title: '마케팅 콘텐츠 승인 요청',
      message: `${contents.length}개의 콘텐츠가 승인을 기다리고 있습니다.`,
      approvalId: request.id,
    },
  })

  return request
}

/**
 * Approve a marketing content request (FR-MKT3).
 * Supports approval via web UI, Slack, or Telegram.
 */
export async function approveContent(
  companyId: string,
  approvalId: string,
  channel: ApprovalChannel,
  approvedBy: string,
): Promise<ApprovalRequest | null> {
  return updateApprovalStatus(companyId, approvalId, 'approved', channel, approvedBy)
}

/**
 * Reject a marketing content request (FR-MKT3).
 */
export async function rejectContent(
  companyId: string,
  approvalId: string,
  channel: ApprovalChannel,
  rejectedBy: string,
  reason?: string,
): Promise<ApprovalRequest | null> {
  return updateApprovalStatus(companyId, approvalId, 'rejected', channel, rejectedBy, reason)
}

async function updateApprovalStatus(
  companyId: string,
  approvalId: string,
  status: ApprovalStatus,
  channel: ApprovalChannel,
  actor: string,
  reason?: string,
): Promise<ApprovalRequest | null> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company?.settings) return null

  const settings = company.settings as Record<string, unknown>
  const marketing = settings.marketing as Record<string, unknown> | undefined
  const approvals = (marketing?.approvals ?? []) as ApprovalRequest[]

  const idx = approvals.findIndex((a) => a.id === approvalId)
  if (idx === -1) return null

  const updated = {
    ...approvals[idx],
    status,
    approvalChannel: channel,
    approvedBy: status === 'approved' ? actor : undefined,
    rejectedReason: reason,
    resolvedAt: new Date().toISOString(),
  }

  approvals[idx] = updated

  // Write back full approvals array
  await db.execute(sql`
    UPDATE companies
    SET settings = jsonb_set(
      COALESCE(settings, '{}'::jsonb),
      '{marketing,approvals}',
      ${JSON.stringify(approvals)}::jsonb
    ),
    updated_at = NOW()
    WHERE id = ${companyId}
  `)

  return updated
}

// === Multi-Platform Posting (FR-MKT2) ===

/**
 * Post approved content to multiple platforms simultaneously.
 * Partial failure retains successful platforms (FR-MKT2).
 * Each platform posting must complete within 30s (NFR-P17).
 */
export async function postToMultiplePlatforms(
  companyId: string,
  approvalId: string,
  platforms: PostingPlatform[],
): Promise<PostingResult> {
  const startTime = Date.now()
  const results: PlatformPostResult[] = []

  // Post to all platforms simultaneously (Promise.allSettled for partial failure)
  const postPromises = platforms.map(async (platform): Promise<PlatformPostResult> => {
    const platformStart = Date.now()
    try {
      // Platform-specific posting via n8n webhook or direct API
      const postId = await postToPlatform(companyId, platform, approvalId)
      return {
        platform,
        success: true,
        postId,
        durationMs: Date.now() - platformStart,
      }
    } catch (err) {
      return {
        platform,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - platformStart,
      }
    }
  })

  const settled = await Promise.allSettled(postPromises)
  for (let i = 0; i < settled.length; i++) {
    const result = settled[i]
    if (result.status === 'fulfilled') {
      results.push(result.value)
    } else {
      results.push({
        platform: platforms[i],
        success: false,
        error: result.reason?.message ?? 'Unknown error',
        durationMs: 0,
      })
    }
  }

  const totalSuccess = results.filter((r) => r.success).length
  const totalFailed = results.filter((r) => !r.success).length

  // Notify admin of failures (FR-MKT2: "실패 플랫폼만 Admin에게 알린다")
  if (totalFailed > 0) {
    const failedPlatforms = results.filter((r) => !r.success).map((r) => r.platform)
    eventBus.emit('notification', {
      userId: companyId,
      payload: {
        type: 'marketing_posting_partial_failure',
        title: '일부 플랫폼 게시 실패',
        message: `${failedPlatforms.join(', ')} 게시에 실패했습니다. 성공: ${totalSuccess}개, 실패: ${totalFailed}개`,
        approvalId,
        failedPlatforms,
      },
    })
  }

  return {
    approvalId,
    results,
    totalSuccess,
    totalFailed,
    totalDurationMs: Date.now() - startTime,
  }
}

/**
 * Post to a single platform. This is the integration point for platform APIs.
 * In production, this triggers n8n nodes or direct API calls.
 * Each call has a 30s timeout (NFR-P17).
 */
async function postToPlatform(
  companyId: string,
  platform: PostingPlatform,
  approvalId: string,
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PERFORMANCE_TARGETS.postingMaxMs)

  try {
    // n8n webhook trigger for platform posting
    const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://127.0.0.1:5678'
    const response = await fetch(
      `${N8N_BASE_URL}/webhook/marketing/post/${platform}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, approvalId, platform }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Platform API error: ${response.status}`)
    }

    const data = await response.json() as { postId?: string }
    return data.postId ?? crypto.randomUUID()
  } finally {
    clearTimeout(timeout)
  }
}
