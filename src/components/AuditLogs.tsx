import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import { TableSkeleton } from "./LoadingSkeleton";
import { API_URL } from "../services/api";

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

  // Raw Filter States
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [user, setUser] = useState("");

  // Debounced Filter States
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedAction, setDebouncedAction] = useState("");
  const [debouncedUser, setDebouncedUser] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [dateTime, setDateTime] = useState(new Date());

  const limit = 10;

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

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

      const response = await fetch(
        `${API_URL}/audit-logs?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audit logs: ${response.status}`
        );
      }

      const result: AuditLogResponse = await response.json();

      setAuditLogs(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      setAuditLogs([]);
      setError("Unable to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [
    page, debouncedSearch, debouncedAction, debouncedUser,
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
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Audit Logs
          </h1>

          <p className="text-xs text-gray-500">
            Review system activities and track changes made by users
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <span>
            DATE:{" "}
            {dateTime.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <span>
            TIME:{" "}
            {dateTime.toLocaleTimeString("en-US", {
              hour12: false,
            })}
          </span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search audit logs..."
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* FILTER TOGGLE */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* EXPANDABLE FILTERS */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <input
            type="text"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by User"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
          />

          <input
            type="text"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Action"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
          />

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* DATA TABLE */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-700">
            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="w-16 border-r border-gray-200 px-4 py-2.5 text-center">
                  ID
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Timestamp
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  User
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Action
                </th>

                <th className="px-4 py-2.5 text-center">
                  Details
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton columns={5} />
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-gray-50/80"
                  >
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center font-medium text-gray-500">
                      #{log.id}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 whitespace-nowrap text-center text-gray-600">
                      {formatTimestamp(log.timestamp)}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-900">
                      {log.user}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 text-center">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-800">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-gray-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>
          Page <strong>{page}</strong> of{" "}
          <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((curr) => curr - 1)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((curr) => curr + 1)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditLog;
