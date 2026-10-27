export const getRelativeDate = (dateValue) => {
  if (!dateValue) return "Not available";

  const postedDate = new Date(dateValue);

  if (Number.isNaN(postedDate.getTime())) {
    return "Not available";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  postedDate.setHours(0, 0, 0, 0);

  const days = Math.floor(
    (today.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);

  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
};
