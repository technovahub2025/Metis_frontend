import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import { PMHamburger } from "../../components/pm";

const PMTLAssignedHubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="metis-pm-page">
      <main className="metis-pm-main">
        <header className="metis-pm-topbar">
          <div className="metis-pm-topbar-left">
            <PMHamburger />

            <button
              type="button"
              className="metis-pm-back-button"
              onClick={() => navigate("/pm")}
              title="Back to My Projects"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <h1>TL ASSIGNED HUB</h1>
              <span>Project Manager Workspace</span>
            </div>
          </div>

          <div className="metis-pm-topbar-actions">
            <button
              type="button"
              className="metis-pm-icon-button"
              title="TL Assignment"
            >
              <UserPlus size={16} />
            </button>
          </div>
        </header>

        <section className="metis-pm-content">
          <div className="metis-pm-page-heading">
            <div>
              <h2>TL Assigned Hub</h2>
              <p>
                Track projects delegated from PM to Team Leads.
              </p>
            </div>
          </div>

          <div className="metis-pm-panel">
            <div className="metis-pm-panel-header">
              <div>
                <h3>Assigned Projects</h3>
                <p>
                  Projects assigned to Team Leads will appear here.
                </p>
              </div>

              <span className="metis-pm-count-badge">
                0
              </span>
            </div>

            <div className="metis-pm-empty">
              <Users size={42} />

              <h3>TL Assigned Hub</h3>

              <p>
                Projects assigned to Team Leads will appear here.
              </p>
            </div>
          </div>
        </section>

        <footer className="metis-pm-footer">
          <span>
            METIS Construction Project Management
          </span>

          <span>
            Project Manager Workspace
          </span>
        </footer>
      </main>
    </div>
  );
};

export default PMTLAssignedHubPage;