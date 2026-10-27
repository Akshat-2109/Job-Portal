import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  applyJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
  checkApplication,
} from "../controllers/application.controller.js";

const router = express.Router();

router
  .route("/apply/:id")
  .post(isAuthenticated, requireRole("student"), validateObjectId(), applyJob);

router
  .route("/get")
  .get(isAuthenticated, requireRole("student"), getAppliedJobs);

router
  .route("/check/:id")
  .get(isAuthenticated, validateObjectId(), checkApplication);

router
  .route("/:id/applicants")
  .get(
    isAuthenticated,
    requireRole("recruiter"),
    validateObjectId(),
    getApplicants,
  );

router
  .route("/status/:id/update")
  .post(
    isAuthenticated,
    requireRole("recruiter"),
    validateObjectId(),
    updateStatus,
  );

export default router;
