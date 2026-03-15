import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";
import crypto from "crypto";
import { sendPasswordResetLink } from "../services/emailService.js";
import { buildAuthCookieOptions, buildClearAuthCookieOptions } from "../utils/cookies.js";

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  height: user.height,
  weight: user.weight,
  medicalHistory: user.medicalHistory,
  allergies: user.allergies,
  preferredLanguage: user.preferredLanguage
});

export const signup = asyncHandler(async (req, res) => {
  const { email, password, ...rest } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    email,
    password,
    ...rest
  });

  res.cookie("token", generateToken(user._id), buildAuthCookieOptions());

  res.status(201).json({
    success: true,
    user: buildAuthResponse(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  res.cookie("token", generateToken(user._id), buildAuthCookieOptions());

  res.json({
    success: true,
    user: buildAuthResponse(user)
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", buildClearAuthCookieOptions());
  res.json({
    success: true,
    message: "Logged out successfully."
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.json({
      success: true,
      message: "If the email exists, a reset link has been generated."
    });
    return;
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  await sendPasswordResetLink({ email: user.email, resetLink });

  res.json({
    success: true,
    message: "If the email exists, a reset link has been generated."
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    const error = new Error("Reset token is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.clearCookie("token", buildClearAuthCookieOptions());

  res.json({
    success: true,
    message: "Password has been reset successfully."
  });
});
