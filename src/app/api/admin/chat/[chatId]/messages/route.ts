// ─── VanJet · Chat Messages API ───────────────────────────────
// GET: Load messages for a chat (with auth + membership check)
// POST: Send a new message to a chat

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { chatMessages, chatMembers, users } from "@/lib/db/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ chatId: string }>;
}

// ── GET: Fetch messages ─────────────────────────────────────────
export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await ctx.params;

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

    // Fetch messages with sender info, ordered oldest-first
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

    const messages = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        senderId: chatMessages.senderId,
        senderName: users.name,
        senderRole: users.role,
        senderAvatar: users.avatarUrl,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    // Return in chronological order
    messages.reverse();

    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    console.error("[Chat Messages GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST: Send a message ────────────────────────────────────────
export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await ctx.params;
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length > 5000) {
      return NextResponse.json(
        { error: "Message must be 1-5000 characters" },
        { status: 400 }
      );
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

    // Insert message
    const [msg] = await db
      .insert(chatMessages)
      .values({
        chatId,
        senderId: session.user.id,
        content,
      })
      .returning({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        senderId: chatMessages.senderId,
      });

    return NextResponse.json({
      ok: true,
      message: {
        ...msg,
        senderName: session.user.name,
        senderRole: session.user.role,
        senderAvatar: (session.user as Record<string, unknown>).avatarUrl ?? null,
      },
    });
  } catch (error) {
    console.error("[Chat Messages POST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
