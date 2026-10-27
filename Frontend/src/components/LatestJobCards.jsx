import { MapPin, IndianRupee, Users, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getRelativeDate } from "@/utils/relativeDate";
import { formatSalary } from "@/utils/jobFilters";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  const companyName =
    typeof job.company === "object" ? job.company?.name : job.company;

  const postedDate = getRelativeDate(job.createdAt);
  const salaryText = formatSalary(job.salary);

  const openJobDescription = () => {
    if (job?._id) {
      navigate(`/description/${job._id}`);
    } else {
      console.error("Job ID missing:", job);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openJobDescription}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openJobDescription();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/4 p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-400/40 hover:bg-purple-500/6 hover:shadow-xl hover:shadow-purple-950/20"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
          <Building2 className="h-6 w-6 text-purple-300" />
        </div>

        <Badge className="border border-purple-400/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20">
          {job.jobType}
        </Badge>
      </div>

      <h3 className="text-lg font-bold text-white transition group-hover:text-purple-300">
        {job.title}
      </h3>

      <p className="mt-2 text-sm font-medium text-gray-300">
        {companyName || "Company"}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-purple-400" />
          {job.location}
        </span>

        <span className="flex items-center gap-1.5">
          <IndianRupee size={15} />
          {salaryText}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users className="h-4 w-4 text-purple-400" />
          {job.positions} openings
        </span>

        <span className="text-xs text-gray-500">{postedDate}</span>
      </div>
    </article>
  );
};

export default LatestJobCards;
