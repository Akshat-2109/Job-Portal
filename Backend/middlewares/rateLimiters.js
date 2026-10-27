import rateLimit from "express-rate-limit";

const buildLimiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message, success: false },
  });

/** Login / register brute-force protection. */
export const authLimiter = buildLimiter(
  15,
  30,
  "Too many attempts. Please try again in a few minutes.",
);

/** Stricter limit for anything that sends an email or checks an OTP. */
export const otpLimiter = buildLimiter(
  15,
  10,
  "Too many password reset attempts. Please try again later.",
);
