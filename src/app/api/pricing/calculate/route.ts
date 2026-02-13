// ─── VanJet · Pricing Calculate API ───────────────────────────
// POST /api/pricing/calculate
// Accepts job details, runs rules-based engine, optionally blends AI validation.
// English only. No car/motorcycle transport.

import { NextResponse } from "next/server";
import {
  calculatePrice,
  validatePriceWithGrok,
  getAcceptanceAdjustment,
  getSeasonalCorrection,
} from "@/lib/pricing";
import type { PricingInput } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ── Validate required fields ──────────────────────────────
    const missing: string[] = [];
    if (!body.jobType) missing.push("jobType");
    if (body.distanceKm == null) missing.push("distanceKm");
    if (!Array.isArray(body.items) || body.items.length === 0)
      missing.push("items (non-empty array)");
    if (!body.preferredDate) missing.push("preferredDate");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Parse input ───────────────────────────────────────────
    const preferredDate = new Date(body.preferredDate);
    if (isNaN(preferredDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid preferredDate format. Use ISO 8601." },
        { status: 400 }
      );
    }

    const input: PricingInput = {
      jobType: body.jobType,
      distanceKm: Number(body.distanceKm),
      items: body.items.map(
        (i: { name?: string; quantity?: number; weightKg?: number; volumeM3?: number }) => ({
          name: i.name ?? "Item",
          quantity: Number(i.quantity ?? 1),
          weightKg: Number(i.weightKg ?? 5),
          volumeM3: Number(i.volumeM3 ?? 0.05),
        })
      ),
      pickupFloor: Number(body.pickupFloor ?? 0),
      pickupHasElevator: Boolean(body.pickupHasElevator ?? false),
      deliveryFloor: Number(body.deliveryFloor ?? 0),
      deliveryHasElevator: Boolean(body.deliveryHasElevator ?? false),
      requiresPackaging: Boolean(body.requiresPackaging ?? false),
      requiresAssembly: Boolean(body.requiresAssembly ?? false),
      requiresDisassembly: Boolean(body.requiresDisassembly ?? false),
      requiresCleaning: Boolean(body.requiresCleaning ?? false),
      insuranceLevel: body.insuranceLevel ?? "basic",
      preferredDate,
      requestedAt: new Date(),
      numberOfMovers: body.numberOfMovers ? Number(body.numberOfMovers) : undefined,
    };

    // ── Run rules-based engine ────────────────────────────────
    let result = calculatePrice(input);

    // ── Apply learning hooks ──────────────────────────────────
    const acceptAdj = getAcceptanceAdjustment(
      input.jobType,
      body.areaHint ?? undefined
    );
    const seasonAdj = getSeasonalCorrection(
      preferredDate.getMonth() + 1
    );
    const learningMult = acceptAdj * seasonAdj;

    if (learningMult !== 1.0) {
      // Re-scale the price with learning adjustments
      const scale = learningMult;
      result = {
        ...result,
        subtotal: round2(result.subtotal * scale),
        vatAmount: round2(result.vatAmount * scale),
        totalPrice: round2(result.totalPrice * scale),
        priceMin: roundTo5(result.priceMin * scale),
        priceMax: roundTo5(result.priceMax * scale),
      };
    }

    // ── Optional AI validation ────────────────────────────────
    let aiConfidence: number | null = null;
    let aiWarnings: string[] = [];
    let aiExplanation: string | null = null;

    const aiValidation = await validatePriceWithGrok(input, result);

    if (aiValidation) {
      aiConfidence = aiValidation.confidence;
      aiWarnings = aiValidation.warnings;
      aiExplanation = aiValidation.aiExplanation;

      // Blend if AI suggests a significantly different price
      if (
        aiValidation.adjustedPrice != null &&
        aiValidation.adjustedPrice > 0
      ) {
        const diff = Math.abs(
          aiValidation.adjustedPrice - result.totalPrice
        );
        const threshold = result.totalPrice * 0.2;

        if (diff > threshold) {
          // Blend: 60% engine + 40% AI
          const blended =
            result.totalPrice * 0.6 + aiValidation.adjustedPrice * 0.4;
          result = {
            ...result,
            totalPrice: round2(blended),
            priceMin: roundTo5(blended * 0.85),
            priceMax: roundTo5(blended * 1.15),
          };
        }
      }
    }

    return NextResponse.json({
      ...result,
      aiConfidence,
      aiWarnings,
      aiExplanation,
    });
  } catch (err) {
    console.error("[VanJet] Pricing calculation error:", err);
    return NextResponse.json(
      { error: "Failed to calculate price. Please try again." },
      { status: 500 }
    );
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}
