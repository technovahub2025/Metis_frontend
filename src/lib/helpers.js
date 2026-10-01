export const calculateAge = (date) => {
  if (!date) return null;

  const received = new Date(date);

  if (Number.isNaN(received.getTime())) {
    return null;
  }

  const today = new Date();

  const difference =
    today.getTime() - received.getTime();

  return Math.max(
    0,
    Math.floor(
      difference / (1000 * 60 * 60 * 24)
    )
  );
};

export const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const cn = (...classes) =>
  classes.filter(Boolean).join(" ");

export const statusBadgeClass = (status) =>
  cn(
    "status-badge",
    status
      ? status
          .toLowerCase()
          .replace(/\s+/g, "-")
      : "empty"
  );

export const initials = (name, fallback = "??") =>
  name
    ? name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || fallback
    : fallback;

export const EMAIL_STAGES = [
  "Sent to Client",
  "Acknowledgement",
  "In Discussion",
  "Sent by IT",
  "Hold",
  "Waiting for IC/IT",
];

export const PROJECT_STAGES = [
  "Acknowledged",
  "Model/Quote sent",
  "Implementation",
  "Dropped",
  "Hold",
  "In Discussion - Inhouse",
  "In Discussion - Team",
  "Completed",
];
