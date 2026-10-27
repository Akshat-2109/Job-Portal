import { BriefcaseBusiness, Plus } from "lucide-react";
import Navbar from "../shared/Navbar";
import AdminJobTable from "./AdminJobTable";
import useGetAllAdminJobs from "../hooks/useGetAllAdminJobs";
import { useNavigate } from "react-router-dom";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-violet-600">
              <BriefcaseBusiness size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Recruiter Dashboard
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Your Jobs
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage jobs posted by your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/jobs/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus size={18} />
            New Job
          </button>
        </div>

        <AdminJobTable />
      </main>
    </div>
  );
};

export default AdminJobs;
