import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Search,
  RefreshCw,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import {
  apiRequest,
  getCurrentUser,
  clearAuth,
} from "../../lib/api";

import { PMHamburger } from "../../components/pm";

const PMTeamRosterPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/api/users?limit=100"
      );

      setUsers(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load team roster:",
        err
      );

      setError(
        err?.message ||
          "Unable to load team roster."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const teamMembers = useMemo(() => {
    const value = search.trim().toLowerCase();

    let list = users.filter(
      (user) =>
        user.role === "pm" ||
        user.role === "tl"
    );

    if (!value) {
      return list;
    }

    return list.filter((user) =>
      [
        user.name,
        user.email,
        user.role,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        )
    );
  }, [users, search]);

  const pmCount = users.filter(
    (user) => user.role === "pm"
  ).length;

  const tlCount = users.filter(
    (user) => user.role === "tl"
  ).length;

  const activeCount = users.filter(
    (user) =>
      (user.role === "pm" ||
        user.role === "tl") &&
      user.active !== false
  ).length;

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const getInitials = (name, email) => {
    const source =
      name ||
      email ||
      "User";

    const parts = String(source)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return String(source)
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (role) => {
    if (role === "pm") {
      return "Project Manager";
    }

    if (role === "tl") {
      return "Team Lead";
    }

    return role || "User";
  };

  return (
    <div className="metis-pm-page">
      <main className="metis-pm-main">
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
              <h1>TEAM ROSTER</h1>

              <span>
                Project Manager Workspace
              </span>
            </div>
          </div>

          <div className="metis-pm-topbar-actions">
            <button
              type="button"
              className="metis-pm-icon-button"
              onClick={loadUsers}
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
          </div>
        </header>

        <section className="metis-pm-content">
          <div className="metis-pm-page-heading">
            <div>
              <h2>Team Roster</h2>

              <p>
                View the Project Managers and Team Leads
                available within METIS.
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
                  placeholder="Search by name or email..."
                />
              </div>
            </div>
          </div>

          <div className="metis-pm-stats">
            <div className="metis-pm-stat-card">
              <div className="metis-pm-stat-heading">
                <span>Team Members</span>

                <div className="metis-pm-stat-icon green">
                  <Users size={18} />
                </div>
              </div>

              <strong>{activeCount}</strong>

              <small>
                Active PMs and TLs
              </small>
            </div>

            <div className="metis-pm-stat-card">
              <div className="metis-pm-stat-heading">
                <span>Project Managers</span>

                <div className="metis-pm-stat-icon blue">
                  <UserRound size={18} />
                </div>
              </div>

              <strong>{pmCount}</strong>

              <small>
                PM role users
              </small>
            </div>

            <div className="metis-pm-stat-card">
              <div className="metis-pm-stat-heading">
                <span>Team Leads</span>

                <div className="metis-pm-stat-icon purple">
                  <Users size={18} />
                </div>
              </div>

              <strong>{tlCount}</strong>

              <small>
                TL role users
              </small>
            </div>
          </div>

          {error && (
            <div className="metis-pm-alert error">
              {error}
            </div>
          )}

          <div className="metis-pm-panel">
            <div className="metis-pm-panel-header">
              <div>
                <h3>Team Members</h3>

                <p>
                  Personnel available for project
                  coordination and delegation.
                </p>
              </div>

              <span className="metis-pm-count-badge">
                {teamMembers.length}
              </span>
            </div>

            {loading ? (
              <div className="metis-pm-empty">
                <RefreshCw
                  size={24}
                  className="metis-pm-spin"
                />

                <h3>
                  Loading team roster...
                </h3>

                <p>
                  Fetching PM and TL accounts.
                </p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="metis-pm-empty">
                <Users size={38} />

                <h3>
                  {search
                    ? "No matching team members"
                    : "No team members found"}
                </h3>

                <p>
                  {search
                    ? "Try a different name or email."
                    : "PM and TL users will appear here when available."}
                </p>
              </div>
            ) : (
              <div className="metis-pm-roster-list">
                {teamMembers.map((user) => {
                  const isActive =
                    user.active !== false;

                  return (
                    <article
                      key={
                        user.id ||
                        user._id ||
                        user.email
                      }
                      className="metis-pm-roster-card"
                    >
                      <div className="metis-pm-roster-avatar">
                        {getInitials(
                          user.name,
                          user.email
                        )}
                      </div>

                      <div className="metis-pm-roster-main">
                        <div className="metis-pm-roster-heading">
                          <div>
                            <h4>
                              {user.name ||
                                "Unnamed User"}
                            </h4>

                            <p>
                              {user.email ||
                                "No email"}
                            </p>
                          </div>

                          <span
                            className={`metis-pm-role-badge ${
                              user.role === "tl"
                                ? "tl"
                                : "pm"
                            }`}
                          >
                            {user.role?.toUpperCase() ||
                              "USER"}
                          </span>
                        </div>

                        <div className="metis-pm-roster-meta">
                          <span>
                            <ShieldCheck
                              size={14}
                            />

                            {formatRole(
                              user.role
                            )}
                          </span>

                          <span
                            className={
                              isActive
                                ? "metis-pm-user-active"
                                : "metis-pm-user-inactive"
                            }
                          >
                            <span className="metis-pm-status-dot" />

                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="metis-pm-footer">
          <span>
            METIS Construction Project Management
          </span>

          <span>
            Project Manager Workspace
          </span>
        </footer>
      </main>
    </div>
  );
};

export default PMTeamRosterPage;