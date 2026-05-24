import { z } from "zod";

export const searchSchema = z.object({
  contact: z.string().optional(),
  date: z.string().optional(),
  phone: z.string().optional()
});
