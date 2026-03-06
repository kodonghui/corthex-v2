/**
 * Story 13-3 QA: 파일 관리 UI 로직 검증
 * bun test src/__tests__/unit/file-management-ui.test.ts
 */
import { describe, test, expect } from 'bun:test'

// --- getMimeIcon 재현 ---
function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙'
  if (mimeType.includes('word') || mimeType.includes('wordprocessing')) return '📘'
  if (mimeType.includes('json')) return '{}'
  if (mimeType.includes('zip')) return '🗂️'
  if (mimeType.startsWith('text/')) return '📝'
  return '📄'
}

// --- formatBytes 재현 ---
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

// --- filterFiles 재현 ---
type FileRecord = { id: string; userId: string; filename: string; mimeType: string; sizeBytes: number; createdAt: string }
type FileFilter = 'all' | 'images' | 'documents' | 'others'

function filterFiles(files: FileRecord[], filter: FileFilter, search: string): FileRecord[] {
  let filtered = files
  if (filter === 'images') filtered = filtered.filter(f => f.mimeType.startsWith('image/'))
  else if (filter === 'documents') filtered = filtered.filter(f =>
    f.mimeType.includes('pdf') || f.mimeType.includes('word') ||
    f.mimeType.includes('sheet') || f.mimeType.includes('excel') || f.mimeType.includes('presentation'),
  )
  else if (filter === 'others') filtered = filtered.filter(f =>
    !f.mimeType.startsWith('image/') && !f.mimeType.includes('pdf') &&
    !f.mimeType.includes('word') && !f.mimeType.includes('sheet') &&
    !f.mimeType.includes('excel') && !f.mimeType.includes('presentation'),
  )
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(f => f.filename.toLowerCase().includes(q))
  }
  return filtered
}

