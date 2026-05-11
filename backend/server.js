import "dotenv/config";
import app from "./app.js";
import connectDB, { closeDBConnection } from "./config/db.js";
import { closeRedis, connectRedis } from "./config/redis.js";
import { logger } from "./utils/logger.js";
import { logStartupStatus } from "./services/startupService.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./services/socket.service.js";

const port = process.env.PORT || 5000;
let server;
let io;

export { io };
let io;

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

  const httpServer = createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST"]
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  initSocket(io);

  httpServer.listen(port, () => {
    logger.info({ port }, "Backend server running");
  });

  server = httpServer;
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
