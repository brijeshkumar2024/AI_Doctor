import express from "express";
import { getSharedReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/reports/:token", getSharedReport);

export default router;
