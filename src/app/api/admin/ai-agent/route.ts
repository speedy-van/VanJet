// ─── VanJet · Zyphon AI Agent API ─────────────────────────────
// POST: Streaming AI agent endpoint with tool calling + identity guard

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getGroqClient, getGroqModel } from "@/lib/ai/groqClient";
import { systemPrompt } from "@/lib/ai/systemPrompt";
import { getGroqTools, executeTool } from "@/lib/ai/tools";
import {
  detectIdentityQuestion,
  getIdentityResponse,
  containsForbiddenTokens,
} from "@/lib/ai/identityGuard";
import { logAIToolAction } from "@/lib/ai/audit";
import {
  getOrCreateConversation,
  loadContextWindow,
  appendMessage,
  resetConversation,
  getAdminName,
} from "@/lib/ai/memory";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(adminId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(adminId);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(adminId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const adminId = session.user.id;

    // Rate limit
    if (!checkRateLimit(adminId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await req.json();
    const messages: Message[] = body.messages || [];
    const isBoot = body.boot === true;
    const isReset = body.reset === true;

    // Handle reset
    if (isReset) {
      await resetConversation(adminId);
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle boot trigger — return personalized greeting
    if (isBoot) {
      const conv = await getOrCreateConversation(adminId);
      const history = await loadContextWindow(conv.id);

      // If there's already history, send it back
      if (history.length > 0) {
        return new Response(
          JSON.stringify({
            greeting: null,
            history: history.filter((m) => m.role === "user" || m.role === "assistant"),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // New conversation — personalized greeting
      const adminName = await getAdminName(adminId);
      const firstName = adminName?.split(" ")[0] ?? "Admin";
      const greeting = `هلا ${firstName}! آني زايفون، وكيلك الذكي. شلون أكدر أساعدك اليوم؟`;

      // Persist the greeting
      await appendMessage(conv.id, "assistant", greeting);

      return new Response(
        JSON.stringify({ greeting, history: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = getGroqClient();
    const model = getGroqModel();
    const tools = getGroqTools();

    // ── IDENTITY GUARD: Short-circuit identity questions ──
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user" && detectIdentityQuestion(lastUserMsg.content)) {
      const identityAnswer = getIdentityResponse("ar");
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: identityAnswer })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Build conversation with system prompt + persistent memory
    const conv = await getOrCreateConversation(adminId);
    const history = await loadContextWindow(conv.id);

    // Persist the new user message
    if (lastUserMsg?.role === "user") {
      await appendMessage(conv.id, "user", lastUserMsg.content);
    }

    // Using ChatCompletionMessageParam type from Groq SDK
    type ConversationMessage = {
      role: "system" | "user" | "assistant" | "tool";
      content: string | null;
      tool_call_id?: string;
      name?: string;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    };
    
    const conversation: ConversationMessage[] = [
      { role: "system", content: systemPrompt },
      // Load persistent history
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      // Add the new user message (if not already in history)
      ...(lastUserMsg?.role === "user"
        ? [{ role: "user" as const, content: lastUserMsg.content }]
        : []),
    ];

    // Tool calling loop (max 6 iterations)
    let iterations = 0;
    const maxIterations = 6;

    while (iterations < maxIterations) {
      iterations++;

      const completion = await groq.chat.completions.create({
        model,
        // Cast to any to work around Groq SDK strict typing
        messages: conversation as Parameters<typeof groq.chat.completions.create>[0]["messages"],
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: "auto",
        max_tokens: 2048,
        temperature: 0.7,
      });

      const choice = completion.choices[0];
      const message = choice.message;

      // Check for tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add assistant message WITH tool_calls (required by API)
        conversation.push({
          role: "assistant",
          content: message.content || null,
          tool_calls: message.tool_calls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        });

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          
          let toolInput: unknown;
          try {
            toolInput = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            toolInput = {};
          }

          const result = await executeTool(toolName, toolInput, adminId);

          // Add tool result to conversation
          conversation.push({
            role: "tool",
            content: JSON.stringify(result),
            tool_call_id: toolCall.id,
          });
        }

        continue; // Continue loop to get model's response to tool results
      }

      // No more tool calls - stream the final response
      let finalContent = message.content || "";

      // ── SAFETY NET: Scan for forbidden identity leakage ──
      if (containsForbiddenTokens(finalContent)) {
        finalContent = getIdentityResponse("ar");
        // Log the blocked leakage
        logAIToolAction({
          adminId,
          toolName: "identity_leak_blocked",
          input: { originalResponse: message.content?.slice(0, 200) },
          output: { replacement: finalContent },
          status: "error",
        }).catch(() => {});
      }

      // Persist assistant response
      appendMessage(conv.id, "assistant", finalContent).catch(() => {});

      // Create streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Stream the content character by character (simulating streaming)
          const words = finalContent.split(" ");
          let index = 0;

          function pushWord() {
            if (index < words.length) {
              const word = words[index] + (index < words.length - 1 ? " " : "");
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
              index++;
              setTimeout(pushWord, 20);
            } else {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            }
          }

          pushWord();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // If we hit max iterations, return what we have
    return new Response(
      JSON.stringify({ error: "Max tool iterations reached" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[AI Agent] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
