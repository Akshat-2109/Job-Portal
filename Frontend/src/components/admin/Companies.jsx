import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Building2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import CompaniesTable from "./CompaniesTable";
import {
  setCompanies,
  setCompanyLoading,
  setCompanyError,
} from "../../redux/companySlice";
import { COMPANY_API_END_POINT } from "../../utils/constant";

const Companies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      dispatch(setCompanyLoading(true));
      dispatch(setCompanyError(null));

      try {
        const response = await axios.get(`${COMPANY_API_END_POINT}/get`, {
          withCredentials: true,
        });

        if (response.data.success) {
          dispatch(setCompanies(response.data.companies || []));
        }
      } catch (error) {
        // Backend returns 404 when the recruiter has no companies.
        if (error.response?.status === 404) {
          dispatch(setCompanies([]));
        } else {
          dispatch(
            setCompanyError(
              error.response?.data?.message || "Unable to fetch companies.",
            ),
          );
        }
      } finally {
        dispatch(setCompanyLoading(false));
      }
    };

    fetchCompanies();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-violet-600">
              <Building2 size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Recruiter Dashboard
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Your Companies
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your registered companies and their profiles.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/companies/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus size={18} />
            Register New Company
          </button>
        </div>

        <CompaniesTable />
      </main>
    </div>
  );
};

export default Companies;
