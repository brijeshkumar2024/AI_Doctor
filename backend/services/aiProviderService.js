import { sendGeminiRequest } from "./providers/geminiProvider.js";
import { sendLocalRequest } from "./providers/localProvider.js";
import { sendOpenAIRequest } from "./providers/openaiProvider.js";
import { externalServiceFailureCounter } from "../config/metrics.js";
import { logger } from "../utils/logger.js";

export const detectProvider = () => {
  if (!process.env.LLM_API_KEY || !process.env.LLM_BASE_URL || !process.env.LLM_MODEL) {
    return "local";
  }

  if (process.env.AI_PROVIDER) {
    return process.env.AI_PROVIDER;
  }

  if (process.env.LLM_BASE_URL.includes("googleapis")) {
    return "gemini";
  }

  return "openai";
};

export const getAiProviderStatus = () => ({
  provider: detectProvider(),
  configured: Boolean(process.env.LLM_API_KEY && process.env.LLM_BASE_URL && process.env.LLM_MODEL),
  model: process.env.LLM_MODEL || "",
  baseUrl: process.env.LLM_BASE_URL || ""
});

export const sendAiRequest = async ({ messages, responseFormat }) => {
  const provider = detectProvider();
  const payload = {
    messages,
    model: process.env.LLM_MODEL,
    baseUrl: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    responseFormat
  };

  if (provider === "gemini") {
    try {
      return await sendGeminiRequest(payload);
    } catch (error) {
      externalServiceFailureCounter.inc({
        service: "ai_provider",
        operation: "gemini_request"
      });
      logger.warn("Gemini request failed", { message: error.message });
      throw error;
    }
  }

  if (provider === "openai") {
    try {
      return await sendOpenAIRequest(payload);
    } catch (error) {
      externalServiceFailureCounter.inc({
        service: "ai_provider",
        operation: "openai_request"
      });
      logger.warn("OpenAI request failed", { message: error.message });
      throw error;
    }
  }

  return sendLocalRequest(payload);
};
