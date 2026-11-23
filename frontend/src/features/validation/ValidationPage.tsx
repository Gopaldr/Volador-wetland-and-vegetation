import { useMemo, useState } from "react";
import { useProject } from "../../context/useProject";

export default function ValidationPage() {
  const { results, validation: dsValidation } = useProject();

  const qa = results?.validation ?? {};
  const overallStatus =
    qa.overall_status || qa.status || (results ? "NOT_REPORTED" : "PENDING");

  // Keep findings stable between renders to avoid unnecessary useMemo recalculation.
  const rawFindings = results?.validation?.flags;

  const findings = useMemo(
    () => (Array.isArray(rawFindings) ? rawFindings : []),
    [rawFindings]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    severityFilter !== "ALL" ||
    statusFilter !== "ALL";

  const filteredFindings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return findings.filter((finding) => {
      const severity = (finding.severity || "UNSPECIFIED").toUpperCase();
      const status = (finding.status || "NOT_REPORTED").toUpperCase();

      const searchableText = [
        finding.code,
        finding.message,
        finding.phase,
        finding.recommended_action,
        severity,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesSeverity =
        severityFilter === "ALL" || severity === severityFilter;

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [findings, searchQuery, severityFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSeverityFilter("ALL");
    setStatusFilter("ALL");
  };

  const bandStatus = dsValidation
    ? dsValidation.valid
      ? "PASS"
      : "FAIL"
    : "NOT_VALIDATED";

  const geoStatus = dsValidation
    ? dsValidation.valid
      ? "PASS"
      : "WARN"
    : "NOT_VALIDATED";

  const qaChecks = [
    { label: "Input Band Completeness", status: bandStatus },
    {
      label: "Spatial Grid Alignment",
      status: qa.qa_flags?.alignment ?? (results ? "NOT_REPORTED" : "PENDING"),
    },
    {
      label: "Temporal Phenology Interval",
      status: qa.qa_flags?.temporal ?? (results ? "NOT_REPORTED" : "PENDING"),
    },
    {
      label: "5-Channel Model Execution",
      status: qa.qa_flags?.inference ?? (results ? "NOT_REPORTED" : "PENDING"),
    },
    { label: "Raster Integrity & Georeferencing", status: geoStatus },
    {
      label: "Olofsson Sample Validation",
      status: qa.olofsson_status ?? "NOT_AVAILABLE",
    },
    {
      label: "Independent Hydrological Evidence",
      status: qa.hydro_status ?? "NOT_AVAILABLE",
    },
  ];

  const getStatusClass = (status: string) => {
    const normalized = status.toUpperCase();

    if (normalized === "PASS") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (normalized === "WARN" || normalized === "WARNING") {
      return "bg-amber-500/10 text-amber-400";
    }

    if (normalized === "FAIL" || normalized === "ERROR") {
      return "bg-red-500/10 text-red-400";
    }

    return "bg-gray-500/10 text-gray-400";
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
      case "HIGH":
        return "bg-red-500/10 text-red-400";

      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400";

      case "LOW":
        return "bg-blue-500/10 text-blue-400";

      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <section>
        <div className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          Quality Assurance & Scientific Validation
        </div>

        <div className="mt-1 text-sm text-[var(--text-secondary)]">
          Review scientific input validation, QA flags, and independent
          reference sample availability.
        </div>
      </section>

      {/* Overall Pipeline Status */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-[var(--text)]">
              Overall Pipeline QA Status
            </div>

            <div className="mt-1 text-xs text-[var(--text-secondary)]">
              {results
                ? `Overall QA State: ${overallStatus}`
                : "Pending execution."}
            </div>
          </div>

          <div
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
              overallStatus === "PASS"
                ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                : overallStatus === "WARN" || overallStatus === "WARNING"
                  ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
                  : overallStatus === "FAIL" || overallStatus === "ERROR"
                    ? "border-red-500/30 bg-red-500/20 text-red-400"
                    : "border-gray-500/30 bg-gray-500/20 text-gray-400"
            }`}
          >
            {overallStatus}
          </div>
        </div>
      </section>

      {/* Systematic Validation Checks */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="text-sm font-medium text-[var(--text)]">
          Systematic Validation Checks
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {qaChecks.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] p-4"
            >
              <span className="text-xs font-medium text-[var(--text)]">
                {item.label}
              </span>

              <span
                className={`shrink-0 rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${getStatusClass(item.status)}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Actionable QA Findings */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-[var(--text)]">
              Actionable QA Findings
            </div>

            <div className="mt-1 text-xs text-[var(--text-secondary)]">
              Search and filter findings to identify issues requiring attention.
            </div>
          </div>

          <span className="rounded-md bg-gray-500/10 px-3 py-1.5 text-xs font-semibold text-gray-400">
            {filteredFindings.length} of {findings.length} Findings
          </span>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label
              htmlFor="qa-search"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Search Findings
            </label>

            <input
              id="qa-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search code, message, phase or action..."
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="qa-severity"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Severity
            </label>

            <select
              id="qa-severity"
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
              <option value="UNSPECIFIED">Unspecified</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="qa-status"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Status
            </label>

            <select
              id="qa-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="FAIL">Fail</option>
              <option value="ERROR">Error</option>
              <option value="WARN">Warn</option>
              <option value="WARNING">Warning</option>
              <option value="PASS">Pass</option>
              <option value="NOT_REPORTED">Not Reported</option>
            </select>
          </div>
        </div>

        {/* Filter Summary and Reset */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Showing {filteredFindings.length} matching{" "}
              {filteredFindings.length === 1 ? "finding" : "findings"}.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition hover:bg-gray-500/10"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Findings List */}
        <div className="mt-4 space-y-3">
          {filteredFindings.length > 0 ? (
            filteredFindings.map((finding, index) => {
              const severity = (
                finding.severity || "UNSPECIFIED"
              ).toUpperCase();

              const status = (
                finding.status || "NOT_REPORTED"
              ).toUpperCase();

              return (
                <article
                  key={`${finding.code || "finding"}-${index}`}
                  className="rounded-md border border-[var(--border)] p-4 transition-colors hover:border-gray-500/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {finding.code || "QA Finding"}
                      </span>

                      <span
                        className={`rounded px-2 py-1 text-[10px] font-semibold ${getSeverityClass(severity)}`}
                      >
                        {severity}
                      </span>
                    </div>

                    <span
                      className={`rounded px-2 py-1 text-[10px] font-semibold ${getStatusClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  {finding.phase && (
                    <div className="mt-2 text-xs text-[var(--text-secondary)]">
                      Phase: {finding.phase}
                    </div>
                  )}

                  <p className="mt-2 text-sm text-[var(--text)]">
                    {finding.message || "No finding description was provided."}
                  </p>

                  {finding.recommended_action && (
                    <div className="mt-3 rounded-md border border-blue-500/20 bg-blue-500/5 p-3">
                      <div className="text-xs font-semibold text-blue-400">
                        Recommended Action
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {finding.recommended_action}
                      </p>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="rounded-md border border-dashed border-[var(--border)] p-6 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                {findings.length === 0
                  ? results
                    ? "No structured QA findings were returned for this analysis."
                    : "Run an analysis to view detailed QA findings."
                  : "No findings match your search or selected filters."}
              </p>

              {findings.length > 0 && hasActiveFilters && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Try adjusting the search terms or filters.
                </p>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition hover:bg-gray-500/10"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Execution Warnings */}
      {results?.warnings && results.warnings.length > 0 && (
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="text-xs font-medium text-amber-400">
            Non-blocking Execution Warnings
          </div>

          <ul className="mt-2 flex flex-col gap-1 text-xs text-amber-300/80">
            {results.warnings.map((warning, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}