import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { APPLICATION_API_END_POINT } from "@/utils/constant";

const AppliedJobTable = () => {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAppliedJobs = async () => {
      try {
        const response = await axios.get(`${APPLICATION_API_END_POINT}/get`, {
          withCredentials: true,
        });

        if (!isMounted) return;

        const fetchedApplications = Array.isArray(response.data.application)
          ? response.data.application
          : [];

        // Ignore applications whose job or company no longer exists.
        const activeApplications = fetchedApplications.filter(
          (application) =>
            application.job &&
            application.job.company &&
            typeof application.job.company === "object" &&
            application.job.company._id,
        );

        setApplications(activeApplications);
      } catch (error) {
        if (!isMounted) return;

        if (error.response?.status !== 404) {
          console.error("Error fetching applied jobs:", error);
        }

        setApplications([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAppliedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const getCompanyName = (application) => application.job?.company?.name || "";

  const getJobTitle = (application) =>
    application.job?.title || "Job no longer available";

  const getStatus = (application) =>
    (application.status || "pending").toLowerCase();

  const formatStatus = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const statusStyle = (value) => {
    const normalized = value.toLowerCase();

    if (normalized === "accepted" || normalized === "shortlisted") {
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    }

    if (normalized === "rejected") {
      return "border-red-400/20 bg-red-500/10 text-red-300";
    }

    return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  };

  const filteredApplications = useMemo(() => {
    return applications
      .filter((application) => {
        const searchText =
          `${getCompanyName(application)} ${getJobTitle(application)}`.toLowerCase();

        const searchMatch = searchText.includes(search.trim().toLowerCase());

        const applicationStatus = getStatus(application);

        const statusMatch =
          status === "All" || applicationStatus === status.toLowerCase();

        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [applications, search, status, sortOrder]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4 text-white">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or job role..."
            className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-purple-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#151522] px-3 py-2.5 text-sm outline-none focus:border-purple-400"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Shortlisted">Shortlisted</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#151522] px-3 py-2.5 text-sm outline-none focus:border-purple-400"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400">Company</TableHead>
              <TableHead className="text-gray-400">Job Role</TableHead>
              <TableHead className="text-gray-400">Date Applied</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="border-white/10">
                <TableCell
                  colSpan={4}
                  className="h-28 text-center text-gray-400"
                >
                  Loading your applications...
                </TableCell>
              </TableRow>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const applicationStatus = getStatus(application);

                return (
                  <TableRow
                    key={application._id}
                    className="border-white/10 hover:bg-white/3"
                  >
                    <TableCell className="font-medium text-white">
                      {getCompanyName(application)}
                    </TableCell>

                    <TableCell className="text-gray-300">
                      {getJobTitle(application)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-gray-400">
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleDateString(
                            "en-IN",
                          )
                        : "Not available"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs ${statusStyle(applicationStatus)}`}
                      >
                        {formatStatus(applicationStatus)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="h-28 text-center text-gray-400"
                >
                  {applications.length === 0
                    ? "No active job applications found."
                    : "No matching applications found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-gray-500">
        Showing {filteredApplications.length} of {applications.length} active
        applications
      </div>
    </div>
  );
};

export default AppliedJobTable;
