// ─── VanJet · Chat Info API ─────────────────────────────────────
// GET: Fetch chat details (name, type, members) for the header

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { chats, chatMembers, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ chatId: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await ctx.params;

    // Fetch chat
    const [chat] = await db
      .select({
        id: chats.id,
        name: chats.name,
        chatType: chats.chatType,
      })
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify membership
    const membership = await db
      .select({ id: chatMembers.id })
      .from(chatMembers)
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, session.user.id),
          isNull(chatMembers.leftAt)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    // Get active members
    const members = await db
      .select({
        userId: chatMembers.userId,
        isAdmin: chatMembers.isAdmin,
        name: users.name,
        role: users.role,
        avatarUrl: users.avatarUrl,
      })
      .from(chatMembers)
      .innerJoin(users, eq(chatMembers.userId, users.id))
      .where(
        and(
          eq(chatMembers.chatId, chatId),
          isNull(chatMembers.leftAt)
        )
      );

    return NextResponse.json({
      ok: true,
      chat: {
        ...chat,
        memberCount: members.length,
        members,
      },
    });
  } catch (error) {
    console.error("[Chat Info GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
