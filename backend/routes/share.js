import express from "express";
import { body } from "express-validator";
import ShareLink from "../models/ShareLink.js";
import { createShareLink, validateShareLink, revokeShareLink, getShareLinksForReport } from "../services/shareLink.service.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { shareLinksCreatedTotal, shareLinksAccessedTotal, shareLinksRevokedTotal } from "../config/metrics.js";

const router = express.Router();

// Protected routes (require auth)
const protectedRouter = express.Router();
protectedRouter.use(protect);

// POST /api/reports/:id/share
protectedRouter.post("/reports/:id/share", [
  body("expiresInDays").isInt({ min: 1, max: 30 }).withMessage("expiresInDays must be between 1 and 30"),
  body("maxAccess").isInt({ min: 1, max: 100 }).withMessage("maxAccess must be between 1 and 100"),
  body("doctorNote").optional().isLength({ max: 500 }).withMessage("doctorNote must be less than 500 characters")
], validateRequest, async (req, res) => {
  try {
    const { id: reportId } = req.params;
    const { expiresInDays, maxAccess, doctorNote } = req.body;
    const userId = req.user._id.toString();

    const result = await createShareLink(reportId, userId, { expiresInDays, maxAccess, doctorNote });

    shareLinksCreatedTotal.inc();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/reports/:id/share/:token
protectedRouter.delete("/reports/:id/share/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id.toString();

    await revokeShareLink(token, userId);

    shareLinksRevokedTotal.inc();

    res.json({
      success: true,
      message: "Share link revoked"
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/reports/:id/shares
protectedRouter.get("/reports/:id/shares", async (req, res) => {
  try {
    const { id: reportId } = req.params;
    const userId = req.user._id.toString();

    const shareLinks = await getShareLinksForReport(reportId, userId);

    res.json({
      success: true,
      data: { shareLinks }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Public routes (no auth required)
// GET /api/shared/:token
router.get("/shared/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const result = await validateShareLink(token, ipAddress, userAgent);

    shareLinksAccessedTotal.inc();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

export { protectedRouter, router as publicRouter };