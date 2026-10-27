import { isProduction } from "../utils/env.js";

export const notFoundHandler = (req, res) =>
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    success: false,
  });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "MulterError") {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum allowed size is 5 MB."
        : err.message;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON in request body.";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid value supplied.";
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with these details already exists.";
  }

  if (status >= 500) {
    console.error("Unhandled error:", err);
    if (isProduction()) message = "Internal server error";
  }

  return res.status(status).json({ message, success: false });
};
