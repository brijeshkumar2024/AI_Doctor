import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: String,
    dosage: String,
    purpose: String
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    medicines: {
      type: [medicineSchema],
      default: []
    },
    aiExplanation: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

prescriptionSchema.index({ user: 1, createdAt: -1 });
prescriptionSchema.index({ user: 1, fileName: 1, createdAt: -1 });
prescriptionSchema.index({ user: 1, processingStatus: 1, createdAt: -1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
