import { activeQueueJobs, backgroundJobCounter } from "../config/metrics.js";
import { createQueueWorker, getQueue, getQueueEvents, isQueueEnabled, QUEUE_NAMES } from "../config/queue.js";
import { processPrescriptionRecord, processReportRecord } from "./reportProcessingService.js";
import { logger } from "../utils/logger.js";

export const enqueueReportProcessingJob = async ({ reportId, file, requestId }) => {
  if (!isQueueEnabled()) {
    return null;
  }

  const queue = getQueue(QUEUE_NAMES.reportProcessing);
  getQueueEvents(QUEUE_NAMES.reportProcessing);
  return queue.add("process-report", {
    reportId,
    file: {
      ...file,
      buffer: file.buffer.toString("base64")
    },
    requestId
  });
};

export const enqueuePrescriptionProcessingJob = async ({ prescriptionId, file, language, requestId }) => {
  if (!isQueueEnabled()) {
    return null;
  }

  const queue = getQueue(QUEUE_NAMES.prescriptionProcessing);
  getQueueEvents(QUEUE_NAMES.prescriptionProcessing);
  return queue.add("process-prescription", {
    prescriptionId,
    file: {
      ...file,
      buffer: file.buffer.toString("base64")
    },
    language,
    requestId
  });
};

export const startQueueWorkers = () => {
  if (!isQueueEnabled()) {
    logger.info("Queue workers disabled");
    return [];
  }

  const reportWorker = createQueueWorker(QUEUE_NAMES.reportProcessing, async (job) => {
    activeQueueJobs.inc({ queue: QUEUE_NAMES.reportProcessing });
    try {
      const result = await processReportRecord({
        ...job.data,
        file: {
          ...job.data.file,
          buffer: Buffer.from(job.data.file.buffer, "base64")
        }
      });
      backgroundJobCounter.inc({ queue: QUEUE_NAMES.reportProcessing, status: "completed" });
      return { reportId: result._id.toString() };
    } catch (error) {
      backgroundJobCounter.inc({ queue: QUEUE_NAMES.reportProcessing, status: "failed" });
      throw error;
    } finally {
      activeQueueJobs.dec({ queue: QUEUE_NAMES.reportProcessing });
    }
  });

  const prescriptionWorker = createQueueWorker(QUEUE_NAMES.prescriptionProcessing, async (job) => {
    activeQueueJobs.inc({ queue: QUEUE_NAMES.prescriptionProcessing });
    try {
      const result = await processPrescriptionRecord({
        ...job.data,
        file: {
          ...job.data.file,
          buffer: Buffer.from(job.data.file.buffer, "base64")
        }
      });
      backgroundJobCounter.inc({ queue: QUEUE_NAMES.prescriptionProcessing, status: "completed" });
      return { prescriptionId: result._id.toString() };
    } catch (error) {
      backgroundJobCounter.inc({ queue: QUEUE_NAMES.prescriptionProcessing, status: "failed" });
      throw error;
    } finally {
      activeQueueJobs.dec({ queue: QUEUE_NAMES.prescriptionProcessing });
    }
  });

  return [reportWorker, prescriptionWorker].filter(Boolean);
};
