import { Menu } from "lucide-react";
import { useSidebar } from "../../lib/SidebarContext";

const PMHamburger = () => {
  const sidebar = useSidebar();

  const collapsed = !sidebar?.sidebarOpen;

  const toggleSidebar =
    sidebar?.toggleSidebar || (() => {});

  return (
    <button
      type="button"
      className="metis-pm-hamburger"
      onClick={toggleSidebar}
      title={
        collapsed ? "Expand sidebar" : "Collapse sidebar"
      }
    >
      <Menu size={16} />
    </button>
  );
};

export default PMHamburger;
