import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, BriefcaseBusiness, Building2, ArrowLeft } from "lucide-react";

import { COMPANY_API_END_POINT, JOB_API_END_POINT } from "../../utils/constant";

// shadcn Select component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const initialFormData = {
  title: "",
  description: "",
  requirements: "",
  salary: "",
  location: "",
  jobType: "",
  experience: "",
  positions: "",
  companyId: "",
  applicationDeadline: "",
};
const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const jobTypes = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Hybrid",
  "Remote",
  "On-site",
];

const PostJob = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState(initialFormData);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [, setCompaniesError] = useState("");
  const [posting, setPosting] = useState(false);

  // Fetch companies registered by the logged-in recruiter
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");

      try {
        const response = await axios.get(`${COMPANY_API_END_POINT}/get`, {
          withCredentials: true,
        });

        const registeredCompanies = response.data.companies || [];

        setCompanies(registeredCompanies);

        if (registeredCompanies.length === 0) {
          setCompaniesError(
            "Please register a company first before posting a job.",
          );
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Unable to fetch your registered companies.";

        setCompanies([]);
        setCompaniesError(message);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleJobTypeChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      jobType: value,
    }));
  };

  const handleCompanyChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      companyId: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user || user.role !== "recruiter") {
      toast.error("Please log in with a recruiter account.");
      return;
    }

    if (companiesLoading) {
      toast.error("Please wait while your companies are loading.");
      return;
    }

    if (companies.length === 0) {
      toast.error("Please register a company first.");
      return;
    }

    if (!formData.companyId) {
      toast.error("Please select a company.");
      return;
    }

    const salary = Number(formData.salary);
    const experience = Number(formData.experience);
    const positions = Number(formData.positions);

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.requirements.trim() ||
      !formData.location.trim() ||
      !formData.jobType
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!Number.isFinite(salary) || salary <= 0) {
      toast.error("Please enter a valid salary.");
      return;
    }

    if (!Number.isFinite(experience) || experience < 0) {
      toast.error("Experience cannot be negative.");
      return;
    }

    if (!Number.isInteger(positions) || positions < 1) {
      toast.error("Number of positions must be at least 1.");
      return;
    }
    if (!formData.applicationDeadline) {
      toast.error("Please select an application deadline.");
      return;
    }

    setPosting(true);

    try {
      const [year, month, day] = formData.applicationDeadline
        .split("-")
        .map(Number);

      const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);

      if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
        toast.error("Please select a valid future application deadline.");
        return;
      }

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        salary,
        experience,
        positions,
        location: formData.location.trim(),
        applicationDeadline: deadline.toISOString(),
      };

      const response = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Job posted successfully!");

        setFormData(initialFormData);
        navigate("/admin/jobs");
      } else {
        toast.error(response.data.message || "Unable to post job.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while posting the job.",
      );
    } finally {
      setPosting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

  const labelClass = "mb-2 block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/admin/jobs")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-purple-700"
        >
          <ArrowLeft size={17} />
          Back to Jobs
        </button>

        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <BriefcaseBusiness size={25} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Post a New Job
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add the job details and select the company hiring for this position.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Company selection */}
          <div>
            <label className={labelClass}>
              <span className="inline-flex items-center gap-2">
                <Building2 size={16} />
                Select Company *
              </span>
            </label>

            {companiesLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-500">
                <Loader2 size={17} className="animate-spin" />
                Loading your registered companies...
              </div>
            ) : companies.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  Please register a company first.
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  You need a registered company before you can post a job.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/admin/companies/create")}
                  className="mt-3 rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-800"
                >
                  Register a Company
                </button>
              </div>
            ) : (
              <>
                <Select
                  value={formData.companyId}
                  onValueChange={handleCompanyChange}
                  disabled={posting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a registered company" />
                  </SelectTrigger>

                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="mt-2 text-xs text-gray-500">
                  {companies.length} registered{" "}
                  {companies.length === 1 ? "company" : "companies"} available
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Job title */}
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelClass}>
                Job Title *
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                className={inputClass}
                maxLength={120}
                required
                disabled={posting}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities and expectations..."
                className={`${inputClass} min-h-32 resize-y`}
                required
                disabled={posting}
              />
            </div>

            {/* Requirements */}
            <div className="sm:col-span-2">
              <label htmlFor="requirements" className={labelClass}>
                Requirements *
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Enter skills separated by commas, e.g. React, JavaScript, HTML, CSS"
                className={`${inputClass} min-h-28 resize-y`}
                required
                disabled={posting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate each skill or requirement with a comma.
              </p>
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="salary" className={labelClass}>
                Salary (LPA) *
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                min="0.1"
                step="any"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 6 (lakhs per annum)"
                className={inputClass}
                required
                disabled={posting}
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className={labelClass}>
                Location *
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Noida, India"
                className={inputClass}
                required
                disabled={posting}
              />
            </div>

            {/* Job type */}
            <div>
              <label className={labelClass}>Job Type / Work Mode *</label>
              <Select
                value={formData.jobType}
                onValueChange={handleJobTypeChange}
                disabled={posting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className={labelClass}>
                Experience Required (years) *
              </label>
              <input
                id="experience"
                name="experience"
                type="number"
                min="0"
                step="1"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 0 for fresher"
                className={inputClass}
                required
                disabled={posting}
              />
            </div>

            {/* Positions */}
            <div>
              <label htmlFor="positions" className={labelClass}>
                Number of Positions *
              </label>
              <input
                id="positions"
                name="positions"
                type="number"
                min="1"
                step="1"
                value={formData.positions}
                onChange={handleChange}
                placeholder="e.g. 5"
                className={inputClass}
                required
                disabled={posting}
              />
            </div>

            {/* Application Deadline */}
            <div>
              <label htmlFor="applicationDeadline" className={labelClass}>
                Application Deadline *
              </label>

              <input
                id="applicationDeadline"
                name="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={handleChange}
                min={getLocalDateString()}
                className={inputClass}
                required
                disabled={posting}
              />

              <p className="mt-1 text-xs text-gray-500">
                Applications will be accepted until the end of this date.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={posting || companiesLoading || companies.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
            >
              {posting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <BriefcaseBusiness size={18} />
                  Post New Job
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-gray-500">
              Fields marked with * are required.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
