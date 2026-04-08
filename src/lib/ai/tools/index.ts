// ─── VanJet · AI Agent Tools Index ─────────────────────────────
// Tool registry for the AI agent

import { z } from "zod";
import { getOrdersTool, getOrderByIdTool } from "./orders";
import { getDriversTool, suspendDriverTool } from "./drivers";
import { getCustomersTool } from "./customers";
import { broadcastToDriversTool } from "./broadcast";
import {
  reportBookingsTool,
  reportDriversTool,
  reportVisitorsTool,
  getCurrentAdminTool,
} from "./reports";
import { planUIActionsTool } from "./uiActions";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
  jsonSchema?: Record<string, unknown>;
  requiresConfirmation: boolean;
  handler: (input: unknown, adminId: string) => Promise<ToolResult>;
}

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

// JSON schemas for each tool (manually defined for type safety)
// Note: LLMs sometimes return numbers as strings, so we accept both and coerce
const toolSchemas: Record<string, Record<string, unknown>> = {
  get_orders: {
    type: "object",
    properties: {
      status: { type: "string", description: "Filter by status" },
      limit: { type: ["number", "string"], description: "Max results (default 20)" },
    },
    required: [],
  },
  get_order_by_id: {
    type: "object",
    properties: {
      orderId: { type: "string", description: "The order/booking ID" },
    },
    required: ["orderId"],
  },
  get_drivers: {
    type: "object",
    properties: {
      verified: { type: ["boolean", "string"], description: "Filter by verified status" },
      limit: { type: ["number", "string"], description: "Max results (default 20)" },
    },
    required: [],
  },
  get_customers: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search by name or email" },
      limit: { type: ["number", "string"], description: "Max results (default 20)" },
    },
    required: [],
  },
  suspend_driver: {
    type: "object",
    properties: {
      driverId: { type: "string", description: "The driver ID to suspend" },
      reason: { type: "string", description: "Reason for suspension" },
    },
    required: ["driverId", "reason"],
  },
  broadcast_to_drivers: {
    type: "object",
    properties: {
      message: { type: "string", description: "Message to broadcast" },
      driverIds: { 
        type: "array",
        items: { type: "string" },
        description: "Specific driver IDs (optional, defaults to all active)",
      },
    },
    required: ["message"],
  },
  report_bookings: {
    type: "object",
    properties: {
      days: { type: ["number", "string"], description: "Period in days (default 30)" },
    },
    required: [],
  },
  report_drivers: {
    type: "object",
    properties: {},
    required: [],
  },
  report_visitors: {
    type: "object",
    properties: {
      days: { type: ["number", "string"], description: "Period in days (default 7)" },
    },
    required: [],
  },
  get_current_admin: {
    type: "object",
    properties: {},
    required: [],
  },
  plan_ui_actions: {
    type: "object",
    properties: {
      goal: { type: "string", description: "What the user wants to accomplish" },
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["click", "navigate", "scroll", "type", "highlight", "wait"] },
            target: { type: "string", description: "Target registry key or CSS selector" },
            value: { type: "string", description: "Text to type or URL to navigate to" },
            description: { type: "string", description: "Human-readable description" },
          },
          required: ["type", "target", "description"],
        },
      },
      confirm: { type: "boolean", description: "Set to true to execute the plan" },
    },
    required: ["goal", "actions"],
  },
};

// Coerce string values to proper types based on expected schema
function coerceToolInput(input: unknown): unknown {
  if (typeof input !== "object" || input === null) return input;
  
  const obj = input as Record<string, unknown>;
  const coerced: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (key === "limit" && typeof value === "string") {
      const num = parseInt(value, 10);
      coerced[key] = isNaN(num) ? undefined : num;
    } else if (key === "verified" && typeof value === "string") {
      coerced[key] = value === "true";
    } else {
      coerced[key] = value;
    }
  }
  
  return coerced;
}

// Registry of all available tools
export const tools: Record<string, ToolDefinition> = {
  get_orders: { ...getOrdersTool, jsonSchema: toolSchemas.get_orders },
  get_order_by_id: { ...getOrderByIdTool, jsonSchema: toolSchemas.get_order_by_id },
  get_drivers: { ...getDriversTool, jsonSchema: toolSchemas.get_drivers },
  get_customers: { ...getCustomersTool, jsonSchema: toolSchemas.get_customers },
  suspend_driver: { ...suspendDriverTool, jsonSchema: toolSchemas.suspend_driver },
  broadcast_to_drivers: { ...broadcastToDriversTool, jsonSchema: toolSchemas.broadcast_to_drivers },
  report_bookings: { ...reportBookingsTool, jsonSchema: toolSchemas.report_bookings },
  report_drivers: { ...reportDriversTool, jsonSchema: toolSchemas.report_drivers },
  report_visitors: { ...reportVisitorsTool, jsonSchema: toolSchemas.report_visitors },
  get_current_admin: { ...getCurrentAdminTool, jsonSchema: toolSchemas.get_current_admin },
  plan_ui_actions: { ...planUIActionsTool, jsonSchema: toolSchemas.plan_ui_actions },
};

// Convert tools to Groq tool format
export function getGroqTools() {
  return Object.entries(tools).map(([name, tool]) => ({
    type: "function" as const,
    function: {
      name,
      description: tool.description,
      parameters: tool.jsonSchema,
    },
  }));
}

// Execute a tool by name
export async function executeTool(
  toolName: string,
  input: unknown,
  adminId: string
): Promise<ToolResult> {
  const tool = tools[toolName];
  if (!tool) {
    return { ok: false, error: `Unknown tool: ${toolName}` };
  }

  try {
    // Coerce types (LLMs sometimes return numbers as strings)
    const coercedInput = coerceToolInput(input);
    
    // Validate input
    const validatedInput = tool.parameters.parse(coercedInput);
    
    // Check confirmation requirement
    if (tool.requiresConfirmation) {
      const inputObj = validatedInput as Record<string, unknown>;
      if (!inputObj.confirm) {
        return {
          ok: false,
          error: "This action requires confirmation. Please set confirm: true to proceed.",
        };
      }
    }

    return await tool.handler(validatedInput, adminId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, error: `Invalid input: ${error.message}` };
    }
    console.error(`[Tool ${toolName}] Error:`, error);
    return { ok: false, error: "Tool execution failed" };
  }
}
