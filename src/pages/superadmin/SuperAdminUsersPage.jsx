import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Filter,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import { apiRequest } from "../../lib/api";

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "pm", label: "Project Manager" },
  { value: "tl", label: "Team Lead" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "pm",
  active: true,
};

const SuperAdminUsersPage = () => {
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
    setToast({ title, message, success });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/api/users?limit=500"
      );

      const list =
        response?.users ||
        response?.data ||
        [];

      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err?.message ||
          "Unable to load system users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = users.filter((user) => {
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
        return String(a.name || "")
          .localeCompare(String(b.name || ""));
      }
      if (sortOption === "name-za") {
        return String(b.name || "")
          .localeCompare(String(a.name || ""));
      }
      if (sortOption === "newest") {
        return (
          new Date(b.createdAt || b._id) -
          new Date(a.createdAt || a._id)
        );
      }
      return (
        new Date(a.createdAt || a._id) -
        new Date(b.createdAt || b._id)
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    sortOption,
  ]);

  const statistics = useMemo(() => {
    return {
      total: users.length,
      superAdmins: users.filter(
        (user) => user.role === "super_admin"
      ).length,
      admins: users.filter(
        (user) => user.role === "admin"
      ).length,
      pms: users.filter(
        (user) => user.role === "pm"
      ).length,
      tls: users.filter(
        (user) => user.role === "tl"
      ).length,
      active: users.filter(
        (user) => user.active !== false
      ).length,
    };
  }, [users]);

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
          email: form.email
            .trim()
            .toLowerCase(),
          role: form.role,
          active: form.active,
        };

        if (form.password.trim()) {
          body.password = form.password;
        }

        const userId =
          editingUser.id || editingUser._id;

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
          `${form.name} has been added to the system.`
        );
      }

      closeModal();
      await loadUsers();
    } catch (err) {
      console.error("Failed to save user:", err);

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
    const confirmed =
      window.confirm(
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
      console.error("Failed to delete user:", err);

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

  const formatRole = (role) => {
    const found = ROLES.find(
      (r) => r.value === role
    );
    return found
      ? found.label
      : role || "Unknown";
  };

  return (
    <>
      <AdminHeader
        title="User Management"
        subtitle="Manage all system users and their roles"
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search users..."
        onRefresh={loadUsers}
        actions={
          <button
            type="button"
            className="admin-add-mail-button"
            onClick={openAddModal}
          >
            <Plus size={15} />
            <span>Add User</span>
          </button>
        }
      />

      <main className="admin-content">
        <section className="admin-metrics">
          <MetricCard
            title="Total Users"
            value={statistics.total}
            description="All system accounts"
            icon={<UserRound size={17} />}
            iconClass="blue"
          />

          <MetricCard
            title="Super Admins"
            value={statistics.superAdmins}
            description="Super Admin accounts"
            icon={<Shield size={17} />}
            iconClass="purple"
          />

          <MetricCard
            title="Admins"
            value={statistics.admins}
            description="Admin accounts"
            icon={<Shield size={17} />}
            iconClass="amber"
          />

          <MetricCard
            title="Active"
            value={statistics.active}
            description="Currently active accounts"
            icon={<CheckCircle2 size={17} />}
            iconClass="green"
          />
        </section>

        <section className="admin-queue-card">
          <div className="admin-queue-header">
            <div className="admin-queue-title">
              <span />
              <div>
                <div className="admin-queue-heading-row">
                  <h2>System Users</h2>

                  <span className="admin-showing-badge">
                    Showing {filteredUsers.length} of{" "}
                    {users.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-control-top">
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

                  {ROLES.map((role) => (
                    <option
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </option>
                  ))}
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

              <button
                type="button"
                className="admin-clear-btn"
                onClick={resetFilters}
              >
                <Filter size={14} />
                Clear Filters
              </button>
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

                    const isProtected =
                      user.role === "admin" ||
                      user.role === "super_admin";

                    return (
                      <tr key={userId}>
                        <td>
                          <div className="team-member-cell">
                            <div className="team-member-avatar">
                              {getInitials(
                                user.name
                              )}
                            </div>

                            <div>
                              <strong>
                                {user.name ||
                                  "Unnamed User"}
                              </strong>

                              <small>
                                {user.role ===
                                  "admin"
                                  ? "System Administrator"
                                  : user.role ===
                                    "super_admin"
                                  ? "System Super Admin"
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
                                openEditModal(user)
                              }
                              title="Edit user"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              type="button"
                              className="team-action-button"
                              onClick={() =>
                                toggleUserStatus(user)
                              }
                              title={
                                isActive
                                  ? "Deactivate user"
                                  : "Activate user"
                              }
                            >
                              {isActive ? (
                                <X size={14} />
                              ) : (
                                <CheckCircle2
                                  size={14}
                                />
                              )}
                            </button>

                            {!isProtected && (
                              <button
                                type="button"
                                className="team-action-button danger"
                                onClick={() =>
                                  deleteUser(user)
                                }
                                title="Delete user"
                              >
                                <Trash2 size={14} />
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
              {filteredUsers.length} user
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
                    : "NEW USER ACCOUNT"}
                </span>

                <h2>
                  {editingUser
                    ? "Edit User"
                    : "Create New User"}
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
                    {ROLES.map((role) => (
                      <option
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </option>
                    ))}
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
                        ? "Leave blank to keep current"
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
                  <strong>Account Active</strong>
                  <small>
                    Allow this user to sign in
                    to METIS.
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

      {toast && (
        <div
          className={`team-toast ${
            toast.success ? "success" : "error"
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
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
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

const LoadingState = () => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <RefreshCw size={28} />
    </div>
    <h3>Loading system users...</h3>
    <p>
      Fetching accounts from the METIS
      database.
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <X size={28} />
    </div>
    <h3>Unable to load users</h3>
    <p>{message}</p>
    <button type="button" onClick={onRetry}>
      Retry
    </button>
  </div>
);

const EmptyState = ({ search, onAdd }) => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <UserRound size={28} />
    </div>
    <h3>
      {search
        ? "No users found"
        : "No system users yet"}
    </h3>
    <p>
      {search
        ? "Try changing your search or filters."
        : "Create the first user account."}
    </p>
    {!search && (
      <button type="button" onClick={onAdd}>
        <Plus size={15} />
        Add User
      </button>
    )}
  </div>
);

export default SuperAdminUsersPage;
