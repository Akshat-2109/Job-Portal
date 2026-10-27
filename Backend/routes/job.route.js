import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  postJob,
  getAllJobs,
  getJobById,
  getAdminJobs,
} from "../controllers/job.controller.js";

const router = express.Router();

// Public: anyone can browse jobs and read a job description.
router.route("/get").get(getAllJobs);
router.route("/get/:id").get(validateObjectId(), getJobById);

// Recruiter only.
router.route("/post").post(isAuthenticated, requireRole("recruiter"), postJob);
router
  .route("/getadminjobs")
  .get(isAuthenticated, requireRole("recruiter"), getAdminJobs);

export default router;
