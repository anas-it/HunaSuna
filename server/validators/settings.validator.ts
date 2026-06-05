import { z } from "zod";

export const settingsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z
    .string()
    .min(4)
    .optional()
    .or(z.literal("").transform(() => undefined))
});
