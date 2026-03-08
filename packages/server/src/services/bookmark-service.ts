import { eq, and, desc, count } from 'drizzle-orm'
import { db } from '../db'
import { bookmarks, commands, agents, departments } from '../db/schema'
import type { PaginationParams } from './activity-log-service'

type PaginatedResult<T> = { items: T[]; page: number; limit: number; total: number }

type BookmarkItem = {
  id: string
  commandId: string
  commandText: string
  commandType: string
  commandStatus: string
  targetAgentName: string | null
  targetDepartmentName: string | null
  note: string | null
  createdAt: Date
  updatedAt: Date
  commandCreatedAt: Date
}

// === Add bookmark ===

export async function addBookmark(
  companyId: string,
  userId: string,
  commandId: string,
  note?: string,
): Promise<{ id: string } | { error: 'DUPLICATE' } | { error: 'COMMAND_NOT_FOUND' }> {
  // Verify command exists and belongs to company
  const [cmd] = await db
    .select({ id: commands.id })
    .from(commands)
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
    .limit(1)

  if (!cmd) {
    return { error: 'COMMAND_NOT_FOUND' }
  }

  // Check for duplicate
  const [existing] = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(
      eq(bookmarks.companyId, companyId),
      eq(bookmarks.userId, userId),
      eq(bookmarks.commandId, commandId),
    ))
    .limit(1)

  if (existing) {
    return { error: 'DUPLICATE' }
  }

  const [result] = await db
    .insert(bookmarks)
    .values({
      companyId,
      userId,
      commandId,
      note: note || null,
    })
    .returning({ id: bookmarks.id })

  return { id: result.id }
}

// === Remove bookmark ===

export async function removeBookmark(
  companyId: string,
  userId: string,
  bookmarkId: string,
): Promise<boolean> {
  const result = await db
    .delete(bookmarks)
    .where(and(
      eq(bookmarks.id, bookmarkId),
      eq(bookmarks.companyId, companyId),
      eq(bookmarks.userId, userId),
    ))
    .returning({ id: bookmarks.id })

  return result.length > 0
}

// === Update bookmark note ===

export async function updateBookmarkNote(
  companyId: string,
  userId: string,
  bookmarkId: string,
  note: string,
): Promise<boolean> {
  const result = await db
    .update(bookmarks)
    .set({ note, updatedAt: new Date() })
    .where(and(
      eq(bookmarks.id, bookmarkId),
      eq(bookmarks.companyId, companyId),
      eq(bookmarks.userId, userId),
    ))
    .returning({ id: bookmarks.id })

  return result.length > 0
}

// === List bookmarks ===

export async function listBookmarks(
  companyId: string,
  userId: string,
  pagination: PaginationParams,
): Promise<PaginatedResult<BookmarkItem>> {
  const conditions = [
    eq(bookmarks.companyId, companyId),
    eq(bookmarks.userId, userId),
  ]

  const whereClause = and(...conditions)

  const [totalResult] = await db
    .select({ count: count() })
    .from(bookmarks)
    .where(whereClause)

  const items = await db
    .select({
      id: bookmarks.id,
      commandId: bookmarks.commandId,
      commandText: commands.text,
      commandType: commands.type,
      commandStatus: commands.status,
      targetAgentName: agents.name,
      targetDepartmentName: departments.name,
      note: bookmarks.note,
      createdAt: bookmarks.createdAt,
      updatedAt: bookmarks.updatedAt,
      commandCreatedAt: commands.createdAt,
    })
    .from(bookmarks)
    .innerJoin(commands, eq(bookmarks.commandId, commands.id))
    .leftJoin(agents, eq(commands.targetAgentId, agents.id))
    .leftJoin(departments, eq(agents.departmentId, departments.id))
    .where(whereClause)
    .orderBy(desc(bookmarks.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    total: Number(totalResult?.count || 0),
  }
}
