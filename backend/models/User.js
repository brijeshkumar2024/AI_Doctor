import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    age: Number,
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: ""
    },
    height: String,
    weight: String,
    medicalHistory: {
      type: String,
      default: ""
    },
    allergies: {
      type: String,
      default: ""
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "bn"],
      default: "en"
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    refreshTokenHash: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateResetToken = function generateResetToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  return resetToken;
};

userSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

const User = mongoose.model("User", userSchema);

export default User;
