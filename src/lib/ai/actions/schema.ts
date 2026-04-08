// ─── VanJet · Zyphon UI Action Schema ─────────────────────────
// Defines the structured actions Zyphon can plan and execute

import { z } from "zod";

export const uiActionSchema = z.object({
  id: z.string(),
  type: z.enum(["click", "navigate", "scroll", "type", "highlight", "wait"]),
  target: z.string().describe("CSS selector or target registry key"),
  value: z.string().optional().describe("Text to type, URL to navigate to"),
  description: z.string().describe("Human-readable explanation of the action"),
});

export type UIAction = z.infer<typeof uiActionSchema>;

export const uiActionPlanSchema = z.object({
  planId: z.string(),
  title: z.string(),
  actions: z.array(uiActionSchema),
});

export type UIActionPlan = z.infer<typeof uiActionPlanSchema>;

/**
 * Target registry — maps friendly names to CSS selectors.
 * These are the known, safe targets Zyphon can interact with.
 */
export const TARGET_REGISTRY: Record<string, string> = {
  // Navigation
  "nav.dashboard": 'a[href="/admin"]',
  "nav.jobs": 'a[href="/admin/jobs"]',
  "nav.bookings": 'a[href="/admin/bookings"]',
  "nav.quotes": 'a[href="/admin/quotes"]',
  "nav.applications": 'a[href="/admin/applications"]',
  "nav.drivers": 'a[href="/admin/drivers"]',
  "nav.users": 'a[href="/admin/users"]',
  "nav.chat": 'a[href="/admin/chat"]',
  "nav.visitors": 'a[href="/admin/visitors"]',
  "nav.zyphon": 'a[href="/admin/ai-agent"]',
  "nav.auditLog": 'a[href="/admin/audit-log"]',

  // Common UI elements
  "button.refresh": 'button:has(svg)',
  "table.firstRow": 'table tbody tr:first-child',
  "select.dateRange": 'select',
};

/**
 * Resolve a target to a CSS selector using the registry
 */
export function resolveTarget(target: string): string {
  return TARGET_REGISTRY[target] || target;
}
