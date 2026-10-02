import {
  useRef,
  useMemo,
  useState,
} from "react";
import * as XLSX from "xlsx";
import {
  ClipboardList,
  Download,
  Eye,
  Filter,
  HardHat,
  Search,
  SortAsc,
  SortDesc,
  Upload,
  Users,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import { useApiList } from "../../lib/useApiList";
import { apiRequest } from "../../lib/api";
import {
  calculateAge,
  formatDate,
  formatDateTime,
  statusBadgeClass,
  PROJECT_STAGES,
} from "../../lib/helpers";

const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Infrastructure",
];

const STATUSES = [
  "New Mail",
  "Awaiting PM Review",
  "In Review",
  "In Progress",
  "On Hold",
  "Completed",
];

const STATUS_TABS = [
  { key: "all", label: "All Projects" },
  { key: "action-needed", label: "Action Needed" },
  { key: "in-progress", label: "In Progress" },
  { key: "on-hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
];

const STATUS_TAB_VALUES = {
  "action-needed": [
    "New Mail",
    "Awaiting PM Review",
    "In Review",
  ],
  "in-progress": ["In Progress"],
  "on-hold": ["On Hold"],
  "completed": ["Completed"],
};

const AllProjectsPage = () => {
  const {
    data: projects,
    loading,
    error,
    refetch,
  } = useApiList("/api/projects", {
    limit: 200,
  });

  const [search, setSearch] = useState("");
  const [filterPM, setFilterPM] =
    useState("");
  const [filterTL, setFilterTL] = useState("");
  const [filterType, setFilterType] =
    useState("");
  const [filterStage, setFilterStage] =
    useState("");
  const [filterStatus, setFilterStatus] =
    useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusTab, setStatusTab] = useState("all");

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const csvInputRef = useRef(null);
  const [importingCSV, setImportingCSV] = useState(false);

  const pmOptions = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((project) => project.pmName)
            .filter(Boolean)
        )
      ),
    [projects]
  );

  const tlOptions = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((project) => project.assignedTL)
            .filter(Boolean)
        )
      ),
    [projects]
  );

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    const result = projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.projectName
          ?.toLowerCase()
          .includes(query) ||
        project.projectCode
          ?.toLowerCase()
          .includes(query) ||
        project.subject
          ?.toLowerCase()
          .includes(query) ||
        project.pmName
          ?.toLowerCase()
          .includes(query) ||
        project.assignedTL
          ?.toLowerCase()
          .includes(query) ||
        project.projectType
          ?.toLowerCase()
          .includes(query) ||
        project.projectStage
          ?.toLowerCase()
          .includes(query) ||
        project.location
          ?.toLowerCase()
          .includes(query);

      const statusValues =
        STATUS_TAB_VALUES[
          statusTab
        ];

      const matchesStatusTab =
        statusTab === "all" ||
        (statusValues &&
          statusValues.includes(
            project.status
          ));

      return (
        matchesSearch &&
        matchesStatusTab &&
        (!filterPM ||
          project.pmName === filterPM) &&
        (!filterTL ||
          project.assignedTL === filterTL) &&
        (!filterType ||
          project.projectType === filterType) &&
        (!filterStage ||
          project.projectStage === filterStage) &&
        (!filterStatus ||
          project.status === filterStatus)
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.receivedDate || 0) -
          new Date(b.receivedDate || 0)
        );
      }

      if (sortBy === "age-asc") {
        return (
          (calculateAge(a.receivedDate) || 0) -
          (calculateAge(b.receivedDate) || 0)
        );
      }

       if (sortBy === "age-desc") {
        return (
          (calculateAge(b.receivedDate) || 0) -
          (calculateAge(a.receivedDate) || 0)
        );
      }

      if (sortBy === "name-az") {
        return String(
          a.projectName || ""
        ).localeCompare(
          String(b.projectName || "")
        );
      }

      return (
        new Date(b.receivedDate || 0) -
        new Date(a.receivedDate || 0)
      );
    });
  }, [
    projects,
    search,
    statusTab,
    filterPM,
    filterTL,
    filterType,
    filterStage,
    filterStatus,
    sortBy,
  ]);

  const statistics = useMemo(
    () => ({
      total: filtered.length,

      inProgress: filtered.filter(
        (project) =>
          project.status === "In Progress"
      ).length,

      onHold: filtered.filter(
        (project) =>
          project.status === "On Hold"
      ).length,

      completed: filtered.filter(
        (project) =>
          project.status === "Completed"
      ).length,

      awaitingReview: filtered.filter(
        (project) =>
          project.status ===
            "Awaiting PM Review" ||
          project.status === "In Review"
      ).length,
    }),
    [filtered]
  );

  const getStatusTabCount = (key) => {
    if (key === "all") {
      return filtered.length;
    }

    const values =
      STATUS_TAB_VALUES[key];

    if (!values) {
      return 0;
    }

    return filtered.filter(
      (project) =>
        values.includes(project.status)
    ).length;
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const pageItems = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const resetFilters = () => {
    setSearch("");
    setFilterPM("");
    setFilterTL("");
    setFilterType("");
    setFilterStage("");
    setFilterStatus("");
    setSortBy("newest");
    setStatusTab("all");
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (!filtered.length) return;

    const headers = [
      "Project Name",
      "Code",
      "Type",
      "Stage",
      "Status",
      "PM",
      "TL",
      "Received",
      "Age (Days)",
    ];

    const rows = filtered.map((project) => [
      project.projectName,
      project.projectCode,
      project.projectType,
      project.projectStage,
      project.status,
      project.pmName,
      project.assignedTL,
      project.receivedDate,
      calculateAge(project.receivedDate),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "metis-projects.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // DOWNLOAD SAMPLE CSV
  // ------------------------------------------------------------
  const downloadSampleCSV = () => {
    const headers = [
      "Mail Subject",
      "Mail Date",
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

    const sampleRow = [
      "Sample Project Email",
      new Date().toISOString().slice(0, 10),
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

    const csv = [headers, sampleRow]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "metis-project-sample.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // CSV PARSER
  // Handles quoted CSV values and commas inside fields.
  // ------------------------------------------------------------
  const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && insideQuotes && next === '"') {
        value += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === "," && !insideQuotes) {
        row.push(value);
        value = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (char === "\r" && next === "\n") {
          i += 1;
        }

        row.push(value);
        value = "";

        if (row.some((cell) => cell.trim() !== "")) {
          rows.push(row);
        }

        row = [];
        continue;
      }

      value += char;
    }

    if (value.length > 0 || row.length > 0) {
      row.push(value);

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
    }

    if (!rows.length) {
      return [];
    }

    const headers = rows[0].map((header) =>
      header.trim().replace(/^\uFEFF/, "")
    );

    return rows.slice(1).map((cells) => {
      const record = {};

      headers.forEach((header, index) => {
        record[header] = (cells[index] || "").trim();
      });

      return record;
    });
  };

  // ------------------------------------------------------------
  // IMPORT CSV
  // Creates each project through the same POST /api/projects
  // endpoint used by Add Project.
  // ------------------------------------------------------------
  const handleImportCSV = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImportingCSV(true);

      let rows;

      if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        rows = XLSX.utils.sheet_to_json(firstSheet, {
          defval: "",
        });
      } else {
        const text = await file.text();
        rows = parseCSV(text);
      }

      if (!rows.length) {
        throw new Error("The CSV file is empty.");
      }

      const requiredHeaders = [
        "Mail Subject",
        "Mail Date",
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

      const actualHeaders = Object.keys(rows[0]);

      const missingHeaders = requiredHeaders.filter(
        (header) => !actualHeaders.includes(header)
      );

      if (missingHeaders.length) {
        throw new Error(
          `Missing CSV columns: ${missingHeaders.join(", ")}`
        );
      }

      // Load PM users so CSV can contain the PM name
      // while the API receives the PM user ID.
      const pmResponse = await apiRequest(
        "/api/users?role=pm&active=true"
      );

      const pmUsers = Array.isArray(pmResponse?.users)
        ? pmResponse.users
        : Array.isArray(pmResponse?.data)
          ? pmResponse.data
          : Array.isArray(pmResponse)
            ? pmResponse
            : [];

      let imported = 0;
      const errors = [];

      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const rowNumber = index + 2;

        if (!row["Project Name"]?.trim()) {
          errors.push(
            `Row ${rowNumber}: Project Name is required.`
          );
          continue;
        }

        const pmName = row["Project Manager"]?.trim();

        let pmId;

        if (
          pmName &&
          pmName.toLowerCase() !== "unassigned"
        ) {
          const matchedPM = pmUsers.find(
            (pm) =>
              String(pm.name || "")
                .trim()
                .toLowerCase() === pmName.toLowerCase()
          );

          if (!matchedPM) {
            errors.push(
              `Row ${rowNumber}: Project Manager "${pmName}" was not found.`
            );
            continue;
          }

          pmId = matchedPM.id || matchedPM._id;
        }

        const payload = {
          subject:
            row["Mail Subject"]?.trim() || "",

          mailDate:
            row["Mail Date"]?.trim() || undefined,

          projectName:
            row["Project Name"]?.trim() || "",

          projectCode:
            row["Project Code"]?.trim() || "",

          projectType:
            row["Type of Project"]?.trim() || undefined,

          emailStage:
            row["Email Stage"]?.trim() || undefined,

          projectStage:
            row["Project Stage"]?.trim() ||
            "Acknowledged",

          pm: pmId || undefined,

          location:
            row["Project Location"]?.trim() || "",

          scope:
            row["Project Scope"]?.trim() || "",

          assignmentPriority:
            row["Assignment Priority"]?.trim() ||
            "Normal",

          delegationNote:
            row["Delegation Note"]?.trim() || "",
        };

        try {
          await apiRequest("/api/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: payload,
          });

          imported += 1;
        } catch (error) {
          errors.push(
            `Row ${rowNumber}: ${
              error.message || "Project creation failed."
            }`
          );
        }
      }

      await refetch({ limit: 200 });

      if (errors.length) {
        showImportResult(imported, errors);
      } else {
        window.alert(
          `${imported} project${
            imported === 1 ? "" : "s"
          } imported successfully.`
        );
      }
    } catch (error) {
      window.alert(
        error.message || "Unable to import CSV."
      );
    } finally {
      setImportingCSV(false);

      if (csvInputRef.current) {
        csvInputRef.current.value = "";
      }
    }
  };

  const showImportResult = (imported, errors) => {
    window.alert(
      `${imported} project${
        imported === 1 ? "" : "s"
      } imported successfully.\n\n` +
      `Some rows could not be imported:\n\n` +
      errors.join("\n")
    );
  };
  if (loading) {
    return (
      <>
        <AdminHeader
          title="All Projects"
          subtitle="Complete project registry across METIS"
        />

        <main className="admin-content">
          <LoadingState />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminHeader
          title="All Projects"
          subtitle="Complete project registry across METIS"
          onRefresh={() =>
            refetch({ limit: 200 })
          }
        />

        <main className="admin-content">
          <ErrorState
            message={
              error.message ||
              "Unable to load projects"
            }
            onRetry={() =>
              refetch({ limit: 200 })
            }
          />
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="All Projects"
        subtitle="Complete project registry across METIS"
        searchValue={search}
        onSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search projects, codes, PMs..."
        onRefresh={() => refetch({ limit: 200 })}
        actions={
          <>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              style={{ display: "none" }}
              onChange={handleImportCSV}
            />

            <button
              type="button"
              className="admin-export-button"
              onClick={downloadSampleCSV}
            >
              <Download size={14} />
              Download Sample
            </button>

            <button
              type="button"
              className="admin-export-button"
              onClick={() => csvInputRef.current?.click()}
              disabled={importingCSV}
            >
              <Upload size={14} />
              {importingCSV ? "Importing..." : "Import CSV"}
            </button>

            <button
              type="button"
              className="admin-export-button"
              onClick={exportCSV}
            >
              <Download size={14} />
              Export
            </button>
          </>
        }
      />

      <main className="admin-content">
        <section className="admin-metrics">
          <MetricCard
            title="Total Projects"
            value={statistics.total}
            description="All dispatched projects"
            icon={<ClipboardList size={17} />}
            iconClass="blue"
          />

          <MetricCard
            title="Awaiting Review"
            value={statistics.awaitingReview}
            description="Pending PM triage"
            icon={<Eye size={17} />}
            iconClass="amber"
          />

          <MetricCard
            title="In Progress"
            value={statistics.inProgress}
            description="Active on-site work"
            icon={<Users size={17} />}
            iconClass="green"
          />

          <MetricCard
            title="On Hold"
            value={statistics.onHold}
            description="Requires clarification"
            icon={<HardHat size={17} />}
            iconClass="red"
          />
        </section>

        <section className="admin-queue-card">
          <div className="admin-queue-header">
            <div className="admin-queue-title">
              <span />
              <div>
                <div className="admin-queue-heading-row">
                  <h2>Project Registry</h2>

                  <span className="admin-showing-badge">
                    Showing {filtered.length} of{" "}
                    {projects.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-control-top">
              <div className="admin-status-tabs">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`admin-status-tab ${
                      statusTab === tab.key
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setStatusTab(
                        tab.key
                      );
                      setCurrentPage(1);
                    }}
                  >
                    <span className="count">
                      {getStatusTabCount(
                        tab.key
                      )}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="admin-clear-btn"
                onClick={resetFilters}
              >
                <Filter size={14} />
                Clear Filters
              </button>
            </div>

            <div className="admin-filter-bar">
              <div className="admin-filter-search">
                <Search size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  placeholder="Search projects, codes, PMs..."
                />
              </div>

              <select
                className="admin-filter-select"
                value={filterPM}
                onChange={(event) => {
                  setFilterPM(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  PM Lead: All
                </option>
                {pmOptions.map((name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                ))}
              </select>

              <select
                className="admin-filter-select"
                value={filterTL}
                onChange={(event) => {
                  setFilterTL(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Team Lead: All
                </option>
                {tlOptions.map((name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                ))}
              </select>

              <select
                className="admin-filter-select"
                value={filterType}
                onChange={(event) => {
                  setFilterType(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Project Type: All
                </option>
                {PROJECT_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>

              <select
                className="admin-filter-select"
                value={filterStage}
                onChange={(event) => {
                  setFilterStage(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Project Stage: All
                </option>
                {PROJECT_STAGES.map((stage) => (
                  <option
                    key={stage}
                    value={stage}
                  >
                    {stage}
                  </option>
                ))}
              </select>

              <select
                className="admin-filter-select"
                value={filterStatus}
                onChange={(event) => {
                  setFilterStatus(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="">
                  Status: All
                </option>
                {STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>

              <select
                className="admin-filter-select"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(
                    event.target.value
                  );
                  setCurrentPage(1);
                }}
              >
                <option value="newest">
                  Newest First
                </option>
                <option value="oldest">
                  Oldest First
                </option>
                <option value="age-asc">
                  Age: Lowest First
                </option>
                <option value="age-desc">
                  Age: Highest First
                </option>
                <option value="name-az">
                  Project Name (A-Z)
                </option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-mail-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Type</th>
                  <th>PM</th>
                  <th>Team Lead</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th className="center">
                    Age
                  </th>
                  <th>Last Activity</th>
                  <th className="right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="admin-empty-state"
                    >
                      <div className="admin-empty-icon">
                        <HardHat size={28} />
                      </div>

                      <h3>No Projects Found</h3>

                      <p>
                        No construction projects
                        match your active search
                        terms or filter
                        combinations.
                      </p>

                      <button
                        onClick={resetFilters}
                      >
                        Clear All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() =>
                        setSelectedProject(project)
                      }
                    >
                      <td>
                        <div className="mail-subject-cell">
                          <div className="mail-icon">
                            <ClipboardList
                              size={14}
                            />
                          </div>

                          <div>
                            <strong>
                              {project.projectName ||
                                "-"}
                            </strong>

                            <small>
                              {project.projectCode
                                ? `${project.projectCode} â€¢ `
                                : ""}
                              {project.subject}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="type-badge">
                          {project.projectType || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="pm-pill">
                          <span>
                            {project.pmInitials ||
                              (project.pmName
                                ? project.pmName
                                    .split(/\s+/)
                                    .map(
                                      (name) =>
                                        name[0]
                                    )
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "-")}
                          </span>

                          {project.pmName || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="pm-pill">
                          <span>
                            {project.assignedTL
                              ? project.assignedTL
                                  .split(/\s+/)
                                  .map(
                                    (name) =>
                                      name[0]
                                  )
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : ""}
                          </span>

                          {project.assignedTL ||
                            "Unassigned"}
                        </span>
                      </td>

                      <td>
                        <span className="project-stage-badge">
                          {project.projectStage ||
                            "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={statusBadgeClass(
                            project.status
                          )}
                        >
                          <span />
                          {project.status || "-"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          project.receivedDate
                        )}
                      </td>

                      <td className="center">
                        <span className="age-badge">
                          {calculateAge(
                            project.receivedDate
                          ) ?? 0}{" "}
                          days
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          project.lastActivity
                        )}
                      </td>

                      <td
                        className="right"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <button
                          className="review-button"
                          onClick={() =>
                            setSelectedProject(
                              project
                            )
                          }
                        >
                          <Eye size={14} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span>
              Showing{" "}
              {filtered.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}{" "}
              to{" "}
              {Math.min(
                safePage * pageSize,
                filtered.length
              )}{" "}
              of {filtered.length} projects
            </span>

            <div>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(event.target.value)
                  );
                  setCurrentPage(1);
                }}
              >
                <option value={10}>
                  10 per page
                </option>
                <option value={25}>
                  25 per page
                </option>
                <option value={50}>
                  50 per page
                </option>
              </select>

              <button
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
              >
                <SortAsc size={14} />
                Previous
              </button>

              <span>{safePage}</span>

              <button
                disabled={
                  safePage === totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                  )
                }
              >
                Next
                <SortDesc size={14} />
              </button>
            </div>
          </div>
        </section>

        {selectedProject && (
          <ProjectDrawer
            project={selectedProject}
            onClose={() =>
              setSelectedProject(null)
            }
          />
        )}
      </main>
    </>
  );
};

const MetricCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
}) => (
  <div className="admin-metric-card">
    <div className="metric-top">
      <span>{title}</span>
      <div className={`metric-icon ${iconClass}`}>
        {icon}
      </div>
    </div>

    <div className="metric-value-row">
      <strong>{value}</strong>
    </div>

    <small>{description}</small>
  </div>
);

const LoadingState = () => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <HardHat size={28} />
    </div>

    <h3>Loading projects...</h3>

    <p>
      Fetching project registry from the
      METIS backend.
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <HardHat size={28} />
    </div>

    <h3>Unable to load projects</h3>

    <p>{message}</p>

    <button onClick={onRetry}>Retry</button>
  </div>
);

const ProjectDrawer = ({
  project,
  onClose,
}) => {
  const drawerField = (label, value) => (
    <div className="drawer-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );

  return (
    <>
      <div
        className="admin-drawer-backdrop"
        onClick={onClose}
      />

      <aside className="admin-detail-drawer">
        <div className="admin-drawer-header">
          <div>
            <span className="drawer-ref">
              #{project.id}
            </span>

            <h2>
              {project.projectName}
            </h2>

            <p>
              {project.projectType || "Project"} â€¢{" "}
              {project.projectStage || "-"}{" "}
              Stage
            </p>
          </div>

          <button onClick={onClose}>
            <HardHat size={19} />
          </button>
        </div>

        <div className="admin-drawer-body">
          <div className="drawer-section">
            <h3>Project Overview</h3>

            {drawerField(
              "Project Code",
              project.projectCode
            )}
            {drawerField(
              "Type",
              project.projectType
            )}
            {drawerField(
              "Stage",
              project.projectStage
            )}
            {drawerField(
              "Status",
              project.status
            )}
            {drawerField(
              "Location",
              project.location
            )}
            {drawerField(
              "Assigned PM",
              project.pmName
            )}
            {drawerField(
              "Assigned TL",
              project.assignedTL
            )}
          </div>

          <div className="drawer-section">
            <h3>Dispatch Timeline</h3>

            {drawerField(
              "Mail Date",
              formatDate(project.mailDate)
            )}
            {drawerField(
              "Received Date",
              formatDate(project.receivedDate)
            )}
            {drawerField(
              "Age",
              `${calculateAge(
                project.receivedDate
              ) ?? 0} days old`
            )}
            {drawerField(
              "Last Activity",
              formatDateTime(
                project.lastActivity
              )
            )}
            {drawerField(
              "Assignment Date",
              formatDate(project.assignedDate)
            )}
          </div>

          <div className="drawer-section">
            <h3>Email Context</h3>

            {drawerField(
              "Subject",
              project.subject
            )}
            {drawerField(
              "Email Stage",
              project.emailStage
            )}
            {drawerField(
              "Processing Status",
              project.processingStatus
            )}

            <div className="drawer-field">
              <span>Snippet</span>

              <strong>
                {project.snippet ||
                  project.body ||
                  "No mail content available."}
              </strong>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AllProjectsPage;


