import {
  useState,
} from "react";
import {
  CheckCircle2,
  Copy,
  HardHat,
  RefreshCw,
  Save,
  Settings,
  Shield,
  X,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import { apiRequest } from "../../lib/api";

const IntegrationSettingsPage = () => {
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] =
    useState("");
  const [testEmail] = useState("test@metis.com");
  const [showApiModal, setShowApiModal] =
    useState(false);

  const handleTestConnection = async () => {
    setStatus("loading");
    setStatusMessage("");

    try {
      const response = await apiRequest(
        "/api/status"
      );

      if (response?.success) {
        setStatus("success");
        setStatusMessage(
          "Backend connection verified. All systems operational."
        );
      } else {
        setStatus("error");
        setStatusMessage(
          "Backend responded but status check failed."
        );
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        err.message ||
          "Failed to connect to backend."
      );
    }
  };

  const handleRefreshMails = async () => {
    setStatus("loading");
    setStatusMessage("");

    try {
      const response = await apiRequest(
        "/api/mails?limit=1"
      );

      if (response?.success) {
        setStatus("success");
        setStatusMessage(
          `Mail sync complete. ${response.total} total mails in registry.`
        );
      } else {
        setStatus("error");
        setStatusMessage(
          "Mail sync failed. Check backend logs."
        );
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        err.message || "Failed to sync mails."
      );
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;

    setStatus("loading");
    setStatusMessage("");

    try {
      const response = await apiRequest("/api/mails", {
        method: "POST",
        body: {
          subject: "Integration Test",
          sender: testEmail,
          recipient: "metis@metis.com",
          processingStatus: "Processing",
        },
      });

      if (response?.success) {
        setStatus("success");
        setStatusMessage(
          "Test email submitted to pipeline."
        );
      } else {
        setStatus("error");
        setStatusMessage(
          "Test email submission failed."
        );
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage(
        err.message ||
          "Failed to submit test email."
      );
    }
  };

  return (
    <>
      <AdminHeader
        title="Integration & Settings"
        subtitle="System configuration and backend services"
        onRefresh={handleTestConnection}
      />

      <main className="admin-content">
        <section className="admin-metrics">
          <MetricCard
            title="Backend"
            value="Online"
            description="API server on localhost:5000"
            icon={<CheckCircle2 size={17} />}
            iconClass="green"
          />

          <MetricCard
            title="Database"
            value="Connected"
            description="MongoDB cluster"
            icon={<CheckCircle2 size={17} />}
            iconClass="green"
          />

          <MetricCard
            title="Auth"
            value="Secure"
            description="JWT token gateway"
            icon={<Shield size={17} />}
            iconClass="blue"
          />

          <MetricCard
            title="Mail Pipeline"
            value="Active"
            description="Ingestion running"
            icon={<CheckCircle2 size={17} />}
            iconClass="amber"
          />
        </section>

        <section className="admin-queue-card">
          <div className="admin-queue-header">
            <div className="admin-queue-title">
              <span />
              <div>
                <div className="admin-queue-heading-row">
                  <h2>System Diagnostics</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-mail-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <div className="mail-subject-cell">
                      <div className="mail-icon">
                        <Settings size={14} />
                      </div>
                      <div>
                        <strong>
                          Backend Connection
                        </strong>
                        <small>
                          API server health check
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      http://localhost:5000
                    </span>
                  </td>
                  <td>
                    <span
                      className={statusBadgeClass(
                        "Active"
                      )}
                    >
                      <span />
                      Operational
                    </span>
                  </td>
                  <td className="right">
                    <button
                      className="review-button"
                      onClick={handleTestConnection}
                      disabled={
                        status === "loading"
                      }
                    >
                      {status === "loading" ? (
                        <RefreshCw
                          size={14}
                          className="spin"
                        />
                      ) : (
                        <Settings size={14} />
                      )}
                      Test
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="mail-subject-cell">
                      <div className="mail-icon">
                        <HardHat size={14} />
                      </div>
                      <div>
                        <strong>
                          Mail Ingestion
                        </strong>
                        <small>
                          Sync raw mail registry
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      /api/mails
                    </span>
                  </td>
                  <td>
                    <span
                      className={statusBadgeClass(
                        "Active"
                      )}
                    >
                      <span />
                      Running
                    </span>
                  </td>
                  <td className="right">
                    <button
                      className="review-button"
                      onClick={
                        handleRefreshMails
                      }
                      disabled={
                        status === "loading"
                      }
                    >
                      {status === "loading" ? (
                        <RefreshCw
                          size={14}
                          className="spin"
                        />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      Sync Mails
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="mail-subject-cell">
                      <div className="mail-icon">
                        <Copy size={14} />
                      </div>
                      <div>
                        <strong>
                          Test Email
                        </strong>
                        <small>
                          Inject test message
                          to pipeline
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      {testEmail}
                    </span>
                  </td>
                  <td>
                    <span
                      className={statusBadgeClass(
                        "Idle"
                      )}
                    >
                      <span />
                      Ready
                    </span>
                  </td>
                  <td className="right">
                    <button
                      className="review-button"
                      onClick={handleTestEmail}
                      disabled={
                        status === "loading" ||
                        !testEmail
                      }
                    >
                      <Copy size={14} />
                      Test
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="mail-subject-cell">
                      <div className="mail-icon">
                        <Shield size={14} />
                      </div>
                      <div>
                        <strong>
                          API Gateway
                        </strong>
                        <small>
                          API key management
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      JWT Bearer
                    </span>
                  </td>
                  <td>
                    <span
                      className={statusBadgeClass(
                        "Secure"
                      )}
                    >
                      <span />
                      Protected
                    </span>
                  </td>
                  <td className="right">
                    <button
                      className="review-button"
                      onClick={() =>
                        setShowApiModal(true)
                      }
                    >
                      <Settings size={14} />
                      Configure
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {statusMessage && (
            <div className="admin-status-message">
              <span
                className={cn(
                  "status-indicator",
                  status === "success"
                    ? "success"
                    : status === "error"
                      ? "error"
                      : "loading"
                )}
              />
              {statusMessage}
            </div>
          )}

          <div className="admin-table-footer">
            <span>
              Last checked:{" "}
              {new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <button
              className="admin-reset-button"
              onClick={() => {
                setStatus("idle");
                setStatusMessage("");
              }}
            >
              Clear Status
            </button>
          </div>
        </section>

        <section className="admin-queue-card">
          <div className="admin-queue-header">
            <div className="admin-queue-title">
              <span />
              <div>
                <div className="admin-queue-heading-row">
                  <h2>API Documentation</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-mail-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Method</th>
                  <th>Auth</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                <ApiDocRow
                  endpoint="/api/projects"
                  method="GET"
                  auth="Required"
                  description="List all projects with filtering"
                />
                <ApiDocRow
                  endpoint="/api/mails"
                  method="GET"
                  auth="Required"
                  description="List raw mail records"
                />
                <ApiDocRow
                  endpoint="/api/users"
                  method="GET"
                  auth="Required"
                  description="List PM and TL users"
                />
                <ApiDocRow
                  endpoint="/api/status"
                  method="GET"
                  auth="None"
                  description="Backend health check"
                />
              </tbody>
            </table>
          </div>
        </section>

        {showApiModal && (
          <ApiDocsModal
            onClose={() => setShowApiModal(false)}
          />
        )}
      </main>
    </>
  );
};

const MetricCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
}) => (
  <div className="admin-metric-card">
    <div className="metric-top">
      <span>{title}</span>
      <div className={`metric-icon ${iconClass}`}>
        {icon}
      </div>
    </div>

    <div className="metric-value-row">
      <strong>{value}</strong>
    </div>

    <small>{description}</small>
  </div>
);

const ApiDocRow = ({
  endpoint,
  method,
  auth,
  description,
}) => (
  <tr>
    <td>
      <code>{endpoint}</code>
    </td>
    <td>
      <span
        className={cn(
          "type-badge",
          method === "GET"
            ? "method-get"
            : method === "POST"
              ? "method-post"
              : method === "PUT"
                ? "method-put"
                : "method-delete"
        )}
      >
        {method}
      </span>
    </td>
    <td>
      <span
        className={statusBadgeClass(
          auth === "Required" ? "Protected" : "Public"
        )}
      >
        <span />
        {auth}
      </span>
    </td>
    <td>
      <small>{description}</small>
    </td>
  </tr>
);

const ApiDocsModal = ({ onClose }) => {
  return (
    <>
      <div
        className="admin-drawer-backdrop"
        onClick={onClose}
      />

      <aside className="admin-detail-drawer">
        <div className="admin-drawer-header">
          <div>
            <span className="drawer-ref">
              API Reference
            </span>

            <h2>
              Integration &amp; Settings API
            </h2>

            <p>
              Backend endpoints for METIS admin
              operations.
            </p>
          </div>

          <button onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="admin-drawer-body">
          <div className="drawer-section">
            <h3>Authentication</h3>

            <div className="drawer-field">
              <span>Login Endpoint</span>
              <strong>
                POST /api/auth/login
              </strong>
            </div>

            <div className="drawer-field">
              <span>JWT</span>
              <strong>
                Bearer token in Authorization
                header
              </strong>
            </div>

            <div className="drawer-field">
              <span>Token Expiry</span>
              <strong>24 hours</strong>
            </div>
          </div>

          <div className="drawer-section">
            <h3>Projects API</h3>

            <div className="drawer-field">
              <span>Base URL</span>
              <strong>
                http://localhost:5000/api/projects
              </strong>
            </div>

            <div className="drawer-field">
              <span>Query Params</span>
              <strong>
                ?limit=100&amp;page=1&amp;pm=Name&amp;tl=Name&amp;status=string
              </strong>
            </div>

            <div className="drawer-field">
              <span>Supported Filters</span>
              <strong>
                projectType, projectStage, status,
                pm, tl, search
              </strong>
            </div>
          </div>

          <div className="drawer-section">
            <h3>Mails API</h3>

            <div className="drawer-field">
              <span>Base URL</span>
              <strong>
                http://localhost:5000/api/mails
              </strong>
            </div>

            <div className="drawer-field">
              <span>Update</span>
              <strong>
                PUT /api/mails/:id to update
                processingStatus
              </strong>
            </div>
          </div>

          <div className="drawer-section">
            <h3>Users API</h3>

            <div className="drawer-field">
              <span>Base URL</span>
              <strong>
                http://localhost:5000/api/users
              </strong>
            </div>

            <div className="drawer-field">
              <span>Methods</span>
              <strong>
                GET (list), POST (create), PUT
                (update), DELETE (remove)
              </strong>
            </div>

            <div className="drawer-field">
              <span>Required Role</span>
              <strong>admin only for writes</strong>
            </div>
          </div>
        </div>

        <div className="admin-drawer-header">
          <button
            className="admin-export-button"
            onClick={onClose}
          >
            <Save size={14} />
            Close
          </button>
        </div>
      </aside>
    </>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function statusBadgeClass(status) {
  return cn(
    "status-badge",
    status
      ? status.toLowerCase().replace(/\s+/g, "-")
      : "empty"
  );
}

export default IntegrationSettingsPage;
