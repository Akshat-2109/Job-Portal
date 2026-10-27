import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import {
  escapeRegex,
  isNonEmptyString,
  isValidObjectId,
} from "../utils/validators.js";

const parseRequirements = (value) => {
  const list = Array.isArray(value) ? value : String(value).split(",");

  return list.map((item) => String(item).trim()).filter(Boolean);
};

// POST /api/v1/job/post  (recruiter only)
export const postJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      positions,
      companyId,
      applicationDeadline,
    } = req.body;

    if (
      !isNonEmptyString(title) ||
      !isNonEmptyString(description) ||
      !isNonEmptyString(location) ||
      !isNonEmptyString(jobType) ||
      !requirements ||
      !companyId ||
      !applicationDeadline
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const salaryValue = Number(salary);
    const experienceValue = Number(experience);
    const positionsValue = Number(positions);

    if (!Number.isFinite(salaryValue) || salaryValue <= 0) {
      return res
        .status(400)
        .json({ message: "Please enter a valid salary.", success: false });
    }

    // Experience 0 is valid (freshers), so it must not be checked for "falsy".
    if (!Number.isFinite(experienceValue) || experienceValue < 0) {
      return res.status(400).json({
        message: "Experience must be 0 or more years.",
        success: false,
      });
    }

    if (!Number.isInteger(positionsValue) || positionsValue < 1) {
      return res.status(400).json({
        message: "Number of positions must be at least 1.",
        success: false,
      });
    }

    const requirementList = parseRequirements(requirements);

    if (requirementList.length === 0) {
      return res.status(400).json({
        message: "Please add at least one requirement.",
        success: false,
      });
    }

    const deadline = new Date(applicationDeadline);

    if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
      return res.status(400).json({
        message: "Please select a valid future application deadline.",
        success: false,
      });
    }

    if (!isValidObjectId(String(companyId))) {
      return res
        .status(400)
        .json({ message: "Invalid company selected.", success: false });
    }

    const company = await Company.findOne({
      _id: companyId,
      userId: req.id,
    });

    if (!company) {
      return res.status(400).json({
        message: "Company not found. Please select an existing company.",
        success: false,
      });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      requirements: requirementList,
      salary: salaryValue,
      location: location.trim(),
      jobType: jobType.trim(),
      experience: experienceValue,
      positions: positionsValue,
      company: companyId,
      createdBy: req.id,
      applicationDeadline: deadline,
    });

    return res
      .status(201)
      .json({ message: "Job posted successfully", success: true, job });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/job/get?keywords=...  (public)
export const getAllJobs = async (req, res, next) => {
  try {
    const keywords =
      typeof req.query.keywords === "string" ? req.query.keywords.trim() : "";

    const query = {};

    if (keywords) {
      const pattern = escapeRegex(keywords);
      query.$or = [
        { title: { $regex: pattern, $options: "i" } },
        { description: { $regex: pattern, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .populate("company", "name logo location")
      .populate("createdBy", "fullname")
      .sort({ createdAt: -1 });

    // Hide jobs whose company has been deleted.
    const activeJobs = jobs.filter((job) => job.company !== null);

    return res.status(200).json({
      message: "Jobs fetched successfully",
      success: true,
      jobs: activeJobs,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/job/get/:id  (public)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "company",
      "name logo location",
    );

    if (!job || !job.company) {
      return res.status(404).json({
        message: "Job or associated company no longer exists.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Job fetched successfully",
      success: true,
      job,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/job/getadminjobs  (recruiter only)
export const getAdminJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.id })
      .populate("company", "name logo location")
      .populate("createdBy", "fullname")
      .sort({ createdAt: -1 });

    const activeJobs = jobs.filter((job) => job.company !== null);

    return res.status(200).json({
      message: "Admin jobs fetched successfully",
      success: true,
      jobs: activeJobs,
    });
  } catch (error) {
    return next(error);
  }
};
