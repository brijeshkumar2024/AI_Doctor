import express from "express";
import { getPrescriptions, uploadPrescription } from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, enforceSafeUpload } from "../middleware/uploadMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.use(protect);
router
  .route("/")
  .get(getPrescriptions)
  .post(uploadLimiter, upload.single("prescription"), enforceSafeUpload, uploadPrescription);

export default router;
