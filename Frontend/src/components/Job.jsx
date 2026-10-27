// Frontend/src/components/Job.jsx

import { useState } from "react";
import {
  MapPin,
  IndianRupee,
  Clock3,
  Bookmark,
  Building2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getRelativeDate } from "@/utils/relativeDate";
import { formatSalary, getCompanyName } from "@/utils/jobFilters";

const Job = ({ job }) => {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const companyName = getCompanyName(job);

  const companyInitial = companyName
    ? companyName.charAt(0).toUpperCase()
    : "C";

  const postedDate = getRelativeDate(job.createdAt);
  const salaryText = formatSalary(job.salary);

  const handleSave = () => {
    setSaved((previous) => !previous);

    toast.success(
      saved ? "Job removed from saved list" : "Job saved for later",
    );
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[#10101b] p-5 text-white transition hover:border-purple-400/40 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-fuchsia-600 text-xl font-bold">
            {companyName ? companyInitial : <Building2 className="h-6 w-6" />}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-bold">{job.title}</h3>

            <p className="mt-1 text-sm text-gray-400">
              {companyName || "Company"}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={15} />
                {job.location || "Location not specified"}
              </span>

              <span className="flex items-center gap-1.5">
                <IndianRupee size={15} />
                {salaryText}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock3 size={15} />
                {postedDate}
              </span>
            </div>
          </div>
        </div>

        <span className="h-fit w-fit rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
          {job.jobType || "Job"}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-400">
        {job.description || "No job description available."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <Users size={15} />
          {job.positions ?? "—"} openings
        </span>

        <span>{job.experience ?? "Not specified"} years experience</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            saved
              ? "bg-purple-500/15 text-purple-300"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save for Later"}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/description/${job._id}`)}
          className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold transition hover:bg-purple-500"
        >
          Details
        </button>
      </div>
    </article>
  );
};

export default Job;
