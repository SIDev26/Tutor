import { z } from "zod";

export const emailSchema = z.string().trim().email().max(120);
export const passwordSchema = z.string().min(8).max(72);
export const nameSchema = z.string().trim().min(1).max(60);
export const nicknameSchema = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^[A-Za-z][A-Za-z0-9 '’-]*$/, "Use a first name or nickname, up to 20 letters.");
export const gradeSchema = z.coerce.number().int().min(2).max(4);
export const minutesSchema = z.coerce.number().refine((value) => [10, 15, 20].includes(value));
