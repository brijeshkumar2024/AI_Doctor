import asyncHandler from "../utils/asyncHandler.js";
import Report from "../models/Report.js";
import SymptomCheck from "../models/SymptomCheck.js";
import { checkSymptomsWithAI } from "../services/aiService.js";
import { HEALTH_DISCLAIMER } from "../utils/constants.js";
import { calculateRiskScoreDetails } from "../services/riskScoreService.js";

const buildHistoricalContext = async (userId) => {
  const reports = await Report.find({ user: userId, processingStatus: "completed" })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return reports
    .map((report) => {
      const summary = report.structuredValues
        .slice(0, 4)
        .map((value) => `${value.parameter} ${value.value} ${value.unit} (${value.status})`)
        .join(", ");

      return `${report.reportType}: ${summary}`;
    })
    .join("\n");
};

export const checkSymptoms = asyncHandler(async (req, res) => {
  const historicalContext = await buildHistoricalContext(req.user._id);
  const result = await checkSymptomsWithAI({
    symptoms: req.body.symptoms,
    followUpAnswers: req.body.followUpAnswers,
    language: req.user.preferredLanguage,
    historicalContext
  });
  const riskDetails = calculateRiskScoreDetails({ symptomText: req.body.symptoms });

  await SymptomCheck.create({
    user: req.user._id,
    symptoms: req.body.symptoms,
    followUpAnswers: req.body.followUpAnswers || "",
    response: {
      ...result,
      riskScore: riskDetails.score
    }
  });

  res.json({
    success: true,
    result: {
      ...result,
      historicalContext,
      riskScore: riskDetails.score,
      riskFactors: riskDetails.factors,
      disclaimer: HEALTH_DISCLAIMER
    }
  });
});
