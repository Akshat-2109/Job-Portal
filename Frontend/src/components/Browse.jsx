// Frontend/src/components/Browse.jsx

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import useGetAllJobs from "./hooks/useGetAllJobs";
import { matchesJobCategory, matchesJobSearch } from "@/utils/jobFilters";

const Browse = () => {
  useGetAllJobs();

  const { jobs = [], loading, error } = useSelector((state) => state.jobs);

  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchMatch = matchesJobSearch(job, query);
      const categoryMatch = matchesJobCategory(job, category);

      const locationMatch =
        !location ||
        location.toLowerCase() === "all" ||
        String(job.location || "").toLowerCase() === location.toLowerCase();

      return searchMatch && categoryMatch && locationMatch;
    });
  }, [jobs, query, category, location]);

  const heading = category
    ? `${category} Jobs`
    : query
      ? `Results for "${query}"`
      : "Browse All Jobs";

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            Explore opportunities
          </p>

          <h1 className="text-3xl font-extrabold sm:text-4xl">{heading}</h1>

          <p className="mt-3 text-sm text-gray-400">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}{" "}
            found
          </p>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-white/10 bg-[#10101b] p-8 text-center text-gray-400">
            Loading jobs...
          </p>
        ) : error ? (
          <p className="rounded-2xl border border-red-500/20 bg-[#10101b] p-8 text-center text-red-400">
            {error}
          </p>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#10101b] p-10 text-center">
            <h2 className="text-lg font-semibold">No jobs found</h2>
            <p className="mt-2 text-sm text-gray-400">
              Try a different keyword or browse all available jobs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredJobs.map((job) => (
              <Job key={job._id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
