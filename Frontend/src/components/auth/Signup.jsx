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
import { setLoading } from "@/redux/authSlice";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { API_BASE_URL } from "@/utils/constant";

const Signup = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [showPassword, setShowPassword] = useState(false);

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "student",
    profilePhoto: null,
  });

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const changeFileHandler = (e) => {
    setInput({
      ...input,
      profilePhoto: e.target.files?.[0] || null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formdata = new FormData();

    formdata.append("fullname", input.fullname);
    formdata.append("email", input.email);
    formdata.append("phoneNumber", input.phoneNumber);
    formdata.append("password", input.password);
    formdata.append("role", input.role);

    if (input.profilePhoto) {
      formdata.append("profilePhoto", input.profilePhoto);
    }

    dispatch(setLoading(true));

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, formdata, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-xl border bg-white p-6 shadow-sm sm:p-8">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Create Your Account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Join Job Portal and find your dream opportunity
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>

              <Input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Enter your full name"
                required
                minLength={3}
                maxLength={50}
                onChange={changeEventHandler}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                onChange={changeEventHandler}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>

              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                minLength={10}
                onChange={changeEventHandler}
              />
            </div>

            {/* Password */}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  value={input.password}
                  onChange={changeEventHandler}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
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

            {/* Role */}
            <div className="space-y-3">
              <Label>Register as</Label>

              <RadioGroup
                value={input.role}
                onValueChange={(value) =>
                  setInput({
                    ...input,
                    role: value,
                  })
                }
                className="flex gap-6"
              >
                {/* Student */}
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="student" id="student" />

                  <Label
                    htmlFor="student"
                    className="cursor-pointer font-normal"
                  >
                    Student
                  </Label>
                </div>

                {/* Recruiter */}
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

            {/* Profile Photo */}
            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile Photo</Label>

              <Input
                id="profilePhoto"
                name="profilePhoto"
                type="file"
                accept="image/*"
                required
                onChange={changeFileHandler}
                className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
              />

              <p className="text-xs text-gray-500">
                Upload a JPG, JPEG or PNG image.
              </p>
            </div>

            {/* Submit */}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
