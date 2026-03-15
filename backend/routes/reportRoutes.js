import express from "express";
import {
  createReportShareLink,
  exportReportSummary,
  getReportById,
  getReports,
  uploadReport
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, enforceSafeUpload } from "../middleware/uploadMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { paginationValidation, shareReportValidation } from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.get("/", paginationValidation, validateRequest, getReports);
router.post("/", uploadLimiter, upload.single("report"), enforceSafeUpload, uploadReport);
router.post("/:id/share-link", shareReportValidation, validateRequest, createReportShareLink);
router.get("/:id/export-summary", exportReportSummary);
router.get("/:id", getReportById);

export default router;
