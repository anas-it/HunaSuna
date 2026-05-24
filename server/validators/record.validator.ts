import { z } from "zod";

export const manualPersonSchema = z.object({
  contactId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional()
});

export const recordSchema = z.object({
  sender: manualPersonSchema,
  receiver: manualPersonSchema,
  amount: z.string().min(1),
  currency: z.enum(["TRY", "USD", "EUR", "RUB", "CNY"]),
  rate: z.string().min(1)
});
