import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BarChart3,
  CheckCircle2,
  Download,
  Filter,
  FolderKanban,
  Package,
  PauseCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useApiList } from "../../lib/useApiList";
import AdminHeader from "../../components/AdminHeader";

const COLORS = [
  "#2563eb", "#d97706", "#059669",
  "#e11d48", "#8b5cf6", "#0ea5e9",
  "#84cc16", "#f97316", "#06b6d4",
  "#8181cf",
];

const DONUT_COLORS = [
  "#2563eb", "#d97706", "#059669",
  "#e11d48", "#8b5cf6", "#0ea5e9",
  "#84cc16", "#f97316", "#06b6d4",
  "#8181cf",
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May",
  "Jun", "Jul", "Aug", "Sep", "Oct",
  "Nov", "Dec",
];

const getProjectAge = (project) => {
  const dateStr = project.mailDate || project.createdAt;
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date)) return "—";
  const days = Math.floor(
    (Date.now() - date) / (1000 * 60 * 60 * 24)
  );
  return `${days} days`;
};

const SuperAdminReportsPage = () => {
  const {
    data: projects,
    loading,
    error,
    refetch,
  } = useApiList("/api/projects", {
    limit: 500,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const [search, setSearch] = useState("");
  const [filterPM, setFilterPM] = useState("all");
  const [filterTL, setFilterTL] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterEmailStage, setFilterEmailStage] =
    useState("all");
  const [filterStatus, setFilterStatus] =
    useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState(null);
  const [drillSearch, setDrillSearch] = useState("");
  const [selectedProject, setSelectedProject] =
    useState(null);

  const chartRefs = useRef({});

  /*
   * ----------------------------------------------------------------
   * HELPERS — derived fields
   * ----------------------------------------------------------------
   */

  const getPMName = (project) =>
    project.pmName ||
    project.pm?.name ||
    project.pmEmail ||
    project.pm ||
    "";

   const getTLName = (project) =>
     project.assignedTL ||
     project.tlName ||
     project.tl?.name ||
     project.tlEmail ||
     project.tl ||
     "";

   const hasPM = (project) =>
    !!(
      project.pmId ||
      project.pmEmail ||
      project.pmName ||
      (typeof project.pm === "string" &&
        project.pm) ||
      (typeof project.pm === "object" &&
        project.pm)
    );

   const hasTL = (project) =>
    !!(
      project.tlId ||
      project.tlEmail ||
      project.tlName ||
      project.assignedTL ||
      (typeof project.tl === "string" &&
        project.tl) ||
      (typeof project.tl === "object" &&
        project.tl)
    );

  const isCompleted = (stage) =>
    String(stage || "")
      .toLowerCase() === "completed" ||
    String(stage || "")
      .toLowerCase() === "closure";

  const isOnHold = (emailStage) =>
    String(emailStage || "")
      .toLowerCase() === "hold";

  const isDropped = (stage) =>
    String(stage || "")
      .toLowerCase() === "dropped";

  const getProjectStatus = (project) => {
    const stage = String(
      project.projectStage || ""
    ).toLowerCase();
    const emailStage = String(
      project.emailStage || ""
    ).toLowerCase();

    if (stage === "dropped") return "Dropped";
    if (
      stage === "completed" ||
      stage === "closure"
    )
      return "Completed";
    if (emailStage === "hold") return "On Hold";
    if (hasPM(project)) return "In Progress";
    return "Awaiting PM";
  };


  /*
   * ----------------------------------------------------------------
   * COMPUTED FILTERS — unique options from data
   * ----------------------------------------------------------------
   */

  const pmOptions = useMemo(() => {
    const seen = new Map();
    projects.forEach((project) => {
      const name = getPMName(project);
      if (!name) return;
      const key = String(name)
        .toLowerCase()
        .trim();
      if (!seen.has(key)) {
        seen.set(key, name);
      }
    });
    return Array.from(seen.values()).sort(
      (a, b) =>
        String(a).localeCompare(String(b))
    );
  }, [projects]);

  const tlOptions = useMemo(() => {
    const seen = new Map();
    projects.forEach((project) => {
      const name = getTLName(project);
      if (!name) return;
      const key = String(name)
        .toLowerCase()
        .trim();
      if (!seen.has(key)) {
        seen.set(key, name);
      }
    });
    return Array.from(seen.values()).sort(
      (a, b) =>
        String(a).localeCompare(String(b))
    );
  }, [projects]);

  const projectTypeOptions = useMemo(() => {
    const seen = new Set();
    projects.forEach((project) => {
      if (project.projectType) {
        seen.add(project.projectType);
      }
    });
    return Array.from(seen).sort();
  }, [projects]);

  const projectStageOptions = useMemo(() => {
    const seen = new Set();
    projects.forEach((project) => {
      if (project.projectStage) {
        seen.add(project.projectStage);
      }
    });
    return Array.from(seen);
  }, [projects]);

  const emailStageOptions = useMemo(() => {
    const seen = new Set();
    projects.forEach((project) => {
      if (project.emailStage) {
        seen.add(project.emailStage);
      }
    });
    return Array.from(seen);
  }, [projects]);

  const statusOptions = useMemo(() => {
    const seen = new Set();
    projects.forEach((project) => {
      if (project.status) {
        seen.add(project.status);
      }
    });
    return Array.from(seen);
  }, [projects]);

  /*
   * ----------------------------------------------------------------
   * FILTERED PROJECTS
   * ----------------------------------------------------------------
   */

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        String(project.projectName || "")
          .toLowerCase()
          .includes(query) ||
        String(project.projectCode || "")
          .toLowerCase()
          .includes(query) ||
        String(project.subject || "")
          .toLowerCase()
          .includes(query) ||
        String(getPMName(project) || "")
          .toLowerCase()
          .includes(query) ||
        String(getTLName(project) || "")
          .toLowerCase()
          .includes(query);

      const matchesPM =
        filterPM === "all" ||
        String(getPMName(project) || "") ===
          filterPM;

      const matchesTL =
        filterTL === "all" ||
        String(getTLName(project) || "") ===
          filterTL;

      const matchesType =
        filterType === "all" ||
        project.projectType === filterType;

      const matchesStage =
        filterStage === "all" ||
        project.projectStage === filterStage;

      const matchesEmailStage =
        filterEmailStage === "all" ||
        project.emailStage === filterEmailStage;

      const matchesStatus =
        filterStatus === "all" ||
        project.status === filterStatus;

      let matchesDate = true;
      if (dateFrom) {
        const from =
          new Date(dateFrom).getTime();
        const projDate =
          new Date(
            project.mailDate ||
              project.createdAt ||
              0
          ).getTime();
        matchesDate = projDate >= from;
      }
      if (matchesDate && dateTo) {
        const to =
          new Date(dateTo).getTime();
        const projDate =
          new Date(
            project.mailDate ||
              project.createdAt ||
              0
          ).getTime();
        matchesDate = projDate <= to;
      }

      return (
        matchesSearch &&
        matchesPM &&
        matchesTL &&
        matchesType &&
        matchesStage &&
        matchesEmailStage &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    projects,
    search,
    filterPM,
    filterTL,
    filterType,
    filterStage,
    filterEmailStage,
    filterStatus,
    dateFrom,
    dateTo,
  ]);

  /*
   * ----------------------------------------------------------------
   * METRICS — calculated from filtered projects
   * ----------------------------------------------------------------
   */

  const metrics = useMemo(() => {
    const list = filteredProjects;

    const total = list.length;
    const countAssigned = list.filter(
      (p) => hasPM(p)
    ).length;
    const countAwaitingPM = list.filter(
      (p) => !hasPM(p)
    ).length;
    const countAssignedTL = list.filter(
      (p) => hasTL(p)
    ).length;
    const countAwaitingTL = list.filter(
      (p) => hasPM(p) && !hasTL(p)
    ).length;
    const countInProgress = list.filter(
      (p) =>
        hasPM(p) &&
        !isOnHold(p.emailStage) &&
        !isCompleted(p.projectStage) &&
        !isDropped(p.projectStage)
    ).length;
    const countOnHold = list.filter((p) =>
      isOnHold(p.emailStage)
    ).length;
    const countCompleted = list.filter((p) =>
      isCompleted(p.projectStage)
    ).length;

    return {
      totalProjects: total,
      assignedPM: countAssigned,
      awaitingPM: countAwaitingPM,
      assignedTL: countAssignedTL,
      awaitingTL: countAwaitingTL,
      inProgress: countInProgress,
      onHold: countOnHold,
      completed: countCompleted,
    };
  }, [filteredProjects]);

  /*
   * ----------------------------------------------------------------
   * CHART DATA
   * ----------------------------------------------------------------
   */

  const statusChartData = useMemo(() => {
    const counts = {};

    filteredProjects.forEach((project) => {
      const status = getProjectStatus(project);
      counts[status] = (counts[status] || 0) + 1;
    });

    const total = Object.values(counts).reduce(
      (a, b) => a + b,
      0
    );

    return Object.entries(counts)
      .map(([label, count], i) => ({
        label,
        count,
        percentage: total
          ? Math.round((count / total) * 100)
          : 0,
        color:
          DONUT_COLORS[
            i % DONUT_COLORS.length
          ],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  const stageChartData = useMemo(() => {
    const counts = {};

    filteredProjects.forEach((project) => {
      const stage =
        project.projectStage || "Unknown";
      counts[stage] = (counts[stage] || 0) + 1;
    });

    const maxCount = Math.max(
      ...Object.values(counts),
      1
    );

    return Object.entries(counts)
      .map(([label, count], i) => ({
        label,
        count,
        percentage:
          Math.round((count / maxCount) * 100),
        color:
          COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  const pmWorkloadData = useMemo(() => {
    const counts = {};

    filteredProjects.forEach((project) => {
      if (hasPM(project)) {
        const name = getPMName(project) || "Unassigned";
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([label, count], i) => ({
        label,
        count,
        color:
          COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  const tlWorkloadData = useMemo(() => {
    const counts = {};

    filteredProjects.forEach((project) => {
      if (hasTL(project)) {
        const name = getTLName(project);
        counts[name] = (counts[name] || 0) + 1;
      } else {
        counts["Unassigned"] =
          (counts["Unassigned"] || 0) + 1;
      }
    });

    const total = Object.values(counts).reduce(
      (a, b) => a + b,
      0
    );

    return Object.entries(counts)
      .map(([label, count], i) => ({
        label,
        count,
        percentage: total
          ? Math.round((count / total) * 100)
          : 0,
        color:
          DONUT_COLORS[
            i % DONUT_COLORS.length
          ],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  const projectTypeData = useMemo(() => {
    const counts = {};

    filteredProjects.forEach((project) => {
      const type =
        project.projectType || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });

    const total = Object.values(counts).reduce(
      (a, b) => a + b,
      0
    );

    return Object.entries(counts)
      .map(([label, count], i) => ({
        label,
        count,
        percentage: total
          ? Math.round((count / total) * 100)
          : 0,
        color:
          DONUT_COLORS[
            i % DONUT_COLORS.length
          ],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  const emailStageData = useMemo(() => {
    const counts = {};

    filteredProjects.forEach((project) => {
      const stage =
        project.emailStage || "Unknown";
      counts[stage] = (counts[stage] || 0) + 1;
    });

    const maxCount = Math.max(
      ...Object.values(counts),
      1
    );

    return Object.entries(counts)
      .map(([label, count], i) => ({
        label,
        count,
        percentage:
          Math.round((count / maxCount) * 100),
        color:
          COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  const projectTrendData = useMemo(() => {
    const monthCounts = {};
    const yearCounts = {};

    let earliest = null;
    let latest = null;

    filteredProjects.forEach((project) => {
      const dateStr =
        project.mailDate ||
        project.createdAt;
      if (!dateStr) return;

      const date = new Date(dateStr);
      if (isNaN(date)) return;

      const ym = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthCounts[ym] =
        (monthCounts[ym] || 0) + 1;
      yearCounts[date.getFullYear()] =
        (yearCounts[date.getFullYear()] || 0) + 1;

      if (!earliest || date < earliest) {
        earliest = date;
      }
      if (!latest || date > latest) {
        latest = date;
      }
    });

    if (
      !earliest ||
      !latest ||
      Object.keys(monthCounts).length === 0
    ) {
      return [];
    }

    const result = [];
    const cur = new Date(
      earliest.getFullYear(),
      earliest.getMonth(),
      1
    );
    const end = new Date(
      latest.getFullYear(),
      latest.getMonth(),
      1
    );

    while (cur <= end) {
      const ym = `${cur.getFullYear()}-${String(
        cur.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = `${
        MONTH_NAMES[cur.getMonth()]
      } ${cur.getFullYear()}`;
      result.push({
        label,
        count: monthCounts[ym] || 0,
      });
      cur.setMonth(cur.getMonth() + 1);
    }

    return result;
  }, [filteredProjects]);

  /*
   * ----------------------------------------------------------------
   * DRILL-DOWN
   * ----------------------------------------------------------------
   */

  const matchesCategory = (project, category) => {
    if (!category) return false;

    const { type, value } = category;

    switch (type) {
      case "status":
        return getProjectStatus(project) === value;

      case "stage":
        return project.projectStage === value;

      case "pm":
        return getPMName(project) === value;

      case "tl":
        if (value === "Unassigned") {
          return !hasTL(project);
        }
        return getTLName(project) === value;

      case "type":
        return project.projectType === value;

      case "emailStage":
        return project.emailStage === value;

      case "summary": {
        switch (value) {
          case "total":
            return true;
          case "assignedPM":
            return hasPM(project);
          case "awaitingPM":
            return !hasPM(project);
          case "assignedTL":
            return hasTL(project);
          case "awaitingTL":
            return (
              hasPM(project) && !hasTL(project)
            );
          case "completed":
            return isCompleted(
              project.projectStage
            );
          case "onHold":
            return isOnHold(project.emailStage);
          case "inProgress":
            return (
              hasPM(project) &&
              !isOnHold(project.emailStage) &&
              !isCompleted(
                project.projectStage
              ) &&
              !isDropped(
                project.projectStage
              )
            );
          default:
            return false;
        }
      }

      default:
        return false;
    }
  };

  const drillDownProjects = useMemo(() => {
    if (!selectedCategory) return [];

    return filteredProjects.filter((project) =>
      matchesCategory(project, selectedCategory)
    );
  }, [filteredProjects, selectedCategory]);

  const drillDownFiltered = useMemo(() => {
    const query = drillSearch.trim().toLowerCase();

    if (!query) return drillDownProjects;

    return drillDownProjects.filter((project) => {
      return (
        String(project.projectName || "")
          .toLowerCase()
          .includes(query) ||
        String(project.projectCode || "")
          .toLowerCase()
          .includes(query) ||
        String(getPMName(project) || "")
          .toLowerCase()
          .includes(query) ||
        String(getTLName(project) || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [drillDownProjects, drillSearch]);

  const getDrillDownTitle = () => {
    if (!selectedCategory) return "";

    if (selectedCategory.type === "summary") {
      const titles = {
        total: "All Projects",
        assignedPM: "Assigned PM Projects",
        awaitingPM: "Awaiting PM Assignment",
        assignedTL: "Assigned TL Projects",
        awaitingTL: "Awaiting TL Assignment",
        completed: "Completed Projects",
        onHold: "On Hold Projects",
        inProgress: "In Progress Projects",
      };
      return titles[selectedCategory.value] || selectedCategory.label;
    }

    return selectedCategory.label;
  };

  const handleCategoryClick = (type, value, label) => {
    setSelectedCategory({ type, value, label });
    setDrillSearch("");
    setSelectedProject(null);
    setTimeout(() => {
      const el = document.getElementById(
        "drill-down-section"
      );
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    setDrillSearch("");
    setSelectedProject(null);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseProjectModal = () => {
    setSelectedProject(null);
  };

  /*
   * ----------------------------------------------------------------
   * EFFECTS — canvas redraw
   * ----------------------------------------------------------------
   */

  useEffect(() => {
    const canvas =
      chartRefs.current.donut;

    if (
      !canvas ||
      !canvas.getContext ||
      statusChartData.length === 0
    )
      return;

    const ctx = canvas.getContext("2d");
    const rect = canvas
      .getBoundingClientRect();
    const dpr =
      window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius =
      Math.min(centerX, centerY) * 0.7;

    const total = statusChartData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    if (total === 0) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }

    let startAngle = 0;

    ctx.clearRect(0, 0, rect.width, rect.height);

    statusChartData.forEach((item) => {
      const sliceAngle =
        (item.count / total) *
        2 *
        Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        startAngle,
        startAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    if (total > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius * 0.55,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = `bold ${Math.max(
        16,
        radius * 0.22
      )}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        total.toString(),
        centerX,
        centerY - 4
      );
      ctx.font = `normal ${Math.max(
        9,
        radius * 0.1
      )}px sans-serif`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(
        "Total",
        centerX,
        centerY + 10
      );
    }
  }, [statusChartData]);

  useEffect(() => {
    const canvas = chartRefs.current.tlDonut;
    if (
      !canvas ||
      !canvas.getContext ||
      tlWorkloadData.length === 0
    )
      return;

    const ctx = canvas.getContext("2d");
    const rect = canvas
      .getBoundingClientRect();
    const dpr =
      window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius =
      Math.min(centerX, centerY) * 0.7;

    const total = tlWorkloadData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    if (total === 0) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }

    let startAngle = 0;

    ctx.clearRect(0, 0, rect.width, rect.height);

    tlWorkloadData.forEach((item) => {
      const sliceAngle =
        (item.count / total) *
        2 *
        Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        startAngle,
        startAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });
  }, [tlWorkloadData]);

  useEffect(() => {
    const canvas = chartRefs.current.typeDonut;
    if (
      !canvas ||
      !canvas.getContext ||
      projectTypeData.length === 0
    )
      return;

    const ctx = canvas.getContext("2d");
    const rect = canvas
      .getBoundingClientRect();
    const dpr =
      window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius =
      Math.min(centerX, centerY) * 0.7;

    const total = projectTypeData.reduce(
      (sum, item) => sum + item.count,
      0
    );

    if (total === 0) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }

    let startAngle = 0;

    ctx.clearRect(0, 0, rect.width, rect.height);

    projectTypeData.forEach((item) => {
      const sliceAngle =
        (item.count / total) *
        2 *
        Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        startAngle,
        startAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });
  }, [projectTypeData]);

  useEffect(() => {
    const canvas = chartRefs.current.pmColumn;
    if (
      !canvas ||
      !canvas.getContext ||
      pmWorkloadData.length === 0
    )
      return;

    const ctx = canvas.getContext("2d");
    const rect = canvas
      .getBoundingClientRect();
    const dpr =
      window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = {
      top: 20,
      right: 20,
      bottom: 60,
      left: 60,
    };

    const plotW =
      rect.width -
      padding.left -
      padding.right;
    const plotH =
      rect.height -
      padding.top -
      padding.bottom;

    const maxCount = Math.max(
      ...pmWorkloadData.map((d) => d.count),
      1
    );

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.font = "11px sans-serif";
    ctx.textAlign = "end";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#94a3b8";

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round(
        (maxCount * i) / yTicks
      );
      const y =
        padding.top +
        plotH -
        (i / yTicks) * plotH;
      ctx.fillText(val.toString(), padding.left - 8, y);
    }

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(
      padding.left,
      padding.top + plotH
    );
    ctx.stroke();

    const barW = plotW / pmWorkloadData.length;

    pmWorkloadData.forEach((item, i) => {
      const barH =
        (item.count / maxCount) * plotH;
      const x =
        padding.left +
        i * barW +
        barW * 0.15;
      const w = barW * 0.7;

      ctx.fillStyle = item.color;
      ctx.fillRect(
        x,
        padding.top + plotH - barH,
        w,
        barH
      );
    });

    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#64748b";

    pmWorkloadData.forEach((item, i) => {
      const x =
        padding.left +
        i * barW +
        barW / 2;
      const y =
        padding.top +
        plotH +
        8;

      const maxLen = 18;
      let label = item.label;
      if (label.length > maxLen) {
        label = label.substring(0, maxLen) + "...";
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.4);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  }, [pmWorkloadData]);

  useEffect(() => {
    const canvas = chartRefs.current.line;
    if (
      !canvas ||
      !canvas.getContext ||
      projectTrendData.length === 0
    )
      return;

    const ctx = canvas.getContext("2d");
    const rect = canvas
      .getBoundingClientRect();
    const dpr =
      window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 50,
    };

    const plotW =
      rect.width -
      padding.left -
      padding.right;
    const plotH =
      rect.height -
      padding.top -
      padding.bottom;

    const maxCount = Math.max(
      ...projectTrendData.map((d) => d.count),
      1
    );

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.font = "11px sans-serif";
    ctx.textAlign = "end";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#94a3b8";

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round(
        (maxCount * i) / yTicks
      );
      const y =
        padding.top +
        plotH -
        (i / yTicks) * plotH;
      ctx.fillText(val.toString(), padding.left - 8, y);
    }

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(
      padding.left,
      padding.top + plotH
    );
    ctx.moveTo(
      padding.left,
      padding.top + plotH
    );
    ctx.lineTo(
      padding.left + plotW,
      padding.top + plotH
    );
    ctx.stroke();

    const n = projectTrendData.length;
    const stepX = n > 1 ? plotW / (n - 1) : plotW;

    const points = projectTrendData.map(
      (item, i) => ({
        x:
          padding.left +
          i * stepX,
        y:
          padding.top +
          plotH -
          (item.count / maxCount) * plotH,
      })
    );

    ctx.strokeStyle = COLORS[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.quadraticCurveTo(
          (points[i - 1].x + pt.x) / 2,
          points[i - 1].y,
          pt.x,
          pt.y
        );
      }
    });
    ctx.stroke();

    points.forEach((pt) => {
      ctx.fillStyle = COLORS[0];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#64748b";

    projectTrendData.forEach((item, i) => {
      const x =
        padding.left + i * stepX;
      const len = item.label.length;
      let label = item.label;
      if (len > 6) {
        label = `${item.label
          .split(" ")[0]
          .substring(0, 3)} ${
          item.label.split(" ")[1]
        }`;
      }
      ctx.fillText(label, x, padding.top + plotH + 8);
    });
  }, [projectTrendData]);

  const resetFilters = () => {
    setSearch("");
    setFilterPM("all");
    setFilterTL("all");
    setFilterType("all");
    setFilterStage("all");
    setFilterEmailStage("all");
    setFilterStatus("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    search ||
    filterPM !== "all" ||
    filterTL !== "all" ||
    filterType !== "all" ||
    filterStage !== "all" ||
    filterEmailStage !== "all" ||
    filterStatus !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <>
      <AdminHeader
        title="Reports"
        subtitle="Project and team performance overview"
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search projects..."
        actions={
          <button
            type="button"
            className="admin-icon-button"
            title="Refresh"
            onClick={handleRefresh}
            disabled={loading}
            style={{
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <RefreshCw
              size={16}
              style={{
                animation: loading
                  ? "rotate 1s linear infinite"
                  : "none",
              }}
            />
          </button>
        }
      />

      <main className="admin-content">
        {error ? (
          <ErrorState
            message={
              error?.message ||
              "Failed to load project data"
            }
            onRetry={refetch}
          />
        ) : loading && projects.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <RefreshCw size={28} />
            </div>
            <h3>Loading reports...</h3>
            <p>Please wait while we fetch project data.</p>
          </div>
        ) : (
          <>
            {/* Filters — placed before summary cards */}
            <section className="admin-queue-card">
              <div className="admin-queue-header">
                <div className="admin-queue-title">
                  <span />
                  <div>
                    <div className="admin-queue-heading-row">
                      <h2>Report Filters</h2>
                      <span className="admin-showing-badge">
                        Showing{" "}
                        {filteredProjects.length}{" "}
                        of {projects.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-control-top">
                  <div className="admin-filter-bar">
                    <input
                      type="text"
                      className="admin-filter-select"
                      placeholder="Search projects..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      style={{
                        width: "200px",
                        padding: "6px 8px",
                        fontSize: "12px",
                      }}
                    />

                    <select
                      className="admin-filter-select"
                      value={filterPM}
                      onChange={(e) =>
                        setFilterPM(e.target.value)
                      }
                    >
                      <option value="all">
                        PM: All
                      </option>
                      {pmOptions.map(
                        (pm) => (
                          <option
                            key={pm}
                            value={pm}
                          >
                            {pm}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="admin-filter-select"
                      value={filterTL}
                      onChange={(e) =>
                        setFilterTL(e.target.value)
                      }
                    >
                      <option value="all">
                        TL: All
                      </option>
                      {tlOptions.map(
                        (tl) => (
                          <option
                            key={tl}
                            value={tl}
                          >
                            {tl}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="admin-filter-select"
                      value={filterType}
                      onChange={(e) =>
                        setFilterType(
                          e.target.value
                        )
                      }
                    >
                      <option value="all">
                        Type: All
                      </option>
                      {projectTypeOptions.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="admin-filter-select"
                      value={filterStage}
                      onChange={(e) =>
                        setFilterStage(
                          e.target.value
                        )
                      }
                    >
                      <option value="all">
                        Stage: All
                      </option>
                      {projectStageOptions.map(
                        (stage) => (
                          <option
                            key={stage}
                            value={stage}
                          >
                            {stage}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="admin-filter-select"
                      value={filterEmailStage}
                      onChange={(e) =>
                        setFilterEmailStage(
                          e.target.value
                        )
                      }
                    >
                      <option value="all">
                        Email Stage: All
                      </option>
                      {emailStageOptions.map(
                        (stage) => (
                          <option
                            key={stage}
                            value={stage}
                          >
                            {stage}
                          </option>
                        )
                      )}
                    </select>

                    <select
                      className="admin-filter-select"
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(
                          e.target.value
                        )
                      }
                    >
                      <option value="all">
                        Status: All
                      </option>
                      {statusOptions.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>

                    <input
                      type="date"
                      className="admin-filter-select"
                      value={dateFrom}
                      onChange={(e) =>
                        setDateFrom(
                          e.target.value
                        )
                      }
                      style={{
                        width: "140px",
                        padding: "6px 8px",
                        fontSize: "12px",
                      }}
                    />

                    <input
                      type="date"
                      className="admin-filter-select"
                      value={dateTo}
                      onChange={(e) =>
                        setDateTo(
                          e.target.value
                        )
                      }
                      style={{
                        width: "140px",
                        padding: "6px 8px",
                        fontSize: "12px",
                      }}
                    />
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="admin-clear-btn"
                      onClick={resetFilters}
                    >
                      <Filter size={14} />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Empty State for filtered results */}
            {filteredProjects.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-icon">
                  <Package size={28} />
                </div>
                <h3>
                  No projects match the selected
                  filters
                </h3>
                <p>
                  Try adjusting your filter criteria
                  or resetting all filters.
                </p>
                <button
                  type="button"
                  className="admin-clear-btn"
                  onClick={resetFilters}
                >
                  <Filter size={14} />
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <section className="admin-metrics">
                  <MetricCard
                    title="Total Projects"
                    value={metrics.totalProjects}
                    description="All filtered projects"
                    icon={
                      <FolderKanban size={17} />
                    }
                    iconClass="blue"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "total",
                        "Total Projects"
                      )
                    }
                  />

                  <MetricCard
                    title="Assigned PM"
                    value={metrics.assignedPM}
                    description="Projects with PM assigned"
                    icon={
                      <ShieldCheck size={17} />
                    }
                    iconClass="green"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "assignedPM",
                        "Assigned PM"
                      )
                    }
                  />

                  <MetricCard
                    title="Awaiting PM"
                    value={metrics.awaitingPM}
                    description="Pending PM assignment"
                    icon={
                      <Package size={17} />
                    }
                    iconClass="amber"
                    highlighted
                    badge="Action"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "awaitingPM",
                        "Awaiting PM"
                      )
                    }
                  />

                  <MetricCard
                    title="Assigned TL"
                    value={metrics.assignedTL}
                    description="Projects with TL assigned"
                    icon={
                      <CheckCircle2 size={17} />
                    }
                    iconClass="blue"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "assignedTL",
                        "Assigned TL"
                      )
                    }
                  />
                </section>

                <section className="admin-metrics">
                  <MetricCard
                    title="Awaiting TL"
                    value={metrics.awaitingTL}
                    description="PM assigned, no TL"
                    icon={
                      <UserRound size={17} />
                    }
                    iconClass="amber"
                    highlighted
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "awaitingTL",
                        "Awaiting TL"
                      )
                    }
                  />

                  <MetricCard
                    title="In Progress"
                    value={metrics.inProgress}
                    description="Active projects"
                    icon={
                      <BarChart3 size={17} />
                    }
                    iconClass="blue"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "inProgress",
                        "In Progress"
                      )
                    }
                  />

                  <MetricCard
                    title="On Hold"
                    value={metrics.onHold}
                    description="On hold projects"
                    icon={
                      <PauseCircle size={17} />
                    }
                    iconClass="red"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "onHold",
                        "On Hold"
                      )
                    }
                  />

                  <MetricCard
                    title="Completed"
                    value={metrics.completed}
                    description="Finished projects"
                    icon={
                      <CheckCircle2 size={17} />
                    }
                    iconClass="green"
                    onClick={() =>
                      handleCategoryClick(
                        "summary",
                        "completed",
                        "Completed"
                      )
                    }
                  />
                </section>

                {/* Row 1: Status Donut + Stage Horizontal Bar */}
                <section className="admin-chart-grid">
                  {/* Project Status — Donut */}
                  <ChartCard
                    title="Project Status"
                    icon={
                      <BarChart3 size={16} />
                    }
                  >
                    <div
                      style={{
                        padding: "16px",
                        display: "flex",
                        gap: "32px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          flex: "1",
                          minWidth: "200px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <canvas
                          ref={(el) => {
                            chartRefs.current.donut = el;
                          }}
                          width={200}
                          height={200}
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: "200px",
                        }}
                      >
                        {statusChartData.length === 0 ? (
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "13px",
                            }}
                          >
                            No data available
                          </p>
                        ) : (
                        statusChartData.map(
                            (item) => (
                              <div
                                key={item.label}
                                style={{
                                  marginBottom: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleCategoryClick(
                                    "status",
                                    item.label,
                                    item.label
                                  )
                                }
                              >
                                <span
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "3px",
                                    backgroundColor:
                                      item.color,
                                  }}
                                />
                                <span
                                  style={{
                                    flex: "1",
                                    fontSize: "13px",
                                  }}
                                >
                                  {item.label}
                                </span>
                                <span
                                  style={{
                                    minWidth: "40px",
                                    textAlign: "right",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.count}
                                </span>
                                <span
                                  style={{
                                    minWidth: "40px",
                                    textAlign: "right",
                                    fontSize: "11px",
                                    color: "#94a3b8",
                                  }}
                                >
                                  ({item.percentage}%)
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </ChartCard>

                  {/* Project Stage — Horizontal Bar */}
                  <ChartCard
                    title="Project Stage Distribution"
                    icon={
                      <Package size={16} />
                    }
                  >
                     <div style={{ padding: "16px" }}>
                      <HorizontalBarChart
                        data={stageChartData}
                        onItemClick={(item) =>
                          handleCategoryClick(
                            "stage",
                            item.label,
                            item.label
                          )
                        }
                      />
                    </div>
                  </ChartCard>
                </section>

                {/* Row 2: PM Column + TL Donut */}
                <section className="admin-chart-grid">
                   {/* PM Workload — Vertical Column */}
                   <ChartCard
                     title="PM Workload"
                     icon={
                       <ShieldCheck size={16} />
                     }
                   >
                     <div style={{ padding: "16px" }}>
                       {pmWorkloadData.length === 0 ? (
                         <p
                           style={{
                             color: "#94a3b8",
                             fontSize: "13px",
                           }}
                         >
                           No data available
                         </p>
                       ) : (
                         <canvas
                           ref={(el) => {
                             chartRefs.current.pmColumn = el;
                           }}
                           width={500}
                           height={260}
                           style={{
                             maxWidth: "100%",
                             height: "auto",
                           }}
                         />
                       )}

                       {pmWorkloadData.length > 0 && (
                         <div
                           style={{
                             marginTop: "12px",
                             display: "flex",
                             flexWrap: "wrap",
                             gap: "10px",
                             fontSize: "12px",
                           }}
                         >
                           {pmWorkloadData.map(
                             (item) => (
                               <div
                                 key={item.label}
                                 style={{
                                   display: "flex",
                                   alignItems: "center",
                                   gap: "6px",
                                   cursor:
                                     "pointer",
                                 }}
                                 onClick={() =>
                                   handleCategoryClick(
                                     "pm",
                                     item.label,
                                     item.label
                                   )
                                 }
                               >
                                 <span
                                   style={{
                                     width: "10px",
                                     height: "10px",
                                     borderRadius:
                                       "3px",
                                     backgroundColor:
                                       item.color,
                                   }}
                                 />
                                 <span
                                   style={{
                                     color: "#0f172a",
                                   }}
                                 >
                                   {item.label}
                                 </span>
                                 <span
                                   style={{
                                     color: "#94a3b8",
                                   }}
                                 >
                                   ({item.count})
                                 </span>
                               </div>
                              )
                            )
                          }
                        </div>
                      )}
                      </div>
                    </ChartCard>

                  {/* TL Workload — Donut */}
                  <ChartCard
                    title="TL Workload"
                    icon={
                      <UserRound size={16} />
                    }
                  >
                    <div
                      style={{
                        padding: "16px",
                        display: "flex",
                        gap: "24px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          flex: "1",
                          minWidth: "180px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <canvas
                          ref={(el) => {
                            chartRefs.current.tlDonut = el;
                          }}
                          width={180}
                          height={180}
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: "200px",
                          fontSize: "12px",
                        }}
                      >
                        {tlWorkloadData.length === 0 ? (
                          <p
                            style={{
                              color: "#94a3b8",
                            }}
                          >
                            No data available
                          </p>
                        ) : (
                           tlWorkloadData.map(
                             (item) => (
                               <div
                                 key={item.label}
                                 style={{
                                   marginBottom: "8px",
                                   display: "flex",
                                   alignItems: "center",
                                   gap: "8px",
                                   cursor: "pointer",
                                 }}
                                 onClick={() =>
                                   handleCategoryClick(
                                     "tl",
                                     item.label,
                                     item.label
                                   )
                                 }
                               >
                                <span
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "3px",
                                    backgroundColor:
                                      item.color,
                                  }}
                                />
                                <span
                                  style={{
                                    flex: "1",
                                    color: "#0f172a",
                                  }}
                                >
                                  {item.label}
                                </span>
                                <span
                                  style={{
                                    minWidth: "30px",
                                    textAlign: "right",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.count}
                                </span>
                                <span
                                  style={{
                                    minWidth: "36px",
                                    textAlign: "right",
                                    color: "#94a3b8",
                                  }}
                                >
                                  ({item.percentage}%)
                                </span>
                              </div>
                            )
                          )
                         )}
                      </div>
                    </div>
                    </ChartCard>
                  </section>

                {/* Row 3: Project Type Donut (full width) */}
                <section className="admin-chart-grid">
                  <ChartCard
                    title="Project Type Distribution"
                    icon={
                      <FolderKanban size={16} />
                    }
                  >
                    <div
                      style={{
                        padding: "16px",
                        display: "flex",
                        gap: "24px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          flex: "1",
                          minWidth: "180px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <canvas
                          ref={(el) => {
                            chartRefs.current.typeDonut = el;
                          }}
                          width={180}
                          height={180}
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: "200px",
                          fontSize: "12px",
                          maxHeight: "220px",
                          overflowY: "auto",
                        }}
                      >
                        {projectTypeData.length === 0 ? (
                          <p
                            style={{
                              color: "#94a3b8",
                            }}
                          >
                            No data available
                          </p>
                        ) : (
                           projectTypeData.map(
                             (item) => (
                               <div
                                 key={item.label}
                                 style={{
                                   marginBottom: "8px",
                                   display: "flex",
                                   alignItems: "center",
                                   gap: "8px",
                                   cursor: "pointer",
                                 }}
                                 onClick={() =>
                                   handleCategoryClick(
                                     "type",
                                     item.label,
                                     item.label
                                   )
                                 }
                               >
                                <span
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "3px",
                                    backgroundColor:
                                      item.color,
                                  }}
                                />
                                <span
                                  style={{
                                    flex: "1",
                                    color: "#0f172a",
                                  }}
                                >
                                  {item.label}
                                </span>
                                <span
                                  style={{
                                    minWidth: "30px",
                                    textAlign: "right",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.count}
                                </span>
                                <span
                                  style={{
                                    minWidth: "36px",
                                    textAlign: "right",
                                    color: "#94a3b8",
                                  }}
                                >
                                  ({item.percentage}%)
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </ChartCard>
                 </section>

                {/* Row 4: Email Stage + Projects Over Time */}
                <section className="admin-chart-grid">
                  {/* Email Stage — Horizontal Bar */}
                  <ChartCard
                    title="Email Stage Distribution"
                    icon={
                      <Download size={16} />
                    }
                  >
                    <div style={{ padding: "16px" }}>
                      <HorizontalBarChart
                        data={emailStageData}
                        onItemClick={(item) =>
                          handleCategoryClick(
                            "emailStage",
                            item.label,
                            item.label
                          )
                        }
                      />
                    </div>
                  </ChartCard>

                  {/* Projects Over Time — Line Chart */}
                  <ChartCard
                    title="Projects Over Time"
                    icon={
                      <BarChart3 size={16} />
                    }
                  >
                    <div style={{ padding: "16px" }}>
                      {projectTrendData.length === 0 ? (
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "13px",
                            textAlign: "center",
                            padding: "32px 16px",
                          }}
                        >
                          No date data available
                        </p>
                      ) : (
                        <canvas
                          ref={(el) => {
                            chartRefs.current.line = el;
                          }}
                          width={500}
                          height={260}
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                          }}
                        />
                      )}
                    </div>
                  </ChartCard>
                </section>

                {/* Drill-down Section */}
                {selectedCategory && (
                  <section
                    id="drill-down-section"
                    className="admin-queue-card"
                  >
                    <div className="admin-queue-header">
                      <div className="admin-queue-title">
                        <span>
                          <Search size={16} />
                        </span>
                        <div>
                          <div className="admin-queue-heading-row">
                            <h2>{getDrillDownTitle()}</h2>
                            <span className="admin-showing-badge">
                              {drillDownProjects.length}{" "}
                              project
                              {drillDownProjects.length !== 1
                                ? "s"
                                : ""}{" "}
                              found
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-control-top">
                        <div className="admin-filter-bar">
                          <input
                            type="text"
                            className="admin-filter-select"
                            placeholder="Search projects..."
                            value={drillSearch}
                            onChange={(e) =>
                              setDrillSearch(
                                e.target.value
                              )
                            }
                            style={{
                              width: "200px",
                              padding: "6px 8px",
                              fontSize: "12px",
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          className="admin-clear-btn"
                          onClick={
                            handleClearSelection
                          }
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "16px",
                        overflowX: "auto",
                      }}
                    >
                      {drillDownFiltered.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 16px",
                            color: "#94a3b8",
                          }}
                        >
                          <Package
                            size={24}
                            style={{
                              margin: "0 auto 8px",
                            }}
                          />
                          <p
                            style={{
                              fontSize: "13px",
                            }}
                          >
                            No projects found
                          </p>
                        </div>
                      ) : (
                        <table className="admin-mail-table">
                          <thead>
                            <tr>
                              <th>
                                Project
                              </th>
                              <th>
                                Project Type
                              </th>
                              <th>
                                PM
                              </th>
                              <th>
                                TL
                              </th>
                              <th>
                                Stage
                              </th>
                              <th>
                                Email Stage
                              </th>
                              <th>
                                Status
                              </th>
                              <th>
                                Mail Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {drillDownFiltered.map(
                              (project) => (
                                <tr
                                  key={
                                    project._id ||
                                    project.id ||
                                    project.projectCode
                                  }
                                  onClick={() =>
                                    handleProjectClick(
                                      project
                                    )
                                  }
                                >
                                  <td>
                                    <div
                                      style={{
                                        fontWeight: "500",
                                      }}
                                    >
                                      {project.projectName ||
                                        "—"}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        color: "#94a3b8",
                                      }}
                                    >
                                      {project.projectCode ||
                                        "—"}
                                    </div>
                                  </td>
                                  <td>
                                    {project.projectType ||
                                      "—"}
                                  </td>
                                  <td>
                                    {getPMName(project) ||
                                      "Unassigned"}
                                  </td>
                                  <td>
                                    {getTLName(project) ||
                                      (hasTL(project)
                                        ? ""
                                        : "Unassigned")}
                                  </td>
                                  <td>
                                    {project.projectStage ||
                                      "—"}
                                  </td>
                                  <td>
                                    {project.emailStage ||
                                      "—"}
                                  </td>
                                  <td>
                                    {getProjectStatus(
                                      project
                                    )}
                                  </td>
                                  <td>
                                    {project.mailDate
                                      ? new Date(
                                          project.mailDate
                                        ).toLocaleDateString(
                                          "en-IN"
                                        )
                                      : "—"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </section>
                )}

                {/* Project Details Modal */}
                {selectedProject && (
                  <ProjectDetailsModal
                    project={selectedProject}
                    onClose={
                      handleCloseProjectModal
                    }
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
};

const ChartCard = ({ title, icon, children }) => {
  return (
    <div className="admin-queue-card">
      <div className="admin-queue-header">
        <div className="admin-queue-title">
          <span>{icon}</span>
          <div>
            <div className="admin-queue-heading-row">
              <h2>{title}</h2>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
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
  onClick,
  _clickType,
  _clickValue,
}) => {
  return (
    <div
      className={`admin-metric-card ${
        highlighted ? "highlighted" : ""
      }`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
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

const HorizontalBarChart = ({
  data,
  onItemClick,
}) => {
  if (!data || data.length === 0) {
    return (
      <p
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        No data available
      </p>
    );
  }

  const maxCount = Math.max(
    ...data.map((d) => d.count),
    1
  );

  return (
    <div>
      {data.map((item, i) => {
        const barWidth =
          (item.count / maxCount) * 100;

        return (
          <div
            key={item.label || i}
            style={{
              marginBottom: "10px",
              cursor: onItemClick
                ? "pointer"
                : "default",
            }}
            onClick={onItemClick
              ? () => onItemClick(item)
              : undefined}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  minWidth: "160px",
                  fontSize: "12px",
                  color: "#0f172a",
                  fontWeight: "500",
                }}
              >
                {item.label}
              </span>

              <span
                style={{
                  minWidth: "32px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {item.count}
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "18px",
                backgroundColor: "#f1f5f9",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  backgroundColor: item.color,
                  borderRadius: "4px",
                  transition:
                    "width 0.3s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ErrorState = ({
  message,
  onRetry,
}) => (
  <div className="admin-empty-state">
    <div className="admin-empty-icon">
      <X size={28} />
    </div>
    <h3>Unable to load reports</h3>
    <p>{message}</p>
    <button type="button" onClick={onRetry}>
      Retry
    </button>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      gap: "12px",
      padding: "8px 0",
      borderBottom:
        "1px solid #e2e8f0",
    }}
  >
    <span
      style={{
        minWidth: "120px",
        fontSize: "11px",
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "12px",
        color: "#0f172a",
      }}
    >
      {value}
    </span>
  </div>
);

const ProjectDetailsModal = ({
  project,
  onClose,
}) => {
  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="admin-add-modal"
        style={{
          width: "min(560px, 95%)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div className="admin-drawer-header">
          <div>
            <span>
              {project.projectCode || "PROJECT"}
            </span>
            <h2>
              {project.projectName || "Untitled"}
            </h2>
            <p style={{ fontSize: "11px" }}>
              {project.projectType || "—"} •{" "}
              {project.projectStage || "—"} Stage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "30px",
              height: "30px",
              border: "0",
              borderRadius: "7px",
              background: "#f8fafc",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="admin-drawer-body"
          style={{ padding: "16px" }}
        >
          <div className="drawer-section">
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#94a3b8",
                marginBottom: "12px",
              }}
            >
              Project Information
            </h3>

            <DetailRow
              label="Project Name"
              value={
                project.projectName || "—"
              }
            />

            <DetailRow
              label="Project Code"
              value={
                project.projectCode || "—"
              }
            />

            <DetailRow
              label="Project Type"
              value={
                project.projectType || "—"
              }
            />

            <DetailRow
              label="PM"
              value={
                getPMName(project) ||
                "Unassigned"
              }
            />

            <DetailRow
              label="TL"
              value={
                getTLName(project) ||
                (hasTL(project)
                  ? ""
                  : "Unassigned")
              }
            />

            <DetailRow
              label="Project Stage"
              value={
                project.projectStage || "—"
              }
            />

            <DetailRow
              label="Email Stage"
              value={
                project.emailStage || "—"
              }
            />

            <DetailRow
              label="Status"
              value={getProjectStatus(project)}
            />

            <DetailRow
              label="Mail Date"
              value={
                project.mailDate
                  ? new Date(
                      project.mailDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "—"
              }
            />

            <DetailRow
              label="Age"
              value={getProjectAge(project)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminReportsPage;
