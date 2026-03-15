import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { _id: false, timestamps: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    messages: {
      type: [messageSchema],
      default: []
    }
  },
  { timestamps: true }
);

chatHistorySchema.index({ user: 1 }, { unique: true });

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
