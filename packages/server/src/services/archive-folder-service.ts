import { eq, and, isNull, count } from 'drizzle-orm'
import { db } from '../db'
import { archiveFolders, archiveItems } from '../db/schema'

// === Types ===

type FolderNode = {
  id: string
  name: string
  parentId: string | null
  children: FolderNode[]
  documentCount: number
}

// === List (Tree Structure) ===

export async function listArchiveFolders(companyId: string): Promise<FolderNode[]> {
  // Get all folders
  const folders = await db
    .select({
      id: archiveFolders.id,
      name: archiveFolders.name,
      parentId: archiveFolders.parentId,
    })
    .from(archiveFolders)
    .where(eq(archiveFolders.companyId, companyId))

  // Count documents per folder
  const docCounts = await db
    .select({
      folderId: archiveItems.folderId,
      count: count(),
    })
    .from(archiveItems)
    .where(and(
      eq(archiveItems.companyId, companyId),
      isNull(archiveItems.deletedAt),
    ))
    .groupBy(archiveItems.folderId)

  const countMap = new Map<string, number>()
  for (const row of docCounts) {
    if (row.folderId) countMap.set(row.folderId, Number(row.count))
  }

  // Build tree
  const nodeMap = new Map<string, FolderNode>()
  for (const f of folders) {
    nodeMap.set(f.id, {
      id: f.id,
      name: f.name,
      parentId: f.parentId,
      children: [],
      documentCount: countMap.get(f.id) || 0,
    })
  }

  const roots: FolderNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

// === Create ===

export async function createArchiveFolder(
  companyId: string,
  name: string,
  parentId?: string,
) {
  // Validate parentId if provided
  if (parentId) {
    const parent = await db
      .select({ id: archiveFolders.id })
      .from(archiveFolders)
      .where(and(eq(archiveFolders.companyId, companyId), eq(archiveFolders.id, parentId)))
      .limit(1)
    if (parent.length === 0) {
      return { error: 'PARENT_NOT_FOUND' as const }
    }
  }

  const [folder] = await db
    .insert(archiveFolders)
    .values({
      companyId,
      name,
      parentId: parentId || null,
    })
    .returning()

  return { data: folder }
}

// === Rename ===

export async function renameArchiveFolder(
  companyId: string,
  folderId: string,
  name: string,
) {
  const [updated] = await db
    .update(archiveFolders)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(archiveFolders.companyId, companyId), eq(archiveFolders.id, folderId)))
    .returning()

  if (!updated) return { error: 'NOT_FOUND' as const }
  return { data: updated }
}

// === Delete (only empty folders) ===

export async function deleteArchiveFolder(companyId: string, folderId: string) {
  // Check for child folders
  const childFolders = await db
    .select({ id: archiveFolders.id })
    .from(archiveFolders)
    .where(and(eq(archiveFolders.companyId, companyId), eq(archiveFolders.parentId, folderId)))
    .limit(1)

  if (childFolders.length > 0) {
    return { error: 'HAS_CHILDREN' as const }
  }

  // Check for documents
  const docs = await db
    .select({ id: archiveItems.id })
    .from(archiveItems)
    .where(and(
      eq(archiveItems.companyId, companyId),
      eq(archiveItems.folderId, folderId),
      isNull(archiveItems.deletedAt),
    ))
    .limit(1)

  if (docs.length > 0) {
    return { error: 'HAS_DOCUMENTS' as const }
  }

  const [deleted] = await db
    .delete(archiveFolders)
    .where(and(eq(archiveFolders.companyId, companyId), eq(archiveFolders.id, folderId)))
    .returning({ id: archiveFolders.id })

  if (!deleted) return { error: 'NOT_FOUND' as const }
  return { data: deleted }
}
