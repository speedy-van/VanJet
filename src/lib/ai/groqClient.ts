// ─── VanJet · Groq Client ──────────────────────────────────────
// Server-only singleton client for Groq AI API
// NEVER expose API key to client

import Groq from "groq-sdk";

function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("[Groq] GROQ_API_KEY environment variable is not set");
  }
  return key;
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: getGroqApiKey(),
    });
  }
  return groqClient;
}
