import { logger } from "../utils/logger.js";
import { applicationErrorCounter } from "../config/metrics.js";

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || "Server error",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.id
  };

  applicationErrorCounter.inc({
    source: "express",
    status_code: String(statusCode)
  });

  logger.error("Request failed", {
    requestId: req.id,
    statusCode,
    path: req.originalUrl,
    message: error.message,
    method: req.method,
    stack: error.stack
  });

  if (process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};
