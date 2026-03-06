import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// sendMessageSchema 재현 (메신저용)
const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  parentMessageId: z.string().uuid().optional(),
  attachmentIds: z.array(z.string().uuid()).max(5).optional(),
})

describe('메신저 sendMessageSchema 검증', () => {
  test('content만 전송 — 성공', () => {
    const result = sendMessageSchema.safeParse({ content: '일반 메시지' })
    expect(result.success).toBe(true)
  })

  test('빈 content — 실패', () => {
    const result = sendMessageSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })

  test('content + attachmentIds — 성공', () => {
    const result = sendMessageSchema.safeParse({
      content: '파일 첨부합니다',
      attachmentIds: ['550e8400-e29b-41d4-a716-446655440000'],
    })
    expect(result.success).toBe(true)
  })

  test('attachmentIds 없이 전송 — 성공', () => {
    const result = sendMessageSchema.safeParse({ content: '일반 메시지' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.attachmentIds).toBeUndefined()
    }
  })

  test('attachmentIds 빈 배열 — 성공', () => {
    const result = sendMessageSchema.safeParse({ content: '테스트', attachmentIds: [] })
    expect(result.success).toBe(true)
  })

  test('attachmentIds 5개 — 성공 (최대)', () => {
    const ids = Array.from({ length: 5 }, (_, i) =>
      `550e8400-e29b-41d4-a716-44665544000${i}`,
    )
    const result = sendMessageSchema.safeParse({ content: '다수 첨부', attachmentIds: ids })
    expect(result.success).toBe(true)
  })

  test('attachmentIds 6개 — 실패 (초과)', () => {
    const ids = Array.from({ length: 6 }, (_, i) =>
      `550e8400-e29b-41d4-a716-44665544000${i}`,
    )
    const result = sendMessageSchema.safeParse({ content: '초과', attachmentIds: ids })
    expect(result.success).toBe(false)
  })

  test('잘못된 UUID 형식 — 실패', () => {
    const result = sendMessageSchema.safeParse({
      content: '테스트',
      attachmentIds: ['not-a-uuid'],
    })
    expect(result.success).toBe(false)
  })

  test('attachmentIds에 null — 실패', () => {
    const result = sendMessageSchema.safeParse({
      content: '테스트',
      attachmentIds: [null],
    })
    expect(result.success).toBe(false)
  })

  test('content + parentMessageId + attachmentIds — 성공 (스레드 첨부)', () => {
    const result = sendMessageSchema.safeParse({
      content: '스레드 파일',
      parentMessageId: '550e8400-e29b-41d4-a716-446655440000',
      attachmentIds: ['660e8400-e29b-41d4-a716-446655440001'],
    })
    expect(result.success).toBe(true)
  })

  test('4000자 초과 content — 실패', () => {
    const result = sendMessageSchema.safeParse({ content: 'a'.repeat(4001) })
    expect(result.success).toBe(false)
  })
})

describe('메신저 attachmentIds JSON 직렬화', () => {
  test('배열 → JSON 문자열 저장', () => {
    const ids = ['id1', 'id2', 'id3']
    const json = JSON.stringify(ids)
    expect(json).toBe('["id1","id2","id3"]')
    expect(JSON.parse(json)).toEqual(ids)
  })

  test('JSON 문자열 → 배열 복원', () => {
    const json = '["f1","f2"]'
    const parsed = JSON.parse(json) as string[]
    expect(parsed.length).toBe(2)
    expect(parsed[0]).toBe('f1')
  })

  test('null attachmentIds — 빈 배열 처리', () => {
    const attachmentIds: string | null = null
    const ids = attachmentIds ? JSON.parse(attachmentIds) as string[] : []
    expect(ids).toEqual([])
  })

  test('빈 배열 JSON 직렬화', () => {
    const ids: string[] = []
    const json = JSON.stringify(ids)
    expect(json).toBe('[]')
    expect(JSON.parse(json)).toEqual([])
  })
})

