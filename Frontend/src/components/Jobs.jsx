// Frontend/src/components/Jobs.jsx

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Job from "./Job";
import useGetAllJobs from "./hooks/useGetAllJobs";
import {
  matchesJobCategory,
  matchesJobSearch,
  matchesSalaryFilter,
} from "@/utils/jobFilters";

const Jobs = () => {
  useGetAllJobs();

  const { jobs = [], loading, error } = useSelector((state) => state.jobs);

  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const urlLocation = searchParams.get("location") || "";

  const [filters, setFilters] = useState({
    location: "All",
    role: "All",
    salary: "All",
  });

  // Keep the location filter in sync with searches from the home page.
  useEffect(() => {
    setFilters((previous) => ({
      ...previous,
      location: urlLocation || "All",
    }));
  }, [urlLocation]);

  const handleFilterChange = (filterName, value) => {
    setFilters((previous) => ({
      ...previous,
      [filterName]: value,
    }));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const locationMatch =
        filters.location === "All" ||
        String(job.location || "").toLowerCase() ===
          filters.location.toLowerCase();

      const roleMatch =
        filters.role === "All" ||
        String(job.title || "")
          .toLowerCase()
          .includes(filters.role.toLowerCase());

      const searchMatch = matchesJobSearch(job, query);
      const categoryMatch = matchesJobCategory(job, category);
      const salaryMatch = matchesSalaryFilter(job.salary, filters.salary);

      return (
        locationMatch &&
        roleMatch &&
        searchMatch &&
        categoryMatch &&
        salaryMatch
      );
    });
  }, [jobs, filters, query, category]);

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            Explore opportunities
          </p>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {category
              ? `${category} Jobs`
              : query
                ? `Jobs matching "${query}"`
                : "Find Your Next Job"}
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            {filteredJobs.length} matching{" "}
            {filteredJobs.length === 1 ? "job" : "jobs"} found
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside>
            <FilterCard
              jobs={jobs}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <section className="space-y-5">
            {loading ? (
              <p className="rounded-2xl border border-white/10 bg-[#10101b] p-8 text-center text-gray-400">
                Loading jobs...
              </p>
            ) : error ? (
              <p className="rounded-2xl border border-red-500/20 bg-[#10101b] p-8 text-center text-red-400">
                {error}
              </p>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#10101b] p-8 text-center">
                <h2 className="text-lg font-semibold">
                  No matching jobs found
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Try another keyword or clear some filters.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      location: "All",
                      role: "All",
                      salary: "All",
                    })
                  }
                  className="mt-5 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold hover:bg-purple-500"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => <Job key={job._id} job={job} />)
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
