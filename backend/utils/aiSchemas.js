import { z } from "zod";
import { HEALTH_DISCLAIMER } from "./constants.js";

export const extractedLabValueSchema = z.object({
  parameter: z.string().min(1),
  value: z.coerce.number(),
  unit: z.string().default(""),
  referenceRange: z.string().default(""),
  confidence: z.coerce.number().min(0).max(1).default(0.5)
});

export const labExtractionSchema = z.object({
  reportType: z.string().optional().default("General Lab Report"),
  values: z.array(extractedLabValueSchema).default([])
});

export const reportAnalysisSchema = z.object({
  summary: z.string().min(1),
  abnormalFindings: z.array(z.string()).default([]),
  abnormalExplanations: z.array(z.string()).default([]),
  possibleReasons: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  riskFactors: z.array(z.string()).default([])
});

export const symptomSchema = z.object({
  followUpQuestions: z.array(z.string()).default([]),
  possibleConditions: z.array(z.string()).default([]),
  advice: z.string().min(1)
});

export const medicineSchema = z.object({
  explanation: z.string().min(1)
});

export const chatSchema = z.object({
  reply: z.string().min(1),
  followUpQuestion: z.string().optional().default("")
});

export const defaultReportAnalysis = {
  summary: "Most extracted values appear within common reference ranges or need manual review.",
  abnormalFindings: [],
  abnormalExplanations: [],
  possibleReasons: ["OCR or report formatting may require manual verification."],
  recommendations: [
    "Review the extracted values carefully.",
    "Consult a licensed doctor for diagnosis or treatment decisions.",
    HEALTH_DISCLAIMER
  ],
  riskFactors: []
};

export const defaultSymptomResult = {
  followUpQuestions: [
    "How long have you had these symptoms?",
    "Do you also have cough, vomiting, chest pain, or breathing difficulty?"
  ],
  possibleConditions: [
    "Common viral illness",
    "Dehydration or fatigue",
    "Another non-specific condition that requires medical review"
  ],
  advice: `Monitor symptoms, stay hydrated, and consult a doctor if symptoms are severe or persistent. ${HEALTH_DISCLAIMER}`
};
