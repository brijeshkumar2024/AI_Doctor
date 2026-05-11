import crypto from "crypto";
import { addDays } from "date-fns";
import QRCode from "qrcode";
import ShareLink from "../models/ShareLink.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const generateShareToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const createShareLink = async (reportId, userId, options = {}) => {
  const { expiresInDays = 7, maxAccess = 10, doctorNote = "" } = options;

  // Validate report exists and belongs to user
  const report = await Report.findOne({ _id: reportId, user: userId });
  if (!report) {
    throw new AppError("Report not found or access denied", 404);
  }

  // Check existing active share links for this report
  const activeLinksCount = await ShareLink.countDocuments({
    reportId,
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  if (activeLinksCount >= 5) {
    throw new AppError("Maximum 5 active share links per report", 429);
  }

  const token = generateShareToken();
  const expiresAt = addDays(new Date(), expiresInDays);

  const shareLink = new ShareLink({
    token,
    reportId,
    userId,
    expiresAt,
    maxAccess,
    doctorNote
  });

  await shareLink.save();

  const shareUrl = `${process.env.FRONTEND_URL}/shared/${token}`;

  let qrCode = null;
  try {
    qrCode = await QRCode.toDataURL(shareUrl, {
      width: 256,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" }
    });
  } catch (qrError) {
    logger.warn({ error: qrError.message }, "Failed to generate QR code, continuing without it");
  }

  return {
    shareUrl,
    token,
    expiresAt,
    maxAccess,
    qrCode,
    doctorNote
  };
};

export const validateShareLink = async (token, ipAddress, userAgent) => {
  const shareLink = await ShareLink.findOneAndUpdate(
    { token },
    {
      $inc: { accessCount: 1 },
      $push: {
        accessLog: {
          $each: [{ accessedAt: new Date(), ipAddress, userAgent }],
          $slice: -50
        }
      }
    },
    { new: true }
  ).populate("reportId", "-user -cloudinaryPublicId -parserMetadata").populate("userId", "firstName");

  if (!shareLink) {
    throw new AppError("Invalid share link", 404);
  }

  if (shareLink.isRevoked) {
    throw new AppError("This link has been revoked by the owner", 410);
  }

  if (shareLink.expiresAt < new Date()) {
    throw new AppError("This link has expired", 410);
  }

  if (shareLink.accessCount > shareLink.maxAccess) {
    throw new AppError("This link has reached its maximum view limit", 410);
  }

  // Strip PII from response
  const report = {
    aiAnalysis: shareLink.reportId.aiAnalysis,
    createdAt: shareLink.reportId.createdAt,
    reportType: "medical_report"
  };

  const sharedBy = {
    firstName: shareLink.userId.firstName
  };

  return {
    report,
    sharedBy,
    doctorNote: shareLink.doctorNote,
    expiresAt: shareLink.expiresAt,
    viewsRemaining: Math.max(0, shareLink.maxAccess - shareLink.accessCount),
    accessCount: shareLink.accessCount
  };
};

export const revokeShareLink = async (token, userId) => {
  const shareLink = await ShareLink.findOne({ token });

  if (!shareLink) {
    throw new AppError("Share link not found", 404);
  }

  if (shareLink.userId.toString() !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  shareLink.isRevoked = true;
  await shareLink.save();

  return { success: true };
};

export const getShareLinksForReport = async (reportId, userId) => {
  const shareLinks = await ShareLink.find(
    { reportId, userId },
    "-accessLog" // Exclude accessLog for privacy
  ).sort({ createdAt: -1 });

  return shareLinks.map(link => ({
    token: link.token,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
    accessCount: link.accessCount,
    maxAccess: link.maxAccess,
    isRevoked: link.isRevoked,
    doctorNote: link.doctorNote,
    viewsRemaining: Math.max(0, link.maxAccess - link.accessCount)
  }));
};