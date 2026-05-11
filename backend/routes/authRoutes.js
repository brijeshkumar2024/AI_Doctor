import express from "express";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refreshSession,
  resetPassword,
  signup
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import validateZod from "../middleware/validateZod.js";
import {
  forgotPasswordValidation,
  forgotPasswordSchema,
  loginValidation,
  loginSchema,
  resetPasswordValidation,
  resetPasswordSchema,
  signupValidation,
  signupSchema
} from "../utils/validators.js";

const router = express.Router();

router.post("/signup", authLimiter, signupValidation, validateRequest, validateZod(signupSchema), signup);
router.post("/login", authLimiter, loginValidation, validateRequest, validateZod(loginSchema), login);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  validateRequest,
  validateZod(forgotPasswordSchema),
  forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  validateRequest,
  validateZod(resetPasswordSchema),
  resetPassword
);
router.get("/me", protect, getCurrentUser);
router.post("/refresh", authLimiter, refreshSession);
router.post("/logout", logout);

export default router;
