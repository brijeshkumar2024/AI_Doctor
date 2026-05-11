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

export const totalReportsProcessed = new client.Counter({
  name: "total_reports_processed",
  help: "Total number of reports processed",
  registers: [register]
});

export const ocrProcessingDurationMs = new client.Histogram({
  name: "ocr_processing_duration_ms",
  help: "OCR processing duration in milliseconds",
  buckets: [50, 100, 300, 500, 1000, 2000, 5000, 10000, 20000],
  registers: [register]
});

export const aiAnalysisDurationMs = new client.Histogram({
  name: "ai_analysis_duration_ms",
  help: "AI analysis duration in milliseconds",
  labelNames: ["operation"],
  buckets: [50, 100, 300, 500, 1000, 2000, 5000, 10000, 20000],
  registers: [register]
});

export const activeQueueJobs = new client.Gauge({
  name: "active_queue_jobs",
  help: "Currently active queue jobs",
  labelNames: ["queue"],
  registers: [register]
});

export const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
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
  const startTime = Date.now();

  res.on("finish", () => {
    const routePath = req.route?.path
      ? `${req.baseUrl || ""}${req.route.path}`
      : req.originalUrl?.split("?")[0] || req.path;

    stopTimer({
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode)
    });
    httpRequestDurationMs.observe(
      {
        method: req.method,
        route: routePath,
        status_code: String(res.statusCode)
      },
      Date.now() - startTime
    );
  });

  next();
};

export const metricsHandler = async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
};

export { register as metricsRegistry };
