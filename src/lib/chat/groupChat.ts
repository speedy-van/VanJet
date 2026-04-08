// ─── VanJet · Group Chat Utilities ───────────────────────────────
// Server-side utilities for managing the canonical drivers group chat

import { db } from "@/lib/db";
import { chats, chatMembers, driverProfiles, users } from "@/lib/db/schema";
import { eq, and, isNull, inArray, notInArray } from "drizzle-orm";

export type ChatType = "DIRECT" | "GROUP_DRIVERS" | "GROUP_CUSTOMERS";

export interface GroupChatResult {
  ok: true;
  chatId: string;
  memberCount: number;
  created: boolean;
  hasActiveDrivers: boolean;
}

export interface GroupChatError {
  ok: false;
  error: string;
  code: "NO_ACTIVE_DRIVERS" | "UNAUTHORIZED" | "DATABASE_ERROR";
}

/**
 * Get or create the canonical drivers group chat.
 * Ensures only one GROUP_DRIVERS chat exists (singleton pattern).
 * Synchronizes membership with currently active/verified drivers.
 */
export async function getOrCreateDriversGroup(
  adminUserId: string
): Promise<GroupChatResult | GroupChatError> {
  try {
    // 1. Find active (verified) drivers
    const activeDrivers = await db
      .select({
        userId: driverProfiles.userId,
      })
      .from(driverProfiles)
      .where(eq(driverProfiles.verified, true));

    const activeDriverUserIds = activeDrivers.map((d) => d.userId);

    // If no active drivers, return early
    if (activeDriverUserIds.length === 0) {
      return {
        ok: false,
        error: "No active drivers available",
        code: "NO_ACTIVE_DRIVERS",
      };
    }

    // 2. Find existing canonical GROUP_DRIVERS chat
    const existingChat = await db
      .select({ id: chats.id })
      .from(chats)
      .where(eq(chats.chatType, "GROUP_DRIVERS"))
      .limit(1);

    let chatId: string;
    let created = false;

    if (existingChat.length > 0) {
      // Use existing chat
      chatId = existingChat[0].id;

      // Sync membership: add new active drivers who aren't members
      const currentMembers = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, chatId),
            isNull(chatMembers.leftAt)
          )
        );

      const currentMemberIds = currentMembers.map((m) => m.userId);
      
      // Add any active drivers who aren't members yet
      const toAdd = activeDriverUserIds.filter(
        (id) => !currentMemberIds.includes(id)
      );

      if (toAdd.length > 0) {
        await db.insert(chatMembers).values(
          toAdd.map((userId) => ({
            chatId,
            userId,
            isAdmin: false,
          }))
        );
      }

      // Mark inactive drivers as left (soft removal)
      const toRemove = currentMemberIds.filter(
        (id) => !activeDriverUserIds.includes(id) && id !== adminUserId
      );

      if (toRemove.length > 0) {
        await db
          .update(chatMembers)
          .set({ leftAt: new Date() })
          .where(
            and(
              eq(chatMembers.chatId, chatId),
              inArray(chatMembers.userId, toRemove),
              isNull(chatMembers.leftAt)
            )
          );
      }

      // Ensure admin is a member
      const adminIsMember = currentMemberIds.includes(adminUserId);
      if (!adminIsMember) {
        await db.insert(chatMembers).values({
          chatId,
          userId: adminUserId,
          isAdmin: true,
        }).onConflictDoNothing();
      }
    } else {
      // Create new GROUP_DRIVERS chat
      const [newChat] = await db
        .insert(chats)
        .values({
          chatType: "GROUP_DRIVERS",
          name: "Drivers Group",
        })
        .returning({ id: chats.id });

      chatId = newChat.id;
      created = true;

      // Add all active drivers + admin as members
      const memberValues = [
        ...activeDriverUserIds.map((userId) => ({
          chatId,
          userId,
          isAdmin: false,
        })),
        {
          chatId,
          userId: adminUserId,
          isAdmin: true,
        },
      ];

      await db.insert(chatMembers).values(memberValues);
    }

    // Count current active members
    const [memberCount] = await db
      .select({ count: chatMembers.id })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          isNull(chatMembers.leftAt)
        )
      );

    return {
      ok: true,
      chatId,
      memberCount: Number(memberCount?.count ?? 0),
      created,
      hasActiveDrivers: true,
    };
  } catch (error) {
    console.error("[GroupChat] Error:", error);
    return {
      ok: false,
      error: "Database error occurred",
      code: "DATABASE_ERROR",
    };
  }
}