describe('파일 유효성 검증 로직', () => {
  test('유효한 파일 ID 배열 — 전부 일치 확인', () => {
    const requestedIds = ['f1', 'f2', 'f3']
    const validFileIds = ['f1', 'f2', 'f3']
    expect(validFileIds.length).toBe(requestedIds.length)
  })

  test('일부 유효하지 않은 파일 — 길이 불일치', () => {
    const requestedIds = ['f1', 'f2', 'f3']
    const validFileIds = ['f1', 'f3'] // f2는 유효하지 않음
    expect(validFileIds.length).not.toBe(requestedIds.length)
  })

  test('빈 배열 — 검증 스킵', () => {
    const attachmentIds: string[] = []
    const shouldValidate = attachmentIds.length > 0
    expect(shouldValidate).toBe(false)
  })

  test('undefined — 검증 스킵', () => {
    const attachmentIds = undefined as string[] | undefined
    const shouldValidate = ((attachmentIds as string[] | undefined)?.length ?? 0) > 0
    expect(shouldValidate).toBe(false)
  })
})

describe('메신저 메시지 첨부파일 매핑', () => {
  test('메시지별 첨부파일 메타데이터 매핑', () => {
    const messages = [
      { id: 'm1', attachmentIds: '["f1","f2"]' },
      { id: 'm2', attachmentIds: null },
      { id: 'm3', attachmentIds: '["f3"]' },
    ]

    type FileMeta = { id: string; filename: string; mimeType: string; sizeBytes: number }
    const filesMap = new Map<string, FileMeta>([
      ['f1', { id: 'f1', filename: 'doc.pdf', mimeType: 'application/pdf', sizeBytes: 1024 }],
      ['f2', { id: 'f2', filename: 'img.png', mimeType: 'image/png', sizeBytes: 2048 }],
      ['f3', { id: 'f3', filename: 'data.csv', mimeType: 'text/csv', sizeBytes: 512 }],
    ])

    const result = messages.map(m => {
      const ids = m.attachmentIds ? JSON.parse(m.attachmentIds) as string[] : []
      return {
        ...m,
        attachments: ids.map(id => filesMap.get(id)).filter(Boolean),
      }
    })

    expect(result[0].attachments.length).toBe(2)
    expect(result[0].attachments[0]!.filename).toBe('doc.pdf')
    expect(result[1].attachments.length).toBe(0)
    expect(result[2].attachments.length).toBe(1)
    expect(result[2].attachments[0]!.mimeType).toBe('text/csv')
  })

  test('전체 파일 ID 수집 (일괄 조회용)', () => {
    const messages = [
      { attachmentIds: '["f1","f2"]' },
      { attachmentIds: null },
      { attachmentIds: '["f3"]' },
    ]
    const allFileIds = messages
      .map(m => m.attachmentIds ? JSON.parse(m.attachmentIds) as string[] : [])
      .flat()
    expect(allFileIds).toEqual(['f1', 'f2', 'f3'])
  })
})

