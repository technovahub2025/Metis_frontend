import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Mail,
  Building2,
  Search,
  RefreshCw,
  Bell,
  CalendarDays,
  Tag,
  Clock3,
  ArrowLeft,
} from "lucide-react";

import { apiRequest } from "../../lib/api";
import { PMHamburger } from "../../components/pm";

const PMProjectMailPage = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/api/projects?limit=100"
      );

      setProjects(
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
      );
    } catch (err) {
      console.error(
        "Failed to load project mail:",
        err
      );

      setError(
        err?.message ||
          "Unable to load project mail information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return projects;
    }

    return projects.filter((project) =>
      [
        project.subject,
        project.projectName,
        project.projectCode,
        project.projectType,
        project.emailStage,
        project.projectStage,
        project.status,
        project.location,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        )
    );
  }, [projects, search]);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAge = (value) => {
    if (!value) {
      return 0;
    }

    const received = new Date(value);

    if (Number.isNaN(received.getTime())) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(
        (Date.now() - received.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  return (
    <div className="metis-pm-page">
      <main className="metis-pm-main">
        {/* ==================================================
            TOPBAR
            ================================================== */}

        <header className="metis-pm-topbar">
          <div className="metis-pm-topbar-left">
            <PMHamburger />

            <button
              type="button"
              className="metis-pm-back-button"
              onClick={() => navigate("/pm")}
              title="Back to My Projects"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <h1>PROJECT MAIL</h1>
              <span>
                Project Manager Workspace
              </span>
            </div>
          </div>

          <div className="metis-pm-topbar-actions">
            <button
              type="button"
              className="metis-pm-icon-button"
              onClick={loadProjects}
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "metis-pm-spin"
                    : ""
                }
              />
            </button>

            <button
              type="button"
              className="metis-pm-icon-button"
              title="Notifications"
            >
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* ==================================================
            CONTENT
            ================================================== */}

        <section className="metis-pm-content">
          <div className="metis-pm-page-heading">
            <div>
              <h2>Project Mail</h2>

              <p>
                Review project mail information
                entered by the Admin.
              </p>
            </div>

            <div className="metis-pm-page-heading-actions">
              <div className="metis-pm-search">
                <Search size={15} />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search project mail..."
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              STATS
              ================================================== */}

          <div className="metis-pm-stats">
            <div className="metis-pm-stat-card">
              <div className="metis-pm-stat-heading">
                <span>Total Mail</span>

                <div className="metis-pm-stat-icon blue">
                  <Mail size={18} />
                </div>
              </div>

              <strong>
                {projects.length}
              </strong>

              <small>
                Project records entered by Admin
              </small>
            </div>

            <div className="metis-pm-stat-card">
              <div className="metis-pm-stat-heading">
                <span>Showing</span>

                <div className="metis-pm-stat-icon amber">
                  <FolderKanban size={18} />
                </div>
              </div>

              <strong>
                {filteredProjects.length}
              </strong>

              <small>
                Matching project records
              </small>
            </div>
          </div>

          {/* ==================================================
              ERROR
              ================================================== */}

          {error && (
            <div className="metis-pm-alert error">
              {error}
            </div>
          )}

          {/* ==================================================
              MAIL LIST
              ================================================== */}

          <div className="metis-pm-panel">
            <div className="metis-pm-panel-header">
              <div>
                <h3>
                  Project Mail Records
                </h3>

                <p>
                  Project information received
                  from Admin entries.
                </p>
              </div>

              <span className="metis-pm-count-badge">
                {filteredProjects.length}
              </span>
            </div>

            {loading ? (
              <div className="metis-pm-empty">
                <RefreshCw
                  size={24}
                  className="metis-pm-spin"
                />

                <h3>
                  Loading project mail...
                </h3>

                <p>
                  Fetching project information.
                </p>
              </div>
            ) : filteredProjects.length ===
              0 ? (
              <div className="metis-pm-empty">
                <Mail size={38} />

                <h3>
                  {search
                    ? "No matching project mail"
                    : "No project mail yet"}
                </h3>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Mail records will appear here from projects created by the Admin."}
                </p>
              </div>
            ) : (
              <div className="metis-pm-mail-list">
                {filteredProjects.map(
                  (project) => (
                    <article
                      key={
                        project.id ||
                        project._id ||
                        project.projectCode ||
                        project.projectName
                      }
                      className="metis-pm-mail-card"
                    >
                      <div className="metis-pm-mail-card-icon">
                        <Mail size={19} />
                      </div>

                      <div className="metis-pm-mail-card-main">
                        <div className="metis-pm-mail-card-top">
                          <div>
                            <h4>
                              {project.subject ||
                                "Project Mail"}
                            </h4>

                            <span>
                              {project.projectName ||
                                "Unnamed Project"}
                            </span>
                          </div>

                          <span className="metis-pm-status">
                            {project.emailStage ||
                              project.status ||
                              "Received"}
                          </span>
                        </div>

                        <div className="metis-pm-mail-meta">
                          <span>
                            <Building2
                              size={14}
                            />

                            {project.projectType ||
                              "—"}
                          </span>

                          <span>
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              project.mailDate
                            )}
                          </span>

                          <span>
                            <Clock3
                              size={14}
                            />

                            Age{" "}
                            {getAge(
                              project.mailDate
                            )}{" "}
                            days
                          </span>

                          <span>
                            <Tag size={14} />

                            {project.projectStage ||
                              "—"}
                          </span>
                        </div>

                        {project.location && (
                          <p className="metis-pm-mail-location">
                            {project.location}
                          </p>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            FOOTER
            ================================================== */}

        <footer className="metis-pm-footer">
          <span>
            METIS Construction Project Management
          </span>

          <span>
            Project Mail Workspace
          </span>
        </footer>
      </main>
    </div>
  );
};

export default PMProjectMailPage;