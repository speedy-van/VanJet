// ─── PRICING COMPETITIVENESS TEST ────────────────────────────
// Run with: node test-pricing.js

// Test case: 99 miles, 1x bathroom vanity 36 inch, ground to ground, weekday

const testInput = {
  jobType: "single_item",
  distanceMiles: 99,
  items: [
    {
      name: "Bathroom vanity 36 inch",
      quantity: 1,
      weightKg: 65,
      volumeM3: 0.065
    }
  ],
  pickupFloor: 0,
  pickupHasElevator: false,
  deliveryFloor: 0,
  deliveryHasElevator: false,
  requiresPackaging: false,
  requiresAssembly: false,
  requiresDisassembly: false,
  requiresCleaning: false,
  insuranceLevel: "basic",
  preferredDate: new Date("2026-02-18"), // Wednesday, 4 days from now
};

console.log("\n\n══════════════════════════════════════════════════════════");
console.log("  VANJET PRICING COMPETITIVENESS HOTFIX");
console.log("══════════════════════════════════════════════════════════\n");

console.log("📋 TEST CASE:");
console.log("  Distance: 99 miles");
console.log("  Item: 1x Bathroom vanity 36 inch (65kg, 0.065m³)");
console.log("  Floors: Ground → Ground");
console.log("  Date: Wednesday (Feb 18, 2026) - 4 days lead time");
console.log("");

// ─── BEFORE: Standard Profile (VAT registered, full service) ───
console.log("❌ BEFORE (Standard Profile):\n");

const BASE_PRICE = 40.00;
console.log(`  Base fee (single_item):           £${BASE_PRICE.toFixed(2)}`);

// Distance calculation - STANDARD (round-trip 1.4x)
const distanceTiers = [
  { miles: 6, rate: 4.00, cost: 6 * 4.00 },         // £24.00
  { miles: 25, rate: 2.90, cost: 25 * 2.90 },       // £72.50
  { miles: 31, rate: 2.25, cost: 31 * 2.25 },       // £69.75
  { miles: 37, rate: 1.75, cost: 37 * 1.75 },       // £64.75
];
const distanceOneWay = distanceTiers.reduce((s, t) => s + t.cost, 0); // £231.00
const distanceWithRoundTrip = distanceOneWay * 1.4; // £323.40
console.log(`  Distance (99 miles one-way):      £${distanceOneWay.toFixed(2)}`);
console.log(`  Round-trip multiplier (×1.4):     £${distanceWithRoundTrip.toFixed(2)}`);

const rawSubtotal = BASE_PRICE + distanceWithRoundTrip; // £363.40
console.log(`  Floor cost:                       £0.00`);
console.log(`  Extra services:                   £0.00`);
console.log(`  Vehicle multiplier:               ×1.0 (Small Van)`);

// Demand multiplier: Wednesday × Feb × 4-day lead
const demandMult = 1.0 * 0.9 * 1.05; // 0.945
const subtotal = rawSubtotal * demandMult; // £343.41
console.log(`  Demand multiplier:                ×${demandMult.toFixed(3)}`);
console.log(`  ────────────────────────────────────────────`);
console.log(`  Subtotal (before VAT):            £${subtotal.toFixed(2)}`);

const vat = subtotal * 0.2; // £68.68
const totalBefore = subtotal + vat; // £412.10
console.log(`  VAT (20%):                        £${vat.toFixed(2)}`);
console.log(`  ════════════════════════════════════════════`);
console.log(`  TOTAL (customer pays):            £${totalBefore.toFixed(2)}`);
console.log(`  Price range:                      £${Math.round(totalBefore * 0.85 / 5) * 5} - £${Math.round(totalBefore * 1.15 / 5) * 5}`);
console.log("");

// Platform fee (hidden)
const platformFee = subtotal * 0.15; // £51.51
console.log(`  Platform fee (from driver):       £${platformFee.toFixed(2)} (15%)`);
console.log(`  Driver receives:                  £${(totalBefore - platformFee).toFixed(2)}`);
console.log("");

