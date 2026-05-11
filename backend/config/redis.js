import Redis from "ioredis";
import { logger } from "../utils/logger.js";
import { externalServiceFailureCounter } from "./metrics.js";

let redisClient;

const shouldUseRedis = () =>
  Boolean(process.env.REDIS_URL) && process.env.REDIS_ENABLED !== "false";

export const getRedisClient = () => {
  if (!shouldUseRedis()) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected");
    });

    redisClient.on("error", (error) => {
      logger.warn({
        message: error.message
      }, "Redis connection error");
    });
  }

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  if (client.status === "wait") {
    try {
      await client.connect();
    } catch (error) {
      externalServiceFailureCounter.inc({
        service: "redis",
        operation: "connect"
      });
      logger.warn({
        message: error.message
      }, "Redis failed to connect");
      throw error;
    }
  }

  return client;
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = undefined;
  }
};

export const isRedisEnabled = () => Boolean(getRedisClient());

export const getRedisStatus = () => {
  const client = getRedisClient();

  return {
    configured: Boolean(process.env.REDIS_URL),
    enabled: Boolean(client),
    status: client?.status || "disabled"
  };
};
