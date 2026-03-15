import { sendAiRequest } from "./aiProviderService.js";
import { labExtractionSchema } from "../utils/aiSchemas.js";
import { normalizeStructuredValues } from "./parserService.js";
import { logger } from "../utils/logger.js";

const extractJsonObject = (raw = "") => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  return objectMatch?.[0] || trimmed;
};

export const extractLabValuesWithLLM = async ({
  cleanedText = "",
  gender = "",
  language = "en",
  reportType = "General Lab Report"
}) => {
  if (!cleanedText.trim()) {
    return {
      reportType,
      structuredValues: [],
      metadata: {
        source: "llm",
        extractedValueCount: 0,
        averageConfidence: 0
      }
    };
  }

  try {
    const response = await sendAiRequest({
      messages: [
        {
          role: "system",
          content:
            "You extract medical laboratory values from OCR text. Return JSON only with keys reportType and values. Each value must include parameter, value, unit, referenceRange, confidence. Do not invent values. Use confidence between 0 and 1."
        },
        {
          role: "user",
          content: `Language: ${language}\nExpected report type: ${reportType}\nOCR text:\n${cleanedText.slice(0, 12000)}`
        }
      ],
      responseFormat: {
        type: "json_object"
      }
    });

    const parsed = labExtractionSchema.parse(JSON.parse(extractJsonObject(response)));
    const normalized = normalizeStructuredValues(parsed.values, gender);

    return {
      reportType: parsed.reportType || reportType,
      structuredValues: normalized.structuredValues,
      metadata: {
        ...normalized.metadata,
        source: "llm"
      }
    };
  } catch (error) {
    logger.warn("LLM lab extraction failed", {
      message: error.message
    });

    return {
      reportType,
      structuredValues: [],
      metadata: {
        source: "regex-fallback",
        extractedValueCount: 0,
        averageConfidence: 0
      }
    };
  }
};
