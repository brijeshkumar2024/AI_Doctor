import Report from "../models/Report.js";
import Prescription from "../models/Prescription.js";
import HealthRecord from "../models/HealthRecord.js";
import HealthMetric from "../models/HealthMetric.js";
import User from "../models/User.js";
import { extractTextFromFile } from "./ocrService.js";
import { parseMedicalValues, parsePrescriptionText } from "./parserService.js";
import { classifyReport } from "./classificationService.js";
import { extractLabValuesWithLLM } from "./labExtractionService.js";
import { analyzePrescriptionWithAI, analyzeReportWithAI } from "./aiService.js";
import { runComparisonAnalysis } from "./aiComparison.service.js";
import { calculateRiskScoreDetails } from "./riskScoreService.js";
import { buildDoctorStyleSummary, buildTimelineSummary } from "./summaryService.js";
import { buildHealthTrends } from "./trendService.js";
import { extractHealthMetrics } from "./trendExtractor.service.js";
import { HEALTH_DISCLAIMER, PRESCRIPTION_PROCESSING_STATUS, REPORT_PROCESSING_STATUS } from "../utils/constants.js";
import { totalReportsProcessed } from "../config/metrics.js";
import {
  emitReportProcessing,
  emitReportCompleted,
  emitReportFailed
} from "./socket.service.js";

const mergeStructuredValues = (primaryValues = [], fallbackValues = []) => {
  const merged = new Map();

  [...fallbackValues, ...primaryValues].forEach((value) => {
    const existing = merged.get(value.parameter);
    if (!existing || (value.confidence || 0) >= (existing.confidence || 0)) {
      merged.set(value.parameter, value);
    }
  });

  return [...merged.values()].sort((left, right) => left.parameter.localeCompare(right.parameter));
};

const buildAlertMessages = (structuredValues = []) =>
  structuredValues
    .filter((value) => value.warning)
    .map((value) => `${value.parameter}: ${value.warning}`);

const insertHealthRecords = async (report, structuredValues, reportType) => {
  await HealthRecord.deleteMany({ report: report._id });

  if (structuredValues.length === 0) {
    return;
  }

  await HealthRecord.insertMany(
    structuredValues.map((value) => ({
      user: report.user,
      report: report._id,
      parameter: value.parameter,
      value: value.value,
      unit: value.unit,
      status: value.status,
      normalRange: value.normalRange,
      confidence: value.confidence,
      reportType,
      measuredAt: report.createdAt
    }))
  );
};

const getUserDocument = async (userOrId) => {
  if (userOrId?.preferredLanguage !== undefined) {
    return userOrId;
  }

  return User.findById(userOrId).lean();
};

const deriveLegacyAiAnalysis = (modelOutput = {}) => ({
  summary: modelOutput.summary || "",
  abnormalFindings: (modelOutput.keyFindings || [])
    .filter((item) => item.status !== "normal")
    .map((item) => `${item.parameter}: ${item.interpretation}`),
  abnormalExplanations: (modelOutput.keyFindings || [])
    .filter((item) => item.status !== "normal")
    .map((item) => item.interpretation),
  possibleReasons: (modelOutput.riskFlags || []).map((item) => item.explanation),
  recommendations: modelOutput.recommendations || [],
  riskFactors: (modelOutput.riskFlags || []).map((item) => item.risk),
  gemini: modelOutput,
  groq: {},
  comparison: {
    agreementRate: 0,
    sharedFindingCount: 0,
    consensusFindings: [],
    divergentFindings: [],
    overallConsensus: "low",
    processingTime: { gemini: 0, groq: 0 }
  },
  completedAt: new Date()
});

