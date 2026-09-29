import { useMemo, useState } from "react";
import { TLHamburger } from "../../components/tl";
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Grid2X2,
  LayoutDashboard,
  PauseCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const TLPage = () => {
  /*
   * Backend data will replace this array.
   * Keeping it empty prevents fake business data from becoming
   * permanent application data.
   */
  const [projects, setProjects] = useState([]);

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [pmFilter, setPmFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const [selectedProject, setSelectedProject] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const [notes, setNotes] = useState("");

  const showToast = (title, message) => {
    setToast({
      visible: true,
      title,
      message,
    });

    setTimeout(() => {
      setToast((current) => ({
        ...current,
        visible: false,
      }));
    }, 3200);
  };

  const metrics = useMemo(() => {
    return {
      total: projects.length,
      actionNeeded: projects.filter(
        (project) => project.status === "Action Needed"
      ).length,
      inProgress: projects.filter(
        (project) => project.status === "In Progress"
      ).length,
      onHold: projects.filter(
        (project) => project.status === "On Hold"
      ).length,
      completed: projects.filter(
        (project) => project.status === "Completed"
      ).length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (activeFilter === "NEW") {
      result = result.filter(
        (project) => project.status === "Action Needed"
      );
    }

    if (activeFilter === "IN_PROGRESS") {
      result = result.filter(
        (project) => project.status === "In Progress"
      );
    }

    if (activeFilter === "ON_HOLD") {
      result = result.filter(
        (project) => project.status === "On Hold"
      );
    }

    if (activeFilter === "COMPLETED") {
      result = result.filter(
        (project) => project.status === "Completed"
      );
    }

    if (typeFilter !== "ALL") {
      result = result.filter(
        (project) => project.type === typeFilter
      );
    }

    if (stageFilter !== "ALL") {
      result = result.filter(
        (project) => project.stage === stageFilter
      );
    }

    if (pmFilter !== "ALL") {
      result = result.filter(
        (project) => project.pmName === pmFilter
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((project) => {
        return (
          project.name?.toLowerCase().includes(query) ||
          project.id?.toLowerCase().includes(query) ||
          project.updateNote?.toLowerCase().includes(query) ||
          project.pmName?.toLowerCase().includes(query) ||
          project.stage?.toLowerCase().includes(query)
        );
      });
    }

    if (sortOrder === "NEWEST") {
      result.sort(
        (a, b) => Number(a.ageDays || 0) - Number(b.ageDays || 0)
      );
    }

    if (sortOrder === "OLDEST" || sortOrder === "AGE_HIGH") {
      result.sort(
        (a, b) => Number(b.ageDays || 0) - Number(a.ageDays || 0)
      );
    }

    if (sortOrder === "NAME") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    }

    return result;
  }, [
    projects,
    activeFilter,
    typeFilter,
    stageFilter,
    pmFilter,
    search,
    sortOrder,
  ]);

  const updateProjectStatus = (projectId, newStatus) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status: newStatus,
            }
          : project
      )
    );

    const project = projects.find(
      (item) => item.id === projectId
    );

    if (project) {
      showToast(
        "Status Updated",
        `${project.name} is now marked as "${newStatus}".`
      );
    }

    setSelectedProject((current) =>
      current?.id === projectId
        ? {
            ...current,
            status: newStatus,
          }
        : current
    );
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setStageFilter("ALL");
    setPmFilter("ALL");
    setSortOrder("NEWEST");
    setActiveFilter("ALL");

    showToast(
      "Filters Cleared",
      "Workspace restored to show all assigned projects."
    );
  };

  const openProject = (project) => {
    setSelectedProject(project);
    setNotes("");
  };

  const closeProject = () => {
    setSelectedProject(null);
    setNotes("");
  };

  const appendNotes = () => {
    if (!notes.trim()) return;

    showToast(
      "Field Log Appended",
      "Your note has been submitted to project supervision records."
    );

    setNotes("");
  };

  const generateDpr = () => {
    showToast(
      "DPR Generated",
      "Daily Progress Report PDF compiled with on-site timeline logs."
    );
  };

  const getTypeClass = (type) => {
    switch (type) {
      case "RCC":
        return "tl-type rcc";

      case "Steel":
        return "tl-type steel";

      case "Outsource":
        return "tl-type outsource";
      case "TMC":
        return "tl-type tmc";


      default:
        return "tl-type";
    }
  };

  const getStageClass = (stage) => {
    switch (stage) {
      case "Planning":
        return "tl-stage planning";

      case "Design":
        return "tl-stage design";

      case "Construction":
        return "tl-stage construction";

      case "Closure":
        return "tl-stage closure";

      default:
        return "tl-stage";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress":
        return "tl-status in-progress";

      case "Action Needed":
        return "tl-status action-needed";

      case "On Hold":
        return "tl-status on-hold";

      case "Completed":
        return "tl-status completed";

      default:
        return "tl-status";
    }
  };

  const getAgeClass = (days) => {
    return Number(days) >= 5
      ? "tl-age tl-age-danger"
      : "tl-age";
  };

  return (
    <>

        {/* Header */}

        <header className="tl-header">
          <TLHamburger />

          <div className="tl-header-title">

            <div className="tl-header-number">
              TL
            </div>

            <h1>
              TEAM LEAD WORKSPACE
            </h1>

          </div>

          <div className="tl-header-actions">

            <div className="tl-pm-badge">
              <span>Supervising PM:</span>

              <strong className="tl-pm-avatar">
                PM
              </strong>

              <b>
                Supervising PM
              </b>
            </div>

            <button className="tl-icon-button">
              <Bell size={17} />
              <span className="tl-notification-dot" />
            </button>

            <button
              className="tl-icon-button"
              onClick={() =>
                showToast(
                  "Workspace Refreshed",
                  "Project workspace refreshed."
                )
              }
            >
              <RefreshCw size={17} />
            </button>

            <div className="tl-user-chip">

              <span className="tl-header-avatar">
                TL
              </span>

              <span>
                Team Lead (TL)
              </span>

            </div>

          </div>

        </header>

        <div className="tl-content">

          {/* ================= METRICS ================= */}

          <section className="tl-metrics">

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label">
                  TOTAL
                  <br />
                  ASSIGNED
                </span>

                <strong>
                  {metrics.total}
                </strong>

                <small>
                  Under TL
                  <br />
                  Execution
                </small>
              </div>

              <div className="tl-metric-icon neutral">
                <Briefcase size={18} />
              </div>

            </div>

            <div className="tl-metric-card highlighted">

              <div>
                <span className="tl-metric-label brown">
                  NEW /
                  <br />
                  REVIEW
                </span>

                <strong>
                  {metrics.actionNeeded}
                </strong>

                <small>
                  Awaiting Kickoff /
                  <br />
                  Plan
                </small>
              </div>

              <div className="tl-metric-icon amber">
                <UserRound size={18} />
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
                  Active On-Site
                </small>
              </div>

              <div className="tl-metric-icon blue-icon">
                <Zap size={18} />
              </div>

            </div>

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label">
                  ON HOLD
                </span>

                <strong className="red">
                  {metrics.onHold}
                </strong>

                <small>
                  Pending PM
                  <br />
                  Revision
                </small>
              </div>

              <div className="tl-metric-icon red-icon">
                <PauseCircle size={18} />
              </div>

            </div>

            <div className="tl-metric-card">

              <div>
                <span className="tl-metric-label">
                  COMPLETED
                </span>

                <strong className="green">
                  {metrics.completed}
                </strong>

                <small>
                  Handover
                  <br />
                  Accomplished
                </small>
              </div>

              <div className="tl-metric-icon green-icon">
                <CheckCircle2 size={18} />
              </div>

            </div>

          </section>

          {/* ================= CONTROLS ================= */}

          <section className="tl-controls">

            <div className="tl-control-top">

              <div className="tl-tabs">

                <button
                  className={
                    activeFilter === "ALL"
                      ? "tl-tab active"
                      : "tl-tab"
                  }
                  onClick={() => setActiveFilter("ALL")}
                >
                  All Projects
                  <span>{metrics.total}</span>
                </button>

                <button
                  className={
                    activeFilter === "NEW"
                      ? "tl-tab active"
                      : "tl-tab"
                  }
                  onClick={() => setActiveFilter("NEW")}
                >
                  <i className="yellow-dot" />
                  Action Needed
                  <span>{metrics.actionNeeded}</span>
                </button>

                <button
                  className={
                    activeFilter === "IN_PROGRESS"
                      ? "tl-tab active"
                      : "tl-tab"
                  }
                  onClick={() =>
                    setActiveFilter("IN_PROGRESS")
                  }
                >
                  <i className="blue-dot" />
                  In Progress
                  <span>{metrics.inProgress}</span>
                </button>

                <button
                  className={
                    activeFilter === "ON_HOLD"
                      ? "tl-tab active"
                      : "tl-tab"
                  }
                  onClick={() =>
                    setActiveFilter("ON_HOLD")
                  }
                >
                  <i className="red-dot" />
                  On Hold
                  <span>{metrics.onHold}</span>
                </button>

                <button
                  className={
                    activeFilter === "COMPLETED"
                      ? "tl-tab active"
                      : "tl-tab"
                  }
                  onClick={() =>
                    setActiveFilter("COMPLETED")
                  }
                >
                  <i className="green-dot" />
                  Completed
                  <span>{metrics.completed}</span>
                </button>

              </div>

              <div className="tl-view-switcher">

                <span>Layout:</span>

                <div>

                  <button
                    className={
                      viewMode === "table"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setViewMode("table")
                    }
                  >
                    <LayoutDashboard size={14} />
                    Table
                  </button>

                  <button
                    className={
                      viewMode === "card"
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setViewMode("card")
                    }
                  >
                    <Grid2X2 size={14} />
                    Cards
                  </button>

                </div>

              </div>

            </div>

            <div className="tl-filter-row">

              <div className="tl-search">

                <Search size={17} />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search projects by name, stage, PM, or note"
                />

              </div>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
              >
                <option value="ALL">
                  Project Type: All
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

              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value)
                }
              >
                <option value="ALL">
                </option>
              </select>

              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value)
                }
              >
                <option value="ALL">
                  Project Stage: All
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

                <option value="Closure">
                  Closure
                </option>
              </select>

              <select
                value={pmFilter}
                onChange={(e) =>
                  setPmFilter(e.target.value)
                }
              >
                <option value="ALL">
                  PM Lead: All
                </option>

                {[
                  ...new Set(
                    projects
                      .map((project) => project.pmName)
                      .filter(Boolean)
                  ),
                ].map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}

              </select>

              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value)
                }
              >
                <option value="NEWEST">
                  Sort: Newest First
                </option>

                <option value="OLDEST">
                  Sort: Oldest First
                </option>

                <option value="AGE_HIGH">
                  Sort: Age High
                </option>

                <option value="NAME">
                  Sort: Name
                </option>
              </select>

              <button
                className="tl-filter-button"
                onClick={clearFilters}
                title="Clear filters"
              >
                <SlidersHorizontal size={16} />
              </button>

            </div>

          </section>

          {/* ================= TABLE ================= */}

          {viewMode === "table" && filteredProjects.length > 0 && (

            <section className="tl-table-container">

              <div className="tl-table-scroll">

                <table className="tl-table">

                  <thead>
                    <tr>
                      <th>PROJECT NAME</th>
                      <th>TYPE</th>
                      <th>STAGE</th>
                      <th>STATUS</th>
                      <th>PM LEAD</th>
                      <th>ASSIGNED DATE</th>
                      <th>AGE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredProjects.map((project) => (

                      <tr
                        key={project.id}
                        onClick={() =>
                          openProject(project)
                        }
                      >

                        <td>

                          <div className="tl-project-cell">

                            <div className="tl-project-icon">
                              <Building2 size={16} />
                            </div>

                            <div>

                              <div className="tl-project-name">

                                <span>
                                  {project.name}
                                </span>

                                <small>
                                  {project.id}
                                </small>

                              </div>

                              <p>
                                • {project.updateNote}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td>
                          <span
                            className={getTypeClass(
                              project.type
                            )}
                          >
                            {project.type}
                          </span>
                        </td>

                        <td>
                          <span
                            className={getStageClass(
                              project.stage
                            )}
                          >
                            {project.stage}
                          </span>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              project.status
                            )}
                          >
                            <i />
                            {project.status}
                          </span>
                        </td>

                        <td>

                          <div className="tl-pm-cell">

                            <span
                              className="tl-table-avatar"
                            >
                              {project.pmInitials ||
                                "PM"}
                            </span>

                            <strong>
                              {project.pmName ||
                                "—"}
                            </strong>

                          </div>

                        </td>

                        <td>

                          <div className="tl-date-cell">
                            <Calendar size={14} />
                            {project.assignedDate ||
                              "—"}
                          </div>

                        </td>

                        <td>

                          <span
                            className={getAgeClass(
                              project.ageDays
                            )}
                          >
                            {project.ageDays ?? 0}d
                          </span>

                        </td>

                        <td>

                          <select
                            value={project.status}
                            onChange={(e) => {
                              e.stopPropagation();

                              updateProjectStatus(
                                project.id,
                                e.target.value
                              );
                            }}
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="tl-status-select"
                          >

                            <option>
                              Action Needed
                            </option>

                            <option>
                              In Progress
                            </option>

                            <option>
                              On Hold
                            </option>

                            <option>
                              Completed
                            </option>

                          </select>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <div className="tl-table-footer">

                <span>
                  Showing {filteredProjects.length} of{" "}
                  {projects.length} assigned projects
                </span>

                <div className="tl-pagination">

                  <button disabled>
                    Previous
                  </button>

                  <button className="current">
                    1
                  </button>

                  <button disabled>
                    Next
                  </button>

                </div>

              </div>

            </section>

          )}

          {/* ================= CARDS ================= */}

          {viewMode === "card" &&
            filteredProjects.length > 0 && (

              <section className="tl-card-grid">

                {filteredProjects.map((project) => (

                  <article
                    key={project.id}
                    className="tl-project-card"
                  >

                    <div className="tl-card-header">

                      <div className="tl-card-title">

                        <div className="tl-card-icon">
                          <Building2 size={17} />
                        </div>

                        <div>

                          <h3
                            onClick={() =>
                              openProject(project)
                            }
                          >
                            {project.name}
                          </h3>

                          <small>
                            {project.id}
                          </small>

                        </div>

                      </div>

                      <span
                        className={getStatusClass(
                          project.status
                        )}
                      >
                        <i />
                        {project.status}
                      </span>

                    </div>

                    <p className="tl-card-note">
                      {project.updateNote}
                    </p>

                    <div className="tl-card-info">

                      <div>
                        <small>
                          TYPE & STAGE
                        </small>

                        <div>
                          <span
                            className={getTypeClass(
                              project.type
                            )}
                          >
                            {project.type}
                          </span>

                          <span
                            className={getStageClass(
                              project.stage
                            )}
                          >
                            {project.stage}
                          </span>
                        </div>

                      </div>

                      <div>
                        <small>
                          ASSIGNED PM
                        </small>

                        <div className="tl-pm-cell">

                          <span className="tl-table-avatar">
                            {project.pmInitials ||
                              "PM"}
                          </span>

                          <strong>
                            {project.pmName || "—"}
                          </strong>

                        </div>

                      </div>

                    </div>

                    <div className="tl-card-footer">

                      <span>
                        <Calendar size={14} />

                        {project.assignedDate ||
                          "—"}

                        <b>•</b>

                        <span
                          className={getAgeClass(
                            project.ageDays
                          )}
                        >
                          {project.ageDays ?? 0}d
                        </span>

                      </span>

                      <button
                        onClick={() =>
                          openProject(project)
                        }
                      >
                        Manage
                      </button>

                    </div>

                  </article>

                ))}

              </section>
            )}

          {/* ================= EMPTY ================= */}

          {filteredProjects.length === 0 && (

            <section className="tl-empty">

              <div className="tl-empty-icon">
                <ClipboardCheck size={30} />
              </div>

              <h3>
                No Assigned Projects Found
              </h3>

              <p>
                There are no projects matching the
                current filters.
              </p>

              <button
                onClick={clearFilters}
              >
                Clear All Filters
              </button>

            </section>

          )}

        </div>

      

      {/* ================= DRAWER BACKDROP ================= */}

      {selectedProject && (
        <div
          className="tl-drawer-backdrop"
          onClick={closeProject}
        />
      )}

      {/* ================= PROJECT DRAWER ================= */}

      <aside
        className={`tl-drawer ${
          selectedProject ? "open" : ""
        }`}
      >

        {selectedProject && (

          <>

            <div className="tl-drawer-header">

              <div>

                <span>
                  TEAM LEAD WORKSPACE
                </span>

                <h2>
                  {selectedProject.name}
                </h2>

                <small>
                  {selectedProject.id}
                </small>

              </div>

              <button
                onClick={closeProject}
                className="tl-drawer-close"
              >
                <X size={20} />
              </button>

            </div>

            <div className="tl-drawer-content">

              {/* Project information */}

              <section className="tl-drawer-section">

                <h4>
                  Section 1: Project Information
                </h4>

                <div className="tl-info-grid">

                  <div>
                    <small>PROJECT TYPE</small>
                    <strong>
                      {selectedProject.type ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <small>PROJECT STAGE</small>
                    <strong>
                      {selectedProject.stage ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <small>LOCATION</small>
                    <strong>
                      {selectedProject.location ||
                        "—"}
                    </strong>
                  </div>

                  <div className="full">
                    <small>PROJECT SCOPE</small>
                    <p>
                      {selectedProject.scope ||
                        "Project scope will appear here once supplied by the backend."}
                    </p>
                  </div>

                </div>

              </section>

              {/* Assignment */}

              <section className="tl-drawer-section">

                <h4>
                  Section 2: Assignment Information
                </h4>

                <div className="tl-assignment-box">

                  <div className="tl-drawer-avatar">
                    {selectedProject.pmInitials ||
                      "PM"}
                  </div>

                  <div>

                    <small>
                      SUPERVISING PM
                    </small>

                    <strong>
                      {selectedProject.pmName ||
                        "—"}
                    </strong>

                  </div>

                </div>

                <div className="tl-assignment-details">

                  <div>
                    <small>
                      ASSIGNED DATE
                    </small>

                    <strong>
                      {selectedProject.assignedDate ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      AGE
                    </small>

                    <strong>
                      {selectedProject.ageDays ?? 0}{" "}
                      Days Open
                    </strong>
                  </div>

                </div>

              </section>

              {/* Mail */}

              <section className="tl-drawer-section">

                <h4>
                  Section 3: Originating Project Mail
                </h4>

                <div className="tl-mail-box">

                  <FileText size={18} />

                  <div>

                    <small>
                      MAIL SUBJECT
                    </small>

                    <strong>
                      {selectedProject.updateNote ||
                        "—"}
                    </strong>

                    <span>
                      {selectedProject.assignedDate ||
                        "—"}
                    </span>

                  </div>

                </div>

              </section>

              {/* Timeline */}

              <section className="tl-drawer-section">

                <h4>
                  Section 4: Project Pipeline Timeline
                </h4>

                <div className="tl-timeline">

                  <div className="completed">
                    <span />
                    <div>
                      <strong>
                        Project Assigned
                      </strong>
                      <small>
                        PM assignment received
                      </small>
                    </div>
                  </div>

                  <div className="current">
                    <span />
                    <div>
                      <strong>
                        TL Execution
                      </strong>
                      <small>
                        Current Team Lead stage
                      </small>
                    </div>
                  </div>

                  <div>
                    <span />
                    <div>
                      <strong>
                        Project Completion
                      </strong>
                      <small>
                        Awaiting project progress
                      </small>
                    </div>
                  </div>

                </div>

              </section>

              {/* Notes */}

              <section className="tl-drawer-section">

                <h4>
                  TL Field Log / Notes
                </h4>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Enter field observations, progress notes, site updates..."
                />

                <button
                  className="tl-primary-button"
                  onClick={appendNotes}
                >
                  <FileText size={15} />
                  Append to Field Log
                </button>

              </section>

              {/* Status */}

              <section className="tl-drawer-section">

                <h4>
                  Assignment Status
                </h4>

                <div className="tl-drawer-status">

                  <select
                    value={selectedProject.status}
                    onChange={(e) =>
                      updateProjectStatus(
                        selectedProject.id,
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Action Needed
                    </option>

                    <option>
                      In Progress
                    </option>

                    <option>
                      On Hold
                    </option>

                    <option>
                      Completed
                    </option>
                  </select>

                  <button
                    onClick={() =>
                      showToast(
                        "Assignment Updated",
                        `${selectedProject.name} status changed successfully.`
                      )
                    }
                  >
                    Save
                  </button>

                </div>

              </section>

            </div>

            <div className="tl-drawer-footer">

              <button
                className="secondary"
                onClick={closeProject}
              >
                Close Sheet
              </button>

              <button
                className="primary"
                onClick={generateDpr}
              >
                <FileText size={15} />
                Generate Daily Progress Report
              </button>

            </div>

          </>

        )}

      </aside>

      {/* ================= TOAST ================= */}

      <div
        className={`tl-toast ${
          toast.visible ? "show" : ""
        }`}
      >

        <div className="tl-toast-icon">
          <Check size={15} />
        </div>

        <div>
          <strong>{toast.title}</strong>
          <span>{toast.message}</span>
        </div>

      </div>

    </>
  );
};

export default TLPage;