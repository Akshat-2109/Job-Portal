import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { removeCompany } from "../../redux/companySlice";
import { COMPANY_API_END_POINT } from "../../utils/constant";

const CompaniesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    companies = [],
    loading,
    error,
  } = useSelector((state) => state.company);

  const filteredCompanies = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return companies.filter((company) =>
      (company.name || "").toLowerCase().includes(search),
    );
  }, [companies, searchTerm]);

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

  const toggleMenu = (event, companyId) => {
    if (openMenuId === companyId) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 210;
    const menuHeight = 150;

    const top =
      rect.bottom + menuHeight + 8 > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - 4)
        : rect.bottom + 4;

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );

    setMenuPosition({ top, left });
    setOpenMenuId(companyId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const handleEditCompany = (companyId) => {
    closeMenu();
    navigate(`/admin/companies/${companyId}?mode=edit`);
  };

  const handleViewCompany = (companyId) => {
    closeMenu();
    navigate(`/admin/companies/${companyId}?mode=view`);
  };

  const handleDeleteCompany = async (company) => {
    closeMenu();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(company._id);

      const response = await axios.delete(
        `${COMPANY_API_END_POINT}/delete/${company._id}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        dispatch(removeCompany(company._id));
        toast.success("Company deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete company");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete company");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Registered Companies
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search and manage your companies.
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
            placeholder="Search company name..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="mt-3 text-sm text-slate-500">Loading companies...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="font-medium text-red-600">{error}</p>
          <p className="mt-2 text-sm text-slate-500">
            Please refresh the page and try again.
          </p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Building2 size={26} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            {searchTerm
              ? "No matching companies"
              : "No companies registered yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {searchTerm
              ? "Try searching with another company name."
              : "Register your first company to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Date Registered</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((company) => (
                  <tr
                    key={company._id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={`${company.name} logo`}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Building2 size={21} className="text-violet-600" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {company.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {company.location || "Location not added"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-slate-400"
                        />
                        {formatDate(company.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        aria-label={`Actions for ${company.name}`}
                        aria-expanded={openMenuId === company._id}
                        onClick={(event) => toggleMenu(event, company._id)}
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
              {filteredCompanies.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {companies.length}
            </span>{" "}
            companies
          </div>
        </>
      )}

      {openMenuId && menuPosition && (
        <>
          <button
            type="button"
            aria-label="Close actions menu"
            className="fixed inset-0 z-99 cursor-default"
            onClick={closeMenu}
          />

          <div
            className="fixed z-100 w-52.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              onClick={() => handleEditCompany(openMenuId)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-violet-50"
            >
              <Pencil size={16} />
              Edit Company
            </button>

            <button
              type="button"
              onClick={() => handleViewCompany(openMenuId)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-violet-50"
            >
              <ExternalLink size={16} />
              View / Setup
            </button>

            <button
              type="button"
              disabled={deletingId === openMenuId}
              onClick={() => {
                const company = companies.find(
                  (item) => item._id === openMenuId,
                );

                if (company) handleDeleteCompany(company);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deletingId === openMenuId ? "Deleting..." : "Delete Company"}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default CompaniesTable;
