import { useMemo, useState } from "react";

import {
  Bell,
  Filter,
  Mail,
  RefreshCw,
  Search,
} from "lucide-react";

import { useApiList } from "../../lib/useApiList";
import {
  calculateAge,
  formatDate,
} from "../../lib/helpers";
import { TLHamburger } from "../../components/tl";

import "../../index.css";

const TLLogPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [projectFilter, setProjectFilter] =
    useState("");

  const {
    data: mails,
    total,
    loading,
    error,
    refetch,
  } = useApiList("/api/mails", {
    limit: 100,
    page: 1,
  });

  const handleRefresh = () => {
    refetch();
  };

  const statusOptions = [
    "New",
    "Processing",
    "Classified",
    "On Hold",
    "Completed",
  ];

  const filteredMails = useMemo(() => {
    let result = mails;

    if (search.trim()) {
      const query = search
        .toLowerCase()
        .trim();
      result = result.filter((mail) => {
        return (
          mail.subject
            ?.toLowerCase()
            .includes(query) ||
          mail.sender
            ?.toLowerCase()
            .includes(query) ||
          mail.projectName
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (mail) =>
          mail.processingStatus === statusFilter
      );
    }

    if (projectFilter.trim()) {
      const query = projectFilter
        .toLowerCase()
        .trim();
      result = result.filter((mail) =>
        mail.projectName
          ?.toLowerCase()
          .includes(query)
      );
    }

    return result;
  }, [
    mails,
    search,
    statusFilter,
    projectFilter,
  ]);

  return (
    <>
        <header className="tl-header">
          <TLHamburger />
          <div className="tl-header-title">
            <div className="tl-header-number">TL</div>
            <h1>PROJECT MAIL LOG</h1>
          </div>

          <div className="tl-header-actions">
            <div className="tl-pm-badge">
              <span>Supervising PM:</span>
              <strong className="tl-pm-avatar">PM</strong>
              <b>Supervising PM</b>
            </div>

            <button
              className="tl-icon-button"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="tl-notification-dot" />
            </button>

            <button
              className="tl-icon-button"
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </header>

        <div className="tl-content">
          <section className="tl-metrics">
            <div className="tl-metric-card">
              <div>
                <span className="tl-metric-label">
                  TOTAL MAIL
                </span>
                <strong>{filteredMails.length}</strong>
                <small>
                  Records in log
                </small>
              </div>
              <div className="tl-metric-icon neutral">
                <Mail size={18} />
              </div>
            </div>

            <div className="tl-metric-card highlighted">
              <div>
                <span className="tl-metric-label amber">
                  NEW
                </span>
                <strong>
                  {mails.filter(
                    (m) =>
                      m.processingStatus === "New"
                  ).length}
                </strong>
                <small>
                  Awaiting classification
                </small>
              </div>
              <div className="tl-metric-icon amber">
                <Mail size={18} />
              </div>
            </div>

            <div className="tl-metric-card">
              <div>
                <span className="tl-metric-label">
                  PROCESSING
                </span>
                <strong>
                  {mails.filter(
                    (m) =>
                      m.processingStatus ===
                      "Processing"
                  ).length}
                </strong>
                <small>
                  In progress
                </small>
              </div>
              <div className="tl-metric-icon blue-icon">
                <Mail size={18} />
              </div>
            </div>

            <div className="tl-metric-card">
              <div>
                <span className="tl-metric-label red">
                  ON HOLD
                </span>
                <strong>
                  {mails.filter(
                    (m) =>
                      m.processingStatus ===
                      "On Hold"
                  ).length}
                </strong>
                <small>
                  Pending action
                </small>
              </div>
              <div className="tl-metric-icon red-icon">
                <Mail size={18} />
              </div>
            </div>

            <div className="tl-metric-card">
              <div>
                <span className="tl-metric-label green">
                  COMPLETED
                </span>
                <strong className="green">
                  {mails.filter(
                    (m) =>
                      m.processingStatus ===
                      "Completed"
                  ).length}
                </strong>
                <small>
                  Processed
                </small>
              </div>
              <div className="tl-metric-icon green-icon">
                <Mail size={18} />
              </div>
            </div>
          </section>

          <section className="tl-controls">
            <div className="tl-control-top">
              <div>
                <div className="tl-tabs">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={`tl-tab ${
                        statusFilter ===
                        status.toLowerCase()
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setStatusFilter(
                          status.toLowerCase()
                        )
                      }
                    >
                      <i className="yellow-dot" />
                      {status}
                    </button>
                  ))}

                  <button
                    className={`tl-tab ${
                      statusFilter === "all"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter("all")
                    }
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            <div className="tl-filter-row">
              <div className="tl-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search mail subject, sender, project..."
                />
              </div>

              <input
                type="text"
                value={projectFilter}
                onChange={(e) =>
                  setProjectFilter(e.target.value)
                }
                placeholder="Filter by project..."
                className="tl-filter-select"
              />

              <button
                className="tl-filter-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setProjectFilter("");
                }}
                title="Clear filters"
              >
                <Filter size={16} />
              </button>
            </div>
          </section>

          <section className="tl-table-container">
            {loading ? (
              <div className="tl-empty">
                <div className="tl-empty-icon">
                  <Mail size={24} />
                </div>
                <h3>Loading Mail Records</h3>
                <p>
                  Please wait while mail records
                  are being fetched...
                </p>
              </div>
            ) : error ? (
              <div className="tl-empty">
                <div className="tl-empty-icon">
                  <Mail size={24} />
                </div>
                <h3>
                  Unable to Load Mail Log
                </h3>
                <p>
                  {error.message ||
                    "Failed to fetch mail records."}
                </p>
                <button onClick={handleRefresh}>
                  Retry
                </button>
              </div>
            ) : filteredMails.length === 0 ? (
              <div className="tl-empty">
                <div className="tl-empty-icon">
                  <Mail size={24} />
                </div>
                <h3>
                  No Mail Records Found
                </h3>
                <p>
                  {search ||
                  statusFilter !== "all" ||
                  projectFilter
                    ? "No mail records match the current filters."
                    : "There are no mail records in the log."}
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setProjectFilter("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="tl-table-scroll">
                <table className="tl-table">
                  <thead>
                    <tr>
                      <th>SUBJECT</th>
                      <th>SENDER</th>
                      <th>PROJECT</th>
                      <th>MAIL DATE</th>
                      <th>STATUS</th>
                      <th>AGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMails.map((mail) => (
                      <tr key={mail.id}>
                        <td>
                          <div className="tl-mail-subject">
                            {mail.subject || "—"}
                          </div>
                        </td>

                        <td>
                          {mail.sender || "—"}
                        </td>

                        <td>
                          {mail.projectName || "—"}
                        </td>

                        <td>
                          {formatDate(
                            mail.receivedDate ||
                              mail.mailDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`tl-status ${
                              mail.processingStatus
                                ? mail.processingStatus
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")
                                : "empty"
                            }`}
                          >
                            <i />
                            {mail.processingStatus ||
                              "New"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              (calculateAge(
                                mail.receivedDate ||
                                  mail.mailDate
                              ) || 0) >= 5
                                ? "tl-age tl-age-danger"
                                : "tl-age"
                            }
                          >
                            {calculateAge(
                              mail.receivedDate ||
                                mail.mailDate
                            ) ?? "—"}
                            {typeof calculateAge(
                              mail.receivedDate ||
                                mail.mailDate
                            ) === "number"
                              ? "d"
                              : ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="tl-table-footer">
              <span>
                Showing {filteredMails.length} of{" "}
                {total || filteredMails.length} mail
                records
              </span>
            </div>
          </section>
        </div>
      
    </>
  );
};

export default TLLogPage;
