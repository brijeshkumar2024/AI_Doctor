import express from "express";
import { validateShareLink } from "../services/shareLink.service.js";
import { shareLinksAccessedTotal } from "../config/metrics.js";

const router = express.Router();

// GET /api/shared/:token
router.get("/:token", async (req, res) => {
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

export default router;
