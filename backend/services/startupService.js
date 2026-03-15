import { getDatabaseStatus } from "../config/db.js";
import { getRedisStatus } from "../config/redis.js";
import { getQueueStatus } from "../config/queue.js";
import { getAiProviderStatus } from "./aiProviderService.js";
import { getCloudinaryStatus } from "./cloudinaryService.js";
import { getEmailServiceStatus, verifyEmailService } from "./emailService.js";
import { logger } from "../utils/logger.js";

export const getServiceStatusSnapshot = async ({ workerCount = 0 } = {}) => {
  const [emailVerification] = await Promise.all([
    verifyEmailService()
  ]);

  return {
    database: getDatabaseStatus(),
    redis: getRedisStatus(),
    queue: {
      ...getQueueStatus(),
      workerCount
    },
    aiProvider: getAiProviderStatus(),
    cloudinary: getCloudinaryStatus(),
    email: {
      ...getEmailServiceStatus(),
      verified: emailVerification.verified,
      verificationError: emailVerification.error || ""
    }
  };
};

export const logStartupStatus = async ({ context = "server", workerCount = 0 } = {}) => {
  const status = await getServiceStatusSnapshot({ workerCount });

  logger.info("Subsystem startup status", {
    context,
    services: status
  });

  return status;
};
