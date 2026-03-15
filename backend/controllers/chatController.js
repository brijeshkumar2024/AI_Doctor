import ChatHistory from "../models/ChatHistory.js";
import Report from "../models/Report.js";
import SymptomCheck from "../models/SymptomCheck.js";
import asyncHandler from "../utils/asyncHandler.js";
import { chatWithHealthAssistant } from "../services/aiService.js";
import { HEALTH_DISCLAIMER } from "../utils/constants.js";

const buildHealthContext = async (userId) => {
  const [latestReports, symptomHistory] = await Promise.all([
    Report.find({ user: userId, processingStatus: "completed" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    SymptomCheck.find({ user: userId }).sort({ createdAt: -1 }).limit(3).lean()
  ]);

  const reportContext = latestReports
    .map((report) => {
      const keyValues = report.structuredValues
        .slice(0, 5)
        .map((value) => `${value.parameter} ${value.value} ${value.unit} (${value.status})`)
        .join(", ");
      return `${report.reportType} on ${new Date(report.createdAt).toLocaleDateString()}: ${keyValues}`;
    })
    .join("\n");

  const symptomContext = symptomHistory
    .map((entry) => `Symptoms: ${entry.symptoms}; guidance risk score ${entry.response?.riskScore || 0}%`)
    .join("\n");

  return [reportContext, symptomContext].filter(Boolean).join("\n");
};

export const getChatHistory = asyncHandler(async (req, res) => {
  const chatHistory = await ChatHistory.findOne({ user: req.user._id }).lean();
  const healthContext = await buildHealthContext(req.user._id);

  res.json({
    success: true,
    messages: chatHistory?.messages || [],
    healthContext,
    disclaimer: HEALTH_DISCLAIMER
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  let chatHistory = await ChatHistory.findOne({ user: req.user._id });
  if (!chatHistory) {
    chatHistory = await ChatHistory.create({ user: req.user._id, messages: [] });
  }

  const userMessage = {
    role: "user",
    content: req.body.message
  };

  const healthContext = await buildHealthContext(req.user._id);
  const assistantReply = await chatWithHealthAssistant({
    message: req.body.message,
    history: chatHistory.messages,
    language: req.user.preferredLanguage,
    healthContext
  });

  const assistantMessage = {
    role: "assistant",
    content: assistantReply
  };

  chatHistory.messages.push(userMessage, assistantMessage);
  await chatHistory.save();

  res.json({
    success: true,
    messages: chatHistory.messages,
    healthContext,
    disclaimer: HEALTH_DISCLAIMER
  });
});