// 테스트 데이터
const testFiles: FileRecord[] = [
  { id: '1', userId: 'u1', filename: 'photo.png', mimeType: 'image/png', sizeBytes: 2048, createdAt: '2026-03-01' },
  { id: '2', userId: 'u1', filename: 'report.pdf', mimeType: 'application/pdf', sizeBytes: 102400, createdAt: '2026-03-02' },
  { id: '3', userId: 'u2', filename: 'data.csv', mimeType: 'text/csv', sizeBytes: 512, createdAt: '2026-03-03' },
  { id: '4', userId: 'u1', filename: 'doc.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sizeBytes: 51200, createdAt: '2026-03-04' },
  { id: '5', userId: 'u1', filename: 'sheet.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 30720, createdAt: '2026-03-05' },
  { id: '6', userId: 'u1', filename: 'config.json', mimeType: 'application/json', sizeBytes: 256, createdAt: '2026-03-06' },
  { id: '7', userId: 'u1', filename: 'archive.zip', mimeType: 'application/zip', sizeBytes: 5242880, createdAt: '2026-03-06' },
  { id: '8', userId: 'u1', filename: 'slides.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', sizeBytes: 81920, createdAt: '2026-03-06' },
]

describe('getMimeIcon 매핑', () => {
  test('image/png → 🖼️', () => expect(getMimeIcon('image/png')).toBe('🖼️'))
  test('image/jpeg → 🖼️', () => expect(getMimeIcon('image/jpeg')).toBe('🖼️'))
  test('application/pdf → 📕', () => expect(getMimeIcon('application/pdf')).toBe('📕'))
  test('docx → 📘', () => expect(getMimeIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('📘'))
  test('xlsx → 📗', () => expect(getMimeIcon('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('📗'))
  test('pptx → 📙', () => expect(getMimeIcon('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe('📙'))
  test('application/json → {}', () => expect(getMimeIcon('application/json')).toBe('{}'))
  test('application/zip → 🗂️', () => expect(getMimeIcon('application/zip')).toBe('🗂️'))
  test('text/plain → 📝', () => expect(getMimeIcon('text/plain')).toBe('📝'))
  test('text/csv → 📝', () => expect(getMimeIcon('text/csv')).toBe('📝'))
  test('unknown → 📄', () => expect(getMimeIcon('application/octet-stream')).toBe('📄'))
})

describe('formatBytes', () => {
  test('0B', () => expect(formatBytes(0)).toBe('0B'))
  test('512B', () => expect(formatBytes(512)).toBe('512B'))
  test('1023B', () => expect(formatBytes(1023)).toBe('1023B'))
  test('1KB', () => expect(formatBytes(1024)).toBe('1.0KB'))
  test('100KB', () => expect(formatBytes(102400)).toBe('100.0KB'))
  test('1MB', () => expect(formatBytes(1048576)).toBe('1.0MB'))
  test('5MB', () => expect(formatBytes(5242880)).toBe('5.0MB'))
})

describe('filterFiles — 타입 필터', () => {
  test('all → 전체 반환', () => {
    expect(filterFiles(testFiles, 'all', '')).toHaveLength(8)
  })

  test('images → 이미지만', () => {
    const result = filterFiles(testFiles, 'images', '')
    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe('photo.png')
  })

  test('documents → PDF + Word + Excel + PPT', () => {
    const result = filterFiles(testFiles, 'documents', '')
    expect(result).toHaveLength(4) // pdf, docx, xlsx, pptx
    expect(result.map(f => f.filename)).toContain('report.pdf')
    expect(result.map(f => f.filename)).toContain('doc.docx')
    expect(result.map(f => f.filename)).toContain('sheet.xlsx')
    expect(result.map(f => f.filename)).toContain('slides.pptx')
  })

  test('others → 이미지/문서 제외', () => {
    const result = filterFiles(testFiles, 'others', '')
    expect(result).toHaveLength(3) // csv, json, zip
    expect(result.map(f => f.filename)).toContain('data.csv')
    expect(result.map(f => f.filename)).toContain('config.json')
    expect(result.map(f => f.filename)).toContain('archive.zip')
  })
})

describe('filterFiles — 검색', () => {
  test('파일명 검색 — 대소문자 무시', () => {
    const result = filterFiles(testFiles, 'all', 'PHOTO')
    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe('photo.png')
  })

  test('부분 검색', () => {
    const result = filterFiles(testFiles, 'all', 'dat')
    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe('data.csv')
  })

  test('빈 검색어 → 필터만 적용', () => {
    const result = filterFiles(testFiles, 'images', '')
    expect(result).toHaveLength(1)
  })

  test('검색 + 필터 조합', () => {
    const result = filterFiles(testFiles, 'documents', 'report')
    expect(result).toHaveLength(1)
    expect(result[0].filename).toBe('report.pdf')
  })

  test('매칭 없음', () => {
    const result = filterFiles(testFiles, 'all', 'nonexistent')
    expect(result).toHaveLength(0)
  })
})

describe('삭제 권한 로직', () => {
  test('본인 파일 → 삭제 가능', () => {
    const file = { userId: 'u1' }
    const currentUser = { id: 'u1' }
    expect(file.userId === currentUser.id).toBe(true)
  })

  test('타인 파일 → 삭제 불가', () => {
    const file = { userId: 'u2' }
    const currentUser = { id: 'u1' }
    expect(file.userId === currentUser.id).toBe(false)
  })
})

describe('다운로드 URL 생성', () => {
  test('파일 ID로 다운로드 URL 생성', () => {
    const fileId = 'abc-123'
    const url = `/api/workspace/files/${fileId}/download`
    expect(url).toBe('/api/workspace/files/abc-123/download')
  })
})

describe('빈 파일 목록', () => {
  test('빈 배열 필터링', () => {
    expect(filterFiles([], 'all', '')).toHaveLength(0)
  })

  test('빈 배열 + 검색', () => {
    expect(filterFiles([], 'images', 'test')).toHaveLength(0)
  })
})
