import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";

import InventoryForm from "./InventoryForm";
import { TableSkeleton } from "./LoadingSkeleton";
import { API_URL } from "../services/api";
import { useBranch } from "../hooks/useBranch";

import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  status: string;
}

interface Branch {
  id: number;
  code: string;
  name: string;
}

interface InventoryItem {
  id: number;
  ingredientId: number;
  branchId: number;

  branch: Branch;
  ingredient: Ingredient;

  initialStock: number;
  availableStock: number;
  status: string;
}

interface InventoryResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PreparedBatch {
  id: number;
  productId: number;
  branchId: number;
  preparedById: number;
  status: "AVAILABLE" | "LOW" | "EMPTY";
  note: string | null;
  preparedAt: string;
  emptiedAt: string | null;

  product: {
    id: number;
    name: string;
  };

  branch: Branch;

  preparedBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

function Inventory() {
  type InventoryTab = "RAW" | "PREPARED";

  const [activeTab, setActiveTab] =
    useState<InventoryTab>("RAW");

  const [inventory, setInventory] =
    useState<InventoryItem[]>([]);

  const [preparedBatches, setPreparedBatches] =
    useState<PreparedBatch[]>([]);

  const [preparedBatchLoading, setPreparedBatchLoading] =
    useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("");

  // Debounced filter states
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedUnit, setDebouncedUnit] = useState("");
  const [debouncedStatus, setDebouncedStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [selectedInventory, setSelectedInventory] =
    useState<InventoryItem | null>(null);

  const {
    selectedBranchId,
    selectedBranch,
  } = useBranch();

  const limit = 10;

  // =========================================================
  // DEBOUNCE FILTERS
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedUnit(unit);
      setDebouncedStatus(status);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, unit, status]);

  // =========================================================
  // FETCH INVENTORY
  // =========================================================

  const fetchInventory = async (targetPage?: number) => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      const activePage = targetPage ?? page;

      const params = new URLSearchParams();

      if (debouncedSearch.trim()) {
        params.append(
          "search",
          debouncedSearch.trim()
        );
      }

      if (debouncedUnit.trim()) {
        params.append(
          "unit",
          debouncedUnit.trim()
        );
      }

      if (debouncedStatus.trim()) {
        params.append(
          "status",
          debouncedStatus.trim()
        );
      }

      // Only send branchId when a specific branch is selected
      if (
        selectedBranchId &&
        selectedBranchId !== "ALL"
      ) {
        params.append(
          "branchId",
          String(selectedBranchId)
        );
      }

      params.append(
        "page",
        String(activePage)
      );

      params.append(
        "limit",
        String(limit)
      );

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_URL}/inventory?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          `Failed to fetch inventory: ${response.status}`;

        try {
          const result = await response.json();
          message =
            result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const result: InventoryResponse =
        await response.json();

      setInventory(result.data ?? []);
      setTotalPages(
        result.totalPages ?? 1
      );
    } catch (err) {
      console.error(
        "Fetch inventory error:",
        err
      );

      setInventory([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load inventory. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [
    page,
    debouncedSearch,
    debouncedUnit,
    debouncedStatus,
    selectedBranchId,
  ]);

  // =========================================================
  // FETCH PREPARED BATCHES
  // =========================================================

  const fetchPreparedBatches = async () => {
    try {
      setPreparedBatchLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const params = new URLSearchParams();

      if (
        selectedBranchId &&
        selectedBranchId !== "ALL"
      ) {
        params.append(
          "branchId",
          String(selectedBranchId)
        );
      }

      const response = await fetch(
        `${API_URL}/prepared-batches?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          `Failed to fetch prepared batches: ${response.status}`;

        try {
          const result = await response.json();
          message =
            result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const result =
        await response.json();

      setPreparedBatches(
        result.data ?? []
      );
    } catch (err) {
      console.error(
        "Fetch prepared batches error:",
        err
      );

      setPreparedBatches([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load prepared batches."
      );
    } finally {
      setPreparedBatchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "PREPARED") {
      fetchPreparedBatches();
    }
  }, [
    activeTab,
    selectedBranchId,
  ]);

  // =========================================================
  // ADD INVENTORY
  // =========================================================

  const handleAdd = () => {
    if (selectedBranchId === "ALL") {
      setError(
        "Select Branch 1 or Branch 2 before adding inventory."
      );

      return;
    }

    setError("");
    setSelectedInventory(null);
    setShowForm(true);
  };

  // =========================================================
  // EDIT INVENTORY
  // =========================================================

  const handleEdit = (
    item: InventoryItem
  ) => {
    setError("");
    setSelectedInventory(item);
    setShowForm(true);
  };

  // =========================================================
  // DELETE INVENTORY
  // =========================================================

  const handleDelete = async (
    id: number
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this inventory item?"
      )
    ) {
      return;
    }

    try {
      setError("");

      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_URL}/inventory/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          "Failed to delete inventory item.";

        try {
          const result = await response.json();
          message =
            result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      await fetchInventory();
    } catch (err) {
      console.error(
        "Delete inventory error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete inventory item."
      );
    }
  };

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const handleReset = () => {
    setSearch("");
    setUnit("");
    setStatus("");
    setPage(1);
  };

  // =========================================================
  // STOCK LEVEL
  // =========================================================

  const getStockLevel = (
    stock: number
  ) => {
    if (stock <= 0) {
      return "OUT_OF_STOCK";
    }

    if (stock <= 10) {
      return "LOW_STOCK";
    }

    return "IN_STOCK";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full p-4 sm:p-6">

      {/* PAGE HEADER */}
      <PageHeader
        title="Inventory"
        description={
          selectedBranch
            ? `Manage raw ingredients and prepared batches for ${selectedBranch.name}.`
            : "Manage raw ingredients and prepared batches across all branches."
        }
      />

      {/* INVENTORY TABS */}
      <div className="mb-4">
        <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-white p-1">
          <button
            type="button"
            onClick={() =>
              setActiveTab("RAW")
            }
            className={
              activeTab === "RAW"
                ? "rounded-md bg-[#292A24] px-4 py-2 text-xs font-medium text-white"
                : "rounded-md px-4 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8F7F2]"
            }
          >
            Raw Ingredients
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("PREPARED")
            }
            className={
              activeTab === "PREPARED"
                ? "rounded-md bg-[#292A24] px-4 py-2 text-xs font-medium text-white"
                : "rounded-md px-4 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8F7F2]"
            }
          >
            Prepared Batches
          </button>
        </div>
      </div>

      {/* RAW INVENTORY ACTION BAR */}
      {activeTab === "RAW" && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* SEARCH */}
          <div className="relative w-full max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );
                setPage(1);
              }}
              placeholder="Search inventory..."
              className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-xs text-[#1F2937] placeholder:text-[#94A3B8] outline-none transition focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            {/* FILTER */}
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (prev) => !prev
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50"
            >
              <SlidersHorizontal
                size={14}
              />
              Filters
            </button>

            {/* ADD */}
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-[#292A24] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
            >
              <Plus size={14} />
              Add Inventory
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      {activeTab === "RAW" &&
        showFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3">

            {/* UNIT FILTER */}
            <input
              type="text"
              value={unit}
              onChange={(e) => {
                setUnit(
                  e.target.value
                );
                setPage(1);
              }}
              placeholder="Filter by Unit"
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1F2937] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
            />

            {/* STATUS FILTER */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(
                  e.target.value
                );
                setPage(1);
              }}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#1F2937] outline-none focus:border-[#292A24] focus:ring-1 focus:ring-[#292A24]"
            >
              <option value="">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

            {/* RESET */}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#1F2937] transition hover:bg-gray-50"
            >
              <RefreshCw
                size={12}
              />
              Reset
            </button>
          </div>
        )}

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          RAW INGREDIENTS
      ====================================================== */}

      {activeTab === "RAW" && (
        <>
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="overflow-x-auto">

              <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

                <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] font-semibold uppercase tracking-wider text-[#64748B]">

                  <tr>

                    <th className="w-16 px-4 py-2.5 text-center">
                      ID
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Ingredient
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Branch
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Unit
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Initial Stock
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Available Stock
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Stock Level
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Status
                    </th>

                    <th className="px-4 py-2.5 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#E5E7EB]">

                  {loading ? (
                    <TableSkeleton
                      columns={9}
                    />
                  ) : inventory.length === 0 ? (

                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-[#64748B]"
                      >
                        No inventory items found.
                      </td>
                    </tr>

                  ) : (

                    inventory.map(
                      (item) => {
                        const stockLevel =
                          getStockLevel(
                            Number(
                              item.availableStock
                            )
                          );

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-[#F8F7F2]/60"
                          >

                            {/* ID */}
                            <td className="px-4 py-2.5 text-center font-medium text-[#64748B]">
                              #{item.id}
                            </td>

                            {/* INGREDIENT */}
                            <td className="px-4 py-2.5 font-semibold text-[#1F2937]">
                              {item.ingredient
                                ?.name ??
                                "—"}
                            </td>

                            {/* BRANCH */}
                            <td className="px-4 py-2.5 text-center text-[#64748B]">
                              {item.branch
                                ?.name ??
                                "—"}
                            </td>

                            {/* UNIT */}
                            <td className="px-4 py-2.5 text-center text-[#64748B]">
                              {item.ingredient
                                ?.unit ??
                                "—"}
                            </td>

                            {/* INITIAL STOCK */}
                            <td className="px-4 py-2.5 text-right font-medium text-[#1F2937]">
                              {Number(
                                item.initialStock
                              ).toFixed(2)}
                            </td>

                            {/* AVAILABLE STOCK */}
                            <td className="px-4 py-2.5 text-right font-medium text-[#1F2937]">
                              {Number(
                                item.availableStock
                              ).toFixed(2)}
                            </td>

                            {/* STOCK LEVEL */}
                            <td className="px-4 py-2.5 text-center">
                              <StatusBadge
                                status={
                                  stockLevel
                                }
                              />
                            </td>

                            {/* STATUS */}
                            <td className="px-4 py-2.5 text-center">
                              <StatusBadge
                                status={
                                  item.status
                                }
                              />
                            </td>

                            {/* ACTIONS */}
                            <td className="px-4 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      item
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#1F2937] transition hover:bg-gray-50"
                                >
                                  <Pencil
                                    size={11}
                                  />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      item.id
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700 transition hover:bg-red-100"
                                >
                                  <Trash2
                                    size={11}
                                  />
                                  Delete
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>

              </table>

            </div>
          </div>

          {/* RAW PAGINATION */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">

            <span>
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
                  setPage(
                    (current) =>
                      current - 1
                  )
                }
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>
          </div>
        </>
      )}

      {/* =====================================================
          PREPARED BATCHES
      ====================================================== */}

      {activeTab === "PREPARED" && (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full border-collapse text-left text-xs text-[#1F2937]">

              <thead className="border-b border-[#E5E7EB] bg-[#F8F7F2] font-semibold uppercase tracking-wider text-[#64748B]">

                <tr>

                  <th className="px-4 py-2.5 text-center">
                    Batch #
                  </th>

                  <th className="px-4 py-2.5 text-center">
                    Product
                  </th>

                  <th className="px-4 py-2.5 text-center">
                    Prepared At
                  </th>

                  <th className="px-4 py-2.5 text-center">
                    Prepared By
                  </th>

                  <th className="px-4 py-2.5 text-center">
                    Status
                  </th>

                  <th className="px-4 py-2.5 text-center">
                    Branch
                  </th>

                  <th className="px-4 py-2.5 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-[#E5E7EB]">

                {preparedBatchLoading ? (

                  <TableSkeleton
                    columns={7}
                  />

                ) : preparedBatches.length ===
                  0 ? (

                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-[#64748B]"
                    >
                      No prepared batches found.
                    </td>
                  </tr>

                ) : (

                  preparedBatches.map(
                    (batch) => (
                      <tr
                        key={batch.id}
                        className="transition hover:bg-[#F8F7F2]/60"
                      >

                        {/* BATCH NUMBER */}
                        <td className="px-4 py-2.5 text-center font-medium text-[#64748B]">
                          #{batch.id}
                        </td>

                        {/* PRODUCT */}
                        <td className="px-4 py-2.5 font-semibold text-[#1F2937]">
                          {batch.product
                            ?.name ??
                            "—"}
                        </td>

                        {/* PREPARED AT */}
                        <td className="px-4 py-2.5 text-center text-[#64748B]">
                          {new Date(
                            batch.preparedAt
                          ).toLocaleString(
                            "en-US",
                            {
                              month:
                                "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </td>

                        {/* PREPARED BY */}
                        <td className="px-4 py-2.5 text-center text-[#64748B]">
                          {batch.preparedBy
                            ? `${batch.preparedBy.firstName} ${batch.preparedBy.lastName}`
                            : "—"}
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge
                            status={
                              batch.status
                            }
                          />
                        </td>

                        {/* BRANCH */}
                        <td className="px-4 py-2.5 text-center text-[#64748B]">
                          {batch.branch
                            ?.name ??
                            "—"}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">

                            <button
                              type="button"
                              disabled={
                                batch.status ===
                                "EMPTY"
                              }
                              className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#1F2937] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Mark Empty
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* =====================================================
          INVENTORY FORM MODAL
      ====================================================== */}

      {showForm && (
        <InventoryForm
          inventory={selectedInventory}
          branchId={
            selectedInventory?.branchId ??
            Number(selectedBranchId)
          }
          onClose={() => {
            setShowForm(false);
            setSelectedInventory(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedInventory(null);
            fetchInventory();
          }}
        />
      )}

    </div>
  );
}

export default Inventory;