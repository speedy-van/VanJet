// ─── VanJet · Grok (xAI) Pricing + Assistant ─────────────────
import { serverEnv } from "@/lib/env";

const GROK_BASE_URL = "https://api.x.ai/v1";

interface GrokPricingInput {
  distanceMiles: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  itemCount: number;
  floorLevel?: number;
  hasLift?: boolean;
  needsPacking?: boolean;
  moveDate: string;
}

interface GrokPricingResult {
  minPrice: number;
  maxPrice: number;
  explanation: string;
}

/**
 * Get an AI-generated price estimate for a removal job using Grok (xAI).
 * Falls back to a formula-based estimate when the API key is missing or the call fails.
 */
export async function getGrokPricing(
  input: GrokPricingInput
): Promise<GrokPricingResult> {
  // ── Fallback pricing when Grok is unavailable ───────────────
  const apiKey = serverEnv.GROK_API_KEY;
  if (!apiKey) {
    return fallbackPricing(input);
  }

  const systemPrompt = `You are VanJet's pricing engine for UK van removal and delivery services.
Given the job details, estimate a fair minimum and maximum price in GBP.
Consider: distance, weight, volume, number of items, floor access, packing needs, and UK market rates.
Respond ONLY with strict JSON: { "minPrice": number, "maxPrice": number, "explanation": "brief English explanation" }
Do not include markdown, code fences, or any text outside the JSON object.`;

  const userPrompt = `Estimate the price for this UK removal job:
- Distance: ${input.distanceMiles} miles
- Total weight: ${input.totalWeightKg} kg
- Total volume: ${input.totalVolumeM3} m³
- Number of items: ${input.itemCount}
- Floor level: ${input.floorLevel ?? "Ground"}
- Has lift: ${input.hasLift ? "Yes" : "No"}
- Packing needed: ${input.needsPacking ? "Yes" : "No"}
- Move date: ${input.moveDate}`;

  try {
    const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      console.error(`[VanJet] Grok API error (${res.status}), using fallback pricing`);
      return fallbackPricing(input);
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    const parsed = JSON.parse(content) as GrokPricingResult;
    if (
      typeof parsed.minPrice !== "number" ||
      typeof parsed.maxPrice !== "number"
    ) {
      throw new Error("Invalid pricing structure from AI.");
    }
    return parsed;
  } catch (err) {
    console.error("[VanJet] Grok pricing failed, using fallback:", err);
    return fallbackPricing(input);
  }
}

/**
 * Simple formula-based pricing fallback (no AI required).
 * Base £40 + £1.90/mile + £0.50/kg + £15/m³ + floor surcharge.
 */
function fallbackPricing(input: GrokPricingInput): GrokPricingResult {
  const base = 40;
  const distanceCost = input.distanceMiles * 1.9;
  const weightCost = input.totalWeightKg * 0.5;
  const volumeCost = input.totalVolumeM3 * 15;
  const floorSurcharge =
    (input.floorLevel ?? 0) > 0 && !input.hasLift
      ? (input.floorLevel ?? 0) * 10
      : 0;
  const packingSurcharge = input.needsPacking ? 30 : 0;

  const mid = base + distanceCost + weightCost + volumeCost + floorSurcharge + packingSurcharge;
  const minPrice = Math.round(mid * 0.8 * 100) / 100;
  const maxPrice = Math.round(mid * 1.2 * 100) / 100;

  return {
    minPrice,
    maxPrice,
    explanation: `Estimated based on ${input.distanceMiles.toFixed(1)} mile distance, ${input.totalWeightKg.toFixed(1)} kg total weight, and ${input.itemCount} items.`,
  };
}

/**
 * Chat with VanJet's AI assistant (English only).
 */
export async function chatWithAssistant(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const systemPrompt = `You are VanJet's friendly customer assistant.
You help UK customers with removal and delivery questions.
Be concise, helpful, and always respond in English.
You can help with: pricing estimates, service information, booking guidance, and general moving tips.
If you don't know something specific about a booking, suggest they contact support.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history,
    { role: "user" as const, content: userMessage },
  ];

  const res = await fetch(`${GROK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnv.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`Grok API error (${res.status})`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that.";
}
