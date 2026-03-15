import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "ai_health_"
});

const httpRequestDuration = new client.Histogram({
  name: "ai_health_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register]
});

export const aiRequestDurationSeconds = new client.Histogram({
  name: "ai_health_ai_request_duration_seconds",
  help: "Latency of AI provider requests",
  labelNames: ["operation"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10, 20],
  registers: [register]
});

export const ocrProcessingDurationSeconds = new client.Histogram({
  name: "ai_health_ocr_processing_duration_seconds",
  help: "Latency of OCR extraction",
  labelNames: ["file_type"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10, 20, 30],
  registers: [register]
});

export const backgroundJobCounter = new client.Counter({
  name: "ai_health_background_jobs_total",
  help: "Background jobs processed",
  labelNames: ["queue", "status"],
  registers: [register]
});

export const applicationErrorCounter = new client.Counter({
  name: "ai_health_application_errors_total",
  help: "Application errors grouped by source and status code",
  labelNames: ["source", "status_code"],
  registers: [register]
});

export const externalServiceFailureCounter = new client.Counter({
  name: "ai_health_external_service_failures_total",
  help: "Failures when calling external services",
  labelNames: ["service", "operation"],
  registers: [register]
});

export const metricsMiddleware = (req, res, next) => {
  const stopTimer = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const routePath = req.route?.path
      ? `${req.baseUrl || ""}${req.route.path}`
      : req.originalUrl?.split("?")[0] || req.path;

    stopTimer({
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode)
    });
  });

  next();
};

export const metricsHandler = async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
};

export { register as metricsRegistry };
