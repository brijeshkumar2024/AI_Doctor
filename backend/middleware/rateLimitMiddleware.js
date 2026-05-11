import rateLimit from "express-rate-limit";

const createRateLimiter = (windowMs, max, message, keyGenerator) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message: {
      success: false,
      message
    }
  });

const userAwareKeyGenerator = (req) => req.user?._id?.toString() || req.ip;

export const authLimiter = createRateLimiter(
  60 * 1000,
  10,
  "Too many authentication requests. Please try again later.",
  (req) => req.ip
);

export const aiLimiter = createRateLimiter(
  15 * 60 * 1000,
  40,
  "Too many AI requests. Please try again later.",
  userAwareKeyGenerator
);

export const uploadLimiter = createRateLimiter(
  60 * 1000,
  5,
  "Too many upload requests. Please try again later.",
  userAwareKeyGenerator
);
