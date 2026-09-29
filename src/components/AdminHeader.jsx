import {
  Bell,
  Menu,
  RefreshCw,
  Search,
} from "lucide-react";
import { useSidebar } from "../lib/SidebarContext";

const AdminHeader = ({
  title,
  subtitle,
  searchValue,
  onSearch,
  searchPlaceholder,
  actions,
  onRefresh,
}) => {
  const sidebar = useSidebar();

  const toggleSidebar =
    sidebar?.toggleSidebar || (() => {});

  return (
    <header className="admin-top-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-button"
          onClick={toggleSidebar}
        >
          <Menu size={19} />
        </button>

        <div>
          <h1>{title}</h1>

          {subtitle && (
            <small
              style={{
                display: "block",
                color: "#94a3b8",
                fontSize: "11px",
              }}
            >
              {subtitle}
            </small>
          )}
        </div>
      </div>

      <div className="admin-header-actions">
        {searchPlaceholder && onSearch && (
          <div className="admin-global-search">
            <Search size={15} />

            <input
              type="text"
              value={searchValue || ""}
              onChange={(event) =>
                onSearch(event.target.value)
              }
              placeholder={searchPlaceholder}
            />

            <kbd>⌘K</kbd>
          </div>
        )}

        {onRefresh && (
          <button
            type="button"
            className="admin-icon-button"
            title="Refresh"
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
          </button>
        )}

       

        {actions}
      </div>
    </header>
  );
};

export default AdminHeader;