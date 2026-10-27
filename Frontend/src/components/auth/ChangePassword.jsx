import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff, ArrowLeft, LockKeyhole } from "lucide-react";
import { API_BASE_URL } from "@/utils/constant";

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to change your password.");
      navigate("/login");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Password changed successfully!",
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        navigate("/");
      } else {
        toast.error(response.data.message || "Unable to change password.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  const renderPasswordField = (label, value, setValue, field, placeholder) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPasswords[field] ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          autoComplete="new-password"
          required
        />

        <button
          type="button"
          onClick={() => togglePassword(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600"
          aria-label={showPasswords[field] ? "Hide password" : "Show password"}
        >
          {showPasswords[field] ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-violet-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Enter your current password and choose a new, secure password for
            your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {renderPasswordField(
              "Current Password",
              currentPassword,
              setCurrentPassword,
              "current",
              "Enter current password",
            )}

            {renderPasswordField(
              "New Password",
              newPassword,
              setNewPassword,
              "new",
              "Enter new password (minimum 8 characters)",
            )}

            {renderPasswordField(
              "Confirm New Password",
              confirmPassword,
              setConfirmPassword,
              "confirm",
              "Re-enter new password",
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              {loading ? "Updating Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
