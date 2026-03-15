import mongoose from "mongoose";
import { HEALTH_DISCLAIMER } from "../utils/constants.js";

const reportValueSchema = new mongoose.Schema(
  {
    parameter: String,
    value: Number,
    rawValue: String,
    unit: String,
    status: String,
    normalRange: String,
    warning: String,
    detectedText: String,
    confidence: {
      type: Number,
      default: 0
    },
    notes: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fileName: String,
    fileUrl: String,
    cloudinaryPublicId: {
      type: String,
      default: ""
    },
    fileType: {
      type: String,
      enum: ["pdf", "image"],
      required: true
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending"
    },
    processingError: {
      type: String,
      default: ""
    },
    extractedText: {
      type: String,
      default: ""
    },
    cleanedText: {
      type: String,
      default: ""
    },
    reportType: {
      type: String,
      default: "General Lab Report"
    },
    riskScore: {
      type: Number,
      default: 0
    },
    riskFactors: {
      type: [String],
      default: []
    },
    structuredValues: [reportValueSchema],
    aiAnalysis: {
      summary: { type: String, default: "" },
      abnormalFindings: { type: [String], default: [] },
      abnormalExplanations: { type: [String], default: [] },
      possibleReasons: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
      riskFactors: { type: [String], default: [] }
    },
    doctorSummary: {
      type: [String],
      default: []
    },
    timelineSummary: {
      type: [String],
      default: []
    },
    alerts: {
      type: [String],
      default: []
    },
    parserMetadata: {
      tableRowsDetected: { type: Number, default: 0 },
      extractedValueCount: { type: Number, default: 0 },
      averageConfidence: { type: Number, default: 0 },
      extractionSource: { type: String, default: "regex" }
    },
    disclaimer: {
      type: String,
      default: HEALTH_DISCLAIMER
    },
    shareVersion: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ user: 1, reportType: 1, createdAt: -1 });
reportSchema.index({ user: 1, riskScore: -1, createdAt: -1 });
reportSchema.index({ user: 1, processingStatus: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
