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

interface InventoryItem {
  id: number;
  ingredient: string;
  unit: string;
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

function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Raw Filter States
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("");

  // Debounced Filter States
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
      setDebouncedUnit(unit);
      setDebouncedStatus(status);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, unit, status]);

  // Fetch Inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

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

      params.append("page", String(page));
      params.append("limit", String(limit));

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl}/inventory?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch inventory: ${response.status}`
        );
      }

      const result: InventoryResponse = await response.json();

      setInventory(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch inventory error:", err);
      setInventory([]);
      setError("Unable to load inventory. Please try again.");
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
  ]);

  // Add Inventory Item
  const handleAdd = () => {
    setSelectedInventory(null);
    setShowForm(true);
  };

  // Edit Inventory Item
  const handleEdit = (item: InventoryItem) => {
    setSelectedInventory(item);
    setShowForm(true);
  };

  // Delete Inventory Item
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

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const response = await fetch(`${apiUrl}/inventory/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete inventory item: ${response.status}`
        );
      }

      await fetchInventory();
    } catch (err) {
      console.error("Delete inventory error:", err);
      setError("Unable to delete inventory item.");
    }
  };

  // Reset Filters
  const handleReset = () => {
    setSearch("");
    setUnit("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Inventory
          </h1>

          <p className="text-xs text-gray-500">
            Manage inventory items and keep track of stock levels
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
              placeholder="Search inventory..."
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

          {/* ADD BUTTON */}
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

      {/* EXPANDABLE FILTERS */}
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

          <input
            type="text"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Status"
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
                  Ingredient
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
                  Status
                </th>

                <th className="px-4 py-2.5 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-gray-500"
                  >
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50/80"
                  >
                    <td className="border-r border-gray-200 px-4 py-2.5 text-center font-medium text-gray-500">
                      #{item.id}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 font-semibold text-gray-900">
                      {item.ingredient}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 text-center text-gray-600">
                      {item.unit}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 text-right font-medium text-gray-900">
                      {Number(item.initialStock).toFixed(2)}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 text-right font-medium text-gray-900">
                      {Number(item.availableStock).toFixed(2)}
                    </td>

                    <td className="border-r border-gray-200 px-4 py-2.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.status?.toLowerCase() === "in stock"
                            ? "bg-green-100 text-green-800"
                            : item.status?.toLowerCase() === "low stock"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status?.toLowerCase() ===
                                  "out of stock"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Pencil size={11} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 size={11} />
                          Delete
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

      {/* MODAL FORM */}
      {showForm && (
        <InventoryForm
          inventory={selectedInventory}
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