// Frontend/src/components/CategoryCarousel.jsx

import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Code2,
  Database,
  BarChart3,
  ShieldCheck,
  Cloud,
  Smartphone,
  Palette,
  ChartNoAxesCombined,
  Server,
  ArrowUpRight,
} from "lucide-react";

const categories = [
  {
    title: "Frontend Developer",
    description: "Web interfaces and React",
    icon: Code2,
  },
  {
    title: "Software Developer",
    description: "Software and applications",
    icon: BriefcaseBusiness,
  },
  {
    title: "Data Science",
    description: "Data science and ML roles",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Data Analyst",
    description: "Insights and analytics",
    icon: BarChart3,
  },
  {
    title: "Cyber Security",
    description: "Security and threat analysis",
    icon: ShieldCheck,
  },
  {
    title: "Database Administrator",
    description: "Databases and SQL",
    icon: Database,
  },
  {
    title: "Cloud Engineer",
    description: "Cloud infrastructure",
    icon: Cloud,
  },
  {
    title: "App Developer",
    description: "Mobile applications",
    icon: Smartphone,
  },
  {
    title: "UI/UX Designer",
    description: "Design and user experience",
    icon: Palette,
  },
  {
    title: "Business Analyst",
    description: "Business and data analysis",
    icon: Server,
  },
];

const CategoryCarousel = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/jobs?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="bg-[#080810] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
              Choose your field
            </p>

            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Browse by Category
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Select a field to explore relevant job opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-purple-200"
          >
            View all jobs
            <ArrowUpRight size={17} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map(({ title, description, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => handleCategoryClick(title)}
              className="group rounded-2xl border border-white/10 bg-[#10101b] p-5 text-left transition hover:-translate-y-1 hover:border-purple-400/40 hover:bg-purple-500/6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300 transition group-hover:bg-purple-500/25">
                  <Icon size={23} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-gray-600 transition group-hover:text-purple-300"
                />
              </div>

              <h3 className="text-sm font-bold">{title}</h3>

              <p className="mt-2 text-xs leading-5 text-gray-400">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
