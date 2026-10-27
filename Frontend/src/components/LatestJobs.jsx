import { useSelector } from "react-redux";
import LatestJobCards from "./LatestJobCards";

const LatestJobs = () => {
  const { jobs, loading, error } = useSelector((state) => state.jobs);

  const latestJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 6);

  return (
    <section className="bg-[#080810] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            Fresh Opportunities
          </p>

          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Latest &{" "}
            <span className="bg-linear-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Top Jobs
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Explore the latest job openings and find your next career
            opportunity.
          </p>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading latest jobs...
          </p>
        ) : error ? (
          <p className="py-10 text-center text-red-400">{error}</p>
        ) : latestJobs.length === 0 ? (
          <p className="py-10 text-center text-gray-400">No jobs available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job) => (
              <LatestJobCards key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestJobs;
