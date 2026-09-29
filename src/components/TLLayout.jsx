import {
  useCallback,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import { SidebarContext } from "../lib/SidebarContext";
import TLSidebar from "./tl/TLSidebar";

const TLLayout = () => {
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
        className={`tl-page ${
          sidebarOpen
            ? "sidebar-expanded"
            : "sidebar-collapsed"
        }`}
      >
        <TLSidebar />

        <div className="tl-main">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default TLLayout;
