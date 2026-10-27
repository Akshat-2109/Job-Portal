import { isProduction } from "./env.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * In production the frontend and API usually live on different domains
 * (e.g. Vercel + Render), so the cookie must be `SameSite=None; Secure`.
 * In development `Lax` works on localhost without HTTPS.
 */
export const authCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  maxAge: ONE_DAY_MS,
});

export const clearCookieOptions = () => {
  const { maxAge, ...rest } = authCookieOptions();
  return rest;
};
