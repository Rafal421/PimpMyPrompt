// lib/validation.ts - Centralized validation
import { z } from "zod";

// Shared validation schemas
export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format email"),
    password: z
      .string()
      .min(6, "Hasło musi mieć co najmniej 6 znaków")
      .max(100, "Hasło nie może mieć więcej niż 100 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Hasło musi zawierać co najmniej jeden znak specjalny"
      ),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

// Client-side validation helpers
export const validateEmailReal = (email: string) => {
  try {
    loginSchema.pick({ email: true }).parse({ email });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Nieprawidłowy email";
    }
    return "Nieprawidłowy email";
  }
};

export const validatePassword = (password: string) => {
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const isValid = strength === 3;

  return { checks, strength, isValid };
};

export type ValidationError = {
  field: string;
  message: string;
};

export type ActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: ValidationError[];
  message?: string;
};
