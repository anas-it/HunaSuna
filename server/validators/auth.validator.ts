import { z } from "zod";

export const registerSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(4),
  phone: z.string().min(4),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined))
});

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(4)
});

export const smsCodeSchema = z.object({
  phone: z.string().min(4),
  code: z.string().min(1)
});

export const passwordRecoverySchema = z.object({
  target: z.string().min(1),
  code: z.string().min(1),
  newPassword: z.string().min(4)
});
