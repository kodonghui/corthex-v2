import { mkdirSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const UPLOADS_ROOT = join(process.cwd(), 'uploads')

/**
 * 파일을 로컬 디스크에 저장하고 상대 경로 반환
 * 저장 경로: uploads/{companyId}/{yyyy-mm}/{uuid}.{ext}
 */
export async function saveFile(
  buffer: ArrayBuffer,
  filename: string,
  companyId: string,
): Promise<{ storagePath: string; savedFilename: string }> {
  const now = new Date()
  const monthDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const ext = filename.includes('.') ? filename.split('.').pop() || 'bin' : 'bin'
  const savedFilename = `${randomUUID()}.${ext}`
  const relativePath = `${companyId}/${monthDir}/${savedFilename}`
  const fullDir = join(UPLOADS_ROOT, companyId, monthDir)

  mkdirSync(fullDir, { recursive: true })
  await Bun.write(join(UPLOADS_ROOT, relativePath), buffer)

  return { storagePath: relativePath, savedFilename }
}

/**
 * storagePath에서 절대 경로 반환
 */
export function getFilePath(storagePath: string): string {
  const fullPath = join(UPLOADS_ROOT, storagePath)
  if (!fullPath.startsWith(UPLOADS_ROOT)) throw new Error('Invalid storage path')
  return fullPath
}

/**
 * 파일 삭제 (존재하면)
 */
export function deleteFile(storagePath: string): void {
  const fullPath = join(UPLOADS_ROOT, storagePath)
  if (!fullPath.startsWith(UPLOADS_ROOT)) throw new Error('Invalid storage path')
  if (existsSync(fullPath)) {
    unlinkSync(fullPath)
  }
}
