// ─── VanJet · Admin AI Agent API ──────────────────────────────
// POST: Streaming AI agent endpoint with tool calling

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getGroqClient, getGroqModel } from "@/lib/ai/groqClient";
import { systemPrompt } from "@/lib/ai/systemPrompt";
import { getGroqTools, executeTool } from "@/lib/ai/tools";

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

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = getGroqClient();
    const model = getGroqModel();
    const tools = getGroqTools();

    // Build conversation with system prompt
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
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
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
      const finalContent = message.content || "";

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
