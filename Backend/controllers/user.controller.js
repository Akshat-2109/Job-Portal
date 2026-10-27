import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import PasswordReset from "../models/passwordReset.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import sendEmail from "../utils/sendEmail.js";
import {
  authCookieOptions,
  clearCookieOptions,
} from "../utils/cookieOptions.js";
import {
  escapeRegex,
  isNonEmptyString,
  isValidEmail,
  normalizeEmail,
} from "../utils/validators.js";

const ROLES = ["student", "recruiter"];
const MIN_PASSWORD_LENGTH = 8;
const OTP_RESEND_SECONDS = 60;
const OTP_VALID_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const GENERIC_OTP_MESSAGE =
  "If the account exists, an OTP will be sent to its email.";

/** Case-insensitive lookup (also matches older accounts saved with capitals). */
const findUserByEmail = (email) =>
  User.findOne({
    email: { $regex: `^${escapeRegex(email.trim())}$`, $options: "i" },
  });

const sha256 = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const toUserResponse = (user) => ({
  _id: user._id,
  fullname: user.fullname,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  profile: user.profile,
});

const uploadToCloudinary = async (file, folder, resourceType = "image") => {
  const dataUri = getDataUri(file);
  const result = await cloudinary.uploader.upload(dataUri.content, {
    folder,
    resource_type: resourceType,
  });
  return result.secure_url;
};

// POST /api/v1/user/register
export const register = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (
      !isNonEmptyString(fullname) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(phoneNumber) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(role)
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({
          message: "Please enter a valid email address.",
          success: false,
        });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        success: false,
      });
    }

    if (!ROLES.includes(role)) {
      return res
        .status(400)
        .json({
          message: "Role must be student or recruiter.",
          success: false,
        });
    }

    if (await findUserByEmail(email)) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    let profilePicture = "";

    if (req.file) {
      profilePicture = await uploadToCloudinary(
        req.file,
        "job-portal/profile-pictures",
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname: fullname.trim(),
      email: normalizeEmail(email),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
      role,
      profile: { profilePicture },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/user/login
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (
      !isNonEmptyString(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(role)
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const user = await findUserByEmail(email);
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatches) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    if (user.role !== role) {
      return res
        .status(400)
        .json({ message: "Invalid role for this user", success: false });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, authCookieOptions())
      .json({
        message: `Welcome back ${user.fullname}`,
        user: toUserResponse(user),
        success: true,
      });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/user/logout
export const logout = (req, res) =>
  res
    .status(200)
    .clearCookie("token", clearCookieOptions())
    .json({ message: "Logout successful", success: true });

// POST /api/v1/user/profile/update
export const updateProfile = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body || {};

    const user = await User.findById(req.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (fullname !== undefined) {
      if (!isNonEmptyString(fullname)) {
        return res
          .status(400)
          .json({ message: "Full name cannot be empty.", success: false });
      }
      user.fullname = fullname.trim();
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          message: "Please enter a valid email address.",
          success: false,
        });
      }

      const existing = await findUserByEmail(email);

      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          message: "This email is already used by another account.",
          success: false,
        });
      }

      user.email = normalizeEmail(email);
    }

    if (phoneNumber !== undefined) {
      if (!isNonEmptyString(phoneNumber)) {
        return res
          .status(400)
          .json({ message: "Phone number cannot be empty.", success: false });
      }
      user.phoneNumber = phoneNumber.trim();
    }

    if (bio !== undefined) user.profile.bio = bio;

    if (skills !== undefined) {
      user.profile.skills =
        typeof skills === "string" && skills
          ? skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [];
    }

    const pictureFile = req.files?.profilePicture?.[0];
    if (pictureFile) {
      user.profile.profilePicture = await uploadToCloudinary(
        pictureFile,
        "job-portal/profile-pictures",
      );
    }

    const resumeFile = req.files?.file?.[0];
    if (resumeFile) {
      user.profile.resume = await uploadToCloudinary(
        resumeFile,
        "job-portal/resumes",
        "auto",
      );
      user.profile.resumeOriginalName = resumeFile.originalname;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: toUserResponse(user),
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/user/forgot-password  -> step 1: email an OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isNonEmptyString(email)) {
      return res.status(400).json({
        message: "Please enter your registered email.",
        success: false,
      });
    }

    const user = await findUserByEmail(email);

    // Same response whether or not the account exists (prevents user enumeration).
    if (!user) {
      return res
        .status(200)
        .json({ message: GENERIC_OTP_MESSAGE, success: true });
    }

    const existingReset = await PasswordReset.findOne({ userId: user._id });

    if (
      existingReset?.lastSentAt &&
      Date.now() - existingReset.lastSentAt.getTime() <
        OTP_RESEND_SECONDS * 1000
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another OTP.",
        success: false,
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await PasswordReset.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          otpHash: sha256(otp),
          expiresAt: new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000),
          lastSentAt: new Date(),
          attempts: 0,
          verifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    try {
      await sendEmail({
        to: user.email,
        subject: "Job Portal - Password Reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in ${OTP_VALID_MINUTES} minutes. If you did not request this, ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Reset Your Password</h2>
            <p>Your Job Portal verification OTP is:</p>
            <h1 style="letter-spacing: 8px;">${otp}</h1>
            <p>This OTP expires in <strong>${OTP_VALID_MINUTES} minutes</strong>.</p>
            <p>If you did not request a password reset, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      await PasswordReset.deleteOne({ userId: user._id });
      throw emailError;
    }

    return res
      .status(200)
      .json({ message: GENERIC_OTP_MESSAGE, success: true });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Unable to send the OTP right now. Please try again later.",
      success: false,
    });
  }
};

