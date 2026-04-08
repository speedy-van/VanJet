// ─── VanJet · Admin Group Chat API ────────────────────────────
// POST: Creates or opens the canonical drivers group chat

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getOrCreateDriversGroup } from "@/lib/chat/groupChat";

export async function POST() {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get or create the drivers group
    const result = await getOrCreateDriversGroup(session.user.id);

    if (!result.ok) {
      // Handle no active drivers case
      if (result.code === "NO_ACTIVE_DRIVERS") {
        return NextResponse.json(
          {
            ok: false,
            error: result.error,
            code: result.code,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      chatId: result.chatId,
      memberCount: result.memberCount,
      created: result.created,
      message: result.created
        ? "Drivers group chat created"
        : "Drivers group chat opened",
    });
  } catch (error) {
    console.error("[Admin Chat Group] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
