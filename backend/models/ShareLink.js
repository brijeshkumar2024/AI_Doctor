import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }
    },
    accessCount: {
      type: Number,
      default: 0
    },
    maxAccess: {
      type: Number,
      default: 10
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    doctorNote: {
      type: String,
      maxlength: 500,
      default: ""
    },
    accessLog: [{
      accessedAt: { type: Date, default: Date.now },
      ipAddress: { type: String },
      userAgent: { type: String }
    }]
  },
  { timestamps: true }
);

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

export default ShareLink;