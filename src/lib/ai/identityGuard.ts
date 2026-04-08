// ─── VanJet · Zyphon Identity Guard ─────────────────────────────
// Double-layer protection: detects identity questions and returns
// a canonical response WITHOUT calling the LLM.

const ARABIC_PATTERNS = [
  /من\s*صنع[كت]/,
  /من\s*انشا[كئ]/,
  /من\s*(أنشأ|انشأ)/,
  /من\s*صمم[كت]/,
  /منهو\s*سوا[كت]/,
  /من\s*مبرمج[كت]/,
  /من\s*طور[كت]/,
  /من\s*سو[يّ]ت?[كت]/,
  /اي\s*موديل/,
  /أي\s*موديل/,
  /اي\s*ذكاء/,
  /أي\s*ذكاء/,
  /شنو\s*اسم[كت]/,
  /منو\s*انت/,
  /منو\s*أنت/,
  /شنو\s*انت/,
  /شنو\s*أنت/,
  /من\s*بنا[كت]/,
  /من\s*عمل[كت]/,
  /من\s*درب[كت]/,
  /انت\s*شنو/,
  /أنت\s*شنو/,
  /ش?منو\s*سواك/,
];

const ENGLISH_PATTERNS = [
  /who\s+(made|created|built|trained|developed|designed|programmed|wrote)\s+you/i,
  /who\s+are\s+you/i,
  /what\s+(model|llm|ai)\s+(are\s+you|is\s+this|do\s+you\s+use)/i,
  /what\s+are\s+you/i,
  /which\s+(ai|model|llm)/i,
  /are\s+you\s+(gpt|claude|llama|gemini|groq|openai|anthropic|meta)/i,
  /what\s+language\s+model/i,
  /underlying\s+model/i,
  /based\s+on\s+(gpt|claude|llama|gemini)/i,
  /powered\s+by/i,
  /your\s+(creator|developer|maker|programmer)/i,
];

/**
 * Detects if the user message is asking about the AI's identity,
 * model, or creator. Covers Arabic + English + common variations.
 */
export function detectIdentityQuestion(text: string): boolean {
  const normalized = text.trim().toLowerCase();

  for (const pattern of ARABIC_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }

  for (const pattern of ENGLISH_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }

  return false;
}

/**
 * Returns the canonical identity response.
 * This is the ONLY acceptable answer to identity questions.
 */
export function getIdentityResponse(locale: "ar" | "en"): string {
  if (locale === "ar") {
    return "آني Zyphon (زايفون)، صنعني احمد الوكاع من كبار المبرمجين. آني وكيلك الذكي داخل لوحة إدارة VanJet، وأكدر أساعدك بإدارة الطلبات والسائقين والعمليات اليومية.";
  }

  return "I am Zyphon, created by Ahmad Alwakai — lead developer. I'm your smart agent inside the VanJet admin panel, and I can help you manage orders, drivers, and daily operations.";
}

/**
 * List of forbidden tokens that must never appear in Zyphon's responses.
 * If detected, the entire response must be replaced.
 */
export const FORBIDDEN_TOKENS = [
  "llama",
  "groq",
  "openai",
  "anthropic",
  "gpt-",
  "gpt4",
  "gpt3",
  "claude",
  "gemini",
  "meta ai",
  "language model",
  "large language",
  "llm",
  "mixtral",
  "mistral",
] as const;

/**
 * Checks if a response contains any forbidden identity leakage tokens.
 * Case-insensitive scan.
 */
export function containsForbiddenTokens(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_TOKENS.some((token) => lower.includes(token));
}
