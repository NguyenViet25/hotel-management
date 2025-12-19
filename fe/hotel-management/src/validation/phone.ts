import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?\d{10,15}$/, "Số điện thoại không hợp lệ");

export const isPhone = (value: string) =>
  /^\+?\d{10,15}$/.test((value || "").trim());
