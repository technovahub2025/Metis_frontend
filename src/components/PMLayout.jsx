import {
  useCallback,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import { SidebarContext } from "../lib/SidebarContext";
import PMSidebar from "./pm/PMSidebar";

const PMLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((previous) => !previous);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
      }}
    >
      <div
        className={`metis-pm-page ${
          sidebarOpen
            ? "sidebar-expanded"
            : "sidebar-collapsed"
        }`}
      >
        <PMSidebar />

        <div className="metis-pm-main">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default PMLayout;
