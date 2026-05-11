import mongoose from "mongoose";

const healthMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true
    },
    parameter: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["normal", "low", "high", "critical"],
      required: true
    },
    reportDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// Compound index for efficient queries
healthMetricSchema.index({ userId: 1, parameter: 1, reportDate: -1 });

// Single index for report lookups
healthMetricSchema.index({ reportId: 1 });

const HealthMetric = mongoose.model("HealthMetric", healthMetricSchema);

export default HealthMetric;