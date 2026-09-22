import { z } from "zod";
import { optionalText } from "./common.js";

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  notes: optionalText(500),
});

export const transactionQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  type: z.enum(["STOCK_IN", "STOCK_OUT"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

