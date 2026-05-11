import jwt from "jsonwebtoken";
import crypto from "crypto";

const accessExpiry = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const generateAccessToken = (userId) =>
  jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, { expiresIn: accessExpiry });

export const generateRefreshToken = (userId) =>
  jwt.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: refreshExpiry
  });

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
