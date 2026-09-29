import { useNavigate, useLocation } from "react-router-dom";
import {
  FolderKanban,
  Mail,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import { getCurrentUser, clearAuth } from "../../lib/api";
import { useSidebar } from "../../lib/SidebarContext";

const navigation = [
  {
    name: "My Projects",
    icon: FolderKanban,
    path: "/pm",
    step: null,
  },
  {
    name: "Project Mail",
    icon: Mail,
    path: "/pm/project-mail",
    step: null,
  },
  {
    name: "TL Assigned Hub",
    icon: Users,
    path: "/pm/tl-assigned",
    step: "Step 3",
  },
];

const adminNav = [
  {
    name: "Team Roster",
    icon: Users,
    path: "/pm/team-roster",
    step: null,
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/pm/settings",
    step: null,
  },
];

const PMSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const sidebar = useSidebar();

  const collapsed = !sidebar?.sidebarOpen;

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const getInitials = (name) => {
    if (!name) return "PM";
    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return String(name).slice(0, 2).toUpperCase();
  };

  const userName =
    currentUser?.name || "METIS Project Manager";

  const userInitials = getInitials(userName);

  const sidebarClass = [
    "metis-pm-sidebar",
    collapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClass}>
      <div className="metis-pm-brand">
        <div className="metis-pm-brand-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
            <path d="M14 6a6 6 0 0 1 6 6v3" />
            <path d="M4 15v-3a6 6 0 0 1 6-6" />
            <rect x="2" y="15" width="20" height="4" rx="1" />
          </svg>
        </div>
        <span>METIS</span>
      </div>

      <nav className="metis-pm-nav">
        <div className="metis-pm-nav-label">
          PM Workflow
        </div>

        {navigation.map((item) => {
          const isActive =
            location.pathname === item.path;
          return (
            <button
              key={item.name}
              type="button"
              className={`metis-pm-nav-item ${
                isActive ? "active" : ""
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              <item.icon size={16} />
              <span>{item.name}</span>
              {item.step && (
                <span className="metis-pm-step">
                  {item.step}
                </span>
              )}
            </button>
          );
        })}

        <div className="metis-pm-nav-label secondary">
          Administration
        </div>

        {adminNav.map((item) => {
          const isActive =
            location.pathname === item.path;
          return (
            <button
              key={item.name}
              type="button"
              className={`metis-pm-nav-item ${
                isActive ? "active" : ""
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="metis-pm-user">
        <div className="metis-pm-avatar">
          {userInitials}
          <span />
        </div>

        <div className="metis-pm-user-info">
          <strong>{userName}</strong>
          <small>Project Manager (PM)</small>
        </div>

        <button
          type="button"
          className="metis-pm-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default PMSidebar;
