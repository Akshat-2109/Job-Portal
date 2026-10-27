import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronDown,
  Building2,
  KeyRound,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { clearUser } from "@/redux/authSlice";
import { API_BASE_URL } from "@/utils/constant";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const isRecruiter = user?.role === "recruiter";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isRecruiter
        ? isActive
          ? "text-violet-600"
          : "text-slate-600 hover:text-violet-600"
        : isActive
          ? "text-purple-400"
          : "text-gray-300 hover:text-purple-400"
    }`;

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/logout`, {
        withCredentials: true,
      });

      dispatch(clearUser());
      closeMenus();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(
        error.response?.data?.message || "Unable to logout. Please try again.",
      );
    }
  };

  const renderNavLinks = (mobile = false) => {
    const linkClass = mobile ? `${navLinkClass} py-1` : navLinkClass;

    if (isRecruiter) {
      return (
        <>
          <NavLink
            to="/admin/companies"
            className={linkClass}
            onClick={mobile ? closeMenus : undefined}
          >
            Companies
          </NavLink>

          <NavLink
            to="/admin/jobs"
            className={linkClass}
            onClick={mobile ? closeMenus : undefined}
          >
            Jobs
          </NavLink>
        </>
      );
    }

    return (
      <>
        <NavLink
          to="/"
          end
          className={linkClass}
          onClick={mobile ? closeMenus : undefined}
        >
          Home
        </NavLink>

        <NavLink
          to="/jobs"
          className={linkClass}
          onClick={mobile ? closeMenus : undefined}
        >
          Jobs
        </NavLink>

        <NavLink
          to="/browse"
          className={linkClass}
          onClick={mobile ? closeMenus : undefined}
        >
          Browse
        </NavLink>
      </>
    );
  };

  const headerClass = isRecruiter
    ? "sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl"
    : "sticky top-0 z-50 border-b border-white/10 bg-[#080810]/90 text-white shadow-lg shadow-black/10 backdrop-blur-xl";

  const logoIconClass = isRecruiter
    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-200"
    : "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-900/30";

  const logoTextClass = isRecruiter
    ? "text-xl font-extrabold tracking-tight sm:text-2xl"
    : "text-2xl font-extrabold tracking-tight";

  const accountButtonClass = isRecruiter
    ? "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
    : "flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-2 transition hover:border-purple-400/50 hover:bg-purple-500/20";

  const dropdownClass = isRecruiter
    ? "absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
    : "absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#11111b] p-2 shadow-2xl shadow-black/40";

  const dropdownTextClass = isRecruiter ? "text-slate-900" : "text-white";

  const dropdownEmailClass = isRecruiter
    ? "mt-1 truncate text-xs text-slate-500"
    : "mt-1 truncate text-xs text-gray-400";

  const mobileMenuClass = isRecruiter
    ? "border-t border-slate-200 bg-white px-4 py-5 md:hidden"
    : "border-t border-white/10 bg-[#0b0b16] px-4 py-5 md:hidden";

  return (
    <header className={headerClass}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to={isRecruiter ? "/admin/companies" : "/"}
          className="flex shrink-0 items-center gap-2"
          onClick={closeMenus}
        >
          <div className={logoIconClass}>
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>

          <span className={logoTextClass}>
            <span className={isRecruiter ? "text-slate-900" : "text-white"}>
              Job
            </span>
            {isRecruiter ? (
              <span className="text-violet-600">Portal</span>
            ) : (
              <span className="bg-linear-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Portal
              </span>
            )}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {renderNavLinks()}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-purple-400/60 hover:bg-purple-500/10 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-full bg-linear-to-r from-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/25 transition hover:from-purple-500 hover:to-fuchsia-500"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className={accountButtonClass}
                aria-expanded={profileOpen}
                aria-label="Open account menu"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isRecruiter
                      ? "bg-violet-100"
                      : "bg-linear-to-br from-purple-600 to-fuchsia-600"
                  }`}
                >
                  {isRecruiter ? (
                    <Building2 className="h-4 w-4 text-violet-700" />
                  ) : (
                    <UserRound className="h-4 w-4 text-white" />
                  )}
                </span>

                <span
                  className={`max-w-32 truncate text-sm font-medium ${
                    isRecruiter ? "text-slate-800" : "text-gray-100"
                  }`}
                >
                  {user.fullname || user.name || "My Account"}
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isRecruiter ? "text-slate-400" : "text-gray-400"
                  } ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileOpen && (
                <div className={dropdownClass}>
                  <div
                    className={`border-b px-3 py-3 ${
                      isRecruiter ? "border-slate-100" : "border-white/10"
                    }`}
                  >
                    <p
                      className={`truncate text-sm font-semibold ${dropdownTextClass}`}
                    >
                      {user.fullname || user.name || "User"}
                    </p>
                    <p className={dropdownEmailClass}>{user.email || ""}</p>
                  </div>

                  {!isRecruiter && (
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      <UserRound className="h-4 w-4" />
                      View Profile
                    </Link>
                  )}

                  <Link
                    to="/change-password"
                    onClick={closeMenus}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isRecruiter
                        ? "mt-2 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                        : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                    }`}
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                      isRecruiter
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition md:hidden ${
            isRecruiter
              ? "border-slate-200 text-slate-700 hover:bg-slate-50"
              : "border-white/10 text-gray-200 hover:bg-white/10"
          }`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className={mobileMenuClass}>
          <div className="flex flex-col gap-5">
            {renderNavLinks(true)}

            {!user ? (
              <div
                className={`flex gap-3 border-t pt-4 ${
                  isRecruiter ? "border-slate-100" : "border-white/10"
                }`}
              >
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-gray-200 hover:bg-white/5"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenus}
                  className="flex-1 rounded-full bg-linear-to-r from-purple-600 to-fuchsia-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div
                className={`border-t pt-4 ${
                  isRecruiter ? "border-slate-100" : "border-white/10"
                }`}
              >
                <p
                  className={`mb-3 truncate text-sm font-semibold ${
                    isRecruiter ? "text-slate-900" : "text-white"
                  }`}
                >
                  {user.fullname || user.name || "My Account"}
                </p>

                {!isRecruiter && (
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-purple-500/10 hover:text-purple-300"
                  >
                    <UserRound className="h-4 w-4" />
                    View Profile
                  </Link>
                )}

                <Link
                  to="/change-password"
                  onClick={closeMenus}
                  className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isRecruiter
                      ? "text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                      : "text-gray-300 hover:bg-purple-500/10 hover:text-purple-300"
                  }`}
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    isRecruiter
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-rose-300 hover:bg-rose-500/10"
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
