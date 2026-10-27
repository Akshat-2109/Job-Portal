// Frontend/src/utils/jobFilters.js

export const getCompanyName = (job) => {
  if (job?.company && typeof job.company === "object") {
    return job.company.name || "";
  }

  return job?.company || "";
};

const getSearchableText = (value) => {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).join(" ");
  }

  return String(value ?? "");
};

export const matchesJobSearch = (job, query) => {
  if (!query?.trim()) return true;

  const companyName = getCompanyName(job);

  const searchableText = [
    job?.title,
    companyName,
    job?.location,
    job?.jobType,
    job?.description,
    job?.requirements,
    job?.experience,
  ]
    .map(getSearchableText)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query.trim().toLowerCase());
};

const categoryKeywords = {
  "Frontend Developer": [
    "frontend",
    "front-end",
    "react developer",
    "web developer",
    "ui developer",
  ],
  "Software Developer": [
    "software developer",
    "software engineer",
    "full stack",
    "fullstack",
    "backend developer",
    "back-end developer",
  ],
  "Data Science": [
    "data science",
    "data scientist",
    "machine learning",
    "machine-learning",
    " ml ",
    "artificial intelligence",
    " ai ",
  ],
  "Data Analyst": [
    "data analyst",
    "business intelligence",
    "bi analyst",
    "reporting analyst",
    "data analytics",
  ],
  "Cyber Security": [
    "cyber security",
    "cybersecurity",
    "security analyst",
    "penetration tester",
    "soc analyst",
    "information security",
  ],
  "Database Administrator": [
    "database administrator",
    "database admin",
    "dba",
    "database engineer",
  ],
  "Cloud Engineer": [
    "cloud engineer",
    "cloud computing",
    "aws",
    "azure",
    "google cloud",
    "devops engineer",
  ],
  "App Developer": [
    "app developer",
    "mobile developer",
    "mobile app",
    "android developer",
    "ios developer",
  ],
  "UI/UX Designer": [
    "ui/ux",
    "ui ux",
    "ux designer",
    "ui designer",
    "product designer",
  ],
  "Business Analyst": ["business analyst", "business analysis"],
};

export const matchesJobCategory = (job, category) => {
  if (!category?.trim()) return true;

  const normalizedCategory = category.trim().toLowerCase();

  const searchableText = [
    job?.title,
    job?.description,
    job?.requirements,
    job?.jobType,
  ]
    .map(getSearchableText)
    .join(" ")
    .toLowerCase();

  const matchingCategory = Object.keys(categoryKeywords).find(
    (item) => item.toLowerCase() === normalizedCategory,
  );

  if (matchingCategory) {
    return categoryKeywords[matchingCategory].some((keyword) =>
      searchableText.includes(keyword),
    );
  }

  return searchableText.includes(normalizedCategory);
};

// Converts values such as 600000, "600000", "6 LPA"
// and "6-10 LPA" into an LPA range.
export const parseSalaryRange = (salary) => {
  if (salary === null || salary === undefined || salary === "") {
    return null;
  }

  const originalValue = String(salary).toLowerCase();
  const hasLpaUnit = /lpa|lakhs?|lacs?/i.test(originalValue);

  const cleanedValue = originalValue.replace(/,/g, "");
  const numbers = cleanedValue.match(/\d+(?:\.\d+)?/g);

  if (!numbers?.length) return null;

  let values = numbers.map(Number);

  // Values such as 600000 represent rupees, not LPA.
  if (!hasLpaUnit) {
    values = values.map((value) => (value >= 10000 ? value / 100000 : value));
  }

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  return {
    min: minimum,
    max: maximum,
  };
};

export const formatSalary = (salary) => {
  const range = parseSalaryRange(salary);

  if (!range) {
    return "Salary not specified";
  }

  const formatNumber = (value) =>
    Number.isInteger(value)
      ? String(value)
      : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

  if (range.min === range.max) {
    return `${formatNumber(range.min)} LPA`;
  }

  return `${formatNumber(range.min)}–${formatNumber(range.max)} LPA`;
};

export const matchesSalaryFilter = (salary, filter) => {
  if (!filter || filter === "All") return true;

  const range = parseSalaryRange(salary);

  // Keep jobs with missing salary visible instead of silently hiding them.
  if (!range) return true;

  let filterMin;
  let filterMax;

  switch (filter) {
    case "0-3 LPA":
      filterMin = 0;
      filterMax = 3;
      break;

    case "3-6 LPA":
      filterMin = 3;
      filterMax = 6;
      break;

    case "6-10 LPA":
      filterMin = 6;
      filterMax = 10;
      break;

    case "10+ LPA":
      filterMin = 10;
      filterMax = Infinity;
      break;

    default:
      return true;
  }

  // A salary range matches when it overlaps the selected range.
  return range.max >= filterMin && range.min < filterMax;
};
