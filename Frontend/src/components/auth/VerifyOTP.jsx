import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "../shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/utils/constant";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!email) {
      toast.error("Email missing. Please request a new OTP.");
      navigate("/forgot-password");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify-otp`,
        {
          email,
          otp,
        },
        { withCredentials: true },
      );

      if (response.data?.success && response.data?.resetToken) {
        toast.success("OTP verified successfully.");

        navigate("/reset-password", {
          state: {
            email,
            resetToken: response.data.resetToken,
          },
        });
      } else {
        toast.error(response.data?.message || "OTP verification failed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-md rounded-xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit OTP sent to your registered email.
            </p>

            {email && (
              <p className="mt-2 break-all text-sm font-medium text-gray-700">
                {email}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otp">6-digit OTP</Label>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Wrong email?{" "}
              <Link
                to="/forgot-password"
                className="font-semibold text-blue-600 hover:underline"
              >
                Try again
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;
