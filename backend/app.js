import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import symptomRoutes from "./routes/symptomRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sharedRoutes from "./routes/sharedRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { applySecurityHeaders, sanitizeRequest } from "./middleware/securityMiddleware.js";
import { metricsHandler, metricsMiddleware } from "./config/metrics.js";
import { getDatabaseStatus } from "./config/db.js";
import { getQueue, isQueueEnabled, QUEUE_NAMES } from "./config/queue.js";
import { getRedisStatus, isRedisEnabled } from "./config/redis.js";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger.js";
import { logger, requestLogger } from "./utils/logger.js";
import { getAiProviderStatus } from "./services/aiProviderService.js";
import { getCloudinaryStatus } from "./services/cloudinaryService.js";
import { getEmailServiceStatus } from "./services/emailService.js";

const app = express();
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";
const metricsEnabled =
  process.env.ENABLE_METRICS === "true" ||
  (process.env.NODE_ENV !== "production" && process.env.ENABLE_METRICS !== "false");
const metricsUsername = process.env.METRICS_USERNAME || "";
const metricsPassword = process.env.METRICS_PASSWORD || "";
const metricsAuthRequired =
  metricsEnabled &&
  (process.env.NODE_ENV === "production" || Boolean(metricsUsername && metricsPassword));

const parseBasicAuthHeader = (headerValue = "") => {
  if (!headerValue.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = Buffer.from(headerValue.slice(6), "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch (_error) {
    return null;
  }
};

const metricsAccessMiddleware = (req, res, next) => {
  if (!metricsEnabled) {
    res.status(404).json({
      success: false,
      message: "Metrics endpoint is disabled"
    });
    return;
  }

  if (!metricsAuthRequired) {
    next();
    return;
  }

  if (!metricsUsername || !metricsPassword) {
    res.status(503).json({
      success: false,
      message: "Metrics authentication is not configured"
    });
    return;
  }

  const credentials = parseBasicAuthHeader(req.headers.authorization);

  if (!credentials || credentials.username !== metricsUsername || credentials.password !== metricsPassword) {
    res.set("WWW-Authenticate", 'Basic realm="metrics"');
    res.status(401).json({
      success: false,
      message: "Metrics authentication required"
    });
    return;
  }

  next();
};

const getQueueSnapshot = async () => {
  if (!isQueueEnabled()) {
    return { enabled: false };
  }

  const reportQueue = getQueue(QUEUE_NAMES.reportProcessing);
  const counts = reportQueue ? await reportQueue.getJobCounts("waiting", "active", "completed", "failed") : {};
  return {
    enabled: true,
    ...counts
  };
};

const healthResponse = async () => ({
  success: true,
  data: {
    status: getDatabaseStatus().state === "connected" ? "ok" : "degraded",
    uptime: Number(process.uptime().toFixed(2)),
    db: getDatabaseStatus(),
    redis: getRedisStatus(),
    queue: await getQueueSnapshot()
  },
  message: "Service health fetched",
  error: "",
  status: getDatabaseStatus().state === "connected" ? "ok" : "degraded",
  timestamp: new Date().toISOString(),
  uptime: Number(process.uptime().toFixed(2)),
  database: getDatabaseStatus(),
  redis: getRedisStatus(),
  queue: {
    enabled: isQueueEnabled()
  },
  aiProvider: getAiProviderStatus(),
  cloudinary: getCloudinaryStatus(),
  email: getEmailServiceStatus(),
  environment: {
    nodeEnv: process.env.NODE_ENV || "development"
  }
});

app.set("trust proxy", 1);
app.use(applySecurityHeaders);
app.use((req, _res, next) => {
  req.id = req.headers["x-request-id"]?.toString() || crypto.randomUUID();
  next();
});
app.use(requestLogger);
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"]
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));
app.use(sanitizeRequest);
app.use(metricsMiddleware);

app.get("/health", async (_req, res) => {
  res.json(await healthResponse());
});

app.get("/api/health", async (_req, res) => {
  res.json(await healthResponse());
});

app.get("/metrics", metricsAccessMiddleware, metricsHandler);
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/shared", sharedRoutes);

app.use(notFound);
app.use(errorHandler);

logger.info("Express app initialized");

export default app;
