import "dotenv/config";
import app from "./app.js";
import connectDB, { closeDBConnection } from "./config/db.js";
import { closeRedis, connectRedis } from "./config/redis.js";
import { logger } from "./utils/logger.js";
import { logStartupStatus } from "./services/startupService.js";

const port = process.env.PORT || 5000;
let server;

const shutdown = async (signal) => {
  logger.info("Shutdown signal received", { signal });

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await closeDBConnection();
  await closeRedis();
  process.exit(0);
};

const startServer = async () => {
  await connectDB();
  await connectRedis();
  await logStartupStatus({ context: "server" });

  server = app.listen(port, () => {
    logger.info("Backend server running", { port });
  });
};

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    logger.error("Shutdown failed", { message: error.message, stack: error.stack });
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    logger.error("Shutdown failed", { message: error.message, stack: error.stack });
    process.exit(1);
  });
});

startServer().catch((error) => {
  logger.error("Failed to start server", {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
