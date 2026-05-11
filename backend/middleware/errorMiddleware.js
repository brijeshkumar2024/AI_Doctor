import { logger } from "../utils/logger.js";
import { applicationErrorCounter } from "../config/metrics.js";

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const details = Array.isArray(error.details) && error.details.length > 0 ? error.details : undefined;
  const isOperational = Boolean(error.errorCode) || statusCode < 500;
  const safeMessage = isOperational ? error.message || "Server error" : "Internal server error";
  const payload = {
    success: false,
    data: {},
    message: safeMessage,
    error: error.errorCode || "REQUEST_FAILED",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.id
  };

  if (details) {
    payload.errors = details;
  }

  applicationErrorCounter.inc({
    source: "express",
    status_code: String(statusCode)
  });

  logger.error({
    requestId: req.id,
    statusCode,
    path: req.originalUrl,
    message,
    method: req.method,
    details,
    stack: error.stack
  }, "Request failed");

  if (process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};
