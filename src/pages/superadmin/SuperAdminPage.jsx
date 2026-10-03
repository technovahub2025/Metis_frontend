import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FolderKanban,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Package,
  ClipboardList,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import { apiRequest } from "../../lib/api";

const SuperAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setError("");

        const [usersRes, projectsRes] =
          await Promise.all([
            apiRequest("/api/users?limit=500").catch(() => ({
              users: [],
            })),
            apiRequest("/api/projects?limit=500").catch(() => ({
              data: [],
            })),
          ]);

        if (!cancelled) {
          setUsers(
            Array.isArray(usersRes?.users)
              ? usersRes.users
              : []
          );
          setProjects(
            Array.isArray(projectsRes?.data)
              ? projectsRes.data
              : Array.isArray(projectsRes)
              ? projectsRes
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load system data"
          );
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const allUsers = users;

    const byRole = (role) =>
      allUsers.filter(
        (u) =>
          String(u.role).toLowerCase() ===
          role
      ).length;

    const projectsAwaitingPM = projects.filter(
      (p) => !p.pm
    ).length;

    const projectsAssignedPM = projects.filter(
      (p) => p.pm
    ).length;

    const projectsAssignedTL = projects.filter(
      (p) => p.tl
    ).length;

    const isCompleted = (stage) =>
      String(stage || "")
        .toLowerCase() === "completed" ||
      String(stage || "")
        .toLowerCase() === "closure";

    const isOnHold = (emailStage) =>
      String(emailStage || "")
        .toLowerCase() === "hold";

    const projectsInProgress = projects.filter(
      (p) =>
        p.pm &&
        !isOnHold(p.emailStage) &&
        !isCompleted(p.projectStage)
    ).length;

    const projectsOnHold = projects.filter(
      (p) => isOnHold(p.emailStage)
    ).length;

    const projectsCompleted = projects.filter(
      (p) => isCompleted(p.projectStage)
    ).length;

    return {
      totalUsers: allUsers.length,
      totalAdmins: byRole("admin"),
      totalPMs: byRole("pm"),
      totalTLs: byRole("tl"),
      totalProjects: projects.length,
      projectsAwaitingPM,
      projectsAssignedPM,
      projectsAssignedTL,
      projectsInProgress,
      projectsOnHold,
      projectsCompleted,
    };
  }, [users, projects]);

  return (
    <main className="admin-content">
      <AdminHeader
        title="Super Admin Dashboard"
        subtitle="System-wide overview and controls"
      />

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991d1d",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <section className="admin-metrics">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          description="Registered system users"
          icon={<Users size={17} />}
          iconClass="blue"
        />

        <MetricCard
          title="Total Admins"
          value={metrics.totalAdmins}
          description="Admin role users"
          icon={<ShieldCheck size={17} />}
          iconClass="purple"
        />

        <MetricCard
          title="Total PMs"
          value={metrics.totalPMs}
          description="Project Manager users"
          icon={<UserCheck size={17} />}
          iconClass="green"
        />

        <MetricCard
          title="Total TLs"
          value={metrics.totalTLs}
          description="Team Lead users"
          icon={<UserX size={17} />}
          iconClass="amber"
        />
      </section>

      <section className="admin-metrics">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          description="All projects in METIS"
          icon={<FolderKanban size={17} />}
          iconClass="blue"
        />

        <MetricCard
          title="Awaiting PM"
          value={metrics.projectsAwaitingPM}
          description="Projects pending PM assignment"
          icon={<Package size={17} />}
          iconClass="amber"
          highlighted
        />

        <MetricCard
          title="Assigned to PM"
          value={metrics.projectsAssignedPM}
          description="Projects transferred to PM"
          icon={<CheckCircle2 size={17} />}
          iconClass="green"
        />

        <MetricCard
          title="Assigned to TL"
          value={metrics.projectsAssignedTL}
          description="Projects with active TL"
          icon={<ClipboardList size={17} />}
          iconClass="blue"
        />
      </section>

      <section className="admin-metrics">
        <MetricCard
          title="In Progress"
          value={metrics.projectsInProgress}
          description="Projects actively being worked"
          icon={<BarChart3 size={17} />}
          iconClass="blue"
        />

        <MetricCard
          title="On Hold"
          value={metrics.projectsOnHold}
          description="Projects currently on hold"
          icon={<PauseCircle size={17} />}
          iconClass="red"
        />

        <MetricCard
          title="Completed"
          value={metrics.projectsCompleted}
          description="Finished projects"
          icon={<CheckCircle2 size={17} />}
          iconClass="green"
        />

        <MetricCard
          title="Awaiting Action"
          value={
            metrics.projectsAwaitingPM
          }
          description="Needs PM dispatch"
          icon={<Package size={17} />}
          iconClass="amber"
          highlighted
          badge="Action"
        />
      </section>
    </main>
  );
};

const MetricCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
  highlighted,
  badge,
}) => {
  return (
    <div
      className={`admin-metric-card ${
        highlighted ? "highlighted" : ""
      }`}
    >
      <div className="metric-top">
        <span>{title}</span>
        <div className={`metric-icon ${iconClass}`}>
          {icon}
        </div>
      </div>

      <div className="metric-value-row">
        <strong>{value}</strong>
        {badge && (
          <span className="metric-badge">
            {badge}
          </span>
        )}
      </div>

      <small>{description}</small>
    </div>
  );
};

export default SuperAdminPage;