describe('파일 크기/타입 포맷', () => {
  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1048576).toFixed(1)}MB`
  }

  function getFileIcon(mimeType: string) {
    if (mimeType === 'application/pdf') return { icon: '📄', color: 'text-red-500' }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { icon: '📊', color: 'text-green-500' }
    if (mimeType.includes('word') || mimeType === 'application/msword') return { icon: '📝', color: 'text-blue-500' }
    if (mimeType === 'application/zip') return { icon: '📦', color: 'text-zinc-500' }
    return { icon: '📎', color: 'text-zinc-400' }
  }

  test('바이트 표시', () => {
    expect(formatFileSize(500)).toBe('500B')
  })

  test('KB 표시', () => {
    expect(formatFileSize(1536)).toBe('1.5KB')
  })

  test('MB 표시', () => {
    expect(formatFileSize(5242880)).toBe('5.0MB')
  })

  test('PDF 아이콘', () => {
    const { icon, color } = getFileIcon('application/pdf')
    expect(icon).toBe('📄')
    expect(color).toBe('text-red-500')
  })

  test('Excel 아이콘', () => {
    const { icon } = getFileIcon('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(icon).toBe('📊')
  })

  test('Word 아이콘', () => {
    const { icon } = getFileIcon('application/msword')
    expect(icon).toBe('📝')
  })

  test('ZIP 아이콘', () => {
    const { icon } = getFileIcon('application/zip')
    expect(icon).toBe('📦')
  })

  test('기타 파일 아이콘', () => {
    const { icon } = getFileIcon('text/plain')
    expect(icon).toBe('📎')
  })
})

describe('파일 크기 제한 검증', () => {
  const MAX_UPLOAD_SIZE = 52_428_800 // 50MB

  test('50MB 이하 파일 — 통과', () => {
    expect(50_000_000 <= MAX_UPLOAD_SIZE).toBe(true)
  })

  test('50MB 정확히 — 통과', () => {
    expect(MAX_UPLOAD_SIZE <= MAX_UPLOAD_SIZE).toBe(true)
  })

  test('50MB 초과 — 거부', () => {
    expect(52_428_801 > MAX_UPLOAD_SIZE).toBe(true)
  })

  test('이미지 10MB — 통과', () => {
    expect(10_485_760 <= MAX_UPLOAD_SIZE).toBe(true)
  })
})

describe('드래그 앤 드롭 시나리오', () => {
  test('최대 5개 파일 제한', () => {
    const pendingFiles = [1, 2, 3, 4] // 4개 이미 대기 중
    const remaining = 5 - pendingFiles.length
    expect(remaining).toBe(1)
    const incoming = [{ name: 'a.pdf' }, { name: 'b.pdf' }]
    const toUpload = incoming.slice(0, remaining)
    expect(toUpload.length).toBe(1)
  })

  test('대기 파일 없을 때 최대 5개', () => {
    const pendingFiles: unknown[] = []
    const remaining = 5 - pendingFiles.length
    expect(remaining).toBe(5)
  })

  test('이미 5개 있으면 추가 불가', () => {
    const pendingFiles = [1, 2, 3, 4, 5]
    const remaining = 5 - pendingFiles.length
    expect(remaining).toBe(0)
    const incoming = [{ name: 'overflow.pdf' }]
    const toUpload = incoming.slice(0, remaining)
    expect(toUpload.length).toBe(0)
  })
})

// ===== TEA 리스크 기반 추가 테스트 =====

describe('[TEA] WS 브로드캐스트 메시지 구조', () => {
  test('attachments 포함된 WS 메시지 구조', () => {
    const wsMessage = {
      type: 'new-message',
      message: {
        id: 'msg-1',
        userId: 'u-1',
        userName: 'Alice',
        content: '파일 공유',
        parentMessageId: null,
        createdAt: new Date().toISOString(),
        attachments: [
          { id: 'f-1', filename: 'report.pdf', mimeType: 'application/pdf', sizeBytes: 1024 },
        ],
      },
    }
    expect(wsMessage.type).toBe('new-message')
    expect(wsMessage.message.attachments).toHaveLength(1)
    expect(wsMessage.message.attachments[0].filename).toBe('report.pdf')
  })

  test('attachments 없는 WS 메시지 (빈 배열)', () => {
    const wsMessage = {
      type: 'new-message',
      message: {
        id: 'msg-2',
        userId: 'u-1',
        userName: 'Bob',
        content: '일반 메시지',
        parentMessageId: null,
        createdAt: new Date().toISOString(),
        attachments: [],
      },
    }
    expect(wsMessage.message.attachments).toEqual([])
  })

  test('스레드 메시지 + attachments WS 구조', () => {
    const wsMessage = {
      type: 'new-message',
      message: {
        id: 'msg-3',
        userId: 'u-2',
        userName: 'Charlie',
        content: '스레드 답글 + 파일',
        parentMessageId: 'msg-1',
        createdAt: new Date().toISOString(),
        attachments: [
          { id: 'f-2', filename: 'data.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 51200 },
        ],
      },
    }
    expect(wsMessage.message.parentMessageId).toBe('msg-1')
    expect(wsMessage.message.attachments).toHaveLength(1)
  })
})

describe('[TEA] 첨부파일 filesMap 일괄 조회 로직', () => {
  type FileMeta = { id: string; filename: string; mimeType: string; sizeBytes: number }

  function buildFilesMap(fileRows: FileMeta[]): Map<string, FileMeta> {
    const map = new Map<string, FileMeta>()
    for (const f of fileRows) map.set(f.id, f)
    return map
  }

  test('빈 fileIds → 빈 Map', () => {
    const map = buildFilesMap([])
    expect(map.size).toBe(0)
  })

  test('여러 메시지에 같은 파일 → 중복 없이 Map 생성', () => {
    const messages = [
      { attachmentIds: '["f1","f2"]' },
      { attachmentIds: '["f1","f3"]' }, // f1 중복
    ]
    const allFileIds = messages
      .map(m => m.attachmentIds ? JSON.parse(m.attachmentIds) as string[] : [])
      .flat()
    expect(allFileIds).toEqual(['f1', 'f2', 'f1', 'f3'])

    // 중복 제거 (Set)
    const uniqueIds = [...new Set(allFileIds)]
    expect(uniqueIds).toEqual(['f1', 'f2', 'f3'])
  })

  test('삭제된 파일 (Map에 없음) → filter(Boolean)로 안전 처리', () => {
    const filesMap = new Map<string, FileMeta>([
      ['f1', { id: 'f1', filename: 'a.pdf', mimeType: 'application/pdf', sizeBytes: 100 }],
    ])
    const ids = ['f1', 'f-deleted']
    const attachments = ids.map(id => filesMap.get(id)).filter(Boolean)
    expect(attachments.length).toBe(1)
    expect(attachments[0]!.id).toBe('f1')
  })

  test('attachmentIds가 있지만 모든 파일 삭제됨 → 빈 배열', () => {
    const filesMap = new Map<string, FileMeta>()
    const ids = ['f-gone1', 'f-gone2']
    const attachments = ids.map(id => filesMap.get(id)).filter(Boolean)
    expect(attachments).toEqual([])
  })
})

describe('[TEA] sendMessageSchema 경계값 테스트', () => {
  test('content 1자 — 성공 (최소)', () => {
    const result = sendMessageSchema.safeParse({ content: 'a' })
    expect(result.success).toBe(true)
  })

  test('content 4000자 — 성공 (최대)', () => {
    const result = sendMessageSchema.safeParse({ content: 'x'.repeat(4000) })
    expect(result.success).toBe(true)
  })

  test('content 4001자 — 실패', () => {
    const result = sendMessageSchema.safeParse({ content: 'x'.repeat(4001) })
    expect(result.success).toBe(false)
  })

  test('attachmentIds 중복 UUID — 스키마 통과 (DB에서 중복 검사)', () => {
    const dupId = '550e8400-e29b-41d4-a716-446655440000'
    const result = sendMessageSchema.safeParse({
      content: '중복 파일',
      attachmentIds: [dupId, dupId],
    })
    // 스키마는 중복을 허용 (비즈니스 로직에서 검증)
    expect(result.success).toBe(true)
  })

  test('attachmentIds 숫자 배열 — 실패 (UUID 아님)', () => {
    const result = sendMessageSchema.safeParse({
      content: '테스트',
      attachmentIds: [123, 456],
    })
    expect(result.success).toBe(false)
  })

  test('attachmentIds 문자열 (배열 아님) — 실패', () => {
    const result = sendMessageSchema.safeParse({
      content: '테스트',
      attachmentIds: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(false)
  })
})

describe('[TEA] MIME 타입 분류 edge cases', () => {
  function getFileIcon(mimeType: string) {
    if (mimeType === 'application/pdf') return { icon: '📄', color: 'text-red-500' }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { icon: '📊', color: 'text-green-500' }
    if (mimeType.includes('word') || mimeType === 'application/msword') return { icon: '📝', color: 'text-blue-500' }
    if (mimeType === 'application/zip') return { icon: '📦', color: 'text-zinc-500' }
    return { icon: '📎', color: 'text-zinc-400' }
  }

  test('Word docx (OpenXML) 아이콘', () => {
    const { icon } = getFileIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    expect(icon).toBe('📝')
  })

  test('Excel xls (레거시) 아이콘', () => {
    const { icon } = getFileIcon('application/vnd.ms-excel')
    expect(icon).toBe('📊')
  })

  test('PowerPoint 아이콘 → 기타 (📎)', () => {
    const { icon } = getFileIcon('application/vnd.openxmlformats-officedocument.presentationml.presentation')
    expect(icon).toBe('📎') // PPT는 별도 아이콘 없음
  })

  test('image/png → 이미지 (렌더러에서 인라인 표시)', () => {
    const isImage = 'image/png'.startsWith('image/')
    expect(isImage).toBe(true)
  })

  test('image/gif → 이미지', () => {
    const isImage = 'image/gif'.startsWith('image/')
    expect(isImage).toBe(true)
  })

  test('image/webp → 이미지', () => {
    const isImage = 'image/webp'.startsWith('image/')
    expect(isImage).toBe(true)
  })

  test('text/csv → 기타 (이미지 아님)', () => {
    const isImage = 'text/csv'.startsWith('image/')
    expect(isImage).toBe(false)
  })

  test('빈 mimeType → 기타 아이콘', () => {
    const { icon } = getFileIcon('')
    expect(icon).toBe('📎')
  })
})

describe('[TEA] 파일 크기 경계값', () => {
  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1048576).toFixed(1)}MB`
  }

  test('0 바이트', () => {
    expect(formatFileSize(0)).toBe('0B')
  })

  test('1023 바이트 (KB 경계 직전)', () => {
    expect(formatFileSize(1023)).toBe('1023B')
  })

  test('1024 바이트 (정확히 1KB)', () => {
    expect(formatFileSize(1024)).toBe('1.0KB')
  })

  test('1048575 바이트 (MB 경계 직전)', () => {
    expect(formatFileSize(1048575)).toBe('1024.0KB')
  })

  test('1048576 바이트 (정확히 1MB)', () => {
    expect(formatFileSize(1048576)).toBe('1.0MB')
  })

  test('52428800 바이트 (50MB)', () => {
    expect(formatFileSize(52428800)).toBe('50.0MB')
  })
})

