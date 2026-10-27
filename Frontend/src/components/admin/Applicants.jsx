import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import { getApplicants } from "../../redux/applicationsSlice.js";

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { job, loading, error } = useSelector((state) => state.applications);

  useEffect(() => {
    if (id) {
      dispatch(getApplicants(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/admin/jobs")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-purple-700"
        >
          <ArrowLeft size={17} />
          Back to Manage Jobs
        </button>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <LoaderCircle className="animate-spin text-purple-600" size={36} />
            <p className="text-sm text-slate-500">Loading applicants...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">
              Unable to load applicants
            </p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(getApplicants(id))}
              className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-purple-700">
                    Recruiter Dashboard
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {job?.title || "Job Applicants"}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    {job?.company?.name && (
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        {job.company.name}
                      </span>
                    )}
                    {job?.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-purple-50 px-6 py-4">
                  <p className="text-sm text-purple-700">Total Applicants</p>
                  <p className="mt-1 text-3xl font-bold text-purple-900">
                    {job?.applications?.length || 0}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <ApplicantsTable />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Applicants;
