import { Menu } from "lucide-react";
import { useSidebar } from "../../lib/SidebarContext";

const TLHamburger = () => {
  const sidebar = useSidebar();

  const collapsed = !sidebar?.sidebarOpen;

  const toggleSidebar =
    sidebar?.toggleSidebar || (() => {});

  return (
    <button
      type="button"
      className="tl-icon-button"
      onClick={toggleSidebar}
      title={
        collapsed ? "Expand sidebar" : "Collapse sidebar"
      }
    >
      <Menu size={16} />
    </button>
  );
};

export default TLHamburger;
