import "dotenv/config";
import app from "./app.js";
import connectDB, { closeDBConnection } from "./config/db.js";
import { closeRedis, connectRedis } from "./config/redis.js";
import { logger } from "./utils/logger.js";
import { logStartupStatus } from "./services/startupService.js";

const port = process.env.PORT || 5000;
let server;

const shutdown = async (signal) => {
  logger.info({ signal }, "Shutdown signal received");

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
    logger.info({ port }, "Backend server running");
  });
};

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    logger.error({ message: error.message, stack: error.stack }, "Shutdown failed");
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    logger.error({ message: error.message, stack: error.stack }, "Shutdown failed");
    process.exit(1);
  });
});

startServer().catch((error) => {
  logger.error({
    message: error.message,
    stack: error.stack
  }, "Failed to start server");
  process.exit(1);
});
