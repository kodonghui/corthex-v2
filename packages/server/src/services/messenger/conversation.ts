import { db } from '../../db'
import { conversations, conversationParticipants, messages } from '../../db/schema'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import type { Conversation, ConversationListItem } from '@corthex/shared'

export class ConversationService {
  /**
   * Create a new conversation (direct or group).
   * For direct conversations, returns existing one if already exists between the same 2 users.
   */
  async create(
    companyId: string,
    type: 'direct' | 'group',
    participantIds: string[],
    name?: string,
  ): Promise<Conversation> {
    if (type === 'direct') {
      if (participantIds.length !== 2) {
        throw new Error('Direct conversations require exactly 2 participants')
      }
      // Check for existing direct conversation between these 2 users
      const existing = await this.findExistingDirect(companyId, participantIds as [string, string])
      if (existing) return existing
    }

    if (type === 'group' && participantIds.length < 2) {
      throw new Error('Group conversations require at least 2 participants')
    }

    const [conv] = await db
      .insert(conversations)
      .values({
        companyId,
        type,
        name: type === 'group' ? (name || null) : null,
      })
      .returning()

    // Add all participants
    if (participantIds.length > 0) {
      await db.insert(conversationParticipants).values(
        participantIds.map((userId) => ({
          conversationId: conv.id,
          userId,
          companyId,
        })),
      )
    }

    return {
      id: conv.id,
      companyId: conv.companyId,
      type: conv.type as 'direct' | 'group',
      name: conv.name,
      isActive: conv.isActive,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    }
  }

  /**
   * List conversations for a user within a company.
   * Returns conversations with last message preview and unread count.
   */
  async list(companyId: string, userId: string): Promise<ConversationListItem[]> {
    // Find conversations where user is a participant
    const participantRows = await db
      .select({ conversationId: conversationParticipants.conversationId, lastReadAt: conversationParticipants.lastReadAt })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.companyId, companyId),
          eq(conversationParticipants.userId, userId),
        ),
      )

    if (participantRows.length === 0) return []

    const convIds = participantRows.map((p) => p.conversationId)
    const lastReadMap = new Map(participantRows.map((p) => [p.conversationId, p.lastReadAt]))

    // Get conversation details
    const convRows = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.companyId, companyId),
          eq(conversations.isActive, true),
          inArray(conversations.id, convIds),
        ),
      )
      .orderBy(desc(conversations.updatedAt))

    // Build list items with last message and unread count
    const result: ConversationListItem[] = []
    for (const conv of convRows) {
      // Get last message
      const [lastMsg] = await db
        .select({
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.id),
            eq(messages.isDeleted, false),
          ),
        )
        .orderBy(desc(messages.createdAt))
        .limit(1)

      // Count unread messages
      const lastReadAt = lastReadMap.get(conv.id)
      let unreadCount = 0
      if (lastReadAt) {
        const [unreadResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isDeleted, false),
              sql`${messages.createdAt} > ${lastReadAt}`,
            ),
          )
        unreadCount = unreadResult?.count ?? 0
      } else {
        // Never read — all messages are unread
        const [allResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isDeleted, false),
            ),
          )
        unreadCount = allResult?.count ?? 0
      }

      // Count participants
      const [partResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, conv.id))

      result.push({
        id: conv.id,
        type: conv.type as 'direct' | 'group',
        name: conv.name,
        isActive: conv.isActive,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              senderId: lastMsg.senderId,
              createdAt: lastMsg.createdAt.toISOString(),
            }
          : null,
        unreadCount,
        participantCount: partResult?.count ?? 0,
      })
    }

    return result
  }

  /**
   * Get a single conversation by ID with participant details.
   */
  async getById(id: string, companyId: string) {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.companyId, companyId),
        ),
      )
      .limit(1)

    if (!conv) return null

    const participants = await db
      .select({
        userId: conversationParticipants.userId,
        joinedAt: conversationParticipants.joinedAt,
        lastReadAt: conversationParticipants.lastReadAt,
      })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, id))

    return {
      id: conv.id,
      companyId: conv.companyId,
      type: conv.type as 'direct' | 'group',
      name: conv.name,
      isActive: conv.isActive,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      participants: participants.map((p) => ({
        userId: p.userId,
        joinedAt: p.joinedAt.toISOString(),
        lastReadAt: p.lastReadAt?.toISOString() ?? null,
      })),
    }
  }

  /**
   * Add a participant to a group conversation.
   */
  async addParticipant(conversationId: string, userId: string, companyId: string): Promise<void> {
    const conv = await this.getById(conversationId, companyId)
    if (!conv) throw new Error('Conversation not found')
    if (conv.type !== 'group') throw new Error('Cannot add participants to direct conversations')

    // Check if already a participant
    const existing = conv.participants.find((p) => p.userId === userId)
    if (existing) throw new Error('User is already a participant')

    await db.insert(conversationParticipants).values({
      conversationId,
      userId,
      companyId,
    })
  }

  /**
   * Update lastReadAt for a user in a conversation.
   */
  async markAsRead(conversationId: string, userId: string, companyId: string): Promise<void> {
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.companyId, companyId),
        ),
      )
  }

  /**
   * Find an existing direct conversation between exactly 2 users.
   */
  private async findExistingDirect(
    companyId: string,
    userIds: [string, string],
  ): Promise<Conversation | null> {
    // Find all direct conversations in this company
    const directConvs = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.companyId, companyId),
          eq(conversations.type, 'direct'),
          eq(conversations.isActive, true),
        ),
      )

    if (directConvs.length === 0) return null

    // For each direct conversation, check if it has exactly these 2 users
    for (const conv of directConvs) {
      const participants = await db
        .select({ userId: conversationParticipants.userId })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, conv.id))

      const participantUserIds = participants.map((p) => p.userId)
      if (
        participantUserIds.length === 2 &&
        participantUserIds.includes(userIds[0]) &&
        participantUserIds.includes(userIds[1])
      ) {
        // Found existing direct conversation
        const [fullConv] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conv.id))
          .limit(1)

        if (fullConv) {
          return {
            id: fullConv.id,
            companyId: fullConv.companyId,
            type: fullConv.type as 'direct' | 'group',
            name: fullConv.name,
            isActive: fullConv.isActive,
            createdAt: fullConv.createdAt.toISOString(),
            updatedAt: fullConv.updatedAt.toISOString(),
          }
        }
      }
    }

    return null
  }
}
