import mongoose from "mongoose";

const symptomCheckSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    symptoms: {
      type: String,
      required: true
    },
    followUpAnswers: {
      type: String,
      default: ""
    },
    response: {
      followUpQuestions: { type: [String], default: [] },
      possibleConditions: { type: [String], default: [] },
      advice: { type: String, default: "" },
      riskScore: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

symptomCheckSchema.index({ user: 1, createdAt: -1 });

const SymptomCheck = mongoose.model("SymptomCheck", symptomCheckSchema);

export default SymptomCheck;
