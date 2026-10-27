import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Phone, FileText, Check, X, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatus } from "../../redux/applicationsSlice.js";

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ApplicantsTable = () => {
  const dispatch = useDispatch();

  const { applicants = [], updatingId } = useSelector(
    (state) => state.applications,
  );

  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplicants = applicants.filter((application) => {
    const applicant = application.applicant;

    const searchValue = [
      applicant?.fullname,
      applicant?.email,
      applicant?.phoneNumber,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchValue.includes(searchTerm.toLowerCase());
  });

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const result = await dispatch(
        updateApplicationStatus({ applicationId, status }),
      ).unwrap();

      toast.success(result.message || `Application ${status} successfully.`);
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Unable to update application.",
      );
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Applicants</h2>
          <p className="text-sm text-slate-500">
            {applicants.length} application(s) received
          </p>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search name, email or contact..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-purple-500 sm:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-250 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Full Name</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Contact</th>
              <th className="px-5 py-4 font-semibold">Resume</th>
              <th className="px-5 py-4 font-semibold">Date Applied</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredApplicants.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  {applicants.length === 0
                    ? "No applicants have applied for this job yet."
                    : "No applicants match your search."}
                </td>
              </tr>
            ) : (
              filteredApplicants.map((application) => {
                const applicant = application.applicant;
                const status = application.status || "pending";
                const isUpdating = updatingId === application._id;
                const resumeUrl = applicant?.profile?.resume;

                return (
                  <tr
                    key={application._id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {applicant?.fullname || "Name unavailable"}
                    </td>

                    <td className="px-5 py-4">
                      {applicant?.email ? (
                        <a
                          href={`mailto:${applicant.email}`}
                          className="inline-flex items-center gap-2 text-purple-700 hover:underline"
                        >
                          <Mail size={15} />
                          {applicant.email}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {applicant?.phoneNumber ? (
                        <span className="inline-flex items-center gap-2">
                          <Phone size={15} />
                          {applicant.phoneNumber}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-purple-700 hover:underline"
                        >
                          <FileText size={16} />
                          {applicant?.profile?.resumeOriginalName ||
                            "View Resume"}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not Applicable</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(application.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusUpdate(application._id, "accepted")
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={14} />
                            )}
                            Accept
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusUpdate(application._id, "rejected")
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Decision recorded
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicantsTable;
