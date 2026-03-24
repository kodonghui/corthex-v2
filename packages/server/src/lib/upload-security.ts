/**
 * Story 22.4: File upload security utilities
 * Magic bytes validation + filename sanitization (NFR-S12)
 */

/** Magic byte signatures for file type validation */
const SIGNATURES: Array<{
  mime: string | string[]
  bytes: number[]
  offset?: number
  extra?: { bytes: number[]; offset: number }
}> = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] }, // .PNG
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: ['image/gif'], bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  {
    mime: 'image/webp',
    bytes: [0x52, 0x49, 0x46, 0x46], // RIFF at offset 0
    extra: { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // WEBP at offset 8
  },
  {
    mime: [
      'application/zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    bytes: [0x50, 0x4b, 0x03, 0x04], // PK (ZIP-based)
  },
]

/**
 * Validate file content against expected magic bytes for the given MIME type.
 * Returns true if magic bytes match or if the MIME type has no known signature (text/*, application/json).
 * Returns false if magic bytes mismatch (possible file type spoofing).
 */
export function validateMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  // Text and JSON files have no reliable magic bytes — skip
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return true
  }

  const view = new Uint8Array(buffer)
  if (view.length < 4) return false // Too small to have valid magic bytes

  for (const sig of SIGNATURES) {
    const mimes = Array.isArray(sig.mime) ? sig.mime : [sig.mime]
    if (!mimes.includes(mimeType)) continue

    const offset = sig.offset ?? 0
    const match = sig.bytes.every((b, i) => view[offset + i] === b)
    if (!match) return false

    // Check extra signature (e.g., WebP needs both RIFF + WEBP)
    if (sig.extra) {
      const extraMatch = sig.extra.bytes.every((b, i) => view[sig.extra!.offset + i] === b)
      if (!extraMatch) return false
    }

    return true
  }

  // No signature found for this MIME type — allow (unknown binary format)
  return true
}

/**
 * Sanitize filename to prevent path traversal and other attacks.
 * NFKC normalization converts fullwidth characters (e.g., ／ → /, ＼ → \) before stripping.
 */
export function sanitizeFilename(name: string): string {
  return (
    name
      .normalize('NFKC')
      .replace(/[/\\]/g, '') // Strip path separators
      .replace(/\.\./g, '') // Strip directory traversal
      .replace(/[\x00-\x1f]/g, '') // Strip control characters
      .replace(/^\.+/, '') // Strip leading dots
      .trim() || 'upload'
  )
}
