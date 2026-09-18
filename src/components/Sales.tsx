import { useCallback, useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Search,
  Eye,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { TableSkeleton } from "./LoadingSkeleton";
import PageHeader from "./ui/PageHeader";
import { apiRequest } from "../services/api";
import { useBranch } from "../hooks/useBranch";

interface SaleRecord {
  id: number;
  date: string;
  time: string;
  itemQuantity: number;
  total: number;
  paymentMethod: string;
  status: string;
  voidReason?: string | null;
  cashier: string;

  branch: {
    id: number;
    code: string;
    name: string;
  };
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
  const { selectedBranchId } = useBranch();

  const [sales, setSales] = useState<SaleRecord[]>([]);

  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalTransactions: 0,
    averageSaleValue: 0,
  });

  // Raw filter states
  const [search, setSearch] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounced filter states
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCashier, setDebouncedCashier] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Selected transaction for modal
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<number | null>(null);

  const limit = 10;

  // Debounce search and cashier filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedCashier(cashierFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, cashierFilter]);

  // Fetch sales data
  const fetchSales = useCallback(
    async (targetPage?: number) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        if (debouncedCashier.trim()) {
          params.append("cashier", debouncedCashier.trim());
        }

        if (startDate) {
          params.append("startDate", startDate);
        }

        if (endDate) {
          params.append("endDate", endDate);
        }

        // ALL means no branch restriction
        if (selectedBranchId !== "ALL") {
          params.append("branchId", String(selectedBranchId));
        }

        const activePage = targetPage ?? page;

        params.append("page", String(activePage));
        params.append("limit", String(limit));

        const result = await apiRequest<SalesResponse>(
          `/sales?${params.toString()}`
        );

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

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load sales records. Please try again."
        );

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
    },
    [
      debouncedSearch,
      debouncedCashier,
      startDate,
      endDate,
      page,
      selectedBranchId,
    ]
  );

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Reset all filters
  const handleReset = () => {
    setSearch("");
    setCashierFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="w-full p-4 sm:p-6">

      {/* PAGE HEADER */}
      <PageHeader
        title="Sales"
        description="View sales history and individual transaction details."
        actions={
          <button
            type="button"
            onClick={() => fetchSales(1)}
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

      {/* SALES METRICS */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {/* TOTAL SALES */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Total Sales
          </p>

          <p className="mt-2 text-xl font-semibold tracking-tight text-[#1F2937]">
            ₱{Number(metrics.totalSales || 0).toFixed(2)}
          </p>
        </div>

        {/* TOTAL TRANSACTIONS */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Total Transactions
          </p>

          <p className="mt-2 text-xl font-semibold tracking-tight text-[#1F2937]">
            {metrics.totalTransactions || 0}
          </p>
        </div>

        {/* AVERAGE SALE */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Average Sale Value
          </p>

          <p className="mt-2 text-xl font-semibold tracking-tight text-[#1F2937]">
            ₱{Number(metrics.averageSaleValue || 0).toFixed(2)}
          </p>
        </div>

      </div>

      {/* ACTION BAR */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* SEARCH */}
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
            placeholder="Search sales records..."
            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm text-[#1F2937] placeholder:text-[#94A3B8] outline-none transition focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">

          {/* FILTERS */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              showFilters
                ? "border-[#292A24] bg-[#F8F7F2] text-[#292A24]"
                : "border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* EXPORT */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#292A24] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Download size={14} />
            Export Data
          </button>

        </div>
      </div>

      {/* EXPANDABLE FILTERS */}
      {showFilters && (
        <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">

            {/* DATE RANGE */}
            <div className="flex-1">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Date Range
              </label>

              <div className="flex items-center gap-2">

                <div className="relative flex-1">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-2 pl-8 text-xs text-[#1F2937] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                  />
                </div>

                <span className="text-xs text-[#64748B]">
                  to
                </span>

                <div className="relative flex-1">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-2 pl-8 text-xs text-[#1F2937] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
                  />
                </div>

              </div>
            </div>

            {/* CASHIER */}
            <div className="w-full lg:w-52">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Cashier
              </label>

              <input
                type="text"
                value={cashierFilter}
                onChange={(e) => {
                  setCashierFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by cashier"
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1F2937] placeholder:text-[#94A3B8] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
              />
            </div>

            {/* RESET */}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50"
            >
              <RefreshCw size={13} />
              Reset
            </button>

          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* SALES TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

            <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">

              <tr>

                <th className="w-16 border-r border-[#E5E7EB] px-4 py-3 text-center">
                  ID
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Branch
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Date
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Time
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Item Quantity
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Total
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Cashier
                </th>

                <th className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                  Status
                </th>

                <th className="w-28 px-4 py-3 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#E5E7EB]">

              {/* LOADING */}
              {loading ? (
                <TableSkeleton columns={9} />

              ) : sales.length === 0 ? (

                /* EMPTY */
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-[#64748B]"
                  >
                    No sales records found.
                  </td>
                </tr>

              ) : (

                /* DATA */
                sales.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#F8F7F2]/70"
                  >

                    {/* ID */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center font-medium text-[#64748B]">
                      #{item.id}
                    </td>

                    {/* BRANCH */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center font-medium text-[#1F2937]">
                      {item.branch.name}
                    </td>

                    {/* DATE */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {item.date}
                    </td>

                    {/* TIME */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {item.time}
                    </td>

                    {/* ITEM QUANTITY */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {item.itemQuantity}
                    </td>

                    {/* TOTAL */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-right font-semibold text-[#1F2937]">
                      ₱{Number(item.total).toFixed(2)}
                    </td>

                    {/* CASHIER */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center text-[#64748B]">
                      {item.cashier}
                    </td>

                    {/* STATUS */}
                    <td className="border-r border-[#E5E7EB] px-4 py-3 text-center">
                      {item.status === "VOIDED" ? (
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                          VOIDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-600">
                          COMPLETED
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTransactionId(item.id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#1F2937] transition hover:bg-gray-50"
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
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <span className="text-xs text-[#64748B]">
          Page{" "}
          <strong className="text-[#1F2937]">
            {page}
          </strong>{" "}
          of{" "}
          <strong className="text-[#1F2937]">
            {totalPages}
          </strong>
        </span>

        <div className="flex items-center gap-2">

          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((curr) => curr - 1)
            }
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((curr) => curr + 1)
            }
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      <TransactionDetailsModal
        transactionId={selectedTransactionId}
        onClose={() =>
          setSelectedTransactionId(null)
        }
      />

    </div>
  );
}

export default Sales;