import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import Prescription from "../models/Prescription.js";
import ChatHistory from "../models/ChatHistory.js";
import HealthRecord from "../models/HealthRecord.js";
import SymptomCheck from "../models/SymptomCheck.js";

const READY_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting"
};

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const indexedModels = [User, Report, Prescription, ChatHistory, HealthRecord, SymptomCheck];

export const getDatabaseStatus = () => ({
  readyState: mongoose.connection.readyState,
  state: READY_STATES[mongoose.connection.readyState] || "unknown",
  host: mongoose.connection.host || "",
  name: mongoose.connection.name || ""
});

export const ensureDatabaseIndexes = async () => {
  logger.info("Starting MongoDB index creation", {
    modelCount: indexedModels.length
  });

  const results = [];

  for (const model of indexedModels) {
    await model.createIndexes();
    results.push({
      model: model.modelName,
      ensured: true
    });
  }

  logger.info("MongoDB index creation complete", { results });
  return results;
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  mongoose.set("strictQuery", true);

  const maxRetries = Number(process.env.MONGODB_MAX_RETRIES || 10);
  const retryDelayMs = Number(process.env.MONGODB_RETRY_DELAY_MS || 5000);
  const shouldEnsureIndexes =
    process.env.CREATE_INDEXES_ON_STARTUP === "true" ||
    (process.env.NODE_ENV === "production" && process.env.CREATE_INDEXES_ON_STARTUP !== "false");

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        autoIndex: process.env.NODE_ENV !== "production",
        maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
        serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
        socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000)
      });

      logger.info("MongoDB connected", getDatabaseStatus());

      if (shouldEnsureIndexes) {
        await ensureDatabaseIndexes();
      }

      return mongoose.connection;
    } catch (error) {
      lastError = error;
      logger.warn("MongoDB connection attempt failed", {
        attempt,
        maxRetries,
        message: error.message
      });

      if (attempt < maxRetries) {
        await wait(retryDelayMs);
      }
    }
  }

  throw lastError;
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected", getDatabaseStatus());
});

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", {
    message: error.message
  });
});

export const closeDBConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  }
};

export default connectDB;
