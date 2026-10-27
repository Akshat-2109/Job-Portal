import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

// POST /api/v1/application/apply/:id  (student only)
export const applyJob = async (req, res, next) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found.", success: false });
    }

    if (
      job.applicationDeadline &&
      new Date() > new Date(job.applicationDeadline)
    ) {
      return res.status(400).json({
        message: "The application deadline for this job has expired.",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    let newApplication;

    try {
      newApplication = await Application.create({
        job: jobId,
        applicant: userId,
      });
    } catch (error) {
      // Unique index (job + applicant) caught a simultaneous duplicate request.
      if (error.code === 11000) {
        return res.status(400).json({
          message: "You have already applied for this job.",
          success: false,
        });
      }
      throw error;
    }

    // Atomic update: avoids overwriting concurrent applications.
    await Job.updateOne(
      { _id: jobId },
      { $addToSet: { applications: newApplication._id } },
    );

    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
      application: newApplication,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/application/get  (student only)
export const getAppliedJobs = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: { path: "company" },
      });

    // Ignore applications whose job or company has been deleted.
    const activeApplications = applications.filter(
      (item) => item.job && item.job.company,
    );

    return res.status(200).json({
      application: activeApplications,
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/application/:id/applicants  (recruiter who owns the job)
export const getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("company", "name");

    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    if (!job.company) {
      return res.status(404).json({
        message: "This job's company has been deleted.",
        success: false,
      });
    }

    if (job.createdBy.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to view these applicants.",
        success: false,
      });
    }

    await job.populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
        select: "fullname email phoneNumber profile",
      },
    });

    return res.status(200).json({ job, success: true });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/application/status/:id/update  (recruiter who owns the job)
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected.",
        success: false,
      });
    }

    const application = await Application.findById(req.params.id).populate({
      path: "job",
      populate: { path: "company", select: "name" },
    });

    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found.", success: false });
    }

    if (!application.job || !application.job.company) {
      return res.status(404).json({
        message: "This job or its company no longer exists.",
        success: false,
      });
    }

    if (application.job.createdBy.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this application.",
        success: false,
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      message: `Application ${status} successfully.`,
      success: true,
      application,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/application/check/:id  (logged-in user)
export const checkApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      job: req.params.id,
      applicant: req.id,
    }).select("_id");

    return res.status(200).json({
      success: true,
      applied: Boolean(application),
    });
  } catch (error) {
    return next(error);
  }
};
