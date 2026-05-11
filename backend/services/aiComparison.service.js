import OpenAI from "openai";
import { sendGeminiRequest } from "./providers/geminiProvider.js";

const DEFAULT_ANALYSIS = {
  summary: "",
  keyFindings: [],
  riskFlags: [],
  recommendations: [],
  confidenceScore: 0
};

const MODEL_SCHEMA_PROMPT = `Return strict JSON with this exact schema:
{
  "summary": "string",
  "keyFindings": [
    { "parameter": "string", "value": "string", "status": "normal|low|high|critical", "interpretation": "string" }
  ],
  "riskFlags": [
    { "risk": "string", "severity": "low|medium|high", "explanation": "string" }
  ],
  "recommendations": ["string"],
  "confidenceScore": 0
}`;

const safeJsonParse = (raw = "") => {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    return null;
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (_error) {
    return null;
  }
};

const clampConfidence = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const normalizeAnalysis = (analysis) => {
  const parsed = analysis && typeof analysis === "object" ? analysis : DEFAULT_ANALYSIS;

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    keyFindings: Array.isArray(parsed.keyFindings)
      ? parsed.keyFindings
          .map((item) => ({
            parameter: String(item?.parameter || "").trim(),
            value: String(item?.value || "").trim(),
            status: ["normal", "low", "high", "critical"].includes(item?.status)
              ? item.status
              : "normal",
            interpretation: String(item?.interpretation || "").trim()
          }))
          .filter((item) => item.parameter)
      : [],
    riskFlags: Array.isArray(parsed.riskFlags)
      ? parsed.riskFlags
          .map((item) => ({
            risk: String(item?.risk || "").trim(),
            severity: ["low", "medium", "high"].includes(item?.severity)
              ? item.severity
              : "low",
            explanation: String(item?.explanation || "").trim()
          }))
          .filter((item) => item.risk)
      : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    confidenceScore: clampConfidence(parsed.confidenceScore)
  };
};

const buildPrompt = (ocrText) => `You are a careful medical report analyzer for educational purposes.
Never provide diagnosis. Provide concise clinical interpretation.

${MODEL_SCHEMA_PROMPT}

OCR text:
${ocrText}`;

export const runGeminiAnalysis = async (ocrText) => {
  const baseUrl =
    process.env.GEMINI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta";
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const raw = await sendGeminiRequest({
    messages: [
      { role: "user", content: buildPrompt(ocrText) }
    ],
    model,
    baseUrl,
    apiKey,
    responseFormat: { type: "json_object" }
  });

  return normalizeAnalysis(safeJsonParse(raw));
};

export const runGroqAnalysis = async (ocrText) => {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });

  const model = process.env.GROQ_MODEL || "llama3-70b-8192";

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a careful medical report analyzer for educational interpretation."
      },
      {
        role: "user",
        content: buildPrompt(ocrText)
      }
    ]
  });

  const raw = response.choices?.[0]?.message?.content || "";
  return normalizeAnalysis(safeJsonParse(raw));
};

const createFindingsMap = (findings = []) =>
  new Map(findings.map((finding) => [finding.parameter.toLowerCase(), finding]));

const buildComparisonScore = (geminiFindings = [], groqFindings = []) => {
  const geminiMap = createFindingsMap(geminiFindings);
  const groqMap = createFindingsMap(groqFindings);
  const sharedParameters = [...geminiMap.keys()].filter((parameter) => groqMap.has(parameter));

  if (sharedParameters.length === 0) {
    return {
      agreementRate: 0,
      sharedFindingCount: 0,
      consensusFindings: [],
      divergentFindings: [],
      overallConsensus: "low"
    };
  }

  const consensusFindings = [];
  const divergentFindings = [];

  sharedParameters.forEach((parameter) => {
    const geminiItem = geminiMap.get(parameter);
    const groqItem = groqMap.get(parameter);

    if (geminiItem.status === groqItem.status) {
      consensusFindings.push({
        parameter: geminiItem.parameter,
        status: geminiItem.status,
        geminiInterpretation: geminiItem.interpretation,
        groqInterpretation: groqItem.interpretation
      });
      return;
    }

      divergentFindings.push({
      parameter: geminiItem.parameter,
      geminiValue: geminiItem.value,
      groqValue: groqItem.value,
      gemini: {
        status: geminiItem.status,
        interpretation: geminiItem.interpretation
      },
      groq: {
        status: groqItem.status,
        interpretation: groqItem.interpretation
      }
    });
  });

  const agreementRate = Number(((consensusFindings.length / sharedParameters.length) * 100).toFixed(2));
  const overallConsensus = agreementRate >= 80 ? "high" : agreementRate >= 60 ? "medium" : "low";

  return {
    agreementRate,
    sharedFindingCount: sharedParameters.length,
    consensusFindings,
    divergentFindings,
    overallConsensus
  };
};

export const runComparisonAnalysis = async (ocrText) => {
  const withTiming = async (runner) => {
    const startedAt = Date.now();
    const result = await runner();
    return {
      result,
      duration: Date.now() - startedAt
    };
  };

  const [geminiResult, groqResult] = await Promise.allSettled([
    withTiming(() => runGeminiAnalysis(ocrText)),
    withTiming(() => runGroqAnalysis(ocrText))
  ]);

  const gemini = geminiResult.status === "fulfilled" ? geminiResult.value.result : DEFAULT_ANALYSIS;
  const groq = groqResult.status === "fulfilled" ? groqResult.value.result : DEFAULT_ANALYSIS;

  const comparisonScore = buildComparisonScore(gemini.keyFindings, groq.keyFindings);

  return {
    gemini,
    groq,
    comparisonScore,
    consensus: {
      overallConsensus: comparisonScore.overallConsensus,
      agreementRate: comparisonScore.agreementRate
    },
    processingTime: {
      gemini: geminiResult.status === "fulfilled" ? geminiResult.value.duration : 0,
      groq: groqResult.status === "fulfilled" ? groqResult.value.duration : 0
    }
  };
};
