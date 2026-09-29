import {
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  Filter,
  PauseCircle,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";

import { useApiList } from "../../lib/useApiList";
import {
  calculateAge,
  formatDate,
} from "../../lib/helpers";
import { TLHamburger } from "../../components/tl";

import "../../index.css";

const TLAllProjectsPage = () => {
  const {
    data: projects,
    total,
    loading,
    error,
    refetch,
  } = useApiList("/api/projects", {
    limit: 200,
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleRefresh = () => {
    refetch();
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterStage("all");
    setFilterStatus("all");
    setSortBy("newest");
  };

  /*
   * ==========================================
   * METRICS
   * ==========================================
   */
  const metrics = useMemo(() => {
    return {
      total: projects.length,

      inProgress: projects.filter(
        (project) =>
          project.status === "In Progress"
      ).length,

      onHold: projects.filter(
        (project) =>
          project.status === "On Hold"
      ).length,

      completed: projects.filter(
        (project) =>
          project.status === "Completed"
      ).length,
    };
  }, [projects]);

  /*
   * ==========================================
   * FILTER + SORT
   * ==========================================
   */
  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    const result = projects.filter((project) => {
      const projectName =
        project.projectName
          ?.toLowerCase() || "";

      const projectCode =
        project.projectCode
          ?.toLowerCase() || "";

      const subject =
        project.subject
          ?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        projectName.includes(query) ||
        projectCode.includes(query) ||
        subject.includes(query);

      const matchesType =
        filterType === "all" ||
        project.projectType === filterType;

      const matchesStage =
        filterStage === "all" ||
        project.projectStage === filterStage;

      const matchesStatus =
        filterStatus === "all" ||
        project.status === filterStatus;

      return (
        matchesSearch &&
        matchesType &&
        matchesStage &&
        matchesStatus
      );
    });

    return [...result].sort((a, b) => {
      const dateA = new Date(
        a.mailDate || 0
      );

      const dateB = new Date(
        b.mailDate || 0
      );

      if (sortBy === "newest") {
        return dateB - dateA;
      }

      if (sortBy === "oldest") {
        return dateA - dateB;
      }

      if (sortBy === "age-high") {
        const ageA =
          calculateAge(a.mailDate) || 0;

        const ageB =
          calculateAge(b.mailDate) || 0;

        return ageB - ageA;
      }

      if (sortBy === "age-low") {
        const ageA =
          calculateAge(a.mailDate) || 0;

        const ageB =
          calculateAge(b.mailDate) || 0;

        return ageA - ageB;
      }

      if (sortBy === "name") {
        return (
          (a.projectName || "")
            .localeCompare(
              b.projectName || ""
            )
        );
      }

      return 0;
    });
  }, [
    projects,
    search,
    filterType,
    filterStage,
    filterStatus,
    sortBy,
  ]);

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */
  return (
    <>

        {/* HEADER */}
        <header className="tl-header">

          <TLHamburger />

          <div className="tl-header-title">

            <div className="tl-header-number">
              TL
            </div>

            <h1>ALL PROJECTS</h1>

          </div>

          <div className="tl-header-actions">

            <div className="tl-pm-badge">
              <span>
                Supervising PM:
              </span>

              <strong className="tl-pm-avatar">
                PM
              </strong>

              <b>
                Supervising PM
              </b>
            </div>

            <button
              className="tl-icon-button"
              title="Notifications"
              type="button"
            >
              <Bell size={17} />
              <span className="tl-notification-dot" />
            </button>

            <button
              className="tl-icon-button"
              onClick={handleRefresh}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={17} />
            </button>

          </div>
        </header>

        {/* CONTENT */}
        <div className="tl-content">

          {/* =================================
              METRICS
          ================================== */}
          <section className="tl-metrics">

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label">
                  TOTAL
                </span>

                <strong>
                  {metrics.total}
                </strong>

                <small>
                  All projects
                </small>
              </div>

              <div className="tl-metric-icon neutral">
                <Briefcase size={18} />
              </div>

            </div>

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label">
                  IN PROGRESS
                </span>

                <strong className="blue">
                  {metrics.inProgress}
                </strong>

                <small>
                  Active on-site
                </small>
              </div>

              <div className="tl-metric-icon blue-icon">
                <Zap size={18} />
              </div>

            </div>

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label red">
                  ON HOLD
                </span>

                <strong>
                  {metrics.onHold}
                </strong>

                <small>
                  Pending revision
                </small>
              </div>

              <div className="tl-metric-icon red-icon">
                <PauseCircle size={18} />
              </div>

            </div>

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label green">
                  COMPLETED
                </span>

                <strong className="green">
                  {metrics.completed}
                </strong>

                <small>
                  Handover
                </small>
              </div>

              <div className="tl-metric-icon green-icon">
                <CheckCircle2 size={18} />
              </div>

            </div>

          </section>

          {/* =================================
              CONTROLS
          ================================== */}
          <section className="tl-controls">

            <div className="tl-control-top">

              <div>
                <div className="tl-tabs">

                  <button
                    type="button"
                    className={`tl-tab ${
                      filterStatus === "all"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setFilterStatus("all")
                    }
                  >
                    All Projects
                  </button>

                  <button
                    type="button"
                    className={`tl-tab ${
                      filterStatus ===
                      "In Progress"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setFilterStatus(
                        "In Progress"
                      )
                    }
                  >
                    <i className="blue-dot" />
                    In Progress
                  </button>

                  <button
                    type="button"
                    className={`tl-tab ${
                      filterStatus === "On Hold"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setFilterStatus(
                        "On Hold"
                      )
                    }
                  >
                    <i className="red-dot" />
                    On Hold
                  </button>

                  <button
                    type="button"
                    className={`tl-tab ${
                      filterStatus ===
                      "Completed"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setFilterStatus(
                        "Completed"
                      )
                    }
                  >
                    <i className="green-dot" />
                    Completed
                  </button>

                </div>
              </div>

              <div className="tl-view-switcher">

                <span>
                  Filters:
                </span>

                <div>
                  <select
                    value={filterType}
                    onChange={(event) =>
                      setFilterType(
                        event.target.value
                      )
                    }
                    className="tl-filter-select"
                  >
                    <option value="all">
                      Type: All
                    </option>

                    <option value="RCC">
                      RCC
                    </option>

                    <option value="Steel">
                      Steel
                    </option>

                    <option value="Outsource">
                      Outsource
                    </option>

                    <option value="TMC">
                      TMC
                    </option>
                  </select>
                </div>

              </div>

            </div>

            {/* FILTER ROW */}
            <div className="tl-filter-row">

              <div className="tl-search">

                <Search size={17} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search projects by name, code, subject..."
                />

              </div>

              <select
                value={filterStage}
                onChange={(event) =>
                  setFilterStage(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Stage: All
                </option>

                <option value="Planning">
                  Planning
                </option>

                <option value="Design">
                  Design
                </option>

                <option value="Construction">
                  Construction
                </option>

                <option value="Execution">
                  Execution
                </option>

                <option value="Closure">
                  Closure
                </option>
              </select>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="newest">
                  Sort: Newest First
                </option>

                <option value="oldest">
                  Sort: Oldest First
                </option>

                <option value="age-high">
                  Sort: Age High
                </option>

                <option value="age-low">
                  Sort: Age Low
                </option>

                <option value="name">
                  Sort: Name
                </option>
              </select>

              <button
                type="button"
                className="tl-filter-button"
                onClick={clearFilters}
                title="Clear filters"
              >
                <Filter size={16} />
              </button>

            </div>
          </section>

          {/* =================================
              TABLE
          ================================== */}
          <section className="tl-table-container">

            {loading ? (
              <div className="tl-empty">

                <div className="tl-empty-icon">
                  <Briefcase size={24} />
                </div>

                <h3>
                  Loading Projects
                </h3>

                <p>
                  Please wait while projects
                  are being fetched...
                </p>

              </div>
            ) : error ? (
              <div className="tl-empty">

                <div className="tl-empty-icon">
                  <Briefcase size={24} />
                </div>

                <h3>
                  Unable to Load Projects
                </h3>

                <p>
                  {error.message ||
                    "Failed to fetch project data."}
                </p>

                <button
                  type="button"
                  onClick={handleRefresh}
                >
                  Retry
                </button>

              </div>
            ) : filtered.length === 0 ? (
              <div className="tl-empty">

                <div className="tl-empty-icon">
                  <Briefcase size={24} />
                </div>

                <h3>
                  No Projects Found
                </h3>

                <p>
                  {search ||
                  filterType !== "all" ||
                  filterStage !== "all" ||
                  filterStatus !== "all"
                    ? "No projects match the current filters."
                    : "There are no projects available."}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>
            ) : (
              <div className="tl-table-scroll">

                <table className="tl-table">

                  <thead>
                    <tr>
                      <th>PROJECT</th>
                      <th>TYPE</th>
                      <th>STAGE</th>
                      <th>STATUS</th>
                      <th>PM LEAD</th>
                      <th>TL</th>
                      <th>MAIL DATE</th>
                      <th>AGE</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filtered.map((project) => {
                      const age = calculateAge(
                        project.mailDate
                      );

                      return (
                        <tr
                          key={
                            project.id ||
                            project._id ||
                            `${project.projectCode || ""}-${project.mailDate || ""}`
                          }
                        >

                          {/* PROJECT */}
                          <td>
                            <div className="tl-project-cell">

                              <div className="tl-project-icon">
                                <Building2 size={16} />
                              </div>

                              <div>
                                <div className="tl-project-name">

                                  <span>
                                    {project.projectName ||
                                      "—"}
                                  </span>

                                  <small>
                                    {project.projectCode ||
                                      ""}
                                  </small>

                                </div>

                                {project.subject && (
                                  <p>
                                    •{" "}
                                    {project.subject}
                                  </p>
                                )}

                              </div>

                            </div>
                          </td>

                          {/* TYPE */}
                          <td>
                            <span
                              className={`tl-type ${
                                project.projectType
                                  ? project.projectType
                                      .toLowerCase()
                                  : ""
                              }`}
                            >
                              {project.projectType ||
                                "—"}
                            </span>
                          </td>

                          {/* STAGE */}
                          <td>
                            <span
                              className={`tl-stage ${
                                project.projectStage
                                  ? project.projectStage
                                      .toLowerCase()
                                  : ""
                              }`}
                            >
                              {project.projectStage ||
                                "—"}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`tl-status ${
                                project.status
                                  ? project.status
                                      .toLowerCase()
                                      .replace(
                                        /\s+/g,
                                        "-"
                                      )
                                  : "empty"
                              }`}
                            >
                              <i />

                              {project.status ||
                                "—"}
                            </span>
                          </td>

                          {/* PM */}
                          <td>
                            <div className="tl-pm-cell">

                              <span className="tl-table-avatar">
                                {project.pmInitials ||
                                  "PM"}
                              </span>

                              <strong>
                                {project.pmName ||
                                  "—"}
                              </strong>

                            </div>
                          </td>

                          {/* TL */}
                          <td>
                            {project.assignedTL ? (
                              <div className="tl-pm-cell">

                                <span className="tl-table-avatar">
                                  TL
                                </span>

                                <strong>
                                  {project.assignedTL}
                                </strong>

                              </div>
                            ) : (
                              <span>—</span>
                            )}
                          </td>

                          {/* MAIL DATE */}
                          <td>
                            {formatDate(
                              project.mailDate
                            )}
                          </td>

                          {/* AGE */}
                          <td>
                            <span
                              className={
                                typeof age ===
                                  "number" &&
                                age >= 5
                                  ? "tl-age tl-age-danger"
                                  : "tl-age"
                              }
                            >
                              {age ?? "—"}

                              {typeof age ===
                                "number"
                                ? "d"
                                : ""}
                            </span>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>

              </div>
            )}

            {/* TABLE FOOTER */}
            <div className="tl-table-footer">

              <span>
                Showing {filtered.length} of{" "}
                {total ?? filtered.length}{" "}
                projects
              </span>

            </div>

          </section>

        </div>
      
    </>
  );
};

export default TLAllProjectsPage;