/**
 * upload_media — Cloudflare R2 Media Upload (FR-CP2, E13, E16, E17)
 *
 * Uploads base64-encoded file content to Cloudflare R2 via AWS SDK S3 compatible API.
 * Returns public CDN URL for the uploaded object.
 * Credentials: r2_account_id, r2_access_key_id, r2_secret_access_key, r2_bucket, r2_public_url
 * All external API errors typed via callExternalApi (E16).
 * Telemetry: E17 INSERT→try/catch→UPDATE pattern.
 * NFR-P1: p95 latency < 8s.
 */
import { z } from 'zod'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { BuiltinToolHandler } from '../../engine'
import { callExternalApi } from '../../lib/call-external-api'
import { ToolError } from '../../lib/tool-error'
import { getDB } from '../../db/scoped-query'
import { decrypt } from '../../lib/credential-crypto'

// Max 100MB base64 encoded ≈ ~134MB base64 string, use 140MB char limit
const MAX_CONTENT_CHARS = 140 * 1024 * 1024

export const handler: BuiltinToolHandler = {
  name: 'upload_media',

  schema: z.object({
    filename: z.string().min(1),
    content: z.string().min(1).max(MAX_CONTENT_CHARS, 'File content exceeds 100MB limit'),
    contentType: z.string().min(1),
  }),

  execute: async (input, ctx) => {
    const filename = input.filename as string
    const content = input.content as string
    const contentType = input.contentType as string
    const startTime = Date.now()

    // E17 Step 1: INSERT telemetry row at tool call start
    const db = getDB(ctx.companyId)
    const [{ id: eventId }] = await db.insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'upload_media',
      startedAt: new Date(),
    })

    try {
      // Resolve R2 credentials from DB (E11 RESOLVE pattern)
      const [[accountIdRow], [accessKeyRow], [secretKeyRow], [bucketRow], [publicUrlRow]] = await Promise.all([
        db.getCredential('r2_account_id'),
        db.getCredential('r2_access_key_id'),
        db.getCredential('r2_secret_access_key'),
        db.getCredential('r2_bucket'),
        db.getCredential('r2_public_url'),
      ])

      if (!accountIdRow) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'r2_account_id not configured — register R2 credentials in Admin settings.')
      }
      if (!accessKeyRow) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'r2_access_key_id not configured — register R2 credentials in Admin settings.')
      }
      if (!secretKeyRow) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'r2_secret_access_key not configured — register R2 credentials in Admin settings.')
      }
      if (!bucketRow) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'r2_bucket not configured — register R2 credentials in Admin settings.')
      }
      if (!publicUrlRow) {
        throw new ToolError('TOOL_CREDENTIAL_INVALID', 'r2_public_url not configured — register R2 credentials in Admin settings.')
      }

      const [accountId, accessKeyId, secretAccessKey, bucket, publicUrlBase] = await Promise.all([
        decrypt(accountIdRow.encryptedValue),
        decrypt(accessKeyRow.encryptedValue),
        decrypt(secretKeyRow.encryptedValue),
        decrypt(bucketRow.encryptedValue),
        decrypt(publicUrlRow.encryptedValue),
      ])

      // Decode base64 content
      const fileBuffer = Buffer.from(content, 'base64')

      // Configure S3 client with Cloudflare R2 endpoint
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })

      // Upload via PutObjectCommand
      await callExternalApi('Cloudflare R2', async () => {
        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: fileBuffer,
          ContentType: contentType,
        })
        const resp = await s3.send(cmd)
        // S3 client throws on non-2xx status — map to our error format if needed
        if (resp.$metadata.httpStatusCode && resp.$metadata.httpStatusCode >= 400) {
          return Promise.reject({ status: resp.$metadata.httpStatusCode })
        }
        return resp
      })

      // Build public CDN URL
      const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${filename}`

      // E17 Step 2: UPDATE on success
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      })

      return publicUrl

    } catch (err) {
      // E17 Step 3: UPDATE on failure (before re-throw)
      const errorCode = err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR'
      await db.updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode,
        durationMs: Date.now() - startTime,
      })
      throw err
    }
  },
}
