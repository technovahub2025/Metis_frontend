const HEADER_ALIASES = {
  "start date": "Start Date",
  startdate: "Start Date",
  "project start date": "Start Date",
  projectstartdate: "Start Date",
  "end date": "End Date",
  enddate: "End Date",
  "project end date": "End Date",
  projectenddate: "End Date",
};

export const normalizeHeader = (header) => {
  const lower = String(header || "").toLowerCase().trim();
  return HEADER_ALIASES[lower] || header;
};

export const PROJECT_CSV_HEADERS = [
  "Mail Subject",
  "Mail Date",
  "Start Date",
  "End Date",
  "Project Name",
  "Project Code",
  "Project Manager",
  "Type of Project",
  "Email Stage",
  "Project Stage",
  "Assignment Priority",
  "Project Location",
  "Project Scope",
  "Delegation Note",
];

export const downloadProjectSampleCSV = () => {
  const day = new Date();
  const future = new Date();
  future.setDate(day.getDate() + 10);

  const sampleRow = [
    "Sample Project Email",
    new Date().toISOString().slice(0, 10),
    future.toISOString().slice(0, 10),
    "",
    "Test Project",
    "PRJ-001",
    "Unassigned",
    "RCC",
    "Sent to Client",
    "Acknowledged",
    "Normal",
    "Puducherry",
    "Sample project scope",
    "Sample delegation note",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    PROJECT_CSV_HEADERS.map(escapeCSV).join(","),
    sampleRow.map(escapeCSV).join(","),
  ].join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "project-import-template.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

export const parseProjectCSV = (text) => {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !inQuotes
    ) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(value);
      value = "";

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
    } else {
      value += char;
    }
  }

  if (value !== "" || row.length > 0) {
    row.push(value);

    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
};