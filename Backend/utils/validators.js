import mongoose from "mongoose";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (value) =>
  typeof value === "string" && EMAIL_PATTERN.test(value.trim());

export const normalizeEmail = (value) => String(value).trim().toLowerCase();

export const isValidObjectId = (value) =>
  typeof value === "string" &&
  mongoose.isValidObjectId(value) &&
  /^[0-9a-fA-F]{24}$/.test(value);

/** Escape user input before using it inside a RegExp. */
export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
