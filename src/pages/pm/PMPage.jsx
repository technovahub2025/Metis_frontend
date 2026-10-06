import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RotateCcw,
  FolderKanban,
  Mail,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  UserPlus,
  CheckCircle2,
  Clock3,
  PauseCircle,
  AlertTriangle,
  Save,
} from "lucide-react";

import {
  apiRequest,
  getCurrentUser,
} from "../../lib/api";
import { PROJECT_STAGES } from "../../lib/helpers";
import { PMHamburger } from "../../components/pm";
import NotificationBell from "../../components/NotificationBell";

const PMPage = () => {
  /*
   * ============================================================
   * PROJECT DATA
   * ============================================================
   */

  const [projects, setProjects] =
    useState([]);

  const [tlRoster, setTlRoster] =
    useState([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingTLs, setLoadingTLs] =
    useState(true);

  /*
   * ============================================================
   * FILTERS
   * ============================================================
   */

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [stageFilter, setStageFilter] =
    useState("all");

  const [tlFilter, setTlFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("newest");

  /*
   * ============================================================
   * MODALS
   * ============================================================
   */

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [showAssignModal, setShowAssignModal] =
    useState(false);

  /*
   * ============================================================
   * ASSIGNMENT
   * ============================================================
   */

  const [selectedTL, setSelectedTL] =
    useState("");

  const [
    assignmentPriority,
    setAssignmentPriority,
  ] = useState("Normal");

  const [
    delegationNote,
    setDelegationNote,
  ] = useState("");

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const [workingStatus, setWorkingStatus] =
    useState("In Progress");

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  /*
   * ============================================================
   * UI FEEDBACK
   * ============================================================
   */

  const [
    assignmentSuccess,
    setAssignmentSuccess,
  ] = useState(false);

  const [
    statusSaved,
    setStatusSaved,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
   * ============================================================
   * CURRENT USER
   * ============================================================
   */

  const user = useMemo(() => {
    return getCurrentUser();
  }, []);

  /*
   * ============================================================
   * LOAD PM PROJECTS + TL ROSTER
   * ============================================================
   */

  const loadPMData = async () => {
    try {
      setErrorMessage("");

      setLoadingProjects(true);
      setLoadingTLs(true);

      const [
        projectsResponse,
        tlResponse,
      ] = await Promise.all([
        apiRequest(
          "/api/projects?limit=100"
        ),

        apiRequest(
          "/api/users?role=tl&active=true"
        ),
      ]);

      /*
       * ========================================================
       * PROJECT RESPONSE
       * ========================================================
       *
       * Support:
       * { projects: [...] }
       * { data: [...] }
       * [...]
       */

      const projectData =
        Array.isArray(
          projectsResponse?.projects
        )
          ? projectsResponse.projects
          : Array.isArray(
              projectsResponse?.data
            )
            ? projectsResponse.data
            : Array.isArray(
                projectsResponse
              )
              ? projectsResponse
              : [];

      /*
       * ========================================================
       * TL RESPONSE
       * ========================================================
       *
       * IMPORTANT:
       *
       * /api/users returns:
       *
       * {
       *   success: true,
       *   users: [...]
       * }
       *
       * So we MUST read response.users.
       */

      const tlData =
        Array.isArray(
          tlResponse?.users
        )
          ? tlResponse.users
          : Array.isArray(
              tlResponse?.data
            )
            ? tlResponse.data
            : Array.isArray(
                tlResponse
              )
              ? tlResponse
              : [];

      console.log(
        "PM PROJECT RESPONSE:",
        projectsResponse
      );

      console.log(
        "PM TL RESPONSE:",
        tlResponse
      );

      console.log(
        "PM TL ROSTER:",
        tlData
      );

      setProjects(
        projectData
      );

      setTlRoster(
        tlData
      );
    } catch (error) {
      console.error(
        "Failed to load PM workspace:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load PM workspace."
      );
    } finally {
      setLoadingProjects(false);
      setLoadingTLs(false);
    }
  };

  useEffect(() => {
    loadPMData();
  }, []);

  /*
   * ============================================================
   * CALCULATE PROJECT AGE
   * ============================================================
   */

  const calculateAge = (
    mailDate
  ) => {
    if (!mailDate) {
      return null;
    }

    const received =
      new Date(mailDate);

    if (
      Number.isNaN(
        received.getTime()
      )
    ) {
      return null;
    }

    const today =
      new Date();

    const difference =
      today.getTime() -
      received.getTime();

    return Math.max(
      0,
      Math.floor(
        difference /
          (1000 *
            60 *
            60 *
            24)
      )
    );
  };

  /*
   * ============================================================
   * FILTER + SORT PROJECTS
   * ============================================================
   */

  const filteredProjects =
    useMemo(() => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      const result =
        projects.filter(
          (project) => {
            const matchesSearch =
              !searchValue ||
              project.projectName
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||
              project.projectCode
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||
              project.subject
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||
              project.projectType
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||
              project.pmName
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||
              project.tlName
                ?.toLowerCase()
                .includes(
                  searchValue
                );

            const matchesType =
              typeFilter ===
                "all" ||
              project.projectType ===
                typeFilter;

            const matchesStage =
              stageFilter ===
                "all" ||
              project.projectStage ===
                stageFilter;

            const projectTL =
              String(
                project.tlEmail ||
                  project.assignedTL ||
                  ""
              )
                .trim()
                .toLowerCase();

            const filterTL =
              String(
                tlFilter
              )
                .trim()
                .toLowerCase();

            const matchesTL =
              tlFilter === "all"
                ? true
                : tlFilter ===
                    "unassigned"
                  ? !projectTL
                  : tlFilter ===
                      "assigned"
                    ? Boolean(
                        projectTL
                      )
                    : projectTL ===
                      filterTL;

            const matchesStatus =
              statusFilter ===
                "all"
                ? true
                : statusFilter ===
                    "Awaiting TL"
                  ? !projectTL
                  : project.status ===
                    statusFilter;

            return (
              matchesSearch &&
              matchesType &&
              matchesStage &&
              matchesTL &&
              matchesStatus
            );
          }
        );

      return [...result].sort(
        (a, b) => {
          const dateA =
            new Date(
              a.mailDate || 0
            );

          const dateB =
            new Date(
              b.mailDate || 0
            );

          if (
            sortBy ===
            "newest"
          ) {
            return (
              dateB - dateA
            );
          }

          if (
            sortBy ===
            "oldest"
          ) {
            return (
              dateA - dateB
            );
          }

          if (
            sortBy ===
            "lowest-age"
          ) {
            return (
              (calculateAge(
                a.mailDate
              ) || 0) -
              (calculateAge(
                b.mailDate
              ) || 0)
            );
          }

          if (
            sortBy ===
            "highest-age"
          ) {
            return (
              (calculateAge(
                b.mailDate
              ) || 0) -
              (calculateAge(
                a.mailDate
              ) || 0)
            );
          }

          if (
            sortBy ===
            "project-name"
          ) {
            return (
              a.projectName ||
              ""
            ).localeCompare(
              b.projectName ||
                ""
            );
          }

          return 0;
        }
      );
    }, [
      projects,
      search,
      typeFilter,
      stageFilter,
      tlFilter,
      statusFilter,
      sortBy,
    ]);

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProjects.length /
          pageSize
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedProjects =
    filteredProjects.slice(
      (safeCurrentPage - 1) *
        pageSize,
      safeCurrentPage *
        pageSize
    );

  /*
   * ============================================================
   * DASHBOARD STATISTICS
   * ============================================================
   */

  const statistics =
    useMemo(() => {
      return {
        total:
          projects.length,

        awaitingTL:
          projects.filter(
            (project) =>
              !project.tlEmail &&
              !project.assignedTL
          ).length,

        inProgress:
          projects.filter(
            (project) =>
              project.status ===
              "In Progress"
          ).length,

        onHold:
          projects.filter(
            (project) =>
              project.status ===
              "On Hold"
          ).length,

        completed:
          projects.filter(
            (project) =>
              project.status ===
              "Completed"
          ).length,
      };
    }, [projects]);

  /*
   * ============================================================
   * RESET FILTERS
   * ============================================================
   */

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStageFilter("all");
    setTlFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  /*
   * ============================================================
   * OPEN DETAILS
   * ============================================================
   */

  const openDetails = (
    project
  ) => {
    setSelectedProject(
      project
    );

    setWorkingStatus(
      project.status &&
      ["In Progress", "In Review", "On Hold", "Completed"].includes(project.status)
        ? project.status
        : "In Progress"
    );

    setStatusSaved(false);
    setErrorMessage("");

    setShowDetailsModal(
      true
    );
   };

  /*
   * ============================================================
   * HANDLE NOTIFICATION CLICK — open project details
   * ============================================================
   */

   const handleNotificationProjectClick = (
     projectId
   ) => {
     const project =
       projects.find(
         (p) =>
           String(p.id) ===
           String(projectId) ||
           String(p._id) ===
             String(projectId)
       );

     if (project) {
       openDetails(project);
     }
   };

  /*
   * ============================================================
   * OPEN TL ASSIGNMENT
   * ============================================================
   */

  const openAssignment = (
    project
  ) => {
    setSelectedProject(
      project
    );

    setSelectedTL(
      project.tlEmail ||
        project.assignedTL ||
        ""
    );

    setAssignmentPriority(
      project.assignmentPriority ||
        "Normal"
    );

    setDelegationNote(
      project.delegationNote ||
        ""
    );

    setAssignmentSuccess(
      false
    );

    setErrorMessage("");

    setShowAssignModal(
      true
    );
  };

  /*
   * ============================================================
   * ASSIGN TL
   * ============================================================
   */

  const handleAssignTL =
    async () => {
      if (
        !selectedProject ||
        !selectedTL
      ) {
        return;
      }

      try {
        setErrorMessage("");

        const selectedTLUser =
          tlRoster.find(
            (tl) =>
              String(
                tl.email || ""
              )
                .trim()
                .toLowerCase() ===
              String(
                selectedTL
              )
                .trim()
                .toLowerCase()
          );

        if (
          !selectedTLUser
        ) {
          throw new Error(
            "Selected Team Lead was not found in the active TL roster."
          );
        }

        const response =
          await apiRequest(
            `/api/projects/${selectedProject.id}/assign-tl`,
            {
              method: "PUT",

              body: {
                tlEmail:
                  selectedTLUser.email,

                tlName:
                  selectedTLUser.name,

                assignmentPriority,

                delegationNote,
              },
            }
          );

        const updated =
          response?.project ||
          response?.data ||
          response;

        if (!updated?.id) {
          throw new Error(
            "Invalid project response received."
          );
        }

        setProjects(
          (previous) =>
            previous.map(
              (project) =>
                project.id ===
                updated.id
                  ? updated
                  : project
            )
        );

        setSelectedProject(
          updated
        );

        setAssignmentSuccess(
          true
        );

        /*
         * Keep the modal open so the PM can
         * see the successful assignment.
         */
      } catch (error) {
        console.error(
          "Assign TL error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to assign Team Lead."
        );
      }
    };

  /*
   * ============================================================
   * SAVE WORKING STATUS
   * ============================================================
   */

  const handleSaveStatus =
    async () => {
      if (
        !selectedProject
      ) {
        return;
      }

      try {
        setErrorMessage("");
        setStatusSaved(false);
        setSavingStatus(true);

        const response =
          await apiRequest(
            `/api/projects/${selectedProject.id}`,
            {
              method: "PUT",

              body: {
                status:
                  workingStatus,
              },
            }
          );

        const updated =
          response?.project ||
          response?.data ||
          response;

        if (!updated?.id) {
          throw new Error(
            "Invalid project response received."
          );
        }

        setProjects(
          (previous) =>
            previous.map(
              (project) =>
                project.id ===
                updated.id
                  ? updated
                  : project
            )
        );

        setSelectedProject(
          updated
        );

        setStatusSaved(
          true
        );
      } catch (error) {
        console.error(
          "Save status error:",
          error
        );

         setErrorMessage(
          error.message ||
            "Unable to save project status."
        );
      } finally {
        setSavingStatus(false);
      }
    };

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const handleRefresh =
    async () => {
      await loadPMData();
    };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* ========================================================
          TOPBAR
          ======================================================== */}

      <header className="metis-pm-topbar">
        <PMHamburger />

        <div className="tl-header-number">
          PM
        </div>

        <h1>
          PROJECT MANAGER WORKSPACE
        </h1>

        <div className="metis-pm-top-actions">
          <div className="metis-pm-search">
            <Search />

            <input
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
              placeholder="Search projects..."
            />
          </div>

          <button
            type="button"
            className="metis-pm-icon-button"
            onClick={
              handleRefresh
            }
            title="Refresh"
          >
            <RotateCcw />
          </button>

          <NotificationBell
            onProjectClick={
              handleNotificationProjectClick
            }
          />
        </div>
      </header>

      <div className="metis-pm-content">
        {/* ======================================================
            ERROR
            ====================================================== */}

        {errorMessage && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "12px 16px",
              border:
                "1px solid #fecaca",
              background:
                "#fef2f2",
              color:
                "#991b1b",
              borderRadius:
                "8px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "12px",
            }}
          >
            <span>
              {errorMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setErrorMessage(
                  ""
                )
              }
              style={{
                border: "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ======================================================
            STATS
            ====================================================== */}

        <section className="metis-pm-stats">
          <div className="metis-pm-stat-card">
            <div className="metis-pm-stat-heading">
              <span>
                Total Assigned
              </span>

              <div className="metis-pm-stat-icon blue">
                <FolderKanban />
              </div>
            </div>

            <strong>
              {statistics.total}
            </strong>

            <small>
              Under PM Supervision
            </small>
          </div>

          <div className="metis-pm-stat-card warning">
            <div className="metis-pm-stat-heading">
              <span>
                Awaiting TL
              </span>

              <div className="metis-pm-stat-icon amber">
                <UserPlus />
              </div>
            </div>

            <strong>
              {
                statistics.awaitingTL
              }
            </strong>

            <small>
              Action Needed
            </small>
          </div>

          <div className="metis-pm-stat-card">
            <div className="metis-pm-stat-heading">
              <span>
                In Progress
              </span>

              <div className="metis-pm-stat-icon green">
                <Clock3 />
              </div>
            </div>

            <strong>
              {
                statistics.inProgress
              }
            </strong>

            <small>
              Active On-Site
            </small>
          </div>

          <div className="metis-pm-stat-card">
            <div className="metis-pm-stat-heading">
              <span>
                On Hold
              </span>

              <div className="metis-pm-stat-icon red">
                <PauseCircle />
              </div>
            </div>

            <strong>
              {statistics.onHold}
            </strong>

            <small>
              Requires Revision
            </small>
          </div>

          <div className="metis-pm-stat-card">
            <div className="metis-pm-stat-heading">
              <span>
                Completed
              </span>

              <div className="metis-pm-stat-icon purple">
                <CheckCircle2 />
              </div>
            </div>

            <strong>
              {
                statistics.completed
              }
            </strong>

            <small>
              Handover Done
            </small>
          </div>
        </section>

        {/* ======================================================
            PROJECT PANEL
            ====================================================== */}

        <section className="metis-pm-project-panel">
          <div className="metis-pm-panel-top">
            <div className="metis-pm-panel-title">
              <span />

              <div>
                <h2>
                  My Projects
                </h2>

                <p>
                  Projects assigned to you by
                  Admin
                </p>
              </div>
            </div>

            <div className="metis-pm-status-tabs">
              <button
                type="button"
                className={
                  statusFilter ===
                  "all"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setStatusFilter(
                    "all"
                  );
                  setCurrentPage(
                    1
                  );
                }}
              >
                All{" "}
                <span>
                  {
                    statistics.total
                  }
                </span>
              </button>

              <button
                type="button"
                className={
                  statusFilter ===
                  "Awaiting TL"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setStatusFilter(
                    "Awaiting TL"
                  );
                  setCurrentPage(
                    1
                  );
                }}
              >
                Awaiting TL{" "}
                <span>
                  {
                    statistics.awaitingTL
                  }
                </span>
              </button>

              <button
                type="button"
                className={
                  statusFilter ===
                  "In Progress"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setStatusFilter(
                    "In Progress"
                  );
                  setCurrentPage(
                    1
                  );
                }}
              >
                In Progress{" "}
                <span>
                  {
                    statistics.inProgress
                  }
                </span>
              </button>

              <button
                type="button"
                className={
                  statusFilter ===
                  "On Hold"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setStatusFilter(
                    "On Hold"
                  );
                  setCurrentPage(
                    1
                  );
                }}
              >
                On Hold{" "}
                <span>
                  {
                    statistics.onHold
                  }
                </span>
              </button>

              <button
                type="button"
                className={
                  statusFilter ===
                  "Completed"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setStatusFilter(
                    "Completed"
                  );
                  setCurrentPage(
                    1
                  );
                }}
              >
                Completed{" "}
                <span>
                  {
                    statistics.completed
                  }
                </span>
              </button>
            </div>
          </div>

          {/* FILTERS */}

          <div className="metis-pm-filters">
            <div className="metis-pm-filter-search">
              <Search />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );
                  setCurrentPage(
                    1
                  );
                }}
                placeholder="Search project name, subject, reference..."
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(
                  e.target.value
                );
                setCurrentPage(
                  1
                );
              }}
            >
              <option value="all">
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

              <option value="PMC">
                PMC
              </option>
            </select>

            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(
                  e.target.value
                );
                setCurrentPage(
                  1
                );
              }}
            >
              <option value="all">
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
              value={tlFilter}
              onChange={(e) => {
                setTlFilter(
                  e.target.value
                );
                setCurrentPage(
                  1
                );
              }}
            >
              <option value="all">
                TL Delegation: All
              </option>

              <option value="assigned">
                Assigned TL
              </option>

              <option value="unassigned">
                Unassigned
              </option>

              {tlRoster.map(
                (tl) => (
                  <option
                    key={
                      tl.id ||
                      tl._id ||
                      tl.email
                    }
                    value={
                      tl.email
                    }
                  >
                    {tl.name}
                  </option>
                )
              )}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(
                  e.target.value
                );
                setCurrentPage(
                  1
                );
              }}
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest Correspondence
              </option>

              <option value="highest-age">
                Highest Age
              </option>

              <option value="lowest-age">
                Lowest Age
              </option>

              <option value="project-name">
                Project Name
              </option>
            </select>

            <button
              type="button"
              className="metis-pm-reset"
              onClick={
                resetFilters
              }
            >
              Reset
            </button>
          </div>

          {/* TABLE */}

          <div className="metis-pm-table-wrapper">
            <table className="metis-pm-table">
              <thead>
                <tr>
                  <th>
                    Project Name
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Stage
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Mail Date
                  </th>

                  <th>
                    Age (Days)
                  </th>

                  <th>
                    PM Lead
                  </th>

                  <th>
                    Assigned TL
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingProjects ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="metis-pm-empty"
                    >
                      <FolderKanban />

                      <strong>
                        Loading Projects
                      </strong>

                      <span>
                        Loading projects assigned
                        to you...
                      </span>
                    </td>
                  </tr>
                ) : paginatedProjects.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="metis-pm-empty"
                    >
                      <FolderKanban />

                      <strong>
                        No Projects Found
                      </strong>

                      <span>
                        No construction projects
                        match your active search
                        terms or filters.
                      </span>

                      <button
                        type="button"
                        onClick={
                          resetFilters
                        }
                      >
                        Clear All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map(
                    (project) => {
                      const age =
                        project.ageDays ??
                        calculateAge(
                          project.mailDate
                        );

                      return (
                        <tr
                          key={
                            project.id ||
                            project._id
                          }
                        >
                          <td>
                            <div className="metis-pm-project-name">
                              <strong>
                                {
                                  project.projectName
                                }
                              </strong>

                              <small>
                                {
                                  project.projectCode
                                }

                                {project.subject
                                  ? ` • ${project.subject}`
                                  : ""}
                              </small>
                            </div>
                          </td>

                          <td>
                            <span className="metis-pm-type">
                              {
                                project.projectType ||
                                "—"
                              }
                            </span>
                          </td>

                          <td>
                            <span className="metis-pm-stage">
                              {
                                project.projectStage ||
                                "—"
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={`metis-pm-status ${(
                                project.status ||
                                ""
                              )
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              <span />

                              {
                                project.status ||
                                "Awaiting TL"
                              }
                            </span>
                          </td>

                          <td>
                            {project.mailDate
                              ? new Date(
                                  project.mailDate
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "—"}
                          </td>

                          <td>
                            <span className="metis-pm-age">
                              {age ??
                                "—"}
                            </span>
                          </td>

                          <td>
                            <span className="metis-pm-lead">
                              {
                                project.pmName ||
                                user?.name ||
                                "—"
                              }
                            </span>
                          </td>

                          <td>
                            {project.tlName ||
                            project.assignedTL ? (
                              <span className="metis-pm-tl-chip">
                                {
                                  project.tlName ||
                                  project.assignedTL
                                }
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="metis-pm-assign-inline"
                                onClick={() =>
                                  openAssignment(
                                    project
                                  )
                                }
                              >
                                <UserPlus />
                                Select TL
                              </button>
                            )}
                          </td>

                          <td>
                            <div className="metis-pm-actions">
                              <button
                                type="button"
                                className="metis-pm-review-button"
                                onClick={() =>
                                  openDetails(
                                    project
                                  )
                                }
                              >
                                <Eye />
                                Review
                              </button>

                              {!project.tlEmail &&
                                !project.assignedTL && (
                                  <button
                                    type="button"
                                    className="metis-pm-small-assign"
                                    onClick={() =>
                                      openAssignment(
                                        project
                                      )
                                    }
                                  >
                                    Assign
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="metis-pm-pagination">
            <span>
              Showing{" "}
              {filteredProjects.length ===
              0
                ? 0
                : (safeCurrentPage -
                    1) *
                    pageSize +
                  1}{" "}
              to{" "}
              {Math.min(
                safeCurrentPage *
                  pageSize,
                filteredProjects.length
              )}{" "}
              of{" "}
              {
                filteredProjects.length
              }{" "}
              projects
            </span>

            <div>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(
                    Number(
                      e.target.value
                    )
                  );

                  setCurrentPage(
                    1
                  );
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
                type="button"
                disabled={
                  safeCurrentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
              >
                <ChevronLeft />
                Previous
              </button>

              <span className="metis-pm-page-number">
                {
                  safeCurrentPage
                }
              </span>

              <button
                type="button"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
              >
                Next
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================
          ASSIGN TL MODAL
          ======================================================== */}

      {showAssignModal &&
        selectedProject && (
          <div
            className="metis-pm-modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowAssignModal(
                  false
                );
              }
            }}
          >
            <div className="metis-pm-assign-modal">
              <div className="metis-pm-modal-header">
                <div>
                  <span>
                    Step 3 of PM Workflow
                    Delegation
                  </span>

                  <h2>
                    Assign Team Lead (TL)
                  </h2>

                  <p>
                    Delegate this project for
                    technical execution.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAssignModal(
                      false
                    )
                  }
                >
                  <X />
                </button>
              </div>

              <div className="metis-pm-target-project">
                <div>
                  <small>
                    Target Project
                  </small>

                  <strong>
                    {
                      selectedProject.projectCode ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <small>
                    Project Name
                  </small>

                  <strong>
                    {
                      selectedProject.projectName
                    }
                  </strong>
                </div>

                <div>
                  <small>
                    Type
                  </small>

                  <strong>
                    {
                      selectedProject.projectType ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <small>
                    Stage
                  </small>

                  <strong>
                    {
                      selectedProject.projectStage ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <small>
                    Age
                  </small>

                  <strong>
                    {calculateAge(
                      selectedProject.mailDate
                    ) ?? "—"}{" "}
                    days
                  </strong>
                </div>

                <div>
                  <small>
                    Status
                  </small>

                  <strong>
                    {
                      selectedProject.status ||
                      "—"
                    }
                  </strong>
                </div>
              </div>

              <div className="metis-pm-modal-body">
                <div className="metis-pm-form-field">
                  <label>
                    Select Available Team Lead

                    <span>
                      ●{" "}
                      {
                        tlRoster.length
                      }{" "}
                      Active Roster Leads
                    </span>
                  </label>

                  {loadingTLs ? (
                    <div className="metis-pm-no-tl">
                      <Users />

                      <strong>
                        Loading Team Leads
                      </strong>

                      <span>
                        Loading the available TL
                        roster...
                      </span>
                    </div>
                  ) : tlRoster.length ===
                    0 ? (
                    <div className="metis-pm-no-tl">
                      <Users />

                      <strong>
                        No Team Leads available
                      </strong>

                      <span>
                        No active TLs are currently
                        available.
                      </span>
                    </div>
                  ) : (
                    <select
                      value={
                        selectedTL
                      }
                      onChange={(e) =>
                        setSelectedTL(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select a Team Lead
                      </option>

                      {tlRoster.map(
                        (tl) => (
                          <option
                            key={
                              tl.id ||
                              tl._id ||
                              tl.email
                            }
                            value={
                              tl.email
                            }
                          >
                            {
                              tl.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  )}
                </div>

                <div className="metis-pm-form-field">
                  <label>
                    Assignment Priority
                  </label>

                  <div className="metis-pm-priority">
                    {[
                      "Normal",
                      "Urgent",
                      "Critical",
                    ].map(
                      (priority) => (
                        <button
                          key={
                            priority
                          }
                          type="button"
                          className={
                            assignmentPriority ===
                            priority
                              ? `active ${priority.toLowerCase()}`
                              : ""
                          }
                          onClick={() =>
                            setAssignmentPriority(
                              priority
                            )
                          }
                        >
                          <span />

                          {
                            priority
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="metis-pm-form-field">
                  <label>
                    Delegation Instructions &
                    Context{" "}
                    <span>
                      Optional
                    </span>
                  </label>

                  <textarea
                    rows="4"
                    value={
                      delegationNote
                    }
                    onChange={(e) =>
                      setDelegationNote(
                        e.target.value
                      )
                    }
                    placeholder="Add instructions, priorities, constraints, or context for the Team Lead..."
                  />
                </div>

                {assignmentSuccess && (
                  <div className="metis-pm-success-message">
                    <CheckCircle2 />

                    <div>
                      <strong>
                        Assignment Complete
                      </strong>

                      <span>
                        Team Lead has been
                        successfully assigned.
                      </span>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div
                    style={{
                      marginTop:
                        "12px",
                      color:
                        "#991b1b",
                    }}
                  >
                    {
                      errorMessage
                    }
                  </div>
                )}
              </div>

              <div className="metis-pm-modal-actions">
                <button
                  type="button"
                  className="metis-pm-secondary-button"
                  onClick={() =>
                    setShowAssignModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="metis-pm-primary-button"
                  disabled={
                    !selectedTL ||
                    loadingTLs ||
                    tlRoster.length ===
                      0
                  }
                  onClick={
                    handleAssignTL
                  }
                >
                  <UserPlus />
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ========================================================
          DETAILS MODAL
          ======================================================== */}

      {showDetailsModal &&
        selectedProject && (
          <div
            className="metis-pm-modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowDetailsModal(
                  false
                );
              }
            }}
          >
            <div className="metis-pm-details-modal">
              <div className="metis-pm-modal-header">
                <div>
                  <span>
                    {
                      selectedProject.projectCode ||
                      "PROJECT"
                    }
                  </span>

                  <h2>
                    {
                      selectedProject.projectName
                    }
                  </h2>

                  <p>
                    {
                      selectedProject.projectType ||
                      "Project"
                    }{" "}
                    •{" "}
                    {
                      selectedProject.projectStage ||
                      "—"
                    }{" "}
                    Stage • PM:{" "}
                    {
                      selectedProject.pmName ||
                      user?.name ||
                      "—"
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetailsModal(
                      false
                    )
                  }
                >
                  <X />
                </button>
              </div>

              <div className="metis-pm-details-body">
                <section className="metis-pm-detail-section">
                  <h3>
                    Project Status
                  </h3>

                  <div className="metis-pm-status-editor">
                    <label>
                      Change Working Status:
                    </label>

                    <select
                      value={
                        workingStatus
                      }
                      onChange={(e) =>
                        setWorkingStatus(
                          e.target.value
                        )
                      }
                    >
                      <option value="In Progress">
                        In Progress (Active Work)
                      </option>

                      <option value="In Review">
                        In Review (Under PM Review)
                      </option>

                      <option value="On Hold">
                        On Hold (Pending
                        Clarifications)
                      </option>

                      <option value="Completed">
                        Completed (Final
                        Sign-off)
                      </option>
                    </select>
                  </div>
                </section>

                <section className="metis-pm-detail-section">
                  <div className="metis-pm-detail-heading">
                    <h3>
                      Assigned Team Lead (TL)
                    </h3>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailsModal(
                          false
                        );

                        openAssignment(
                          selectedProject
                        );
                      }}
                    >
                      <UserPlus />

                      Assign or Change Team
                      Lead
                    </button>
                  </div>

                  {selectedProject.tlName ||
                  selectedProject.assignedTL ? (
                    <div className="metis-pm-assigned-person">
                      <div className="metis-pm-person-avatar">
                        {(
                          selectedProject.tlName ||
                          selectedProject.assignedTL ||
                          "TL"
                        )
                          .slice(
                            0,
                            1
                          )
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {
                            selectedProject.tlName ||
                            selectedProject.assignedTL
                          }
                        </strong>

                        <span>
                          Team Lead • Assigned
                        </span>
                      </div>

                      <CheckCircle2 />
                    </div>
                  ) : (
                    <div className="metis-pm-unassigned">
                      <AlertTriangle />

                      <span>
                        No Team Lead assigned.
                        Assignment is required
                        before execution.
                      </span>
                    </div>
                  )}
                </section>

                <section className="metis-pm-detail-section">
                  <h3>
                    <Mail />

                    Project Mail Details
                    (From Admin)
                  </h3>

                  <div className="metis-pm-mail-details">
                    <div>
                      <label>
                        Subject
                      </label>

                      <strong>
                        {
                          selectedProject.subject ||
                          "—"
                        }
                      </strong>
                    </div>

                    <div>
                      <label>
                        Mail Date
                      </label>

                      <strong>
                        {selectedProject.mailDate
                          ? new Date(
                              selectedProject.mailDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Start Date
                      </label>

                      <strong>
                        {selectedProject.startDate
                          ? new Date(
                              selectedProject.startDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Email Stage
                      </label>

                      <strong>
                        {
                          selectedProject.emailStage ||
                          "—"
                        }
                      </strong>
                    </div>

                    <div>
                      <label>
                        Calculated Age
                      </label>

                      <strong>
                        {calculateAge(
                          selectedProject.mailDate
                        ) ?? "—"}{" "}
                        days old
                      </strong>
                    </div>

                    <div className="full">
                      <label>
                        Project Scope
                      </label>

                      <p>
                        {
                          selectedProject.scope ||
                          "No project scope available."
                        }
                      </p>
                    </div>
                  </div>
                </section>

                <section className="metis-pm-detail-section">
                  <h3>
                    <Clock3 />

                    METIS Workflow Trail
                  </h3>

                  <div className="metis-pm-timeline">
                    <div>
                      <span />

                      <div>
                        <strong>
                          Project Created
                        </strong>

                        <small>
                          Admin manually entered the
                          project information.
                        </small>
                      </div>
                    </div>

                    <div>
                      <span />

                      <div>
                        <strong>
                          Admin Assigned to PM
                        </strong>

                        <small>
                          Project assigned to{" "}
                          {selectedProject.pmName ||
                            user?.name ||
                            "PM"}{" "}
                          for technical review.
                        </small>
                      </div>
                    </div>

                    <div
                      className={
                        selectedProject.tlEmail ||
                        selectedProject.assignedTL
                          ? "complete"
                          : "pending"
                      }
                    >
                      <span />

                      <div>
                        <strong>
                          {selectedProject.tlName ||
                          selectedProject.assignedTL
                            ? `Assigned to ${
                                selectedProject.tlName ||
                                selectedProject.assignedTL
                              }`
                            : "Awaiting TL Assignment"}
                        </strong>

                        <small>
                          {selectedProject.tlEmail ||
                          selectedProject.assignedTL
                            ? `Priority: ${
                                selectedProject.assignmentPriority ||
                                "Normal"
                              }`
                            : "PM action required before execution."}
                        </small>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="metis-pm-modal-actions">
                <button
                  type="button"
                  className="metis-pm-secondary-button"
                  onClick={() =>
                    setShowDetailsModal(
                      false
                    )
                  }
                >
                  Close Details
                </button>

                <button
                  type="button"
                  className="metis-pm-primary-button"
                  disabled={savingStatus}
                  onClick={
                    handleSaveStatus
                  }
                >
                  <Save />

                  {savingStatus
                    ? "Saving..."
                    : "Save Status Changes"}
                </button>
              </div>

              {statusSaved && (
                <div className="metis-pm-status-saved">
                  <CheckCircle2 />

                  Status changes saved.
                </div>
              )}

              {errorMessage && (
                <div
                  style={{
                    padding:
                      "10px 16px",
                    color:
                      "#991b1b",
                  }}
                >
                  {
                    errorMessage
                  }
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
};

export default PMPage;