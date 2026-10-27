import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  IndianRupee,
  Clock3,
  BriefcaseBusiness,
  Users,
  CalendarDays,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import Navbar from "./shared/Navbar";
import { JOB_API_END_POINT } from "@/utils/constant";
import { getRelativeDate } from "@/utils/relativeDate";
import { formatSalary } from "@/utils/jobFilters";
import { APPLICATION_API_END_POINT } from "@/utils/constant";

const JobDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const currentUserId = user?._id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchJobDetails = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`${JOB_API_END_POINT}/get/${id}`, {
          withCredentials: true,
        });

        if (cancelled) return;

        if (response.data.success && response.data.job) {
          setJob(response.data.job);
        } else {
          setJob(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching job details:", error);
          setJob(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const checkApplication = async () => {
      if (!currentUserId) {
        setApplied(false);
        setRequiresLogin(true);
        setCheckingApplication(false);
        return;
      }

      setRequiresLogin(false);
      setCheckingApplication(true);

      try {
        const response = await axios.get(
          `${APPLICATION_API_END_POINT}/check/${id}`,
          { withCredentials: true },
        );

        if (!cancelled) {
          setApplied(response.data.applied === true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error checking application:", error);
          setApplied(false);

          if (error.response?.status === 401) {
            setRequiresLogin(true);
          }
        }
      } finally {
        if (!cancelled) {
          setCheckingApplication(false);
        }
      }
    };

    if (id) {
      fetchJobDetails();
      checkApplication();
    } else {
      setJob(null);
      setLoading(false);
      setCheckingApplication(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id, currentUserId]);

  const handleApply = async () => {
    if (!currentUserId || requiresLogin) {
      toast.info("Please log in to apply for this job.");

      navigate("/login", {
        state: { from: `/description/${id}` },
      });

      return;
    }
    if (
      job?.applicationDeadline &&
      new Date() > new Date(job.applicationDeadline)
    ) {
      toast.error("The application deadline for this job has expired.");
      return;
    }

    if (!job?._id || applying || applied) return;

    setApplying(true);

    try {
      const response = await axios.post(
        `${APPLICATION_API_END_POINT}/apply/${job._id}`,
        {},
        { withCredentials: true },
      );

      if (response.data.success) {
        setApplied(true);

        // Update the displayed count immediately after a successful application.
        setJob((previousJob) => {
          if (!previousJob) return previousJob;

          const currentCount = Array.isArray(previousJob.applications)
            ? previousJob.applications.length
            : 0;

          return {
            ...previousJob,
            applications: [
              ...(Array.isArray(previousJob.applications)
                ? previousJob.applications
                : []),
              `new-application-${Date.now()}`,
            ].slice(0, currentCount + 1),
          };
        });

        toast.success("Job applied successfully!");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to apply for this job. Please log in and try again.";

      if (message.toLowerCase().includes("already applied")) {
        setApplied(true);
      }

      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] text-white">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#080810] text-white">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Job Not Found</h1>
          <p className="mt-3 text-gray-400">
            Job details could not be loaded. Please try again from the Jobs
            page.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="mt-6 rounded-lg bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const companyName =
    typeof job.company === "object"
      ? job.company?.name || "Company"
      : job.company || "Company";

  const requirements = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === "string"
      ? job.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const postedDate = getRelativeDate(job.createdAt);
  const deadlineExpired = Boolean(
    job.applicationDeadline && new Date() > new Date(job.applicationDeadline),
  );

  const formattedDeadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const applicantsCount = Array.isArray(job.applications)
    ? job.applications.length
    : 0;

  const applyButtonText = applying
    ? "Applying..."
    : checkingApplication
      ? "Checking..."
      : deadlineExpired
        ? "Deadline Expired"
        : !currentUserId || requiresLogin
          ? "Login to Apply"
          : applied
            ? "Already Applied"
            : "Apply Now";

  const applyButtonDisabled =
    applying ||
    checkingApplication ||
    deadlineExpired ||
    (applied && !!currentUserId && !requiresLogin);

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/jobs")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-purple-300"
        >
          <ArrowLeft size={17} />
          Back to Jobs
        </button>

        <section className="rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                <Building2 size={30} />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold sm:text-3xl">
                  {job.title}
                </h1>

                <p className="mt-2 text-gray-300">{companyName}</p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {job.location || "Location not specified"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <BriefcaseBusiness size={16} />
                    {job.jobType || "Job type not specified"}
                  </span>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-200">
                  <Users size={17} />
                  <span>
                    {applicantsCount}{" "}
                    {applicantsCount === 1 ? "person has" : "people have"}{" "}
                    applied
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleApply}
              disabled={applyButtonDisabled}
              className="shrink-0 rounded-lg bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applyButtonText}
            </button>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
              <h2 className="text-xl font-bold">Job Description</h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {job.description || "No description provided."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
              <h2 className="text-xl font-bold">Requirements</h2>

              {requirements.length > 0 ? (
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-gray-300 marker:text-purple-400">
                  {requirements.map((requirement, index) => (
                    <li key={`${requirement}-${index}`}>{requirement}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-gray-400">
                  No specific requirements provided.
                </p>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
            <h2 className="text-xl font-bold">Job Overview</h2>

            <div className="mt-6 space-y-5">
              {/* Salary */}
              <div className="flex items-start gap-3">
                <IndianRupee className="mt-1 text-purple-300" size={19} />
                <div>
                  <p className="text-sm text-gray-400">Salary</p>
                  <p className="mt-1 font-semibold">
                    {formatSalary(job.salary)}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3">
                <Clock3 className="mt-1 text-purple-300" size={19} />
                <div>
                  <p className="text-sm text-gray-400">Experience</p>
                  <p className="mt-1 font-semibold">
                    {job.experience != null
                      ? `${job.experience} years`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Openings */}
              <div className="flex items-start gap-3">
                <Users className="mt-1 text-purple-300" size={19} />
                <div>
                  <p className="text-sm text-gray-400">Openings</p>
                  <p className="mt-1 font-semibold">
                    {job.positions ?? "Not specified"}
                  </p>
                </div>
              </div>

              {/* Total Applicants */}
              <div className="flex items-start gap-3">
                <Users className="mt-1 text-purple-300" size={19} />
                <div>
                  <p className="text-sm text-gray-400">Total Applicants</p>
                  <p className="mt-1 font-semibold">{applicantsCount}</p>
                </div>
              </div>

              {/* Posted On */}
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 text-purple-300" size={19} />
                <div>
                  <p className="text-sm text-gray-400">Posted On</p>
                  <p className="mt-1 font-semibold">{postedDate}</p>
                </div>
              </div>

              {/* Application Deadline */}
              {formattedDeadline && (
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 text-purple-300" size={19} />
                  <div>
                    <p className="text-sm text-gray-400">
                      Application Deadline
                    </p>

                    <p
                      className={`mt-1 font-semibold ${
                        deadlineExpired ? "text-red-400" : "text-white"
                      }`}
                    >
                      {formattedDeadline}
                    </p>

                    {deadlineExpired && (
                      <p className="mt-1 text-xs text-red-400">
                        Applications are closed for this job.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              disabled={applyButtonDisabled}
              className="mt-7 w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {applyButtonText}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default JobDescription;
