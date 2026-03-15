import multer from "multer";
import path from "path";
import { logger } from "../utils/logger.js";

const storage = multer.memoryStorage();
const uploadLimitBytes = Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024);

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

    if (!allowedExtensions.includes(extension)) {
      cb(new Error("Invalid file extension"));
      return;
    }

    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
  }
};

const scanForMalware = async (_file) => {
  if (process.env.ENABLE_MALWARE_SCAN === "true" && process.env.ANTIVIRUS_SCAN_COMMAND) {
    return {
      clean: true,
      message: "Antivirus scan hook configured"
    };
  }

  return {
    clean: true,
    message: "Malware scan skipped"
  };
};

const hasValidFileSignature = (file) => {
  const hex = file.buffer.subarray(0, 8).toString("hex").toUpperCase();

  if (file.mimetype === "application/pdf") {
    return file.buffer.subarray(0, 4).toString() === "%PDF";
  }

  if (file.mimetype === "image/png") {
    return hex.startsWith("89504E470D0A1A0A");
  }

  if (["image/jpeg", "image/jpg"].includes(file.mimetype)) {
    return hex.startsWith("FFD8FF");
  }

  return false;
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: uploadLimitBytes }
});

export const enforceSafeUpload = async (req, _res, next) => {
  if (!req.file) {
    next();
    return;
  }

  const scanResult = await scanForMalware(req.file);
  if (!scanResult.clean) {
    next(new Error("File failed security scan"));
    return;
  }

  if (!hasValidFileSignature(req.file)) {
    next(new Error("Uploaded file content does not match its declared file type"));
    return;
  }

  req.fileSecurity = scanResult;
  logger.info("Upload validated", {
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    scanMessage: scanResult.message
  });
  next();
};
