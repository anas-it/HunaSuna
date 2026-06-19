import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || undefined : value),
  z.string().optional()
);

export const registerSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(4),
  confirmPassword: z.string().min(4),
  email: optionalTrimmedString.pipe(z.string().email().optional()),
  phone: optionalTrimmedString.pipe(z.string().min(4).optional()),
  secretQuestion: z.string().trim().min(3),
  secretAnswer: z.string().trim().min(2)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(4)
});

export const passwordRecoverySchema = z.object({
  target: z.string().min(1),
  secretAnswer: z.string().trim().min(2),
  newPassword: z.string().min(4),
  confirmPassword: z.string().min(4)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"]
});
