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
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { SidebarContext } from "../lib/SidebarContext";
import {
  clearAuth,
  getCurrentUser,
} from "../lib/api";

const ROLE_LABEL = {
  super_admin: "Super Admin",
};

const ROLE_AVATAR = {
  super_admin: "SA",
};

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((previous) => !previous);
  }, []);

  /*
   * Role guard: only super_admin may access
   * Super Admin routes.
   *
   * Redirect Admin/PM/TL to their existing
   * dashboards — existing behaviour unchanged.
   */
  useEffect(() => {
    const role = String(
      user?.role || ""
    ).toLowerCase();

    if (role !== "super_admin") {
      const roleRoutes = {
        admin: "/admin",
        pm: "/pm",
        tl: "/tl",
      };

      const destination =
        roleRoutes[role] || "/login";

      navigate(destination, { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path;

  const role = user?.role || "super_admin";

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
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">
              <Settings size={20} />
            </div>

            {sidebarOpen && (
              <span className="admin-brand-name">
                METIS — SA
              </span>
            )}
          </div>

          <nav className="admin-sidebar-nav">
            {sidebarOpen && (
              <div className="admin-nav-label">
                System
              </div>
            )}

            <button
              type="button"
              title="Dashboard"
              className={`admin-nav-item ${
                isActive("/super-admin")
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate("/super-admin")
              }
            >
              <LayoutDashboard size={18} />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              type="button"
              title="Users"
              className={`admin-nav-item ${
                isActive("/super-admin/users")
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate("/super-admin/users")
              }
            >
              <Users size={18} />
              {sidebarOpen && <span>Users</span>}
            </button>

            <button
              type="button"
              title="Projects"
              className={`admin-nav-item ${
                isActive("/super-admin/projects")
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate("/super-admin/projects")
              }
            >
              <FolderKanban size={18} />
              {sidebarOpen && (
                <span>Projects</span>
              )}
            </button>

            <button
              type="button"
              title="Reports"
              className={`admin-nav-item ${
                isActive("/super-admin/reports")
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate("/super-admin")
              }
            >
              <BarChart3 size={18} />
              {sidebarOpen && (
                <span>Reports</span>
              )}
            </button>
          </nav>

          <div className="admin-sidebar-user">
            <div className="admin-user-avatar">
              {ROLE_AVATAR[role] || "SA"}
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

        <div className="metis-admin-main">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default SuperAdminLayout;
