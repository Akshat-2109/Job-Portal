import express from "express";

import {
  register,
  login,
  logout,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router
  .route("/register")
  .post(authLimiter, upload.single("profilePhoto"), register);
router.route("/login").post(authLimiter, login);
router.route("/logout").get(logout);

router.route("/profile/update").post(
  isAuthenticated,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateProfile,
);

// Password recovery: send OTP -> verify OTP -> reset password.
router.route("/forgot-password").post(otpLimiter, forgotPassword);
router.route("/verify-otp").post(otpLimiter, verifyOTP);
router.route("/reset-password").post(otpLimiter, resetPassword);

// Change password for a logged-in user.
router.route("/change-password").post(isAuthenticated, changePassword);

export default router;
