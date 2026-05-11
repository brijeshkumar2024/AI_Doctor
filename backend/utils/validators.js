import { body, query } from "express-validator";
import { z } from "zod";

export const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be a whole number between 1 and 120"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", ""])
    .withMessage("Gender must be male, female, other, or empty"),
  body("height")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Height must be 20 characters or fewer"),
  body("weight")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Weight must be 20 characters or fewer"),
  body("medicalHistory")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Medical history must be 2000 characters or fewer"),
  body("allergies")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Allergies must be 2000 characters or fewer"),
  body("preferredLanguage")
    .optional()
    .isIn(["en", "hi", "bn"])
    .withMessage("Preferred language must be en, hi, or bn")
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required")
];

export const resetPasswordValidation = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
];

export const profileValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("currentPassword")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Current password must be at least 8 characters"),
  body("newPassword")
    .optional()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
  body("preferredLanguage")
    .optional()
    .isIn(["en", "hi", "bn"])
    .withMessage("Preferred language must be en, hi, or bn")
];

export const languageValidation = [
  body("preferredLanguage")
    .notEmpty()
    .isIn(["en", "hi", "bn"])
    .withMessage("Preferred language must be en, hi, or bn")
];

export const symptomValidation = [
  body("symptoms").trim().notEmpty().withMessage("Symptoms are required")
];

export const chatValidation = [
  body("message").trim().notEmpty().withMessage("Message is required")
];

export const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("status")
    .optional()
    .isIn(["pending", "processing", "completed", "failed"])
    .withMessage("Status must be pending, processing, completed, or failed")
];

export const shareReportValidation = [
  body("expiresInHours")
    .optional()
    .isFloat({ min: 1, max: 168 })
    .withMessage("expiresInHours must be between 1 and 168")
];

export const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().positive().max(120).optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  medicalHistory: z.string().max(2000).optional(),
  allergies: z.string().max(2000).optional(),
  preferredLanguage: z.enum(["en", "hi", "bn"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});

export const profileSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    age: z.number().int().positive().max(120).optional(),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    height: z.string().max(20).optional(),
    weight: z.string().max(20).optional(),
    medicalHistory: z.string().max(2000).optional(),
    allergies: z.string().max(2000).optional(),
    preferredLanguage: z.enum(["en", "hi", "bn"]).optional(),
    currentPassword: z.string().min(8).optional(),
    newPassword: z.string().min(8).optional()
  })
  .superRefine((data, ctx) => {
    if ((data.currentPassword && !data.newPassword) || (!data.currentPassword && data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Both currentPassword and newPassword are required to change password"
      });
    }
  });

export const languageSchema = z.object({
  preferredLanguage: z.enum(["en", "hi", "bn"])
});

export const shareReportSchema = z.object({
  expiresInHours: z.coerce.number().min(1).max(168).optional()
});
