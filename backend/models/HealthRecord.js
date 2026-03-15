import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true
    },
    parameter: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: ""
    },
    value: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    normalRange: {
      type: String,
      default: ""
    },
    confidence: {
      type: Number,
      default: 0
    },
    reportType: {
      type: String,
      default: ""
    },
    measuredAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

healthRecordSchema.index({ user: 1, parameter: 1, measuredAt: -1 });
healthRecordSchema.index({ user: 1, reportType: 1, measuredAt: -1 });
healthRecordSchema.index({ user: 1, report: 1 });

const HealthRecord = mongoose.model("HealthRecord", healthRecordSchema);

export default HealthRecord;
