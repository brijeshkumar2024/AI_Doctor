import Prescription from "../models/Prescription.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteCloudinaryAsset, uploadBufferToCloudinary } from "../services/cloudinaryService.js";
import { enqueuePrescriptionProcessingJob } from "../services/jobProcessorService.js";
import { processPrescriptionRecord } from "../services/reportProcessingService.js";
import { isQueueEnabled } from "../config/queue.js";
import { PRESCRIPTION_PROCESSING_STATUS } from "../utils/constants.js";

const shouldProcessAsync = () =>
  isQueueEnabled() && process.env.ASYNC_REPORT_PROCESSING !== "false";

export const uploadPrescription = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("Prescription image is required");
    error.statusCode = 400;
    throw error;
  }

  let cloudinaryFile;
  let prescription;

  try {
    cloudinaryFile = await uploadBufferToCloudinary(
      req.file.buffer,
      "ai-health/prescriptions",
      `${Date.now()}-${req.file.originalname}`,
      "image"
    );

    prescription = await Prescription.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: cloudinaryFile.secure_url,
      cloudinaryPublicId: cloudinaryFile.public_id,
      processingStatus: shouldProcessAsync()
        ? PRESCRIPTION_PROCESSING_STATUS.PENDING
        : PRESCRIPTION_PROCESSING_STATUS.PROCESSING
    });

    if (shouldProcessAsync()) {
      try {
        await enqueuePrescriptionProcessingJob({
          prescriptionId: prescription._id.toString(),
          file: {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname
          },
          language: req.user.preferredLanguage,
          requestId: req.id
        });
      } catch (_queueError) {
        const processedPrescription = await processPrescriptionRecord({
          prescriptionId: prescription._id,
          file: req.file,
          language: req.user.preferredLanguage
        });

        res.status(201).json({
          success: true,
          queued: false,
          prescription: processedPrescription
        });
        return;
      }

      res.status(202).json({
        success: true,
        queued: true,
        prescription
      });
      return;
    }

    const processedPrescription = await processPrescriptionRecord({
      prescriptionId: prescription._id,
      file: req.file,
      language: req.user.preferredLanguage
    });

    res.status(201).json({
      success: true,
      queued: false,
      prescription: processedPrescription
    });
  } catch (error) {
    if (!prescription && cloudinaryFile?.public_id) {
      await deleteCloudinaryAsset(cloudinaryFile.public_id, "image");
    }

    throw error;
  }
});

export const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    prescriptions
  });
});
