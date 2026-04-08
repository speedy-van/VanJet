// ─── VanJet · Zyphon Persistent Memory ────────────────────────
// Manages conversation persistence across sessions

import { db } from "@/lib/db";
import { zyphonConversations, zyphonMessages, users } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

const CONTEXT_WINDOW = 40; // max messages to load

/**
 * Get or create the active conversation for an admin
 */
export async function getOrCreateConversation(adminId: string) {
  // Find active conversation
  const [existing] = await db
    .select()
    .from(zyphonConversations)
    .where(
      and(
        eq(zyphonConversations.adminId, adminId),
        eq(zyphonConversations.active, true)
      )
    )
    .orderBy(desc(zyphonConversations.createdAt))
    .limit(1);

  if (existing) return existing;

  // Create new conversation
  const [conv] = await db
    .insert(zyphonConversations)
    .values({ adminId })
    .returning();

  return conv;
}

/**
 * Load the context window (last N messages) for a conversation
 */
export async function loadContextWindow(conversationId: string) {
  const messages = await db
    .select()
    .from(zyphonMessages)
    .where(eq(zyphonMessages.conversationId, conversationId))
    .orderBy(desc(zyphonMessages.createdAt))
    .limit(CONTEXT_WINDOW);

  // Return in chronological order
  return messages.reverse().map((m) => ({
    role: m.role as "user" | "assistant" | "system" | "tool",
    content: m.content,
    ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
    ...(m.toolName ? { name: m.toolName } : {}),
  }));
}

/**
 * Append a message to the conversation
 */
export async function appendMessage(
  conversationId: string,
  role: string,
  content: string,
  opts?: { toolName?: string; toolCallId?: string }
) {
  await db.insert(zyphonMessages).values({
    conversationId,
    role,
    content,
    toolName: opts?.toolName ?? null,
    toolCallId: opts?.toolCallId ?? null,
  });
}

/**
 * Reset (close) the active conversation for an admin and start fresh
 */
export async function resetConversation(adminId: string) {
  await db
    .update(zyphonConversations)
    .set({ active: false, updatedAt: new Date() })
    .where(
      and(
        eq(zyphonConversations.adminId, adminId),
        eq(zyphonConversations.active, true)
      )
    );
}

/**
 * Get admin name for personalized greeting
 */
export async function getAdminName(adminId: string): Promise<string | null> {
  const [admin] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, adminId))
    .limit(1);

  return admin?.name ?? null;
}
