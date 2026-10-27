import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  BriefcaseBusiness,
  CalendarDays,
  MoreHorizontal,
  Search,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminJobTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const navigate = useNavigate();

  const {
    allAdminJobs = [],
    adminJobsLoading,
    adminJobsError,
  } = useSelector((state) => state.jobs);

  // Hide jobs whose company no longer exists.
  const activeJobs = useMemo(() => {
    return allAdminJobs.filter(
      (job) =>
        job.company && typeof job.company === "object" && job.company._id,
    );
  }, [allAdminJobs]);

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return activeJobs.filter((job) => {
      const companyName = job.company?.name || "";
      const role = job.title || "";

      return (
        companyName.toLowerCase().includes(search) ||
        role.toLowerCase().includes(search)
      );
    });
  }, [activeJobs, searchTerm]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const toggleMenu = (event, jobId) => {
    if (openMenuId === jobId) {
      closeMenu();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 76;

    const top =
      rect.bottom + menuHeight + 8 > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - 4)
        : rect.bottom + 4;

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );

    setMenuPosition({ top, left });
    setOpenMenuId(jobId);
  };

  return (
    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Posted Jobs</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search and manage your job postings.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              closeMenu();
            }}
            placeholder="Search company or role..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {adminJobsLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="mt-3 text-sm text-slate-500">Loading jobs...</p>
          </div>
        </div>
      ) : adminJobsError ? (
        <div className="p-8 text-center">
          <p className="font-medium text-red-600">{adminJobsError}</p>
          <p className="mt-2 text-sm text-slate-500">
            Please refresh the page and try again.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <BriefcaseBusiness size={26} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {searchTerm ? "No matching jobs" : "No active jobs available"}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {searchTerm
              ? "Try another company name or role."
              : "Jobs linked to deleted companies are not displayed."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {job.company.name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {job.title || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-slate-400"
                        />
                        {formatDate(job.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        aria-label={`Actions for ${job.title || "job"}`}
                        aria-expanded={openMenuId === job._id}
                        onClick={(event) => toggleMenu(event, job._id)}
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                      >
                        <MoreHorizontal size={21} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredJobs.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {activeJobs.length}
            </span>{" "}
            active jobs
          </div>
        </>
      )}

      {openMenuId && menuPosition && (
        <>
          <button
            type="button"
            aria-label="Close actions menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={closeMenu}
          />

          <div
            className="fixed z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const jobId = openMenuId;
                closeMenu();
                navigate(`/admin/jobs/${jobId}/applicants`);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
            >
              <Eye size={17} />
              <span>Applicants</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default AdminJobTable;
