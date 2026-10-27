import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import upload from "../middlewares/multer.js";
import {
  registerCompany,
  getCompanyByUserId,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";

const router = express.Router();

// Every company route belongs to recruiters only.
router.use(isAuthenticated, requireRole("recruiter"));

router.route("/register").post(registerCompany);
router.route("/get").get(getCompanyByUserId);
router.route("/get/:id").get(validateObjectId(), getCompanyById);
router
  .route("/update/:id")
  .put(validateObjectId(), upload.single("file"), updateCompany);
router.route("/delete/:id").delete(validateObjectId(), deleteCompany);

export default router;