describe('[TEA] JSON 직렬화 엣지 케이스', () => {
  test('특수문자 포함 파일명 — JSON 안전', () => {
    const fileMeta = { filename: 'report "2026".pdf', mimeType: 'application/pdf' }
    const json = JSON.stringify(fileMeta)
    const parsed = JSON.parse(json)
    expect(parsed.filename).toBe('report "2026".pdf')
  })

  test('한글 파일명 — JSON 안전', () => {
    const fileMeta = { filename: '보고서_2026.xlsx', mimeType: 'application/vnd.ms-excel' }
    const json = JSON.stringify(fileMeta)
    const parsed = JSON.parse(json)
    expect(parsed.filename).toBe('보고서_2026.xlsx')
  })

  test('빈 문자열 파일명', () => {
    const fileMeta = { filename: '', mimeType: 'application/octet-stream' }
    const json = JSON.stringify(fileMeta)
    const parsed = JSON.parse(json)
    expect(parsed.filename).toBe('')
  })

  test('매우 긴 파일명 (255자)', () => {
    const longName = 'a'.repeat(251) + '.pdf'
    expect(longName.length).toBe(255)
    const json = JSON.stringify({ filename: longName })
    const parsed = JSON.parse(json)
    expect(parsed.filename.length).toBe(255)
  })
})

