import "dotenv/config";
import connectDB, { closeDBConnection } from "./config/db.js";
import { closeRedis, connectRedis } from "./config/redis.js";
import { closeQueues } from "./config/queue.js";
import { startQueueWorkers } from "./services/jobProcessorService.js";
import { logStartupStatus } from "./services/startupService.js";
import { logger } from "./utils/logger.js";

let workers = [];

const shutdown = async (signal) => {
  logger.info({ signal }, "Worker shutdown signal received");
  await Promise.all(workers.map((worker) => worker.close()));
  await closeQueues();
  await closeRedis();
  await closeDBConnection();
  process.exit(0);
};

const start = async () => {
  await connectDB();
  await connectRedis();
  workers = startQueueWorkers();
  await logStartupStatus({ context: "worker", workerCount: workers.length });
  logger.info({ workerCount: workers.length }, "Background worker started");
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  logger.error({
    message: error.message,
    stack: error.stack
  }, "Failed to start worker");
  process.exit(1);
});
