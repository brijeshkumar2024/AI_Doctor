import Report from "../models/Report.js";
import Prescription from "../models/Prescription.js";
import HealthRecord from "../models/HealthRecord.js";
import User from "../models/User.js";
import { extractTextFromFile } from "./ocrService.js";
import { parseMedicalValues, parsePrescriptionText } from "./parserService.js";
import { classifyReport } from "./classificationService.js";
import { extractLabValuesWithLLM } from "./labExtractionService.js";
import { analyzePrescriptionWithAI, analyzeReportWithAI } from "./aiService.js";
import { calculateRiskScoreDetails } from "./riskScoreService.js";
import { buildDoctorStyleSummary, buildTimelineSummary } from "./summaryService.js";
import { buildHealthTrends } from "./trendService.js";
import { HEALTH_DISCLAIMER, PRESCRIPTION_PROCESSING_STATUS, REPORT_PROCESSING_STATUS } from "../utils/constants.js";

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
    const ocrResult = await extractTextFromFile(file);
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
    const aiAnalysis = await analyzeReportWithAI({
      structuredValues,
      reportType: llmExtracted.reportType || classification.reportType,
      language: user?.preferredLanguage,
      trendInsights: trends.map((trend) => trend.insight),
      riskFactors: riskDetails.factors
    });
    const combinedRiskFactors = [...new Set([...(riskDetails.factors || []), ...(aiAnalysis.riskFactors || [])])];
    const doctorSummary = buildDoctorStyleSummary(structuredValues, aiAnalysis);
    const timelineSummary = buildTimelineSummary(trends, combinedRiskFactors);

    report.extractedText = ocrResult.rawText;
    report.cleanedText = ocrResult.cleanedText;
    report.reportType = llmExtracted.reportType || classification.reportType;
    report.riskScore = riskDetails.score;
    report.riskFactors = combinedRiskFactors;
    report.structuredValues = structuredValues;
    report.aiAnalysis = aiAnalysis;
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

    await insertHealthRecords(report, structuredValues, report.reportType);

    return report;
  } catch (error) {
    report.processingStatus = REPORT_PROCESSING_STATUS.FAILED;
    report.processingError = error.message;
    await report.save();
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
