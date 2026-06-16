import { z } from "zod";

export const DELETE_ACCOUNT_CONFIRMATION = "УДАЛИТЬ АККАУНТ";

export const settingsSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z
    .string()
    .min(4)
    .optional()
    .or(z.literal("").transform(() => undefined))
});

export const deleteAccountSchema = z.object({
  secretAnswer: z.string().trim().min(1),
  confirmation: z.string().trim().refine(
    (value) => value === DELETE_ACCOUNT_CONFIRMATION,
    {
      message: `Введите ${DELETE_ACCOUNT_CONFIRMATION}, чтобы подтвердить удаление`
    }
  )
});
