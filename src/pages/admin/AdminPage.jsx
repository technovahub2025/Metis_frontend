import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  Filter,
  HardHat,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  X,
  Upload,
} from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import { downloadProjectSampleCSV, parseProjectCSV, PROJECT_CSV_HEADERS } from "../../lib/projectCsv";
import { apiRequest } from "../../lib/api";
import { calculateAge, EMAIL_STAGES, PROJECT_STAGES } from "../../lib/helpers";

const AdminPage = () => {
  const [search, setSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [filterPM, setFilterPM] = useState("");
  const [filterTL, setFilterTL] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterEmailStage, setFilterEmailStage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [statusTab, setStatusTab] = useState("all");

  const [selectedMail, setSelectedMail] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [toast, setToast] = useState(null);

  /*
   * Backend project records
   */
  const [mailRecords, setMailRecords] = useState([]);

  /*
   * Active PM users from backend
   */
  const [pmUsers, setPmUsers] = useState([]);

  /*
   * Loading states
   */
  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingPMs, setLoadingPMs] =
    useState(false);

  const [savingProject, setSavingProject] =
    useState(false);

  const [importingCSV, setImportingCSV] = useState(false);

  const csvInputRef = useRef(null);

  /*
   * New project form
   */
  const [newMail, setNewMail] = useState({
    subject: "",
    mailDate: "",
    projectName: "",
    projectCode: "",
    pm: "",
    projectType: "",
    emailStage: "",
    projectStage: "",
    location: "",
    scope: "",
    assignmentPriority: "Normal",
    delegationNote: "",
  });

  /*
   * ============================================================
   * LOAD PROJECTS
   * ============================================================
   */

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);

      const response = await apiRequest(
        "/api/projects?limit=100"
      );

      const projects = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setMailRecords(projects);
    } catch (error) {
      console.error(
        "Failed to load projects:",
        error
      );

      showToast(
        "Unable to Load Projects",
        error.message ||
          "Failed to load project records.",
        false
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  /*
   * ============================================================
   * LOAD PM USERS
   * ============================================================
   */

const loadPMs = async () => {
  try {
    setLoadingPMs(true);

    const response = await apiRequest(
      "/api/users?role=pm&active=true"
    );

    const users = Array.isArray(response?.users)
      ? response.users
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

    // IMPORTANT:
    // Only PM users are allowed in the Project Manager dropdown.
    const pmOnly = users.filter(
      (user) =>
        String(user.role || "").toLowerCase() === "pm" &&
        user.active !== false
    );

    setPmUsers(pmOnly);
  } catch (error) {
    console.error(
      "Failed to load PMs:",
      error
    );

    showToast(
      "Unable to Load PMs",
      error.message ||
        "Failed to load project managers.",
      false
    );
  } finally {
    setLoadingPMs(false);
  }
};

  useEffect(() => {
    loadProjects();
    loadPMs();
  }, []);

  const tlOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mailRecords
            .map((project) => project.tlName)
            .filter(Boolean)
        )
      ),
    [mailRecords]
  );

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mailRecords
            .map((project) => project.projectType)
            .filter(Boolean)
        )
      ),
    [mailRecords]
  );

  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(
          mailRecords
            .map((project) => project.status)
            .filter(Boolean)
        )
      ),
    [mailRecords]
  );

  const statusTabOptions = [
    {
      key: "all",
      label: "All Projects",
    },
    {
      key: "action-needed",
      label: "Action Needed",
    },
    {
      key: "in-progress",
      label: "In Progress",
    },
    {
      key: "on-hold",
      label: "On Hold",
    },
    {
      key: "completed",
      label: "Completed",
    },
  ];

  const getStatusTabCount = (key) => {
    switch (key) {
      case "all":
        return mailRecords.length;
      case "action-needed":
        return mailRecords.filter(
          (project) => !project.pm
        ).length;
      case "in-progress":
        return mailRecords.filter(
          (project) =>
            project.pm &&
            String(
              project.emailStage || ""
            ).toLowerCase() !==
              "hold" &&
            project.projectStage !==
              "Closure" &&
            project.projectStage !==
              "Completed"
        ).length;
      case "on-hold":
        return mailRecords.filter(
          (project) =>
            String(
              project.emailStage || ""
            ).toLowerCase() === "hold"
        ).length;
      case "completed":
        return mailRecords.filter(
          (project) =>
            project.projectStage === "Closure" ||
            project.projectStage === "Completed"
        ).length;
      default:
        return 0;
    }
  };

  /*
   * ============================================================
   * FILTER PROJECTS
   * ============================================================
   */

  const filteredRecords = useMemo(() => {
    const query =
      `${search} ${tableSearch}`
        .trim()
        .toLowerCase();

    const result = mailRecords.filter((project) => {
      const matchesSearch =
        !query ||
        [
          project.subject,
          project.projectName,
          project.projectCode,
          project.pmName,
          project.tlName,
          project.projectType,
          project.emailStage,
          project.projectStage,
          project.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatusTab = (() => {
        switch (statusTab) {
          case "all":
            return true;
          case "action-needed":
            return !project.pm;
          case "in-progress":
            return (
              project.pm &&
              String(
                project.emailStage || ""
              ).toLowerCase() !==
                "hold" &&
              project.projectStage !==
                "Closure" &&
              project.projectStage !==
                "Completed"
            );
          case "on-hold":
            return (
              String(
                project.emailStage || ""
              ).toLowerCase() ===
              "hold"
            );
          case "completed":
            return (
              project.projectStage === "Closure" ||
              project.projectStage === "Completed"
            );
          default:
            return true;
        }
      })();

      const matchesPM =
        !filterPM ||
        String(project.pm || "") ===
          String(filterPM);

      const matchesTL =
        !filterTL ||
        project.tlName === filterTL;

      const matchesType =
        !filterType ||
        project.projectType === filterType;

      const matchesStage =
        !filterStage ||
        project.projectStage ===
          filterStage;

      const matchesEmailStage =
        !filterEmailStage ||
        project.emailStage ===
          filterEmailStage;

      const matchesStatus =
        !filterStatus ||
        project.status === filterStatus;

      return (
        matchesSearch &&
        matchesStatusTab &&
        matchesPM &&
        matchesTL &&
        matchesType &&
        matchesStage &&
        matchesEmailStage &&
        matchesStatus
      );
    });

    return [...result].sort((a, b) => {
      if (sortOption === "oldest") {
        return (
          new Date(a.mailDate || 0) -
          new Date(b.mailDate || 0)
        );
      }

      if (sortOption === "age-desc") {
        return (
          (calculateAge(b.receivedDate) || 0) -
          (calculateAge(a.receivedDate) || 0)
        );
      }

      if (sortOption === "name-az") {
        return String(
          a.projectName || ""
        ).localeCompare(
          String(b.projectName || "")
        );
      }

      return (
        new Date(b.mailDate || 0) -
        new Date(a.mailDate || 0)
      );
    });
  }, [
    mailRecords,
    search,
    tableSearch,
    statusTab,
    filterPM,
    filterTL,
    filterType,
    filterStage,
    filterEmailStage,
    filterStatus,
    sortOption,
  ]);

  /*
   * ============================================================
   * METRICS
   * ============================================================
   */

  const totalMails = mailRecords.length;

  const awaitingPM = mailRecords.filter(
    (project) => !project.pm
  ).length;

  const assignedPM = mailRecords.filter(
    (project) => Boolean(project.pm)
  ).length;

  const onHold = mailRecords.filter(
    (project) =>
      String(
        project.emailStage || ""
      ).toLowerCase() === "hold"
  ).length;

  /*
   * ============================================================
   * TOAST
   * ============================================================
   */

  const showToast = (
    title,
    message,
    success = true
  ) => {
    setToast({
      title,
      message,
      success,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /*
   * ============================================================
   * RESET FILTERS
   * ============================================================
   */

  const handleCSVImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setImportingCSV(true);

      const text = await file.text();
      const rows = parseProjectCSV(text);

      if (rows.length < 2) {
        showToast(
          "Import Failed",
          "The CSV does not contain any project rows.",
          false
        );
        return;
      }

      const headers = rows[0].map((header) => header.trim());

      const headersMatch =
        headers.length === PROJECT_CSV_HEADERS.length &&
        PROJECT_CSV_HEADERS.every(
          (header, index) => headers[index] === header
        );

      if (!headersMatch) {
        showToast(
          "Invalid CSV",
          "Please use the Download Sample CSV format.",
          false
        );
        return;
      }

      const importedRows = rows.slice(1);
      const errors = [];
      let successCount = 0;

      const getValue = (row, header) => {
        const index = PROJECT_CSV_HEADERS.indexOf(header);
        return String(row[index] ?? "").trim();
      };

      for (let index = 0; index < importedRows.length; index += 1) {
        const row = importedRows[index];
        const rowNumber = index + 2;

        const projectName = getValue(row, "Project Name");

        if (!projectName) {
          errors.push(`Row ${rowNumber}: Project Name is required.`);
          continue;
        }

        const pmName = getValue(row, "Project Manager");

        let pmId;

        if (pmName && pmName.toLowerCase() !== "unassigned") {
          const matchedPM = pmUsers.find(
            (pm) =>
              String(pm.name || "").trim().toLowerCase() ===
              pmName.toLowerCase()
          );

          if (!matchedPM) {
            errors.push(
              `Row ${rowNumber}: Project Manager "${pmName}" not found.`
            );
            continue;
          }

          pmId = matchedPM.id || matchedPM._id;
        }

        const payload = {
          subject: getValue(row, "Mail Subject"),
          mailDate: (() => {
            const value = getValue(row, "Mail Date");
            if (!value) return undefined;
            const parts = value.includes("/") ? value.split("/") : value.split("-");
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return year + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0");
            }
            return value;
          })(),
          projectName,
          projectCode: getValue(row, "Project Code"),
          projectType: getValue(row, "Type of Project") || undefined,
          emailStage: getValue(row, "Email Stage") || undefined,
          projectStage: getValue(row, "Project Stage") || "Acknowledged",
          pm: pmId || undefined,
          location: getValue(row, "Project Location"),
          scope: getValue(row, "Project Scope"),
          assignmentPriority: getValue(row, "Assignment Priority") || "Normal",
          delegationNote: getValue(row, "Delegation Note"),
        };

        try {
          await apiRequest("/api/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: payload,
          });

          successCount += 1;
        } catch (error) {
          console.error(
            `CSV import failed for row ${rowNumber}:`,
            error
          );

          errors.push(
            `Row ${rowNumber}: ${error?.message || "Failed to create project."}`
          );
        }
      }

      await refreshProjects();

      if (errors.length === 0) {
        showToast(
          "Import Successful",
          `${successCount} project(s) imported successfully.`
        );
      } else {
        showToast(
          "Import Completed",
          `${successCount} imported, ${errors.length} failed. ${errors[0]}`,
          false
        );
      }
    } catch (error) {
      console.error("CSV import failed:", error);

      showToast(
        "Import Failed",
        error?.message || "Unable to import the CSV file.",
        false
      );
    } finally {
      setImportingCSV(false);
      event.target.value = "";
    }
  };
  const resetFilters = () => {
    setSearch("");
    setTableSearch("");
    setFilterPM("");
    setFilterTL("");
    setFilterType("");
    setFilterStage("");
    setFilterEmailStage("");
    setFilterStatus("");
    setSortOption("newest");
    setStatusTab("all");
  };

  /*
   * ============================================================
   * RESET FORM
   * ============================================================
   */

  const resetProjectForm = () => {
    setNewMail({
      subject: "",
      mailDate: "",
      projectName: "",
      projectCode: "",
      pm: "",
      projectType: "",
      emailStage: "",
      projectStage: "",
      location: "",
      scope: "",
      assignmentPriority: "Normal",
      delegationNote: "",
    });
  };

  /*
   * ============================================================
   * CREATE PROJECT
   * ============================================================
   */

  const handleAddMail = async (event) => {
    event.preventDefault();

    if (!newMail.projectName.trim()) {
      showToast(
        "Project Name Required",
        "Please enter the project name.",
        false
      );

      return;
    }

    try {
      setSavingProject(true);

      const payload = {
        subject:
          newMail.subject.trim(),

        mailDate:
          newMail.mailDate || undefined,

        projectName:
          newMail.projectName.trim(),

        projectCode:
          newMail.projectCode.trim(),

        projectType:
          newMail.projectType || undefined,

        emailStage:
          newMail.emailStage || undefined,

        projectStage:
          newMail.projectStage ||
          "Acknowledged",

        pm:
          newMail.pm || undefined,

        location:
          newMail.location.trim(),

        scope:
          newMail.scope.trim(),

        assignmentPriority:
          newMail.assignmentPriority ||
          "Normal",

        delegationNote:
          newMail.delegationNote.trim(),
      };

      const response = await apiRequest(
        "/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: payload,
        }
      );

      const createdProject = response?.data || response;

      if (createdProject) {
        setMailRecords(
          (previous) => [
            createdProject,
            ...previous,
          ]
        );
      }

      resetProjectForm();
      setShowAddModal(false);

      showToast(
        "Project Created",
        "The project has been added successfully."
      );
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      showToast(
        "Project Creation Failed",
        error.message ||
          "Unable to create the project.",
        false
      );
    } finally {
      setSavingProject(false);
    }
  };

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const handleEditProject = (project) => {
    if (!project) return;

    const rawDate = String(project.mailDate || '').trim();
    let normalizedDate = rawDate;

    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        normalizedDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
      }
    } else if (rawDate.includes('-')) {
      const parts = rawDate.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        const [day, month, year] = parts;
        normalizedDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
      }
    }

    setEditingProject(project);
    setNewMail({
      subject: project.subject || '',
      mailDate: normalizedDate,
      projectName: project.projectName || '',
      projectCode: project.projectCode || '',
      pm: project.pm || project.pmId || '',
      projectType: project.projectType || '',
      emailStage: project.emailStage || '',
      projectStage: project.projectStage || 'Acknowledged',
      location: project.location || '',
      scope: project.scope || '',
      assignmentPriority: project.assignmentPriority || 'Normal',
      delegationNote: project.delegationNote || '',
    });

    setShowAddModal(true);
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();
    if (!editingProject?.id) return;

    if (!newMail.projectName.trim()) {
      showToast('Project Name Required', 'Please enter the project name.', false);
      return;
    }

    try {
      setSavingProject(true);

      const payload = {
        subject: newMail.subject.trim(),
        mailDate: newMail.mailDate || undefined,
        projectName: newMail.projectName.trim(),
        projectCode: newMail.projectCode.trim(),
        projectType: newMail.projectType || undefined,
        emailStage: newMail.emailStage || undefined,
        projectStage: newMail.projectStage || 'Acknowledged',
        pm: newMail.pm || undefined,
        location: newMail.location.trim(),
        scope: newMail.scope.trim(),
        assignmentPriority: newMail.assignmentPriority || 'Normal',
        delegationNote: newMail.delegationNote.trim(),
      };

      const response = await apiRequest(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      const updatedProject = response?.data || response;

      if (updatedProject) {
        setMailRecords((previous) =>
          previous.map((project) =>
            String(project.id) === String(updatedProject.id)
              ? updatedProject
              : project
          )
        );
      }

      setEditingProject(null);
      resetProjectForm();
      setShowAddModal(false);

      showToast('Project Updated', 'The project has been updated successfully.');
    } catch (error) {
      console.error('Update project error:', error);
      showToast(
        'Project Update Failed',
        error.message || 'Unable to update the project.',
        false
      );
    } finally {
      setSavingProject(false);
    }
  };
  const refreshProjects = async () => {
    await loadProjects();

    showToast(
      "Projects Refreshed",
      "The project queue is up to date."
    );
  };

  /*
   * ============================================================
   * UPDATE LOCAL PROJECT
   * ============================================================
   */

  const updateMail = (updatedMail) => {
    setMailRecords((previous) =>
      previous.map((project) =>
        project.id === updatedMail.id
          ? updatedMail
          : project
      )
    );

    setSelectedMail(updatedMail);
  };

  /*
   * ============================================================
   * ASSIGN PM
   * ============================================================
   *
   * Admin PM assignment is now done through
   * the normal project PUT endpoint.
   */

  const assignPM = async (pmId) => {
    if (!selectedMail) {
      return;
    }

    try {
      const selectedPM =
        pmUsers.find(
          (user) =>
            String(user.id || user._id) ===
            String(pmId)
        );

      const response = await apiRequest(
        `/api/projects/${selectedMail.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: {
            pm: pmId || null,
            pmName:
              selectedPM?.name || "",
            pmInitials:
              selectedPM?.name
                ?.split(" ")
                .filter(Boolean)
                .map(
                  (part) => part[0]
                )
                .join("")
                .toUpperCase()
                .slice(0, 3) || "",
          },
        }
      );

      const updated =
        response?.data || response;

      updateMail(updated);

      showToast(
        "PM Assignment Updated",
        selectedPM
          ? `${selectedMail.projectName} assigned to ${selectedPM.name}.`
          : `${selectedMail.projectName} is now unassigned.`
      );
    } catch (error) {
      console.error(
        "Assign PM error:",
        error
      );

      showToast(
        "PM Assignment Failed",
        error.message ||
          "Unable to update PM assignment.",
        false
      );
    }
  };

  /*
   * ============================================================
   * PUT PROJECT ON HOLD
   * ============================================================
   */

  const markHold = async () => {
    if (!selectedMail) {
      return;
    }

    try {
      const response = await apiRequest(
        `/api/projects/${selectedMail.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: {
            emailStage: "Hold",
          },
        }
      );

      const updated =
        response?.data || response;

      updateMail(updated);

      showToast(
        "Status Changed to Hold",
        `${selectedMail.projectName} is now on hold.`,
        false
      );
    } catch (error) {
      console.error(
        "Hold project error:",
        error
      );

      showToast(
        "Status Update Failed",
        error.message ||
          "Unable to put project on hold.",
        false
      );
    }
  };

  /*
   * ============================================================
   * EXPORT CSV
   * ============================================================
   */

  const exportCSV = () => {
    if (!filteredRecords.length) {
      showToast(
        "Nothing to Export",
        "There are no project records available.",
        false
      );

      return;
    }

    const headers = [
      "Subject",
      "Mail Date",
      "Project Name",
      "Project Code",
      "PM",
      "Type",
      "Email Stage",
      "Project Stage",
      "Age",
      "Location",
    ];

    const rows =
      filteredRecords.map(
        (project) => [
          project.subject,
          project.mailDate,
          project.projectName,
          project.projectCode,
          project.pmName ||
            "Unassigned",
          project.projectType,
          project.emailStage,
          project.projectStage,
          project.ageDays ?? 0,
          project.location,
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(
              value ?? ""
            ).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "metis-projects.csv";

    link.click();

    URL.revokeObjectURL(url);

    showToast(
      "Export Complete",
      "Project records exported successfully."
    );
  };

  return (
    <>
      <AdminHeader
        title="Project Dispatch Control"
        subtitle="Manual project creation and PM dispatch queue"
        searchValue={search}
        onSearch={(value) =>
          setSearch(value)
        }
        searchPlaceholder="Search project, subject, PM..."
        onRefresh={refreshProjects}
        actions={
          <>
            <button
              type="button"
              className="admin-export-button"
              onClick={downloadProjectSampleCSV}
            >
              <Download size={14} />
              Download Sample
            </button>

            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCSVImport}
              style={{ display: "none" }}
            />

            <button
              type="button"
              className="admin-export-button"
              onClick={() => csvInputRef.current?.click()}
            >
              <Upload size={14} />
              Import CSV
            </button>

            <button
              type="button"
              className="admin-add-mail-button"
              onClick={() => {
                setEditingProject(null);
                resetProjectForm();
                setShowAddModal(true);
              }}
            >
              <Plus size={16} />
              Add Project
            </button>
          </>
        }
      />

      <main className="admin-content">
        {/* Metrics */}

        <section className="admin-metrics">
          <MetricCard
            title="Total Projects"
            value={totalMails}
            description="All projects entered into METIS"
            icon={<Mail size={17} />}
            iconClass="blue"
          />

          <MetricCard
            title="Awaiting PM Dispatch"
            value={awaitingPM}
            description="Projects pending PM assignment"
            icon={<ShieldCheck size={17} />}
            iconClass="amber"
            highlighted
            badge="Action Required"
          />

          <MetricCard
            title="Assigned to PM"
            value={assignedPM}
            description="Projects transferred to PM"
            icon={<CheckCircle2 size={17} />}
            iconClass="green"
          />

          <MetricCard
            title="On Hold / Blocked"
            value={onHold}
            description="Projects currently on hold"
            icon={<ClipboardList size={17} />}
            iconClass="red"
          />
        </section>

        {/* Queue */}

        <section className="admin-queue-card">
          {/* Queue Header */}

          <div className="admin-queue-header">
            <div className="admin-queue-title">
              <span />

              <div>
                <div className="admin-queue-heading-row">
                  <h2>
                    Projects Queue
                  </h2>

                  <span className="admin-showing-badge">
                    Showing{" "}
                    {
                      filteredRecords.length
                    }{" "}
                    of{" "}
                    {
                      mailRecords.length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Status Tabs */}

            <div className="admin-control-top">
              <div className="admin-status-tabs">
                {statusTabOptions.map(
                  (tab) => {
                    const count =
                      getStatusTabCount(
                        tab.key
                      );

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        className={`admin-status-tab ${
                          statusTab === tab.key
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setStatusTab(
                            tab.key
                          )
                        }
                      >
                        <span className="count">
                          {count}
                        </span>
                        {tab.label}
                      </button>
                    );
                  }
                )}
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

            {/* Filter Row */}

            <div className="admin-filter-bar">
              <div className="admin-filter-search">
                <Search size={16} />

                <input
                  value={tableSearch}
                  onChange={(event) =>
                    setTableSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search project, code, PM..."
                />
              </div>

              <select
                className="admin-filter-select"
                value={filterPM}
                onChange={(event) =>
                  setFilterPM(
                    event.target.value
                  )
                }
              >
                <option value="">
                  PM: All Managers
                </option>

                <option value="unassigned">
                  Unassigned
                </option>

                {pmUsers.map(
                  (pm) => (
                    <option
                      key={
                        pm.id ||
                        pm._id
                      }
                      value={
                        pm.id ||
                        pm._id
                      }
                    >
                      {pm.name}
                    </option>
                  )
                )}
              </select>

              <select
                className="admin-filter-select"
                value={filterTL}
                onChange={(event) =>
                  setFilterTL(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Team Lead: All
                </option>

                {tlOptions.map(
                  (name) => (
                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>

              <select
                className="admin-filter-select"
                value={filterType}
                onChange={(event) =>
                  setFilterType(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Project Type: All
                </option>

                {typeOptions.map(
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
                onChange={(event) =>
                  setFilterStage(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Project Stage: All
                </option>

                {PROJECT_STAGES.map((stage) => (
                  <option
                    key={stage}
                    value={stage}
                  >
                    {stage}
                  </option>
                ))}
              </select>

              <select
                className="admin-filter-select"
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(
                    event.target.value
                  )
                }
              >
                <option value="">
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

              <select
                className="admin-filter-select"
                value={filterEmailStage}
                onChange={(event) =>
                  setFilterEmailStage(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Email Stage: All
                </option>

                {EMAIL_STAGES.map(
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
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target.value
                  )
                }
              >
                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="age-desc">
                  Age: Highest First
                </option>

                <option value="name-az">
                  Project Name (A-Z)
                </option>
              </select>

              <button
                className="admin-export-button"
                onClick={exportCSV}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Table */}

          <div className="admin-table-wrapper">
            <table className="admin-mail-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input type="checkbox" />
                  </th>

                  <th>
                    Subject & Reference
                  </th>

                  <th>
                    Mail Date
                  </th>

                  <th>
                    Project Name
                  </th>

                  <th>
                    Assigned PM
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Email Stage
                  </th>

                  <th>
                    Project Stage
                  </th>

                  <th className="center">
                    Age
                  </th>

                  <th className="right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingProjects ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="admin-empty-state"
                    >
                      <div className="admin-empty-icon">
                        <HardHat size={28} />
                      </div>

                      <h3>
                        Loading Projects
                      </h3>

                      <p>
                        Loading project records from METIS.
                      </p>
                    </td>
                  </tr>
                ) : filteredRecords.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="admin-empty-state"
                    >
                      <div className="admin-empty-icon">
                        <HardHat size={28} />
                      </div>

                      <h3>
                        No Projects Found
                      </h3>

                      <p>
                        No construction projects
                        match your active filters.
                      </p>

                      <button
                        onClick={resetFilters}
                      >
                        Clear All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(
                    (project) => (
                      <tr
                        key={
                          project.id
                        }
                        onClick={() =>
                          setSelectedMail(
                            project
                          )
                        }
                      >
                        <td
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <input type="checkbox" />
                        </td>

                        <td>
                          <div className="mail-subject-cell">
                            <div className="mail-icon">
                              <Mail size={14} />
                            </div>

                            <div>
                              <strong>
                                {project.subject ||
                                  "No subject"}
                              </strong>

                              <small>
                                #
                                {
                                  project.id
                                }

                                <span>
                                  •
                                </span>

                                {project.projectCode ||
                                  "No project code"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {project.mailDate
                            ? new Date(
                                project.mailDate
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>
                          <strong>
                            {
                              project.projectName
                            }
                          </strong>
                        </td>

                        <td>
                          <span className="pm-pill">
                            <span>
                              {project.pmName
                                ? project.pmInitials ||
                                  project.pmName
                                    .split(
                                      " "
                                    )
                                    .map(
                                      (
                                        name
                                      ) =>
                                        name[0]
                                    )
                                    .join("")
                                    .slice(
                                      0,
                                      2
                                    )
                                : "—"}
                            </span>

                            {project.pmName ||
                              "Unassigned"}
                          </span>
                        </td>

                        <td>
                          <span className="type-badge">
                            {project.projectType ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              project.emailStage
                            }
                          />
                        </td>

                        <td>
                          <span className="project-stage-badge">
                            {project.projectStage ||
                              "-"}
                          </span>
                        </td>

                        <td className="center">
                          <span className="age-badge">
                            {project.ageDays ??
                              0}{" "}
                            days
                          </span>
                        </td>

                        <td
                          className="right"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <button
                            type="button"
                            className="review-button"
                            title="Review"
                            aria-label="Review project"
                            onClick={() =>
                              setSelectedMail(project)
                            }
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="review-button"
                            title="Edit"
                            aria-label="Edit project"
                            onClick={() =>
                              handleEditProject(project)
                            }
                          >
                            <Pencil size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}

          <div className="admin-table-footer">
            <span>
              Showing{" "}
              {filteredRecords.length}{" "}
              of {mailRecords.length}{" "}
              projects
            </span>

            <div>
              <button disabled>
                <ChevronLeft size={14} />
              </button>

              <span>1</span>

              <button disabled>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= DETAIL DRAWER ================= */}

      {selectedMail && (
        <>
          <div
            className="admin-drawer-backdrop"
            onClick={() =>
              setSelectedMail(null)
            }
          />

          <aside className="admin-detail-drawer">
            <div className="admin-drawer-header">
              <div>
                <span className="drawer-ref">
                  #{selectedMail.id}
                </span>

                <h2>
                  {selectedMail.subject ||
                    selectedMail.projectName}
                </h2>

                <p>
                  Project details
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedMail(null)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="admin-drawer-body">
              <div className="drawer-section">
                <h3>
                  Project Details
                </h3>

                <DrawerField
                  label="Project"
                  value={
                    selectedMail.projectName ||
                    "-"
                  }
                />

                <DrawerField
                  label="Project Code"
                  value={
                    selectedMail.projectCode ||
                    "-"
                  }
                />

                <DrawerField
                  label="Mail Date"
                  value={
                    selectedMail.mailDate
                      ? new Date(
                          selectedMail.mailDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"
                  }
                />

                <DrawerField
                  label="Age"
                  value={`${selectedMail.ageDays ?? 0} days old`}
                />

                <DrawerField
                  label="Project Type"
                  value={
                    selectedMail.projectType ||
                    "-"
                  }
                />

                <DrawerField
                  label="Project Stage"
                  value={
                    selectedMail.projectStage ||
                    "-"
                  }
                />

                <DrawerField
                  label="Email Stage"
                  value={
                    selectedMail.emailStage ||
                    "-"
                  }
                />

                <DrawerField
                  label="Location"
                  value={
                    selectedMail.location ||
                    "-"
                  }
                />

                <DrawerField
                  label="Scope"
                  value={
                    selectedMail.scope ||
                    "-"
                  }
                />

                <DrawerField
                  label="Priority"
                  value={
                    selectedMail.assignmentPriority ||
                    "Normal"
                  }
                />
              </div>

              <div className="drawer-section">
                <h3>
                  Assign Project Manager
                </h3>

                <select
                  value={
                    selectedMail.pm ||
                    ""
                  }
                  onChange={(event) =>
                    assignPM(
                      event.target.value
                    )
                  }
                  disabled={loadingPMs}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {pmUsers.map(
                    (pm) => (
                      <option
                        key={
                          pm.id ||
                          pm._id
                        }
                        value={
                          pm.id ||
                          pm._id
                        }
                      >
                        {pm.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="drawer-section drawer-actions">
                <button
                  className="drawer-primary-button"
                  onClick={() => {
                    showToast(
                      "Project Dispatched",
                      "The PM assignment has been updated."
                    );

                    setSelectedMail(
                      null
                    );
                  }}
                >
                  <ShieldCheck size={15} />
                  Dispatch to PM
                </button>

                <button
                  className="drawer-hold-button"
                  onClick={markHold}
                >
                  Put on Hold
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ================= ADD PROJECT MODAL ================= */}

      {showAddModal && (
        <div
          className="admin-modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >
          <div
            className="admin-add-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  {editingProject ? "Edit Project" : "Add Project"}
                </h2>

                <p>
                  {editingProject ? "Update the project information." : "Manually enter project information from the received email."}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="admin-add-form"
              onSubmit={editingProject ? handleUpdateProject : handleAddMail}
            >
              {/* Subject */}

              <div className="admin-form-group">
                <label>
                  Mail Subject
                </label>

                <input
                  required
                  value={
                    newMail.subject
                  }
                  onChange={(event) =>
                    setNewMail({
                      ...newMail,
                      subject:
                        event.target.value,
                    })
                  }
                  placeholder="Enter mail subject"
                />
              </div>

              {/* Date + Project Name */}

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>
                    Mail Date
                  </label>

                  <input
                    type="date"
                    required
                    value={
                      newMail.mailDate
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        mailDate:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    Project Name
                  </label>

                  <input
                    required
                    value={
                      newMail.projectName
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        projectName:
                          event.target.value,
                      })
                    }
                    placeholder="Project name"
                  />
                </div>
              </div>

              {/* Project Code + PM */}

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>
                    Project Code
                  </label>

                  <input
                    value={
                      newMail.projectCode
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        projectCode:
                          event.target.value,
                      })
                    }
                    placeholder="Optional project code"
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    Project Manager
                  </label>

                  <select
                    value={
                      newMail.pm
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        pm: event.target.value,
                      })
                    }
                    disabled={loadingPMs}
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {pmUsers.map(
                      (pm) => (
                        <option
                          key={
                            pm.id ||
                            pm._id
                          }
                          value={
                            pm.id ||
                            pm._id
                          }
                        >
                          {pm.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Type + Email Stage */}

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>
                    Type of Project
                  </label>

                  <select
                    value={
                      newMail.projectType
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        projectType:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select type
                    </option>

                   <option value="RCC">
  RCC
</option>

<option value="Steel">
  Steel
</option>

<option value="Outsource">
  Outsource
</option>

<option value="PMC">
  PMC
</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>
                    Email Stage
                  </label>

                  <select
                    value={
                      newMail.emailStage
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        emailStage:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select stage
                    </option>

                    {EMAIL_STAGES.map(
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
                </div>
              </div>

              {/* Project Stage + Priority */}

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>
                    Project Stage
                  </label>

                  <select
                    value={
                      newMail.projectStage
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        projectStage:
                          event.target.value,
                      })
                    }
                  >
                     <option value="">
                      Project Stage: All
                    </option>

                    {PROJECT_STAGES.map((stage) => (
                      <option
                        key={stage}
                        value={stage}
                      >
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>
                    Assignment Priority
                  </label>

                  <select
                    value={
                      newMail.assignmentPriority
                    }
                    onChange={(event) =>
                      setNewMail({
                        ...newMail,
                        assignmentPriority:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Normal">
                      Normal
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>
                </div>
              </div>

              {/* Location */}

              <div className="admin-form-group">
                <label>
                  Project Location
                </label>

                <input
                  value={
                    newMail.location
                  }
                  onChange={(event) =>
                    setNewMail({
                      ...newMail,
                      location:
                        event.target.value,
                    })
                  }
                  placeholder="Project location"
                />
              </div>

              {/* Scope */}

              <div className="admin-form-group">
                <label>
                  Project Scope
                </label>

                <textarea
                  value={
                    newMail.scope
                  }
                  onChange={(event) =>
                    setNewMail({
                      ...newMail,
                      scope:
                        event.target.value,
                    })
                  }
                  placeholder="Enter project scope"
                  rows="3"
                />
              </div>

              {/* Delegation Note */}

              <div className="admin-form-group">
                <label>
                  Delegation Note
                </label>

                <textarea
                  value={
                    newMail.delegationNote
                  }
                  onChange={(event) =>
                    setNewMail({
                      ...newMail,
                      delegationNote:
                        event.target.value,
                    })
                  }
                  placeholder="Optional instructions for the PM"
                  rows="3"
                />
              </div>

              {/* Footer */}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => {
                    setEditingProject(null);
                    resetProjectForm();
                    setShowAddModal(false);
                  }}
                  disabled={
                    savingProject
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    savingProject
                  }
                >
                  <Plus size={15} />

                  {savingProject
                    ? (editingProject ? "Updating..." : "Creating...")
                    : (editingProject ? "Update Project" : "Create Project")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}

      {toast && (
        <div
          className={`admin-toast ${
            toast.success
              ? "success"
              : "warning"
          }`}
        >
          <div>
            {toast.success
              ? "✓"
              : "!"}
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
            onClick={() =>
              setToast(null)
            }
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
};

/* ================= COMPONENTS ================= */

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
        highlighted
          ? "highlighted"
          : ""
      }`}
    >
      <div className="metric-top">
        <span>{title}</span>

        <div
          className={`metric-icon ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="metric-value-row">
        <strong>
          {value}
        </strong>

        {badge && (
          <span className="metric-badge">
            {badge}
          </span>
        )}
      </div>

      <small>
        {description}
      </small>
    </div>
  );
};

const StatusBadge = ({
  status,
}) => {
  if (!status) {
    return (
      <span className="status-badge empty">
        -
      </span>
    );
  }

  const normalized =
    status
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  return (
    <span
      className={`status-badge ${normalized}`}
    >
      <span />
      {status}
    </span>
  );
};

const DrawerField = ({
  label,
  value,
}) => {
  return (
    <div className="drawer-field">
      <span>{label}</span>

      <strong>
        {value}
      </strong>
    </div>
  );
};

export default AdminPage;
