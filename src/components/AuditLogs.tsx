import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";

import { TableSkeleton } from "./LoadingSkeleton";
import PageHeader from "./ui/PageHeader";
import { apiRequest } from "../services/api";

interface AuditLogItem {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface AuditLogResponse {
  data: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function AuditLog() {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [user, setUser] = useState("");

  // Debounced filter states
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedAction, setDebouncedAction] = useState("");
  const [debouncedUser, setDebouncedUser] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const limit = 10;

  // Debounce search and filter inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedAction(action);
      setDebouncedUser(user);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, action, user]);

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      if (debouncedAction.trim()) {
        params.append("action", debouncedAction.trim());
      }

      if (debouncedUser.trim()) {
        params.append("user", debouncedUser.trim());
      }

      params.append("page", String(page));
      params.append("limit", String(limit));

      const queryString = params.toString();

      const result = await apiRequest<AuditLogResponse>(
        `/audit-logs?${queryString}`
      );

      setAuditLogs(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch audit logs error:", err);

      setAuditLogs([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load audit logs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [
    page,
    debouncedSearch,
    debouncedAction,
    debouncedUser,
  ]);

  // Reset Filters
  const handleReset = () => {
    setSearch("");
    setAction("");
    setUser("");
    setPage(1);
  };

  // Format Timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="w-full p-4 sm:p-6">
      <PageHeader
        title="Audit Logs"
        description="Review system activities and track changes made by users"
        actions={
          <button
            type="button"
            onClick={fetchAuditLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
      />

      {/* ACTION BAR */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search audit logs..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
            showFilters
              ? "border-[#292A24] bg-[#292A24] text-white"
              : "border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1F2937]">
                Filter Audit Logs
              </h2>

              <p className="mt-0.5 text-[11px] text-[#64748B]">
                Narrow the activity records by user or action.
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="audit-user-filter"
                className="mb-1.5 block text-xs font-medium text-[#1F2937]"
              >
                User
              </label>

              <input
                id="audit-user-filter"
                type="text"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by user"
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
              />
            </div>

            <div>
              <label
                htmlFor="audit-action-filter"
                className="mb-1.5 block text-xs font-medium text-[#1F2937]"
              >
                Action
              </label>

              <input
                id="audit-action-filter"
                type="text"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by action"
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none transition placeholder:text-[#94A3B8] focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">
            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="w-16 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  ID
                </th>

                <th className="min-w-44 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Timestamp
                </th>

                <th className="min-w-32 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  User
                </th>

                <th className="min-w-32 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Action
                </th>

                <th className="min-w-64 px-4 py-3 text-left">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <TableSkeleton columns={5} />
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-[#64748B]"
                  >
                    {debouncedSearch ||
                    debouncedAction ||
                    debouncedUser
                      ? "No audit logs match your filters."
                      : "No audit logs found."}
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-[#F8F7F2]/70"
                  >
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center font-medium text-[#64748B]">
                      #{log.id}
                    </td>

                    <td className="whitespace-nowrap border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {formatTimestamp(log.timestamp)}
                    </td>

                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center font-semibold text-[#1F2937]">
                      {log.user}
                    </td>

                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#64748B]">
                      <span className="block min-w-64 whitespace-normal break-words">
                        {log.details}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-[#64748B]">
          Page{" "}
          <strong className="font-semibold text-[#1F2937]">
            {page}
          </strong>{" "}
          of{" "}
          <strong className="font-semibold text-[#1F2937]">
            {totalPages}
          </strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((curr) => curr - 1)}
            className="inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((curr) => curr + 1)}
            className="inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditLog;