import pino from "pino";
import pinoHttp from "pino-http";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.currentPassword",
  "req.body.newPassword",
  "req.body.token",
  "req.body.email",
  "res.headers['set-cookie']"
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined,
  redact: {
    paths: redactPaths,
    censor: "[Redacted]"
  },
  formatters: {
    level: (label) => ({ level: label })
  }
});

export const requestLogger = pinoHttp({
  logger,
  quietReqLogger: true,
  genReqId: (req) => req.id,
  customProps: (req) => ({
    requestId: req.id
  }),
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      remoteAddress: req.socket?.remoteAddress
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});

export const withRequestId = (req, meta = {}) => ({
  requestId: req.id,
  ...meta
});
