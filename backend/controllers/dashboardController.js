import Report from "../models/Report.js";
import Prescription from "../models/Prescription.js";
import HealthRecord from "../models/HealthRecord.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildChartSeries, buildHealthTrends, buildReportComparisons, buildTimelineData } from "../services/trendService.js";
import { HEALTH_DISCLAIMER } from "../utils/constants.js";
import { calculateRiskScoreDetails } from "../services/riskScoreService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const [reports, prescriptions, healthRecords] = await Promise.all([
    Report.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
    Prescription.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
    HealthRecord.find({ user: req.user._id }).sort({ measuredAt: 1 }).lean()
  ]);

  const abnormalValues = reports.flatMap((report) =>
    report.structuredValues
      .filter((value) => value.status !== "Normal")
      .map((value) => ({
        reportId: report._id,
        reportDate: report.createdAt,
        ...value
      }))
  );

  const alerts = reports.flatMap((report) => report.alerts);
  const trends = buildHealthTrends(healthRecords);
  const chartSeries = buildChartSeries(healthRecords);
  const timeline = buildTimelineData(healthRecords);
  const comparisons = buildReportComparisons(reports);
  const latestReport = reports.find((report) => report.processingStatus === "completed") || reports[0];
  const riskDetails = latestReport
    ? calculateRiskScoreDetails({
        structuredValues: latestReport.structuredValues,
        trendInsights: trends
      })
    : { score: 0, factors: [] };

  res.json({
    success: true,
    data: {
      totals: {
        reports: reports.length,
        prescriptions: prescriptions.length,
        alerts: alerts.length,
        pendingReports: reports.filter((report) => report.processingStatus !== "completed").length
      },
      reports,
      abnormalValues,
      alerts,
      prescriptions,
      trends,
      chartSeries,
      timeline,
      comparisons,
      riskScore: riskDetails.score,
      riskFactors: riskDetails.factors,
      latestReportType: latestReport?.reportType || "No reports yet",
      insights: trends.map((trend) => trend.insight),
      disclaimer: HEALTH_DISCLAIMER
    }
  });
});