export const processReportRecord = async ({ reportId, file }) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new Error("Report not found for processing");
  }

  const user = await getUserDocument(report.user);
  report.processingStatus = REPORT_PROCESSING_STATUS.PROCESSING;
  report.processingError = "";
  await report.save();

  try {
    await emitReportProcessing(user._id.toString(), reportId, 'ocr_started');
    const ocrResult = await extractTextFromFile(file);
    await emitReportProcessing(user._id.toString(), reportId, 'ocr_completed');
    const classification = classifyReport(ocrResult.cleanedText);
    const regexParsed = parseMedicalValues({
      cleanedText: ocrResult.cleanedText,
      tableRows: ocrResult.tableRows,
      gender: user?.gender
    });
    const llmExtracted = await extractLabValuesWithLLM({
      cleanedText: ocrResult.cleanedText,
      gender: user?.gender,
      language: user?.preferredLanguage,
      reportType: classification.reportType
    });

    const structuredValues = mergeStructuredValues(llmExtracted.structuredValues, regexParsed.structuredValues);
    const priorHealthRecords = await HealthRecord.find({
      user: report.user,
      report: { $ne: report._id }
    })
      .sort({ measuredAt: 1 })
      .lean();
    const hypotheticalHistory = [
      ...priorHealthRecords,
      ...structuredValues.map((value) => ({
        parameter: value.parameter,
        value: value.value,
        status: value.status,
        measuredAt: report.createdAt,
        reportType: classification.reportType
      }))
    ];
    const trends = buildHealthTrends(hypotheticalHistory);
    const riskDetails = calculateRiskScoreDetails({
      structuredValues,
      trendInsights: trends
    });
    await emitReportProcessing(user._id.toString(), reportId, 'gemini_started');
    const fallbackAiAnalysis = await analyzeReportWithAI({
      structuredValues,
      reportType: llmExtracted.reportType || classification.reportType,
      language: user?.preferredLanguage,
      trendInsights: trends.map((trend) => trend.insight),
      riskFactors: riskDetails.factors
    });
    await emitReportProcessing(user._id.toString(), reportId, 'gemini_completed');
    await emitReportProcessing(user._id.toString(), reportId, 'groq_started');
    const comparisonResult = await runComparisonAnalysis(ocrResult.cleanedText);
    await emitReportProcessing(user._id.toString(), reportId, 'groq_completed');
    await emitReportProcessing(user._id.toString(), reportId, 'comparison_started');
    const primaryModel = comparisonResult.gemini.summary
      ? comparisonResult.gemini
      : comparisonResult.groq.summary
        ? comparisonResult.groq
        : null;
    const comparisonRiskFactors = [
      ...(comparisonResult.gemini.riskFlags || []).map((item) => item.risk),
      ...(comparisonResult.groq.riskFlags || []).map((item) => item.risk)
    ];
    const combinedRiskFactors = [...new Set([...(riskDetails.factors || []), ...comparisonRiskFactors, ...(fallbackAiAnalysis.riskFactors || [])])];
    const comparisonAiAnalysis = primaryModel
      ? {
          ...deriveLegacyAiAnalysis(primaryModel),
          gemini: comparisonResult.gemini,
          groq: comparisonResult.groq,
          comparison: {
            agreementRate: comparisonResult.comparisonScore.agreementRate,
            sharedFindingCount: comparisonResult.comparisonScore.sharedFindingCount,
            consensusFindings: comparisonResult.comparisonScore.consensusFindings,
            divergentFindings: comparisonResult.comparisonScore.divergentFindings,
            overallConsensus: comparisonResult.comparisonScore.overallConsensus,
            processingTime: comparisonResult.processingTime
          },
          completedAt: new Date()
        }
      : fallbackAiAnalysis;
    const doctorSummary = buildDoctorStyleSummary(structuredValues, comparisonAiAnalysis);
    const timelineSummary = buildTimelineSummary(trends, combinedRiskFactors);

    report.extractedText = ocrResult.rawText;
    report.cleanedText = ocrResult.cleanedText;
    report.reportType = llmExtracted.reportType || classification.reportType;
    report.riskScore = riskDetails.score;
    report.riskFactors = combinedRiskFactors;
    report.structuredValues = structuredValues;
    report.aiAnalysis = comparisonAiAnalysis;
    report.doctorSummary = doctorSummary;
    report.timelineSummary = timelineSummary;
    report.alerts = buildAlertMessages(structuredValues);
    report.parserMetadata = {
      tableRowsDetected: regexParsed.metadata.tableRowsDetected,
      extractedValueCount: structuredValues.length,
      averageConfidence: Number(
        (
          structuredValues.reduce((sum, item) => sum + item.confidence, 0) /
          (structuredValues.length || 1)
        ).toFixed(2)
      ),
      extractionSource:
        llmExtracted.structuredValues.length > 0 ? "llm-assisted" : "regex-fallback"
    };
    report.disclaimer = HEALTH_DISCLAIMER;
    report.processingStatus = REPORT_PROCESSING_STATUS.COMPLETED;
    report.processingError = "";
    await report.save();

    // Extract health metrics for trends after AI analysis is complete
    try {
      await emitReportProcessing(user._id.toString(), reportId, 'metrics_extraction');
      const allKeyFindings = [
        ...(comparisonAiAnalysis.gemini?.keyFindings || []),
        ...(comparisonAiAnalysis.groq?.keyFindings || [])
      ];
      const metrics = extractHealthMetrics(allKeyFindings, report._id, report.user, report.createdAt);
      if (metrics.length > 0) {
        await HealthMetric.insertMany(metrics, { ordered: false });
        logger.info({ reportId: report._id.toString(), metricCount: metrics.length }, "Health metrics extracted and saved");
      }
    } catch (metricError) {
      logger.warn({ reportId: report._id.toString(), error: metricError.message }, "Failed to extract health metrics, continuing without metrics");
    }

    totalReportsProcessed.inc();

    await insertHealthRecords(report, structuredValues, report.reportType);

    await emitReportCompleted(user._id.toString(), reportId, {
      agreementRate: comparisonAiAnalysis.comparison?.agreementRate || 0,
      riskCount: comparisonAiAnalysis.riskFlags?.length || 0,
      keyFindingsCount: comparisonAiAnalysis.keyFindings?.length || 0
    });

    return report;
  } catch (error) {
    report.processingStatus = REPORT_PROCESSING_STATUS.FAILED;
    report.processingError = error.message;
    await report.save();
    await emitReportFailed(user._id.toString(), reportId, error.message);
    throw error;
  }
};

export const processPrescriptionRecord = async ({ prescriptionId, file, language = "en" }) => {
  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) {
    throw new Error("Prescription not found for processing");
  }

  prescription.processingStatus = PRESCRIPTION_PROCESSING_STATUS.PROCESSING;
  prescription.processingError = "";
  await prescription.save();

  try {
    const ocrResult = await extractTextFromFile(file);
    const medicines = parsePrescriptionText(ocrResult.cleanedText);
    const aiExplanation = await analyzePrescriptionWithAI(medicines, language);

    prescription.extractedText = ocrResult.rawText;
    prescription.medicines = medicines;
    prescription.aiExplanation = aiExplanation;
    prescription.processingStatus = PRESCRIPTION_PROCESSING_STATUS.COMPLETED;
    prescription.processingError = "";
    await prescription.save();

    return prescription;
  } catch (error) {
    prescription.processingStatus = PRESCRIPTION_PROCESSING_STATUS.FAILED;
    prescription.processingError = error.message;
    await prescription.save();
    throw error;
  }
};
