import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      const error = new Error("Email is already in use");
      error.statusCode = 409;
      throw error;
    }
  }

  const fields = [
    "name",
    "email",
    "age",
    "gender",
    "height",
    "weight",
    "medicalHistory",
    "allergies",
    "preferredLanguage"
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (req.body.currentPassword || req.body.newPassword) {
    const passwordMatches = await user.comparePassword(req.body.currentPassword);

    if (!passwordMatches) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }

    user.password = req.body.newPassword;
  }

  await user.save();

  res.json({
    success: true,
    user: await User.findById(req.user._id).select("-password")
  });
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { preferredLanguage: req.body.preferredLanguage },
    { new: true }
  ).select("-password");

  res.json({
    success: true,
    user
  });
});
