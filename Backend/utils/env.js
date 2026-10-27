import dotenv from "dotenv";

dotenv.config();

const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

/**
 * Fail fast with a readable message instead of crashing later
 * with an obscure error (e.g. "secretOrPrivateKey must have a value").
 */
export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};

export const isProduction = () => process.env.NODE_ENV === "production";

/** Allowed CORS origins parsed from CLIENT_URL (comma separated). */
export const getAllowedOrigins = () =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
