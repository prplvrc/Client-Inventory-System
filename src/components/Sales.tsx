import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Search,
  Eye,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import TransactionDetailsModal from "../components/TransactionDetailsModal";

interface SaleRecord {
  id: number;
  date: string;
  time: string;
  itemQuantity: number;
  total: number;
  cashier: string;
}

interface SalesMetrics {
  totalSales: number;
  totalTransactions: number;
  averageSaleValue: number;
}

interface SalesResponse {
  data: SaleRecord[];
  metrics: SalesMetrics;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function Sales() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalTransactions: 0,
    averageSaleValue: 0,
  });

  // Raw Filter States
  const [search, setSearch] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounced Filter States
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCashier, setDebouncedCashier] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Selected Transaction for Modal
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  const [dateTime, setDateTime] = useState(new Date());
  const limit = 10;

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounce search and filter inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedCashier(cashierFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, cashierFilter]);

  // Fetch Sales Data from API
  const fetchSales = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
      if (debouncedCashier.trim()) params.append("cashier", debouncedCashier.trim());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      params.append("page", String(page));
      params.append("limit", String(limit));

      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) throw new Error("VITE_API_URL is not configured.");

      const response = await fetch(`${apiUrl}/sales?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales: ${response.status}`);
      }

      const result: SalesResponse = await response.json();
      setSales(result.data ?? []);
      setMetrics(
        result.metrics ?? {
          totalSales: 0,
          totalTransactions: 0,
          averageSaleValue: 0,
        }
      );
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch sales error:", err);
      setError("Unable to load sales records. Please try again.");
      setSales([]);
      setMetrics({
        totalSales: 0,
        totalTransactions: 0,
        averageSaleValue: 0,
      });
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, debouncedSearch, debouncedCashier, startDate, endDate]);

  const handleReset = () => {
    setSearch("");
    setCashierFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Sales
          </h1>
          <p className="text-xs text-gray-500">
            View sales history and individual transaction details.
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
            TIME: {dateTime.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>

      {/* SALES METRICS DASHBOARD */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Sales</h2>
          <p className="mt-2 text-xl font-bold text-gray-900">
            ₱{Number(metrics.totalSales || 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Transactions</h2>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {metrics.totalTransactions || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Average Sale Value</h2>
          <p className="mt-2 text-xl font-bold text-gray-900">
            ₱{Number(metrics.averageSaleValue || 0).toFixed(2)}
          </p>
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
              placeholder="Search sales records..."
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

          {/* EXPORT DATA BUTTON */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e]"
          >
            <Download size={14} />
            Export Data
          </button>
        </div>
      </div>

      {/* EXPANDABLE FILTERS */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
            />
          </div>

          <input
            type="text"
            value={cashierFilter}
            onChange={(e) => {
              setCashierFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Cashier"
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

      {/* ERROR MSG */}
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
                <th className="w-16 border-r border-gray-200 px-4 py-2.5 text-center">ID</th>
                <th className="border-r border-gray-200 px-4 py-2.5 text-center">Date</th>
                <th className="border-r border-gray-200 px-4 py-2.5 text-center">Time</th>
                <th className="border-r border-gray-200 px-4 py-2.5 text-center">Item Quantity</th>
                <th className="border-r border-gray-200 px-4 py-2.5 text-center">Total</th>
                <th className="border-r border-gray-200 px-4 py-2.5 text-center">Cashier</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                sales.map((item) => (
                  <tr key={item.id} className="transition hover:bg-gray-50/80">
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center font-medium text-gray-500">
                      #{item.id}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center text-gray-600">
                      {item.date}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center text-gray-600">
                      {item.time}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center text-gray-600">
                      {item.itemQuantity}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2.5 text-right font-semibold text-gray-900">
                      ₱{Number(item.total).toFixed(2)}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center text-gray-600">
                      {item.cashier}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedTransactionId(item.id)}
                          className="flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          <Eye size={12} />
                          View
                        </button>
                      </div>
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
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
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

      {/* TRANSACTION DETAILS MODAL */}
      <TransactionDetailsModal
        transactionId={selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
      />
    </div>
  );
}

export default Sales;