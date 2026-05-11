import express from "express";
import HealthMetric from "../models/HealthMetric.js";
import Report from "../models/Report.js";
import { calculateTrend, PARAMETER_PATTERNS } from "../services/trendExtractor.service.js";
import { logger } from "../utils/logger.js";
import { healthMetricsExtractedTotal, trendCalculationDurationMs } from "../config/metrics.js";

const router = express.Router();

// Helper to get authenticated user ID
const getUserId = (req) => req.user._id || req.user.id;

// GET /api/trends/parameters
router.get("/parameters", async (req, res) => {
  try {
    const userId = getUserId(req);
    const parameters = await HealthMetric.distinct("parameter", { userId });
    res.json({
      success: true,
      data: { parameters }
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to get trend parameters");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve parameters"
    });
  }
});

// GET /api/trends/summary
router.get("/summary", async (req, res) => {
  try {
    const userId = getUserId(req);
    const parameters = await HealthMetric.distinct("parameter", { userId });

    const summary = [];
    for (const parameter of parameters) {
      const dataPoints = await HealthMetric.find({ userId, parameter })
        .sort({ reportDate: 1 })
        .select("value reportDate")
        .lean();

      if (dataPoints.length < 2) continue;

      const latestMetric = await HealthMetric.findOne({ userId, parameter })
        .sort({ reportDate: -1 })
        .select("value status reportDate")
        .lean();

      const trend = calculateTrend(dataPoints, PARAMETER_PATTERNS[parameter].normalRange);

      summary.push({
        parameter,
        unit: PARAMETER_PATTERNS[parameter].unit,
        normalRange: PARAMETER_PATTERNS[parameter].normalRange,
        latestValue: latestMetric.value,
        latestStatus: latestMetric.status,
        latestDate: latestMetric.reportDate,
        dataPointCount: dataPoints.length,
        trend
      });
    }

    // Sort by worsening trends first
    summary.sort((a, b) => {
      if (a.trend.direction === "worsening" && b.trend.direction !== "worsening") return -1;
      if (b.trend.direction === "worsening" && a.trend.direction !== "worsening") return 1;
      return 0;
    });

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to get trend summary");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve trend summary"
    });
  }
});

// GET /api/trends
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { parameter, from, to } = req.query;

    if (!parameter) {
      return res.status(400).json({
        success: false,
        message: "Parameter is required"
      });
    }

    const query = { userId, parameter };
    if (from) query.reportDate = { ...query.reportDate, $gte: new Date(from) };
    if (to) query.reportDate = { ...query.reportDate, $lte: new Date(to) };

    const dataPoints = await HealthMetric.find(query)
      .sort({ reportDate: 1 })
      .populate("reportId", "fileName")
      .lean();

    const formattedDataPoints = dataPoints.map(point => ({
      value: point.value,
      status: point.status,
      reportDate: point.reportDate,
      reportId: point.reportId._id
    }));

    const trend = dataPoints.length >= 2
      ? calculateTrend(dataPoints.map(p => ({ value: p.value, reportDate: p.reportDate })), PARAMETER_PATTERNS[parameter].normalRange)
      : { direction: "insufficient_data" };

    res.json({
      success: true,
      data: {
        parameter,
        unit: PARAMETER_PATTERNS[parameter].unit,
        normalRange: PARAMETER_PATTERNS[parameter].normalRange,
        trend,
        dataPoints: formattedDataPoints
      }
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to get trend data");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve trend data"
    });
  }
});

// POST /api/trends/recalculate
router.post("/recalculate", async (req, res) => {
  try {
    const userId = getUserId(req);

    // Start background recalculation
    setImmediate(async () => {
      try {
        const reports = await Report.find({
          user: userId,
          processingStatus: "completed",
          "aiAnalysis.completedAt": { $exists: true }
        }).select("_id user createdAt aiAnalysis").lean();

        let totalMetrics = 0;
        for (const report of reports) {
          const allKeyFindings = [
            ...(report.aiAnalysis.gemini?.keyFindings || []),
            ...(report.aiAnalysis.groq?.keyFindings || [])
          ];
          const metrics = extractHealthMetrics(allKeyFindings, report._id, report.user, report.createdAt);
          if (metrics.length > 0) {
            await HealthMetric.insertMany(metrics, { ordered: false });
            totalMetrics += metrics.length;
            healthMetricsExtractedTotal.inc({ parameter: metrics.map(m => m.parameter) });
          }
        }

        logger.info({ userId: userId.toString(), totalMetrics }, "Trend recalculation completed");
      } catch (error) {
        logger.error({ userId: userId.toString(), error: error.message }, "Trend recalculation failed");
      }
    });

    res.json({
      success: true,
      message: "Recalculation started"
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to start recalculation");
    res.status(500).json({
      success: false,
      message: "Failed to start recalculation"
    });
  }
});

export default router;