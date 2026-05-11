import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendPasswordResetLink } from "../services/emailService.js";
import {
  buildAccessTokenCookieOptions,
  buildClearAuthCookieOptions,
  buildRefreshTokenCookieOptions
} from "../utils/cookies.js";
import AppError from "../utils/AppError.js";

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

const setAuthCookies = async (res, user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, buildAccessTokenCookieOptions());
  res.cookie("token", accessToken, buildAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, buildRefreshTokenCookieOptions());
};

export const signup = asyncHandler(async (req, res) => {
  const { email, password, ...rest } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409, "USER_EXISTS");
  }

  const user = await User.create({
    email,
    password,
    ...rest
  });

  await setAuthCookies(res, user);

  res.status(201).json({
    success: true,
    data: { user: buildAuthResponse(user) },
    user: buildAuthResponse(user),
    message: "Signup successful",
    error: ""
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  await setAuthCookies(res, user);

  res.json({
    success: true,
    data: { user: buildAuthResponse(user) },
    user: buildAuthResponse(user),
    message: "Login successful",
    error: ""
  });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    throw new AppError("Refresh token is missing", 401, "REFRESH_TOKEN_MISSING");
  }

  const decoded = jwt.verify(
    rawRefreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  );

  if (decoded.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(rawRefreshToken)) {
    throw new AppError("Refresh session is invalid", 401, "REFRESH_SESSION_INVALID");
  }

  await setAuthCookies(res, user);

  res.json({
    success: true,
    data: { user: buildAuthResponse(user) },
    user: buildAuthResponse(user),
    message: "Session refreshed",
    error: ""
  });
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (rawRefreshToken) {
    const refreshTokenHash = hashToken(rawRefreshToken);
    await User.updateOne({ refreshTokenHash }, { $set: { refreshTokenHash: null } });
  }

  res.clearCookie("accessToken", buildClearAuthCookieOptions());
  res.clearCookie("refreshToken", {
    ...buildClearAuthCookieOptions(),
    path: "/api/auth/refresh"
  });
  res.clearCookie("token", buildClearAuthCookieOptions());
  res.json({
    success: true,
    data: {},
    message: "Logged out successfully.",
    error: ""
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
    user: req.user,
    message: "Current user fetched",
    error: ""
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.json({
      success: true,
      data: {},
      message: "If the email exists, a reset link has been generated.",
      error: ""
    });
    return;
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  await sendPasswordResetLink({ email: user.email, resetLink });

  res.json({
    success: true,
    data: {},
    message: "If the email exists, a reset link has been generated.",
    error: ""
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400, "RESET_TOKEN_INVALID");
  }

  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.clearCookie("token", buildClearAuthCookieOptions());

  res.json({
    success: true,
    data: {},
    message: "Password has been reset successfully.",
    error: ""
  });
});
