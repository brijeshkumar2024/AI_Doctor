import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { externalServiceFailureCounter } from "../config/metrics.js";
import { logger } from "../utils/logger.js";

const uploadLimitBytes = Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024);

export const getCloudinaryStatus = () => ({
  configured: Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  ),
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || ""
});

export const uploadBufferToCloudinary = (buffer, folder, fileName, resourceType = "auto") =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName?.split(".")?.[0],
        resource_type: resourceType,
        max_bytes: uploadLimitBytes
      },
      (error, result) => {
        if (error) {
          externalServiceFailureCounter.inc({
            service: "cloudinary",
            operation: "upload"
          });
          logger.warn("Cloudinary upload failed", {
            message: error.message
          });
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

export const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (error) {
    externalServiceFailureCounter.inc({
      service: "cloudinary",
      operation: "delete"
    });
    logger.warn("Cloudinary asset deletion failed", {
      message: error.message,
      publicId
    });
    throw error;
  }
};
