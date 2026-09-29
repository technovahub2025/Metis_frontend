import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  ClipboardCheck,
  FileText,
  HardHat,
  LogOut,
  Settings,
} from "lucide-react";

import { getCurrentUser, clearAuth } from "../../lib/api";
import { useSidebar } from "../../lib/SidebarContext";

const navigation = [
  {
    name: "All Projects",
    icon: Briefcase,
    path: "/tl/all-projects",
  },
  {
    name: "My Assigned Projects",
    icon: ClipboardCheck,
    path: "/tl",
  },
  {
    name: "Project Mail Log",
    icon: FileText,
    path: "/tl/mail",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/tl/settings",
  },
];

const TLSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const sidebar = useSidebar();

  const collapsed = !sidebar?.sidebarOpen;

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "TL";
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
    currentUser?.name || "Team Lead";

  const userInitials = getInitials(userName);

  const sidebarClass = [
    "tl-sidebar",
    collapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={sidebarClass}>
      <div>
        <div className="tl-brand">
          <div className="tl-brand-icon">
            <HardHat
              size={24}
              strokeWidth={2.2}
            />
          </div>
          <span>METIS</span>
        </div>

        <nav className="tl-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.path}
                className={`tl-nav-item ${
                  isActive(item.path)
                    ? "active"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
              >
                <Icon size={17} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="tl-sidebar-user">
        <div className="tl-user-avatar">
          {userInitials}
          <span />
        </div>

        <div className="tl-user-info">
          <strong>{userName}</strong>
          <small>Team Lead (TL)</small>
        </div>

        <button
          type="button"
          className="tl-logout-button"
          title="Logout"
          onClick={handleLogout}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default TLSidebar;
