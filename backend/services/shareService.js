import crypto from "crypto";
import { DEFAULT_SHARE_LINK_HOURS } from "../utils/constants.js";

const getSecret = () => process.env.SHARE_LINK_SECRET || process.env.JWT_SECRET || "change-me";

const signPayload = (payload) =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");

export const createSignedReportToken = ({ reportId, userId, shareVersion, expiresInHours = DEFAULT_SHARE_LINK_HOURS }) => {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const payload = JSON.stringify({
    reportId,
    userId,
    shareVersion,
    expiresAt
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = signPayload(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(expiresAt).toISOString()
  };
};

export const verifySignedReportToken = (token = "") => {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid share token");
  }

  const expectedSignature = signPayload(encodedPayload);
  if (expectedSignature !== signature) {
    throw new Error("Invalid share token signature");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (Date.now() > payload.expiresAt) {
    throw new Error("Share token has expired");
  }

  return payload;
};
