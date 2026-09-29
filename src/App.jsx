import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import AdminLayout from "./components/AdminLayout";
import PMLayout from "./components/PMLayout";
import TLLayout from "./components/TLLayout";

import AdminPage from "./pages/admin/AdminPage";
import AllProjectsPage from "./pages/admin/AllProjectsPage";
import TeamManagementPage from "./pages/admin/TeamManagementPage";
import IntegrationSettingsPage from "./pages/admin/IntegrationSettingsPage";

import PMPage from "./pages/pm/PMPage";
import PMProjectMailPage from "./pages/pm/PMProjectMailPage";
import PMSettingsPage from "./pages/pm/PMSettingsPage";
import PMTeamRosterPage from "./pages/pm/PMTeamRosterPage";
import PMTLAssignedHubPage from "./pages/pm/PMTLAssignedHubPage";

import TLPage from "./pages/tl/TLPage";
import TLAllProjectsPage from "./pages/tl/TLAllProjectsPage";
import TLLogPage from "./pages/tl/TLLogPage";
import TLSettingsPage from "./pages/tl/TLSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= LOGIN ================= */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* ================= ADMIN ================= */}
        <Route element={<AdminLayout />}>

          <Route
            path="/admin"
            element={<AdminPage />}
          />

          <Route
            path="/admin/all-projects"
            element={<AllProjectsPage />}
          />

          <Route
            path="/admin/team-management"
            element={<TeamManagementPage />}
          />

          <Route
            path="/admin/settings"
            element={<IntegrationSettingsPage />}
          />

        </Route>

        {/* ================= PM ================= */}
        <Route element={<PMLayout />}>

          <Route
            path="/pm"
            element={<PMPage />}
          />

          <Route
            path="/pm/project-mail"
            element={<PMProjectMailPage />}
          />

          <Route
            path="/pm/tl-assigned"
            element={<PMTLAssignedHubPage />}
          />

          <Route
            path="/pm/team-roster"
            element={<PMTeamRosterPage />}
          />

          <Route
            path="/pm/settings"
            element={<PMSettingsPage />}
          />

        </Route>

        {/* ================= TL ================= */}
        <Route element={<TLLayout />}>

          <Route
            path="/tl"
            element={<TLPage />}
          />

          <Route
            path="/tl/all-projects"
            element={<TLAllProjectsPage />}
          />

          <Route
            path="/tl/mail"
            element={<TLLogPage />}
          />

          <Route
            path="/tl/settings"
            element={<TLSettingsPage />}
          />

        </Route>

        {/* ================= FALLBACK ================= */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;