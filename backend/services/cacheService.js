import crypto from "crypto";
import { connectRedis } from "../config/redis.js";
import { DEFAULT_AI_CACHE_TTL_SECONDS } from "../utils/constants.js";

const sortValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = sortValue(value[key]);
        return accumulator;
      }, {});
  }

  return value;
};

const buildStableString = (value) =>
  typeof value === "string" ? value : JSON.stringify(sortValue(value));

export const buildCacheKey = (...parts) =>
  `ai-health:${crypto.createHash("sha256").update(parts.map(buildStableString).join(":")).digest("hex")}`;

export const getCachedJson = async (key) => {
  const client = await connectRedis();
  if (!client) {
    return null;
  }

  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

export const setCachedJson = async (key, value, ttlSeconds = DEFAULT_AI_CACHE_TTL_SECONDS) => {
  const client = await connectRedis();
  if (!client) {
    return;
  }

  await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
};