// POST /api/v1/user/verify-otp  -> step 2: exchange OTP for a reset token
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (
      !isNonEmptyString(email) ||
      otp === undefined ||
      !/^\d{6}$/.test(String(otp))
    ) {
      return res.status(400).json({
        message: "Please enter your email and valid 6-digit OTP.",
        success: false,
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP.", success: false });
    }

    const resetRecord = await PasswordReset.findOne({ userId: user._id });

    if (!resetRecord || resetRecord.expiresAt <= new Date()) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one.",
        success: false,
      });
    }

    if (resetRecord.verifiedAt) {
      return res.status(400).json({
        message: "This OTP has already been used. Please request a new one.",
        success: false,
      });
    }

    if (resetRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
        success: false,
      });
    }

    if (sha256(otp) !== resetRecord.otpHash) {
      await PasswordReset.updateOne(
        { _id: resetRecord._id },
        { $inc: { attempts: 1 } },
      );

      return res
        .status(400)
        .json({ message: "Incorrect OTP.", success: false });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    resetRecord.verifiedAt = new Date();
    resetRecord.resetTokenHash = sha256(resetToken);
    resetRecord.resetTokenExpiresAt = new Date(
      Date.now() + OTP_VALID_MINUTES * 60 * 1000,
    );
    await resetRecord.save();

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/user/reset-password  -> step 3: set the new password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (
      !isNonEmptyString(email) ||
      !isNonEmptyString(resetToken) ||
      !isNonEmptyString(newPassword) ||
      !isNonEmptyString(confirmPassword)
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required.", success: false });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match.", success: false });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset session. Please start again.",
        success: false,
      });
    }

    const resetRecord = await PasswordReset.findOne({ userId: user._id });

    if (
      !resetRecord ||
      !resetRecord.verifiedAt ||
      !resetRecord.resetTokenHash ||
      !resetRecord.resetTokenExpiresAt ||
      resetRecord.resetTokenExpiresAt <= new Date()
    ) {
      return res.status(400).json({
        message: "Reset session expired. Please verify a new OTP.",
        success: false,
      });
    }

    if (sha256(resetToken) !== resetRecord.resetTokenHash) {
      return res
        .status(400)
        .json({ message: "Invalid reset token.", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Single use: remove the reset record after success.
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.status(200).json({
      message: "Password reset successfully. Please log in again.",
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/user/change-password  (logged-in user)
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      !isNonEmptyString(currentPassword) ||
      !isNonEmptyString(newPassword) ||
      !isNonEmptyString(confirmPassword)
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required.", success: false });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New passwords do not match.", success: false });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from the current password.",
        success: false,
      });
    }

    const user = await User.findById(req.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect.", success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Invalidate any outstanding password-reset request.
    await PasswordReset.deleteOne({ userId: user._id });

    return res
      .status(200)
      .json({ message: "Password changed successfully.", success: true });
  } catch (error) {
    return next(error);
  }
};
