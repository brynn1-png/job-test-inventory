import { z } from "zod";

export const idParamsSchema = z.object({ id: z.string().uuid() });

export const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((value) => value || null);

