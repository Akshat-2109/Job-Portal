// Frontend/src/components/FilterCard.jsx

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const salaryOptions = ["All", "0-3 LPA", "3-6 LPA", "6-10 LPA", "10+ LPA"];

const FilterCard = ({ jobs = [], filters, onFilterChange }) => {
  const [roleSearch, setRoleSearch] = useState("");

  const locations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(jobs.map((job) => job.location?.trim()).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    return ["All", ...uniqueLocations];
  }, [jobs]);

  const roles = useMemo(() => {
    return [
      ...new Set(jobs.map((job) => job.title?.trim()).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const matchingRoles = useMemo(() => {
    if (!roleSearch.trim()) return [];

    return roles
      .filter((role) =>
        role.toLowerCase().includes(roleSearch.trim().toLowerCase()),
      )
      .slice(0, 8);
  }, [roles, roleSearch]);

  const selectedRole = filters.role === "All" ? "" : filters.role;

  const selectRole = (role) => {
    onFilterChange("role", role);
    setRoleSearch(role === "All" ? "" : role);
  };

  const clearFilters = () => {
    onFilterChange("location", "All");
    onFilterChange("role", "All");
    onFilterChange("salary", "All");
    setRoleSearch("");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#10101b] p-5 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <SlidersHorizontal size={18} className="text-purple-400" />
          Filters
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-purple-300 hover:text-purple-200"
        >
          Clear all
        </button>
      </div>

      {/* Location */}
      <section className="mb-7">
        <h3 className="mb-3 text-sm font-semibold">Location</h3>

        <select
          value={filters.location}
          onChange={(event) => onFilterChange("location", event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#181827] px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
        >
          {locations.map((location) => (
            <option key={location} value={location} className="bg-[#181827]">
              {location === "All" ? "All locations" : location}
            </option>
          ))}
        </select>
      </section>

      {/* Searchable job role */}
      <section className="mb-7">
        <h3 className="mb-3 text-sm font-semibold">Job Role</h3>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={roleSearch || selectedRole}
            onChange={(event) => {
              const value = event.target.value;
              setRoleSearch(value);
              onFilterChange("role", value.trim() ? value : "All");
            }}
            placeholder="Search job role..."
            className="w-full rounded-lg border border-white/10 bg-[#181827] py-2.5 pl-9 pr-9 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
          />

          {(roleSearch || selectedRole) && (
            <button
              type="button"
              aria-label="Clear role search"
              onClick={() => selectRole("All")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {roleSearch.trim() && (
          <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#181827]">
            {matchingRoles.length > 0 ? (
              matchingRoles.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => selectRole(role)}
                  className="block w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-purple-500/15 hover:text-white"
                >
                  {role}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-gray-400">
                No exact title found. Showing jobs matching your keyword.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => selectRole("All")}
          className={`mt-3 text-sm ${
            filters.role === "All"
              ? "font-medium text-purple-300"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Show all roles
        </button>
      </section>

      {/* Salary */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Salary</h3>

        <div className="space-y-3">
          {salaryOptions.map((salary) => (
            <label
              key={salary}
              className="flex cursor-pointer items-center gap-3 text-sm text-gray-300"
            >
              <input
                type="radio"
                name="salary-filter"
                value={salary}
                checked={filters.salary === salary}
                onChange={() => onFilterChange("salary", salary)}
                className="h-4 w-4 accent-purple-500"
              />

              {salary === "All" ? "Any salary" : salary}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FilterCard;
