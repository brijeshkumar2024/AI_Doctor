import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";
import { externalServiceFailureCounter } from "../config/metrics.js";

let transporter;

const getSmtpHint = () => {
  if ((process.env.SMTP_HOST || "").includes("gmail.com")) {
    return "Gmail SMTP requires a valid app password when 2-Step Verification is enabled.";
  }

  return undefined;
};

const isDevelopment = () => process.env.NODE_ENV === "development";

const logDevelopmentResetLink = ({ email, resetLink, reason }) => {
  logger.info({
    email,
    resetLink,
    reason
  }, "Password reset link generated for development");
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!process.env.SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
  });

  return transporter;
};

export const getEmailServiceStatus = () => ({
  configured: Boolean(process.env.SMTP_HOST),
  host: process.env.SMTP_HOST || "",
  secure: process.env.SMTP_SECURE === "true",
  port: Number(process.env.SMTP_PORT || 587)
});

export const verifyEmailService = async () => {
  const smtpTransporter = getTransporter();
  if (!smtpTransporter) {
    return {
      configured: false,
      verified: false
    };
  }

  try {
    await smtpTransporter.verify();
    return {
      configured: true,
      verified: true
    };
  } catch (error) {
    externalServiceFailureCounter.inc({
      service: "smtp",
      operation: "verify"
    });

    const payload = {
      message: error.message,
      host: process.env.SMTP_HOST || "",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      hint: getSmtpHint()
    };

    if (isDevelopment()) {
      logger.info(payload, "SMTP verification failed in development");
    } else {
      logger.warn(payload, "SMTP verification failed");
    }

    return {
      configured: true,
      verified: false,
      error: error.message
    };
  }
};

export const sendPasswordResetLink = async ({ email, resetLink }) => {
  const smtpTransporter = getTransporter();

  if (!smtpTransporter) {
    if (isDevelopment()) {
      logDevelopmentResetLink({
        email,
        resetLink,
        reason: "smtp_not_configured"
      });
      return;
    }

    const error = new Error("SMTP is not configured for production password reset emails");
    error.statusCode = 500;
    throw error;
  }

  try {
    await smtpTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Reset your AI Health Report Analyzer password",
      text: `Use this link to reset your password. It expires in 30 minutes:\n\n${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Password Reset</h2>
          <p>Use the link below to reset your password. The link expires in 30 minutes.</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    externalServiceFailureCounter.inc({
      service: "smtp",
      operation: "send_password_reset"
    });

    if (isDevelopment()) {
      logger.info({
        email,
        smtpError: error.message,
        hint: getSmtpHint()
      }, "SMTP send failed in development; using local reset link fallback");
      logDevelopmentResetLink({
        email,
        resetLink,
        reason: "smtp_send_failed"
      });
      return;
    }

    logger.warn({
      message: error.message,
      email,
      hint: getSmtpHint()
    }, "Password reset email failed");
    throw error;
  }
};
