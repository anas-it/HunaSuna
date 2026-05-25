import { z } from "zod";

export const registerSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(4),
  confirmPassword: z.string().min(4),
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

export const smsCodeSchema = z.object({
  phone: z.string().min(4),
  code: z.string().min(1)
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