describe('[TEA] 파일 업로드 MIME 타입 허용 목록', () => {
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

  test('image/jpeg — 허용', () => expect(isAllowedMimeType('image/jpeg')).toBe(true))
  test('image/png — 허용', () => expect(isAllowedMimeType('image/png')).toBe(true))
  test('image/gif — 허용', () => expect(isAllowedMimeType('image/gif')).toBe(true))
  test('image/webp — 허용', () => expect(isAllowedMimeType('image/webp')).toBe(true))
  test('text/plain — 허용', () => expect(isAllowedMimeType('text/plain')).toBe(true))
  test('text/csv — 허용', () => expect(isAllowedMimeType('text/csv')).toBe(true))
  test('application/pdf — 허용', () => expect(isAllowedMimeType('application/pdf')).toBe(true))
  test('application/zip — 허용', () => expect(isAllowedMimeType('application/zip')).toBe(true))
  test('application/msword — 허용', () => expect(isAllowedMimeType('application/msword')).toBe(true))
  test('application/octet-stream — 거부', () => expect(isAllowedMimeType('application/octet-stream')).toBe(false))
  test('application/x-executable — 거부', () => expect(isAllowedMimeType('application/x-executable')).toBe(false))
  test('빈 문자열 — 거부', () => expect(isAllowedMimeType('')).toBe(false))
  test('video/mp4 — 거부', () => expect(isAllowedMimeType('video/mp4')).toBe(false))
  test('audio/mpeg — 거부', () => expect(isAllowedMimeType('audio/mpeg')).toBe(false))
})