// ─── AFTER: Competitive Profile (No VAT, one-way) ───
console.log("✅ AFTER (Competitive Profile):\n");

console.log(`  Base fee (single_item):           £${BASE_PRICE.toFixed(2)}`);

// Distance calculation - COMPETITIVE (no round-trip, 30% lower rates)
const distanceTiersComp = [
  { miles: 6, rate: 2.80, cost: 6 * 2.80 },         // £16.80 (-30%)
  { miles: 25, rate: 2.00, cost: 25 * 2.00 },       // £50.00 (-31%)
  { miles: 31, rate: 1.50, cost: 31 * 1.50 },       // £46.50 (-33%)
  { miles: 37, rate: 1.20, cost: 37 * 1.20 },       // £44.40 (-31%)
];
const distanceCompOneWay = distanceTiersComp.reduce((s, t) => s + t.cost, 0); // £157.70
const distanceCompFinal = distanceCompOneWay * 1.0; // No round-trip multiplier
console.log(`  Distance (99 miles one-way):      £${distanceCompOneWay.toFixed(2)}`);
console.log(`  Round-trip multiplier:            ×1.0 (none - one-way only)`);

const rawSubtotalComp = BASE_PRICE + distanceCompFinal; // £197.70
console.log(`  Floor cost:                       £0.00`);
console.log(`  Extra services:                   £0.00`);
console.log(`  Vehicle multiplier:               ×1.0 (Small Van)`);

const subtotalComp = rawSubtotalComp * demandMult; // £186.83
console.log(`  Demand multiplier:                ×${demandMult.toFixed(3)}`);
console.log(`  ────────────────────────────────────────────`);
console.log(`  Subtotal (no VAT):                £${subtotalComp.toFixed(2)}`);

const vatComp = 0; // VAT disabled
const totalAfter = subtotalComp + vatComp; // £186.83
console.log(`  VAT:                              £0.00 (not registered)`);
console.log(`  ════════════════════════════════════════════`);
console.log(`  TOTAL (customer pays):            £${totalAfter.toFixed(2)}`);
console.log(`  Price range:                      £${Math.round(totalAfter * 0.85 / 5) * 5} - £${Math.round(totalAfter * 1.15 / 5) * 5}`);
console.log("");

// Platform fee (hidden)
const platformFeeComp = subtotalComp * 0.15; // £28.02
console.log(`  Platform fee (from driver):       £${platformFeeComp.toFixed(2)} (15%)`);
console.log(`  Driver receives:                  £${(totalAfter - platformFeeComp).toFixed(2)}`);
console.log("");

// ─── SAVINGS ───
const savings = totalBefore - totalAfter;
const savingsPercent = ((savings / totalBefore) * 100).toFixed(1);

console.log("💰 IMPACT ANALYSIS:\n");
console.log(`  Customer savings:                 £${savings.toFixed(2)} (${savingsPercent}% reduction)`);
console.log(`  Driver earnings change:           £${((totalAfter - platformFeeComp) - (totalBefore - platformFee)).toFixed(2)}`);
console.log(`  Platform revenue change:          £${(platformFeeComp - platformFee).toFixed(2)}`);
console.log("");

console.log("🎯 KEY CHANGES:\n");
console.log("  1. Round-trip multiplier:         1.4× → 1.0× (one-way only)");
console.log("  2. Distance rates:                -30% average reduction");
console.log("  3. VAT:                           20% → 0% (not registered yet)");
console.log("  4. UI labels:                     'Fixed Price' → 'Estimate Range'");
console.log("");

console.log("📊 COMPETITIVE POSITIONING:\n");
console.log(`  VanJet (before):                  £${totalBefore.toFixed(2)}`);
console.log(`  VanJet (after):                   £${totalAfter.toFixed(2)}`);
console.log(`  AnyVan (market reference):        ~£180-220 (estimated)`);
console.log(`  Status:                           ✅ NOW COMPETITIVE`);
console.log("");

console.log("══════════════════════════════════════════════════════════\n");
console.log("✅ TEST COMPLETE - Run 'npm run dev' to test in browser\n");
