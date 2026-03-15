import express from "express";
import { updateLanguage, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import validateZod from "../middleware/validateZod.js";
import {
  languageSchema,
  languageValidation,
  profileSchema,
  profileValidation
} from "../utils/validators.js";

const router = express.Router();

router.use(protect);
router.put("/", profileValidation, validateRequest, validateZod(profileSchema), updateProfile);
router.put("/language", languageValidation, validateRequest, validateZod(languageSchema), updateLanguage);

export default router;
