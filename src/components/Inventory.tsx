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

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  status: string;
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

interface Branch {
  id: number;
  code: string;
  name: string;
}



function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

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

  const [dateTime, setDateTime] = useState(new Date());

  const {
  selectedBranchId,
  selectedBranch,
  } = useBranch();

  

  const limit = 10;
  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  // Debounce Filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedUnit(unit);
      setDebouncedStatus(status);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, unit, status]);
  // Fetch Inventory
  const fetchInventory = async (targetPage?: number) => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }
      const activePage = targetPage ?? page;
      const params = new URLSearchParams();

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      if (debouncedUnit.trim()) {
        params.append("unit", debouncedUnit.trim());
      }

      if (debouncedStatus.trim()) {
        params.append("status", debouncedStatus.trim());
      }

      // Only send branchId when a specific branch is selected
      if (selectedBranchId && selectedBranchId !== "ALL") {
        params.append("branchId", String(selectedBranchId));
      }

      params.append("page", String(activePage));
      params.append("limit", String(limit));

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
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
        let message = `Failed to fetch inventory: ${response.status}`;

        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const result: InventoryResponse = await response.json();

      setInventory(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch inventory error:", err);

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
  // Add Inventory
  const handleAdd = () => {
    if (selectedBranchId === "ALL") {
      setError(
        "Select Branch 1 or Branch 2 before adding inventory."
      );

      return;
    }

    setSelectedInventory(null);
    setShowForm(true);
  };
  // Edit Inventory
  const handleEdit = (item: InventoryItem) => {
    setSelectedInventory(item);
    setShowForm(true);
  };
  // Delete Inventory
  const handleDelete = async (id: number) => {
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
        throw new Error("VITE_API_URL is not configured.");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
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
        let message = "Failed to delete inventory item.";

        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      await fetchInventory();
    } catch (err) {
      console.error("Delete inventory error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete inventory item."
      );
    }
  };
  // Reset Filters
  const handleReset = () => {
    setSearch("");
    setUnit("");
    setStatus("");
    setPage(1);
  };
  // Stock Level
  const getStockLevel = (stock: number) => {
    if (stock <= 0) {
      return "OUT OF STOCK";
    }

    if (stock <= 10) {
      return "LOW STOCK";
    }

    return "IN STOCK";
  };

  const getStockLevelClass = (stockLevel: string) => {
    if (stockLevel === "IN STOCK") {
      return "bg-green-100 text-green-800";
    }

    if (stockLevel === "LOW STOCK") {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-red-100 text-red-800";
  };

  return (
    <div className="w-full p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Inventory
          </h1>

          <p className="text-xs text-gray-500">
            Manage inventory items and keep track of stock levels
            {selectedBranch ? ` (${selectedBranch.name})` : " (All Branches)"}.
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

        {/* SEARCH */}
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
              placeholder="Search inventory..."
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">

          {/* FILTER */}
          <button
            type="button"
            onClick={() =>
              setShowFilters((prev) => !prev)
            }
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {/* ADD */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-md border border-[#d6d09b] bg-[#EFEABB] px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-[#e3dc9e]"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">

          <input
            type="text"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Unit"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none focus:border-black"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

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

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">

          <table className="w-full border-collapse text-left text-xs text-gray-700">

            <thead className="border-b border-gray-200 bg-gray-100/70 font-semibold uppercase tracking-wider text-gray-700">

              <tr>

                <th className="w-16 border-r border-gray-200 px-4 py-2.5 text-center">
                  ID
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Ingredient
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Branch
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Unit
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Initial Stock
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Available Stock
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Stock Level
                </th>

                <th className="border-r border-gray-200 px-4 py-2.5 text-center">
                  Status
                </th>

                <th className="px-4 py-2.5 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-200">

              {loading ? (
                <TableSkeleton columns={8} />
              ) : inventory.length === 0 ? (

                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-500"
                  >
                    No inventory items found.
                  </td>
                </tr>

              ) : (

                inventory.map((item) => {

                  const stockLevel = getStockLevel(
                    Number(item.availableStock)
                  );

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50/80"
                    >

                      {/* ID */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-center font-medium text-gray-500">
                        #{item.id}
                      </td>

                      {/* INGREDIENT */}
                      <td className="border-r border-gray-200 px-4 py-2.5 font-semibold text-gray-900">
                        {item.ingredient?.name ?? "—"}
                      </td>

                      {/* BRANCH */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-center">
                        {item.branch.name}
                      </td>

                      {/* UNIT */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-center text-gray-600">
                        {item.ingredient?.unit ?? "—"}
                      </td>

                      {/* INITIAL STOCK */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-right font-medium text-gray-900">
                        {Number(item.initialStock).toFixed(2)}
                      </td>

                      {/* AVAILABLE STOCK */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-right font-medium text-gray-900">
                        {Number(item.availableStock).toFixed(2)}
                      </td>

                      {/* STOCK LEVEL */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStockLevelClass(
                            stockLevel
                          )}`}
                        >
                          {stockLevel}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="border-r border-gray-200 px-4 py-2.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            className="flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
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
            onClick={() =>
              setPage((current) => current - 1)
            }
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => current + 1)
            }
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>
      </div>

      {/* FORM MODAL */}

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
