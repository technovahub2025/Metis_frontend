import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ClipboardList,
  HardHat,
  Inbox,
  LogOut,
  Mail,
  Users,
} from "lucide-react";
import { SidebarContext } from "../lib/SidebarContext";
import {
  apiRequest,
  clearAuth,
  getCurrentUser,
} from "../lib/api";

const ROLE_LABEL = {
  admin: "Lead System Admin",
  pm: "Project Manager (PM)",
  tl: "Team Lead (TL)",
};

const ROLE_AVATAR = {
  admin: "AD",
  pm: "PM",
  tl: "TL",
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [counts, setCounts] = useState({
    projects: 0,
    dispatch: 0,
    rawMail: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((previous) => !previous);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [projectsRes, mailsRes] =
          await Promise.all([
            apiRequest("/api/projects").catch(() => ({
              data: [],
            })),
            apiRequest("/api/mails").catch(() => ({
              data: [],
            })),
          ]);

        const projects = projectsRes?.data || [];
        const mails = mailsRes?.data || [];

        const dispatch = mails.filter(
          (mail) =>
            mail.processingStatus === "New" ||
            mail.processingStatus === "Processing"
        ).length;

        if (!cancelled) {
          setCounts({
            projects: projects.length,
            dispatch,
            rawMail: mails.length,
          });
        }
      } catch {
        if (!cancelled) {
          setCounts({
            projects: 0,
            dispatch: 0,
            rawMail: 0,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path;

  const role = user?.role || "admin";

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
      }}
    >
      <div
        className={`metis-admin-page ${
          sidebarOpen
            ? "sidebar-expanded"
            : "sidebar-collapsed"
        }`}
      >
        <aside
          className={`metis-admin-sidebar ${
            sidebarOpen ? "" : "collapsed"
          }`}
        >
          {/* BRAND */}
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">
              <HardHat
                size={20}
                strokeWidth={2.2}
              />
            </div>

            {sidebarOpen && (
              <span className="admin-brand-name">
                METIS
              </span>
            )}
          </div>

          {/* NAVIGATION */}
              {/* NAVIGATION */}
              <nav className="admin-sidebar-nav">
                {sidebarOpen && (
                  <div className="admin-nav-label">
                    Workflows
                  </div>
                )}

                {/* ADMIN DISPATCH */}
                <button
                  type="button"
                  title="Admin Dispatch"
                  className={`admin-nav-item ${
                    isActive("/admin")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => navigate("/admin")}
                >
                  <HardHat size={18} />
                  {sidebarOpen && (
                    <span>Admin Dispatch</span>
                  )}
                </button>

                {/* ALL PROJECTS */}
                <button
                  type="button"
                  title="All Projects"
                  className={`admin-nav-item ${
                    isActive("/admin/all-projects")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => navigate("/admin/all-projects")}
                >
                  <ClipboardList size={18} />
                  {sidebarOpen && (
                    <span>All Projects</span>
                  )}
                </button>

                {/* TEAM MANAGEMENT */}
                <button
                  type="button"
                  title="Team Management"
                  className={`admin-nav-item ${
                    isActive("/admin/team-management")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => navigate("/admin/team-management")}
                >
                  <Users size={18} />
                 {sidebarOpen && (
                   <span>Team Management</span>
                 )}
               </button>
             </nav>

          {/* USER AREA */}
          <div className="admin-sidebar-user">
            <div className="admin-user-avatar">
              {ROLE_AVATAR[role] || "??"}
              <span />
            </div>

            {sidebarOpen && (
              <div className="admin-user-info">
                <strong>
                  {user?.name || "Guest"}
                </strong>

                <small>
                  {ROLE_LABEL[role] || "—"}
                </small>
              </div>
            )}

            <button
              type="button"
              className="admin-logout-button"
              title="Logout"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="metis-admin-main">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AdminLayout;

