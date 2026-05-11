import { Queue, QueueEvents, Worker } from "bullmq";
import { getRedisClient, isRedisEnabled } from "./redis.js";
import { logger } from "../utils/logger.js";

export const QUEUE_NAMES = {
  reportProcessing: "report-processing",
  prescriptionProcessing: "prescription-processing"
};

const queueCache = new Map();
const queueEventCache = new Map();

const getConnection = () => getRedisClient();

export const isQueueEnabled = () =>
  process.env.QUEUE_ENABLED !== "false" && isRedisEnabled();

export const getQueue = (name) => {
  if (!isQueueEnabled()) {
    return null;
  }

  if (!queueCache.has(name)) {
    queueCache.set(
      name,
      new Queue(name, {
        connection: getConnection(),
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: "exponential",
            delay: 5000
          },
          removeOnComplete: 100,
          removeOnFail: 100
        }
      })
    );
  }

  return queueCache.get(name);
};

export const getQueueEvents = (name) => {
  if (!isQueueEnabled()) {
    return null;
  }

  if (!queueEventCache.has(name)) {
    const queueEvents = new QueueEvents(name, { connection: getConnection() });
    queueEvents.on("failed", ({ jobId, failedReason }) => {
      logger.warn({ queue: name, jobId, failedReason }, "Queue job failed");
    });
    queueEventCache.set(name, queueEvents);
  }

  return queueEventCache.get(name);
};

export const createQueueWorker = (name, processor) => {
  if (!isQueueEnabled()) {
    return null;
  }

  return new Worker(name, processor, {
    connection: getConnection(),
    concurrency: Number(process.env.QUEUE_CONCURRENCY || 2)
  });
};

export const closeQueues = async () => {
  await Promise.all(
    [
      ...queueCache.values(),
      ...queueEventCache.values()
    ].map(async (resource) => {
      try {
        await resource.close();
      } catch (_error) {
        // Ignore shutdown races.
      }
    })
  );
  queueCache.clear();
  queueEventCache.clear();
};

export const getQueueStatus = () => ({
  enabled: isQueueEnabled(),
  concurrency: Number(process.env.QUEUE_CONCURRENCY || 2),
  queueNames: Object.values(QUEUE_NAMES)
});
