import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Filter,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import { apiRequest } from "../../lib/api";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "pm",
  active: true,
};

const TeamManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name-az");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [toast, setToast] = useState(null);

  const showToast = (title, message, success = true) => {
    setToast({
      title,
      message,
      success,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/api/users?limit=200");

      const list =
        response?.users ||
        response?.data ||
        [];

      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err?.message ||
          "Unable to load team members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /*
   * Admin Team Management: only PM and TL users
   * are visible. Super Admin and Admin accounts
   * are excluded entirely.
   */
  const adminTeamUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "pm" ||
          user.role === "tl"
      ),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = adminTeamUsers.filter((user) => {
      const matchesSearch =
        !query ||
        String(user.name || "")
          .toLowerCase()
          .includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.active !== false) ||
        (statusFilter === "inactive" &&
          user.active === false);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });

    return [...result].sort((a, b) => {
      if (sortOption === "name-az") {
        return String(
          a.name || ""
        ).localeCompare(
          String(b.name || "")
        );
      }

      if (sortOption === "name-za") {
        return String(
          b.name || ""
        ).localeCompare(
          String(a.name || "")
        );
      }

      if (sortOption === "newest") {
        return (
          new Date(
            b.createdAt || b._id
          ) -
          new Date(
            a.createdAt || a._id
          )
        );
      }

      return (
        new Date(
          a.createdAt || a._id
        ) -
        new Date(
          b.createdAt || b._id
        )
      );
    });
  }, [
    adminTeamUsers,
    search,
    roleFilter,
    statusFilter,
    sortOption,
  ]);

  const statistics = useMemo(() => {
    return {
      total: adminTeamUsers.length,
      pms: adminTeamUsers.filter(
        (user) => user.role === "pm"
      ).length,
      tls: adminTeamUsers.filter(
        (user) => user.role === "tl"
      ).length,
      active: adminTeamUsers.filter(
        (user) => user.active !== false
      ).length,
    };
  }, [adminTeamUsers]);

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortOption("name-az");
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "pm",
      active: user.active !== false,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast(
        "Validation Error",
        "Name is required.",
        false
      );
      return;
    }

    if (!form.email.trim()) {
      showToast(
        "Validation Error",
        "Email is required.",
        false
      );
      return;
    }

    if (!editingUser && !form.password.trim()) {
      showToast(
        "Validation Error",
        "Password is required for a new account.",
        false
      );
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        const body = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          active: form.active,
        };

        if (form.password.trim()) {
          body.password = form.password;
        }

        const userId =
          editingUser.id ||
          editingUser._id;

        await apiRequest(
          `/api/users/${userId}`,
          {
            method: "PUT",
            body,
          }
        );

        showToast(
          "User Updated",
          `${form.name} has been updated successfully.`
        );
      } else {
        await apiRequest("/api/users", {
          method: "POST",
          body: {
            name: form.name.trim(),
            email: form.email
              .trim()
              .toLowerCase(),
            password: form.password,
            role: form.role,
            active: form.active,
          },
        });

        showToast(
          "User Created",
          `${form.name} has been added to the team.`
        );
      }

      closeModal();
      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to save user:",
        err
      );

      showToast(
        "Save Failed",
        err?.message ||
          "Unable to save the user.",
        false
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (user) => {
    const userId = user.id || user._id;

    try {
      await apiRequest(
        `/api/users/${userId}`,
        {
          method: "PUT",
          body: {
            active: user.active === false,
          },
        }
      );

      showToast(
        user.active === false
          ? "Account Activated"
          : "Account Deactivated",
        `${user.name}'s account status has been updated.`
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      showToast(
        "Update Failed",
        err?.message ||
          "Unable to update account status.",
        false
      );
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}'s account?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    const userId = user.id || user._id;

    try {
      await apiRequest(
        `/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      showToast(
        "User Deleted",
        `${user.name}'s account has been deleted.`
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      showToast(
        "Delete Failed",
        err?.message ||
          "Unable to delete the user.",
        false
      );
    }
  };

  const getInitials = (name) => {
    return String(name || "U")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatTeamMemberName = (name) => {
    if (!name || !String(name).trim()) {
      return "Unnamed User";
    }

    const parts = String(name).trim().split(/\s+/);

    if (parts.length === 2 && parts[0].length === 1) {
      return parts[1];
    }

    return name;
  };

  const formatRole = (role) => {
    if (role === "admin") return "Admin";
    if (role === "pm") return "Project Manager";
    if (role === "tl") return "Team Lead";

    return role || "Unknown";
  };

  return (
    <>
      <AdminHeader
        title="Team Management"
        subtitle="Manage METIS administrators, project managers and team leads"
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search team members..."
        onRefresh={loadUsers}
        actions={
          <button
            type="button"
            className="admin-add-mail-button"
            onClick={openAddModal}
          >
            <Plus size={15} />
            <span>Add Team Member</span>
          </button>
        }
      />

      <main className="admin-content">
        {/* Statistics */}
        <section className="admin-metrics">
          <MetricCard
            title="Total Members"
            value={statistics.total}
            description="All METIS accounts"
            icon={<UserRound size={17} />}
            iconClass="blue"
          />

          <MetricCard
            title="Project Managers"
            value={statistics.pms}
            description="PM accounts"
            icon={<ShieldCheck size={17} />}
            iconClass="amber"
          />

          <MetricCard
            title="Team Leads"
            value={statistics.tls}
            description="TL accounts"
            icon={<CheckCircle2 size={17} />}
            iconClass="green"
          />

          <MetricCard
            title="Active Accounts"
            value={statistics.active}
            description="Currently active"
            icon={<UserRound size={17} />}
            iconClass="purple"
          />
        </section>

        {/* Team section */}
        <section className="admin-queue-card">
          <div className="admin-queue-header">
            <div className="admin-queue-title">
              <span />
              <div>
                <div className="admin-queue-heading-row">
                  <h2>Team Members</h2>

                  <span className="admin-showing-badge">
                    Showing {filteredUsers.length} of{" "}
                    {adminTeamUsers.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-control-top">
              <div className="admin-status-tabs">
                {[
                  {
                    key: "all",
                    label: "All Members",
                    count: filteredUsers.length,
                  },
                  {
                    key: "active",
                    label: "Active",
                    count: adminTeamUsers.filter(
                      (user) =>
                        user.active !== false
                    ).length,
                  },
                  {
                    key: "inactive",
                    label: "Inactive",
                    count: adminTeamUsers.filter(
                      (user) =>
                        user.active === false
                    ).length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`admin-status-tab ${
                      statusFilter === tab.key
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter(
                        tab.key
                      )
                    }
                  >
                    <span className="count">
                      {tab.count}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="admin-clear-btn"
                onClick={resetFilters}
              >
                <Filter size={14} />
                Clear Filters
              </button>
            </div>

            <div className="admin-filter-bar">
              <select
                className="admin-filter-select"
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Role: All
                </option>

                <option value="pm">
                  Project Manager
                </option>

                <option value="tl">
                  Team Lead
                </option>
              </select>

              <select
                className="admin-filter-select"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target.value
                  )
                }
              >
                <option value="name-az">
                  Name (A-Z)
                </option>

                <option value="name-za">
                  Name (Z-A)
                </option>

                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={loadUsers}
            />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              search={search}
              onAdd={openAddModal}
            />
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-mail-table">
                <thead>
                  <tr>
                    <th>TEAM MEMBER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th className="right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const userId =
                      user.id || user._id;

                    const isActive =
                      user.active !== false;

                    return (
                      <tr key={userId}>
                        <td>
                          <div className="team-member-cell">
                            <div className="team-member-avatar">
                              {user.name
                                ? user.name.trim().charAt(0).toUpperCase()
                                : "U"}
                            </div>

                            <div>
                              <strong>
                                {formatTeamMemberName(user.name)}
                              </strong>

                              <small>
                                {user.role ===
                                "admin"
                                  ? "System Administrator"
                                  : "METIS Team"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-muted">
                            {user.email}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`team-role-badge ${user.role}`}
                          >
                            {formatRole(
                              user.role
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`team-status-badge ${
                              isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <span />
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        <td className="right">
                          <div className="team-actions">
                            <button
                              type="button"
                              className="team-action-button"
                              onClick={() =>
                                openEditModal(
                                  user
                                )
                              }
                              title="Edit user"
                            >
                              <Edit3
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              className="team-action-button"
                              onClick={() =>
                                toggleUserStatus(
                                  user
                                )
                              }
                              title={
                                isActive
                                  ? "Deactivate user"
                                  : "Activate user"
                              }
                            >
                              {isActive ? (
                                <X
                                  size={14}
                                />
                              ) : (
                                <CheckCircle2
                                  size={14}
                                />
                              )}
                            </button>

                            {user.role !==
                              "admin" && (
                              <button
                                type="button"
                                className="team-action-button danger"
                                onClick={() =>
                                  deleteUser(
                                    user
                                  )
                                }
                                title="Delete user"
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-table-footer">
            <span>
              {filteredUsers.length} team member
              {filteredUsers.length === 1
                ? ""
                : "s"} displayed
            </span>

            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </section>
      </main>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div
          className="team-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="team-modal">
            <div className="team-modal-header">
              <div>
                <span>
                  {editingUser
                    ? "ACCOUNT MANAGEMENT"
                    : "NEW TEAM ACCOUNT"}
                </span>

                <h2>
                  {editingUser
                    ? "Edit Team Member"
                    : "Add Team Member"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="team-modal-form"
              onSubmit={handleSubmit}
            >
              <div className="team-form-grid">
                <label>
                  <span>Full Name</span>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                  />
                </label>

                <label>
                  <span>Email Address</span>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  <span>Role</span>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                  >
                    <option value="pm">
                      Project Manager
                    </option>

                    <option value="tl">
                      Team Lead
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    {editingUser
                      ? "New Password"
                      : "Password"}
                  </span>

                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    autoComplete={
                      editingUser
                        ? "new-password"
                        : "new-password"
                    }
                  />
                </label>
              </div>

              <label className="team-active-toggle">
                <input
                  name="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={handleFormChange}
                />

                <span>
                  <strong>
                    Account Active
                  </strong>

                  <small>
                    Allow this user to sign in to
                    METIS.
                  </small>
                </span>
              </label>

              <div className="team-modal-actions">
                <button
                  type="button"
                  className="team-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="team-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          className={`team-toast ${
            toast.success
              ? "success"
              : "error"
          }`}
        >
          <div>
            {toast.success ? (
              <CheckCircle2 size={16} />
            ) : (
              <X size={16} />
            )}
          </div>

          <section>
            <strong>
              {toast.title}
            </strong>

            <span>
              {toast.message}
            </span>
          </section>

          <button
            type="button"
            onClick={() => setToast(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
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

      <div
        className={`metric-icon ${iconClass}`}
      >
        {icon}
      </div>
    </div>

    <div className="metric-value-row">
      <strong>{value}</strong>
    </div>

    <small>{description}</small>
  </div>
);

const LoadingState = () => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <RefreshCw size={28} />
    </div>

    <h3>Loading team members...</h3>

    <p>
      Fetching accounts from the METIS database.
    </p>
  </div>
);

const ErrorState = ({
  message,
  onRetry,
}) => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <X size={28} />
    </div>

    <h3>Unable to load team</h3>

    <p>{message}</p>

    <button
      type="button"
      onClick={onRetry}
    >
      Retry
    </button>
  </div>
);

const EmptyState = ({
  search,
  onAdd,
}) => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <UserRound size={28} />
    </div>

    <h3>
      {search
        ? "No team members found"
        : "No team members yet"}
    </h3>

    <p>
      {search
        ? "Try changing your search or filters."
        : "Create the first PM or TL account."}
    </p>

    {!search && (
      <button
        type="button"
        onClick={onAdd}
      >
        <Plus size={15} />
        Add Team Member
      </button>
    )}
  </div>
);

export default TeamManagementPage;