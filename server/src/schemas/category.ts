import { z } from "zod";
import { optionalText } from "./common.js";

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optionalText(500),
});

