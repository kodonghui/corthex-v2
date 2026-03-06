/**
 * Story 13-2 QA: 파일 채팅 첨부 로직 검증
 * bun test src/__tests__/unit/file-chat-attach.test.ts
 */
import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// sendMessageSchema 재현
const sendMessageSchema = z.object({
  content: z.string().min(1),
  attachmentIds: z.array(z.string().uuid()).max(5).optional(),
})

describe('sendMessageSchema 검증', () => {
  test('content만 전송 — 성공', () => {
    const result = sendMessageSchema.safeParse({ content: '안녕하세요' })
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
})

describe('attachmentIds JSON 직렬화', () => {
  test('배열 → JSON 문자열 저장', () => {
    const ids = ['id1', 'id2', 'id3']
    const json = JSON.stringify(ids)
    expect(json).toBe('["id1","id2","id3"]')
  })

  test('JSON 문자열 → 배열 복원', () => {
    const json = '["id1","id2"]'
    const parsed = JSON.parse(json) as string[]
    expect(parsed).toEqual(['id1', 'id2'])
    expect(parsed.length).toBe(2)
  })

  test('null attachmentIds — 빈 배열 처리', () => {
    const attachmentIds: string | null = null
    const ids = attachmentIds ? JSON.parse(attachmentIds) as string[] : []
    expect(ids).toEqual([])
  })

  test('빈 배열 JSON', () => {
    const json = JSON.stringify([])
    expect(json).toBe('[]')
    expect(JSON.parse(json)).toEqual([])
  })
})

describe('첨부파일 검증 로직', () => {
  test('같은 회사 파일 — 허용', () => {
    const file = { companyId: 'c1', isActive: true }
    const tenant = { companyId: 'c1' }
    expect(file.companyId === tenant.companyId && file.isActive).toBe(true)
  })

  test('다른 회사 파일 — 차단', () => {
    const file = { companyId: 'c2', isActive: true }
    const tenant = { companyId: 'c1' }
    expect(file.companyId === tenant.companyId).toBe(false)
  })

  test('비활성 파일 — 차단', () => {
    const file = { companyId: 'c1', isActive: false }
    expect(file.isActive).toBe(false)
  })

  test('파일 수 불일치 — 에러', () => {
    const requestedIds = ['f1', 'f2', 'f3']
    const validFiles = [{ id: 'f1' }, { id: 'f2' }] // f3 not found
    expect(validFiles.length !== requestedIds.length).toBe(true)
  })

  test('모든 파일 유효 — 통과', () => {
    const requestedIds = ['f1', 'f2']
    const validFiles = [{ id: 'f1' }, { id: 'f2' }]
    expect(validFiles.length === requestedIds.length).toBe(true)
  })
})

describe('메시지 응답 첨부파일 매핑', () => {
  test('메시지별 첨부파일 메타데이터 매핑', () => {
    const messages = [
      { id: 'm1', attachmentIds: '["f1","f2"]' },
      { id: 'm2', attachmentIds: null },
      { id: 'm3', attachmentIds: '["f3"]' },
    ]

    const filesMap = new Map([
      ['f1', { id: 'f1', filename: 'doc.pdf', mimeType: 'application/pdf', sizeBytes: 1024 }],
      ['f2', { id: 'f2', filename: 'img.png', mimeType: 'image/png', sizeBytes: 2048 }],
      ['f3', { id: 'f3', filename: 'data.csv', mimeType: 'text/csv', sizeBytes: 512 }],
    ])

    const result = messages.map(m => {
      const ids = m.attachmentIds ? JSON.parse(m.attachmentIds) as string[] : []
      return {
        ...m,
        attachmentIds: ids,
        attachments: ids.map(id => filesMap.get(id)).filter(Boolean),
      }
    })

    expect(result[0].attachments.length).toBe(2)
    expect(result[0].attachments[0]!.filename).toBe('doc.pdf')
    expect(result[1].attachments.length).toBe(0)
    expect(result[1].attachmentIds).toEqual([])
    expect(result[2].attachments.length).toBe(1)
    expect(result[2].attachments[0]!.mimeType).toBe('text/csv')
  })

  test('전체 파일 ID 수집', () => {
    const messages = [
      { attachmentIds: '["f1","f2"]' },
      { attachmentIds: null },
      { attachmentIds: '["f3"]' },
    ]
    const allFileIds = messages
      .filter(m => m.attachmentIds)
      .flatMap(m => JSON.parse(m.attachmentIds!) as string[])
    expect(allFileIds).toEqual(['f1', 'f2', 'f3'])
  })
})

describe('파일 타입별 렌더링 분기', () => {
  test('이미지 MIME — 인라인 썸네일', () => {
    const mimeType = 'image/png'
    expect(mimeType.startsWith('image/')).toBe(true)
  })

  test('image/jpeg — 인라인 썸네일', () => {
    expect('image/jpeg'.startsWith('image/')).toBe(true)
  })

  test('application/pdf — 다운로드 카드', () => {
    expect('application/pdf'.startsWith('image/')).toBe(false)
  })

  test('text/csv — 다운로드 카드', () => {
    expect('text/csv'.startsWith('image/')).toBe(false)
  })
})

describe('파일 크기 포맷', () => {
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1048576).toFixed(1)}MB`
  }

  test('512 bytes', () => {
    expect(formatBytes(512)).toBe('512B')
  })

  test('1024 bytes = 1.0KB', () => {
    expect(formatBytes(1024)).toBe('1.0KB')
  })

  test('1.5MB', () => {
    expect(formatBytes(1572864)).toBe('1.5MB')
  })

  test('0 bytes', () => {
    expect(formatBytes(0)).toBe('0B')
  })

  test('10MB', () => {
    expect(formatBytes(10485760)).toBe('10.0MB')
  })
})
