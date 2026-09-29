import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Bell,
  User,
  ShieldCheck,
  SlidersHorizontal,
  RefreshCw,
  ArrowLeft,
  Settings,
} from "lucide-react";

import {
  getCurrentUser,
  clearAuth,
} from "../../lib/api";

import { PMHamburger } from "../../components/pm";

const PMSettingsPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const userName =
    currentUser?.name ||
    "METIS Project Manager";

  const userEmail =
    currentUser?.email ||
    "pm@metis.com";

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
              <h1>SETTINGS</h1>

              <span>
                Project Manager Workspace
              </span>
            </div>
          </div>

          <div className="metis-pm-topbar-actions">
            <button
              type="button"
              className="metis-pm-icon-button"
              title="Refresh"
              onClick={() =>
                window.location.reload()
              }
            >
              <RefreshCw size={16} />
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

        <section className="metis-pm-content">
          <div className="metis-pm-page-heading">
            <div>
              <h2>Settings</h2>

              <p>
                Manage your Project Manager workspace
                preferences and account information.
              </p>
            </div>
          </div>

          <div className="metis-pm-panel">
            <div className="metis-pm-panel-header">
              <div>
                <h3>Profile</h3>

                <p>
                  Your current METIS Project Manager
                  account.
                </p>
              </div>

              <div className="metis-pm-stat-icon blue">
                <User size={18} />
              </div>
            </div>

            <div className="metis-pm-settings-grid">
              <div className="metis-pm-setting-item">
                <span className="metis-pm-setting-label">
                  Name
                </span>

                <strong>
                  {userName}
                </strong>
              </div>

              <div className="metis-pm-setting-item">
                <span className="metis-pm-setting-label">
                  Email
                </span>

                <strong>
                  {userEmail}
                </strong>
              </div>

              <div className="metis-pm-setting-item">
                <span className="metis-pm-setting-label">
                  Role
                </span>

                <strong>
                  Project Manager
                </strong>
              </div>

              <div className="metis-pm-setting-item">
                <span className="metis-pm-setting-label">
                  Workspace
                </span>

                <strong>
                  METIS PM Workspace
                </strong>
              </div>
            </div>
          </div>

          <div className="metis-pm-panel">
            <div className="metis-pm-panel-header">
              <div>
                <h3>Workspace Preferences</h3>

                <p>
                  Project Manager workspace
                  configuration.
                </p>
              </div>

              <div className="metis-pm-stat-icon amber">
                <SlidersHorizontal size={18} />
              </div>
            </div>

            <div className="metis-pm-settings-list">
              <div className="metis-pm-setting-row">
                <div className="metis-pm-setting-row-icon">
                  <Bell size={18} />
                </div>

                <div>
                  <strong>
                    Project Notifications
                  </strong>

                  <p>
                    Notifications for project assignment
                    and status changes.
                  </p>
                </div>

                <span className="metis-pm-setting-status">
                  Enabled
                </span>
              </div>

              <div className="metis-pm-setting-row">
                <div className="metis-pm-setting-row-icon">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <strong>
                    Role Permissions
                  </strong>

                  <p>
                    Your account operates with Project
                    Manager permissions.
                  </p>
                </div>

                <span className="metis-pm-setting-status">
                  PM
                </span>
              </div>

              <div className="metis-pm-setting-row">
                <div className="metis-pm-setting-row-icon">
                  <FolderKanban size={18} />
                </div>

                <div>
                  <strong>
                    Project Workflow
                  </strong>

                  <p>
                    Review Admin projects, assign Team
                    Leads, and monitor progress.
                  </p>
                </div>

                <span className="metis-pm-setting-status">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="metis-pm-panel">
            <div className="metis-pm-panel-header">
              <div>
                <h3>Account & Security</h3>

                <p>
                  Current authentication status for this
                  workspace.
                </p>
              </div>

              <div className="metis-pm-stat-icon red">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="metis-pm-security-card">
              <div>
                <strong>
                  METIS authentication
                </strong>

                <p>
                  Your session is authenticated as a
                  Project Manager.
                </p>
              </div>

              <span className="metis-pm-setting-status">
                Active
              </span>
            </div>
          </div>

          <div className="metis-pm-info-note">
            <Settings size={18} />

            <div>
              <strong>
                Workspace settings
              </strong>

              <p>
                Additional PM preferences can be
                configured here as the project workflow
                is expanded.
              </p>
            </div>
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

export default PMSettingsPage;