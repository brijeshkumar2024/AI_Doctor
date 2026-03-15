import express from "express";
import { getChatHistory, sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimitMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { chatValidation } from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.get("/", getChatHistory);
router.post("/", aiLimiter, chatValidation, validateRequest, sendMessage);

export default router;
