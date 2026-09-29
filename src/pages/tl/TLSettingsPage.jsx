import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Copy,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";

import { getCurrentUser } from "../../lib/api";
import { TLHamburger } from "../../components/tl";

import "../../index.css";

const TLSettingsPage = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [activeSection, setActiveSection] =
    useState("profile");

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("metis_token");
    localStorage.removeItem("metis_user");
    sessionStorage.removeItem("metis_token");
    sessionStorage.removeItem("metis_user");
    navigate("/login", { replace: true });
  };

  const copyToken = () => {
    const token =
      localStorage.getItem("metis_token") ||
      sessionStorage.getItem("metis_token");
    if (token) {
      navigator.clipboard.writeText(token);
    }
  };

  return (
    <>
        <header className="tl-header">
          <TLHamburger />
          <div className="tl-header-title">
            <div className="tl-header-number">TL</div>
            <h1>SETTINGS</h1>
          </div>

          <div className="tl-header-actions">
            <div className="tl-pm-badge">
              <span>Supervising PM:</span>
              <strong className="tl-pm-avatar">PM</strong>
              <b>Supervising PM</b>
            </div>

            <button
              className="tl-icon-button"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="tl-notification-dot" />
            </button>

            <button
              className="tl-icon-button"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </header>

        <div className="tl-content">
          {/* Settings Navigation */}
          <div
            className={`tl-tab ${
              activeSection === "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection("profile")
            }
          >
            <Users size={16} />
            <span>Profile</span>
          </div>

         
          {/* Profile Section */}
          {activeSection === "profile" && (
            <section className="tl-table-container">
              <div className="tl-card-header">
                <div>
                  <h3>
                    Team Lead Profile
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Your profile information
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    Name
                  </small>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#0f172a",
                      fontSize: "13px",
                    }}
                  >
                    {user?.name || "—"}
                  </strong>
                </div>

                <div>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    Email
                  </small>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#0f172a",
                      fontSize: "13px",
                    }}
                  >
                    {user?.email || "—"}
                  </strong>
                </div>

                <div>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    Role
                  </small>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#0f172a",
                      fontSize: "13px",
                    }}
                  >
                    Team Lead (TL)
                  </strong>
                </div>

                <div>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    User ID
                  </small>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#0f172a",
                      fontSize: "13px",
                    }}
                  >
                    {user?.id ||
                      user?._id ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #edf2f7",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Your profile information is managed
                  by the system administrator.
                </p>
              </div>
            </section>
          )}

          {/* Session Section */}
          {activeSection === "session" && (
            <section className="tl-table-container">
              <div className="tl-card-header">
                <div>
                  <h3>
                    Session & Authentication
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Manage your session and authentication
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    Authentication Status
                  </small>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#059669",
                      fontSize: "13px",
                    }}
                  >
                    Active
                  </strong>
                </div>

                <div>
                  <small
                    style={{
                      color: "#64748b",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    Session Token
                  </small>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    <code
                      style={{
                        padding: "4px 8px",
                        background: "#f1f5f9",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontFamily:
                          "monospace",
                        color: "#475569",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {localStorage.getItem(
                        "metis_token"
                      ) ||
                        sessionStorage.getItem(
                          "metis_token"
                        ) ||
                        "—"}
                    </code>
                    <button
                      className="tl-icon-button"
                      onClick={copyToken}
                      title="Copy token"
                      style={{
                        width: "auto",
                        height: "auto",
                        padding: "4px",
                      }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #edf2f7",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="tl-logout-button"
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </section>
          )}
        </div>
      
    </>
  );
};

export default TLSettingsPage;
