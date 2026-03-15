import express from "express";
import { checkSymptoms } from "../controllers/symptomController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimitMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { symptomValidation } from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.post("/check", aiLimiter, symptomValidation, validateRequest, checkSymptoms);

export default router;
