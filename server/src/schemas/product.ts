import { z } from "zod";
import { optionalText } from "./common.js";

export const productSchema = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(160),
  barcode: z.string().trim().min(4).max(80).regex(/^[A-Za-z0-9._-]+$/, "Use letters, numbers, periods, underscores, or hyphens."),
  description: optionalText(1000),
  unit: z.string().trim().min(1).max(30),
  minimumStock: z.coerce.number().int().min(0).max(1_000_000),
});

export const productQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["active", "archived", "all"]).default("active"),
});

