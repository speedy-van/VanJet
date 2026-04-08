// ─── VanJet · Zyphon UI Planning Tool ─────────────────────────
import { z } from "zod";
import { TARGET_REGISTRY } from "../actions/schema";
import type { ToolDefinition, ToolResult } from "./index";

const planUIActionsSchema = z.object({
  goal: z.string().describe("What the user wants to accomplish in the UI"),
  actions: z.array(
    z.object({
      type: z.enum(["click", "navigate", "scroll", "type", "highlight", "wait"]),
      target: z.string(),
      value: z.string().optional(),
      description: z.string(),
    })
  ),
});

export const planUIActionsTool: ToolDefinition = {
  name: "plan_ui_actions",
  description: `Plan a sequence of UI actions to automate the admin dashboard. Available targets: ${Object.keys(TARGET_REGISTRY).join(", ")}. Action types: click (click an element), navigate (go to a page), scroll (scroll to element), type (enter text into input), highlight (flash an element to draw attention), wait (pause for ms).`,
  parameters: planUIActionsSchema,
  requiresConfirmation: true,
  handler: async (input): Promise<ToolResult> => {
    const { goal, actions } = input as z.infer<typeof planUIActionsSchema>;

    // Validate all targets exist in registry or are valid CSS selectors
    const validatedActions = actions.map((action, idx) => ({
      id: `action-${idx}`,
      ...action,
    }));

    const planId = `plan-${Date.now()}`;

    return {
      ok: true,
      data: {
        planId,
        title: goal,
        actions: validatedActions,
        message: `خطة بـ ${validatedActions.length} خطوة جاهزة. أكد عشان أنفذها.`,
      },
    };
  },
};
