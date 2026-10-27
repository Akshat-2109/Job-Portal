import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Loader2, Building2, Upload, Pencil, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import useGetCompanyById from "../hooks/useGetCompanyById";
import { updateCompanyInList, setCompany } from "../../redux/companySlice";
import { COMPANY_UPDATE_API_END_POINT } from "../../utils/constant";

const CompanySetup = () => {
  useGetCompanyById();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isViewMode = searchParams.get("mode") === "view";

  const { company, loading, error } = useSelector((state) => state.company);

  const [updating, setUpdating] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    if (!company) return;

    setInput({
      name: company.name || "",
      description: company.description || "",
      website: company.website || "",
      location: company.location || "",
    });

    setPreview(company.logo || "");
    setFile(null);
  }, [company]);

  const changeEventHandler = (event) => {
    const { name, value } = event.target;

    setInput((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const fileChangeHandler = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const normalizeWebsite = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "";

    const normalizedValue = /^https?:\/\//i.test(trimmedValue)
      ? trimmedValue
      : `https://${trimmedValue}`;

    try {
      const parsedUrl = new URL(normalizedValue);

      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname.includes(".")
      ) {
        return null;
      }

      return parsedUrl.href;
    } catch {
      return null;
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (isViewMode) return;

    if (!company?._id) {
      toast.error("Company details are not available.");
      return;
    }

    if (!input.name.trim()) {
      toast.error("Company name is required.");
      return;
    }

    const website = normalizeWebsite(input.website);

    if (website === null) {
      toast.error("Please enter a valid website, for example www.example.com.");
      return;
    }

    try {
      setUpdating(true);

      const formData = new FormData();

      formData.append("name", input.name.trim());
      formData.append("description", input.description.trim());
      formData.append("website", website);
      formData.append("location", input.location.trim());

      if (file) {
        formData.append("file", file);
      }

      const response = await axios.put(
        `${COMPANY_UPDATE_API_END_POINT}/${company._id}`,
        formData,
        { withCredentials: true },
      );

      if (!response.data.success) {
        toast.error(response.data.message || "Company update failed.");
        return;
      }

      if (response.data.company) {
        dispatch(setCompany(response.data.company));
        dispatch(updateCompanyInList(response.data.company));
      }

      toast.success("Company details saved successfully!");
      navigate("/admin/companies");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save company details. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const openEditMode = () => {
    navigate(`/admin/companies/${company._id}?mode=edit`);
  };

  const goBack = () => {
    navigate("/admin/companies");
  };

  if (loading && !company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-center text-red-600">{error}</p>
        <button
          type="button"
          onClick={goBack}
          className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading company details...</p>
      </div>
    );
  }

  const fieldClass = `w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ${
    isViewMode
      ? "cursor-default bg-slate-50 text-slate-600"
      : "bg-white focus:border-violet-500"
  }`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to Companies
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Building2 size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isViewMode ? "Company Details" : "Edit Company"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isViewMode
                ? "View your registered company information."
                : "Update your company information below."}
            </p>
          </div>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label
              htmlFor="company-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Company Name *
            </label>
            <input
              id="company-name"
              name="name"
              value={input.name}
              onChange={changeEventHandler}
              readOnly={isViewMode}
              required
              className={fieldClass}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label
              htmlFor="company-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="company-description"
              name="description"
              value={input.description}
              onChange={changeEventHandler}
              readOnly={isViewMode}
              rows={4}
              className={fieldClass}
              placeholder="Describe your company"
            />
          </div>

          <div>
            <label
              htmlFor="company-website"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Website
            </label>
            <input
              id="company-website"
              type="text"
              name="website"
              value={input.website}
              onChange={changeEventHandler}
              readOnly={isViewMode}
              className={fieldClass}
              placeholder="www.example.com"
            />
            {isViewMode && input.website && (
              <a
                href={input.website}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-violet-600 hover:underline"
              >
                Visit company website
              </a>
            )}
            {!isViewMode && (
              <p className="mt-1 text-xs text-slate-500">
                You can enter www.example.com or https://example.com.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="company-location"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id="company-location"
              name="location"
              value={input.location}
              onChange={changeEventHandler}
              readOnly={isViewMode}
              className={fieldClass}
              placeholder="Enter company location"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Company Logo
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {preview ? (
                  <img
                    src={preview}
                    alt="Company logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="text-slate-400" size={30} />
                )}
              </div>

              {!isViewMode && (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">
                  <Upload size={17} />
                  Choose Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={fileChangeHandler}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {isViewMode ? (
            <button
              type="button"
              onClick={openEditMode}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              <Pencil size={18} />
              Edit Company
            </button>
          ) : (
            <button
              type="submit"
              disabled={updating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updating && <Loader2 size={18} className="animate-spin" />}
              {updating ? "Saving Changes..." : "Save Changes"}
            </button>
          )}

          {updating && (
            <p className="text-center text-sm text-slate-500">
              Please wait while your company details are saved.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;
