import { z } from "zod";

export const settingsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().min(4).optional(),
  newPassword: z
    .string()
    .min(4)
    .optional()
    .or(z.literal("").transform(() => undefined))
});
