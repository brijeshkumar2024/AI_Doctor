import { afterEach, describe, expect, it, jest } from "@jest/globals";

const verifyMock = jest.fn();
const sendMailMock = jest.fn();
const createTransportMock = jest.fn(() => ({
  verify: verifyMock,
  sendMail: sendMailMock
}));
const loggerInfoMock = jest.fn();
const loggerWarnMock = jest.fn();

jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: createTransportMock
  }
}));

jest.unstable_mockModule("../utils/logger.js", () => ({
  logger: {
    info: loggerInfoMock,
    warn: loggerWarnMock
  }
}));

jest.unstable_mockModule("../config/metrics.js", () => ({
  externalServiceFailureCounter: {
    inc: jest.fn()
  }
}));

const { sendPasswordResetLink } = await import("../services/emailService.js");

describe("emailService", () => {
  afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.SMTP_HOST = "smtp.test";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "user@test.dev";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM = "Test <user@test.dev>";
  });

  it("falls back to a logged reset link when smtp send fails in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.SMTP_HOST = "smtp.gmail.com";
    sendMailMock.mockRejectedValueOnce(new Error("Invalid login: 535-5.7.8 Username and Password not accepted"));

    await expect(
      sendPasswordResetLink({
        email: "patient@example.com",
        resetLink: "http://localhost:5173/reset-password?token=test-token"
      })
    ).resolves.toBeUndefined();

    expect(sendMailMock).toHaveBeenCalled();
    expect(loggerInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "patient@example.com",
        smtpError: expect.stringContaining("Invalid login"),
        hint: expect.stringContaining("app password")
      }),
      "SMTP send failed in development; using local reset link fallback"
    );
    expect(loggerInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "patient@example.com",
        resetLink: expect.stringContaining("reset-password?token=test-token"),
        reason: "smtp_send_failed"
      }),
      "Password reset link generated for development"
    );
  });

  it("throws when smtp send fails outside development", async () => {
    process.env.NODE_ENV = "production";
    sendMailMock.mockRejectedValueOnce(new Error("smtp auth failed"));

    await expect(
      sendPasswordResetLink({
        email: "patient@example.com",
        resetLink: "http://localhost:5173/reset-password?token=test-token"
      })
    ).rejects.toThrow("smtp auth failed");

    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "smtp auth failed",
        email: "patient@example.com"
      }),
      "Password reset email failed"
    );
  });
});
