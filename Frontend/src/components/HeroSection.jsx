// Frontend/src/components/HeroSection.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Zap,
  ShieldCheck,
  Users,
  Star,
  Rocket,
} from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }

    if (location) {
      params.set("location", location);
    }

    const queryString = params.toString();

    navigate(queryString ? `/jobs?${queryString}` : "/jobs");
  };

  return (
    <section className="relative overflow-hidden bg-[#080810] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
            <Zap size={16} />
            Your next opportunity starts here
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Dream Job.
            <span className="mt-2 block bg-linear-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Build Your Future.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Search opportunities, discover companies, and find a role that
            matches your skills and career goals.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/4 p-3 text-left shadow-2xl shadow-purple-950/20 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-center"
          >
            <div className="flex min-w-0 items-center gap-3 px-3">
              <Search className="shrink-0 text-purple-300" size={20} />

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Job title, skills, or company"
                aria-label="Search job title, skills, or company"
                className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-3 border-t border-white/10 px-3 sm:border-l sm:border-t-0">
              <MapPin className="shrink-0 text-purple-300" size={19} />

              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                aria-label="Choose job location"
                className="w-full bg-[#10101b] py-3 text-sm text-white outline-none"
              >
                <option value="">All locations</option>
                <option value="Remote">Remote</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500"
            >
              <Search size={17} />
              Search Jobs
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            Try searching for “Data Analyst”, “React”, or “Software Developer”.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              icon: BriefcaseBusiness,
              title: "Discover Jobs",
              description: "Explore opportunities",
            },
            {
              icon: ShieldCheck,
              title: "Trusted Profiles",
              description: "Explore company listings",
            },
            {
              icon: Users,
              title: "Career Growth",
              description: "Find your next role",
            },
            {
              icon: Rocket,
              title: "Easy Discovery",
              description: "Search by your skills",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/3 p-4 text-center"
            >
              <Icon className="mx-auto mb-3 text-purple-300" size={23} />
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span>Discover roles that match your skills and interests</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
