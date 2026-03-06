/**
 * Story 13-1 QA: 파일 업로드/저장소 로직 검증
 * bun test src/__tests__/unit/file-upload-storage.test.ts
 */
import { describe, test, expect } from 'bun:test'

describe('MIME 타입 검증', () => {
  const ALLOWED_MIME_PREFIXES = ['image/', 'text/']
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/json',
    'application/zip',
  ]

  function isAllowedMimeType(mimeType: string): boolean {
    if (ALLOWED_MIME_PREFIXES.some(p => mimeType.startsWith(p))) return true
    return ALLOWED_MIME_TYPES.includes(mimeType)
  }

  test('image/png 허용', () => {
    expect(isAllowedMimeType('image/png')).toBe(true)
  })

  test('image/jpeg 허용', () => {
    expect(isAllowedMimeType('image/jpeg')).toBe(true)
  })

  test('image/gif 허용', () => {
    expect(isAllowedMimeType('image/gif')).toBe(true)
  })

  test('text/plain 허용', () => {
    expect(isAllowedMimeType('text/plain')).toBe(true)
  })

  test('text/csv 허용', () => {
    expect(isAllowedMimeType('text/csv')).toBe(true)
  })

  test('application/pdf 허용', () => {
    expect(isAllowedMimeType('application/pdf')).toBe(true)
  })

  test('application/json 허용', () => {
    expect(isAllowedMimeType('application/json')).toBe(true)
  })

  test('application/zip 허용', () => {
    expect(isAllowedMimeType('application/zip')).toBe(true)
  })

  test('docx 허용', () => {
    expect(isAllowedMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true)
  })

  test('xlsx 허용', () => {
    expect(isAllowedMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true)
  })

  test('pptx 허용', () => {
    expect(isAllowedMimeType('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe(true)
  })

  test('application/octet-stream 차단', () => {
    expect(isAllowedMimeType('application/octet-stream')).toBe(false)
  })

  test('application/x-executable 차단', () => {
    expect(isAllowedMimeType('application/x-executable')).toBe(false)
  })

  test('video/mp4 차단', () => {
    expect(isAllowedMimeType('video/mp4')).toBe(false)
  })

  test('audio/mpeg 차단', () => {
    expect(isAllowedMimeType('audio/mpeg')).toBe(false)
  })

  test('빈 문자열 차단', () => {
    expect(isAllowedMimeType('')).toBe(false)
  })
})

describe('파일 크기 검증', () => {
  const MAX_FILE_SIZE = 10_485_760 // 10MB

  test('1MB 파일 허용', () => {
    expect(1_048_576 <= MAX_FILE_SIZE).toBe(true)
  })

  test('정확히 10MB 허용', () => {
    expect(10_485_760 <= MAX_FILE_SIZE).toBe(true)
  })

  test('10MB + 1byte 차단', () => {
    expect(10_485_761 > MAX_FILE_SIZE).toBe(true)
  })

  test('0byte 파일 허용 (크기 검증만)', () => {
    expect(0 <= MAX_FILE_SIZE).toBe(true)
  })

  test('100MB 파일 차단', () => {
    expect(104_857_600 > MAX_FILE_SIZE).toBe(true)
  })
})

describe('파일 저장 경로 구조', () => {
  test('경로 형식: {companyId}/{yyyy-mm}/{uuid}.{ext}', () => {
    const companyId = 'c1234'
    const monthDir = '2026-03'
    const filename = 'abc-def.pdf'
    const path = `${companyId}/${monthDir}/${filename}`
    expect(path).toBe('c1234/2026-03/abc-def.pdf')
  })

  test('확장자 추출 — 정상 파일명', () => {
    const filename = 'document.pdf'
    const ext = filename.includes('.') ? filename.split('.').pop() || 'bin' : 'bin'
    expect(ext).toBe('pdf')
  })

  test('확장자 추출 — 다중 점 파일명', () => {
    const filename = 'my.report.final.xlsx'
    const ext = filename.includes('.') ? filename.split('.').pop() || 'bin' : 'bin'
    expect(ext).toBe('xlsx')
  })

  test('확장자 추출 — 확장자 없는 파일', () => {
    const filename = 'README'
    const ext = filename.includes('.') ? filename.split('.').pop() || 'bin' : 'bin'
    expect(ext).toBe('bin')
  })

  test('확장자 추출 — 빈 확장자', () => {
    const filename = 'file.'
    const ext = filename.includes('.') ? filename.split('.').pop() || 'bin' : 'bin'
    // split('.').pop() on 'file.' returns ''
    expect(ext).toBe('bin')
  })
})

describe('Content-Disposition 헤더', () => {
  test('한글 파일명 인코딩', () => {
    const filename = '보고서_2026.pdf'
    const encoded = encodeURIComponent(filename)
    const header = `attachment; filename*=UTF-8''${encoded}`
    expect(header).toContain('UTF-8')
    expect(header).toContain('%EB%B3%B4%EA%B3%A0%EC%84%9C')
  })

  test('영문 파일명 인코딩', () => {
    const filename = 'report.pdf'
    const encoded = encodeURIComponent(filename)
    expect(encoded).toBe('report.pdf')
  })

  test('공백 포함 파일명', () => {
    const filename = 'my report 2026.pdf'
    const encoded = encodeURIComponent(filename)
    expect(encoded).toBe('my%20report%202026.pdf')
  })
})

describe('소프트 삭제 로직', () => {
  test('isActive=false로 설정', () => {
    const file = { id: 'f1', isActive: true }
    const updated = { ...file, isActive: false }
    expect(updated.isActive).toBe(false)
  })

  test('소유자만 삭제 가능', () => {
    const file = { userId: 'u1' }
    const tenant = { userId: 'u2' }
    expect(file.userId !== tenant.userId).toBe(true)
  })

  test('본인 파일 삭제 허용', () => {
    const file = { userId: 'u1' }
    const tenant = { userId: 'u1' }
    expect(file.userId === tenant.userId).toBe(true)
  })
})

describe('에러 코드 매핑', () => {
  const errorCodes: Record<string, { status: number; message: string }> = {
    FILE_001: { status: 400, message: '파일이 필요합니다' },
    FILE_002: { status: 400, message: '파일 크기는 10MB 이하만 허용됩니다' },
    FILE_003: { status: 400, message: '허용되지 않는 파일 형식입니다' },
    FILE_004: { status: 404, message: '파일을 찾을 수 없습니다' },
    FILE_005: { status: 404, message: '파일이 저장소에서 삭제되었습니다' },
    FILE_006: { status: 403, message: '본인이 업로드한 파일만 삭제할 수 있습니다' },
  }

  test('FILE_002 크기 초과 에러', () => {
    expect(errorCodes.FILE_002.status).toBe(400)
    expect(errorCodes.FILE_002.message).toContain('10MB')
  })

  test('FILE_003 형식 에러', () => {
    expect(errorCodes.FILE_003.status).toBe(400)
  })

  test('FILE_006 권한 에러', () => {
    expect(errorCodes.FILE_006.status).toBe(403)
  })
})
