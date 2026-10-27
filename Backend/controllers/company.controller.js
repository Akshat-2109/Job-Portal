import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import { escapeRegex, isNonEmptyString } from "../utils/validators.js";

/** Case-insensitive lookup so "Google" and "google" count as the same company. */
const findByName = (name, excludeId) => {
  const query = {
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  };

  if (excludeId) query._id = { $ne: excludeId };

  return Company.findOne(query);
};

/** Loads a company and verifies the logged-in recruiter owns it. */
const loadOwnedCompany = async (req, res, action) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404).json({ message: "Company not found", success: false });
    return null;
  }

  if (company.userId.toString() !== req.id.toString()) {
    res.status(403).json({
      message: `You are not authorized to ${action} this company`,
      success: false,
    });
    return null;
  }

  return company;
};

// POST /api/v1/company/register
export const registerCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;

    if (!isNonEmptyString(companyName)) {
      return res
        .status(400)
        .json({ message: "Company name is required", success: false });
    }

    const name = companyName.trim();

    if (await findByName(name)) {
      return res
        .status(400)
        .json({ message: "Company already exists", success: false });
    }

    const company = await Company.create({ name, userId: req.id });

    return res.status(201).json({
      message: "Company registered successfully",
      company,
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/company/get
export const getCompanyByUserId = async (req, res, next) => {
  try {
    const companies = await Company.find({ userId: req.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ companies, success: true });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/company/get/:id
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await loadOwnedCompany(req, res, "access");
    if (!company) return undefined;

    return res.status(200).json({ company, success: true });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/v1/company/update/:id
export const updateCompany = async (req, res, next) => {
  try {
    const { name, description, location, website } = req.body;

    const company = await loadOwnedCompany(req, res, "update");
    if (!company) return undefined;

    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        return res.status(400).json({
          message: "Company name cannot be empty",
          success: false,
        });
      }

      if (await findByName(name.trim(), company._id)) {
        return res.status(400).json({
          message: "Another company already uses this name",
          success: false,
        });
      }

      company.name = name.trim();
    }

    if (description !== undefined) company.description = description;
    if (location !== undefined) company.location = location;
    if (website !== undefined) company.website = website;

    if (req.file) {
      const fileUri = getDataUri(req.file);

      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "company_logos",
        resource_type: "image",
      });

      company.logo = cloudResponse.secure_url;
    }

    await company.save();

    return res.status(200).json({
      message: "Company updated successfully",
      company,
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/v1/company/delete/:id
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await loadOwnedCompany(req, res, "delete");
    if (!company) return undefined;

    // Cascade: remove the company's jobs and every application to those jobs
    // so no orphaned data is left behind.
    const jobs = await Job.find({ company: company._id }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    if (jobIds.length > 0) {
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }

    await Company.findByIdAndDelete(company._id);

    return res.status(200).json({
      message: "Company deleted successfully",
      success: true,
      companyId: company._id,
    });
  } catch (error) {
    return next(error);
  }
};