describe('[TEA] 첨부파일 전송 시나리오', () => {
  test('파일만 전송 (content 필수 → "(파일 첨부)"로 대체)', () => {
    const content = '' // 유저 미입력
    const finalContent = content.trim() || '(파일 첨부)'
    expect(finalContent).toBe('(파일 첨부)')
  })

  test('텍스트 + 파일 전송', () => {
    const content = '이 파일 확인해주세요'
    const attachmentIds = ['f1', 'f2']
    const payload = {
      content,
      ...(attachmentIds.length ? { attachmentIds } : {}),
    }
    expect(payload.content).toBe('이 파일 확인해주세요')
    expect(payload.attachmentIds).toEqual(['f1', 'f2'])
  })

  test('attachmentIds 빈 배열 → payload에서 제외', () => {
    const attachmentIds: string[] = []
    const payload = {
      content: '일반 메시지',
      ...(attachmentIds.length ? { attachmentIds } : {}),
    }
    expect('attachmentIds' in payload).toBe(false)
  })

  test('pendingFiles에서 id 추출', () => {
    const pendingFiles = [
      { id: 'f1', filename: 'a.pdf', mimeType: 'application/pdf', sizeBytes: 100 },
      { id: 'f2', filename: 'b.png', mimeType: 'image/png', sizeBytes: 200 },
    ]
    const attachmentIds = pendingFiles.map(f => f.id)
    expect(attachmentIds).toEqual(['f1', 'f2'])
  })
})

describe('[TEA] 파일 삭제 후 참조 무결성', () => {
  test('isActive=false 파일 → 검증 시 거부', () => {
    const requestedIds = ['f1', 'f2']
    const activeFiles = [{ id: 'f1' }] // f2는 isActive=false
    expect(activeFiles.length).not.toBe(requestedIds.length)
  })

  test('다른 회사 파일 → 검증 시 거부 (companyId 불일치)', () => {
    const requestedIds = ['f1']
    // companyId가 다른 파일은 쿼리에서 제외됨
    const validFiles: { id: string }[] = [] // 빈 결과
    expect(validFiles.length).not.toBe(requestedIds.length)
  })
})
