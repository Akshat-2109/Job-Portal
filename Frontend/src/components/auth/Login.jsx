import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import Navbar from "../shared/Navbar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { API_BASE_URL } from "@/utils/constant";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.auth.loading);
  const [showPassword, setShowPassword] = useState(false);

  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const changeEventHandler = (event) => {
    const { name, value } = event.target;

    setInput((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    dispatch(setLoading(true));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        {
          email: input.email.trim(),
          password: input.password,
          role: input.role,
        },
        {
          withCredentials: true,
        },
      );

      const data = response.data;

      if (!data?.success) {
        toast.error(data?.message || "Login failed. Please try again.");
        return;
      }

      const loggedInUser = data.user;

      // Extra safety check in case the backend returns a different role.
      if (loggedInUser?.role !== input.role) {
        toast.error(
          `This account is registered as ${loggedInUser?.role || "another role"}. Please select the correct role.`,
        );
        return;
      }

      dispatch(setUser(loggedInUser));

      toast.success(data.message || "Login successful");
      navigate("/");
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400 && message === "Invalid role for this user") {
        toast.error(
          "The selected role does not match your account. Please select Student or Recruiter correctly.",
        );
      } else if (status === 400 && message === "Invalid credentials") {
        toast.error("Incorrect email or password.");
      } else {
        toast.error(message || "Unable to log in. Please try again.");
      }

      console.error("Login error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-md rounded-xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Login to your Job Portal account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={input.email}
                required
                onChange={changeEventHandler}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={input.password}
                  required
                  minLength={6}
                  onChange={changeEventHandler}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-3">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="space-y-3">
              <Label>Login as</Label>

              <RadioGroup
                value={input.role}
                onValueChange={(value) =>
                  setInput((previous) => ({
                    ...previous,
                    role: value,
                  }))
                }
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label
                    htmlFor="student"
                    className="cursor-pointer font-normal"
                  >
                    Student
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <RadioGroupItem value="recruiter" id="recruiter" />
                  <Label
                    htmlFor="recruiter"
                    className="cursor-pointer font-normal"
                  >
                    Recruiter
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
