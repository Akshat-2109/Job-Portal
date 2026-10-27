import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { ArrowLeft, Building2, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import { addCompany, setCompanyError } from "../../redux/companySlice";
import { COMPANY_API_END_POINT } from "../../utils/constant";

const CompanyCreate = () => {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = companyName.trim();

    if (!trimmedName) {
      toast.error("Please enter a company name.");
      return;
    }

    setLoading(true);
    dispatch(setCompanyError(null));

    try {
      const response = await axios.post(
        `${COMPANY_API_END_POINT}/register`,
        { companyName: trimmedName },
        { withCredentials: true },
      );

      if (response.data.success && response.data.company) {
        dispatch(addCompany(response.data.company));
        toast.success(
          response.data.message || "Company registered successfully!",
        );

        navigate(`/admin/companies/${response.data.company._id}`, {
          replace: true,
        });
      } else {
        toast.error(response.data.message || "Could not register company.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to register company. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/admin/companies")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to Companies
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={25} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Register a Company
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add your company to the recruiter dashboard. You can complete its
              profile in the next step.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Company Name <span className="text-red-500">*</span>
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="e.g. Acme Technologies"
                maxLength={100}
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <p className="mt-2 text-xs text-slate-500">
                Use the official name of your company.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/companies")}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <LoaderCircle size={17} className="animate-spin" />}
                {loading ? "Registering..." : "Register Company"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CompanyCreate;
