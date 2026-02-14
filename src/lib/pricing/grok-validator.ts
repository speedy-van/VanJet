// ─── VanJet · Grok AI Price Validator ─────────────────────────
// Uses Grok (xAI) to validate & optionally adjust the rules-based price.
// English only. Skipped entirely when ENABLE_AI_PRICING !== "true".

import { serverEnv } from "@/lib/env";
import type { PricingInput, PricingBreakdown } from "./engine";

const GROK_BASE_URL = "https://api.x.ai/v1";

export interface GrokValidationResult {
  isReasonable: boolean;
  adjustedPrice: number | null;
  confidence: number; // 0-100
  aiExplanation: string;
  warnings: string[];
}

/** Check if AI pricing is enabled and an API key exists. */
function isAiEnabled(): boolean {
  return (
    process.env.ENABLE_AI_PRICING === "true" && !!serverEnv.GROK_API_KEY
  );
}

/**
 * Ask Grok whether the rules-based price looks reasonable for the UK market.
 * Returns a validation result with optional adjusted price.
 * No-op when AI is disabled or API key is missing.
 */
export async function validatePriceWithGrok(
  input: PricingInput,
  engineResult: PricingBreakdown
): Promise<GrokValidationResult | null> {
  if (!isAiEnabled()) return null;

  const apiKey = serverEnv.GROK_API_KEY;

  const systemPrompt = `You are VanJet's pricing auditor for UK van removal and man-and-van services.
Given job details and a rules-based price estimate, evaluate whether the price is reasonable for the current UK market.
Consider: distance, weight, volume, floor access, date demand, and comparable services.
Respond ONLY with strict JSON matching this schema:
{
  "isReasonable": true|false,
  "adjustedPrice": number|null,
  "confidence": number (0-100),
  "aiExplanation": "brief English explanation of your assessment",
  "warnings": ["any concerns or notes"]
}
Do not include markdown, code fences, or any text outside the JSON object.
All text must be in English.`;

  const itemSummary = input.items
    .map((i) => `${i.name} ×${i.quantity} (${i.weightKg}kg, ${i.volumeM3}m³)`)
    .join(", ");

  const userPrompt = `Validate this UK removal job price:
- Job type: ${input.jobType}
- Distance: ${input.distanceMiles} miles
- Items: ${itemSummary}
- Total weight: ${engineResult.totalWeightKg} kg
- Total volume: ${engineResult.totalVolumeM3} m³
- Pickup floor: ${input.pickupFloor} ${input.pickupHasElevator ? "(lift)" : "(no lift)"}
- Delivery floor: ${input.deliveryFloor} ${input.deliveryHasElevator ? "(lift)" : "(no lift)"}
- Packaging: ${input.requiresPackaging ? "Yes" : "No"}
- Move date: ${input.preferredDate.toISOString().slice(0, 10)}
- Recommended vehicle: ${engineResult.recommendedVehicle} ×${engineResult.numberOfVehicles}
- Estimated duration: ${engineResult.estimatedDurationHours}h

Rules-based price: £${engineResult.totalPrice.toFixed(2)} (range £${engineResult.priceMin}–£${engineResult.priceMax})
Subtotal before VAT: £${engineResult.subtotal.toFixed(2)}
Demand multiplier: ${engineResult.demandMultiplier}

Is this price fair for the UK market? If not, suggest an adjusted total (including 20% VAT).`;

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
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      console.error(
        `[VanJet] Grok validation API error (${res.status}), skipping AI check`
      );
      return null;
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as GrokValidationResult;

    // Validate shape
    if (typeof parsed.isReasonable !== "boolean" || typeof parsed.confidence !== "number") {
      throw new Error("Invalid validation response shape");
    }

    return parsed;
  } catch (err) {
    console.error("[VanJet] Grok validation failed:", err);
    return null;
  }
}

/**
 * Quick AI estimate for an instant ballpark quote (optional).
 * Returns min/max in GBP or null on failure.
 */
export async function quickEstimate(
  jobType: string,
  distanceMiles: number,
  itemCount: number,
  totalWeightKg: number
): Promise<{ min: number; max: number; explanation: string } | null> {
  if (!isAiEnabled()) return null;

  const apiKey = serverEnv.GROK_API_KEY;

  const prompt = `Give a quick price estimate in GBP for a UK ${jobType} job:
- Distance: ${distanceMiles} miles
- Items: ${itemCount}
- Weight: ${totalWeightKg} kg
Respond with JSON only: { "min": number, "max": number, "explanation": "short English text" }`;

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
          {
            role: "system",
            content:
              "You are a UK removal pricing assistant. Respond with JSON only. All text in English.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    return JSON.parse(content);
  } catch {
    return null;
  }
}
