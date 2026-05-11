import {
  defaultReportAnalysis,
  defaultSymptomResult,
  medicineSchema,
  reportAnalysisSchema,
  symptomSchema,
  chatSchema
} from "../utils/aiSchemas.js";
import { HEALTH_DISCLAIMER } from "../utils/constants.js";
import { sendAiRequest } from "./aiProviderService.js";
import { retrieveMedicalContext } from "./ragService.js";
import { buildCacheKey, getCachedJson, setCachedJson } from "./cacheService.js";
import { logger } from "../utils/logger.js";
import { aiAnalysisDurationMs, aiRequestDurationSeconds } from "../config/metrics.js";

const translateLanguage = (language = "en") =>
  language === "hi" ? "Hindi" : language === "bn" ? "Bengali" : "English";

const extractJson = (text = "") => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return null;
  }
  return cleaned.slice(start, end + 1);
};

const validateStructuredResponse = (schema, content, fallback) => {
  try {
    const parsed = JSON.parse(extractJson(content) || "{}");
    return schema.parse(parsed);
  } catch (_error) {
    return fallback;
  }
};

const callStructuredAi = async ({
  cacheKeyParts = [],
  cacheTtlSeconds,
  systemPrompt,
  userPrompt,
  schema,
  fallback,
  metricLabel = "generic"
}) => {
  const cacheKey = cacheKeyParts.length > 0 ? buildCacheKey("structured-ai", ...cacheKeyParts) : null;

  if (cacheKey) {
    const cached = await getCachedJson(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const endTimer = aiRequestDurationSeconds.startTimer({
    operation: metricLabel
  });
  const startedAt = Date.now();

  try {
    const content = await sendAiRequest({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      responseFormat: { type: "json_object" }
    });

    const validated = validateStructuredResponse(schema, content, fallback);

    if (cacheKey) {
      await setCachedJson(cacheKey, validated, cacheTtlSeconds);
    }

    return validated;
  } catch (error) {
    logger.warn({
      message: error.message,
      operation: metricLabel
    }, "Structured AI request failed");
    return fallback;
  } finally {
    endTimer();
    aiAnalysisDurationMs.observe({ operation: metricLabel }, Date.now() - startedAt);
  }
};

export const analyzeReportWithAI = async ({
  structuredValues = [],
  reportType = "General Lab Report",
  language = "en",
  trendInsights = [],
  riskFactors = []
}) => {
  const context = retrieveMedicalContext(
    `${reportType} ${structuredValues.map((item) => item.parameter).join(" ")} ${trendInsights.join(" ")}`
  );

  return callStructuredAi({
    schema: reportAnalysisSchema,
    fallback: defaultReportAnalysis,
    cacheKeyParts: ["report-analysis", reportType, language, structuredValues, trendInsights, riskFactors],
    metricLabel: "report_analysis",
    systemPrompt:
      "You are a cautious healthcare education assistant. Return strict JSON only. Never diagnose. Always give educational explanations, risk factors, and safe recommendations.",
    userPrompt: `Reply in ${translateLanguage(language)}.
Medical context:
${context.join("\n")}

Report type: ${reportType}
Values: ${JSON.stringify(structuredValues, null, 2)}
Trend insights: ${JSON.stringify(trendInsights)}
Risk factors: ${JSON.stringify(riskFactors)}

Return JSON:
{
  "summary": "string",
  "abnormalFindings": ["string"],
  "abnormalExplanations": ["string"],
  "possibleReasons": ["string"],
  "recommendations": ["string"],
  "riskFactors": ["string"]
}`
  });
};

export const analyzePrescriptionWithAI = async (medicines, language = "en") => {
  const fallback = `Please confirm medicine names and dosage with your doctor or pharmacist. ${HEALTH_DISCLAIMER}`;

  const context = retrieveMedicalContext(medicines.map((item) => item.name).join(" "));
  const result = await callStructuredAi({
    schema: medicineSchema,
    fallback: { explanation: fallback },
    cacheKeyParts: ["prescription-analysis", language, medicines],
    metricLabel: "prescription_analysis",
    systemPrompt:
      "You explain medicines for general education only. Return strict JSON. Never prescribe or diagnose.",
    userPrompt: `Reply in ${translateLanguage(language)}.
Medical context:
${context.join("\n")}

Medicines: ${JSON.stringify(medicines)}

Return JSON: {"explanation":"string"}`
  });

  return result.explanation;
};

export const checkSymptomsWithAI = async ({
  symptoms,
  followUpAnswers = "",
  language = "en",
  historicalContext = ""
}) => {
  const context = retrieveMedicalContext(`${symptoms} ${followUpAnswers} ${historicalContext}`);

  return callStructuredAi({
    schema: symptomSchema,
    fallback: defaultSymptomResult,
    cacheKeyParts: ["symptoms", language, symptoms, followUpAnswers, historicalContext],
    metricLabel: "symptom_checker",
    systemPrompt:
      "You are a symptom checker for education only. Return strict JSON. Never diagnose or recommend treatment plans.",
    userPrompt: `Reply in ${translateLanguage(language)}.
Medical context:
${context.join("\n")}

Historical health context: ${historicalContext}
Symptoms: ${symptoms}
Follow-up answers: ${followUpAnswers}

Return JSON:
{
  "followUpQuestions": ["string"],
  "possibleConditions": ["string"],
  "advice": "string"
}`
  });
};

export const chatWithHealthAssistant = async ({
  message,
  history = [],
  language = "en",
  healthContext = ""
}) => {
  const fallback =
    language === "hi"
      ? "कृपया लक्षणों की अवधि, तापमान और गंभीरता बताएं। यह सामान्य जानकारी है, निदान नहीं।"
      : language === "bn"
        ? "অনুগ্রহ করে উপসর্গ কতদিন ধরে আছে, তাপমাত্রা ও তীব্রতা জানান। এটি সাধারণ তথ্য, রোগ নির্ণয় নয়।"
        : "Please share how long you have had the symptoms, your temperature if known, and whether things are worsening. This is general information only, not a diagnosis.";

  const context = retrieveMedicalContext(
    [message, healthContext, ...history.slice(-4).map((item) => item.content)].join(" ")
  );

  const result = await callStructuredAi({
    schema: chatSchema,
    fallback: { reply: fallback, followUpQuestion: "" },
    cacheKeyParts: ["chat", language, message, history.slice(-4), healthContext],
    metricLabel: "chat_assistant",
    systemPrompt:
      "You are a careful health chat assistant. Return strict JSON only. Never diagnose. Use the historical health context when it is relevant, and ask brief follow-up questions when useful.",
    userPrompt: `Reply in ${translateLanguage(language)}.
Medical context:
${context.join("\n")}

Historical health context: ${healthContext}
Recent chat: ${JSON.stringify(history.slice(-6))}
User message: ${message}

Return JSON:
{
  "reply": "string",
  "followUpQuestion": "string"
}`
  });

  return result.followUpQuestion
    ? `${result.reply}\n\nFollow-up: ${result.followUpQuestion}`
    : result.reply;
};
