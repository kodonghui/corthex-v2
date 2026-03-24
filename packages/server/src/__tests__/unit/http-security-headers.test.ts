import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Story 22.4: HTTP Security Headers & Rate Limiting tests
 * Tests CSP, HSTS, CORS, rate limiting, magic bytes, filename sanitization.
 */

const SRC_DIR = join(__dirname, '../..')

describe('Story 22.4: HTTP Security Headers & Rate Limiting', () => {
  describe('Task 1: secureHeaders hardening', () => {
    const indexSrc = readFileSync(join(SRC_DIR, 'index.ts'), 'utf-8')

    test('CSP base-uri is self (OWASP baseline)', () => {
      expect(indexSrc).toContain("baseUri: [\"'self'\"]")
    })

    test('CSP form-action is self (prevents form exfiltration)', () => {
      expect(indexSrc).toContain("formAction: [\"'self'\"]")
    })

    test('CSP upgrade-insecure-requests present', () => {
      expect(indexSrc).toContain('upgradeInsecureRequests: []')
    })

    test('HSTS with max-age=31536000 and includeSubDomains', () => {
      expect(indexSrc).toContain("strictTransportSecurity: isProd ? 'max-age=31536000; includeSubDomains' : false")
    })

    test('HSTS disabled in development (false)', () => {
      expect(indexSrc).toContain(': false')
      // Verify the ternary pattern
      expect(indexSrc).toContain("isProd ? 'max-age=31536000; includeSubDomains' : false")
    })

    test('X-Frame-Options via frameAncestors none', () => {
      expect(indexSrc).toContain("frameAncestors: [\"'none'\"]")
    })

    test('CSP script-src has no unsafe-eval or unsafe-inline', () => {
      const scriptSrcLine = indexSrc.split('\n').find(l => l.includes('scriptSrc'))
      expect(scriptSrcLine).toBeTruthy()
      expect(scriptSrcLine).not.toContain('unsafe-eval')
      expect(scriptSrcLine).not.toContain('unsafe-inline')
    })

    test('CSP object-src is none', () => {
      expect(indexSrc).toContain("objectSrc: [\"'none'\"]")
    })

    test('CSP default-src is self', () => {
      expect(indexSrc).toContain("defaultSrc: [\"'self'\"]")
    })
  })

  describe('Task 2: CORS verification', () => {
    const indexSrc = readFileSync(join(SRC_DIR, 'index.ts'), 'utf-8')

    test('production CORS allows only corthex-hq.com (no wildcard)', () => {
      expect(indexSrc).toContain("'https://corthex-hq.com'")
      expect(indexSrc).not.toContain("origin: '*'")
      expect(indexSrc).not.toContain("origin: ['*']")
    })

    test('dev CORS allows localhost only', () => {
      expect(indexSrc).toContain("'http://localhost:5173'")
      expect(indexSrc).toContain("'http://localhost:5174'")
    })

    test('credentials enabled for cookie-based auth', () => {
      expect(indexSrc).toContain('credentials: true')
    })
  })

  describe('Task 3: Rate limiting', () => {
    const rateLimitSrc = readFileSync(join(SRC_DIR, 'middleware/rate-limit.ts'), 'utf-8')

    test('cliRateLimit exported with 10 req/min', () => {
      expect(rateLimitSrc).toContain('export const cliRateLimit')
      expect(rateLimitSrc).toContain('10, 60_000')
      expect(rateLimitSrc).toContain('CRED_RATE')
    })

    test('IP extraction uses cf-connecting-ip first (not spoofable behind Cloudflare)', () => {
      expect(rateLimitSrc).toContain("c.req.header('cf-connecting-ip')")
      // cf-connecting-ip should be checked before x-forwarded-for
      const cfIdx = rateLimitSrc.indexOf('cf-connecting-ip')
      const xffIdx = rateLimitSrc.indexOf('x-forwarded-for')
      expect(cfIdx).toBeGreaterThan(-1)
      expect(xffIdx).toBeGreaterThan(cfIdx) // cf-connecting-ip checked first
    })

    test('x-forwarded-for uses first entry only (split comma)', () => {
      expect(rateLimitSrc).toContain("split(',')[0]")
    })

    test('loginRateLimit unchanged at 5/min', () => {
      expect(rateLimitSrc).toContain('5, 60_000')
    })

    test('apiRateLimit unchanged at 100/min', () => {
      expect(rateLimitSrc).toContain('100, 60_000')
    })

    test('cliRateLimit applied to POST /cli-credentials in credentials.ts', () => {
      const credSrc = readFileSync(join(SRC_DIR, 'routes/admin/credentials.ts'), 'utf-8')
      expect(credSrc).toContain("import { cliRateLimit } from '../../middleware/rate-limit'")
      expect(credSrc).toContain("post('/cli-credentials', cliRateLimit,")
    })
  })

  describe('Task 4: Magic bytes validation', () => {
    test('validateMagicBytes function exists', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      expect(typeof validateMagicBytes).toBe('function')
    })

    test('PDF magic bytes detection', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      // %PDF
      const valid = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]).buffer
      expect(validateMagicBytes(valid, 'application/pdf')).toBe(true)
      // Wrong magic bytes
      const invalid = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer
      expect(validateMagicBytes(invalid, 'application/pdf')).toBe(false)
    })

    test('PNG magic bytes detection', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const valid = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer
      expect(validateMagicBytes(valid, 'image/png')).toBe(true)
      const invalid = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0x00, 0x00, 0x00]).buffer
      expect(validateMagicBytes(invalid, 'image/png')).toBe(false)
    })

    test('JPEG magic bytes detection', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const valid = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x00]).buffer
      expect(validateMagicBytes(valid, 'image/jpeg')).toBe(true)
    })

    test('GIF magic bytes detection', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const valid = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]).buffer
      expect(validateMagicBytes(valid, 'image/gif')).toBe(true)
    })

    test('WebP magic bytes requires both RIFF and WEBP', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      // Valid WebP: RIFF....WEBP
      const valid = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, // file size (placeholder)
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]).buffer
      expect(validateMagicBytes(valid, 'image/webp')).toBe(true)

      // RIFF but not WEBP (e.g., AVI)
      const avi = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00,
        0x41, 0x56, 0x49, 0x20, // AVI
      ]).buffer
      expect(validateMagicBytes(avi, 'image/webp')).toBe(false)
    })

    test('ZIP/Office magic bytes detection', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const valid = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]).buffer
      expect(validateMagicBytes(valid, 'application/zip')).toBe(true)
      expect(validateMagicBytes(valid, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true)
    })

    test('text/* MIME types skip magic bytes (always pass)', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const randomBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]).buffer
      expect(validateMagicBytes(randomBytes, 'text/plain')).toBe(true)
      expect(validateMagicBytes(randomBytes, 'text/csv')).toBe(true)
    })

    test('application/json skips magic bytes', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const randomBytes = new Uint8Array([0x7b, 0x22]).buffer // {"
      expect(validateMagicBytes(randomBytes, 'application/json')).toBe(true)
    })

    test('buffer too small returns false', async () => {
      const { validateMagicBytes } = await import('../../lib/upload-security')
      const tiny = new Uint8Array([0x89]).buffer
      expect(validateMagicBytes(tiny, 'image/png')).toBe(false)
    })
  })

  describe('Task 5: Filename sanitization', () => {
    test('sanitizeFilename function exists', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(typeof sanitizeFilename).toBe('function')
    })

    test('strips forward slashes', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('../../etc/passwd')).toBe('etcpasswd')
    })

    test('strips backslashes', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('windowssystem32')
    })

    test('strips null bytes', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('file\x00.txt')).toBe('file.txt')
    })

    test('strips control characters', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('file\x01\x02\x1f.txt')).toBe('file.txt')
    })

    test('strips leading dots', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('.hidden')).toBe('hidden')
      expect(sanitizeFilename('...hidden')).toBe('hidden')
    })

    test('falls back to "upload" if empty after sanitization', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('../../../')).toBe('upload')
      expect(sanitizeFilename('')).toBe('upload')
      expect(sanitizeFilename('   ')).toBe('upload')
    })

    test('handles Unicode fullwidth path separators (NFKC normalization)', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      // Fullwidth slash ／ (U+FF0F) and fullwidth backslash ＼ (U+FF3C)
      // NFKC normalizes these to ASCII / and \
      const result = sanitizeFilename('..／etc／passwd')
      expect(result).not.toContain('/')
      expect(result).not.toContain('\\')
    })

    test('preserves normal filenames', async () => {
      const { sanitizeFilename } = await import('../../lib/upload-security')
      expect(sanitizeFilename('my-document.pdf')).toBe('my-document.pdf')
      expect(sanitizeFilename('report 2026.xlsx')).toBe('report 2026.xlsx')
    })
  })

  describe('Task 6: SVG exclusion', () => {
    test('files.ts rejects image/svg+xml', () => {
      const filesSrc = readFileSync(join(SRC_DIR, 'routes/workspace/files.ts'), 'utf-8')
      expect(filesSrc).toContain("mimeType === 'image/svg+xml'")
      expect(filesSrc).toContain('return false')
    })
  })

  describe('Integration: upload-security in routes', () => {
    test('files.ts imports validateMagicBytes and sanitizeFilename', () => {
      const filesSrc = readFileSync(join(SRC_DIR, 'routes/workspace/files.ts'), 'utf-8')
      expect(filesSrc).toContain("from '../../lib/upload-security'")
      expect(filesSrc).toContain('validateMagicBytes')
      expect(filesSrc).toContain('sanitizeFilename')
    })

    test('knowledge.ts imports validateMagicBytes and sanitizeFilename', () => {
      const knowledgeSrc = readFileSync(join(SRC_DIR, 'routes/workspace/knowledge.ts'), 'utf-8')
      expect(knowledgeSrc).toContain("from '../../lib/upload-security'")
      expect(knowledgeSrc).toContain('validateMagicBytes')
      expect(knowledgeSrc).toContain('sanitizeFilename')
    })

    test('knowledge.ts uses sanitizeFilename for disk write', () => {
      const knowledgeSrc = readFileSync(join(SRC_DIR, 'routes/workspace/knowledge.ts'), 'utf-8')
      expect(knowledgeSrc).toContain('sanitizeFilename(file.name)')
      expect(knowledgeSrc).toContain('join(uploadDir, safeName)')
    })
  })
})
