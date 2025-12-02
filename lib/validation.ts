import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

// Signup schema
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

// Email validation
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

// Password validation
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

// Name validation
export const validateProfileName = (name: string, fieldName: string) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return null;
  }

  if (trimmedName.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }

  if (trimmedName.length > 50) {
    return `${fieldName} cannot be more than 50 characters long`;
  }

  if (fieldName === "First name") {
    if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(trimmedName)) {
      return `${fieldName} Can only contain letters`;
    }
  }

  return null;
};

// Date validation
export const validateDateOfBirth = (dateOfBirth: string) => {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (birthDate > today) {
    return "Birth date cannot be in the future";
  }

  if (age > 150) {
    return "Please enter a valid birth date";
  }

  if (age < 16) {
    return "You must be at least 16 years old to use this service";
  }

  return null;
};

// Profile validation
export const validateProfile = (
  firstName: string,
  lastName: string,
  dateOfBirth: string
) => {
  const firstNameError = validateProfileName(firstName, "First name");
  if (firstNameError) return firstNameError;

  const lastNameError = validateProfileName(lastName, "Last name");
  if (lastNameError) return lastNameError;

  const dateOfBirthError = validateDateOfBirth(dateOfBirth);
  if (dateOfBirthError) return dateOfBirthError;

  return null;
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
